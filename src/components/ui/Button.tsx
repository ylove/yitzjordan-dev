import { cva } from 'class-variance-authority'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { isExternalHref } from '@/lib/analytics/links'
import type { Cta } from '@/content/site'
import { cn } from './cn'

/*
 * Buttons. 6px radius, never pills, never cobalt fills.
 *   primary   solid: graphite on paper, paper on ink panels (semantic tokens)
 *   secondary outline
 *   ghost     text with a hover fill
 *   link      inline text link with a cobalt underline
 */
export const buttonVariants = cva(
  [
    'group/button relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-control font-sans font-medium leading-none tracking-[-0.01em]',
    'transition-[background-color,border-color,color] duration-150 ease-out',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-action text-action-ink hover:bg-action-hover',
        secondary: 'border border-line-strong text-ink hover:border-ink-subtle hover:bg-surface-hover',
        ghost: 'text-ink hover:bg-surface-hover',
        link: 'h-auto px-0 text-ink underline decoration-accent decoration-[1.5px] underline-offset-[0.3em] hover:decoration-current',
      },
      size: {
        sm: 'h-10 px-4 text-[0.875rem]',
        md: 'h-11 px-5 text-[0.9375rem]',
        lg: 'h-13 px-7 text-[1.0625rem]',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
)

type Variant = 'primary' | 'secondary' | 'ghost' | 'link'
type Size = 'sm' | 'md' | 'lg'

/** Old prop values still used by pages that have not been rebuilt yet. */
type LegacyVariant = 'accent'
type LegacySize = 'default'

const normVariant = (v?: Variant | LegacyVariant | null): Variant => (v === 'accent' || !v ? 'primary' : v)
const normSize = (s?: Size | LegacySize | null): Size => (s === 'default' || !s ? 'md' : s)

type ArrowOption = boolean | 'auto'

function Arrow({ external }: { external: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight
  return (
    <Icon
      aria-hidden
      strokeWidth={1.75}
      className={cn(
        'size-[1.1em] shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none',
        external
          ? 'group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5'
          : 'group-hover/button:translate-x-1',
      )}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* ButtonLink                                                                  */
/* -------------------------------------------------------------------------- */

export type ButtonLinkProps = {
  /** A CTA from src/content/site.ts. Supplies href, label, analytics id and external. */
  cta?: Cta
  href?: string
  /** Visible text. Defaults to cta.label. `children` wins over both. */
  label?: string
  children?: ReactNode
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  /**
   * Trailing arrow that nudges on hover. 'auto' (default) shows it on primary
   * buttons and on external links (as an up-right arrow).
   */
  arrow?: ArrowOption
  /** Analytics location, for example "header" or "home_hero". */
  location?: string
  /** Analytics id when not passing a cta. */
  ctaId?: string
  external?: boolean
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  'aria-label'?: string
}

/**
 * A link styled as a button. Tracks cta_click through TrackedLink. External
 * http links open in a new tab with rel="noopener" and say so to screen readers.
 *
 *   <ButtonLink cta={CTAS.linkedin} />
 *   <ButtonLink href="/work" label="All work" variant="link" />
 */
/**
 * Stable hooks for browser-based AI agents, keyed by CTA id: <a data-agent-action="book-demo">.
 * Documented for agents at /agents.
 */
const AGENT_ACTIONS: Record<string, string> = {
  linkedin: 'contact-linkedin',
  github: 'view-github',
  repo: 'view-repository',
}

export function ButtonLink({
  cta,
  href,
  label,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  arrow = 'auto',
  location,
  ctaId,
  external,
  className,
  onClick,
  'aria-label': ariaLabel,
}: ButtonLinkProps) {
  const target = href ?? cta?.href
  if (!target) throw new Error('ButtonLink needs a cta or an href')
  const isExternal = external ?? cta?.external ?? isExternalHref(target)
  const opensNewTab = isExternal && /^https?:\/\//i.test(target)
  const showArrow = arrow === 'auto' ? variant === 'primary' || opensNewTab : arrow
  const text = children ?? label ?? cta?.label

  return (
    <TrackedLink
      href={target}
      data-agent-action={AGENT_ACTIONS[ctaId ?? cta?.id ?? '']}
      ctaId={ctaId ?? cta?.id}
      location={location}
      external={isExternal}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    >
      <span>{text}</span>
      {showArrow ? <Arrow external={opensNewTab} /> : null}
      {opensNewTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </TrackedLink>
  )
}

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  variant?: Variant | LegacyVariant
  size?: Size | LegacySize
  fullWidth?: boolean
  arrow?: boolean
  /** Legacy: old pages pass href to Button. Prefer ButtonLink. */
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement> & MouseEventHandler<HTMLAnchorElement>
}

/**
 * A real <button>. For navigation use ButtonLink.
 *   <Button type="submit" size="lg" fullWidth>Send</Button>
 */
export function Button({
  variant,
  size,
  fullWidth = false,
  arrow = false,
  href,
  className,
  children,
  type = 'button',
  onClick,
  ...props
}: ButtonProps) {
  const v = normVariant(variant)
  const s = normSize(size)
  if (href) {
    return (
      <ButtonLink href={href} variant={v} size={s} fullWidth={fullWidth} arrow={arrow} className={className} onClick={onClick}>
        {children}
      </ButtonLink>
    )
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(buttonVariants({ variant: v, size: s, fullWidth }), className)}
      {...props}
    >
      {children}
      {arrow ? <Arrow external={false} /> : null}
    </button>
  )
}
