import type { ReactNode } from 'react'
import type { VisualKey } from './keys'
import { ROUNDTABLE_ARTS } from './RoundtableArt'

/**
 * Step drawings per visual key. A project page draws arts[i] above step i of "How it works".
 * Keys without drawings yet render the steps as plain numbered cards.
 */
export const VISUAL_ARTS: Partial<Record<VisualKey, Array<(delay: number) => ReactNode>>> = {
  roundtable: ROUNDTABLE_ARTS,
}
