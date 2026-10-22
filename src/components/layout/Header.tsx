'use client'

import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { cn } from '@/components/ui/cn'
import { NAV_LINKS, SITE } from '@/content/site'

function isCurrent(pathname: string, href: string) {
  if (href === '/writing') return ['/writing', '/research', '/blog'].some((p) => pathname === p || pathname.startsWith(`${p}/`))
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Sticky header: the name, four links and LinkedIn. Below md the links fold into a <details>
 * menu, which works without JavaScript; navigating closes it.
 */
export function Header() {
  const pathname = usePathname() ?? '/'
  const menuRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-[6px] supports-[backdrop-filter]:bg-surface/85">
      <div className="container-page flex h-16 items-center gap-6">
        <TrackedLink
          href="/"
          aria-label={`${SITE.name}, home`}
          className="-m-2 flex items-center gap-2.5 rounded-control p-2 font-display text-[1.0625rem] font-[640] tracking-[-0.02em] text-ink [font-stretch:105%]"
        >
          <span aria-hidden className="inline-block h-[3px] w-4 rounded-full bg-accent" />
          {SITE.name}
        </TrackedLink>

        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const current = isCurrent(pathname, l.href)
              return (
                <li key={l.href}>
                  <TrackedLink
                    href={l.href}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-10 items-center rounded-control px-3 text-[0.9375rem] font-medium transition-colors hover:bg-surface-hover',
                      current ? 'text-ink' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {l.label}
                  </TrackedLink>
                </li>
              )
            })}
            <li>
              <TrackedLink
                href={SITE.links.linkedin}
                ctaId="linkedin"
                data-agent-action="contact-linkedin"
                className="ml-2 inline-flex h-10 items-center rounded-control border border-line-strong px-3.5 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-surface-hover"
              >
                LinkedIn
                <span className="sr-only"> (opens in a new tab)</span>
              </TrackedLink>
            </li>
          </ul>
        </nav>

        <details ref={menuRef} className="group/menu ml-auto md:hidden">
          <summary
            aria-label="Menu"
            className="grid size-10 cursor-pointer list-none place-items-center rounded-control border border-line text-ink [&::-webkit-details-marker]:hidden"
          >
            <Menu aria-hidden className="size-5 group-open/menu:hidden" strokeWidth={1.75} />
            <X aria-hidden className="hidden size-5 group-open/menu:block" strokeWidth={1.75} />
          </summary>
          <nav
            aria-label="Main"
            data-open="true"
            className="menu-panel absolute inset-x-0 top-16 border-b border-line bg-surface shadow-popover"
          >
            <ul className="container-page flex flex-col py-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <TrackedLink
                    href={l.href}
                    aria-current={isCurrent(pathname, l.href) ? 'page' : undefined}
                    className="flex h-12 items-center text-[1.0625rem] font-medium text-ink"
                  >
                    {l.label}
                  </TrackedLink>
                </li>
              ))}
              <li>
                <TrackedLink href={SITE.links.linkedin} className="flex h-12 items-center text-[1.0625rem] font-medium text-ink">
                  LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </TrackedLink>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  )
}
