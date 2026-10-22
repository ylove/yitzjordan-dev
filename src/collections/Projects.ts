import type { CollectionConfig, Field } from 'payload'
import { GITHUB_CTA_LABELS, STATUS_LABELS, type ProjectStatus } from '../content/site'
import { VISUAL_KEYS } from '../components/pages/work/visuals/keys'
import { publishHooks } from '../lib/cms/publish-hooks'
import { anyone, isStaff } from './shared/access'
import { slugField } from './shared/slug'

const hooks = publishHooks({
  pathOf: (doc) => (typeof doc.slug === 'string' ? `/work/${doc.slug}` : null),
  lists: ['/work'],
})

const titleBody = (bodyRequired = true): Field[] => [
  { name: 'title', type: 'text', required: true },
  { name: 'body', type: 'textarea', required: bodyRequired },
]

/**
 * Work: the open-source tools and products, one page each at /work/<slug>. The page follows the
 * vouchnetworks.org product-page arc (hero, how it works, capabilities, figures, install, FAQ)
 * written for B2B decision makers, plus engineering notes, which are Yitz's own.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'featured', 'order', 'updatedAt'],
    description: 'Each project gets a page at /work/<slug>. Every figure must be checkable.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [hooks.afterChange], afterDelete: [hooks.afterDelete] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            { name: 'name', type: 'text', required: true },
            {
              name: 'oneLiner',
              type: 'text',
              required: true,
              admin: { description: 'Under 90 characters. Shown on cards and in llms.txt.' },
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
              admin: { description: 'Two or three plain sentences: what it is and who it is for. Meta description and schema.org description.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'open-source',
                  options: (Object.keys(STATUS_LABELS) as ProjectStatus[]).map((value) => ({ value, label: STATUS_LABELS[value] })),
                },
                {
                  name: 'statusLabel',
                  type: 'text',
                  admin: { description: 'Honest wording, e.g. "Open source, release candidate". Defaults to the status.' },
                },
              ],
            },
            {
              name: 'hero',
              type: 'group',
              fields: [
                { name: 'headline', type: 'text', required: true, admin: { description: 'Two to seven words. A verb or a contrast.' } },
                { name: 'lead', type: 'textarea', required: true, admin: { description: 'The 40 to 60 word direct answer that opens the page.' } },
              ],
            },
          ],
        },
        {
          label: 'Links',
          fields: [
            { name: 'github', type: 'text', admin: { description: 'Repository URL. Drives the primary CTA and SoftwareSourceCode schema.' } },
            {
              name: 'githubCta',
              type: 'select',
              defaultValue: 'view',
              options: Object.entries(GITHUB_CTA_LABELS).map(([value, label]) => ({ value, label })),
              admin: { description: 'Use Follow when it is not installable yet.' },
            },
            { name: 'homepage', type: 'text', admin: { description: "The project's own site, e.g. https://lawglass.xyz." } },
            {
              type: 'row',
              fields: [
                { name: 'officialUrl', type: 'text', admin: { description: 'Official product page, e.g. on vouchnetworks.org.' } },
                { name: 'officialLabel', type: 'text', admin: { description: 'e.g. "Lawglass at Vouch Networks".' } },
              ],
            },
            {
              name: 'secondaryCta',
              type: 'group',
              admin: { description: 'Optional second button. Leave empty to use LinkedIn.' },
              fields: [
                { name: 'label', type: 'text' },
                { name: 'href', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Page',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'visual', type: 'select', defaultValue: 'none', options: VISUAL_KEYS.map(({ value, label }) => ({ value, label })) },
                { name: 'visualCaption', type: 'text' },
              ],
            },
            { name: 'stepsTitle', type: 'text', admin: { description: 'Heading for "How it works". Default: "How it works".' } },
            { name: 'steps', type: 'array', fields: titleBody() },
            { name: 'audienceTitle', type: 'text', admin: { description: 'Heading for the "who it is for" section.' } },
            {
              name: 'audiences',
              type: 'array',
              admin: { description: 'Who it is for, in B2B terms: the team, the problem, the outcome.' },
              fields: titleBody(),
            },
            { name: 'capabilitiesTitle', type: 'text' },
            { name: 'capabilities', type: 'array', fields: titleBody(false) },
            {
              name: 'figures',
              type: 'array',
              maxRows: 4,
              admin: { description: 'Only numbers anyone can check. Source says where.' },
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
                { name: 'source', type: 'text', admin: { description: 'URL or short note, e.g. "eval/results.md".' } },
              ],
            },
            {
              name: 'install',
              type: 'group',
              fields: [
                { name: 'title', type: 'text', admin: { description: 'e.g. "Run it yourself."' } },
                { name: 'intro', type: 'textarea' },
                { name: 'commands', type: 'textarea', admin: { description: 'One command per line. Lines starting with # are comments.' } },
                { name: 'note', type: 'textarea' },
              ],
            },
            {
              name: 'engineeringNotes',
              type: 'array',
              admin: { description: 'Decisions and tradeoffs, in your words. What separates this page from a product page.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
            {
              name: 'faq',
              type: 'array',
              fields: [
                { name: 'q', label: 'Question', type: 'text', required: true },
                { name: 'a', label: 'Answer', type: 'textarea', required: true, admin: { description: 'Plain text, 40 to 60 words. Also the FAQPage answer.' } },
              ],
            },
          ],
        },
        {
          label: 'Schema',
          fields: [
            {
              name: 'schemaType',
              type: 'select',
              defaultValue: 'source-code',
              options: [
                { value: 'source-code', label: 'SoftwareSourceCode (open source)' },
                { value: 'application', label: 'SoftwareApplication' },
                { value: 'organization', label: 'Organization (a company, e.g. Vouch Networks)' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'license', type: 'text', admin: { description: 'SPDX id, e.g. MIT or Apache-2.0.' } },
                { name: 'language', type: 'text', admin: { description: 'Main programming language.' } },
              ],
            },
            { name: 'applicationCategory', type: 'text', defaultValue: 'DeveloperApplication' },
            { name: 'keywords', type: 'text', hasMany: true },
          ],
        },
      ],
    },
    slugField('name'),
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar', description: 'Lower comes first.' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Shown on the home page.' } },
    { name: 'skills', type: 'relationship', relationTo: 'skills', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'relatedArticles', type: 'relationship', relationTo: 'articles', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'relatedVideos', type: 'relationship', relationTo: 'videos', hasMany: true, admin: { position: 'sidebar' } },
  ],
}
