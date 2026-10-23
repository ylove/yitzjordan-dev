/**
 * The opportunity brief: what a hiring team's agent sends so Yitz gets an introduction to the
 * team, not only the other way round. One contract for the MCP tool submit_opportunity, POST
 * /api/v1/opportunity, the form at /agents/brief, the fill-in template and the OpenAPI document.
 *
 * Field names follow schema.org JobPosting where they overlap (title, employment_type,
 * job_location, valid_through), so an agent that already parsed the team's own posting can fill
 * them from it. Relative imports only: the Payload CLI loads this through the collection.
 */
import { z } from 'zod'
import { AI_SCREENING, CONSENT_STATEMENT, EMPLOYMENT_TYPES, WORK_ARRANGEMENTS } from './opportunity-options'
import { text } from './schema'

export * from './opportunity-options'

type Values<T extends readonly { value: string }[]> = [T[number]['value'], ...T[number]['value'][]]
const values = <T extends readonly { value: string }[]>(list: T) => list.map((o) => o.value) as Values<T>

const blankToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value)

const httpUrl = (max: number, description: string) =>
  z
    .preprocess(blankToUndefined, z.string().trim().max(max).pipe(z.url({ protocol: /^https?$/, error: 'Use a full http(s) URL.' })).optional())
    .describe(description)

const required = (max: number, field: string, description: string) =>
  z.string({ error: `${field} is required.` }).trim().min(1, `${field} is required.`).max(max).describe(description)

/** "https://www.Example.com/jobs" -> "example.com". */
export function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/?#:].*$/, '')
}

export const MAX_BRIEF_REQUIREMENTS = 25

export const opportunityShape = {
  consent: z
    .literal(true, { error: 'Ask the person you work for first. Send consent: true only after they agree to share these details with Yitz Jordan.' })
    .describe(`Required. true means: "${CONSENT_STATEMENT}"`),

  // The role
  title: required(160, 'title', 'The role title, as in the posting. For example "Staff AI Engineer, Agent Platform".'),
  company_name: required(160, 'company_name', 'The hiring company or organization.'),
  company_domain: z
    .string({ error: 'company_domain is required.' })
    .trim()
    .min(3, 'company_domain is required, for example "example.com".')
    .max(120)
    .transform(normalizeDomain)
    .refine((d) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d), 'company_domain must be a domain, for example "example.com".')
    .describe('The company’s web domain, for example "example.com". Compared with contact_email.'),
  posting_url: httpUrl(500, 'The public job posting. Required unless no_public_posting is true.'),
  no_public_posting: z.boolean().optional().describe('true for a search with no public posting (stealth, confidential or not yet posted). Then team_context and product_context are required.'),
  job_location: required(200, 'job_location', 'Where the role is based, for example "New York, 3 days in office" or "Remote (US)".'),
  work_arrangement: z
    .enum(values(WORK_ARRANGEMENTS), { error: 'work_arrangement must be remote, hybrid or onsite.' })
    .describe('remote, hybrid or onsite.'),
  employment_type: z
    .enum(values(EMPLOYMENT_TYPES), { error: 'employment_type must be FULL_TIME, CONTRACTOR, PART_TIME, TEMPORARY or OTHER.' })
    .optional()
    .describe('schema.org JobPosting value: FULL_TIME, CONTRACTOR, PART_TIME, TEMPORARY or OTHER.'),
  valid_through: text(40, 'When the opening closes, as an ISO date, if known.'),

  // Who Yitz should talk to
  contact_name: required(120, 'contact_name', 'The person Yitz should reply to.'),
  contact_email: z
    .string({ error: 'contact_email is required.' })
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email('contact_email must be a valid email address.'))
    .describe('Their work email. A match with company_domain is shown to Yitz as verified.'),
  contact_role: text(120, 'Their role: "Hiring manager", "Recruiter", "Founder". It sets the tone of Yitz’s reply.'),
  contact_linkedin: httpUrl(300, 'Their LinkedIn profile, if they want Yitz to reply there.'),

  // Why, and about the team
  why_this_person: required(800, 'why_this_person', 'Why Yitz, in a sentence or two. Cite a project, article or match from this site.'),
  team_context: text(1500, 'The team: size, what it owns, who leads it. Required when no_public_posting is true.'),
  product_context: text(1500, 'The product or projects this role works on. Required when no_public_posting is true.'),
  stack: text(600, 'Languages, frameworks, models and infrastructure.'),
  first_90_days: text(1500, 'What the person in this role would do first.'),

  // The process, and what Yitz should do next
  hiring_process: text(1500, 'The steps and the timeline, for example "30-minute call, technical session, team panel; decision within three weeks".'),
  ats_platform: text(120, 'The applicant tracking system, for example "Greenhouse", "Ashby", "Workday".'),
  ats_ai_screening: z
    .enum(values(AI_SCREENING))
    .optional()
    .describe('Whether applications are screened by AI: yes, no or unknown.'),
  application_url: httpUrl(500, 'If the process needs an application in your ATS, the link to it.'),
  preferred_next_step: text(600, 'What you would like Yitz to do next, for example "Reply to book a 30-minute call" or "Apply at the link, then we will reach out".'),
  comp_band: text(200, 'The compensation range, if you can share it. Skip it if policy does not allow.'),

  // How the agent got here
  requirements_matched: z
    .array(z.string().trim().min(2).max(200))
    .max(MAX_BRIEF_REQUIREMENTS)
    .optional()
    .describe('The requirement phrases you checked with match_requirements. Yitz sees them stamped with the same verdicts.'),
  found_via: text(160, 'How you found this site, for example "llms.txt", "LinkedIn", "search", "a referral".'),
  agent: z
    .object({
      name: text(80, 'The agent or assistant, for example "Claude" or "ChatGPT".'),
      platform: text(120, 'Where it runs, for example "claude.ai", "ChatGPT agent", "Claude Code".'),
      model: text(80, 'The model, if known.'),
    })
    .optional()
    .describe('Who is sending this brief.'),
} as const

export const opportunitySchema = z.object(opportunityShape).superRefine((brief, ctx) => {
  if (brief.no_public_posting) {
    if (!brief.team_context) ctx.addIssue({ code: 'custom', path: ['team_context'], message: 'team_context is required when no_public_posting is true.' })
    if (!brief.product_context) ctx.addIssue({ code: 'custom', path: ['product_context'], message: 'product_context is required when no_public_posting is true.' })
  } else if (!brief.posting_url) {
    ctx.addIssue({ code: 'custom', path: ['posting_url'], message: 'posting_url is required. If there is no public posting, set no_public_posting: true and describe the team and product instead.' })
  }
})

export type OpportunityInput = z.input<typeof opportunitySchema>
export type OpportunityData = z.output<typeof opportunitySchema>

/** Field order and short notes for the fill-in template and the form. */
export const BRIEF_FIELDS: Array<{ key: keyof typeof opportunityShape; required: boolean | 'conditional'; note: string }> = [
  { key: 'title', required: true, note: 'Role title, as posted.' },
  { key: 'company_name', required: true, note: 'Hiring company.' },
  { key: 'company_domain', required: true, note: 'Company web domain, e.g. example.com.' },
  { key: 'posting_url', required: 'conditional', note: 'Public job posting. Required unless no_public_posting is true.' },
  { key: 'no_public_posting', required: false, note: 'true for a search with no public posting; then team_context and product_context are required.' },
  { key: 'job_location', required: true, note: 'Where the role is based.' },
  { key: 'work_arrangement', required: true, note: 'remote, hybrid or onsite.' },
  { key: 'employment_type', required: false, note: 'FULL_TIME, CONTRACTOR, PART_TIME, TEMPORARY or OTHER.' },
  { key: 'contact_name', required: true, note: 'Who Yitz should reply to.' },
  { key: 'contact_email', required: true, note: 'Their work email.' },
  { key: 'contact_role', required: false, note: 'Hiring manager, recruiter, founder.' },
  { key: 'contact_linkedin', required: false, note: 'If they prefer LinkedIn.' },
  { key: 'why_this_person', required: true, note: 'Why Yitz: cite a project, article or match.' },
  { key: 'team_context', required: 'conditional', note: 'Team size, what it owns, who leads it.' },
  { key: 'product_context', required: 'conditional', note: 'The product or projects this role works on.' },
  { key: 'stack', required: false, note: 'Languages, frameworks, models, infrastructure.' },
  { key: 'first_90_days', required: false, note: 'What the role does first.' },
  { key: 'hiring_process', required: false, note: 'Steps and timeline.' },
  { key: 'ats_platform', required: false, note: 'Your applicant tracking system.' },
  { key: 'ats_ai_screening', required: false, note: 'yes, no or unknown.' },
  { key: 'application_url', required: false, note: 'If an application in your ATS is needed.' },
  { key: 'preferred_next_step', required: false, note: 'What Yitz should do next.' },
  { key: 'comp_band', required: false, note: 'If you can share it.' },
  { key: 'valid_through', required: false, note: 'When the opening closes (ISO date).' },
  { key: 'requirements_matched', required: false, note: 'Phrases you checked with match_requirements.' },
  { key: 'found_via', required: false, note: 'How you found this site.' },
  { key: 'agent', required: false, note: '{ "name", "platform", "model" } of the sending agent.' },
  { key: 'consent', required: true, note: `true only if: "${CONSENT_STATEMENT}"` },
]
