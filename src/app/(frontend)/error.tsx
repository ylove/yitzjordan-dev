'use client'

import { Button } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Section labelledBy="page-title" spacing="none" className="pb-24">
      <div className="pt-20 md:pt-28">
        <Heading level={1} id="page-title">
          Something broke.
        </Heading>
        <p className="mt-5 max-w-[52ch] text-lead text-ink-muted">The page failed to load. Trying again usually works.</p>
        <Button onClick={() => reset()} className="mt-8">
          Try again
        </Button>
      </div>
    </Section>
  )
}
