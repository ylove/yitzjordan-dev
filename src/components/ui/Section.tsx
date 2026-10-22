import type { ReactNode } from 'react'
import { cn } from './cn'
import { Container, type ContainerProps } from './Container'

export type SectionSurface = 'paper' | 'band' | 'ink'

export type SectionProps = {
  children: ReactNode
  /**
   * dark   paper, the page default
   * band   a slightly darker paper band
   * ink    full-bleed graphite contrast panel. Semantic tokens flip inside it, so
   *        every primitive renders correctly with no extra props.
   */
  surface?: SectionSurface
  /** id of the heading that names this section (sets aria-labelledby). */
  labelledBy?: string
  /** Accessible name when there is no visible heading. */
  label?: string
  id?: string
  /** A 1px hairline across the container at the top: the separator between dark sections. */
  hairline?: boolean
  /** Vertical rhythm. default: 72 / 96 / 128px. compact: 48 / 64 / 80px. */
  spacing?: 'default' | 'compact' | 'none'
  /** Wrap children in a Container (default true). Set false for full-bleed layouts. */
  contain?: boolean
  containerWidth?: ContainerProps['width']
  className?: string
  containerClassName?: string
}

const spacingClasses = {
  default: 'py-18 md:py-24 lg:py-32',
  compact: 'py-12 md:py-16 lg:py-20',
  none: '',
}

/**
 * A page section.
 *   <Section labelledBy="faq-title" surface="band">
 *     <Heading id="faq-title" level={2}>Questions</Heading>
 *     ...
 *   </Section>
 */
export function Section({
  children,
  surface = 'paper',
  labelledBy,
  label,
  id,
  hairline = false,
  spacing = 'default',
  contain = true,
  containerWidth = 'page',
  className,
  containerClassName,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      data-surface={surface}
      className={cn('relative', className)}
    >
      {hairline ? (
        <div className="container-page" aria-hidden>
          <div className="h-px bg-line" />
        </div>
      ) : null}
      <div className={spacingClasses[spacing]}>
        {contain ? (
          <Container width={containerWidth} className={containerClassName}>
            {children}
          </Container>
        ) : (
          children
        )}
      </div>
    </section>
  )
}
