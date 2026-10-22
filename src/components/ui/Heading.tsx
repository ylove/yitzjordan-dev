import type { ReactNode } from 'react'
import { cn } from './cn'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingSize = 'display' | 'h1' | 'h2' | 'h3' | 'h4'

export type HeadingProps = {
  /** Document level. One h1 per page; never skip levels. */
  level?: HeadingLevel
  /** Visual size, independent of level. Defaults: 1 -> h1, 2 -> h2, 3 -> h3, 4 to 6 -> h4. */
  size?: HeadingSize
  id?: string
  className?: string
  children: ReactNode
}

const defaultSize: Record<HeadingLevel, HeadingSize> = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h4', 6: 'h4' }

const sizeClass: Record<HeadingSize, string> = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
}

/**
 * Headings in Hubot Sans (h4 and below in Geist). Italics are
 * impossible: the component and the base CSS both force font-style normal.
 *   <Heading level={1} size="display">Yitz Jordan</Heading>
 *   <Heading level={2} id="faq-title">Questions</Heading>
 */
export function Heading({ level = 2, size, id, className, children }: HeadingProps) {
  const Tag = `h${level}` as const
  return (
    <Tag id={id} className={cn(sizeClass[size ?? defaultSize[level]], 'text-ink not-italic text-balance', className)}>
      {children}
    </Tag>
  )
}
