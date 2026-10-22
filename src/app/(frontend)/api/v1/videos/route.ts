import type { NextRequest } from 'next/server'
import { ok, preflight } from '@/lib/agents/http'
import { listVideos } from '@/lib/agents/tools'

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get('kind') ?? undefined
  const project = req.nextUrl.searchParams.get('project') ?? undefined
  return ok(await listVideos({ kind, project }))
}

export const OPTIONS = preflight
