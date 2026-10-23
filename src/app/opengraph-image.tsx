import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/seo/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Yitz Jordan, AI technical lead and full-stack engineer'

export default function Image() {
  return renderOgImage({ title: 'Yitz Jordan', subtitle: 'AI technical lead. Over 20 years of full-stack engineering. Founder of Vouch Networks.' })
}
