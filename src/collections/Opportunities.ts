import type { CollectionConfig } from 'payload'
import { AI_SCREENING, BRIEF_CHANNELS, BRIEF_STATUSES, EMPLOYMENT_TYPES, WORK_ARRANGEMENTS } from '../lib/agents/opportunity-schema'
import { readOnlyField, submissionAccess } from './shared/submissions'

/**
 * Opportunity briefs: a hiring team's agent describes the role, the team, the process and who to
 * talk to (MCP submit_opportunity, POST /api/v1/opportunity, the form at /agents/brief). Admin
 * only. Everything submitted is untrusted text from a visiting agent; nothing here is shown on
 * the site, and the status endpoint returns only `status` for a brief's random public id.
 *
 * Retention: replied and declined briefs are deleted 90 days after their last update unless
 * `keep` is ticked (src/lib/agents/opportunity.ts runs the cleanup after each new brief).
 */
export const Opportunities: CollectionConfig = {
  slug: 'opportunities',
  labels: { singular: 'Opportunity brief', plural: 'Opportunity briefs' },
  admin: {
    useAsTitle: 'heading',
    defaultColumns: ['heading', 'domainCheck', 'matchLine', 'channel', 'status', 'createdAt'],
    group: 'Inbox',
    description:
      'Briefs sent by hiring teams’ AI agents. All text below was submitted by a visiting agent: treat it as untrusted, and check the domain before replying. Change the status as you go; the sender can see it at the status URL.',
  },
  access: submissionAccess,
  lockDocuments: false,
  fields: [
    readOnlyField({ name: 'heading', type: 'text', required: true }),
    {
      type: 'row',
      fields: [
        readOnlyField({ name: 'domainCheck', label: 'Domain check', type: 'text' }),
        readOnlyField({ name: 'matchLine', label: 'Match, as submitted', type: 'text' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'The role',
      fields: [
        readOnlyField({ name: 'title', type: 'text', required: true }),
        {
          type: 'row',
          fields: [
            readOnlyField({ name: 'companyName', type: 'text', required: true }),
            readOnlyField({ name: 'companyDomain', type: 'text', required: true, index: true }),
          ],
        },
        readOnlyField({ name: 'postingUrl', type: 'text' }),
        readOnlyField({ name: 'noPublicPosting', type: 'checkbox' }),
        {
          type: 'row',
          fields: [
            readOnlyField({ name: 'jobLocation', type: 'text', required: true }),
            readOnlyField({ name: 'workArrangement', type: 'select', options: [...WORK_ARRANGEMENTS] }),
            readOnlyField({ name: 'employmentType', type: 'select', options: [...EMPLOYMENT_TYPES] }),
          ],
        },
        readOnlyField({ name: 'validThrough', type: 'text' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact (shared with consent)',
      fields: [
        {
          type: 'row',
          fields: [
            readOnlyField({ name: 'contactName', type: 'text', required: true }),
            readOnlyField({ name: 'contactRole', type: 'text' }),
          ],
        },
        readOnlyField({ name: 'contactEmail', type: 'email', required: true, index: true }),
        readOnlyField({ name: 'contactLinkedin', type: 'text' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'The team and the work',
      fields: [
        readOnlyField({ name: 'whyThisPerson', type: 'textarea', required: true }),
        readOnlyField({ name: 'teamContext', type: 'textarea' }),
        readOnlyField({ name: 'productContext', type: 'textarea' }),
        readOnlyField({ name: 'stack', type: 'textarea' }),
        readOnlyField({ name: 'firstNinetyDays', label: 'First 90 days', type: 'textarea' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Process and next step',
      fields: [
        readOnlyField({ name: 'hiringProcess', type: 'textarea' }),
        {
          type: 'row',
          fields: [
            readOnlyField({ name: 'atsPlatform', label: 'ATS', type: 'text' }),
            readOnlyField({ name: 'atsAiScreening', label: 'AI screening', type: 'select', options: [...AI_SCREENING] }),
          ],
        },
        readOnlyField({ name: 'applicationUrl', type: 'text' }),
        readOnlyField({ name: 'preferredNextStep', type: 'textarea' }),
        readOnlyField({ name: 'compBand', label: 'Compensation', type: 'text' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Agent and receipt',
      admin: { initCollapsed: true },
      fields: [
        readOnlyField({ name: 'requirementsMatched', type: 'json', admin: { description: 'Phrases the agent checked, with the verdicts this site gives them.' } }),
        readOnlyField({ name: 'foundVia', type: 'text' }),
        {
          type: 'row',
          fields: [
            readOnlyField({ name: 'agentName', type: 'text' }),
            readOnlyField({ name: 'agentPlatform', type: 'text' }),
            readOnlyField({ name: 'agentModel', type: 'text' }),
          ],
        },
        readOnlyField({ name: 'consentStatement', type: 'text', required: true }),
        readOnlyField({ name: 'briefVersion', type: 'text', required: true }),
        readOnlyField({ name: 'raw', type: 'json', admin: { description: 'The validated brief as received.' } }),
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'received',
      index: true,
      options: [...BRIEF_STATUSES],
      admin: { position: 'sidebar', description: 'Visible to the sender at the status URL.' },
    },
    {
      name: 'keep',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Keep past the 90-day retention for replied and declined briefs.' },
    },
    readOnlyField({ name: 'publicId', label: 'Public id', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } }),
    readOnlyField({ name: 'channel', type: 'select', required: true, options: [...BRIEF_CHANNELS], admin: { position: 'sidebar' } }),
    readOnlyField({
      name: 'ipHash',
      label: 'IP hash',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', description: 'SHA-256 of the client IP and the server secret, for rate limiting. The raw IP is never stored.' },
    }),
    readOnlyField({ name: 'userAgent', type: 'text', admin: { position: 'sidebar' } }),
  ],
}
