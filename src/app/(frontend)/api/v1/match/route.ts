import { after, type NextRequest } from 'next/server'
import { fail, ok, preflight, readJson } from '@/lib/agents/http'
import { agentFieldErrors, matchSchema } from '@/lib/agents/schema'
import { signalsAfter } from '@/lib/agents/signals-after'
import { matchRequirements } from '@/lib/agents/tools'

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
