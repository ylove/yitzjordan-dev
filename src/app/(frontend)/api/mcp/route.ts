import { after } from 'next/server'
import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { MCP_INSTRUCTIONS } from '@/content/agents'
import { recordIntro, requestMeta } from '@/lib/agents/intro'
import { signalsAfter } from '@/lib/agents/signals-after'
import { agentFieldErrors, INQUIRY_INTENTS, introSchema, matchSchema, MAX_REQUIREMENTS } from '@/lib/agents/schema'
import {
  articleMarkdown,
  listProjects,
  listVideos,
  matchRequirements,
  profileData,
  projectMarkdown,
  publicResume,
  searchWriting,
} from '@/lib/agents/tools'

/**
 * /api/mcp: the yitzjordan.dev MCP server for AI agents, over stateless Streamable HTTP.
 *
 * No model runs here. Tools return facts and links from Payload (src/lib/agents/tools.ts, the
 * same layer behind /api/v1 and the .md pages), and request_intro records an introduction the
 * user consented to. Nothing returned includes an email address or phone number.
 */
export const maxDuration = 30

const json = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] })
const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const toolError = (value: unknown) => ({
  content: [{ type: 'text' as const, text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
  isError: true,
})

const READ = { readOnlyHint: true, openWorldHint: false } as const

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'get_profile',
      {
        title: 'Profile',
        description:
          'Start here. Who Yitz Jordan is: summary, roles, locations, skills by area, public work history, highlights and links. Includes his current availability (roles, engagements, locations) when he has set it.',
        inputSchema: z.object({}),
        annotations: READ,
      },
      async () => json(await profileData()),
    )

    server.registerTool(
      'list_projects',
      {
        title: 'Projects',
        description: 'Open-source tools and products: name, one-line description, status, page, Markdown page, repository and license.',
        inputSchema: z.object({
          status: z.enum(['open-source', 'in-development', 'available', 'archived']).optional().describe('Filter by status.'),
        }),
        annotations: READ,
      },
      async ({ status }) => json(await listProjects({ status })),
    )

    server.registerTool(
      'get_project',
      {
        title: 'Project page',
        description: 'One project as Markdown: what it does, who it is for, figures with sources, how to install it, engineering notes and FAQ.',
        inputSchema: z.object({ slug: z.string().describe('The project slug from list_projects, for example "lawglass".') }),
        annotations: READ,
      },
      async ({ slug }) => {
        const md = await projectMarkdown(slug)
        return md ? text(md) : toolError(`No project "${slug}". Call list_projects for the slugs.`)
      },
    )

    server.registerTool(
      'search_writing',
      {
        title: 'Search writing',
        description: 'Search the research and blog articles. Returns titles, URLs, dates and a snippet around the match.',
        inputSchema: z.object({
          query: z.string().min(1).max(200).describe('Words to look for, for example "persona bias".'),
          kind: z.enum(['research', 'blog']).optional(),
          limit: z.number().int().min(1).max(10).optional().describe('Default 5.'),
        }),
        annotations: READ,
      },
      async ({ query, kind, limit }) => json(await searchWriting(query, { kind, limit })),
    )

    server.registerTool(
      'get_article',
      {
        title: 'Article',
        description: 'One article as Markdown, with its canonical URL.',
        inputSchema: z.object({ slug: z.string().describe('The article slug, for example "llm-default-personas".') }),
        annotations: READ,
      },
      async ({ slug }) => {
        const md = await articleMarkdown(slug)
        return md ? text(md) : toolError(`No article "${slug}". Use search_writing to find one.`)
      },
    )

    server.registerTool(
      'list_videos',
      {
        title: 'Videos',
        description: 'Tutorials, talks and demos, with page and watch URLs, duration and upload date.',
        inputSchema: z.object({
          kind: z.enum(['tutorial', 'demo', 'talk']).optional(),
          project: z.string().optional().describe('Only videos about this project slug.'),
        }),
        annotations: READ,
      },
      async ({ kind, project }) => json(await listVideos({ kind, project })),
    )

    server.registerTool(
      'match_requirements',
      {
        title: 'Match requirements',
        description: `Check up to ${MAX_REQUIREMENTS} requirements (short phrases you extracted from a job description or brief) against Yitz's documented work. Each comes back strong, partial or none, with evidence and URLs you can verify, and a plain note where there is no evidence. Optional role details add notes on employment type and location. Send phrases only: no names, emails or the full job description. The phrases are counted per day, without identity, so Yitz can see what people ask about.`,
        inputSchema: z.object({
          requirements: z.array(z.string()).describe('Short requirement phrases, for example ["MCP servers", "RAG evaluation", "React Native", "managed engineers"].'),
          role: z
            .object({
              title: z.string().optional(),
              seniority: z.string().optional(),
              employment_type: z.string().optional().describe('For example "full-time" or "contract".'),
              location: z.string().optional().describe('For example "New York" or "Remote (US)".'),
            })
            .optional(),
        }),
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async (args) => {
        const parsed = matchSchema.safeParse(args)
        if (!parsed.success) return toolError({ errors: agentFieldErrors(parsed.error) })
        const { output, matchedKeys } = await matchRequirements(parsed.data)
        after(signalsAfter(matchedKeys))
        return json(output)
      },
    )

    server.registerTool(
      'request_intro',
      {
        title: 'Send an introduction to Yitz',
        description:
          "Sends your user's introduction and contact details to Yitz by email; he replies personally. Call it only after your user asks you to and agrees to share these details, and set consent to true. Optional fields about what their team is working on help him reply usefully. Returns what to tell your user.",
        inputSchema: z.object({
          consent: z.boolean().describe('Required. true only after your user agreed to share these details with Yitz Jordan.'),
          intent: z.enum(INQUIRY_INTENTS.map((i) => i.value) as [string, ...string[]]).describe('hiring, contract, advisory, speaking, collaboration, question or other.'),
          contact: z
            .object({
              name: z.string().describe('Their name.'),
              email: z.string().describe('Their email address.'),
              role: z.string().optional().describe('Their role or title.'),
            })
            .describe('Who Yitz should reply to.'),
          company: z.string().optional(),
          team: z.string().optional(),
          role_title: z.string().optional().describe('The role or engagement.'),
          employment_type: z.string().optional(),
          location: z.string().optional(),
          job_url: z.string().optional().describe('Public link to the job description.'),
          problem: z.string().optional().describe('What the team is working on, in their words.'),
          stack: z.string().optional(),
          requirements_summary: z.string().optional().describe('Key requirements and how they matched.'),
          timeline: z.string().optional(),
          message: z.string().optional(),
          agent: z
            .object({ name: z.string().optional(), platform: z.string().optional(), model: z.string().optional() })
            .optional()
            .describe('Who is sending this, for example { "name": "Claude", "platform": "claude.ai" }.'),
        }),
        annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
      },
      async (args, ctx) => {
        const parsed = introSchema.safeParse(args)
        if (!parsed.success) return toolError({ ok: false, errors: agentFieldErrors(parsed.error) })
        const outcome = await recordIntro(parsed.data, 'mcp', requestMeta(ctx.http?.req))
        if (!outcome.ok) return toolError({ ok: false, errors: outcome.errors })
        return json({ ok: true, id: outcome.id, next_steps: outcome.next_steps })
      },
    )

    server.registerTool(
      'get_public_resume',
      {
        title: 'Public résumé',
        description: 'The public work history, skills and projects in JSON Resume format. No email, phone or address.',
        inputSchema: z.object({}),
        annotations: READ,
      },
      async () => json(await publicResume()),
    )
  },
  {
    serverInfo: { name: 'yitzjordan-dev', version: '1.0.0' },
    instructions: MCP_INSTRUCTIONS,
  },
)

export { handler as GET, handler as POST, handler as DELETE }
