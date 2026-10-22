import { recordRequirementTerms } from './signals'

/** A callback for next/server after(): records requirement terms once the response is sent. */
export function signalsAfter(items: Array<{ term: string; skill?: string }>) {
  return async () => {
    await recordRequirementTerms(items)
  }
}
