import { articleMarkdown, projectMarkdown } from '@/lib/agents/tools'
import { markdownResponse } from '@/lib/agents/markdown'
import { getArticleBySlug } from '@/lib/cms'
import { articlePath } from '@/content/site'
import { absoluteUrl } from '@/lib/seo/site-url'

export const revalidate = 3600

/**
 * Markdown twins. Reached through rewrites in next.config.ts (/research/x.md, /blog/x.md,
 * /work/x.md) and through Accept: text/markdown negotiation in src/proxy.ts.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params
  if (kind === 'work') {
    const md = await projectMarkdown(slug)
    return md ? markdownResponse(md, { canonical: absoluteUrl(`/work/${slug}`) }) : markdownResponse('# Not found\n', { status: 404, cache: 'none' })
  }
  if (kind === 'research' || kind === 'blog') {
    const article = await getArticleBySlug(slug)
    if (!article || article.kind !== kind) return markdownResponse('# Not found\n', { status: 404, cache: 'none' })
    const md = await articleMarkdown(slug)
    return markdownResponse(md ?? '', { canonical: absoluteUrl(articlePath(article.kind, article.slug)) })
  }
  return markdownResponse('# Not found\n', { status: 404, cache: 'none' })
}
