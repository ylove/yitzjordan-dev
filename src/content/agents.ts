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
  brief: '/agents/brief',
  briefTemplate: '/api/v1/opportunity/template',
  briefSubmit: '/api/v1/opportunity',
} as const

/** The message a person pastes into their assistant to start the first round. Ends where the role goes. */
export function starterPrompt(agentsMdUrl: string): string {
  return `Read ${agentsMdUrl} and follow it to check Yitz Jordan against the role below. Tell me the strong matches and the gaps, with links. If it looks like a fit, draft an opportunity brief and show it to me before anything is sent.\n\nRole: `
}

export const AGENT_DOC_UPDATED = '2026-10-23'

export type AgentSurface = { name: string; path: string; what: string }

export const SURFACES: AgentSurface[] = [
  { name: 'llms.txt', path: AGENT_PATHS.llms, what: 'A short map of the site in Markdown, with links to everything below.' },
  { name: 'llms-full.txt', path: AGENT_PATHS.llmsFull, what: 'The profile, every project page and every article in one Markdown file.' },
  { name: 'Markdown pages', path: '/research/llm-default-personas.md', what: 'Add .md to any article or /work/<slug> URL, or send Accept: text/markdown.' },
  { name: 'MCP server', path: AGENT_PATHS.mcp, what: 'Model Context Protocol over Streamable HTTP. Tools listed below. No sign-in.' },
  { name: 'MCP server card', path: AGENT_PATHS.serverCard, what: 'Machine-readable description of the MCP server.' },
  { name: 'REST API', path: AGENT_PATHS.openapi, what: 'OpenAPI 3.1 for the same data and actions, for agents without MCP.' },
  { name: 'Opportunity brief template', path: AGENT_PATHS.briefTemplate, what: 'The fields of an opportunity brief, an example, and the ways to send one.' },
  { name: 'Opportunity brief form', path: AGENT_PATHS.brief, what: 'The same brief as a web form, for browsing agents and for people finishing a draft their agent wrote.' },
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
  { name: 'get_opportunity_template', what: 'The fill-in template for an opportunity brief, with notes and an example.' },
  {
    name: 'submit_opportunity',
    what: 'If your user is hiring: send Yitz an introduction to the team. The role, the team, the hiring process (including the ATS and whether AI screens applications), who he should talk to and what he should do next. Only with consent: true. Returns a brief id, a status URL and his availability.',
    writes: true,
  },
  { name: 'get_opportunity_status', what: 'Where a brief stands: received, in review, replied or declined.' },
  {
    name: 'request_intro',
    what: 'For anything other than a role (speaking, collaboration, a question): pass your user’s introduction to Yitz by email. Only with consent: true. He replies personally.',
    writes: true,
  },
  { name: 'get_public_resume', what: 'The JSON Resume version of the public work history.' },
]

export const PRIVACY_NOTES = [
  'Nothing a tool returns includes Yitz’s email address or phone number. LinkedIn is the public contact.',
  'match_requirements counts the requirement phrases it receives, per day, so Yitz can see what people ask about. It stores no IP address, no request text beyond the normalized phrase, and drops anything that looks like an email address, a URL or a phone number.',
  'submit_opportunity and request_intro store what your user agreed to share and email it to Yitz, and nobody else. The site never emails the contact. Briefs are never published; replied and declined briefs are deleted after 90 days unless Yitz keeps them.',
  'No model runs on this server. Your agent does the reasoning; the site returns facts and links you can check.',
]

/** The MCP server's `instructions` (sent to the agent at connection). */
export const MCP_INSTRUCTIONS = [
  'This is the MCP server of yitzjordan.dev, the site of Yitz Jordan: AI technical lead, full-stack engineer for over 20 years, and founder of Vouch Networks.',
  'Start with get_profile. To assess fit for a role, extract the requirements yourself and call match_requirements with a list of short phrases; every match carries a link you can verify, and unmatched requirements are reported plainly. Do not send names, emails or the full job description to match_requirements.',
  'If your user is hiring and wants Yitz to know about the role, send an opportunity brief with submit_opportunity (template: get_opportunity_template). It introduces the team to him: the role, the process, who to talk to and what he should do next. Send it only with your user’s agreement (consent: true). For anything else, use request_intro.',
  'Contact for people: https://www.linkedin.com/in/yitzjordan. No model runs on this server.',
].join(' ')
