/**
 * Heading ids for rich text. One algorithm, used both by the renderer (components/richtext) and
 * by the in-article section nav, so links always land. An article's `anchors` field pins ids by
 * heading text (the imported articles keep their old ids, like #relevance); any other heading
 * gets an id from its text.
 */
import { slugify } from '../../collections/shared/slug'

type LexicalNode = { type?: string; tag?: string; text?: string; children?: LexicalNode[] }
export type RichTextData = { root: LexicalNode } | null | undefined
export type AnchorEntry = { heading: string; anchorId: string }
export type Heading = { id: string; text: string; level: 2 | 3 }

export function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(nodeText).join('')
}

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()

/** Returns a function mapping a heading's text to its id, de-duplicating repeats. */
export function headingIdResolver(anchors: AnchorEntry[] | null | undefined): (text: string) => string {
  const pinned = new Map((anchors ?? []).map((a) => [normalize(a.heading), a.anchorId]))
  const used = new Map<string, number>()
  return (text: string) => {
    const base = pinned.get(normalize(text)) ?? (slugify(text) || 'section')
    const n = used.get(base) ?? 0
    used.set(base, n + 1)
    return n === 0 ? base : `${base}-${n + 1}`
  }
}

/** H2 and H3 headings in document order, with the ids the renderer will give them. */
export function extractHeadings(data: RichTextData, anchors?: AnchorEntry[] | null): Heading[] {
  const resolve = headingIdResolver(anchors)
  const out: Heading[] = []
  for (const node of data?.root?.children ?? []) {
    if (node.type !== 'heading') continue
    const text = nodeText(node).trim()
    const id = resolve(text)
    if (node.tag === 'h2' || node.tag === 'h3') out.push({ id, text, level: node.tag === 'h2' ? 2 : 3 })
  }
  return out
}
