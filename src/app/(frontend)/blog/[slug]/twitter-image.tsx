import { getArticleBySlug } from '@/lib/cms'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/seo/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Article by Yitz Jordan'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  return renderOgImage({ title: article?.title ?? 'Writing', label: article?.kind === 'blog' ? 'Blog' : 'Research' })
}
