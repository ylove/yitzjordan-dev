import { getProjectBySlug } from '@/lib/cms'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/seo/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Project by Yitz Jordan'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  return renderOgImage({
    title: project?.name ?? 'Work',
    subtitle: project?.hero.headline,
    label: project?.statusLabel ?? undefined,
  })
}
