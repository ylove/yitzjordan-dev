import type { NextRequest } from 'next/server'
import { ok, preflight } from '@/lib/agents/http'
import { searchWriting } from '@/lib/agents/tools'

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 200)
  const kindParam = req.nextUrl.searchParams.get('kind')
  const kind = kindParam === 'research' || kindParam === 'blog' ? kindParam : undefined
  const limit = Math.min(10, Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 5))
  return ok(await searchWriting(q, { kind, limit }))
}

export const OPTIONS = preflight
