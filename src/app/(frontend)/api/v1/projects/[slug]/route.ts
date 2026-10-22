import { fail, preflight } from '@/lib/agents/http'
import { markdownResponse } from '@/lib/agents/markdown'
import { projectMarkdown } from '@/lib/agents/tools'
import { absoluteUrl } from '@/lib/seo/site-url'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const md = await projectMarkdown(slug)
  if (!md) return fail(404, { slug: `No project "${slug}".` })
  return markdownResponse(md, { canonical: absoluteUrl(`/work/${slug}`) })
}

export const OPTIONS = preflight
