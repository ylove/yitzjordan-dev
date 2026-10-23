import { ArrowRight } from 'lucide-react'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { articlePath } from '@/content/site'
import { formatDate } from '@/lib/format'
import type { Article } from '@/payload-types'
import { typeset } from '@/components/ui/typeset'

/** One article in a list: date and kind, title, excerpt. */
export function ArticleRow({ article, headingLevel = 3 }: { article: Article; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const
  const date = article.publishDate ?? article.createdAt
  return (
    <li className="border-t border-line">
      <TrackedLink
        href={articlePath(article.kind, article.slug)}
        className="group/row grid gap-3 py-7 md:grid-cols-12 md:gap-8"
      >
        <p className="text-data text-ink-subtle md:col-span-3 md:pt-1.5">
          <time dateTime={date}>{formatDate(date)}</time>
          <span aria-hidden> · </span>
          {article.kind === 'blog' ? 'Blog' : 'Research'}
          {article.readingMinutes ? (
            <>
              <span aria-hidden> · </span>
              {article.readingMinutes} min
            </>
          ) : null}
        </p>
        <div className="md:col-span-8">
          <H className="text-h3 text-ink group-hover/row:underline group-hover/row:decoration-accent group-hover/row:decoration-2 group-hover/row:underline-offset-4">
            {typeset(article.title)}
          </H>
          <p className="mt-2 max-w-[62ch] text-body text-ink-muted">{article.excerpt}</p>
        </div>
        <ArrowRight
          aria-hidden
          strokeWidth={1.75}
          className="hidden size-5 justify-self-end text-ink-subtle transition-transform group-hover/row:translate-x-1 group-hover/row:text-ink md:col-span-1 md:mt-2 md:block motion-reduce:transition-none"
        />
      </TrackedLink>
    </li>
  )
}
