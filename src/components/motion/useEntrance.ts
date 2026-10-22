'use client'

import { useAnimationControls, useReducedMotion } from 'motion/react'
import { useEffect, type RefObject } from 'react'

export const EASE_REVEAL = [0.22, 1, 0.36, 1] as const

/**
 * Progressive-enhancement entrance.
 *
 * The server renders content in its final, visible state, so it reads fine
 * with no JS, slow JS or failed JS. After hydration, and only when motion is
 * allowed, an element that is still below the fold is set to `hidden` and
 * animated to `shown` once it scrolls into view. Elements already on screen at
 * hydration are left alone, so nothing above the fold ever blinks.
 *
 * Use with an `m.*` element: animate={controls} initial={false} and variants
 * that define `hidden` and `shown`.
 */
export function useEntrance(ref: RefObject<Element | null>, { amount = 0.2, once = true } = {}) {
  const controls = useAnimationControls()
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduce || typeof IntersectionObserver === 'undefined') return
    const rect = el.getBoundingClientRect()
    const onScreen = rect.top < window.innerHeight && rect.bottom > 0
    if (onScreen) return

    controls.set('hidden')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          void controls.start('shown')
          if (once) io.disconnect()
        }
      },
      { threshold: amount },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, controls, reduce, amount, once])

  return controls
}
