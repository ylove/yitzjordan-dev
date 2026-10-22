import type { ReactNode } from 'react'
import { cn } from './cn'

export type LeadProps = { children: ReactNode; className?: string; id?: string }

/** The opening paragraph under a headline: 20px, muted ink, 60ch measure. */
export function Lead({ children, className, id }: LeadProps) {
  return (
    <p id={id} className={cn('text-lead max-w-[60ch] text-pretty text-ink-muted', className)}>
      {children}
    </p>
  )
}
