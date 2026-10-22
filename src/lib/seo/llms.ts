/**
 * llms.txt (https://llmstxt.org) and llms-full.txt, generated from Payload so they never drift
 * from the site. Links point to the Markdown twins where they exist. Server only.
 */
import { AGENT_PATHS, SURFACES, TOOLS } from '@/content/agents'
import { DEFAULT_PROFILE } from '@/content/profile'
import { SITE, STATUS_LABELS, articlePath } from '@/content/site'
import { articleToMarkdown, experienceLines, projectToMarkdown, videoLine } from '@/lib/agents/markdown'
import { getArticles, getArticlesWithBody, getProfile, getProjects, getVideos } from '@/lib/cms'
import { lexicalToMarkdown } from '@/lib/richtext/markdown'
import { absoluteUrl } from './site-url'

export async function buildLlmsTxt(): Promise<string> {
  const [profile, projects, articles, videos] = await Promise.all([getProfile(), getProjects(), getArticles(), getVideos()])
  const summary = profile?.summary ?? DEFAULT_PROFILE.summary
  const lines: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${summary}`,
    '',
    `This file maps ${new URL(absoluteUrl('/')).host} for language models and AI agents. Every page has a Markdown version (add .md to article and /work URLs). The best way for a person to reach Yitz is LinkedIn: ${SITE.links.linkedin}. Agents can also use the MCP server below.`,
    '',
    '## About',
    '',
    `- [About ${SITE.name}](${absoluteUrl('/about')}): background, experience and skills`,
    `- [Public résumé (JSON Resume)](${absoluteUrl(AGENT_PATHS.resume)}): work history, skills and projects; no contact details`,
    `- [LinkedIn](${SITE.links.linkedin}): preferred contact`,
    `- [GitHub](${SITE.links.github})`,
    `- [Vouch Networks](${SITE.links.vouch}): the company he founded, which builds community safety apps`,
    '',
  ]
  if (projects.length) {
    lines.push('## Work', '')
    for (const p of projects) {
      lines.push(`- [${p.name}](${absoluteUrl(`/work/${p.slug}.md`)}): ${p.oneLiner} (${p.statusLabel || STATUS_LABELS[p.status]}${p.github ? `; ${p.github}` : ''})`)
    }
    lines.push('')
  }
  if (articles.length) {
    lines.push('## Research and writing', '')
    for (const a of articles) lines.push(`- [${a.title}](${absoluteUrl(`${articlePath(a.kind, a.slug)}.md`)}): ${a.excerpt}`)
    lines.push('')
  }
  if (videos.length) {
    lines.push('## Videos', '')
    for (const v of videos) lines.push(videoLine(v))
    lines.push('')
  }
  lines.push('## For agents', '')
  lines.push(`- [AGENTS.md](${absoluteUrl(AGENT_PATHS.agentsMd)}): how to use the MCP server and REST API, and what they record`)
  lines.push(`- [MCP server](${absoluteUrl(AGENT_PATHS.mcp)}): Streamable HTTP; tools ${TOOLS.map((t) => t.name).join(', ')}`)
  lines.push(`- [OpenAPI](${absoluteUrl(AGENT_PATHS.openapi)}): the same data and actions over REST`)
  lines.push('')
  lines.push('## Optional', '')
  lines.push(`- [llms-full.txt](${absoluteUrl(AGENT_PATHS.llmsFull)}): the profile, every project page and every article in one file`)
  lines.push(`- [RSS](${absoluteUrl(AGENT_PATHS.feed)})`)
  lines.push('')
  return lines.join('\n')
}

export async function buildLlmsFullTxt(): Promise<string> {
  const [profile, projects, articles, videos] = await Promise.all([getProfile(), getProjects(), getArticlesWithBody(), getVideos()])
  const about = profile?.about ? await lexicalToMarkdown(profile.about) : DEFAULT_PROFILE.aboutMarkdown
  const parts: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${profile?.summary ?? DEFAULT_PROFILE.summary}`,
    '',
    `Source: ${absoluteUrl('/')}. Contact: ${SITE.links.linkedin}.`,
    '',
    '## About',
    '',
    about,
    '',
    '## Highlights',
    '',
    ...(profile?.highlights?.map((h) => `- ${h.text}`) ?? DEFAULT_PROFILE.highlights.map((h) => `- ${h}`)),
    '',
    '## Experience',
    '',
    ...experienceLines(profile),
    '',
  ]
  for (const p of projects) parts.push('---', '', projectToMarkdown(p).replace(/^# /, '## Project: '), '')
  for (const a of articles) parts.push('---', '', (await articleToMarkdown(a)).replace(/^# /, '## Article: '), '')
  if (videos.length) parts.push('---', '', '## Videos', '', ...videos.map(videoLine), '')
  parts.push('---', '', '## Machine-readable surfaces', '', ...SURFACES.map((s) => `- [${s.name}](${absoluteUrl(s.path)}): ${s.what}`), '')
  return parts.join('\n')
}

export function textResponse(body: string, contentType = 'text/plain; charset=utf-8'): Response {
  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
