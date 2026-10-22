import { TrackedLink } from '@/components/analytics/TrackedLink'
import { formatDate, formatDuration } from '@/lib/format'
import { youtubeThumbnail } from '@/lib/seo/jsonld'
import type { Video } from '@/payload-types'

const KIND_LABELS: Record<Video['kind'], string> = { tutorial: 'Tutorial', demo: 'Demo', talk: 'Talk' }

export function videoPoster(video: Video): string | null {
  if (typeof video.thumbnail === 'object' && video.thumbnail?.url) return video.thumbnail.url
  return video.youtubeId ? youtubeThumbnail(video.youtubeId) : null
}

/** A video in a grid: poster, kind and length, title. */
export function VideoCard({ video, headingLevel = 3 }: { video: Video; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const
  const poster = videoPoster(video)
  return (
    <TrackedLink href={`/videos/${video.slug}`} className="group/video block">
      <div className="relative aspect-video overflow-hidden rounded-card border border-line bg-ink-950">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote thumbnail
          <img
            src={poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover/video:scale-[1.02] motion-reduce:transition-none"
          />
        ) : null}
        <span className="text-data absolute right-2 bottom-2 rounded-[4px] bg-ink-950/85 px-1.5 py-0.5 text-paper-100">
          {formatDuration(video.durationSeconds)}
        </span>
      </div>
      <p className="mt-4 text-data text-ink-subtle">
        {KIND_LABELS[video.kind]} · <time dateTime={video.uploadDate}>{formatDate(video.uploadDate)}</time>
      </p>
      <H className="mt-1.5 text-h4 text-ink group-hover/video:underline group-hover/video:decoration-accent group-hover/video:underline-offset-4">
        {video.title}
      </H>
    </TrackedLink>
  )
}
