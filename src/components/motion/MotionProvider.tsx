'use client'

import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Loads motion's DOM animation features once for the whole site (LazyMotion +
 * domAnimation keeps the motion JS small) and makes every motion component
 * respect the user's reduced-motion setting. Mounted in (frontend)/layout.tsx.
 * Use `m.*` from 'motion/react-m', never `motion.*` (strict mode enforces it).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
