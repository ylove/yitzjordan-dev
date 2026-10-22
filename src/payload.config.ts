import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

// Relative imports on purpose: the Payload CLI loads this file outside Next.js.
import { getPayloadSecret } from './lib/cms/secret'
import { getAllowedOrigins, getPayloadServerUrl } from './lib/seo/site-url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Articles } from './collections/Articles'
import { Projects } from './collections/Projects'
import { Videos } from './collections/Videos'
import { Skills } from './collections/Skills'
import { Evidence } from './collections/Evidence'
import { Inquiries } from './collections/Inquiries'
import { RequirementTerms } from './collections/RequirementTerms'
import { Profile } from './globals/Profile'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * The admin panel lives at /<PAYLOAD_ADMIN_ROUTE>. The value must match the folder name in
 * src/app/(payload)/, so the fallback is that folder name rather than "admin".
 */
const adminRoute = `/${(process.env.PAYLOAD_ADMIN_ROUTE || '428b5e40').replace(/^\/+|\/+$/g, '')}`

const allowedOrigins = getAllowedOrigins()

export const EMAIL_FROM = process.env.EMAIL_FROM || 'site@yitzjordan.dev'

export default buildConfig({
  serverURL: getPayloadServerUrl(),
  csrf: allowedOrigins,
  cors: allowedOrigins,

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - yitzjordan.dev',
      robots: 'noindex, nofollow',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
  },

  routes: {
    admin: adminRoute,
    api: '/api',
  },

  editor: lexicalEditor(),

  collections: [Articles, Projects, Videos, Skills, Evidence, Inquiries, RequirementTerms, Media, Users],

  globals: [Profile],

  db: postgresAdapter({
    pool: {
      // DATABASE_URI locally; the Neon integration on Vercel provides DATABASE_URL.
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
      connectionTimeoutMillis: 10_000,
    },
    schemaName: 'yjdev',
    // Schema changes go through migrations only (npm run migrate:create / npm run migrate).
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  // Only configured when RESEND_API_KEY is set. Without it Payload logs emails to the console.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: EMAIL_FROM,
        defaultFromName: 'yitzjordan.dev',
      })
    : undefined,

  plugins: [
    seoPlugin({
      collections: ['articles', 'projects', 'videos'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }) => {
        const d = doc as Record<string, unknown>
        return `${d.title || d.name || 'Untitled'} | Yitz Jordan`
      },
      generateDescription: ({ doc }) => {
        const d = doc as Record<string, unknown>
        return (d.excerpt as string) || (d.description as string) || ''
      },
    }),
    // Uploads go to Vercel Blob when BLOB_READ_WRITE_TOKEN is set, and to local disk otherwise.
    // alwaysInsertFields keeps the database schema identical in both cases.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      alwaysInsertFields: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  ],

  secret: getPayloadSecret(),

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // The site and the admin use REST only. GraphQL stays off so the schema is not introspectable.
  graphQL: {
    disable: true,
  },

  telemetry: false,

  sharp,
})
