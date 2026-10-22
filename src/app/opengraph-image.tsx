import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/seo/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Yitz Jordan, full-stack and AI engineer'

export default function Image() {
  return renderOgImage({ title: 'Yitz Jordan', subtitle: 'Full-stack and AI engineer. Founder of Vouch Networks.' })
}
