import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from './shared/access'

/**
 * Skills and topics: the vocabulary of the evidence catalog. match_requirements maps each
 * requirement a visiting agent sends onto these by name, key and aliases. Skills marked
 * knowsAbout also appear in the Person's schema.org knowsAbout, linked to Wikidata.
 */
export const Skills: CollectionConfig = {
  slug: 'skills',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'key', 'group', 'knowsAbout'],
    description: 'Vocabulary for the evidence catalog and knowsAbout. Aliases decide what a requirement matches.',
  },
  defaultSort: 'name',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'key', type: 'text', required: true, unique: true, index: true, admin: { description: 'Lowercase id, e.g. "mcp".' } },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'engineering',
      options: [
        { value: 'ai', label: 'AI and agents' },
        { value: 'engineering', label: 'Application engineering' },
        { value: 'frontend', label: 'Front end' },
        { value: 'platform', label: 'Data, cloud and security' },
        { value: 'leadership', label: 'Leadership and product' },
      ],
    },
    {
      name: 'aliases',
      type: 'text',
      hasMany: true,
      admin: { description: 'Other ways a job description says it: "Model Context Protocol", "retrieval-augmented generation".' },
    },
    { name: 'wikidataId', type: 'text', admin: { description: 'e.g. Q2878974. Used for schema.org sameAs.' } },
    { name: 'knowsAbout', type: 'checkbox', defaultValue: true, admin: { description: 'List in the Person schema knowsAbout.' } },
    { name: 'years', type: 'number', admin: { description: 'Optional. Years of hands-on use, if worth stating.' } },
  ],
}
