import type { NextRequest } from 'next/server'
import { ok, preflight } from '@/lib/agents/http'
import { listProjects } from '@/lib/agents/tools'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? undefined
  return ok(await listProjects({ status }))
}

export const OPTIONS = preflight
