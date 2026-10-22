import { SITE, articlePath } from '@/content/site'
import { getArticles } from '@/lib/cms'
import { absoluteUrl } from '@/lib/seo/site-url'

export const revalidate = 3600

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** RSS 2.0 feed of published articles. */
export async function GET() {
  const articles = await getArticles({ limit: 50 })
  const items = articles
    .map((a) => {
      const url = absoluteUrl(articlePath(a.kind, a.slug))
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(a.publishDate ?? a.createdAt).toUTCString()}</pubDate>
      <category>${a.kind === 'blog' ? 'Blog' : 'Research'}</category>
      <description>${esc(a.excerpt)}</description>
    </item>`
    })
    .join('\n')
  const updated = articles[0] ? new Date(articles[0].updatedAt).toUTCString() : new Date().toUTCString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${absoluteUrl('/')}</link>
    <description>${esc(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
