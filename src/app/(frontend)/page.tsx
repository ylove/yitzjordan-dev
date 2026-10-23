import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { CopyText } from '@/components/ui/CopyText'
import { CtaPair } from '@/components/ui/CtaPair'
import { Heading } from '@/components/ui/Heading'
import { Lead } from '@/components/ui/Lead'
import { Section } from '@/components/ui/Section'
import { ProjectCard } from '@/components/pages/work/ProjectCard'
import { ArticleRow } from '@/components/pages/writing/ArticleRow'
import { ShortsShelf } from '@/components/video/ShortsShelf'
import { toShortItems } from '@/components/video/short-items'
import { JsonLd } from '@/components/seo/JsonLd'
import { AGENT_PATHS, starterPrompt } from '@/content/agents'
import { CTAS } from '@/content/site'
import { DEFAULT_PROFILE } from '@/content/profile'
import { getArticles, getProfile, getProjects, getSkills, getVideos, mediaOf } from '@/lib/cms'
import { routeMetadata } from '@/lib/seo/metadata'
import { personJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { absoluteUrl } from '@/lib/seo/site-url'

export const revalidate = 3600

export const metadata: Metadata = routeMetadata('/', { title: 'Yitz Jordan | AI technical lead and full-stack engineer' })

/** A home section opener: the section name, a line that sells it, a sentence that points the way. */
function SectionHead({
  id,
  title,
  subhead,
  body,
  href,
  linkLabel,
}: {
  id: string
  title: string
  subhead: string
  body: string
  href: string
  linkLabel: string
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
      <div className="min-w-0 lg:col-span-7">
        <Heading level={2} id={id}>
          {title}
        </Heading>
        <p className="mt-4 max-w-[32ch] text-h3 text-balance text-ink">{subhead}</p>
      </div>
      <div className="min-w-0 lg:col-span-5">
        <p className="max-w-[52ch] text-body text-pretty text-ink-muted">{body}</p>
        <TrackedLink
          href={href}
          className="group/all mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink underline decoration-accent decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current"
        >
          {linkLabel}
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-4 transition-transform group-hover/all:translate-x-0.5 motion-reduce:transition-none" />
        </TrackedLink>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const [profile, projects, articles, videos, skills] = await Promise.all([
    getProfile(),
    getProjects({ featured: true }),
    getArticles({ limit: 3 }),
    getVideos({ limit: 8 }),
    getSkills(),
  ])
  const headline = profile?.headline ?? DEFAULT_PROFILE.headline
  const intro = profile?.intro ?? DEFAULT_PROFILE.intro
  const prompt = starterPrompt(absoluteUrl(AGENT_PATHS.agentsMd))
  const shorts = toShortItems(videos)

  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="pt-14 pb-16 md:pt-24 md:pb-24">
          <Heading level={1} size="display" id="page-title" className="max-w-[17ch]">
            {headline}
          </Heading>
          <Lead className="mt-7 max-w-[62ch] md:mt-9">{intro}</Lead>
          <CtaPair primary={CTAS.work} secondary={CTAS.linkedin} location="home_hero" className="mt-9 md:mt-10" />
        </div>
      </Section>

      {projects.length ? (
        <Section labelledBy="work-title" hairline spacing="compact">
          <SectionHead
            id="work-title"
            title="Work"
            subhead="Open-source tools for teams putting AI agents to work."
            body="Each one started as a problem I had to solve: agents that need to agree before they build, answers nobody can check, coding sessions that drift, and bug reports that die in Slack. Find the one your team has."
            href="/work"
            linkLabel="All work"
          />
          <ul className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id} className={p.schemaType === 'organization' ? 'md:col-span-2' : undefined}>
                <ProjectCard project={p} topics />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {shorts.length ? (
        <Section surface="band" labelledBy="videos-title" spacing="compact" className="mt-12 md:mt-16">
          <SectionHead
            id="videos-title"
            title="Videos"
            subhead="Short explainers on steering Claude and on the biases models carry."
            body="Under three minutes each: XML tags that put you in control of Claude, and what my persona research means for anyone building or selling with AI agents. Press play and use the arrows to watch them in a row."
            href="/videos"
            linkLabel="All videos"
          />
          <ShortsShelf items={shorts} className="mt-10 md:mt-12" />
        </Section>
      ) : null}

      {articles.length ? (
        <Section labelledBy="writing-title" spacing="compact">
          <SectionHead
            id="writing-title"
            title="Writing"
            subhead="Experiments on how AI models see themselves, and the bias that comes with it."
            body="I put frontier models in rap battles and asked them to picture themselves at work. Given the chance, they describe the same person: mid-30s, glasses and layers. Start with the latest experiment."
            href="/writing"
            linkLabel="All writing"
          />
          <ul className="mt-10 border-b border-line md:mt-12">
            {articles.map((a) => (
              <ArticleRow key={a.id} article={a} />
            ))}
          </ul>
        </Section>
      ) : null}

      <Section surface="ink" labelledBy="agents-title" spacing="compact" className="mt-12 md:mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <Heading level={2} size="h3" id="agents-title">
              Let your AI assistant do the first round.
            </Heading>
            <p className="mt-4 max-w-[58ch] text-body text-ink-muted">
              Paste one message into ChatGPT, Claude or Gemini with your job description. It reads the work, checks your
              requirements against evidence it can open, and drafts a brief about your team for you to send. Nothing to
              install, and an MCP server for the assistants you connect.
            </p>
            <p className="mt-4 text-small">
              <TrackedLink href="/agents" className="font-medium text-ink underline decoration-accent decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current">
                How it works
              </TrackedLink>
            </p>
          </div>
          <div className="min-w-0 lg:col-span-5">
            <CopyText label="Prompt for your assistant" value={prompt} wrap />
          </div>
        </div>
      </Section>

      <JsonLd
        data={[
          webPageJsonLd({ path: '/', name: 'Yitz Jordan', description: profile?.summary ?? undefined, mainEntity: { '@id': `${absoluteUrl('/')}#person` } }),
          personJsonLd(profile, { full: true, skills, imageUrl: mediaOf(profile?.photo)?.url }),
        ]}
      />
    </>
  )
}
