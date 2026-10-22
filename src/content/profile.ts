/**
 * Fallback profile, used only when the CMS is unreachable. The real profile (bio, experience,
 * highlights, locations) lives in the Payload Profile global; its seed is kept outside this public
 * repository (see scripts/seed.ts, PRIVATE_SEED_DIR).
 */
import { SITE } from './site'

export const DEFAULT_PROFILE = {
  name: SITE.name,
  jobTitles: ['Full-stack engineer', 'AI engineer'],
  headline: 'Every layer of the stack. Including the new one.',
  intro: SITE.description,
  summary: SITE.description,
  aboutMarkdown: '',
  highlights: [] as string[],
  education: [] as Array<{ name: string; field?: string; url?: string }>,
  locations: [] as Array<{ city: string; region?: string; country?: string }>,
  languages: [] as Array<{ name: string; code: string }>,
}
