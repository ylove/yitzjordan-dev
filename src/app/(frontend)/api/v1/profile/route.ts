import { ok, preflight } from '@/lib/agents/http'
import { profileData } from '@/lib/agents/tools'

export const revalidate = 600

export async function GET() {
  return ok(await profileData())
}

export const OPTIONS = preflight
