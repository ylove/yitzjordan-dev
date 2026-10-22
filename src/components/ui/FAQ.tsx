import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type FaqItem = { q: string; a: ReactNode }

export type FAQProps = {
  items: FaqItem[]
  /** Heading level for questions. Default 3 (under the section's h2). */
  headingLevel?: 3 | 4
  /** Index of an item to open by default. */
  defaultOpen?: number
  className?: string
}

/**
 * Accessible accordion on native <details>/<summary>: keyboard, screen
 * readers, find-in-page and no-JS all work. Questions are real headings.
 * Answers: 40 to 60 words, direct and quotable. Works on any surface.
 *   <FAQ items={[{ q: 'How do community organizations send emergency alerts?', a: '...' }]} />
 * FAQPage JSON-LD comes from the SEO helpers, not from this component.
 */
export function FAQ({ items, headingLevel = 3, defaultOpen, className }: FAQProps) {
  const H = `h${headingLevel}` as const
  return (
    <div className={cn('border-t border-line', className)}>
      {items.map((item, i) => (
        <details key={item.q} open={defaultOpen === i} className="group/faq border-b border-line">
          <summary
            className={cn(
              'flex cursor-pointer list-none items-start justify-between gap-6 py-5 md:py-6',
              '[&::-webkit-details-marker]:hidden',
              'rounded-control focus-visible:outline-offset-4',
            )}
          >
            <H className="text-h4 pt-0.5 text-ink md:text-[1.25rem]">{item.q}</H>
            <span
              aria-hidden
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-control border border-line text-ink-subtle transition-colors group-hover/faq:border-line-strong group-hover/faq:text-ink"
            >
              <Plus
                className="size-4 transition-transform duration-200 group-open/faq:rotate-45 motion-reduce:transition-none"
                strokeWidth={1.75}
              />
            </span>
          </summary>
          <div className="max-w-[66ch] pr-14 pb-6 text-body text-ink-muted [&_a]:text-ink [&_a]:underline [&_a]:decoration-accent [&_a]:underline-offset-[0.2em] [&_p+p]:mt-3">
            {typeof item.a === 'string' ? <p>{item.a}</p> : item.a}
          </div>
        </details>
      ))}
    </div>
  )
}
