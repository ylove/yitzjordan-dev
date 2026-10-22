import type { MetadataRoute } from 'next'
import { ROUTES, articlePath } from '@/content/site'
import { getSitemapEntries, getVideos } from '@/lib/cms'
import { youtubeThumbnail } from '@/lib/seo/jsonld'
import { absoluteUrl } from '@/lib/seo/site-url'

// Rebuild at most hourly; publish hooks also revalidate /sitemap.xml.
export const revalidate = 3600

/** Static routes plus every project, published article and video. Video pages carry video entries. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [{ articles, projects }, videos] = await Promise.all([getSitemapEntries(), getVideos()])

  const staticRoutes: MetadataRoute.Sitemap = ROUTES.filter((r) => r.index).map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: absoluteUrl(`/work/${p.slug}`),
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: absoluteUrl(articlePath(a.kind, a.slug)),
    lastModified: new Date(a.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const videoRoutes: MetadataRoute.Sitemap = videos.map((v) => {
    const thumb = typeof v.thumbnail === 'object' && v.thumbnail?.url ? absoluteUrl(v.thumbnail.url) : v.youtubeId ? youtubeThumbnail(v.youtubeId) : null
    return {
      url: absoluteUrl(`/videos/${v.slug}`),
      lastModified: new Date(v.updatedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
      ...(thumb
        ? {
            videos: [
              {
                title: v.title,
                thumbnail_loc: thumb,
                description: v.description.slice(0, 2000),
                duration: Math.round(v.durationSeconds),
                publication_date: v.uploadDate,
                ...(v.youtubeId ? { player_loc: `https://www.youtube-nocookie.com/embed/${v.youtubeId}` } : {}),
                ...(typeof v.file === 'object' && v.file?.url ? { content_loc: absoluteUrl(v.file.url) } : {}),
              },
            ],
          }
        : {}),
    }
  })

  return [...staticRoutes, ...projectRoutes, ...articleRoutes, ...videoRoutes]
}
