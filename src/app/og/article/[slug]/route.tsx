import { getArticleBySlug } from '@/lib/cms'
import { renderOgImage } from '@/lib/seo/og'

export const revalidate = 86400

/**
 * A stable image URL per article for schema.org Article.image. The route-level
 * opengraph-image files carry a build hash in their path, so JSON-LD cannot point at them.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return new Response('Not found', { status: 404 })
  return renderOgImage({ title: article.title, label: article.kind === 'blog' ? 'Blog' : 'Research' })
}
