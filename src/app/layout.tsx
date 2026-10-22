import React from 'react'
import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/seo/site-url'

/**
 * Minimal root layout. Each route group provides its own <html> and <body>:
 * - (frontend)/layout.tsx: Vouch Networks corporate site with Tailwind, fonts, nav, footer
 * - (payload)/layout.tsx: Payload CMS admin with its own styles and providers
 */
// [foundation] Absolute base for metadata URLs on routes outside the frontend layout (the global
// 404, the CMS admin), so the root opengraph-image never resolves against localhost.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
