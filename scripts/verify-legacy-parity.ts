/**
 * Verifies the imported articles match the originals on ylove.github.io.
 *
 *   npx payload run scripts/verify-legacy-parity.ts
 *
 * For each article: the whitespace-stripped text of the original <article> (minus its header)
 * must equal the text of the Lexical body, and the structure must match (h2, h3, blockquotes,
 * code blocks, list items). Exits 1 on any mismatch, printing the first differing offset.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { LEGACY_ARTICLE_SLUGS } from '../src/content/site'

const SRC = process.env.SRC ?? path.resolve(process.cwd(), '../ylove-github-io')

type Node = { type: string; text?: string; tag?: string; children?: Node[]; fields?: { code?: string; blockType?: string } }

const squash = (s: string) => s.replace(/\s+/g, '')

function walk(node: Node, acc: { text: string[]; h2: number; h3: number; quote: number; code: number; li: number }) {
  if (node.type === 'text' && node.text) acc.text.push(node.text)
  if (node.type === 'heading' && node.tag === 'h2') acc.h2++
  if (node.type === 'heading' && node.tag === 'h3') acc.h3++
  if (node.type === 'quote') acc.quote++
  if (node.type === 'listitem') acc.li++
  if (node.type === 'block' && node.fields?.blockType === 'Code') {
    acc.code++
    acc.text.push(node.fields.code ?? '')
  }
  for (const c of node.children ?? []) walk(c, acc)
}

const payload = await getPayload({ config })
let failed = false

for (const slug of LEGACY_ARTICLE_SLUGS) {
  const dom = new JSDOM(await readFile(path.join(SRC, slug, 'index.html'), 'utf8'))
  const article = dom.window.document.querySelector('article')!.cloneNode(true) as HTMLElement
  article.querySelector('header.article-header')?.remove()
  article.querySelector('h1')?.remove()
  const legacy = {
    text: squash(article.textContent ?? ''),
    h2: article.querySelectorAll('h2').length,
    h3: article.querySelectorAll('h3').length,
    quote: article.querySelectorAll('blockquote').length,
    code: article.querySelectorAll('pre').length,
    li: article.querySelectorAll('li').length,
  }

  const doc = (await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
  if (!doc) {
    console.error(`${slug}: not in Payload`)
    failed = true
    continue
  }
  const acc = { text: [] as string[], h2: 0, h3: 0, quote: 0, code: 0, li: 0 }
  walk((doc.body as unknown as { root: Node }).root, acc)
  const imported = { text: squash(acc.text.join('')), h2: acc.h2, h3: acc.h3, quote: acc.quote, code: acc.code, li: acc.li }

  const problems: string[] = []
  if (imported.text !== legacy.text) {
    let i = 0
    while (i < legacy.text.length && legacy.text[i] === imported.text[i]) i++
    problems.push(`text differs at ${i}: legacy "${legacy.text.slice(i, i + 40)}" vs imported "${imported.text.slice(i, i + 40)}"`)
  }
  for (const k of ['h2', 'h3', 'quote', 'code', 'li'] as const) {
    if (legacy[k] !== imported[k]) problems.push(`${k}: legacy ${legacy[k]}, imported ${imported[k]}`)
  }
  const anchors = (doc.anchors ?? []).length
  if (anchors !== legacy.h2) problems.push(`anchors: ${anchors} saved for ${legacy.h2} h2s`)

  if (problems.length) {
    failed = true
    console.error(`FAIL ${slug}\n  ${problems.join('\n  ')}`)
  } else {
    console.log(`ok   ${slug}: ${legacy.text.length} chars, h2 ${legacy.h2}, h3 ${legacy.h3}, quotes ${legacy.quote}, code ${legacy.code}, li ${legacy.li}`)
  }
}

process.exit(failed ? 1 : 0)
