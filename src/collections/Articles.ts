import type { CollectionConfig } from 'payload'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { ARTICLE_KINDS, articlePath } from '../content/site'
import { articleBodyField } from '../fields/articleBody'
import { publishHooks } from '../lib/cms/publish-hooks'
import { isStaff, publishedOrStaff } from './shared/access'
import { slugField } from './shared/slug'

const hooks = publishHooks({
  pathOf: (doc) => (typeof doc.slug === 'string' ? articlePath(doc.kind as string, doc.slug) : null),
  lists: ['/writing', '/research', '/blog'],
})

const WORDS_PER_MINUTE = 230

/**
 * Research and blog articles. Research lives at /research/<slug>, blog posts at /blog/<slug>.
 * The three articles from ylove.github.io were imported by scripts/import-legacy.ts.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'status', 'publishDate', 'updatedAt'],
    description: 'Research and blog articles. Research: /research/<slug>. Blog: /blog/<slug>.',
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        const next = { ...data }
        if (next.status === 'published' && !next.publishDate) next.publishDate = new Date().toISOString()
        // Plain text for search, reading time, llms-full.txt and the MCP search tool.
        if (next.body) {
          try {
            const text = convertLexicalToPlaintext({ data: next.body as SerializedEditorState })
            const words = text.split(/\s+/).filter(Boolean).length
            next.plainText = text
            next.wordCount = words
            next.readingMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
          } catch {
            // Leave the previous values; a malformed body fails validation elsewhere.
          }
        }
        return next
      },
    ],
    afterChange: [hooks.afterChange],
    afterDelete: [hooks.afterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'research',
      index: true,
      options: ARTICLE_KINDS.map(({ value, label }) => ({ value, label })),
      admin: { position: 'sidebar', description: 'Research: experiments and findings. Blog: notes and essays.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishDate',
      type: 'date',
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'updatedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description: 'Set when the substance changes. Shown on the page and used as dateModified.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: { description: 'One or two sentences. Used on index pages, in feeds and as the default meta description.' },
    },
    articleBodyField({ required: true }),
    {
      name: 'anchors',
      type: 'array',
      admin: {
        description:
          'Stable ids for H2 sections, so links like /research/x#relevance keep working. Matched to H2s by heading text; H2s without an entry get an id from their text.',
        initCollapsed: true,
      },
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'anchorId', type: 'text', required: true, admin: { description: 'Lowercase, hyphens.' } },
      ],
    },
    {
      name: 'keywords',
      type: 'text',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'topics',
      type: 'relationship',
      relationTo: 'skills',
      hasMany: true,
      admin: { position: 'sidebar', description: 'Skills this article demonstrates. Feeds the evidence catalog.' },
    },
    { name: 'previous', type: 'relationship', relationTo: 'articles', admin: { position: 'sidebar', description: 'Earlier article in a series.' } },
    { name: 'relatedProjects', type: 'relationship', relationTo: 'projects', hasMany: true },
    { name: 'relatedVideos', type: 'relationship', relationTo: 'videos', hasMany: true },
    {
      name: 'legacyPath',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'Its URL on ylove.github.io, if it was imported.' },
    },
    { name: 'plainText', type: 'textarea', admin: { hidden: true } },
    { name: 'wordCount', type: 'number', admin: { hidden: true } },
    { name: 'readingMinutes', type: 'number', admin: { hidden: true } },
  ],
}
