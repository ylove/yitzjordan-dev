import type { Metadata } from 'next'
import { getRoute, SITE } from '@/content/site'
import { absoluteUrl, getSiteUrl } from './site-url'

export const DEFAULT_TITLE = 'Yitz Jordan | AI technical lead and full-stack engineer'
export const TITLE_TEMPLATE = `%s | ${SITE.name}`

/** Site default social images, served by src/app/opengraph-image.tsx and twitter-image.tsx. */
export const DEFAULT_OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'Yitz Jordan, AI technical lead and full-stack engineer',
  type: 'image/png',
}
export const DEFAULT_TWITTER_IMAGE = { ...DEFAULT_OG_IMAGE, url: '/twitter-image' }

const ROBOTS_INDEX: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}

const ROBOTS_NOINDEX: NonNullable<Metadata['robots']> = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
}

/**
 * Defaults for the frontend layout.
 *
 * - `canonical: './'` and `openGraph.url: './'` resolve against each page's own pathname, so a
 *   page that never calls pageMetadata() still gets a self-referencing canonical (never the
 *   home page).
 * - Open Graph and Twitter titles and descriptions are left out on purpose: Next fills them
 *   from each page's own title and description.
 * - Images are set explicitly. Next only applies a file-based opengraph-image to its own
 *   segment, and any child `openGraph` object replaces the inherited one, images included.
 */
export function baseMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: DEFAULT_TITLE,
      template: TITLE_TEMPLATE,
    },
    description: SITE.description,
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: getSiteUrl() }],
    creator: SITE.name,
    publisher: SITE.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: './',
    },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      url: './',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      images: [DEFAULT_TWITTER_IMAGE],
    },
    robots: ROBOTS_INDEX,
  }
}

export type PageMetadataInput = {
  /**
   * Page title without the " | Yitz Jordan" suffix, which the layout template adds.
   * A title that already contains "Yitz Jordan" is used as-is.
   */
  title: string
  description: string
  /** Site path starting with "/", for example "/work/lawglass". Used for the canonical. */
  path: string
  /** Keep the page out of search results (it is still crawlable and its links followed). */
  noindex?: boolean
  /** Social title. Defaults to the full page title. */
  ogTitle?: string
  /** Social description. Defaults to `description`. */
  ogDescription?: string
  keywords?: string[]
  /**
   * Open Graph type. Default "website". Use "article" for articles, together with
   * `publishedTime` and `modifiedTime`.
   */
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  /** Explicit social image (absolute URL or site path). Default: the site default image. */
  image?: { url: string; width?: number; height?: number; alt?: string }
  /**
   * Set to true when the route has its own opengraph-image.tsx (and twitter-image.tsx) next to
   * page.tsx. The images are then left to those files instead of the site default.
   */
  routeImage?: boolean
}

/** Full metadata for a page: its own canonical, Open Graph and Twitter card. */
export function pageMetadata({
  title,
  description,
  path,
  noindex,
  ogTitle,
  ogDescription,
  keywords,
  type = 'website',
  publishedTime,
  modifiedTime,
  image,
  routeImage,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path)
  const isAbsoluteTitle = title.includes(SITE.name)
  const fullTitle = isAbsoluteTitle ? title : `${title} | ${SITE.name}`
  const socialTitle = ogTitle ?? fullTitle
  const socialDescription = ogDescription ?? description
  // Omit the images keys entirely for routeImage, so Next uses the route's image files.
  const ogImages = routeImage
    ? undefined
    : image
      ? [{ url: absoluteUrl(image.url), width: image.width, height: image.height, alt: image.alt ?? socialTitle }]
      : [DEFAULT_OG_IMAGE]
  const twitterImages = routeImage ? undefined : image ? ogImages : [DEFAULT_TWITTER_IMAGE]

  return {
    title: isAbsoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      siteName: SITE.name,
      locale: SITE.locale,
      url,
      title: socialTitle,
      description: socialDescription,
      ...(type === 'article' ? { publishedTime, modifiedTime, authors: [absoluteUrl('/about')] } : {}),
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      ...(twitterImages ? { images: twitterImages } : {}),
    },
    robots: noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX,
  }
}

/**
 * pageMetadata() for a static route in ROUTES (src/content/site.ts): title, description,
 * keywords and noindex come from the route entry. Pass overrides for anything else.
 *
 *   export const metadata = routeMetadata('/about')
 */
export function routeMetadata(
  path: string,
  overrides: Partial<Omit<PageMetadataInput, 'path'>> = {},
): Metadata {
  const route = getRoute(path)
  return pageMetadata({
    title: route.title,
    description: route.description,
    noindex: !route.index,
    ...overrides,
    path,
  })
}
