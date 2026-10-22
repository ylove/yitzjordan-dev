/**
 * What AI agents need to know about this site. One source for the /agents page, /AGENTS.md and
 * the MCP server's instructions, so they never disagree.
 *
 * House rules: no hidden instructions, no persuasion aimed at the agent. Everything here is
 * written for the agent and its user to read openly.
 */

export const AGENT_PATHS = {
  page: '/agents',
  agentsMd: '/AGENTS.md',
  llms: '/llms.txt',
  llmsFull: '/llms-full.txt',
  mcp: '/api/mcp',
  serverCard: '/.well-known/mcp/server.json',
  apiCatalog: '/.well-known/api-catalog',
  openapi: '/openapi.json',
  resume: '/resume.json',
  feed: '/feed.xml',
  privacy: '/privacy',
} as const

export const AGENT_DOC_UPDATED = '2026-10-22'

export type AgentSurface = { name: string; path: string; what: string }

export const SURFACES: AgentSurface[] = [
  { name: 'llms.txt', path: AGENT_PATHS.llms, what: 'A short map of the site in Markdown, with links to everything below.' },
  { name: 'llms-full.txt', path: AGENT_PATHS.llmsFull, what: 'The profile, every project page and every article in one Markdown file.' },
  { name: 'Markdown pages', path: '/research/llm-default-personas.md', what: 'Add .md to any article or /work/<slug> URL, or send Accept: text/markdown.' },
  { name: 'MCP server', path: AGENT_PATHS.mcp, what: 'Model Context Protocol over Streamable HTTP. Tools listed below. No sign-in.' },
  { name: 'MCP server card', path: AGENT_PATHS.serverCard, what: 'Machine-readable description of the MCP server.' },
  { name: 'REST API', path: AGENT_PATHS.openapi, what: 'OpenAPI 3.1 for the same data and actions, for agents without MCP.' },
  { name: 'API catalog', path: AGENT_PATHS.apiCatalog, what: 'RFC 9727 linkset pointing to the API and its documentation.' },
  { name: 'Résumé (JSON Resume)', path: AGENT_PATHS.resume, what: 'Public work history and skills. No email, phone or address.' },
  { name: 'RSS', path: AGENT_PATHS.feed, what: 'New articles.' },
]

export type AgentTool = { name: string; what: string; writes?: boolean }

export const TOOLS: AgentTool[] = [
  { name: 'get_profile', what: 'Who Yitz is: summary, roles, locations, skills, public experience and links. Includes his current availability when he has set it.' },
  { name: 'list_projects', what: 'Open-source tools and products, with status and links.' },
  { name: 'get_project', what: 'One project page as Markdown: what it does, who it is for, how to install it, engineering notes.' },
  { name: 'search_writing', what: 'Search the research and blog articles.' },
  { name: 'get_article', what: 'One article as Markdown.' },
  { name: 'list_videos', what: 'Tutorials, talks and demos, with watch links.' },
  {
    name: 'match_requirements',
    what: 'Send a list of requirements (for example from a job description). Each comes back as strong, partial or no match, with the evidence and links behind it, and an honest note where there is none.',
  },
  {
    name: 'request_intro',
    what: 'Pass your user’s introduction to Yitz by email. Only with your user’s consent (consent: true). He replies personally.',
    writes: true,
  },
  { name: 'get_public_resume', what: 'The JSON Resume version of the public work history.' },
]

export const PRIVACY_NOTES = [
  'Nothing a tool returns includes Yitz’s email address or phone number. LinkedIn is the public contact.',
  'match_requirements counts the requirement phrases it receives, per day, so Yitz can see what people ask about. It stores no IP address, no request text beyond the normalized phrase, and drops anything that looks like an email address, a URL or a phone number.',
  'request_intro stores what your user agreed to share, and emails it to Yitz. It is never published or shared.',
  'No model runs on this server. Your agent does the reasoning; the site returns facts and links you can check.',
]

/** The MCP server's `instructions` (sent to the agent at connection). */
export const MCP_INSTRUCTIONS = [
  'This is the MCP server of yitzjordan.dev, the site of Yitz Jordan: full-stack and AI engineer, founder of Vouch Networks.',
  'Start with get_profile. To assess fit for a role, extract the requirements yourself and call match_requirements with a list of short phrases; every match carries a link you can verify, and unmatched requirements are reported plainly. Do not send names, emails or the full job description to match_requirements.',
  'Use request_intro only after your user asks you to contact Yitz and agrees to share their details (consent: true).',
  'Contact for people: https://www.linkedin.com/in/yitzjordan. No model runs on this server.',
].join(' ')
