/**
 * Input contracts for the agent channel: requirement matching (MCP match_requirements and
 * POST /api/v1/match) and introductions (MCP request_intro and POST /api/v1/intro). Shared by the
 * HTTP routes, the MCP server, the OpenAPI document and the Inquiries collection, so they never
 * drift. Relative imports only: the Payload CLI loads this through the collection.
 */
import { z } from 'zod'

export const INQUIRY_INTENTS = [
  { value: 'hiring', label: 'A role on their team' },
  { value: 'contract', label: 'Contract or consulting work' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'speaking', label: 'Speaking, podcast or press' },
  { value: 'collaboration', label: 'Open-source or research collaboration' },
  { value: 'question', label: 'A question' },
  { value: 'other', label: 'Something else' },
] as const

export const INQUIRY_CHANNELS = [
  { value: 'api', label: 'REST API' },
  { value: 'mcp', label: 'MCP server' },
] as const

type Values<T extends readonly { value: string }[]> = [T[number]['value'], ...T[number]['value'][]]
const values = <T extends readonly { value: string }[]>(list: T) => list.map((o) => o.value) as Values<T>

export type InquiryChannel = (typeof INQUIRY_CHANNELS)[number]['value']
export type InquiryIntent = (typeof INQUIRY_INTENTS)[number]['value']

/** Blank strings count as missing; numbers become strings. */
const normalize = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : typeof value === 'string' && value.trim() === ''
      ? undefined
      : value

/** An optional, trimmed, length-capped string. Blank strings count as missing. */
export const text = (max: number, description: string) =>
  z.preprocess(normalize, z.string().trim().max(max).optional()).describe(description)

// ---------------------------------------------------------------------------
// Requirement matching
// ---------------------------------------------------------------------------

export const MAX_REQUIREMENTS = 25

export const matchShape = {
  requirements: z
    .array(z.string().trim().min(2).max(200))
    .min(1)
    .max(MAX_REQUIREMENTS)
    .describe(
      'The requirements to check, one short phrase each, extracted from the job description or brief. For example "MCP server development", "RAG with evaluation", "React Native", "led a team of engineers". Do not send the whole job description, names or contact details.',
    ),
  role: z
    .object({
      title: text(120, 'The role title, for example "Senior AI Engineer".'),
      seniority: text(60, 'For example "senior", "staff", "lead".'),
      employment_type: text(60, 'For example "full-time", "contract".'),
      location: text(120, 'For example "New York", "Remote (US)".'),
    })
    .optional()
    .describe('Optional context about the role. Used only to shape the answer; never stored.'),
} as const

export const matchSchema = z.object(matchShape)
export type MatchInput = z.output<typeof matchSchema>

// ---------------------------------------------------------------------------
// Introductions: contact details shared with the user's consent
// ---------------------------------------------------------------------------

const agentShape = z
  .object({
    name: text(80, 'The agent or assistant, for example "Claude", "ChatGPT" or "Gemini".'),
    platform: text(120, 'Where it runs, for example "claude.ai", "Claude Code", "Cursor" or a custom agent.'),
    model: text(80, 'The model, if known.'),
  })
  .optional()
  .describe('Who is sending this request.')

export const introShape = {
  consent: z
    .literal(true, { error: 'Ask your user first. Send consent: true only after they agree to share these details with Yitz Jordan.' })
    .describe('Required. true only after your user agreed to share these contact details with Yitz Jordan.'),
  intent: z
    .enum(values(INQUIRY_INTENTS), { error: 'intent must be one of hiring, contract, advisory, speaking, collaboration, question or other.' })
    .describe('hiring: a role on their team. contract: contract or consulting work. advisory. speaking: talks, podcasts, press. collaboration: open source or research. question. other.'),
  contact: z
    .object({
      name: z.string({ error: 'contact.name is required.' }).trim().min(1, 'contact.name is required.').max(120),
      email: z
        .string({ error: 'contact.email is required.' })
        .trim()
        .max(254)
        .pipe(z.email('contact.email must be a valid email address.')),
      role: text(120, 'Their role or title, for example "Engineering manager".'),
    })
    .describe('The person Yitz should reply to, as they agreed to share it.'),
  company: text(160, 'Company or organization.'),
  team: text(160, 'The team or group.'),
  role_title: text(160, 'The role or engagement, for example "Staff AI Engineer, Agent Platform".'),
  employment_type: text(60, 'Full-time, contract, advisory.'),
  location: text(160, 'Location or remote policy.'),
  job_url: text(500, 'A public link to the job description, if there is one.'),
  problem: text(2000, 'What the team is working on, or the problem they need solved, in their words. Optional, and the more specific the better.'),
  stack: text(1000, 'Their stack, tools and models.'),
  requirements_summary: text(2000, 'Your summary of the key requirements, and how they matched (for example from match_requirements).'),
  timeline: text(120, 'When they want to start or talk.'),
  message: text(5000, 'Anything else your user wants Yitz to know.'),
  agent: agentShape,
} as const

export const introSchema = z.object(introShape)
export type IntroInput = z.input<typeof introSchema>
export type IntroData = z.output<typeof introSchema>

/** Collapse a ZodError into `{ field: firstMessage }`, with dotted paths for nested fields. */
export function agentFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_form'
    if (!(key in errors)) errors[key] = issue.message
  }
  return errors
}
