'use client'

import * as m from 'motion/react-m'
import { useRef, type SVGProps } from 'react'
import { useEntrance } from './useEntrance'

export type DrawPathProps = Omit<
  SVGProps<SVGPathElement>,
  'ref' | 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationEnd' | 'values'
> & {
  d: string
  /** Seconds before drawing starts, for sequencing several paths. */
  delay?: number
  /** Seconds. Spec: 0.9. */
  duration?: number
}

/**
 * An SVG path that draws its stroke when 30% of it is in view (900ms). Server
 * HTML shows the full path, so diagrams read without JS or with reduced motion.
 * Use inside your own <svg>:
 *   <svg viewBox="0 0 400 100"><DrawPath d="M0 50H400" stroke="currentColor" strokeWidth={2} /></svg>
 */
export function DrawPath({ d, delay = 0, duration = 0.9, fill = 'none', ...props }: DrawPathProps) {
  const ref = useRef<SVGPathElement>(null)
  const controls = useEntrance(ref, { amount: 0.3 })
  return (
    <m.path
      ref={ref}
      d={d}
      fill={fill}
      initial={false}
      animate={controls}
      variants={{
        hidden: { pathLength: 0, opacity: 0, transition: { duration: 0 } },
        shown: {
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration, ease: [0.65, 0, 0.35, 1], delay }, opacity: { duration: 0.01, delay } },
        },
      }}
      {...(props as object)}
    />
  )
}
