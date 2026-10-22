import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { articlePath, type ArticleKind } from '@/content/site'
import { getArticleBySlug, getSitemapEntries } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/site-url'
import { ArticleView } from './ArticleView'

/**
 * Shared implementation of /research/[slug] and /blog/[slug]. An article requested under the
 * other kind's prefix redirects permanently to its real URL.
 */
export function articleRoute(kind: ArticleKind) {
  type Params = { params: Promise<{ slug: string }> }

  async function generateStaticParams() {
    const { articles } = await getSitemapEntries()
    return articles.filter((a) => (a.kind ?? 'research') === kind).map((a) => ({ slug: a.slug }))
  }

  async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params
    const article = await getArticleBySlug(slug)
    if (!article || article.kind !== kind) return {}
    const path = articlePath(article.kind, article.slug)
    const meta = pageMetadata({
      title: article.meta?.title?.replace(/ \| Yitz Jordan$/, '') || article.title,
      description: article.meta?.description || article.excerpt,
      path,
      keywords: article.keywords ?? undefined,
      type: 'article',
      publishedTime: article.publishDate ?? undefined,
      modifiedTime: article.updatedDate ?? article.updatedAt,
      routeImage: true,
    })
    return {
      ...meta,
      alternates: {
        ...meta.alternates,
        types: { 'text/markdown': absoluteUrl(`${path}.md`) },
      },
    }
  }

  async function Page({ params }: Params) {
    const { slug } = await params
    const article = await getArticleBySlug(slug)
    if (!article) notFound()
    if (article.kind !== kind) permanentRedirect(articlePath(article.kind, article.slug))
    return <ArticleView article={article} />
  }

  return { generateStaticParams, generateMetadata, Page }
}
