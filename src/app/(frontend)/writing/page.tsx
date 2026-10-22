import type { Metadata } from 'next'
import { ArticleIndex } from '@/components/pages/writing/ArticleIndex'
import { getRoute } from '@/content/site'
import { getArticles } from '@/lib/cms'
import { routeMetadata } from '@/lib/seo/metadata'

export const revalidate = 3600

export const metadata: Metadata = routeMetadata('/writing')

export default async function Page() {
  const route = getRoute('/writing')
  const articles = await getArticles()
  return <ArticleIndex path="/writing" title={route.title} description={route.description} articles={articles} />
}
