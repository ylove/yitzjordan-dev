import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { Heading } from '@/components/ui/Heading'
import { Lead } from '@/components/ui/Lead'
import { Section } from '@/components/ui/Section'
import { ShortsShelf } from '@/components/video/ShortsShelf'
import { toShortItems } from '@/components/video/short-items'
import { VideoCard } from '@/components/video/VideoCard'
import { getRoute } from '@/content/site'
import { getVideos } from '@/lib/cms'
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { routeMetadata } from '@/lib/seo/metadata'

export const revalidate = 3600

export const metadata: Metadata = routeMetadata('/videos')

export default async function VideosPage() {
  const route = getRoute('/videos')
  const videos = await getVideos()
  const vertical = videos.filter((v) => v.vertical && v.youtubeId)
  const horizontal = videos.filter((v) => !vertical.includes(v))
  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="pt-14 pb-10 md:pt-20">
          <Heading level={1} id="page-title">
            Videos
          </Heading>
          <Lead className="mt-6">
            Short explainers on steering Claude with XML tags, and on what my research into model personas means for
            anyone building or selling with AI agents. Press play to watch, and use the arrows to move through them.
          </Lead>
        </div>
      </Section>
      <Section labelledBy="list-title" spacing="none" className="pb-20 md:pb-28">
        <h2 id="list-title" className="sr-only">
          All videos
        </h2>
        {videos.length ? (
          <>
            <ShortsShelf items={toShortItems(vertical)} layout="grid" headingLevel={3} />
            {horizontal.length ? (
              <ul className="mt-16 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                {horizontal.map((v) => (
                  <li key={v.id}>
                    <VideoCard video={v} />
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="border-t border-line pt-8 text-body text-ink-muted">Nothing here yet.</p>
        )}
      </Section>
      <JsonLd
        data={[
          webPageJsonLd({
            path: '/videos',
            type: 'CollectionPage',
            name: route.title,
            description: route.description,
            mainEntity: itemListJsonLd(videos.map((v) => ({ url: `/videos/${v.slug}`, name: v.title }))),
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Videos', path: '/videos' },
          ]),
        ]}
      />
    </>
  )
}
