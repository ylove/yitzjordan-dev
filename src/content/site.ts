/**
 * Site-wide facts and routes. Code defaults only: the editable profile (bio, roles, experience,
 * links) lives in the Payload Profile global, read through src/lib/cms. Anything here must stay
 * true for years, whatever Yitz's job status is.
 *
 * Relative-import safe: also loaded by the Payload CLI through collections and scripts.
 */

export const SITE = {
  name: 'Yitz Jordan',
  /** One sentence used as the default meta description and in llms.txt. */
  description:
    'Yitz Jordan is a software engineer and the founder of Vouch Networks. He builds web and mobile products in TypeScript and React, and multi-agent AI systems, MCP servers and retrieval tools.',
  locale: 'en_US',
  language: 'en-US',
  links: {
    linkedin: 'https://www.linkedin.com/in/yitzjordan',
    github: 'https://github.com/ylove',
    vouch: 'https://www.vouchnetworks.org',
    vouchAbout: 'https://www.vouchnetworks.org/about',
  },
} as const

/** The Vouch Networks Organization as vouchnetworks.org defines it in its JSON-LD. */
export const VOUCH_ORG_ID = 'https://www.vouchnetworks.org/#organization'

/** The only profiles the site and its schema link to (see docs/seo.md). */
export const SAME_AS = [SITE.links.linkedin, SITE.links.github] as const

export type Cta = {
  /** Stable id, also exposed to browser agents as data-agent-action. */
  id: string
  label: string
  href: string
  external?: boolean
}

export const CTAS = {
  linkedin: { id: 'linkedin', label: 'LinkedIn', href: SITE.links.linkedin, external: true },
  github: { id: 'github', label: 'GitHub', href: SITE.links.github, external: true },
  work: { id: 'work', label: 'See the work', href: '/work' },
  writing: { id: 'writing', label: 'Read the writing', href: '/writing' },
} as const satisfies Record<string, Cta>

/** Honest status labels for projects. Never decorative. */
export type ProjectStatus = 'open-source' | 'in-development' | 'available' | 'archived'

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  'open-source': 'Open source',
  'in-development': 'In development',
  available: 'Available',
  archived: 'Archived',
}

/** The primary CTA on a project page, by how installable it is. */
export const GITHUB_CTA_LABELS = {
  view: 'View on GitHub',
  get: 'Get it on GitHub',
  follow: 'Follow on GitHub',
} as const

export type RouteEntry = {
  path: string
  title: string
  description: string
  index: boolean
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: number
}

/** Static routes. Collection detail pages (work, articles, videos) come from Payload. */
export const ROUTES: RouteEntry[] = [
  {
    path: '/',
    title: 'Yitz Jordan',
    description: SITE.description,
    index: true,
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/about',
    title: 'About Yitz Jordan',
    description:
      'Yitz Jordan: software engineer, founder of Vouch Networks, and a builder of web, mobile and multi-agent AI systems since the days of table layouts.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    path: '/work',
    title: 'Work',
    description:
      'Open-source tools and products by Yitz Jordan: Agent Roundtable, Lawglass, Agent Union, Snapwing and Vouch Networks.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    path: '/writing',
    title: 'Writing',
    description: 'Research and essays by Yitz Jordan on model behavior, multi-agent systems and engineering.',
    index: true,
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/research',
    title: 'Research',
    description: 'Experiments on how language models behave: persona, cadence, context and bias.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/blog',
    title: 'Blog',
    description: 'Notes on engineering, agents and building products.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/videos',
    title: 'Videos',
    description: 'Talks, tutorials and short demos by Yitz Jordan.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/agents',
    title: 'For AI agents',
    description:
      'How AI agents can read this site and talk to it: llms.txt, Markdown versions of every page, an MCP server and a small REST API.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    path: '/privacy',
    title: 'Privacy',
    description: 'What this site records, and what it never does.',
    index: true,
    changeFrequency: 'yearly',
    priority: 0.2,
  },
]

export function getRoute(path: string): RouteEntry {
  const route = ROUTES.find((r) => r.path === path)
  if (!route) throw new Error(`Unknown route ${path}`)
  return route
}

export const NAV_LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'Writing', href: '/writing' },
  { label: 'Videos', href: '/videos' },
  { label: 'About', href: '/about' },
] as const

/** Article kinds and their URL prefixes. */
export const ARTICLE_KINDS = [
  { value: 'research', label: 'Research', path: '/research' },
  { value: 'blog', label: 'Blog', path: '/blog' },
] as const

export type ArticleKind = (typeof ARTICLE_KINDS)[number]['value']

export function articlePath(kind: string | null | undefined, slug: string): string {
  return `${kind === 'blog' ? '/blog' : '/research'}/${slug}`
}

/** URLs from ylove.github.io, redirected permanently to their new homes. */
export const LEGACY_ARTICLE_SLUGS = ['llms-freestyling', 'llms-freestyling-2', 'llm-default-personas'] as const
