import { ArrowRight } from 'lucide-react'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'
import type { Project } from '@/payload-types'

/** A project card: name, honest status, one line, and where it goes. */
export function ProjectCard({ project, className, headingLevel = 3 }: { project: Project; className?: string; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const
  return (
    <TrackedLink
      href={`/work/${project.slug}`}
      className={cn(
        'group/card flex h-full flex-col rounded-card border border-line bg-surface-raised p-6 transition-colors hover:border-line-strong md:p-7',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <H className="text-h3 text-ink">{project.name}</H>
        <ArrowRight
          aria-hidden
          strokeWidth={1.75}
          className="mt-1.5 size-5 shrink-0 text-ink-subtle transition-transform group-hover/card:translate-x-1 group-hover/card:text-ink motion-reduce:transition-none"
        />
      </div>
      <p className="mt-3 text-body text-ink-muted">{project.oneLiner}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
        <Badge status={project.status} size="sm">
          {project.statusLabel}
        </Badge>
        {project.language ? <span className="text-data text-ink-subtle">{project.language}</span> : null}
      </div>
    </TrackedLink>
  )
}
