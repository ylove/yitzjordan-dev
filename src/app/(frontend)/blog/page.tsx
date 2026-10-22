import type { Metadata } from 'next'
import { ArticleIndex } from '@/components/pages/writing/ArticleIndex'
import { getRoute } from '@/content/site'
import { getArticles } from '@/lib/cms'
import { routeMetadata } from '@/lib/seo/metadata'

export const revalidate = 3600

export const metadata: Metadata = routeMetadata('/blog')

export default async function Page() {
  const route = getRoute('/blog')
  const articles = await getArticles({ kind: 'blog' })
  return <ArticleIndex path="/blog" title={route.title} description={route.description} articles={articles} />
}
