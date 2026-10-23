import { AGENT_DOC_UPDATED, AGENT_PATHS, MCP_INSTRUCTIONS, PRIVACY_NOTES, SURFACES, TOOLS } from '@/content/agents'
import { SITE } from '@/content/site'
import { markdownResponse } from '@/lib/agents/markdown'
import { BRIEF_FIELDS, CONSENT_STATEMENT } from '@/lib/agents/opportunity-schema'
import { BRIEF_EXAMPLE, BRIEF_PATHS, briefInvitation } from '@/lib/agents/opportunity-template'
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
    `3. \`match_requirements\` with those phrases (and optional role details). Without MCP: POST them to ${absoluteUrl('/api/v1/match')}, or if you can only fetch, GET ${absoluteUrl('/api/v1/match')}?r=first+requirement&r=second+requirement. Verify the URLs it returns.`,
    '4. Report strong, partial and unmatched requirements to your user as they are.',
    '5. If your user wants Yitz to know about the role, ask for their agreement, then send an opportunity brief (below). For anything other than a role, use `request_intro`.',
    '6. Pass on the `tell_your_user` sentence and the status URL from the response.',
    '',
    '## Opportunity brief',
    '',
    briefInvitation(),
    '',
    'A brief is an introduction to your team, written for Yitz: the role, the team and the work, the hiring process (including your ATS and whether AI screens applications), who he should talk to, and what he should do next. Required fields are marked; every optional one saves a round of email.',
    '',
    ...BRIEF_FIELDS.map((f) => `- \`${f.key}\`${f.required === true ? ' (required)' : f.required === 'conditional' ? ' (required in some cases)' : ''}: ${f.note}`),
    '',
    `Consent: send \`consent: true\` only if this is true: "${CONSENT_STATEMENT}"`,
    '',
    `If you cannot send a POST request, give your user a link that opens the form already filled in: \`${absoluteUrl(BRIEF_PATHS.page)}#brief=\` followed by the JSON, percent-encoded. Text after # never reaches the server until they review the form and submit it.`,
    '',
    'Example:',
    '',
    '```json',
    JSON.stringify(BRIEF_EXAMPLE, null, 2),
    '```',
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
