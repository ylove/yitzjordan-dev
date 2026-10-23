import type { Metadata } from 'next'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { JsonLd } from '@/components/seo/JsonLd'
import { CopyText } from '@/components/ui/CopyText'
import { Heading } from '@/components/ui/Heading'
import { Lead } from '@/components/ui/Lead'
import { Section } from '@/components/ui/Section'
import { Terminal } from '@/components/ui/Terminal'
import { AGENT_PATHS, PRIVACY_NOTES, SURFACES, TOOLS, starterPrompt } from '@/content/agents'
import { getRoute } from '@/content/site'
import { breadcrumbJsonLd, webApiJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { routeMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/site-url'

export const metadata: Metadata = routeMetadata('/agents')

const STEPS = [
  {
    title: 'It reads the work',
    body: 'llms.txt maps the site, and every project and article has a Markdown version, so the assistant reads the same pages you would.',
  },
  {
    title: 'It checks the fit',
    body: 'It runs the role’s requirements through the match check. Each comes back as a strong, partial or no match, with a link to the work behind it.',
  },
  {
    title: 'It drafts a brief',
    body: 'An introduction to your team: the role, the process, your ATS and whether AI screens applications, who Yitz should talk to and what he should do next.',
  },
  {
    title: 'You send it',
    body: 'Your assistant sends it, or gives you a link that opens the brief already filled in. You check it and press send, and you get a link to follow its status.',
  },
]

export default function AgentsPage() {
  const route = getRoute('/agents')
  const mcpUrl = absoluteUrl(AGENT_PATHS.mcp)
  const prompt = starterPrompt(absoluteUrl(AGENT_PATHS.agentsMd))
  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="pt-14 pb-10 md:pt-20">
          <Heading level={1} id="page-title">
            For AI agents
          </Heading>
          <Lead className="mt-6">
            If you are evaluating Yitz for a role, your AI assistant can do the first round: read the work, check your
            requirements against evidence it can open, and send him a brief about your team and the opening. Any
            assistant that can read a web page can start. Nothing to install.
          </Lead>
        </div>
      </Section>

      <Section labelledBy="start-title" hairline spacing="compact">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-5">
            <Heading level={2} size="h3" id="start-title">
              Start with one message
            </Heading>
            <p className="mt-3 text-body text-ink-muted">
              Paste this into ChatGPT, Claude, Gemini or any assistant that can browse, with the job description or its
              link at the end.
            </p>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <CopyText label="Prompt for your assistant" value={prompt} wrap />
          </div>
        </div>
        <ol className="mt-12 grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.title} className="border-t border-line pt-5">
              <h3 className="text-h4 text-ink">{step.title}</h3>
              <p className="mt-2 text-body text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-body">
          <TrackedLink href={AGENT_PATHS.brief} className="font-medium text-ink underline decoration-accent decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current">
            See the opportunity brief
          </TrackedLink>
        </p>
      </Section>

      <Section labelledBy="connect-title" hairline spacing="compact">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-5">
            <Heading level={2} size="h3" id="connect-title">
              Or connect over MCP
            </Heading>
            <p className="mt-3 text-body text-ink-muted">
              For assistants you connect to tools, the MCP server does the same with no scraping. In Claude, use Settings,
              Connectors, Add custom connector. In Claude Code or other CLIs, use the command.
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
