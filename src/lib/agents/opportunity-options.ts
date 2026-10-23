/**
 * Option lists and fixed strings for opportunity briefs, with no dependencies, so the form on
 * /agents/brief can import them without pulling the validation library into the browser.
 */

export const BRIEF_VERSION = 'opportunity-brief/0.1'

/** What `consent: true` attests. Recorded with every brief, with BRIEF_VERSION. */
export const CONSENT_STATEMENT =
  'The person I work for asked me to send this brief and knows these details will be shared with Yitz Jordan.'

export const WORK_ARRANGEMENTS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On site' },
] as const

/** schema.org JobPosting employmentType values. */
export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'CONTRACTOR', label: 'Contract' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'OTHER', label: 'Other' },
] as const

export const AI_SCREENING = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Not sure' },
] as const

/** received -> in_review -> replied | declined. Set by Yitz in the admin; read by the status endpoint. */
export const BRIEF_STATUSES = [
  { value: 'received', label: 'Received' },
  { value: 'in_review', label: 'In review' },
  { value: 'replied', label: 'Replied' },
  { value: 'declined', label: 'Declined' },
] as const

export const BRIEF_CHANNELS = [
  { value: 'api', label: 'REST API' },
  { value: 'mcp', label: 'MCP server' },
  { value: 'form', label: 'Form on /agents/brief' },
] as const

export type BriefChannel = (typeof BRIEF_CHANNELS)[number]['value']
export type BriefStatus = (typeof BRIEF_STATUSES)[number]['value']
