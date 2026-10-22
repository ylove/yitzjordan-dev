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
import { VideoCard } from '@/components/video/VideoCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { CTAS } from '@/content/site'
import { DEFAULT_PROFILE } from '@/content/profile'
import { getArticles, getProfile, getProjects, getSkills, getVideos, mediaOf } from '@/lib/cms'
import { routeMetadata } from '@/lib/seo/metadata'
import { personJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { absoluteUrl } from '@/lib/seo/site-url'

export const revalidate = 3600

export const metadata: Metadata = routeMetadata('/', { title: 'Yitz Jordan | Full-stack and AI engineer' })

function SectionHead({ id, title, href, linkLabel }: { id: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <Heading level={2} id={id}>
        {title}
      </Heading>
      <TrackedLink
        href={href}
        className="group/all inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink underline decoration-accent decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current"
      >
        {linkLabel}
        <ArrowRight aria-hidden strokeWidth={1.75} className="size-4 transition-transform group-hover/all:translate-x-0.5 motion-reduce:transition-none" />
      </TrackedLink>
    </div>
  )
}

export default async function HomePage() {
  const [profile, projects, articles, videos, skills] = await Promise.all([
    getProfile(),
    getProjects({ featured: true }),
    getArticles({ limit: 3 }),
    getVideos({ limit: 3 }),
    getSkills(),
  ])
  const headline = profile?.headline ?? DEFAULT_PROFILE.headline
  const intro = profile?.intro ?? DEFAULT_PROFILE.intro
  const mcpUrl = absoluteUrl('/api/mcp')

  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="pt-14 pb-16 md:pt-24 md:pb-24">
          <Heading level={1} size="display" id="page-title" className="max-w-[14ch]">
            {headline}
          </Heading>
          <Lead className="mt-7 max-w-[62ch] md:mt-9">{intro}</Lead>
          <CtaPair primary={CTAS.work} secondary={CTAS.linkedin} location="home_hero" className="mt-9 md:mt-10" />
        </div>
      </Section>

      {projects.length ? (
        <Section labelledBy="work-title" hairline spacing="compact">
          <SectionHead id="work-title" title="Work" href="/work" linkLabel="All work" />
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {articles.length ? (
        <Section labelledBy="writing-title" hairline spacing="compact">
          <SectionHead id="writing-title" title="Writing" href="/writing" linkLabel="All writing" />
          <ul className="mt-8 border-b border-line">
            {articles.map((a) => (
              <ArticleRow key={a.id} article={a} />
            ))}
          </ul>
        </Section>
      ) : null}

      {videos.length ? (
        <Section labelledBy="videos-title" hairline spacing="compact">
          <SectionHead id="videos-title" title="Videos" href="/videos" linkLabel="All videos" />
          <ul className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <li key={v.id}>
                <VideoCard video={v} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section surface="ink" labelledBy="agents-title" spacing="compact" className="mt-12 md:mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <Heading level={2} size="h3" id="agents-title">
              Your agent can read this site too.
            </Heading>
            <p className="mt-4 max-w-[58ch] text-body text-ink-muted">
              This site has an MCP server. Claude, ChatGPT or your own agent can read the projects and writing, check a
              list of requirements against real work with links, and pass along an introduction when you ask it to.
            </p>
            <p className="mt-4 text-small">
              <TrackedLink href="/agents" className="font-medium text-ink underline decoration-accent decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current">
                How it works
              </TrackedLink>
            </p>
          </div>
          <div className="min-w-0 lg:col-span-5">
            <CopyText label="MCP server" value={mcpUrl} />
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
