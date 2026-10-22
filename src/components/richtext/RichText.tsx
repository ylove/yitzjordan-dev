import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { isExternalHref } from '@/lib/analytics/links'
import { headingIdResolver, nodeText, type AnchorEntry } from '@/lib/richtext/headings'
import { cn } from '@/components/ui/cn'

type CodeBlockFields = { code?: string; language?: string }

/**
 * Rich text for articles, project notes and the about page.
 * - Headings get stable ids (see lib/richtext/headings.ts), top-level ones only, so the section
 *   nav and old #anchors match.
 * - The Code block renders as <pre><code>.
 * - External links open in a new tab with rel="noopener".
 */
export function RichText({
  data,
  anchors,
  className,
}: {
  data: SerializedEditorState | null | undefined
  anchors?: AnchorEntry[] | null
  className?: string
}) {
  if (!data) return null
  const resolve = headingIdResolver(anchors)

  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX, parent }) => {
      const Tag = (['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag) ? node.tag : 'h2') as 'h2'
      const children = nodesToJSX({ nodes: node.children })
      const topLevel = parent?.type === 'root'
      const id = topLevel ? resolve(nodeText(node).trim()) : undefined
      return <Tag id={id}>{children}</Tag>
    },
    link: ({ node, nodesToJSX }) => {
      const href = (node.fields?.url as string | undefined) ?? '#'
      const external = isExternalHref(href)
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>
          {nodesToJSX({ nodes: node.children })}
        </a>
      )
    },
    blocks: {
      ...(defaultConverters.blocks ?? {}),
      Code: ({ node }: { node: { fields: CodeBlockFields } }) => (
        <pre data-language={node.fields.language || undefined}>
          <code>{node.fields.code ?? ''}</code>
        </pre>
      ),
    },
  })

  return <LexicalRichText data={data} converters={converters} className={cn('prose-yj', className)} />
}
