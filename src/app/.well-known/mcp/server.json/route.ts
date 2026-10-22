import { AGENT_PATHS } from '@/content/agents'
import { SITE } from '@/content/site'
import { absoluteUrl } from '@/lib/seo/site-url'

export const dynamic = 'force-static'

/** MCP server card, in the MCP registry's server.json shape. */
export function GET() {
  return Response.json(
    {
      $schema: 'https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json',
      name: 'dev.yitzjordan/site',
      title: `${SITE.name}`,
      description: 'Profile, projects, writing and videos of Yitz Jordan, requirement matching with verifiable evidence, and consented introductions. No model runs on the server.',
      version: '1.0.0',
      websiteUrl: absoluteUrl(AGENT_PATHS.page),
      remotes: [{ type: 'streamable-http', url: absoluteUrl(AGENT_PATHS.mcp) }],
    },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' } },
  )
}
