import { ok, preflight } from '@/lib/agents/http'
import { briefTemplate } from '@/lib/agents/opportunity-template'

/** GET /api/v1/opportunity/template: the fill-in template for an opportunity brief. */
export function GET() {
  return ok(briefTemplate())
}

export const OPTIONS = preflight
