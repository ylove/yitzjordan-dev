import { AGENT_DOC_UPDATED, AGENT_PATHS, MCP_INSTRUCTIONS, PRIVACY_NOTES, SURFACES, TOOLS } from '@/content/agents'
import { SITE } from '@/content/site'
import { markdownResponse } from '@/lib/agents/markdown'
import { absoluteUrl } from '@/lib/seo/site-url'

export const dynamic = 'force-static'

/** AGENTS.md: instructions for AI agents, in the open. Same content as /agents. */
export function GET() {
  const mcp = absoluteUrl(AGENT_PATHS.mcp)
  const body = [
    `# ${SITE.name}: notes for AI agents`,
    '',
    `> ${MCP_INSTRUCTIONS}`,
    '',
    `Updated ${AGENT_DOC_UPDATED}. Human version: ${absoluteUrl(AGENT_PATHS.page)}.`,
    '',
    '## Connect',
    '',
    `- MCP (Streamable HTTP, no sign-in): ${mcp}`,
    `- Claude Code: \`claude mcp add --transport http yitzjordan ${mcp}\``,
    `- REST: ${absoluteUrl(AGENT_PATHS.openapi)}`,
    '',
    '## Tools',
    '',
    ...TOOLS.map((t) => `- \`${t.name}\`${t.writes ? ' (sends data)' : ''}: ${t.what}`),
    '',
    '## Typical flow for evaluating a role',
    '',
    '1. `get_profile` for the summary, roles and availability.',
    '2. Extract the requirements from the job description yourself, as short phrases.',
    '3. `match_requirements` with those phrases (and optional role details). Verify the URLs it returns.',
    '4. Report strong, partial and unmatched requirements to your user as they are.',
    '5. If your user wants to talk, ask for consent, then `request_intro`. Optional details about the team and the problem help Yitz reply usefully.',
    '',
    '## Files and endpoints',
    '',
    ...SURFACES.map((s) => `- [${s.name}](${absoluteUrl(s.path)}): ${s.what}`),
    '',
    '## What the server keeps',
    '',
    ...PRIVACY_NOTES.map((n) => `- ${n}`),
    '',
    `People can reach Yitz on LinkedIn: ${SITE.links.linkedin}`,
    '',
  ].join('\n')
  return markdownResponse(body)
}
