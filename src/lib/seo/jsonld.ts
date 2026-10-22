/**
 * schema.org JSON-LD builders.
 *
 * Builders return bare nodes without "@context". Render them with <JsonLd data={...} />, which
 * adds the context and wraps arrays in an "@graph".
 *
 * The entity at the center is the Person `https://yitzjordan.dev/#person`. Rules (docs/seo.md):
 * - sameAs lists only professional profiles (LinkedIn, GitHub), from the Profile global.
 *   No encyclopedia sameAs, alternateName, birthDate or birthPlace for the person.
 * - Employers named in the graph: Vouch Networks (worksFor, founder), Charter and Quartz
 *   (alumniOf). Nothing else.
 * - homeLocation: New York first, Columbus second.
 * - Every "@id" reference resolves on the page that emits it: the layout renders the WebSite,
 *   the Person and a Vouch Networks Organization stub on every page.
 *   `node scripts/check-jsonld.mjs` checks this against a running build.
 */
import type { Article, Profile, Project, Skill, Video } from '@/payload-types'
import { SAME_AS, SITE, VOUCH_ORG_ID, articlePath } from '@/content/site'
import { absoluteUrl, getSiteUrl } from './site-url'

export type JsonLdNode = { '@type': string | string[]; [key: string]: unknown }
export type JsonLdRef = { '@id': string }

export { VOUCH_ORG_ID }

export const ids = {
  person: () => `${getSiteUrl()}/#person`,
  website: () => `${getSiteUrl()}/#website`,
  vouch: () => VOUCH_ORG_ID,
  webpage: (path: string) => `${absoluteUrl(path)}#webpage`,
  breadcrumb: (path: string) => `${absoluteUrl(path)}#breadcrumb`,
  article: (path: string) => `${absoluteUrl(path)}#article`,
  software: (slug: string) => `${absoluteUrl(`/work/${slug}`)}#software`,
  video: (slug: string) => `${absoluteUrl(`/videos/${slug}`)}#video`,
  profilePage: () => `${absoluteUrl('/about')}#profilepage`,
  dataset: (path: string) => `${absoluteUrl(path)}#dataset`,
}

export const ref = (id: string): JsonLdRef => ({ '@id': id })
const personRef = () => ref(ids.person())

const wikidata = (id: string | null | undefined) => (id ? `https://www.wikidata.org/wiki/${id}` : undefined)

const compact = <T extends Record<string, unknown>>(node: T): T =>
  Object.fromEntries(Object.entries(node).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))) as T

/* -------------------------------------------------------------------------- */
/* Site-wide nodes                                                             */
/* -------------------------------------------------------------------------- */

export function websiteJsonLd(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': ids.website(),
    url: `${getSiteUrl()}/`,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.language,
    author: personRef(),
    publisher: personRef(),
  }
}

/**
 * Vouch Networks, as referenced from this site. The full Organization lives on
 * vouchnetworks.org under the same "@id"; this stub carries enough to stand alone and to say
 * who founded it.
 */
export function vouchOrganizationJsonLd(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ids.vouch(),
    name: 'Vouch Networks',
    url: SITE.links.vouch,
    description: 'Vouch Networks builds community safety apps.',
    founder: personRef(),
    sameAs: [SITE.links.vouch],
  }
}

type Experience = NonNullable<Profile['experience']>[number]

function orgFromExperience(e: Experience): JsonLdNode | JsonLdRef | null {
  if (e.display !== 'named' || !e.orgName) return null
  if (e.orgId) return ref(e.orgId)
  return compact({
    '@type': 'Organization',
    name: e.orgName,
    url: e.orgUrl ?? undefined,
    sameAs: wikidata(e.orgWikidataId),
  })
}

function knowsAboutFrom(skills: Skill[]): JsonLdNode[] {
  return skills
    .filter((s) => s.knowsAbout)
    .map((s) => compact({ '@type': 'Thing', name: s.name, sameAs: wikidata(s.wikidataId) }))
}

/** The Person. `full` adds background, skills and languages (home page and /about). */
export function personJsonLd(
  profile: Profile | null,
  options: { full?: boolean; skills?: Skill[]; imageUrl?: string | null; onProfilePage?: boolean } = {},
): JsonLdNode {
  const sameAs = profile?.sameAs?.map((s) => s.url).filter(Boolean) ?? [...SAME_AS]
  const base: JsonLdNode = compact({
    '@type': 'Person',
    '@id': ids.person(),
    name: profile?.name ?? SITE.name,
    givenName: profile?.givenName ?? undefined,
    familyName: profile?.familyName ?? undefined,
    url: `${getSiteUrl()}/`,
    jobTitle: profile?.jobTitles?.length ? profile.jobTitles : undefined,
    description: profile?.summary ?? SITE.description,
    image: options.imageUrl ? absoluteUrl(options.imageUrl) : undefined,
    worksFor: ref(ids.vouch()),
    sameAs: sameAs.length ? sameAs : undefined,
  })
  if (!options.full || !profile) return base

  const past = (profile.experience ?? [])
    .filter((e) => e.schemaRole === 'alumniOf')
    .map(orgFromExperience)
    .filter((n): n is JsonLdNode | JsonLdRef => Boolean(n))
  const schools = (profile.education ?? []).map((e) =>
    compact({
      '@type': 'CollegeOrUniversity',
      name: e.name,
      url: e.url ?? undefined,
      sameAs: wikidata(e.wikidataId),
    }),
  )
  const places = (profile.locations ?? []).map((l) =>
    compact({
      '@type': 'City',
      name: [l.city, l.region].filter(Boolean).join(', '),
      sameAs: wikidata(l.wikidataId),
    }),
  )

  return compact({
    ...base,
    mainEntityOfPage: options.onProfilePage ? ref(ids.profilePage()) : undefined,
    alumniOf: [...past, ...schools],
    homeLocation: places,
    hasOccupation: (profile.jobTitles ?? []).map((name) =>
      compact({
        '@type': 'Occupation',
        name,
        occupationalCategory: '15-1252.00 Software Developers',
        occupationLocation: places.length ? places : undefined,
      }),
    ),
    knowsAbout: knowsAboutFrom(options.skills ?? []),
    knowsLanguage: (profile.languages ?? []).map((l) => ({ '@type': 'Language', name: l.name, alternateName: l.code })),
  })
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                       */
/* -------------------------------------------------------------------------- */

export type WebPageInput = {
  path: string
  name: string
  description?: string
  /** WebPage subtype, for example "CollectionPage", "ItemPage", "AboutPage". */
  type?: string
  mainEntity?: JsonLdRef | JsonLdNode
  about?: JsonLdRef | JsonLdRef[]
  dateModified?: string
  breadcrumb?: boolean
}

export function webPageJsonLd(input: WebPageInput): JsonLdNode {
  const { path, breadcrumb = path !== '/' } = input
  return compact({
    '@type': input.type ?? 'WebPage',
    '@id': ids.webpage(path),
    url: absoluteUrl(path),
    name: input.name,
    description: input.description,
    inLanguage: SITE.language,
    isPartOf: ref(ids.website()),
    about: input.about ?? personRef(),
    author: personRef(),
    mainEntity: input.mainEntity,
    breadcrumb: breadcrumb ? ref(ids.breadcrumb(path)) : undefined,
    dateModified: input.dateModified,
  })
}

/** /about: a ProfilePage whose main entity is the Person (Google profile-page rich result). */
export function profilePageJsonLd(profile: Profile | null): JsonLdNode {
  return compact({
    '@type': 'ProfilePage',
    '@id': ids.profilePage(),
    url: absoluteUrl('/about'),
    name: `About ${profile?.name ?? SITE.name}`,
    inLanguage: SITE.language,
    isPartOf: ref(ids.website()),
    mainEntity: personRef(),
    about: personRef(),
    breadcrumb: ref(ids.breadcrumb('/about')),
    dateModified: profile?.updatedAt ?? undefined,
  })
}

export type BreadcrumbItem = { name: string; path: string }

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdNode {
  const last = items[items.length - 1]
  return {
    '@type': 'BreadcrumbList',
    ...(last ? { '@id': ids.breadcrumb(last.path) } : {}),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export type FaqItem = { question: string; answer: string }

/** FAQ. Answers are plain text and must match what the page shows. */
export function faqJsonLd(items: FaqItem[]): JsonLdNode {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** An ItemList of nodes already defined on the page (or of plain URLs). */
export function itemListJsonLd(items: Array<{ id?: string; url: string; name: string }>): JsonLdNode {
  return {
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...(item.id ? { item: ref(item.id) } : { url: absoluteUrl(item.url), name: item.name }),
    })),
  }
}

/* -------------------------------------------------------------------------- */
/* Work                                                                        */
/* -------------------------------------------------------------------------- */

const isVouchUrl = (url: string | null | undefined) => Boolean(url && /^https:\/\/(www\.)?vouchnetworks\.org\//.test(url))

/** A project: SoftwareSourceCode for repos, SoftwareApplication for apps. */
export function projectJsonLd(project: Project): JsonLdNode | null {
  if (project.schemaType === 'organization') return null
  const path = `/work/${project.slug}`
  const sameAs = [project.github, project.homepage, project.officialUrl].filter((u): u is string => Boolean(u))
  const common = compact({
    '@id': ids.software(project.slug),
    name: project.name,
    description: project.description,
    url: absoluteUrl(path),
    mainEntityOfPage: ref(ids.webpage(path)),
    author: personRef(),
    creator: personRef(),
    publisher: isVouchUrl(project.officialUrl) ? ref(ids.vouch()) : personRef(),
    sameAs: sameAs.length ? sameAs : undefined,
    keywords: project.keywords?.length ? project.keywords.join(', ') : undefined,
    creativeWorkStatus: project.statusLabel ?? undefined,
    license: project.license ? `https://spdx.org/licenses/${project.license}.html` : undefined,
  })
  if (project.schemaType === 'application') {
    return compact({
      '@type': 'SoftwareApplication',
      ...common,
      applicationCategory: project.applicationCategory ?? 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: project.status === 'open-source' ? { '@type': 'Offer', price: 0, priceCurrency: 'USD' } : undefined,
    })
  }
  return compact({
    '@type': 'SoftwareSourceCode',
    ...common,
    codeRepository: project.github ?? undefined,
    programmingLanguage: project.language ? { '@type': 'ComputerLanguage', name: project.language } : undefined,
    runtimePlatform: project.language === 'TypeScript' ? 'Node.js' : undefined,
  })
}

/* -------------------------------------------------------------------------- */
/* Writing                                                                     */
/* -------------------------------------------------------------------------- */

export function articleJsonLd(article: Article, options: { imageUrl?: string } = {}): JsonLdNode {
  const path = articlePath(article.kind, article.slug)
  const topics = (article.topics ?? []).filter((t): t is Skill => typeof t === 'object')
  return compact({
    '@type': article.kind === 'blog' ? 'BlogPosting' : 'Article',
    '@id': ids.article(path),
    headline: article.title,
    description: article.excerpt,
    url: absoluteUrl(path),
    mainEntityOfPage: ref(ids.webpage(path)),
    isPartOf: ref(ids.website()),
    datePublished: article.publishDate ?? article.createdAt,
    dateModified: article.updatedDate ?? article.publishDate ?? article.updatedAt,
    author: personRef(),
    publisher: personRef(),
    inLanguage: SITE.language,
    genre: article.kind === 'research' ? 'Research' : undefined,
    keywords: article.keywords?.length ? article.keywords.join(', ') : undefined,
    about: topics.length ? topics.map((t) => compact({ '@type': 'Thing', name: t.name, sameAs: wikidata(t.wikidataId) })) : undefined,
    wordCount: article.wordCount ?? undefined,
    image: options.imageUrl ? absoluteUrl(options.imageUrl) : undefined,
  })
}

/* -------------------------------------------------------------------------- */
/* Video                                                                       */
/* -------------------------------------------------------------------------- */

export function isoDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${r || (!h && !m) ? `${r}S` : ''}`
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function videoJsonLd(video: Video): JsonLdNode {
  const path = `/videos/${video.slug}`
  const file = typeof video.file === 'object' && video.file ? video.file : null
  const thumb = typeof video.thumbnail === 'object' && video.thumbnail?.url ? absoluteUrl(video.thumbnail.url) : null
  return compact({
    '@type': 'VideoObject',
    '@id': ids.video(video.slug),
    name: video.title,
    description: video.description,
    url: absoluteUrl(path),
    mainEntityOfPage: ref(ids.webpage(path)),
    thumbnailUrl: thumb ?? (video.youtubeId ? youtubeThumbnail(video.youtubeId) : undefined),
    uploadDate: video.uploadDate,
    duration: isoDuration(video.durationSeconds),
    embedUrl: video.youtubeId ? `https://www.youtube-nocookie.com/embed/${video.youtubeId}` : undefined,
    contentUrl: file?.url ? absoluteUrl(file.url) : undefined,
    // No sameAs to the platform URL: the VideoObject's identity is this page, and embedUrl is
    // what search engines need (docs/seo.md).
    author: personRef(),
    creator: personRef(),
    publisher: personRef(),
    inLanguage: SITE.language,
    transcript: video.transcript ?? undefined,
  })
}

/* -------------------------------------------------------------------------- */
/* Agents                                                                      */
/* -------------------------------------------------------------------------- */

/** The MCP server and REST API, described on /agents. */
export function webApiJsonLd(): JsonLdNode {
  return {
    '@type': 'WebAPI',
    '@id': `${absoluteUrl('/api/mcp')}#api`,
    name: `${SITE.name} MCP server`,
    description:
      'A read-mostly Model Context Protocol server (Streamable HTTP) with tools for profile, projects, writing, videos, requirement matching and consented introductions. No model runs on the server.',
    url: absoluteUrl('/api/mcp'),
    documentation: absoluteUrl('/AGENTS.md'),
    provider: personRef(),
    termsOfService: absoluteUrl('/privacy'),
  }
}
