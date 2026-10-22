import { revalidatePath } from 'next/cache'
import type { PayloadRequest } from 'payload'

type PathSpec = string | { path: string; type: 'layout' | 'page' }

/**
 * Calls revalidatePath for each path and never throws.
 *
 * Payload hooks also run outside a Next.js request (CLI scripts, migrations, seeding from
 * a script), where revalidatePath throws an invariant error. Those failures are expected and
 * only logged at debug level.
 *
 * Pass `context: { disableRevalidate: true }` to a Payload operation to skip revalidation.
 */
export function safeRevalidate(paths: PathSpec[], req?: PayloadRequest): void {
  if (req?.context?.disableRevalidate) return

  const seen = new Set<string>()
  for (const spec of paths) {
    const { path, type } = typeof spec === 'string' ? { path: spec, type: undefined } : spec
    if (!path) continue
    const key = `${type ?? ''}:${path}`
    if (seen.has(key)) continue
    seen.add(key)

    try {
      if (type) revalidatePath(path, type)
      else revalidatePath(path)
    } catch (err) {
      req?.payload?.logger?.debug?.({
        msg: `revalidatePath skipped for ${path}`,
        err: err instanceof Error ? err.message : String(err),
      })
    }
  }
}
