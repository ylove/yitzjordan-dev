import type { CollectionConfig } from 'payload'
import { isStaff } from './shared/access'

/**
 * The evidence catalog: specific, checkable claims, each tied to skills and, where possible, to
 * a page or repository that proves it. match_requirements returns these, so every entry must be
 * true, public and safe to quote. Only Vouch Networks, Charter and Quartz are named as employers;
 * other roles are described generically.
 */
export const Evidence: CollectionConfig = {
  slug: 'evidence',
  admin: {
    useAsTitle: 'claim',
    defaultColumns: ['claim', 'strength', 'period', 'public'],
    description: 'Checkable claims returned to agents by match_requirements. Never add anything that is not public.',
  },
  access: {
    // Only public entries are readable without a login.
    read: ({ req: { user } }) => (user ? true : { public: { equals: true } }),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: 'claim', type: 'text', required: true, admin: { description: 'One sentence, specific and checkable.' } },
    { name: 'detail', type: 'textarea', admin: { description: 'Optional context, two or three sentences.' } },
    { name: 'skills', type: 'relationship', relationTo: 'skills', hasMany: true, required: true },
    {
      name: 'strength',
      type: 'select',
      required: true,
      defaultValue: 'production',
      options: [
        { value: 'production', label: 'Production work' },
        { value: 'open-source', label: 'Open-source code' },
        { value: 'research', label: 'Published research' },
        { value: 'writing', label: 'Writing or video' },
      ],
    },
    {
      name: 'proof',
      type: 'relationship',
      relationTo: ['projects', 'articles', 'videos'],
      admin: { description: 'The page that proves it, if any.' },
    },
    { name: 'externalUrl', type: 'text', admin: { description: 'A public URL that proves it (repo, file, post).' } },
    { name: 'context', type: 'text', admin: { description: 'Where, e.g. "Vouch Networks" or a generic label such as "a logistics startup".' } },
    { name: 'period', type: 'text', admin: { description: 'e.g. "2025 to present" or "2014 to 2020".' } },
    { name: 'public', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'weight', type: 'number', defaultValue: 50, admin: { position: 'sidebar', description: '0 to 100. Breaks ties when ranking.' } },
  ],
}
