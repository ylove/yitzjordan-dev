import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/site-url'

/**
 * Search and AI crawlers we explicitly welcome. They are also covered by "*"; naming them makes
 * the intent clear to crawlers that look for their own user agent.
 */
const WELCOME_BOTS = [
  'Googlebot',
  'Bingbot',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'DuckAssistBot',
]

const ADMIN_PATH = `/${(process.env.PAYLOAD_ADMIN_ROUTE || '').replace(/^\/+|\/+$/g, '')}/`
const DISALLOW = ['/api/', ...(ADMIN_PATH !== '//' ? [ADMIN_PATH] : []), '/md/']
/** Agent endpoints sit under /api/ but are meant for agents; the longer Allow rules win. */
const ALLOW = ['/', '/api/mcp', '/api/v1/']

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  return {
    rules: [
      { userAgent: '*', allow: ALLOW, disallow: DISALLOW },
      { userAgent: WELCOME_BOTS, allow: ALLOW, disallow: DISALLOW },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
