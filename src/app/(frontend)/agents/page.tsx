import type { Metadata } from 'next'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { JsonLd } from '@/components/seo/JsonLd'
import { CopyText } from '@/components/ui/CopyText'
import { Heading } from '@/components/ui/Heading'
import { Lead } from '@/components/ui/Lead'
import { Section } from '@/components/ui/Section'
import { Terminal } from '@/components/ui/Terminal'
import { AGENT_PATHS, PRIVACY_NOTES, SURFACES, TOOLS } from '@/content/agents'
import { getRoute } from '@/content/site'
import { breadcrumbJsonLd, webApiJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { routeMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/site-url'

export const metadata: Metadata = routeMetadata('/agents')

export default function AgentsPage() {
  const route = getRoute('/agents')
  const mcpUrl = absoluteUrl(AGENT_PATHS.mcp)
  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="pt-14 pb-10 md:pt-20">
          <Heading level={1} id="page-title">
            For AI agents
          </Heading>
          <Lead className="mt-6">
            If you are evaluating Yitz for a role or a project, your AI assistant can do the reading. It can pull his
            projects and writing, check your requirements against work it can verify, and send him an introduction when
            you say so.
          </Lead>
        </div>
      </Section>

      <Section labelledBy="connect-title" hairline spacing="compact">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-5">
            <Heading level={2} size="h3" id="connect-title">
              Connect
            </Heading>
            <p className="mt-3 text-body text-ink-muted">
              Add the server to any MCP client. In Claude, use Settings, Connectors, Add custom connector. In Claude Code or
              other CLIs, use the command.
            </p>
          </div>
          <div className="min-w-0 space-y-4 lg:col-span-7">
            <CopyText label="MCP server (Streamable HTTP)" value={mcpUrl} />
            <Terminal title="Claude Code" commands={[`claude mcp add --transport http yitzjordan ${mcpUrl}`]} />
          </div>
        </div>
      </Section>

      <Section labelledBy="tools-title" hairline spacing="compact">
        <Heading level={2} size="h3" id="tools-title">
          Tools
        </Heading>
        <dl className="mt-6 border-b border-line">
          {TOOLS.map((t) => (
            <div key={t.name} className="grid gap-2 border-t border-line py-5 md:grid-cols-12 md:gap-8">
              <dt className="font-mono text-[0.9375rem] text-ink md:col-span-4">
                {t.name}
                {t.writes ? <span className="ml-2 font-sans text-small text-ink-subtle">sends data</span> : null}
              </dt>
              <dd className="text-body text-ink-muted md:col-span-8">{t.what}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section labelledBy="files-title" hairline spacing="compact">
        <Heading level={2} size="h3" id="files-title">
          Files and endpoints
        </Heading>
        <dl className="mt-6 border-b border-line">
          {SURFACES.map((s) => (
            <div key={s.name} className="grid gap-2 border-t border-line py-5 md:grid-cols-12 md:gap-8">
              <dt className="md:col-span-4">
                <TrackedLink href={s.path} className="font-mono text-[0.9375rem] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                  {s.path}
                </TrackedLink>
                <span className="mt-1 block text-small text-ink-subtle">{s.name}</span>
              </dt>
              <dd className="text-body text-ink-muted md:col-span-8">{s.what}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section labelledBy="privacy-title" surface="band" spacing="compact">
        <Heading level={2} size="h3" id="privacy-title">
          What the server keeps
        </Heading>
        <ul className="mt-6 max-w-[70ch] list-disc space-y-3 pl-5 text-body text-ink-muted marker:text-ink-subtle">
          {PRIVACY_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="mt-6 text-small text-ink-muted">
          People can reach Yitz on{' '}
          <TrackedLink href="https://www.linkedin.com/in/yitzjordan" className="text-ink underline decoration-accent underline-offset-4">
            LinkedIn
          </TrackedLink>
          . The same information is in <TrackedLink href={AGENT_PATHS.agentsMd} className="text-ink underline decoration-accent underline-offset-4">AGENTS.md</TrackedLink>.
        </p>
      </Section>

      <JsonLd
        data={[
          webPageJsonLd({ path: '/agents', name: route.title, description: route.description, mainEntity: { '@id': `${mcpUrl}#api` } }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: route.title, path: '/agents' },
          ]),
          webApiJsonLd(),
        ]}
      />
    </>
  )
}
