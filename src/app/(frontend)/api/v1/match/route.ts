import { after, type NextRequest } from 'next/server'
import { fail, ok, preflight, readJson } from '@/lib/agents/http'
import { agentFieldErrors, matchSchema } from '@/lib/agents/schema'
import { signalsAfter } from '@/lib/agents/signals-after'
import { matchRequirements } from '@/lib/agents/tools'

/**
 * GET /api/v1/match?r=MCP+servers&r=RAG+evaluation: the same check for agents whose web tool can
 * only fetch. Repeat r for each requirement (or separate them with ; in requirements=). Optional
 * title, employment_type and location describe the role.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams
  const requirements = [...q.getAll('r'), ...(q.get('requirements') ?? '').split(';')].map((r) => r.trim()).filter(Boolean)
  const role = { title: q.get('title') ?? undefined, employment_type: q.get('employment_type') ?? undefined, location: q.get('location') ?? undefined }
  const parsed = matchSchema.safeParse({ requirements, ...(Object.values(role).some(Boolean) ? { role } : {}) })
  if (!parsed.success) return fail(400, { ...agentFieldErrors(parsed.error), usage: 'GET /api/v1/match?r=first+requirement&r=second+requirement' })
  const { output, matchedKeys } = await matchRequirements(parsed.data)
  after(signalsAfter(matchedKeys))
  return ok(output, { cache: false })
}

/** POST /api/v1/match: the REST twin of the MCP tool match_requirements. */
export async function POST(req: NextRequest) {
  const read = await readJson(req)
  if (!read.ok) return read.response
  const parsed = matchSchema.safeParse(read.body)
  if (!parsed.success) return fail(400, agentFieldErrors(parsed.error))
  const { output, matchedKeys } = await matchRequirements(parsed.data)
  after(signalsAfter(matchedKeys))
  return ok(output, { cache: false })
}

export const OPTIONS = preflight
