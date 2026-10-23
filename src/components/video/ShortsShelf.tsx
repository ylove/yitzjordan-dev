'use client'

import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { cn } from '@/components/ui/cn'
import { typeset } from '@/components/ui/typeset'

export type ShortItem = {
  slug: string
  title: string
  youtubeId: string
  poster: string
  /** "1:43" */
  duration: string
  kindLabel: string
  /** Formatted upload date, and its ISO value. */
  date: string
  dateTime: string
  description?: string
  watchUrl: string
}

/**
 * A row (or grid) of vertical videos that play in a full-screen player without leaving the page.
 * Each card is a real link to the video's page, so it works without JavaScript and with
 * modifier-clicks; a plain click opens the player instead. The player loads YouTube (privacy
 * mode) only when it opens, and moves through the set with the arrows or the arrow keys.
 */
export function ShortsShelf({
  items,
  layout = 'row',
  headingLevel = 3,
  className,
}: {
  items: ShortItem[]
  /** row: one scrolling row on small screens, all in one row from lg. grid: wraps. */
  layout?: 'row' | 'grid'
  headingLevel?: 2 | 3
  className?: string
}) {
  const [index, setIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const H = `h${headingLevel}` as const
  const current = index === null ? null : items[index]

  const close = useCallback(() => setIndex(null), [])
  const step = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)), [items.length])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (index !== null && !dialog.open) {
      dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
    }
    if (index === null && dialog.open) dialog.close()
  }, [index])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, step])

  const onCardClick = (event: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setIndex(i)
  }

  if (!items.length) return null

  return (
    <>
      <ul
        className={cn(
          layout === 'row'
            ? '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0'
            : 'grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6',
          className,
        )}
      >
        {items.map((item, i) => (
          <li key={item.slug} className={cn(layout === 'row' && 'w-[62vw] shrink-0 snap-start sm:w-[38vw] lg:w-auto')}>
            <a href={`/videos/${item.slug}`} onClick={(e) => onCardClick(e, i)} className="group/short block">
              <div className="relative aspect-[9/16] overflow-hidden rounded-card border border-line bg-ink-950">
                <Image
                  src={item.poster}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 15rem, (min-width: 640px) 38vw, 62vw"
                  className="object-cover opacity-95 transition-transform duration-300 group-hover/short:scale-[1.03] motion-reduce:transition-none"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-14 place-items-center rounded-full bg-paper-50/95 text-ink-950 shadow-popover transition-transform group-hover/short:scale-110 motion-reduce:transition-none">
                    <Play aria-hidden className="ml-0.5 size-5" strokeWidth={2} fill="currentColor" />
                  </span>
                </span>
                <span className="text-data absolute right-2 bottom-2 rounded-[4px] bg-ink-950/85 px-1.5 py-0.5 text-paper-100">{item.duration}</span>
              </div>
              <p className="mt-3 text-data text-ink-subtle">
                {item.kindLabel} · <time dateTime={item.dateTime}>{item.date}</time>
              </p>
              <H className="mt-1 text-h4 text-pretty text-ink group-hover/short:underline group-hover/short:decoration-accent group-hover/short:underline-offset-4">
                {item.title}
              </H>
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current ? current.title : 'Video player'}
        onClose={() => {
          document.documentElement.style.overflow = ''
          setIndex(null)
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-ink-950/95 p-0 text-paper-100 backdrop:bg-ink-950/60"
      >
        {current ? (
          <div className="mx-auto flex min-h-full max-w-6xl flex-col px-4 pt-4 pb-10 md:px-8 md:pt-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={close}
                className="grid size-11 place-items-center rounded-control text-paper-100 hover:bg-paper-50/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-300"
              >
                <X aria-hidden className="size-6" strokeWidth={1.75} />
                <span className="sr-only">Close player</span>
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-6 lg:flex-row lg:gap-10">
              <div className="flex items-center gap-2 md:gap-4">
                <StepButton direction="previous" onClick={() => step(-1)} />
                <div
                  className="relative aspect-[9/16] overflow-hidden rounded-card bg-black"
                  style={{ height: 'min(76dvh, calc((100vw - 7.5rem) * 16 / 9))' }}
                >
                  <iframe
                    key={current.youtubeId}
                    src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                    title={current.title}
                    className="absolute inset-0 size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <StepButton direction="next" onClick={() => step(1)} />
              </div>
              <div className="w-full max-w-md lg:w-80">
                <p className="text-data text-paper-300">
                  {current.kindLabel} · {current.duration} · <time dateTime={current.dateTime}>{current.date}</time>
                </p>
                <p className="mt-2 text-h3 text-paper-50">{typeset(current.title)}</p>
                {current.description ? <p className="mt-3 text-body text-paper-300">{current.description}</p> : null}
                <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-small">
                  <a href={`/videos/${current.slug}`} className="font-medium text-paper-50 underline decoration-cobalt-300 decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current">
                    Video page
                  </a>
                  <a
                    href={current.watchUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 font-medium text-paper-50 underline decoration-cobalt-300 decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current"
                  >
                    Watch on YouTube
                    <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.75} />
                  </a>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  )
}

function StepButton({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-paper-50/25 text-paper-100 hover:bg-paper-50/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-300"
    >
      <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      <span className="sr-only">{direction === 'previous' ? 'Previous video' : 'Next video'}</span>
    </button>
  )
}
