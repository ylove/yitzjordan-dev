import { ArrowLeft } from 'lucide-react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { RichText } from '@/components/richtext/RichText'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { ProjectCard } from '@/components/pages/work/ProjectCard'
import { SITE, articlePath } from '@/content/site'
import { populated } from '@/lib/cms'
import { formatDate } from '@/lib/format'
import { extractHeadings } from '@/lib/richtext/headings'
import { articleJsonLd, breadcrumbJsonLd, ids, ref, webPageJsonLd } from '@/lib/seo/jsonld'
import type { Article, Project } from '@/payload-types'

/** A research or blog article: header, section nav, body, series link and related work. */
export function ArticleView({ article }: { article: Article }) {
  const path = articlePath(article.kind, article.slug)
  const kindLabel = article.kind === 'blog' ? 'Blog' : 'Research'
  const listPath = article.kind === 'blog' ? '/blog' : '/research'
  const body = article.body as unknown as SerializedEditorState
  const headings = extractHeadings(body as never, article.anchors).filter((h) => h.level === 2)
  const published = article.publishDate ?? article.createdAt
  const previous = typeof article.previous === 'object' && article.previous?.status === 'published' ? article.previous : null
  const projects = populated<Project>(article.relatedProjects)

  return (
    <article aria-labelledby="page-title">
      <Container className="pt-12 md:pt-16">
        <TrackedLink href={listPath} className="inline-flex items-center gap-1.5 text-small text-ink-muted hover:text-ink">
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
          {kindLabel}
        </TrackedLink>
        <header className="mt-6 max-w-4xl border-b border-line pb-8">
          <h1 id="page-title" className="text-h1 text-ink">
            {article.title}
          </h1>
          <p className="mt-5 max-w-[62ch] text-lead text-ink-muted">{article.excerpt}</p>
          <p className="mt-6 text-data text-ink-subtle">
            <span>{SITE.name}</span>
            <span aria-hidden> · </span>
            <time dateTime={published}>{formatDate(published)}</time>
            {article.updatedDate ? (
              <>
                <span aria-hidden> · </span>
                Updated <time dateTime={article.updatedDate}>{formatDate(article.updatedDate)}</time>
              </>
            ) : null}
            {article.readingMinutes ? (
              <>
                <span aria-hidden> · </span>
                {article.readingMinutes} min read
              </>
            ) : null}
          </p>
        </header>
      </Container>

      <Container className="pb-20 md:pb-28">
        <div className="grid gap-10 pt-10 lg:grid-cols-12 lg:gap-8">
          {headings.length > 1 ? (
            <nav aria-label="In this article" className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-small font-medium text-ink">In this article</p>
                <ol className="mt-3 space-y-1.5 border-l border-line pl-4">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="text-small text-ink-muted hover:text-ink">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          ) : null}
          <div className={headings.length > 1 ? 'min-w-0 lg:col-span-8 lg:col-start-5' : 'min-w-0 lg:col-span-8'}>
            <RichText data={body} anchors={article.anchors} />

            <footer className="mt-14 space-y-8 border-t border-line pt-8">
              {previous ? (
                <p className="text-body text-ink-muted">
                  Earlier in this series:{' '}
                  <TrackedLink href={articlePath(previous.kind, previous.slug)} className="font-medium text-ink underline decoration-accent underline-offset-4">
                    {previous.title}
                  </TrackedLink>
                </p>
              ) : null}
              <p className="max-w-[62ch] text-small text-ink-muted">
                {SITE.name} is a full-stack and AI engineer and the founder of Vouch Networks.{' '}
                <TrackedLink href="/about" className="text-ink underline decoration-accent underline-offset-4">
                  More about him
                </TrackedLink>
                {', or reach him on '}
                <TrackedLink href={SITE.links.linkedin} className="text-ink underline decoration-accent underline-offset-4">
                  LinkedIn
                </TrackedLink>
                .
              </p>
            </footer>
          </div>
        </div>

        {projects.length ? (
          <section aria-labelledby="related-work" className="mt-16 border-t border-line pt-10">
            <h2 id="related-work" className="text-h3 text-ink">
              Related work
            </h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>

      <JsonLd
        data={[
          webPageJsonLd({ path, name: article.title, description: article.excerpt, mainEntity: ref(ids.article(path)), about: ref(ids.article(path)) }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Writing', path: '/writing' },
            { name: kindLabel, path: listPath },
            { name: article.title, path },
          ]),
          articleJsonLd(article, { imageUrl: `/og/article/${article.slug}` }),
        ]}
      />
    </article>
  )
}
