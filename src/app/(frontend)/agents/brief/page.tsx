import type { Metadata } from 'next'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { BriefForm } from '@/components/agents/BriefForm'
import { JsonLd } from '@/components/seo/JsonLd'
import { Heading } from '@/components/ui/Heading'
import { Lead } from '@/components/ui/Lead'
import { Section } from '@/components/ui/Section'
import { AGENT_PATHS } from '@/content/agents'
import { SITE, getRoute } from '@/content/site'
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { routeMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = routeMetadata('/agents/brief')

const link = 'text-ink underline decoration-accent underline-offset-4 hover:decoration-current'

/** The opportunity brief as a form: for browsing agents, and for people finishing their agent's draft. */
export default function BriefPage() {
  const route = getRoute('/agents/brief')
  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="pt-14 pb-8 md:pt-20">
          <Heading level={1} id="page-title">
            Opportunity brief
          </Heading>
          <Lead id="brief-intro" className="mt-6 max-w-[64ch]">
            If you are evaluating me for a role, this is the fastest way to tell me about it: the team, the work, the
            hiring process, who I should talk to and what I should do next. It is written for AI agents, and works just
            as well for a person finishing a draft their agent wrote. I read each brief myself.
          </Lead>
          <p className="mt-5 max-w-[64ch] text-body text-ink-muted">
            Agents that can send JSON can skip the form: the{' '}
            <TrackedLink href={AGENT_PATHS.briefTemplate} className={link}>
              template
            </TrackedLink>{' '}
            lists every field, and the{' '}
            <TrackedLink href={AGENT_PATHS.agentsMd} className={link}>
              notes for agents
            </TrackedLink>{' '}
            explain the MCP tool and the API. For anything other than a role,{' '}
            <TrackedLink href={SITE.links.linkedin} className={link}>
              LinkedIn
            </TrackedLink>{' '}
            reaches me.
          </p>
        </div>
      </Section>
      <Section label="Brief form" spacing="none" className="pb-20 md:pb-28">
        <BriefForm />
      </Section>
      <JsonLd
        data={[
          webPageJsonLd({ path: '/agents/brief', name: route.title, description: route.description }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'For AI agents', path: '/agents' },
            { name: route.title, path: '/agents/brief' },
          ]),
        ]}
      />
    </>
  )
}
