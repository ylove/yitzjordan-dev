import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { pingIndexNow } from '../seo/indexnow'
import { safeRevalidate } from './revalidate'

type PublishableDoc = { slug?: string | null; status?: string | null; [key: string]: unknown }

/**
 * Paths a document affects. `pathOf` gives the document's own URL; `lists` are the index pages,
 * feeds and agent files that list it.
 */
export type PathSpec = {
  pathOf: (doc: PublishableDoc) => string | null
  lists: string[]
}

const AGENT_FILES = ['/llms.txt', '/llms-full.txt', '/sitemap.xml', '/feed.xml']

function isLive(doc: PublishableDoc | null | undefined): boolean {
  // Collections without a status field are always live.
  return Boolean(doc) && (doc!.status === undefined || doc!.status === null || doc!.status === 'published')
}

/**
 * afterChange and afterDelete hooks that revalidate the affected pages and ping IndexNow when a
 * live document changes. Draft-only edits touch nothing public.
 */
export function publishHooks(spec: PathSpec): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  const pathsFor = (doc: PublishableDoc, previous?: PublishableDoc | null) => {
    const own = [spec.pathOf(doc), previous ? spec.pathOf(previous) : null].filter((p): p is string => Boolean(p))
    return { own: [...new Set(own)], all: [...new Set([...own, ...spec.lists, '/', ...AGENT_FILES])] }
  }

  return {
    afterChange: ({ doc, previousDoc, req }) => {
      if (!isLive(doc) && !isLive(previousDoc)) return doc
      const { own, all } = pathsFor(doc, previousDoc)
      safeRevalidate(all, req)
      if (!req.context?.disableIndexNow && isLive(doc)) void pingIndexNow([...own, ...spec.lists])
      return doc
    },
    afterDelete: ({ doc, req }) => {
      if (!isLive(doc)) return doc
      safeRevalidate(pathsFor(doc).all, req)
      return doc
    },
  }
}
