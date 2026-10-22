import { NextResponse, type NextRequest } from 'next/server'

/**
 * Content negotiation for agents: a request that prefers Markdown (Accept: text/markdown) gets
 * the Markdown twin of the page. Everyone else gets HTML.
 *   /                  -> /llms.txt
 *   /agents            -> /AGENTS.md
 *   /research/<slug>   -> /md/research/<slug> (same for /blog and /work)
 * Also redirects /agents.md to /AGENTS.md. The matcher lists only these paths, so this never
 * runs for the Payload admin or API.
 */
const STATIC_TWINS: Record<string, string> = {
  '/': '/llms.txt',
  '/agents': '/AGENTS.md',
}

function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false
  const types = accept.split(',').map((part) => {
    const [type, ...params] = part.trim().toLowerCase().split(';')
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
    return { type: type.trim(), q: q ? Number(q.slice(2)) || 0 : 1 }
  })
  const markdown = types.find((t) => t.type === 'text/markdown' || t.type === 'text/x-markdown')
  if (!markdown || markdown.q === 0) return false
  const html = types.find((t) => t.type === 'text/html')
  return !html || markdown.q >= html.q
}

function twinFor(pathname: string): string | null {
  if (STATIC_TWINS[pathname]) return STATIC_TWINS[pathname]
  const match = pathname.match(/^\/(research|blog|work)\/([a-z0-9-]+)\/?$/)
  return match ? `/md/${match[1]}/${match[2]}` : null
}

export function proxy(request: NextRequest) {
  // /agents.md is a common guess. Redirect rules match case-insensitively and would loop on
  // /AGENTS.md itself, so the alias is an exact, case-sensitive check here.
  if (request.nextUrl.pathname === '/agents.md') {
    return NextResponse.redirect(new URL('/AGENTS.md', request.url), 308)
  }
  const twin = twinFor(request.nextUrl.pathname)
  if (twin && prefersMarkdown(request.headers.get('accept'))) {
    const response = NextResponse.rewrite(new URL(twin, request.url))
    response.headers.set('Vary', 'Accept')
    return response
  }
  const response = NextResponse.next()
  response.headers.set('Vary', 'Accept')
  return response
}

export const config = {
  matcher: ['/', '/agents', '/agents.md', '/research/:slug', '/blog/:slug', '/work/:slug'],
}
