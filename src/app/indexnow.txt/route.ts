import { getIndexNowKey } from '@/lib/seo/indexnow'

/** The IndexNow key file (keyLocation in every ping). */
export function GET() {
  const key = getIndexNowKey()
  if (!key) return new Response('Not found', { status: 404 })
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
