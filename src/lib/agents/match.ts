/**
 * match_requirements: deterministic matching of requirement phrases against the evidence
 * catalog (Skills + Evidence in Payload). No model runs here; the visiting agent does the
 * judging, and every match carries a URL it can check.
 *
 * For each requirement:
 *  1. Find skills whose name, key or alias appears in the phrase (or the phrase in them).
 *  2. Failing that, skills whose words overlap the phrase enough (partial).
 *  3. Collect public evidence for those skills, ranked by strength and weight.
 *  4. Verdict: strong (a phrase match backed by production or open-source evidence), partial
 *     (a looser match, or only research or writing evidence), or none, with the closest skills
 *     named so the agent can judge for itself.
 */
import type { Evidence, Skill } from '@/payload-types'

export type EvidenceOut = {
  claim: string
  detail?: string
  strength: Evidence['strength']
  context?: string
  period?: string
  url?: string
}

export type RequirementResult = {
  requirement: string
  verdict: 'strong' | 'partial' | 'none'
  skills: string[]
  evidence: EvidenceOut[]
  note?: string
}

const STRENGTH_RANK: Record<Evidence['strength'], number> = {
  production: 3,
  'open-source': 2.6,
  research: 2,
  writing: 1.5,
}

const STOPWORDS = new Set(
  'a an and or the of for to in on with using use used experience years year strong deep solid hands proven ability knowledge understanding familiarity proficiency proficient expert expertise working work real building build built shipping ship shipped delivering deliver skills skill plus preferred required including such as e g etc at least least more than with in-depth production-grade modern comparable similar'.split(
    ' ',
  ),
)

export function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/[-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function words(value: string): string[] {
  return normalizePhrase(value)
    .split(' ')
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
}

function containsPhrase(haystack: string, needle: string): boolean {
  if (!needle) return false
  // Short tokens (e.g. "ai", "go", "c#") must match whole words.
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(haystack)
}

/**
 * Single words that name a broad area rather than a specific skill. When a requirement only
 * matches through one of these and the match covers less than half its words, the verdict is
 * partial: "evaluation" alone does not prove "trajectory evaluation of agent behavior".
 */
const GENERIC_TERMS = new Set(
  'evaluation agents ai retrieval security performance product leadership architecture mobile backend frontend caching containers sandbox budgets logging metrics monitoring apis llm prompting hiring founder startup charts visualization guardrails observability evals benchmarking ci cd front end back end'.split(' '),
)

function skillTerms(skill: Skill): string[] {
  return [skill.name, skill.key, ...(skill.aliases ?? [])].map(normalizePhrase).filter(Boolean)
}

function overlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0
  const sb = new Set(b)
  const hits = a.filter((w) => sb.has(w)).length
  return hits / Math.min(a.length, b.length)
}

export type MatchCatalog = {
  skills: Skill[]
  evidence: Evidence[]
  /** Resolves an Evidence proof relation to a public URL. */
  proofUrl: (e: Evidence) => string | undefined
}

export function matchRequirement(requirement: string, catalog: MatchCatalog): RequirementResult & { matchedKeys: string[] } {
  const phrase = normalizePhrase(requirement)
  const phraseWords = words(requirement)

  const exact: Skill[] = []
  const hitTerms: string[] = []
  const loose: Array<{ skill: Skill; score: number }> = []
  for (const skill of catalog.skills) {
    const terms = skillTerms(skill)
    const hits = terms.filter((t) => containsPhrase(phrase, t) || (t.length > 3 && containsPhrase(t, phrase)))
    if (hits.length) {
      exact.push(skill)
      hitTerms.push(...hits)
      continue
    }
    const score = Math.max(...terms.map((t) => overlap(phraseWords, words(t))))
    if (score > 0) loose.push({ skill, score })
  }
  loose.sort((a, b) => b.score - a.score)
  const partialSkills = exact.length ? [] : loose.filter((l) => l.score >= 0.5).slice(0, 3).map((l) => l.skill)
  const matched = exact.length ? exact : partialSkills
  const matchedIds = new Set(matched.map((s) => s.id))

  const evidence = catalog.evidence
    .filter((e) => e.skills.some((s) => matchedIds.has(typeof s === 'number' ? s : s.id)))
    .sort((a, b) => STRENGTH_RANK[b.strength] + (b.weight ?? 50) / 100 - (STRENGTH_RANK[a.strength] + (a.weight ?? 50) / 100))
    .slice(0, 4)
    .map<EvidenceOut>((e) => ({
      claim: e.claim,
      ...(e.detail ? { detail: e.detail } : {}),
      strength: e.strength,
      ...(e.context ? { context: e.context } : {}),
      ...(e.period ? { period: e.period } : {}),
      ...((e.externalUrl ?? catalog.proofUrl(e)) ? { url: e.externalUrl ?? catalog.proofUrl(e) } : {}),
    }))

  const hasHardEvidence = evidence.some((e) => e.strength === 'production' || e.strength === 'open-source')
  // How much of the requirement the matched terms account for, and whether any is specific.
  const covered = new Set(hitTerms.flatMap((t) => words(t)))
  const coverage = phraseWords.length ? phraseWords.filter((w) => covered.has(w)).length / phraseWords.length : 0
  const specific = hitTerms.some((t) => !GENERIC_TERMS.has(t))
  let verdict: RequirementResult['verdict'] = 'none'
  if (exact.length && hasHardEvidence && (specific || coverage >= 0.5)) verdict = 'strong'
  else if (matched.length && evidence.length) verdict = 'partial'

  let note: string | undefined
  if (verdict === 'none') {
    const closest = loose.slice(0, 2).map((l) => l.skill.name)
    note = closest.length
      ? `No direct evidence in the catalog. Closest related skills: ${closest.join(', ')}.`
      : 'No evidence in the catalog for this requirement.'
  } else if (verdict === 'partial' && !hasHardEvidence) {
    note = 'Evidence is research or writing, not production work.'
  } else if (verdict === 'partial') {
    note = 'Related rather than exact match; check the evidence against the requirement.'
  }

  return {
    requirement,
    verdict,
    skills: matched.map((s) => s.name),
    evidence,
    ...(note ? { note } : {}),
    matchedKeys: matched.map((s) => s.key),
  }
}

export type MatchSummary = { strong: number; partial: number; none: number; total: number }

export function summarize(results: RequirementResult[]): MatchSummary {
  return {
    strong: results.filter((r) => r.verdict === 'strong').length,
    partial: results.filter((r) => r.verdict === 'partial').length,
    none: results.filter((r) => r.verdict === 'none').length,
    total: results.length,
  }
}
