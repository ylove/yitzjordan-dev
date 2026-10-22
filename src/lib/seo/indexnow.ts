/**
 * IndexNow: tells Bing (and the engines that share its index, which ChatGPT search reads) that a
 * URL changed, so new and edited pages are recrawled within minutes instead of days.
 *
 * Only runs in Vercel production with INDEXNOW_KEY set. The key is served at /indexnow.txt
 * (src/app/indexnow.txt/route.ts), which is the keyLocation sent with every ping.
 * Pass `context: { disableIndexNow: true }` to a Payload operation to skip it.
 */
import { absoluteUrl, getSiteUrl } from './site-url'

const ENDPOINT = 'https://api.indexnow.org/indexnow'

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim()
  return key && /^[a-zA-Z0-9-]{8,128}$/.test(key) ? key : null
}

export function isIndexNowEnabled(): boolean {
  return Boolean(getIndexNowKey()) && process.env.VERCEL_ENV === 'production'
}

/** Pings IndexNow for site paths. Never throws; returns the HTTP status or null when skipped. */
export async function pingIndexNow(paths: string[]): Promise<number | null> {
  const key = getIndexNowKey()
  if (!key || !isIndexNowEnabled() || paths.length === 0) return null
  const urlList = [...new Set(paths.map((p) => absoluteUrl(p)))].slice(0, 10_000)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(getSiteUrl()).host,
        key,
        keyLocation: absoluteUrl('/indexnow.txt'),
        urlList,
      }),
      signal: AbortSignal.timeout(5000),
    })
    return res.status
  } catch (err) {
    console.error('[indexnow] ping failed', err instanceof Error ? err.message : err)
    return null
  }
}
