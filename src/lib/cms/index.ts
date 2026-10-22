/**
 * Server-side CMS read helpers.
 *
 * Every helper catches its own errors, logs them with context and returns a typed fallback
 * (null or []), so a database outage degrades pages instead of failing them. Calls are
 * deduplicated per request with React cache(), so generateMetadata and the page body can both
 * call the same helper without a second query.
 *
 * Server only. Do not import from client components.
 */
import { cache } from 'react'
import { getPayload, type Payload, type Where } from 'payload'
import config from '@payload-config'
import type { Article, Evidence, Media, Profile, Project, Skill, Video } from '@/payload-types'

export type { Article, Evidence, Media, Profile, Project, Skill, Video }

const loggedScopes = new Set<string>()

function logCmsError(scope: string, err: unknown, context?: Record<string, unknown>) {
  const message = err instanceof Error ? err.message : String(err)
  const ctx = context ? ` ${JSON.stringify(context)}` : ''
  if (!loggedScopes.has(scope)) {
    loggedScopes.add(scope)
    console.error(`[cms] ${scope} failed${ctx}:`, err)
  } else {
    console.error(`[cms] ${scope} failed${ctx}: ${message}`)
  }
}

/** True when a database is configured at all. Without one, helpers skip straight to fallbacks. */
export function isCmsConfigured(): boolean {
  return Boolean(process.env.DATABASE_URI || process.env.DATABASE_URL)
}

/** The shared Payload instance. Throws when the CMS is unavailable; prefer the helpers below. */
export async function getPayloadClient(): Promise<Payload> {
  if (!isCmsConfigured()) throw new Error('DATABASE_URI is not set')
  return getPayload({ config })
}

async function withFallback<T>(
  scope: string,
  fallback: T,
  run: (payload: Payload) => Promise<T>,
  context?: Record<string, unknown>,
): Promise<T> {
  if (!isCmsConfigured()) return fallback
  try {
    const payload = await getPayloadClient()
    return await run(payload)
  } catch (err) {
    logCmsError(scope, err, context)
    return fallback
  }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const getProfile = cache(
  async (): Promise<Profile | null> =>
    withFallback('getProfile', null as Profile | null, (payload) => payload.findGlobal({ slug: 'profile', depth: 1 })),
)

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

const published: Where = { status: { equals: 'published' } }

export type GetArticlesOptions = { kind?: 'research' | 'blog'; limit?: number; excludeSlug?: string }

/** Published articles, newest first. */
export const getArticles = cache(
  async ({ kind, limit = 100, excludeSlug }: GetArticlesOptions = {}): Promise<Article[]> =>
    withFallback(
      'getArticles',
      [] as Article[],
      async (payload) => {
        const where: Where[] = [published]
        if (kind) where.push({ kind: { equals: kind } })
        if (excludeSlug) where.push({ slug: { not_equals: excludeSlug } })
        const result = await payload.find({
          collection: 'articles',
          where: { and: where },
          sort: '-publishDate',
          limit,
          depth: 0,
          overrideAccess: false,
          select: { body: false },
        })
        return result.docs as Article[]
      },
      { kind, limit, excludeSlug },
    ),
)

/** Every published article with its body, for llms-full.txt and the feed. */
export const getArticlesWithBody = cache(
  async (): Promise<Article[]> =>
    withFallback('getArticlesWithBody', [] as Article[], async (payload) => {
      const result = await payload.find({
        collection: 'articles',
        where: published,
        sort: '-publishDate',
        limit: 500,
        depth: 0,
        overrideAccess: false,
      })
      return result.docs
    }),
)

export const getArticleBySlug = cache(
  async (slug: string): Promise<Article | null> =>
    withFallback(
      'getArticleBySlug',
      null as Article | null,
      async (payload) => {
        const result = await payload.find({
          collection: 'articles',
          where: { and: [{ slug: { equals: slug } }, published] },
          limit: 1,
          depth: 1,
          overrideAccess: false,
        })
        return result.docs[0] ?? null
      },
      { slug },
    ),
)

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const getProjects = cache(
  async ({ featured }: { featured?: boolean } = {}): Promise<Project[]> =>
    withFallback(
      'getProjects',
      [] as Project[],
      async (payload) => {
        const result = await payload.find({
          collection: 'projects',
          where: featured ? { featured: { equals: true } } : undefined,
          sort: 'order',
          limit: 100,
          depth: 0,
          overrideAccess: false,
        })
        return result.docs
      },
      { featured },
    ),
)

export const getProjectBySlug = cache(
  async (slug: string): Promise<Project | null> =>
    withFallback(
      'getProjectBySlug',
      null as Project | null,
      async (payload) => {
        const result = await payload.find({
          collection: 'projects',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
          overrideAccess: false,
        })
        return result.docs[0] ?? null
      },
      { slug },
    ),
)

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export const getVideos = cache(
  async ({ featured, limit = 100 }: { featured?: boolean; limit?: number } = {}): Promise<Video[]> =>
    withFallback(
      'getVideos',
      [] as Video[],
      async (payload) => {
        const result = await payload.find({
          collection: 'videos',
          where: featured ? { featured: { equals: true } } : undefined,
          sort: '-uploadDate',
          limit,
          depth: 1,
          overrideAccess: false,
        })
        return result.docs
      },
      { featured, limit },
    ),
)

export const getVideoBySlug = cache(
  async (slug: string): Promise<Video | null> =>
    withFallback(
      'getVideoBySlug',
      null as Video | null,
      async (payload) => {
        const result = await payload.find({
          collection: 'videos',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
          overrideAccess: false,
        })
        return result.docs[0] ?? null
      },
      { slug },
    ),
)

// ---------------------------------------------------------------------------
// Skills and evidence (the evidence catalog)
// ---------------------------------------------------------------------------

export const getSkills = cache(
  async (): Promise<Skill[]> =>
    withFallback('getSkills', [] as Skill[], async (payload) => {
      const result = await payload.find({ collection: 'skills', limit: 500, depth: 0, sort: 'name', overrideAccess: false })
      return result.docs
    }),
)

/** Public evidence with skills and proof populated. */
export const getEvidence = cache(
  async (): Promise<Evidence[]> =>
    withFallback('getEvidence', [] as Evidence[], async (payload) => {
      const result = await payload.find({
        collection: 'evidence',
        where: { public: { equals: true } },
        limit: 1000,
        depth: 1,
        sort: '-weight',
        overrideAccess: false,
      })
      return result.docs
    }),
)

// ---------------------------------------------------------------------------
// Entries for the sitemap and static params
// ---------------------------------------------------------------------------

export type ContentEntry = { slug: string; updatedAt: string; kind?: string | null }

export const getSitemapEntries = cache(
  async (): Promise<{ articles: ContentEntry[]; projects: ContentEntry[]; videos: ContentEntry[] }> =>
    withFallback('getSitemapEntries', { articles: [], projects: [], videos: [] }, async (payload) => {
      const [articles, projects, videos] = await Promise.all([
        payload.find({
          collection: 'articles',
          where: published,
          select: { slug: true, updatedAt: true, kind: true },
          limit: 1000,
          depth: 0,
          pagination: false,
          overrideAccess: false,
        }),
        payload.find({ collection: 'projects', select: { slug: true, updatedAt: true }, limit: 1000, depth: 0, pagination: false, overrideAccess: false }),
        payload.find({ collection: 'videos', select: { slug: true, updatedAt: true }, limit: 1000, depth: 0, pagination: false, overrideAccess: false }),
      ])
      return {
        articles: articles.docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt, kind: d.kind })),
        projects: projects.docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
        videos: videos.docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
      }
    }),
)

// ---------------------------------------------------------------------------
// Small helpers for rendering CMS data
// ---------------------------------------------------------------------------

type MediaLike = Media | number | null | undefined

/** Resolve an upload field to `{ url, alt, width, height }`, or null when unset or unpopulated. */
export function mediaOf(field: MediaLike): { url: string; alt: string; width?: number; height?: number } | null {
  if (!field || typeof field === 'number' || !field.url) return null
  return { url: field.url, alt: field.alt ?? '', width: field.width ?? undefined, height: field.height ?? undefined }
}

/** Populated relationship docs only (drops bare ids). */
export function populated<T extends { id: number }>(items: (number | T)[] | null | undefined): T[] {
  return (items ?? []).filter((i): i is T => typeof i === 'object' && i !== null)
}
