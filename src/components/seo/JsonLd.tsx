import type { JsonLdNode } from '@/lib/seo/jsonld'

type JsonLdProps = {
  /** One node, or several (rendered as an @graph). */
  data: JsonLdNode | JsonLdNode[]
  id?: string
}

/**
 * Serialize for an inline <script>. Escapes characters that could end the script element
 * or break parsing: <, >, &, and the U+2028 / U+2029 line separators.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/** Renders schema.org JSON-LD. Server component; safe to use anywhere in the tree. */
export function JsonLd({ data, id }: JsonLdProps) {
  const doc = Array.isArray(data)
    ? { '@context': 'https://schema.org', '@graph': data }
    : { '@context': 'https://schema.org', ...data }

  return (
    <script
      type="application/ld+json"
      id={id}
      // Content is our own data, serialized and escaped above.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(doc) }}
    />
  )
}
