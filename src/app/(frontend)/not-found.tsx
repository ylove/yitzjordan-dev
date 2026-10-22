import { CtaPair } from '@/components/ui/CtaPair'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { CTAS } from '@/content/site'

export default function NotFound() {
  return (
    <Section labelledBy="page-title" spacing="none" className="pb-24">
      <div className="pt-20 md:pt-28">
        <Heading level={1} id="page-title">
          Not here.
        </Heading>
        <p className="mt-5 max-w-[52ch] text-lead text-ink-muted">That page moved or never existed. The work and the writing are a click away.</p>
        <CtaPair primary={CTAS.work} secondary={{ id: 'writing', label: 'Writing', href: '/writing' }} className="mt-8" size="md" />
      </div>
    </Section>
  )
}
