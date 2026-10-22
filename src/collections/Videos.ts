import type { CollectionConfig, FieldHook } from 'payload'
import { publishHooks } from '../lib/cms/publish-hooks'
import { anyone, isStaff } from './shared/access'
import { slugField } from './shared/slug'

const hooks = publishHooks({
  pathOf: (doc) => (typeof doc.slug === 'string' ? `/videos/${doc.slug}` : null),
  lists: ['/videos'],
})

/** Pulls the 11-character id out of any YouTube URL form (watch, shorts, youtu.be, embed). */
export function youtubeIdFrom(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') return u.pathname.slice(1, 12) || null
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v')
      if (v) return v.slice(0, 11)
      const match = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)
      return match?.[1] ?? null
    }
  } catch {
    return null
  }
  return null
}

const deriveYoutubeId: FieldHook = ({ value, siblingData }) => {
  if (siblingData?.platform !== 'youtube') return value ?? null
  return youtubeIdFrom(siblingData?.url) ?? value ?? null
}

/**
 * Videos and demos. YouTube videos embed through a click-to-load facade on youtube-nocookie.com;
 * short demos from other platforms are uploaded as MP4 (Vercel Blob) and link to the original post.
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'platform', 'uploadDate', 'featured'],
    description: 'Each video gets a page at /videos/<slug> with VideoObject data. Fill in duration and upload date: search engines need both.',
  },
  defaultSort: '-uploadDate',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [hooks.afterChange], afterDelete: [hooks.afterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'tutorial',
          options: [
            { value: 'tutorial', label: 'Tutorial' },
            { value: 'demo', label: 'Demo' },
            { value: 'talk', label: 'Talk' },
          ],
        },
        {
          name: 'platform',
          type: 'select',
          required: true,
          defaultValue: 'youtube',
          options: [
            { value: 'youtube', label: 'YouTube' },
            { value: 'upload', label: 'Uploaded file' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'x', label: 'X' },
            { value: 'other', label: 'Other' },
          ],
        },
      ],
    },
    { name: 'url', type: 'text', required: true, admin: { description: 'The watch URL, or the original social post for uploads.' } },
    {
      name: 'youtubeId',
      type: 'text',
      admin: { readOnly: true, description: 'Filled from the URL for YouTube videos.' },
      hooks: { beforeChange: [deriveYoutubeId] },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'MP4 for uploaded demos. Keep it short and under 15 MB.' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional for YouTube (its own thumbnail is used). Required for uploads.' },
    },
    { name: 'description', type: 'textarea', required: true },
    { name: 'transcript', type: 'textarea', admin: { description: 'Optional. Indexed by search and read by agents.' } },
    {
      type: 'row',
      fields: [
        { name: 'durationSeconds', type: 'number', required: true, min: 1 },
        { name: 'uploadDate', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
        { name: 'vertical', type: 'checkbox', defaultValue: false, admin: { description: '9:16 (Shorts, Reels).' } },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'relatedProjects', type: 'relationship', relationTo: 'projects', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'skills', type: 'relationship', relationTo: 'skills', hasMany: true, admin: { position: 'sidebar' } },
  ],
}
