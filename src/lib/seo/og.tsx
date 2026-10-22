/**
 * Open Graph and Twitter card images.
 *
 * Usage in any route segment (Node.js runtime):
 *
 *   // src/app/(frontend)/work/[slug]/opengraph-image.tsx
 *   import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/seo/og'
 *   export const size = OG_SIZE
 *   export const contentType = OG_CONTENT_TYPE
 *   export default function Image() {
 *     return renderOgImage({ title: 'Lawglass', subtitle: 'Know what the bill really says.' })
 *   }
 *
 * Pass `routeImage: true` to pageMetadata() in that route's page.tsx so Next uses these files
 * instead of the site default image. Typographic only: no photos.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

export const OG_COLORS = {
  paper: '#F6F4EF',
  ink: '#15181C',
  muted: '#57534B',
  line: '#DCD8CF',
  cobalt: '#3F5FE0',
} as const

// Literal paths so file tracing picks the fonts up. next.config also lists them explicitly.
let fontsPromise: Promise<{ semibold: Buffer; regular: Buffer }> | null = null

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf')),
    readFile(join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf')),
  ])
    .then(([semibold, regular]) => ({ semibold, regular }))
    .catch((err) => {
      fontsPromise = null
      throw err
    })
  return fontsPromise
}

function titleSize(title: string): number {
  if (title.length <= 28) return 92
  if (title.length <= 48) return 78
  if (title.length <= 72) return 64
  return 54
}

export type OgImageInput = {
  /** The big line. Keep it under about 80 characters. */
  title: string
  /** Optional supporting line under the title. */
  subtitle?: string
  /** Small label above the footer rule, for example "Research" or "Open source". */
  label?: string
}

/** Renders a 1200 x 630 PNG in the site style: paper, graphite type, one cobalt rule. */
export async function renderOgImage({ title, subtitle, label }: OgImageInput): Promise<ImageResponse> {
  const { semibold, regular } = await loadFonts()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: OG_COLORS.paper,
          color: OG_COLORS.ink,
          padding: '72px 80px 60px',
          fontFamily: 'Geist',
        }}
      >
        <div style={{ display: 'flex', width: 72, height: 8, backgroundColor: OG_COLORS.cobalt, borderRadius: 4 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: titleSize(title),
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.3, color: OG_COLORS.muted, maxWidth: 980 }}>{subtitle}</div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `2px solid ${OG_COLORS.line}`,
            paddingTop: 24,
            fontSize: 28,
          }}
        >
          <div style={{ display: 'flex', fontWeight: 600 }}>Yitz Jordan</div>
          <div style={{ display: 'flex', color: OG_COLORS.muted }}>{label ? `${label} · yitzjordan.dev` : 'yitzjordan.dev'}</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Geist', data: semibold, weight: 600, style: 'normal' },
        { name: 'Geist', data: regular, weight: 400, style: 'normal' },
      ],
    },
  )
}
