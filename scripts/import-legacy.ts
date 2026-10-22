/**
 * Imports the three articles from the old GitHub Pages site into Payload.
 *
 *   npx payload run scripts/import-legacy.ts            (reads ../ylove-github-io)
 *   npx payload run scripts/import-legacy.ts --dry-run  (prints what it would write)
 *   SRC=/path/to/ylove-github-io npx payload run scripts/import-legacy.ts
 *
 * Idempotent: upserts by slug. What it handles that convertHTMLToLexical does not:
 * - h2 ids are dropped by Lexical, so they are saved in `anchors` and re-applied on render.
 * - <pre><code> has no HTML importer, so each becomes a Code block node.
 * - Blockquotes with several paragraphs are flattened to one paragraph with line breaks.
 * - Internal links to the old root URLs are rewritten to /research/<slug>.
 *
 * Relative imports only: the Payload CLI runs this outside Next.js.
 */
import { readFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '../src/payload.config'
import { articleBodyFeatures } from '../src/fields/articleBody'
import { LEGACY_ARTICLE_SLUGS } from '../src/content/site'

const dryRun = process.argv.includes('--dry-run')
const SRC = process.env.SRC ?? path.resolve(process.cwd(), '../ylove-github-io')

/** Topic skills (by key) for each article; linked when the skills exist (see scripts/seed.ts). */
const TOPICS: Record<string, string[]> = {
  'llms-freestyling': ['model-behavior', 'prompt-engineering', 'multi-agent'],
  'llms-freestyling-2': ['model-behavior', 'prompt-engineering', 'multi-agent'],
  'llm-default-personas': ['model-behavior', 'llm-evaluation', 'prompt-engineering'],
}

type LexicalNode = { type: string; text?: string; children?: LexicalNode[]; [k: string]: unknown }

const textOf = (node: LexicalNode): string => (node.text ?? '') + (node.children ?? []).map(textOf).join('')

function rewriteHref(href: string): string {
  const m = href.match(/^\/(llms-freestyling-2|llms-freestyling|llm-default-personas)\/?(#.*)?$/)
  if (m) return `/research/${m[1]}${m[2] ?? ''}`
  return href
}

type Parsed = {
  slug: string
  title: string
  excerpt: string
  datePublished?: string
  dateModified?: string
  keywords: string[]
  anchors: { heading: string; anchorId: string }[]
  previousSlug?: string
  html: string
  codes: string[]
}

async function parse(slug: string): Promise<Parsed> {
  const file = path.join(SRC, slug, 'index.html')
  const dom = new JSDOM(await readFile(file, 'utf8'))
  const doc = dom.window.document

  const title = doc.querySelector('article h1')?.textContent?.trim() ?? doc.title.trim()
  const excerpt =
    doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ??
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ??
    ''

  let datePublished: string | undefined
  let dateModified: string | undefined
  let keywords: string[] = []
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent ?? '{}')
      const nodes = Array.isArray(data['@graph']) ? data['@graph'] : [data]
      for (const n of nodes) {
        if (n['@type'] === 'BlogPosting' || n['@type'] === 'Article') {
          datePublished ??= n.datePublished
          dateModified ??= n.dateModified
          const kw = n.keywords
          if (typeof kw === 'string') keywords = kw.split(',').map((k: string) => k.trim()).filter(Boolean)
          else if (Array.isArray(kw)) keywords = kw
        }
      }
    } catch {
      // Ignore malformed blocks.
    }
  }

  const article = doc.querySelector('article')
  if (!article) throw new Error(`${slug}: no <article>`)
  const clone = article.cloneNode(true) as HTMLElement
  clone.querySelector('header.article-header')?.remove()
  clone.querySelector('h1')?.remove()

  const anchors = [...clone.querySelectorAll('h2[id]')].map((h) => ({
    heading: (h.textContent ?? '').replace(/\s+/g, ' ').trim(),
    anchorId: h.getAttribute('id')!,
  }))

  for (const a of clone.querySelectorAll('a[href]')) a.setAttribute('href', rewriteHref(a.getAttribute('href')!))

  const codes: string[] = []
  for (const pre of [...clone.querySelectorAll('pre')]) {
    const p = doc.createElement('p')
    p.textContent = `__CODE_${codes.length}__`
    codes.push(pre.textContent ?? '')
    pre.replaceWith(p)
  }

  for (const quote of [...clone.querySelectorAll('blockquote')]) {
    const paras = [...quote.querySelectorAll(':scope > p')]
    if (paras.length > 1) {
      const p = doc.createElement('p')
      p.innerHTML = paras.map((x) => x.innerHTML).join('<br><br>')
      quote.replaceChildren(p)
    }
  }

  const footerLink = doc.querySelector('body > footer a[href^="/llm"]')?.getAttribute('href')
  const previousSlug = footerLink?.replace(/^\/|\/$/g, '')

  return { slug, title, excerpt, datePublished, dateModified, keywords, anchors, previousSlug, html: clone.innerHTML, codes }
}

function swapCodePlaceholders(root: LexicalNode, codes: string[]): number {
  let swapped = 0
  root.children = (root.children ?? []).map((node) => {
    const m = node.type === 'paragraph' ? textOf(node).trim().match(/^__CODE_(\d+)__$/) : null
    if (!m) return node
    swapped++
    return {
      type: 'block',
      version: 2,
      format: '',
      fields: { id: randomBytes(12).toString('hex'), blockName: '', blockType: 'Code', language: 'plaintext', code: codes[Number(m[1])] ?? '' },
    }
  })
  return swapped
}

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.fromFeatures({ config: payload.config, features: articleBodyFeatures })

const skillIds = new Map<string, number>()
for (const s of (await payload.find({ collection: 'skills', limit: 500, depth: 0 })).docs) skillIds.set(s.key, s.id)

const ids = new Map<string, number>()
const previous = new Map<string, string>()

for (const slug of LEGACY_ARTICLE_SLUGS) {
  const a = await parse(slug)
  const body = convertHTMLToLexical({ editorConfig, html: a.html, JSDOM })
  const swapped = swapCodePlaceholders(body.root as unknown as LexicalNode, a.codes)
  if (swapped !== a.codes.length) throw new Error(`${slug}: placed ${swapped} of ${a.codes.length} code blocks`)

  const topics = (TOPICS[slug] ?? []).map((k) => skillIds.get(k)).filter((id): id is number => typeof id === 'number')
  const data = {
    title: a.title,
    slug,
    kind: 'research' as const,
    status: 'published' as const,
    publishDate: a.datePublished ? new Date(`${a.datePublished}T12:00:00Z`).toISOString() : undefined,
    updatedDate: a.dateModified && a.dateModified !== a.datePublished ? new Date(`${a.dateModified}T12:00:00Z`).toISOString() : undefined,
    excerpt: a.excerpt,
    body: body as never,
    anchors: a.anchors,
    keywords: a.keywords,
    topics,
    legacyPath: `/${slug}/`,
  }
  if (a.previousSlug) previous.set(slug, a.previousSlug)

  console.log(`${slug}: "${a.title}" · ${a.anchors.length} anchors · ${a.codes.length} code blocks · ${topics.length} topics`)
  if (dryRun) continue

  const existing = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
  const context = { disableRevalidate: true, disableIndexNow: true }
  const doc = existing.docs[0]
    ? await payload.update({ collection: 'articles', id: existing.docs[0].id, data, overrideAccess: true, context })
    : await payload.create({ collection: 'articles', data, overrideAccess: true, context })
  ids.set(slug, doc.id)
}

if (!dryRun) {
  for (const [slug, prev] of previous) {
    const id = ids.get(slug)
    const prevId = ids.get(prev)
    if (id && prevId) {
      await payload.update({ collection: 'articles', id, data: { previous: prevId }, overrideAccess: true, context: { disableRevalidate: true, disableIndexNow: true } })
      console.log(`${slug}: previous -> ${prev}`)
    }
  }
}

console.log(dryRun ? 'Dry run: nothing written.' : 'Imported.')
process.exit(0)
