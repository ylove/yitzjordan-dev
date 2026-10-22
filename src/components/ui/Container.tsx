import type { ElementType, ReactNode } from 'react'
import { cn } from './cn'

export type ContainerProps = {
  className?: string
  children: ReactNode
  /** page: 1216px content (default, matches --container-page). narrow: 880px. measure: ~66ch of text. */
  width?: 'page' | 'narrow' | 'measure'
  as?: ElementType
  id?: string
}

const widths = {
  page: 'max-w-[calc(76rem+2*clamp(1.25rem,5vw,3rem))]',
  narrow: 'max-w-[calc(55rem+2*clamp(1.25rem,5vw,3rem))]',
  measure: 'max-w-[calc(66ch+2*clamp(1.25rem,5vw,3rem))]',
}

/** Centered column: 1216px of content, side padding clamp(20px, 5vw, 48px). */
export function Container({ className, children, width = 'page', as: Tag = 'div', id }: ContainerProps) {
  return (
    <Tag id={id} className={cn('mx-auto w-full px-[clamp(1.25rem,5vw,3rem)]', widths[width], className)}>
      {children}
    </Tag>
  )
}
