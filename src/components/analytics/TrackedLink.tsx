'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'
// Server-safe helpers live in lib so server components can call them too.
import { isExternalHref } from '@/lib/analytics/links'

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
  /** CTA id from src/content/site.ts. Kept for the data-agent-action hook; not sent anywhere. */
  ctaId?: string
  /** Where the link sits, for example "header". Not sent anywhere; the site has no analytics. */
  location?: string
  /** Force external handling. By default it is worked out from `href`. */
  external?: boolean
}

/**
 * next/link that handles external links: internal links use client navigation, external
 * http(s) links open in a new tab with rel="noopener". The site sends no analytics events.
 */
export function TrackedLink({
  href,
  ctaId,
  location,
  external,
  onClick,
  target,
  rel,
  children,
  prefetch,
  replace,
  scroll,
  shallow,
  locale,
  ...rest
}: TrackedLinkProps) {
  void ctaId
  void location
  const isExternal = external ?? isExternalHref(href)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
  }

  if (isExternal) {
    const isWeb = /^https?:\/\//i.test(href)
    const relParts = new Set((rel ?? '').split(/\s+/).filter(Boolean))
    if (isWeb) relParts.add('noopener')
    return (
      <a
        href={href}
        target={target ?? (isWeb ? '_blank' : undefined)}
        rel={relParts.size ? [...relParts].join(' ') : undefined}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      locale={locale}
      {...rest}
    >
      {children}
    </Link>
  )
}
