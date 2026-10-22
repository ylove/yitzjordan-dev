import { TrackedLink } from '@/components/analytics/TrackedLink'
import { JsonLd } from '@/components/seo/JsonLd'
import { FAQ } from '@/components/ui/FAQ'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { faqJsonLd } from '@/lib/seo/jsonld'

export type PageFaqItem = {
  q: string
  /** Plain text. It is also the FAQPage answer, so keep it exactly what the page shows. */
  a: string
  /** Optional follow-up link shown under the answer. */
  link?: { href: string; label: string }
}

export type PageFaqProps = {
  items: PageFaqItem[]
  title?: string
  id?: string
  intro?: string
}

/**
 * The FAQ section: a band panel, questions as H3s and the matching
 * FAQPage JSON-LD, built from the same strings so markup and visible text never drift.
 */
export function PageFaq({ items, title = 'Questions, answered', id = 'faq-title', intro }: PageFaqProps) {
  return (
    <Section surface="band" labelledBy={id}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Heading level={2} id={id} className="max-w-[12ch]">
            {title}
          </Heading>
          {intro ? <p className="mt-5 max-w-[34ch] text-body text-ink-muted">{intro}</p> : null}
        </div>
        <FAQ
          className="lg:col-span-8"
          items={items.map((item) => ({
            q: item.q,
            a: item.link ? (
              <>
                <p>{item.a}</p>
                <p>
                  <TrackedLink href={item.link.href}>{item.link.label}</TrackedLink>
                </p>
              </>
            ) : (
              item.a
            ),
          }))}
        />
      </div>
      <JsonLd data={faqJsonLd(items.map((item) => ({ question: item.q, answer: item.a })))} />
    </Section>
  )
}
