import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { PageFaq } from '@/components/pages/work/PageFaq'
import { PageHero, SectionIntro } from '@/components/pages/work/PageParts'
import { Steps } from '@/components/pages/work/Steps'
import { VISUAL_ARTS } from '@/components/pages/work/visuals/registry'
import { ArticleRow } from '@/components/pages/writing/ArticleRow'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/Badge'
import { CtaPair } from '@/components/ui/CtaPair'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Terminal } from '@/components/ui/Terminal'
import { VideoCard } from '@/components/video/VideoCard'
import { CTAS, GITHUB_CTA_LABELS, SITE, type Cta } from '@/content/site'
import { getProjectBySlug, getSitemapEntries, populated } from '@/lib/cms'
import { breadcrumbJsonLd, ids, projectJsonLd, ref, vouchOrganizationJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'
import type { Article, Project, Video } from '@/payload-types'

export const revalidate = 3600

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const { projects } = await getSitemapEntries()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}
  return pageMetadata({
    title: project.meta?.title?.replace(/ \| Yitz Jordan$/, '') || `${project.name}: ${project.oneLiner}`,
    description: project.meta?.description || project.description,
    path: `/work/${project.slug}`,
    keywords: project.keywords ?? undefined,
    routeImage: true,
  })
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function primaryCta(p: Project): Cta | null {
  if (p.github) return { id: 'repo', label: GITHUB_CTA_LABELS[p.githubCta ?? 'view'], href: p.github, external: true }
  if (p.homepage) return { id: 'homepage', label: `Visit ${hostOf(p.homepage)}`, href: p.homepage, external: true }
  if (p.officialUrl) return { id: 'official', label: p.officialLabel || `Visit ${hostOf(p.officialUrl)}`, href: p.officialUrl, external: true }
  return null
}

function secondaryCta(p: Project): Cta | null {
  if (p.secondaryCta?.label && p.secondaryCta.href) return { id: 'secondary', label: p.secondaryCta.label, href: p.secondaryCta.href }
  if (p.github && p.homepage) return { id: 'homepage', label: `Try it at ${hostOf(p.homepage)}`, href: p.homepage, external: true }
  return null
}

function Grid({ items }: { items: { title: string; body?: string | null }[] }) {
  return (
    <ul className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <li key={c.title} className="border-t border-line pt-5">
          <h3 className="text-h4 text-ink">{c.title}</h3>
          {c.body ? <p className="mt-2 text-body text-ink-muted">{c.body}</p> : null}
        </li>
      ))}
    </ul>
  )
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const path = `/work/${project.slug}`
  const articles = populated<Article>(project.relatedArticles).filter((a) => a.status === 'published')
  const videos = populated<Video>(project.relatedVideos)
  const arts = project.visual && project.visual !== 'none' ? VISUAL_ARTS[project.visual] : undefined
  const primary = primaryCta(project)
  const softwareNode = projectJsonLd(project)
  const commands = (project.install?.commands ?? '').split('\n').map((l) => l.trimEnd()).filter(Boolean)

  return (
    <>
      <PageHero
        title={project.hero.headline}
        lead={project.hero.lead}
        primary={primary}
        secondary={secondaryCta(project)}
        location="work_hero"
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-h4 text-ink">{project.name}</span>
            <Badge status={project.status}>{project.statusLabel}</Badge>
            {project.license ? <span className="text-data text-ink-subtle">{project.license} license</span> : null}
            {project.language ? <span className="text-data text-ink-subtle">{project.language}</span> : null}
          </div>
        }
      />

      {project.steps?.length ? (
        <Section labelledBy="how-title" hairline>
          <SectionIntro id="how-title" title={project.stepsTitle || 'How it works'}>
            {project.visualCaption ? <p>{project.visualCaption}</p> : null}
          </SectionIntro>
          <div className="mt-10">
            <Steps steps={project.steps} arts={arts} />
          </div>
        </Section>
      ) : null}

      {project.audiences?.length ? (
        <Section labelledBy="audience-title" surface="band">
          <SectionIntro id="audience-title" title={project.audienceTitle || 'Who it is for'} />
          <Grid items={project.audiences} />
        </Section>
      ) : null}

      {project.capabilities?.length ? (
        <Section labelledBy="capabilities-title" hairline={!project.audiences?.length}>
          <SectionIntro id="capabilities-title" title={project.capabilitiesTitle || 'What it does'} />
          <Grid items={project.capabilities} />
        </Section>
      ) : null}

      {project.figures?.length ? (
        <Section label="Key figures" spacing="compact" hairline>
          <dl className="grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {project.figures.map((f) => (
              <div key={f.label} className="border-l border-line pl-5">
                <dt className="sr-only">{f.label}</dt>
                <dd className="text-stat text-ink">{f.value}</dd>
                <dd className="mt-2 text-small text-ink-muted">{f.label}</dd>
                {f.source ? (
                  <dd className="mt-1 text-data text-ink-subtle">
                    {/^https?:\/\//.test(f.source) ? (
                      <a href={f.source} target="_blank" rel="noopener" className="underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                        Source
                      </a>
                    ) : (
                      f.source
                    )}
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {commands.length || project.install?.intro ? (
        <Section labelledBy="install-title" hairline>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="min-w-0 lg:col-span-5">
              <SectionIntro id="install-title" title={project.install?.title || 'Run it yourself.'}>
                {project.install?.intro ? <p>{project.install.intro}</p> : null}
              </SectionIntro>
              {project.install?.note ? <p className="mt-5 max-w-[52ch] text-small text-ink-muted">{project.install.note}</p> : null}
            </div>
            {commands.length ? (
              <div className="min-w-0 lg:col-span-7">
                <Terminal title={`Install ${project.name}`} commands={commands} />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {project.engineeringNotes?.length ? (
        <Section labelledBy="notes-title" hairline>
          <SectionIntro id="notes-title" title="Engineering notes">
            <p>The decisions behind it, and what they cost.</p>
          </SectionIntro>
          <ol className="mt-10 max-w-4xl border-b border-line">
            {project.engineeringNotes.map((n) => (
              <li key={n.title} className="grid gap-3 border-t border-line py-7 md:grid-cols-12 md:gap-8">
                <h3 className="text-h4 text-ink md:col-span-4">{n.title}</h3>
                <p className="text-body whitespace-pre-line text-ink-muted md:col-span-8">{n.body}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {project.faq?.length ? <PageFaq items={project.faq.map((f) => ({ q: f.q, a: f.a }))} /> : null}

      {articles.length || videos.length || project.officialUrl ? (
        <Section labelledBy="related-title" spacing="compact">
          <Heading level={2} size="h3" id="related-title">
            More on {project.name}
          </Heading>
          {articles.length ? (
            <ul className="mt-6 border-b border-line">
              {articles.map((a) => (
                <ArticleRow key={a.id} article={a} />
              ))}
            </ul>
          ) : null}
          {videos.length ? (
            <ul className="mt-8 grid gap-8 md:grid-cols-3">
              {videos.map((v) => (
                <li key={v.id}>
                  <VideoCard video={v} />
                </li>
              ))}
            </ul>
          ) : null}
          {project.officialUrl ? (
            <p className="mt-8 text-body">
              <TrackedLink
                href={project.officialUrl}
                className="inline-flex items-center gap-1.5 font-medium text-ink underline decoration-accent decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current"
              >
                {project.officialLabel || `${project.name} at ${hostOf(project.officialUrl)}`}
                <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.75} />
              </TrackedLink>
            </p>
          ) : null}
        </Section>
      ) : null}

      <Section labelledBy="cta-title" hairline spacing="compact">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Heading level={2} size="h3" id="cta-title">
              {project.github ? `${project.name} is on GitHub.` : `Questions about ${project.name}?`}
            </Heading>
            <p className="mt-2 max-w-[52ch] text-body text-ink-muted">
              {project.github
                ? 'Issues and pull requests are welcome. For anything else, LinkedIn reaches me fastest.'
                : 'LinkedIn reaches me fastest.'}
            </p>
          </div>
          <CtaPair primary={primary ?? CTAS.linkedin} secondary={primary ? CTAS.linkedin : null} size="md" location="work_footer" />
        </div>
      </Section>

      <JsonLd
        data={[
          webPageJsonLd({
            path,
            type: 'ItemPage',
            name: project.name,
            description: project.description,
            mainEntity: softwareNode ? ref(ids.software(project.slug)) : ref(ids.vouch()),
            about: softwareNode ? ref(ids.software(project.slug)) : ref(ids.vouch()),
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Work', path: '/work' },
            { name: project.name, path },
          ]),
          ...(softwareNode ? [softwareNode] : [{ ...vouchOrganizationJsonLd(), description: project.description, sameAs: [SITE.links.vouch] }]),
        ]}
      />
    </>
  )
}
