'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/components/ui/cn'

/**
 * Click-to-load YouTube player. Shows the thumbnail and a play button; only on click does it load
 * the player from youtube-nocookie.com. Keeps pages fast and sets no YouTube cookies until then.
 */
export function LiteEmbed({
  youtubeId,
  title,
  thumbnail,
  vertical = false,
  className,
}: {
  youtubeId: string
  title: string
  thumbnail?: string | null
  vertical?: boolean
  className?: string
}) {
  const [playing, setPlaying] = useState(false)
  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`
  const poster = thumbnail ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-card border border-line bg-ink-950',
        vertical ? 'mx-auto aspect-[9/16] max-w-sm' : 'aspect-video',
        className,
      )}
    >
      {playing ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group/play absolute inset-0 size-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, sized by the container */}
          <img src={poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover opacity-90" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-paper-50 text-ink-950 shadow-popover transition-transform group-hover/play:scale-105 motion-reduce:transition-none">
              <Play aria-hidden className="ml-0.5 size-6" strokeWidth={2} fill="currentColor" />
            </span>
          </span>
          <span className="sr-only">Play video: {title}</span>
        </button>
      )}
    </div>
  )
}
