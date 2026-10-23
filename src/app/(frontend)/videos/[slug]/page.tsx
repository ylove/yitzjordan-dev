import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { ProjectCard } from '@/components/pages/work/ProjectCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { LiteEmbed } from '@/components/video/LiteEmbed'
import { videoPoster } from '@/components/video/VideoCard'
import { getSitemapEntries, getVideoBySlug, mediaOf, populated } from '@/lib/cms'
import { formatDate, formatDuration } from '@/lib/format'
import { breadcrumbJsonLd, ids, ref, videoJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'
import type { Project } from '@/payload-types'
import { typeset } from '@/components/ui/typeset'

export const revalidate = 3600

type Params = { params: Promise<{ slug: string }> }

const PLATFORM_LABELS = { youtube: 'YouTube', upload: 'the original post', linkedin: 'LinkedIn', x: 'X', other: 'the original post' } as const

export async function generateStaticParams() {
  const { videos } = await getSitemapEntries()
  return videos.map((v) => ({ slug: v.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const video = await getVideoBySlug(slug)
  if (!video) return {}
  const poster = videoPoster(video)
  return pageMetadata({
    title: video.meta?.title?.replace(/ \| Yitz Jordan$/, '') || video.title,
    description: video.meta?.description || video.description,
    path: `/videos/${video.slug}`,
    ...(poster ? { image: { url: poster, alt: video.title } } : {}),
  })
}

export default async function VideoPage({ params }: Params) {
  const { slug } = await params
  const video = await getVideoBySlug(slug)
  if (!video) notFound()
  const path = `/videos/${video.slug}`
  const file = mediaOf(video.file)
  const poster = videoPoster(video)
  const projects = populated<Project>(video.relatedProjects)

  return (
    <article aria-labelledby="page-title">
      <Container className="pt-12 pb-20 md:pt-16 md:pb-28">
        <TrackedLink href="/videos" className="text-small text-ink-muted hover:text-ink">
          Videos
        </TrackedLink>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-10">
          <div className={video.vertical ? 'lg:col-span-5' : 'lg:col-span-8'}>
            {video.youtubeId ? (
              <LiteEmbed youtubeId={video.youtubeId} title={video.title} thumbnail={poster} vertical={video.vertical ?? false} />
            ) : file ? (
              <video
                controls
                preload="none"
                poster={poster ?? undefined}
                className={video.vertical ? 'mx-auto aspect-[9/16] max-w-sm rounded-card border border-line bg-ink-950' : 'aspect-video w-full rounded-card border border-line bg-ink-950'}
              >
                <source src={file.url} type="video/mp4" />
              </video>
            ) : null}
          </div>
          <div className={video.vertical ? 'lg:col-span-7' : 'lg:col-span-4'}>
            <h1 id="page-title" className="text-h2 text-ink">
              {typeset(video.title)}
            </h1>
            <p className="mt-4 text-data text-ink-subtle">
              <time dateTime={video.uploadDate}>{formatDate(video.uploadDate)}</time>
              <span aria-hidden> · </span>
              {formatDuration(video.durationSeconds)}
            </p>
            <p className="mt-5 text-body whitespace-pre-line text-ink-muted">{video.description}</p>
            <p className="mt-6">
              <TrackedLink
                href={video.url}
                className="inline-flex items-center gap-1.5 text-small font-medium text-ink underline decoration-accent decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current"
              >
                Watch on {PLATFORM_LABELS[video.platform]}
                <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.75} />
              </TrackedLink>
            </p>
          </div>
        </div>

        {video.transcript ? (
          <details className="mt-12 max-w-3xl border-t border-line pt-6">
            <summary className="cursor-pointer text-h4 text-ink">Transcript</summary>
            <p className="mt-4 text-body whitespace-pre-line text-ink-muted">{video.transcript}</p>
          </details>
        ) : null}

        {projects.length ? (
          <section aria-labelledby="related-work" className="mt-16 border-t border-line pt-10">
            <h2 id="related-work" className="text-h3 text-ink">
              Related work
            </h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
      <JsonLd
        data={[
          webPageJsonLd({ path, name: video.title, description: video.description, mainEntity: ref(ids.video(video.slug)) }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Videos', path: '/videos' },
            { name: video.title, path },
          ]),
          videoJsonLd(video),
        ]}
      />
    </article>
  )
}
