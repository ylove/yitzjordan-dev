import type { Metadata, Viewport } from 'next'
import { fontVariables } from '../fonts'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SkipLink } from '@/components/layout/SkipLink'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { baseMetadata } from '@/lib/seo/metadata'
import { personJsonLd, vouchOrganizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { getProfile, mediaOf } from '@/lib/cms'
import '../globals.css'

export const metadata: Metadata = baseMetadata()

export const viewport: Viewport = {
  themeColor: '#F6F4EF',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="Yitz Jordan" />
      </head>
      <body className="flex min-h-dvh flex-col bg-surface font-sans text-ink">
        <SkipLink />
        <MotionProvider>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
        </MotionProvider>
        <Footer />
        {/* WebSite, Person and the Vouch Networks stub on every page, so every "@id" resolves. */}
        <JsonLd
          data={[websiteJsonLd(), personJsonLd(profile, { imageUrl: mediaOf(profile?.photo)?.url }), vouchOrganizationJsonLd()]}
          id="site-jsonld"
        />
      </body>
    </html>
  )
}
