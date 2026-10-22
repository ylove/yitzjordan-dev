import { JsonLd } from '@/components/seo/JsonLd'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { Heading } from '@/components/ui/Heading'
import { Lead } from '@/components/ui/Lead'
import { Section } from '@/components/ui/Section'
import { cn } from '@/components/ui/cn'
import { articlePath } from '@/content/site'
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import type { Article } from '@/payload-types'
import { ArticleRow } from './ArticleRow'

const TABS = [
  { label: 'All', href: '/writing' },
  { label: 'Research', href: '/research' },
  { label: 'Blog', href: '/blog' },
]

/** /writing, /research and /blog: the same list, filtered. */
export function ArticleIndex({
  path,
  title,
  description,
  articles,
}: {
  path: '/writing' | '/research' | '/blog'
  title: string
  description: string
  articles: Article[]
}) {
  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="pt-14 pb-8 md:pt-20">
          <Heading level={1} id="page-title">
            {title}
          </Heading>
          <Lead className="mt-6">{description}</Lead>
          <nav aria-label="Filter writing" className="mt-8">
            <ul className="flex gap-2">
              {TABS.map((t) => (
                <li key={t.href}>
                  <TrackedLink
                    href={t.href}
                    aria-current={t.href === path ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-9 items-center rounded-control border px-3.5 text-small font-medium transition-colors',
                      t.href === path ? 'border-ink bg-ink text-surface' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    {t.label}
                  </TrackedLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Section>
      <Section labelledBy="list-title" spacing="none" className="pb-20 md:pb-28">
        <h2 id="list-title" className="sr-only">
          Articles
        </h2>
        {articles.length ? (
          <ul className="border-b border-line">
            {articles.map((a) => (
              <ArticleRow key={a.id} article={a} />
            ))}
          </ul>
        ) : (
          <p className="border-t border-line pt-8 text-body text-ink-muted">Nothing here yet.</p>
        )}
      </Section>
      <JsonLd
        data={[
          webPageJsonLd({
            path,
            type: 'CollectionPage',
            name: title,
            description,
            mainEntity: itemListJsonLd(articles.map((a) => ({ url: articlePath(a.kind, a.slug), name: a.title }))),
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            ...(path === '/writing' ? [] : [{ name: 'Writing', path: '/writing' }]),
            { name: title, path },
          ]),
        ]}
      />
    </>
  )
}
