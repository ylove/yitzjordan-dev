import type { Metadata } from 'next'
import { ArticleIndex } from '@/components/pages/writing/ArticleIndex'
import { getRoute } from '@/content/site'
import { getArticles } from '@/lib/cms'
import { routeMetadata } from '@/lib/seo/metadata'

export const revalidate = 3600

export const metadata: Metadata = routeMetadata('/research')

export default async function Page() {
  const route = getRoute('/research')
  const articles = await getArticles({ kind: 'research' })
  return <ArticleIndex path="/research" title={route.title} description={route.description} articles={articles} />
}
