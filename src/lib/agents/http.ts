/** Small helpers for the /api/v1 routes. */
import { NextResponse, type NextRequest } from 'next/server'

const MAX_BODY_BYTES = 32 * 1024

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function ok(body: unknown, init: { status?: number; cache?: boolean } = {}) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: {
      ...CORS,
      'Cache-Control': init.cache === false ? 'no-store' : 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
      'X-Robots-Tag': 'noindex',
    },
  })
}

export function fail(status: number, errors: Record<string, string>, extra: Record<string, string> = {}) {
  return NextResponse.json({ ok: false, errors }, { status, headers: { ...CORS, 'Cache-Control': 'no-store', ...extra } })
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function readJson(req: NextRequest): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  const length = Number(req.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) return { ok: false, response: fail(413, { _form: 'Request body too large.' }) }
  try {
    return { ok: true, body: await req.json() }
  } catch {
    return { ok: false, response: fail(400, { _form: 'Send a JSON body with Content-Type: application/json.' }) }
  }
}
