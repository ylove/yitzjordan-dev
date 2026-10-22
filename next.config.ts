import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'serial=()',
      'bluetooth=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'browsing-topics=()',
    ].join(', '),
  },
]

/**
 * Content-Security-Policy for the public site. Next.js inlines its bootstrap scripts, hence
 * 'unsafe-inline' for scripts; everything external is listed explicitly. The Payload admin and
 * the API are excluded (the admin loads its code editor from a CDN).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com https://*.public.blob.vercel-storage.com",
  "media-src 'self' https://*.public.blob.vercel-storage.com",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.youtube-nocookie.com',
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

const ADMIN_SEGMENT = (process.env.PAYLOAD_ADMIN_ROUTE || 'admin').replace(/^\/+|\/+$/g, '')

/** Articles from ylove.github.io lived at the root; they now live under /research. */
const LEGACY_ARTICLES = ['llms-freestyling', 'llms-freestyling-2', 'llm-default-personas']

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },

  // OG images read Geist from node_modules at runtime. List the two files so they are always
  // traced into server bundles, including per-route opengraph-image handlers.
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf',
      './node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf',
    ],
  },

  async redirects() {
    return [
      ...LEGACY_ARTICLES.flatMap((slug) => [
        { source: `/${slug}`, destination: `/research/${slug}`, permanent: true },
        { source: `/${slug}/`, destination: `/research/${slug}`, permanent: true },
        { source: `/${slug}/index.html`, destination: `/research/${slug}`, permanent: true },
      ]),
      { source: '/index.html', destination: '/', permanent: true },
    ]
  },

  async rewrites() {
    return [
      { source: '/research/:slug([a-z0-9-]+)\\.md', destination: '/md/research/:slug' },
      { source: '/blog/:slug([a-z0-9-]+)\\.md', destination: '/md/blog/:slug' },
      { source: '/work/:slug([a-z0-9-]+)\\.md', destination: '/md/work/:slug' },
      { source: '/index.md', destination: '/llms.txt' },
    ]
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: `/((?!api/|${ADMIN_SEGMENT}|_next/).*)`,
        headers: [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }],
      },
    ]
  },
}

export default withPayload(nextConfig)
