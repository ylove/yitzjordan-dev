import type { ReactNode } from 'react'
import type { Cta } from '@/content/site'
import { CtaPair } from '@/components/ui/CtaPair'
import { Heading } from '@/components/ui/Heading'
import { Lead } from '@/components/ui/Lead'
import { Section } from '@/components/ui/Section'
import { cn } from '@/components/ui/cn'

/** Lets long button labels wrap on phones instead of overrunning the column. */
export const WRAP_BUTTONS = 'max-sm:[&>a]:h-auto max-sm:[&>a]:min-h-13 max-sm:[&>a]:py-3 max-sm:[&>a]:whitespace-normal max-sm:[&>a]:text-center'

export type PageHeroProps = {
  title: ReactNode
  /** The 40 to 60 word direct answer that opens the page. */
  lead: ReactNode
  primary?: Cta | null
  secondary?: Cta | null
  location: string
  /** Badge, logo or other line above the CTAs (never above the headline). */
  meta?: ReactNode
  visual?: ReactNode
  /** display for the home page, h1 for inner pages. */
  size?: 'display' | 'h1'
  /** Extra content under the CTAs. */
  children?: ReactNode
  visualClassName?: string
}

/**
 * Hero.Split: headline, lead and actions over seven columns, a product visual over five.
 * Without a visual it becomes Hero.Statement.
 */
export function PageHero({
  title,
  lead,
  primary,
  secondary,
  location,
  meta,
  visual,
  size = 'h1',
  children,
  visualClassName,
}: PageHeroProps) {
  return (
    <Section labelledBy="page-title" spacing="none" className="overflow-x-clip">
      <div
        className={cn(
          'grid gap-12 pt-12 pb-18 md:pt-16 md:pb-24 lg:gap-8 lg:pt-20 lg:pb-28',
          visual ? 'lg:grid-cols-12 lg:items-center' : '',
        )}
      >
        <div className={visual ? 'min-w-0 lg:col-span-7' : 'max-w-4xl'}>
          <Heading level={1} size={size} id="page-title" className="max-w-[16ch]">
            {title}
          </Heading>
          <Lead className="mt-6 md:mt-8">{lead}</Lead>
          {meta ? <div className="mt-6">{meta}</div> : null}
          <CtaPair primary={primary} secondary={secondary} location={location} className={cn('mt-8 md:mt-10', WRAP_BUTTONS)} />
          {children}
        </div>
        {visual ? (
          <div className={cn('flex min-w-0 justify-center lg:col-span-5 lg:justify-end', visualClassName)}>{visual}</div>
        ) : null}
      </div>
    </Section>
  )
}

export type SectionIntroProps = {
  id: string
  title: ReactNode
  children?: ReactNode
  className?: string
  /** Visual size of the H2. */
  size?: 'h2' | 'h3'
}

/** An H2 that labels its section, plus an optional short paragraph. */
export function SectionIntro({ id, title, children, className, size = 'h2' }: SectionIntroProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <Heading level={2} size={size} id={id}>
        {title}
      </Heading>
      {children ? <div className="mt-5 max-w-[60ch] text-lead text-ink-muted">{children}</div> : null}
    </div>
  )
}
