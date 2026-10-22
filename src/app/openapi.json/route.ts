import { z } from 'zod'
import { SITE } from '@/content/site'
import { introSchema, matchSchema } from '@/lib/agents/schema'
import { absoluteUrl } from '@/lib/seo/site-url'

export const dynamic = 'force-static'

const schemaOf = (s: z.ZodType) => z.toJSONSchema(s, { io: 'input', unrepresentable: 'any', target: 'openapi-3.0' })

const errorResponse = {
  description: 'Validation failed or the request was refused.',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: { ok: { type: 'boolean' }, errors: { type: 'object', additionalProperties: { type: 'string' } } },
      },
    },
  },
}
const jsonOk = (description: string) => ({ description, content: { 'application/json': { schema: { type: 'object' } } } })

/** OpenAPI 3.1 for /api/v1, the REST twin of the MCP server. Request schemas come from the zod contracts. */
export function GET() {
  const doc = {
    openapi: '3.1.0',
    info: {
      title: `${SITE.name} agent API`,
      version: '1.0.0',
      description:
        'Read-mostly API for AI agents: profile, projects, writing, videos, requirement matching with verifiable evidence, and consented introductions. No model runs on the server. Same data as the MCP server at /api/mcp.',
      contact: { name: SITE.name, url: SITE.links.linkedin },
    },
    servers: [{ url: absoluteUrl('/api/v1') }],
    externalDocs: { url: absoluteUrl('/AGENTS.md') },
    paths: {
      '/profile': { get: { operationId: 'getProfile', summary: 'Profile, roles, skills, public experience, availability and links.', responses: { 200: jsonOk('The profile.') } } },
      '/projects': {
        get: {
          operationId: 'listProjects',
          summary: 'Open-source tools and products.',
          parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['open-source', 'in-development', 'available', 'archived'] } }],
          responses: { 200: jsonOk('Projects.') },
        },
      },
      '/projects/{slug}': {
        get: {
          operationId: 'getProject',
          summary: 'One project page as Markdown.',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Markdown.', content: { 'text/markdown': { schema: { type: 'string' } } } }, 404: errorResponse },
        },
      },
      '/writing': {
        get: {
          operationId: 'searchWriting',
          summary: 'Search articles.',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' } },
            { name: 'kind', in: 'query', schema: { type: 'string', enum: ['research', 'blog'] } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 10 } },
          ],
          responses: { 200: jsonOk('Matching articles.') },
        },
      },
      '/videos': {
        get: {
          operationId: 'listVideos',
          summary: 'Videos.',
          parameters: [
            { name: 'kind', in: 'query', schema: { type: 'string', enum: ['tutorial', 'demo', 'talk'] } },
            { name: 'project', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: jsonOk('Videos.') },
        },
      },
      '/match': {
        post: {
          operationId: 'matchRequirements',
          summary: 'Check requirement phrases against documented work. Phrases are counted per day without identity.',
          requestBody: { required: true, content: { 'application/json': { schema: schemaOf(matchSchema) } } },
          responses: { 200: jsonOk('Per-requirement verdicts with evidence and URLs.'), 400: errorResponse },
        },
      },
      '/intro': {
        post: {
          operationId: 'requestIntro',
          summary: "Send the user's introduction to Yitz by email. Requires consent: true.",
          requestBody: { required: true, content: { 'application/json': { schema: schemaOf(introSchema) } } },
          responses: { 201: jsonOk('Sent. Includes what to tell the user.'), 400: errorResponse, 429: errorResponse },
        },
      },
    },
  }
  return Response.json(doc, { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' } })
}
