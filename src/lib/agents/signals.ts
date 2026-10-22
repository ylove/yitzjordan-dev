/**
 * Aggregate demand signal: which requirement phrases agents send to match_requirements, counted
 * per day. Disclosed in the tool description, on /agents and on /privacy.
 *
 * Stored per (day, term): the normalized phrase (or the skill key it matched), whether it matched,
 * and a count. Never an IP, a user agent or the request. Phrases that could identify anyone (an
 * @, a URL, a long digit run) are dropped. Server only; call it inside next/server after().
 */
import { getPayloadClient } from '@/lib/cms'
import { normalizePhrase } from './match'

const MAX_TERM = 80

export function safeTerm(raw: string): string | null {
  if (/@|https?:|www\.|\d{5,}/i.test(raw)) return null
  const term = normalizePhrase(raw).slice(0, MAX_TERM).trim()
  return term.length >= 2 ? term : null
}

export async function recordRequirementTerms(items: Array<{ term: string; skill?: string }>): Promise<void> {
  const day = new Date().toISOString().slice(0, 10)
  const unique = new Map<string, { skill?: string }>()
  for (const item of items.slice(0, 25)) {
    const term = safeTerm(item.term)
    if (term && !unique.has(term)) unique.set(term, { skill: item.skill })
  }
  if (!unique.size) return
  try {
    const payload = await getPayloadClient()
    for (const [term, { skill }] of unique) {
      const existing = await payload.find({
        collection: 'requirement-terms',
        where: { and: [{ day: { equals: day } }, { term: { equals: term } }] },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const doc = existing.docs[0]
      if (doc) {
        await payload.update({ collection: 'requirement-terms', id: doc.id, data: { count: (doc.count ?? 0) + 1 }, overrideAccess: true })
      } else {
        await payload.create({
          collection: 'requirement-terms',
          data: { day, term, skill: skill ?? null, matched: Boolean(skill), count: 1 },
          overrideAccess: true,
        })
      }
    }
  } catch (err) {
    console.error('[signals] could not record requirement terms', err instanceof Error ? err.message : err)
  }
}
