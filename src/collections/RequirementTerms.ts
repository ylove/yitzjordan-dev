import type { CollectionConfig } from 'payload'
import { isAdmin, nobody } from './shared/access'

/**
 * Daily counts of the requirement terms agents send to match_requirements, normalized to skill
 * keys where possible. No IPs, no request text, no identity: a term with an @, a URL or a long
 * digit run is dropped before it gets here (src/lib/agents/signals.ts). Disclosed in the tool
 * description, on /agents and on /privacy.
 */
export const RequirementTerms: CollectionConfig = {
  slug: 'requirement-terms',
  admin: {
    useAsTitle: 'term',
    defaultColumns: ['day', 'term', 'skill', 'matched', 'count'],
    group: 'Inbox',
    description: 'What agents ask about, counted per day. Aggregate only.',
  },
  defaultSort: '-day',
  access: { read: isAdmin, create: nobody, update: nobody, delete: isAdmin },
  lockDocuments: false,
  indexes: [{ fields: ['day', 'term'], unique: true }],
  fields: [
    { name: 'day', type: 'text', required: true, index: true, admin: { description: 'YYYY-MM-DD (UTC).' } },
    { name: 'term', type: 'text', required: true },
    { name: 'skill', type: 'text', admin: { description: 'Matched skill key, if any.' } },
    { name: 'matched', type: 'checkbox', defaultValue: false },
    { name: 'count', type: 'number', required: true, defaultValue: 1 },
  ],
}
