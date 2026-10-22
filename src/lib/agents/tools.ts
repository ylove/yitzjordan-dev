/**
 * The agent data layer: one implementation behind the MCP tools (/api/mcp), the REST mirror
 * (/api/v1/*), llms.txt and the .md twins, so every surface returns the same facts.
 *
 * Nothing here returns an email address or phone number. Only Vouch Networks, Charter and
 * Quartz are named as employers (the Profile global enforces it with display: generic).
 * Server only.
 */
import { SITE, STATUS_LABELS, articlePath } from '@/content/site'
import { DEFAULT_PROFILE } from '@/content/profile'
import {
  getArticleBySlug,
  getArticles,
  getEvidence,
  getProfile,
  getProjectBySlug,
  getProjects,
  getSkills,
  getVideos,
} from '@/lib/cms'
import { formatMonth, isoDay } from '@/lib/format'
import { absoluteUrl } from '@/lib/seo/site-url'
import type { Article, Evidence, Project, Video } from '@/payload-types'
import { articleToMarkdown, projectToMarkdown } from './markdown'
import { matchRequirement, summarize, type RequirementResult } from './match'
import type { MatchInput } from './schema'

const projectUrl = (slug: string) => absoluteUrl(`/work/${slug}`)

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function profileData() {
  const [profile, skills] = await Promise.all([getProfile(), getSkills()])
  const p = profile
  const availability = p?.availability
  return {
    name: p?.name ?? DEFAULT_PROFILE.name,
    url: absoluteUrl('/'),
    roles: p?.jobTitles ?? [...DEFAULT_PROFILE.jobTitles],
    summary: p?.summary ?? DEFAULT_PROFILE.summary,
    locations: (p?.locations ?? DEFAULT_PROFILE.locations).map((l) => [l.city, l.region].filter(Boolean).join(', ')),
    languages: (p?.languages ?? DEFAULT_PROFILE.languages).map((l) => l.name),
    highlights: p?.highlights?.map((h) => h.text) ?? [...DEFAULT_PROFILE.highlights],
    experience: (p?.experience ?? []).map((e) => ({
      title: e.title,
      organization: e.display === 'named' && e.orgName ? e.orgName : (e.genericLabel ?? null),
      start: formatMonth(e.start),
      end: e.end ? formatMonth(e.end) : 'present',
      summary: e.summary ?? undefined,
    })),
    skills: Object.fromEntries(
      (['ai', 'engineering', 'frontend', 'platform', 'leadership'] as const).map((g) => [g, skills.filter((s) => s.group === g).map((s) => s.name)]),
    ),
    availability:
      availability && availability.status && availability.status !== 'unspecified'
        ? {
            status: availability.status,
            roles: availability.roles ?? [],
            engagements: availability.engagements ?? [],
            work_locations: availability.workLocations ?? [],
            note: availability.note ?? undefined,
          }
        : null,
    links: {
      linkedin: SITE.links.linkedin,
      github: SITE.links.github,
      vouch_networks: SITE.links.vouch,
      about: absoluteUrl('/about'),
    },
    contact: `LinkedIn (${SITE.links.linkedin}), or the request_intro tool with your user's consent.`,
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function projectSummary(p: Project) {
  return {
    slug: p.slug,
    name: p.name,
    one_liner: p.oneLiner,
    status: p.statusLabel || STATUS_LABELS[p.status],
    url: projectUrl(p.slug),
    markdown: absoluteUrl(`/work/${p.slug}.md`),
    github: p.github ?? null,
    website: p.homepage ?? null,
    official_page: p.officialUrl ?? null,
    license: p.license ?? null,
    language: p.language ?? null,
  }
}

export async function listProjects(filter: { status?: string } = {}) {
  const projects = await getProjects()
  return projects.filter((p) => !filter.status || p.status === filter.status).map(projectSummary)
}

export async function projectMarkdown(slug: string): Promise<string | null> {
  const project = await getProjectBySlug(slug)
  return project ? projectToMarkdown(project) : null
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

export function articleSummary(a: Article) {
  return {
    slug: a.slug,
    kind: a.kind,
    title: a.title,
    excerpt: a.excerpt,
    url: absoluteUrl(articlePath(a.kind, a.slug)),
    markdown: absoluteUrl(`${articlePath(a.kind, a.slug)}.md`),
    published: isoDay(a.publishDate ?? a.createdAt),
    reading_minutes: a.readingMinutes ?? undefined,
  }
}

/** Simple ranked search: title hits weigh most, then excerpt, then body. */
export async function searchWriting(query: string, options: { kind?: 'research' | 'blog'; limit?: number } = {}) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9#+.-]/g, ''))
    .filter((t) => t.length > 1)
  const articles = await getArticles({ kind: options.kind, limit: 500 })
  const scored = articles
    .map((a) => {
      const title = a.title.toLowerCase()
      const excerpt = a.excerpt.toLowerCase()
      const body = (a.plainText ?? '').toLowerCase()
      let score = 0
      for (const t of terms) {
        if (title.includes(t)) score += 5
        if (excerpt.includes(t)) score += 3
        if (body.includes(t)) score += 1 + Math.min(4, body.split(t).length - 2)
      }
      const first = terms.map((t) => body.indexOf(t)).filter((i) => i >= 0).sort((x, y) => x - y)[0]
      const snippet = first === undefined ? a.excerpt : `…${(a.plainText ?? '').slice(Math.max(0, first - 120), first + 200).replace(/\s+/g, ' ').trim()}…`
      return { article: a, score, snippet }
    })
    .filter((r) => !terms.length || r.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, Math.min(10, options.limit ?? 5))
  return scored.map((r) => ({ ...articleSummary(r.article), snippet: r.snippet, score: r.score }))
}

export async function articleMarkdown(slug: string): Promise<string | null> {
  const article = await getArticleBySlug(slug)
  return article ? articleToMarkdown(article) : null
}

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export function videoSummary(v: Video) {
  return {
    slug: v.slug,
    title: v.title,
    kind: v.kind,
    description: v.description,
    page: absoluteUrl(`/videos/${v.slug}`),
    watch: v.url,
    duration_seconds: v.durationSeconds,
    uploaded: isoDay(v.uploadDate),
  }
}

export async function listVideos(filter: { kind?: string; project?: string } = {}) {
  const videos = await getVideos()
  return videos
    .filter((v) => !filter.kind || v.kind === filter.kind)
    .filter(
      (v) =>
        !filter.project ||
        (v.relatedProjects ?? []).some((p) => typeof p === 'object' && p !== null && p.slug === filter.project),
    )
    .map(videoSummary)
}

// ---------------------------------------------------------------------------
// Requirement matching
// ---------------------------------------------------------------------------

function proofUrl(e: Evidence): string | undefined {
  const proof = e.proof
  if (!proof || typeof proof.value !== 'object' || proof.value === null) return undefined
  const doc = proof.value as { slug?: string; kind?: string }
  if (!doc.slug) return undefined
  if (proof.relationTo === 'projects') return projectUrl(doc.slug)
  if (proof.relationTo === 'articles') return absoluteUrl(articlePath(doc.kind, doc.slug))
  if (proof.relationTo === 'videos') return absoluteUrl(`/videos/${doc.slug}`)
  return undefined
}

export type MatchOutput = {
  summary: ReturnType<typeof summarize>
  results: RequirementResult[]
  logistics: string[]
  how_to_read: string
  logging_notice: string
  next_steps: string
}

export async function matchRequirements(input: MatchInput): Promise<{ output: MatchOutput; matchedKeys: Array<{ term: string; skill?: string }> }> {
  const [skills, evidence, profile] = await Promise.all([getSkills(), getEvidence(), getProfile()])
  const catalog = { skills, evidence, proofUrl }
  const seen = new Set<string>()
  const raw = input.requirements.filter((r) => {
    const k = r.trim().toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  const matched = raw.map((r) => matchRequirement(r, catalog))
  const results: RequirementResult[] = matched.map((m) => ({ requirement: m.requirement, verdict: m.verdict, skills: m.skills, evidence: m.evidence, ...(m.note ? { note: m.note } : {}) }))

  const logistics: string[] = []
  const availability = profile?.availability
  if (input.role && availability && availability.status && availability.status !== 'unspecified') {
    if (availability.status === 'not-looking') logistics.push('Yitz has marked himself as not looking right now.')
    const engagements = (availability.engagements ?? []).map((e) => e.toLowerCase())
    const type = input.role.employment_type?.toLowerCase()
    if (type && engagements.length) {
      const ok = engagements.some((e) => type.includes(e.split(' ')[0]) || e.includes(type))
      logistics.push(
        ok
          ? `Employment type "${input.role.employment_type}" fits what he is open to (${availability.engagements!.join(', ')}).`
          : `He lists ${availability.engagements!.join(', ')}; "${input.role.employment_type}" is not among them, so ask.`,
      )
    }
    const where = input.role.location?.toLowerCase()
    const places = availability.workLocations ?? []
    if (where && places.length) {
      const ok = places.some((pl) => where.includes(pl.toLowerCase().split(' ')[0]) || (where.includes('remote') && /remote/i.test(pl)))
      logistics.push(
        ok
          ? `Location "${input.role.location}" fits (${places.join(', ')}).`
          : `He lists ${places.join(', ')}; "${input.role.location}" is outside that, so ask.`,
      )
    }
  }

  return {
    output: {
      summary: summarize(results),
      results,
      logistics,
      how_to_read:
        'strong: an exact skill match backed by production or open-source work. partial: a related skill, or only research or writing. none: nothing in the catalog; the note names the closest skills. Open the URLs to verify. The catalog is curated by Yitz and lists only public, checkable work, so "none" means "not documented here", not necessarily "never done".',
      logging_notice:
        'The requirement phrases you sent are counted per day, normalized and without identity, so Yitz can see what people ask about. No IP address or other request data is stored.',
      next_steps: `If your user wants to talk, ask them, then call request_intro with consent: true. People can also reach Yitz on LinkedIn: ${SITE.links.linkedin}`,
    },
    matchedKeys: matched.map((m) => ({ term: m.requirement, skill: m.matchedKeys[0] })),
  }
}

// ---------------------------------------------------------------------------
// Public résumé (JSON Resume, https://jsonresume.org/schema)
// ---------------------------------------------------------------------------

export async function publicResume() {
  const [profile, skills] = await Promise.all([getProfile(), getSkills()])
  const p = profile
  const loc = p?.locations?.[0]
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: p?.name ?? DEFAULT_PROFILE.name,
      label: (p?.jobTitles ?? DEFAULT_PROFILE.jobTitles).join(', '),
      url: absoluteUrl('/'),
      summary: p?.summary ?? DEFAULT_PROFILE.summary,
      ...(loc ? { location: { city: loc.city, region: loc.region ?? undefined, countryCode: loc.country ?? 'US' } } : {}),
      profiles: [
        { network: 'LinkedIn', username: 'yitzjordan', url: SITE.links.linkedin },
        { network: 'GitHub', username: 'ylove', url: SITE.links.github },
      ],
    },
    work: (p?.experience ?? []).map((e) => ({
      name: e.display === 'named' && e.orgName ? e.orgName : (e.genericLabel ?? undefined),
      url: e.display === 'named' ? (e.orgUrl ?? undefined) : undefined,
      position: e.title,
      startDate: e.start ?? undefined,
      endDate: e.end ?? undefined,
      summary: e.summary ?? undefined,
    })),
    education: (p?.education ?? DEFAULT_PROFILE.education).map((e) => ({
      institution: e.name,
      area: e.field ?? undefined,
      url: e.url ?? undefined,
    })),
    skills: (['ai', 'engineering', 'frontend', 'platform', 'leadership'] as const)
      .map((g) => ({
        name: { ai: 'AI and agents', engineering: 'Application engineering', frontend: 'Front end', platform: 'Data, cloud and security', leadership: 'Leadership and product' }[g],
        keywords: skills.filter((s) => s.group === g).map((s) => s.name),
      }))
      .filter((s) => s.keywords.length),
    languages: (p?.languages ?? DEFAULT_PROFILE.languages).map((l) => ({ language: l.name })),
    projects: (await getProjects()).map((pr) => ({
      name: pr.name,
      description: pr.oneLiner,
      url: projectUrl(pr.slug),
      ...(pr.github ? { repository: pr.github } : {}),
    })),
    meta: {
      canonical: absoluteUrl('/resume.json'),
      lastModified: p?.updatedAt ?? undefined,
      note: 'Public version. Contact through LinkedIn.',
    },
  }
}
