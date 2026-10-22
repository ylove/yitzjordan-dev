/** Workflow statuses shared by submission collections (src/collections/Inquiries.ts). */
export const SUBMISSION_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
] as const

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]['value']
