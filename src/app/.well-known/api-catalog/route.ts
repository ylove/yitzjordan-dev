import { AGENT_PATHS } from '@/content/agents'
import { absoluteUrl } from '@/lib/seo/site-url'

export const dynamic = 'force-static'

/** RFC 9727 API catalog: a linkset pointing to the REST API, the MCP server and their docs. */
export function GET() {
  const docs = [
    { href: absoluteUrl(AGENT_PATHS.agentsMd), type: 'text/markdown' },
    { href: absoluteUrl(AGENT_PATHS.page), type: 'text/html' },
  ]
  const body = {
    linkset: [
      {
        anchor: absoluteUrl('/api/v1'),
        'service-desc': [{ href: absoluteUrl(AGENT_PATHS.openapi), type: 'application/vnd.oai.openapi+json;version=3.1' }],
        'service-doc': docs,
      },
      {
        anchor: absoluteUrl(AGENT_PATHS.mcp),
        'service-desc': [{ href: absoluteUrl(AGENT_PATHS.serverCard), type: 'application/json' }],
        'service-doc': docs,
      },
    ],
  }
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
