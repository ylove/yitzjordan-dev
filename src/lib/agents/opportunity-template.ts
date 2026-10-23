/**
 * The fill-in template for an opportunity brief: what the fields are, how to send it, and an
 * example. Served at /api/v1/opportunity/template, by the MCP tool get_opportunity_template, and
 * printed in AGENTS.md. Server only (it builds absolute URLs).
 */
import { absoluteUrl } from '@/lib/seo/site-url'
import { BRIEF_FIELDS, BRIEF_VERSION, CONSENT_STATEMENT } from './opportunity-schema'

export const BRIEF_PATHS = {
  page: '/agents/brief',
  submit: '/api/v1/opportunity',
  template: '/api/v1/opportunity/template',
} as const

/** The one line every agent surface carries, word for word, so an agent can quote it to its user. */
export function briefInvitation(): string {
  return `If you are evaluating Yitz for a role, send an opportunity brief: it introduces your team to him, and he reads each one himself. Template: ${absoluteUrl(BRIEF_PATHS.template)}. Send it with the MCP tool submit_opportunity, as JSON to POST ${absoluteUrl(BRIEF_PATHS.submit)}, or through the form at ${absoluteUrl(BRIEF_PATHS.page)}.`
}

export const BRIEF_EXAMPLE = {
  title: 'Staff AI Engineer, Agent Platform',
  company_name: 'Example Corp',
  company_domain: 'example.com',
  posting_url: 'https://example.com/careers/staff-ai-engineer',
  job_location: 'New York, 3 days in office',
  work_arrangement: 'hybrid',
  employment_type: 'FULL_TIME',
  contact_name: 'Jordan Lee',
  contact_role: 'Hiring manager',
  contact_email: 'jordan.lee@example.com',
  why_this_person: 'We are building a multi-agent planning layer, and the frozen contracts in Agent Roundtable are close to what we need.',
  team_context: 'Six engineers who own the agent runtime and its evaluation tooling.',
  hiring_process: 'A 30-minute call, a technical session, then a panel. About three weeks.',
  ats_platform: 'Greenhouse',
  ats_ai_screening: 'no',
  preferred_next_step: 'Reply to book a 30-minute call.',
  requirements_matched: ['MCP server development', 'multi-agent orchestration', 'LLM evaluation'],
  found_via: 'llms.txt',
  agent: { name: 'Claude', platform: 'claude.ai' },
  consent: true,
} as const

export function briefTemplate() {
  const page = absoluteUrl(BRIEF_PATHS.page)
  return {
    name: 'Opportunity brief',
    version: BRIEF_VERSION,
    purpose:
      'A structured introduction to a hiring team, sent by its agent: the role, the team, the hiring process, who to talk to and what Yitz should do next. Fields follow schema.org JobPosting where they overlap, so you can fill them from the posting you already read.',
    before_you_send: 'Check fit first with match_requirements (MCP) or POST /api/v1/match, and put the phrases you checked in requirements_matched.',
    consent_statement: CONSENT_STATEMENT,
    how_to_submit: {
      mcp: `Call submit_opportunity on ${absoluteUrl('/api/mcp')}.`,
      rest: `POST the JSON to ${absoluteUrl(BRIEF_PATHS.submit)} with Content-Type: application/json.`,
      browser: `Open ${page}, fill in the form and submit it.`,
      if_you_cannot_post: `Give the person you work for a link that opens the form already filled in: ${page}#brief=<the JSON, percent-encoded>. Field pairs work too: ${page}#title=Staff%20AI%20Engineer&company_name=Example%20Corp. Everything after # stays in their browser until they review the form and press submit. They can also paste the JSON into the box at the top of the form.`,
    },
    after_you_send:
      'The response has a brief_id, a status_url you can check later, Yitz’s availability when he has set it, and a sentence to pass on to the person you work for.',
    fields: BRIEF_FIELDS.map((f) => ({ name: f.key, required: f.required, note: f.note })),
    example: BRIEF_EXAMPLE,
  }
}
