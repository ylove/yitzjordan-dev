import type { Cta } from '@/content/site'
import { ButtonLink } from './Button'
import { cn } from './cn'

export type CtaPairProps = {
  primary?: Cta | null
  secondary?: Cta | null
  size?: 'sm' | 'md' | 'lg'
  location?: string
  /** Stack full-width on small screens (default true). */
  stackOnMobile?: boolean
  className?: string
}

/**
 * The primary + secondary call to action, side by side.
 *   <CtaPair primary={githubCta} secondary={CTAS.linkedin} />
 */
export function CtaPair({ primary, secondary, size = 'lg', location, stackOnMobile = true, className }: CtaPairProps) {
  if (!primary) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-3', stackOnMobile && 'max-sm:flex-col max-sm:items-stretch', className)}>
      <ButtonLink cta={primary} size={size} location={location} />
      {secondary ? <ButtonLink cta={secondary} variant="secondary" size={size} location={location} /> : null}
    </div>
  )
}
