/**
 * Canonical site URL helpers.
 *
 * getSiteUrl() is the only place that decides the public origin of the site.
 * Use it for canonicals, Open Graph URLs, the sitemap, robots, JSON-LD and llms.txt.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL
 *   2. https://${VERCEL_PROJECT_PRODUCTION_URL} (set automatically by Vercel)
 *   3. https://yitzjordan.dev
 *
 * Local hosts (localhost, 127.0.0.1) and the old GitHub Pages host are rejected at every
 * step, so a stray dev value can never leak into production metadata.
 */

export const DEFAULT_SITE_URL = 'https://yitzjordan.dev'

const REJECTED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
  'ylove.github.io',
])

function toOrigin(raw: string | undefined | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    if (REJECTED_HOSTS.has(url.hostname.toLowerCase())) return null
    return url.origin
  } catch {
    return null
  }
}

/** Public origin of the site, without a trailing slash. Never localhost or the old GitHub Pages host. */
export function getSiteUrl(): string {
  return (
    toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    DEFAULT_SITE_URL
  )
}

/** Absolute URL for a site path. `absoluteUrl('/about')` -> `https://yitzjordan.dev/about`. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = getSiteUrl()
  if (!path || path === '/') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Origin Payload should use as `serverURL`.
 *
 * - Local development: empty string, so Payload keeps admin API calls and media URLs relative
 *   and works on whatever host and port the dev server uses.
 * - Vercel preview deployments: the deployment's own URL, so the admin panel on a preview
 *   talks to that preview and not to production.
 * - Production: getSiteUrl().
 */
export function getPayloadServerUrl(): string {
  if (process.env.NODE_ENV !== 'production') return ''
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return getSiteUrl()
}

/**
 * Origins allowed to make cookie-authenticated requests to Payload (CSRF) and
 * cross-origin requests to its API (CORS).
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>()
  const site = getSiteUrl()
  origins.add(site)

  // Accept both the apex and the www host, since www redirects to the apex.
  try {
    const url = new URL(site)
    const host = url.hostname
    const twin = host.startsWith('www.') ? host.slice(4) : `www.${host}`
    origins.add(`${url.protocol}//${twin}`)
  } catch {
    // getSiteUrl() always returns a valid origin, so this is unreachable.
  }

  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
    if (host) origins.add(`https://${host}`)
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
  }

  return [...origins]
}
