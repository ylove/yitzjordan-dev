import type { ReactNode } from 'react'
import { cn } from '@/components/ui/cn'

export type Step = { title: string; body: string }

/** "How it works": numbered cards, each with an optional drawing above it. */
export function Steps({ steps, arts }: { steps: Step[]; arts?: Array<(delay: number) => ReactNode> }) {
  const cols = steps.length >= 4 ? 'lg:grid-cols-4' : steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
  return (
    <ol className={cn('grid gap-4 sm:grid-cols-2', cols)}>
      {steps.map((s, i) => {
        const art = arts?.[i]
        return (
          <li key={s.title} className="flex flex-col rounded-card border border-line bg-surface-raised">
            {art ? (
              <div className="border-b border-line px-4 pt-4">
                <svg viewBox="0 0 200 160" aria-hidden className="mx-auto w-full max-w-[240px]">
                  {art(i * 0.45)}
                </svg>
              </div>
            ) : null}
            <div className="p-5">
              <p className="font-mono text-[0.75rem] text-ink-subtle">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-1 text-h4 text-ink">{s.title}</h3>
              <p className="mt-2 text-small text-ink-muted">{s.body}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
