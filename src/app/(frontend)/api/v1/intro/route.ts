import type { NextRequest } from 'next/server'
import { fail, ok, preflight, readJson } from '@/lib/agents/http'
import { recordIntro, requestMeta } from '@/lib/agents/intro'
import { agentFieldErrors, introSchema } from '@/lib/agents/schema'

/** POST /api/v1/intro: the REST twin of the MCP tool request_intro. Requires consent: true. */
export async function POST(req: NextRequest) {
  const read = await readJson(req)
  if (!read.ok) return read.response
  const parsed = introSchema.safeParse(read.body)
  if (!parsed.success) return fail(400, agentFieldErrors(parsed.error))
  const outcome = await recordIntro(parsed.data, 'api', requestMeta(req))
  if (!outcome.ok) {
    return fail(outcome.status, outcome.errors, outcome.retryAfterSeconds ? { 'Retry-After': String(outcome.retryAfterSeconds) } : {})
  }
  return ok({ ok: true, id: outcome.id, next_steps: outcome.next_steps }, { status: 201, cache: false })
}

export const OPTIONS = preflight
