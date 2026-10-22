'use client'

import * as m from 'motion/react-m'
import { Children, isValidElement, useRef, type ReactNode } from 'react'
import { EASE_REVEAL, useEntrance } from './useEntrance'

const TAGS = {
  div: m.div,
  section: m.section,
  article: m.article,
  li: m.li,
  ul: m.ul,
  ol: m.ol,
  p: m.p,
  span: m.span,
  figure: m.figure,
  header: m.header,
} as const

export type RevealTag = keyof typeof TAGS

export type RevealProps = {
  children: ReactNode
  as?: RevealTag
  /** Seconds. Stagger uses 0.06 steps. */
  delay?: number
  /** Rise distance in px. Spec: 16. */
  y?: number
  /** Share of the element that must be visible before it plays. */
  amount?: number
  className?: string
  id?: string
}

/**
 * Reveal: opacity 0 to 1 and y 16px to 0 over 480ms, cubic-bezier(0.22, 1, 0.36, 1),
 * once per element. Content is server-rendered visible; see useEntrance.
 *   <Reveal><Card>...</Card></Reveal>
 *   <Reveal as="li" delay={0.06}>...</Reveal>
 */
export function Reveal({ children, as = 'div', delay = 0, y = 16, amount = 0.2, className, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const controls = useEntrance(ref, { amount })
  const Tag = TAGS[as] as typeof m.div
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      id={id}
      className={className}
      initial={false}
      animate={controls}
      variants={{
        hidden: { opacity: 0, y, transition: { duration: 0 } },
        shown: { opacity: 1, y: 0, transition: { duration: 0.48, ease: EASE_REVEAL, delay } },
      }}
    >
      {children}
    </Tag>
  )
}

export type StaggerProps = {
  children: ReactNode
  /** Element for the wrapper. Children are wrapped in Reveal. Use "ul" with itemAs "li" for lists. */
  as?: 'div' | 'ul' | 'ol'
  itemAs?: RevealTag
  /** Seconds between items. Spec: 0.06. */
  step?: number
  className?: string
  itemClassName?: string
}

/**
 * Reveals each child in turn, 60ms apart, as the group scrolls in.
 *   <Stagger className="grid gap-6 md:grid-cols-3">{cards}</Stagger>
 *   <Stagger as="ul" itemAs="li">{items}</Stagger>
 */
export function Stagger({ children, as = 'div', itemAs, step = 0.06, className, itemClassName }: StaggerProps) {
  const Wrapper = as
  const childTag: RevealTag = itemAs ?? (as === 'div' ? 'div' : 'li')
  const items = Children.toArray(children).filter(Boolean)
  return (
    <Wrapper className={className}>
      {items.map((child, i) => (
        <Reveal key={isValidElement(child) && child.key != null ? child.key : i} as={childTag} delay={i * step} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </Wrapper>
  )
}
