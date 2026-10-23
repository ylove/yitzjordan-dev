import { formatDate, formatDuration } from '@/lib/format'
import type { Video } from '@/payload-types'
import type { ShortItem } from './ShortsShelf'
import { KIND_LABELS, videoPoster } from './VideoCard'

/** Videos the shelf can play: YouTube ones, mapped to the plain props the client player needs. */
export function toShortItems(videos: Video[]): ShortItem[] {
  return videos.flatMap((v) => {
    const poster = videoPoster(v)
    if (!v.youtubeId || !poster) return []
    return [
      {
        slug: v.slug,
        title: v.title,
        youtubeId: v.youtubeId,
        poster,
        duration: formatDuration(v.durationSeconds),
        kindLabel: KIND_LABELS[v.kind],
        date: formatDate(v.uploadDate),
        dateTime: v.uploadDate,
        description: v.description ?? undefined,
        watchUrl: v.url,
      },
    ]
  })
}
