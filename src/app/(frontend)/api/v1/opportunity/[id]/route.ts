import type { NextRequest } from 'next/server'
import { fail, ok, preflight } from '@/lib/agents/http'
import { opportunityStatus } from '@/lib/agents/opportunity'

/** GET /api/v1/opportunity/{brief_id}: where a brief stands. Only the status, nothing personal. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const status = await opportunityStatus(id)
  if (!status) return fail(404, { _form: 'No brief with that id.' })
  return ok(status, { cache: false })
}

export const OPTIONS = preflight
