/**
 * Seeds the CMS: Profile global, skills, projects, videos and the evidence catalog.
 *
 *   PRIVATE_SEED_DIR=~/prompts-ylove/github-site/seed npx payload run scripts/seed.ts
 *   PRIVATE_SEED_DIR=... npx payload run scripts/seed.ts --only=evidence,profile
 *
 * Parts: skills, projects, videos, relations (related videos on articles), profile, evidence.
 *
 * Skills, projects and videos come from scripts/seed-data.ts. The profile and the evidence
 * catalog are personal, so they live outside this public repository, in PRIVATE_SEED_DIR
 * (profile.ts exporting PROFILE, evidence.ts exporting EVIDENCE). Without it, those parts are
 * skipped.
 *
 * Idempotent: upserts skills by key, projects and videos by slug, evidence by claim. Re-running
 * overwrites edits made in the admin to those documents, so after launch use --only.
 * Order on a fresh database: seed, then import-legacy, then seed --only=evidence (so evidence can
 * point at the imported articles).
 *
 * Relative imports only: the Payload CLI runs this outside Next.js.
 */
import { getPayload, type Payload } from 'payload'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '../src/payload.config'
import { articleBodyFeatures } from '../src/fields/articleBody'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ARTICLE_VIDEOS, PROJECTS, SKILLS, VIDEOS } from './seed-data'

const onlyArg = process.argv.find((a) => a.startsWith('--only='))
const only = onlyArg ? new Set(onlyArg.slice('--only='.length).split(',')) : null
const want = (part: string) => !only || only.has(part)
const context = { disableRevalidate: true, disableIndexNow: true }

const privateDir = process.env.PRIVATE_SEED_DIR?.replace(/^~(?=\/)/, process.env.HOME ?? '~')
async function loadPrivate<T>(file: string, name: string): Promise<T | null> {
  if (!privateDir) return null
  const mod = await import(pathToFileURL(path.resolve(privateDir, file)).href)
  return (mod[name] ?? mod.default?.[name] ?? null) as T | null
}

async function upsert(payload: Payload, collection: 'skills' | 'projects' | 'videos' | 'evidence', field: string, value: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection, where: { [field]: { equals: value } }, limit: 1, depth: 0, overrideAccess: true })
  const doc = existing.docs[0]
  return doc
    ? payload.update({ collection, id: doc.id, data: data as never, overrideAccess: true, context })
    : payload.create({ collection, data: data as never, overrideAccess: true, context })
}

const payload = await getPayload({ config })

// Skills -----------------------------------------------------------------------
if (want('skills')) {
  for (const s of SKILLS) {
    await upsert(payload, 'skills', 'key', s.key, { ...s, aliases: s.aliases ?? [], wikidataId: s.wikidataId ?? null, knowsAbout: true })
  }
  console.log(`skills: ${SKILLS.length}`)
}

const skillIds = new Map<string, number>()
for (const s of (await payload.find({ collection: 'skills', limit: 500, depth: 0, overrideAccess: true })).docs) skillIds.set(s.key, s.id)
const idsFor = (keys: string[] = []) => keys.map((k) => skillIds.get(k)).filter((id): id is number => typeof id === 'number')

// Projects ---------------------------------------------------------------------
if (want('projects')) {
  for (const p of PROJECTS) {
    const { skillKeys, ...data } = p as typeof p & { skillKeys?: string[] }
    await upsert(payload, 'projects', 'slug', p.slug, { ...data, skills: idsFor(skillKeys) })
  }
  console.log(`projects: ${PROJECTS.length}`)
}

// Videos -----------------------------------------------------------------------
if (want('videos')) {
  for (const v of VIDEOS) {
    const { skillKeys, ...data } = v
    await upsert(payload, 'videos', 'slug', v.slug, { ...data, skills: idsFor(skillKeys) })
  }
  console.log(`videos: ${VIDEOS.length}`)
}

// Related videos on articles -----------------------------------------------------
if (want('relations')) {
  for (const [articleSlug, videoSlugs] of Object.entries(ARTICLE_VIDEOS)) {
    const article = (await payload.find({ collection: 'articles', where: { slug: { equals: articleSlug } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
    if (!article) continue
    const videos = await payload.find({ collection: 'videos', where: { slug: { in: videoSlugs } }, limit: videoSlugs.length, depth: 0, overrideAccess: true })
    const ids = videoSlugs.map((slug) => videos.docs.find((v) => v.slug === slug)?.id).filter((id): id is number => typeof id === 'number')
    await payload.update({ collection: 'articles', id: article.id, data: { relatedVideos: ids }, overrideAccess: true, context })
  }
  console.log(`relations: ${Object.keys(ARTICLE_VIDEOS).length} articles`)
}

// Profile ----------------------------------------------------------------------
const PROFILE = want('profile') ? await loadPrivate<Record<string, unknown> & { aboutMarkdown: string; highlights: string[]; sameAs: { url: string }[] }>('profile.ts', 'PROFILE') : null
if (want('profile') && !PROFILE) console.log('profile: skipped (set PRIVATE_SEED_DIR)')
if (PROFILE) {
  const editorConfig = await editorConfigFactory.fromFeatures({ config: payload.config, features: articleBodyFeatures })
  const about = convertMarkdownToLexical({ editorConfig, markdown: PROFILE.aboutMarkdown })
  // Availability is set in the admin only (it changes), so the seed never overwrites it.
  const rest: Record<string, unknown> = { ...PROFILE }
  for (const key of ['highlights', 'sameAs', 'availability', 'aboutMarkdown']) delete rest[key]
  const { highlights, sameAs } = PROFILE
  await payload.updateGlobal({
    slug: 'profile',
    data: {
      ...rest,
      about: about as never,
      highlights: highlights.map((text) => ({ text })),
      sameAs: sameAs.map((s) => ({ url: s.url })),
    } as never,
    overrideAccess: true,
    context,
  })
  console.log('profile: updated')
}

// Evidence ---------------------------------------------------------------------
type EvidenceSeed = {
  claim: string
  detail?: string
  skillKeys: string[]
  strength: 'production' | 'open-source' | 'research' | 'writing'
  proof?: { relationTo: 'projects' | 'articles' | 'videos'; slug: string }
  externalUrl?: string
  context?: string
  period?: string
  weight?: number
}
const EVIDENCE = want('evidence') ? await loadPrivate<EvidenceSeed[]>('evidence.ts', 'EVIDENCE') : null
if (want('evidence') && !EVIDENCE) console.log('evidence: skipped (set PRIVATE_SEED_DIR)')
if (EVIDENCE) {
  const slugIds = new Map<string, number>()
  for (const collection of ['projects', 'articles', 'videos'] as const) {
    const docs = await payload.find({ collection, limit: 500, depth: 0, overrideAccess: true, select: { slug: true } })
    for (const d of docs.docs) slugIds.set(`${collection}:${d.slug}`, d.id)
  }
  let linked = 0
  for (const e of EVIDENCE) {
    const proofId = e.proof ? slugIds.get(`${e.proof.relationTo}:${e.proof.slug}`) : undefined
    if (proofId) linked++
    await upsert(payload, 'evidence', 'claim', e.claim, {
      claim: e.claim,
      detail: e.detail ?? null,
      skills: idsFor(e.skillKeys),
      strength: e.strength,
      proof: e.proof && proofId ? { relationTo: e.proof.relationTo, value: proofId } : null,
      externalUrl: e.externalUrl ?? null,
      context: e.context ?? null,
      period: e.period ?? null,
      weight: e.weight ?? 50,
      public: true,
    })
  }
  console.log(`evidence: ${EVIDENCE.length} (${linked} linked to a page)`)
}

console.log('Seed done.')
process.exit(0)
