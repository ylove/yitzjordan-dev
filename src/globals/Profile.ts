import type { GlobalConfig, TextFieldSingleValidation } from 'payload'
import { safeRevalidate } from '../lib/cms/revalidate'
import { anyone, isStaff } from '../collections/shared/access'

/**
 * Hosts the Person's sameAs never points to: encyclopedia entries and entertainment profiles.
 * The site's entity is professional and links only to professional profiles (docs/seo.md).
 */
const BLOCKED_HOSTS = [
  'wikipedia.org',
  'wikidata.org',
  'spotify.com',
  'music.apple.com',
  'soundcloud.com',
  'bandcamp.com',
  'genius.com',
  'last.fm',
  'deezer.com',
  'tidal.com',
  'allmusic.com',
  'discogs.com',
  'musicbrainz.org',
]
export function sameAsProblem(value: string): string | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'Enter a full URL starting with https://.'
  }
  const host = url.hostname.toLowerCase()
  if (BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return `${host} is not a professional profile. sameAs links only to profiles such as LinkedIn and GitHub.`
  }
  return null
}

const validateSameAs: TextFieldSingleValidation = (value) => (value ? (sameAsProblem(value) ?? true) : true)

/**
 * The single source of truth about Yitz: the home page, /about, llms.txt, the MCP server and the
 * Person JSON-LD all read this. Copy here must stay evergreen; `availability` is the one
 * time-sensitive field and is only ever shown to agents.
 */
export const Profile: GlobalConfig = {
  slug: 'profile',
  admin: { description: 'Who Yitz is. Feeds the home page, /about, llms.txt, the MCP server and the Person schema.' },
  access: { read: anyone, update: isStaff },
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        safeRevalidate([{ path: '/', type: 'layout' }, '/llms.txt', '/llms-full.txt', '/AGENTS.md', '/resume.json'], req)
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, defaultValue: 'Yitz Jordan' },
                { name: 'givenName', type: 'text', defaultValue: 'Yitz' },
                { name: 'familyName', type: 'text', defaultValue: 'Jordan' },
              ],
            },
            {
              name: 'jobTitles',
              type: 'text',
              hasMany: true,
              required: true,
              admin: { description: 'For schema.org jobTitle and llms.txt. Roles, never a job search.' },
            },
            { name: 'headline', type: 'text', required: true, admin: { description: 'The home page H1. Two to ten words.' } },
            { name: 'intro', type: 'textarea', required: true, admin: { description: 'Home page lead: two or three sentences in the first person.' } },
            { name: 'summary', type: 'textarea', required: true, admin: { description: 'Third-person summary for llms.txt, agents and schema description.' } },
            { name: 'about', type: 'richText', admin: { description: 'The /about page body.' } },
            {
              type: 'row',
              fields: [
                { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'One professional headshot, the same as LinkedIn.' } },
              ],
            },
          ],
        },
        {
          label: 'Background',
          fields: [
            {
              name: 'highlights',
              type: 'array',
              admin: { description: 'Short, checkable facts for /about and agents. No year counts that read as an age.' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'experience',
              type: 'array',
              admin: { description: 'Only Vouch Networks, Charter and Quartz are named. Everything else uses a generic label.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'display',
                      type: 'select',
                      required: true,
                      defaultValue: 'generic',
                      options: [
                        { value: 'named', label: 'Named employer' },
                        { value: 'generic', label: 'Generic description' },
                      ],
                    },
                    {
                      name: 'schemaRole',
                      type: 'select',
                      required: true,
                      defaultValue: 'none',
                      options: [
                        { value: 'worksFor', label: 'worksFor (current)' },
                        { value: 'alumniOf', label: 'alumniOf (past)' },
                        { value: 'none', label: 'Not in schema' },
                      ],
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'orgName', type: 'text', admin: { condition: (_, s) => s?.display === 'named' } },
                    { name: 'orgUrl', type: 'text', admin: { condition: (_, s) => s?.display === 'named' } },
                    { name: 'orgWikidataId', type: 'text', admin: { condition: (_, s) => s?.display === 'named' } },
                    { name: 'orgId', label: 'Organization @id', type: 'text', admin: { condition: (_, s) => s?.display === 'named', description: 'e.g. https://www.vouchnetworks.org/#organization' } },
                  ],
                },
                { name: 'genericLabel', type: 'text', admin: { condition: (_, s) => s?.display === 'generic', description: 'e.g. "a logistics startup".' } },
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'start', type: 'text', admin: { description: 'YYYY or YYYY-MM' } },
                    { name: 'end', type: 'text', admin: { description: 'Empty for current' } },
                  ],
                },
                { name: 'summary', type: 'textarea' },
              ],
            },
            {
              name: 'education',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'field', type: 'text' },
                    { name: 'url', type: 'text' },
                    { name: 'wikidataId', type: 'text' },
                  ],
                },
              ],
            },
            {
              name: 'locations',
              type: 'array',
              admin: { description: 'homeLocation in the schema. The first is primary.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'city', type: 'text', required: true },
                    { name: 'region', type: 'text' },
                    { name: 'country', type: 'text', defaultValue: 'US' },
                    { name: 'wikidataId', type: 'text' },
                  ],
                },
              ],
            },
            {
              name: 'languages',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'code', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'sameAs',
              type: 'array',
              admin: { description: 'Professional profiles of the same person, such as LinkedIn and GitHub. Encyclopedia and entertainment hosts are refused.' },
              fields: [{ name: 'url', type: 'text', required: true, validate: validateSameAs }],
            },
          ],
        },
        {
          label: 'For agents',
          description: 'Shown only to AI agents (MCP get_profile, /resume.json). Never rendered on pages, so the site stays evergreen.',
          fields: [
            {
              name: 'availability',
              type: 'group',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'unspecified',
                  options: [
                    { value: 'open', label: 'Open to conversations' },
                    { value: 'selective', label: 'Selective' },
                    { value: 'not-looking', label: 'Not looking' },
                    { value: 'unspecified', label: 'Do not say' },
                  ],
                },
                { name: 'roles', type: 'text', hasMany: true, admin: { description: 'e.g. "AI technical lead", "Senior full-stack engineer".' } },
                { name: 'engagements', type: 'text', hasMany: true, admin: { description: 'e.g. "Full-time", "Contract".' } },
                { name: 'workLocations', type: 'text', hasMany: true, admin: { description: 'e.g. "New York", "Columbus", "Remote (US)".' } },
                { name: 'note', type: 'textarea' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
