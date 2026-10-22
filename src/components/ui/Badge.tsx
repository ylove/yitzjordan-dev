import type { ReactNode } from 'react'
import { STATUS_LABELS, type ProjectStatus } from '@/content/site'
import { cn } from './cn'

export type BadgeProps = {
  /** Project status. Sets the indicator: a cobalt dot, a hollow ring or a code dot. */
  status?: ProjectStatus | null
  /** Label text. Defaults to STATUS_LABELS[status]. */
  children?: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

function Indicator({ status }: { status?: ProjectStatus | null }) {
  if (!status) return null
  if (status === 'available') {
    return <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
  }
  if (status === 'in-development') {
    return <span aria-hidden className="size-1.5 shrink-0 rounded-full border border-ink-subtle" />
  }
  if (status === 'archived') {
    return <span aria-hidden className="h-px w-2 shrink-0 bg-ink-subtle" />
  }
  return <span aria-hidden className="size-1.5 shrink-0 rounded-[1px] bg-ink-subtle" />
}

/**
 * Honest status only: "Open source", "In development", "Release candidate". Never a decorative
 * label above a heading.
 *   <Badge status={project.status}>{project.statusLabel}</Badge>
 */
export function Badge({ status, children, size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-[5px] border border-line font-sans font-medium text-ink-muted',
        size === 'sm' ? 'px-1.5 py-0.5 text-[0.75rem] leading-4' : 'px-2 py-1 text-[0.8125rem] leading-4',
        className,
      )}
    >
      <Indicator status={status} />
      <span className="truncate">{children ?? (status ? STATUS_LABELS[status] : null)}</span>
    </span>
  )
}
