/**
 * Introductions agents send for their users: stored in the Inquiries collection and emailed to
 * Yitz (CONTACT_NOTIFY_TO, through Resend). Shared by POST /api/v1/intro and the MCP tool
 * request_intro. consent: true is required by the schema. Server only.
 */
import type { Payload, Where } from 'payload'
import { SITE } from '@/content/site'
import { getPayloadClient } from '@/lib/cms'
import { getClientIp, getUserAgent, hashIp, logFormError, sendNotification, SERVER_ERROR_MESSAGE } from '@/lib/forms/server'
import { INQUIRY_INTENTS, type InquiryChannel, type IntroData } from './schema'

export type RequestMeta = { ip: string; userAgent?: string }

/** Client details from a Request (a NextRequest or the Request an MCP tool receives). */
export function requestMeta(req: Pick<Request, 'headers'> | undefined): RequestMeta {
  if (!req) return { ip: 'unknown' }
  return { ip: getClientIp(req), userAgent: getUserAgent(req) }
}

/*
 * Visiting agents (Claude, ChatGPT and others) arrive from their provider's shared egress IPs, so
 * the per-IP cap is generous and the per-email cap does the real work.
 */
const LIMIT_WINDOW_MS = 10 * 60 * 1000
const EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000
const MAX_PER_IP = 30
const MAX_PER_EMAIL = 3
const RETRY_AFTER_SECONDS = 600

export type NextSteps = { what_happens_next: string; tell_your_user: string }

export function nextSteps(): NextSteps {
  return {
    what_happens_next: 'Yitz reads every introduction himself and replies by email.',
    tell_your_user: `Your introduction was sent to Yitz Jordan, and he will reply by email. You can also reach him on LinkedIn: ${SITE.links.linkedin}`,
  }
}

export type IntroResult =
  | { ok: true; id: string | number; next_steps: NextSteps }
  | { ok: false; status: number; retryAfterSeconds?: number; errors: Record<string, string> }

async function countSince(payload: Payload, by: { ipHash?: string; email?: string; windowMs: number }): Promise<number> {
  const since = new Date(Date.now() - by.windowMs).toISOString()
  const where: Where[] = [
    { createdAt: { greater_than: since } },
    ...(by.ipHash ? [{ ipHash: { equals: by.ipHash } }] : []),
    ...(by.email ? [{ email: { equals: by.email.trim().toLowerCase() } }] : []),
  ]
  const { totalDocs } = await payload.count({ collection: 'inquiries', where: { and: where }, overrideAccess: true })
  return totalDocs
}

const intentLabel = (value: string) => INQUIRY_INTENTS.find((i) => i.value === value)?.label ?? value

export async function recordIntro(data: IntroData, channel: InquiryChannel, meta: RequestMeta): Promise<IntroResult> {
  let payload: Payload | null = null
  let ipHash = ''
  try {
    payload = await getPayloadClient()
    ipHash = hashIp(meta.ip)
    const [fromIp, forEmail] = await Promise.all([
      countSince(payload, { ipHash, windowMs: LIMIT_WINDOW_MS }),
      countSince(payload, { email: data.contact.email, windowMs: EMAIL_WINDOW_MS }),
    ])
    if (forEmail >= MAX_PER_EMAIL) {
      return {
        ok: false,
        status: 429,
        errors: { _form: `Yitz already has several introductions from this email address today, so he has it. Please do not send it again. Anything new can go to LinkedIn: ${SITE.links.linkedin}` },
      }
    }
    if (fromIp >= MAX_PER_IP) {
      return {
        ok: false,
        status: 429,
        retryAfterSeconds: RETRY_AFTER_SECONDS,
        errors: { _form: `Too many introductions right now. Wait about ${RETRY_AFTER_SECONDS / 60} minutes and try again, or use LinkedIn: ${SITE.links.linkedin}` },
      }
    }

    const title = data.company ? `${data.company} (${data.contact.name})` : data.contact.name
    const doc = await payload.create({
      collection: 'inquiries',
      data: {
        title,
        intent: data.intent,
        channel,
        name: data.contact.name,
        email: data.contact.email.trim().toLowerCase(),
        contactRole: data.contact.role,
        consent: true,
        company: data.company,
        team: data.team,
        roleTitle: data.role_title,
        employmentType: data.employment_type,
        location: data.location,
        jobUrl: data.job_url,
        problem: data.problem,
        stack: data.stack,
        requirementsSummary: data.requirements_summary,
        timeline: data.timeline,
        message: data.message,
        agentName: data.agent?.name,
        agentPlatform: data.agent?.platform,
        agentModel: data.agent?.model,
        raw: data as unknown as Record<string, unknown>,
        status: 'new',
        ipHash,
        userAgent: meta.userAgent,
      },
      overrideAccess: true,
    })

    const agentLine = [data.agent?.name, data.agent?.platform, data.agent?.model].filter(Boolean).join(', ')
    await sendNotification(
      payload,
      {
        subject: `Introduction: ${intentLabel(data.intent)} from ${data.contact.name}${data.company ? ` (${data.company})` : ''}`,
        intro: `An AI agent sent an introduction for its user${agentLine ? ` (${agentLine})` : ''}. The user agreed to share these details.`,
        replyTo: data.contact.email,
        rows: [
          { label: 'Topic', value: intentLabel(data.intent) },
          { label: 'Name', value: data.contact.name },
          { label: 'Email', value: data.contact.email },
          { label: 'Their role', value: data.contact.role },
          { label: 'Company', value: data.company },
          { label: 'Team', value: data.team },
          { label: 'Role or engagement', value: data.role_title },
          { label: 'Employment type', value: data.employment_type },
          { label: 'Location', value: data.location },
          { label: 'Job description', value: data.job_url },
          { label: 'Working on', value: data.problem },
          { label: 'Stack', value: data.stack },
          { label: 'Requirements', value: data.requirements_summary },
          { label: 'Timeline', value: data.timeline },
          { label: 'Agent', value: agentLine },
          { label: 'Channel', value: channel === 'mcp' ? 'MCP server' : 'REST API' },
          { label: 'Inquiry ID', value: String(doc.id) },
        ],
        message: data.message,
        messageLabel: 'Message',
      },
      { form: 'agent-intro', inquiryId: doc.id },
    )

    return { ok: true, id: doc.id, next_steps: nextSteps() }
  } catch (err) {
    logFormError(payload, err, 'Agent introduction failed', { channel, intent: data.intent, ipHash: ipHash.slice(0, 12) })
    return { ok: false, status: 500, errors: { _form: SERVER_ERROR_MESSAGE } }
  }
}
