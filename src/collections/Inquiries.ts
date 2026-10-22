import type { CollectionConfig } from 'payload'
import { INQUIRY_CHANNELS, INQUIRY_INTENTS } from '../lib/agents/schema'
import { readOnlyField, submissionAccess, submissionMetaFields } from './shared/submissions'

/**
 * Introductions sent by AI agents on behalf of their users, through the MCP tool request_intro
 * and POST /api/v1/intro. Contact details arrive only with the user's consent (consent: true is
 * required by the schema). Admin-only; nothing here is ever shown on the site or to agents.
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'intent', 'channel', 'agentName', 'status', 'createdAt'],
    group: 'Inbox',
    description: 'Introductions sent by AI agents for their users. Contact details are shared with consent.',
  },
  access: submissionAccess,
  lockDocuments: false,
  fields: [
    readOnlyField({ name: 'title', type: 'text', required: true }),
    {
      type: 'row',
      fields: [
        readOnlyField({ name: 'intent', type: 'select', required: true, options: [...INQUIRY_INTENTS] }),
        readOnlyField({ name: 'channel', type: 'select', required: true, options: [...INQUIRY_CHANNELS] }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact (shared with consent)',
      fields: [
        readOnlyField({ name: 'name', type: 'text', required: true }),
        readOnlyField({ name: 'email', type: 'email', required: true, index: true }),
        readOnlyField({ name: 'contactRole', label: 'Their role', type: 'text' }),
        readOnlyField({ name: 'consent', type: 'checkbox', required: true }),
      ],
    },
    {
      type: 'collapsible',
      label: 'What they are working on',
      fields: [
        readOnlyField({ name: 'company', type: 'text' }),
        readOnlyField({ name: 'team', type: 'text' }),
        readOnlyField({ name: 'roleTitle', label: 'Role or engagement', type: 'text' }),
        readOnlyField({ name: 'employmentType', type: 'text' }),
        readOnlyField({ name: 'location', type: 'text' }),
        readOnlyField({ name: 'jobUrl', label: 'Job description URL', type: 'text' }),
        readOnlyField({ name: 'problem', type: 'textarea' }),
        readOnlyField({ name: 'stack', type: 'textarea' }),
        readOnlyField({ name: 'requirementsSummary', type: 'textarea' }),
        readOnlyField({ name: 'timeline', type: 'text' }),
        readOnlyField({ name: 'message', type: 'textarea' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Agent',
      admin: { initCollapsed: true },
      fields: [
        readOnlyField({ name: 'agentName', type: 'text' }),
        readOnlyField({ name: 'agentPlatform', type: 'text' }),
        readOnlyField({ name: 'agentModel', type: 'text' }),
        readOnlyField({ name: 'raw', type: 'json', admin: { description: 'The validated request as received.' } }),
      ],
    },
    ...submissionMetaFields,
  ],
}
