import type { NextRequest } from 'next/server'
import { fail, ok, preflight, readJson } from '@/lib/agents/http'
import { requestMeta } from '@/lib/agents/intro'
import { recordOpportunity, statusUrl } from '@/lib/agents/opportunity'
import { opportunitySchema } from '@/lib/agents/opportunity-schema'
import { agentFieldErrors } from '@/lib/agents/schema'

/**
 * POST /api/v1/opportunity: the REST twin of the MCP tool submit_opportunity, also used by the
 * form at /agents/brief (?via=form). Requires consent: true. Returns the handshake.
 */
export async function POST(req: NextRequest) {
  const read = await readJson(req)
  if (!read.ok) return read.response
  const body = read.body as Record<string, unknown> | null
  const viaForm = req.nextUrl.searchParams.get('via') === 'form'
  // The form's hidden "website" field. People never see it; scripts that fill every field do.
  if (viaForm && body && typeof body.website === 'string' && body.website.trim()) {
    const id = 'ob_000000000000'
    return ok({ ok: true, brief_id: id, status: 'received', status_url: statusUrl(id) }, { status: 201, cache: false })
  }
  const parsed = opportunitySchema.safeParse(body)
  if (!parsed.success) return fail(400, agentFieldErrors(parsed.error))
  const outcome = await recordOpportunity(parsed.data, viaForm ? 'form' : 'api', requestMeta(req))
  if (!outcome.ok) {
    return fail(outcome.status, outcome.errors, outcome.retryAfterSeconds ? { 'Retry-After': String(outcome.retryAfterSeconds) } : {})
  }
  return ok(outcome.handshake, { status: 201, cache: false })
}

export const OPTIONS = preflight
