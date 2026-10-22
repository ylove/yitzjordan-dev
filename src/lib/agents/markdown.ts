/**
 * Markdown for the agent channel: llms-full.txt, the .md twins of articles and project pages,
 * and the MCP tools. Server only.
 */
import { SITE, STATUS_LABELS, articlePath } from '@/content/site'
import type { Article, Profile, Project, Video } from '@/payload-types'
import { formatDate, formatDuration, formatMonth } from '@/lib/format'
import { lexicalToMarkdown } from '@/lib/richtext/markdown'
import { absoluteUrl } from '@/lib/seo/site-url'

export function markdownResponse(body: string, init: { cache?: 'static' | 'none'; status?: number; canonical?: string } = {}): Response {
  return new Response(body, {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': init.cache === 'none' ? 'no-store' : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      // The HTML pages are the canonical, indexable versions.
      'X-Robots-Tag': 'noindex',
      ...(init.canonical ? { Link: `<${init.canonical}>; rel="canonical"` } : {}),
      Vary: 'Accept',
    },
  })
}

const statusLabel = (p: Project) => p.statusLabel || STATUS_LABELS[p.status]

export function projectToMarkdown(p: Project): string {
  const url = absoluteUrl(`/work/${p.slug}`)
  const lines: string[] = [`# ${p.name}`, '', `> ${p.oneLiner}`, '', p.hero.lead, '']
  const facts = [
    `- Status: ${statusLabel(p)}`,
    p.github ? `- Repository: ${p.github}` : null,
    p.homepage ? `- Website: ${p.homepage}` : null,
    p.officialUrl ? `- Official page: ${p.officialUrl}` : null,
    p.license ? `- License: ${p.license}` : null,
    p.language ? `- Language: ${p.language}` : null,
    `- Page: ${url}`,
    `- Author: ${SITE.name}`,
  ].filter(Boolean)
  lines.push(...(facts as string[]), '', p.description, '')
  if (p.steps?.length) {
    lines.push(`## ${p.stepsTitle || 'How it works'}`, '')
    p.steps.forEach((s, i) => lines.push(`${i + 1}. **${s.title}**: ${s.body}`))
    lines.push('')
  }
  if (p.audiences?.length) {
    lines.push(`## ${p.audienceTitle || 'Who it is for'}`, '')
    for (const a of p.audiences) lines.push(`- **${a.title}**: ${a.body}`)
    lines.push('')
  }
  if (p.capabilities?.length) {
    lines.push(`## ${p.capabilitiesTitle || 'What it does'}`, '')
    for (const c of p.capabilities) lines.push(`- **${c.title}**${c.body ? `: ${c.body}` : ''}`)
    lines.push('')
  }
  if (p.figures?.length) {
    lines.push('## Figures', '')
    for (const f of p.figures) lines.push(`- ${f.value} ${f.label}${f.source ? ` (source: ${f.source})` : ''}`)
    lines.push('')
  }
  const commands = (p.install?.commands ?? '').split('\n').map((l) => l.trimEnd()).filter(Boolean)
  if (commands.length || p.install?.intro) {
    lines.push(`## ${(p.install?.title || 'Install').replace(/\.$/, '')}`, '')
    if (p.install?.intro) lines.push(p.install.intro, '')
    if (commands.length) lines.push('```sh', ...commands, '```', '')
    if (p.install?.note) lines.push(p.install.note, '')
  }
  if (p.engineeringNotes?.length) {
    lines.push('## Engineering notes', '')
    for (const n of p.engineeringNotes) lines.push(`### ${n.title}`, '', n.body, '')
  }
  if (p.faq?.length) {
    lines.push('## FAQ', '')
    for (const f of p.faq) lines.push(`### ${f.q}`, '', f.a, '')
  }
  return lines.join('\n').trim() + '\n'
}

export async function articleToMarkdown(a: Article): Promise<string> {
  const url = absoluteUrl(articlePath(a.kind, a.slug))
  const body = await lexicalToMarkdown(a.body)
  return [
    `# ${a.title}`,
    '',
    `> ${a.excerpt}`,
    '',
    `By ${SITE.name}. ${a.kind === 'blog' ? 'Blog post' : 'Research'}, published ${formatDate(a.publishDate ?? a.createdAt)}${a.updatedDate ? `, updated ${formatDate(a.updatedDate)}` : ''}. Canonical: ${url}`,
    '',
    body || a.plainText || '',
    '',
  ].join('\n')
}

export function videoLine(v: Video): string {
  return `- [${v.title}](${absoluteUrl(`/videos/${v.slug}`)}) (${formatDuration(v.durationSeconds)}, ${formatDate(v.uploadDate)}): ${v.description.split('\n')[0]}`
}

export function experienceLines(profile: Profile | null): string[] {
  return (profile?.experience ?? []).map((e) => {
    const org = e.display === 'named' && e.orgName ? e.orgName : (e.genericLabel ?? '')
    const dates = `${formatMonth(e.start)} to ${e.end ? formatMonth(e.end) : 'present'}`
    return `- ${e.title}, ${org} (${dates})${e.summary ? `: ${e.summary}` : ''}`
  })
}
