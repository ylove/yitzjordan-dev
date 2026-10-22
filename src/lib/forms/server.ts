/**
 * Server helpers for the agent channel: client identity for rate limiting, and the notification
 * email Yitz gets for each introduction. Server only.
 */
import { createHash } from 'node:crypto'
import type { Payload } from 'payload'
import { getPayloadSecret } from '@/lib/cms/secret'

export const SERVER_ERROR_MESSAGE =
  'The introduction could not be sent. Please try again in a moment, or reach Yitz on LinkedIn: https://www.linkedin.com/in/yitzjordan'

/** Anything with request headers: a NextRequest, or the plain Request an MCP tool receives. */
type HasHeaders = Pick<Request, 'headers'>

/** Best-effort client IP. Vercel sets x-vercel-forwarded-for and x-real-ip itself. */
export function getClientIp(req: HasHeaders): string {
  const candidates = [
    req.headers.get('x-vercel-forwarded-for'),
    req.headers.get('x-real-ip'),
    req.headers.get('x-forwarded-for'),
  ]
  for (const value of candidates) {
    const first = value?.split(',')[0]?.trim()
    if (first) return first
  }
  return 'unknown'
}

/** sha256(ip + PAYLOAD_SECRET). The raw IP is never stored. */
export function hashIp(ip: string): string {
  return createHash('sha256').update(`${ip}${getPayloadSecret()}`).digest('hex')
}

export function getUserAgent(req: HasHeaders): string | undefined {
  const ua = req.headers.get('user-agent')?.trim()
  return ua ? ua.slice(0, 300) : undefined
}

// ---------------------------------------------------------------------------
// Notification email
// ---------------------------------------------------------------------------

/** True when an email adapter is configured (see payload.config.ts). */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/** Where introductions are emailed. Unset means no email (the inquiry is still stored). */
export function notifyRecipient(): string | null {
  return process.env.CONTACT_NOTIFY_TO?.trim() || null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export type EmailRow = { label: string; value: string | null | undefined }

export type NotificationInput = {
  subject: string
  intro: string
  rows: EmailRow[]
  message?: string | null
  /** The sender's address. Omit when there is none, for example an agent's proposal request. */
  replyTo?: string
  /** Label for the message block. Default "Message". */
  messageLabel?: string
}

/** Plain text and simple HTML versions of a submission notification. */
export function renderNotification({
  intro,
  rows,
  message,
  replyTo,
  messageLabel = 'Message',
}: NotificationInput): { text: string; html: string } {
  const present = rows.filter((r) => r.value && String(r.value).trim())
  const footer = replyTo
    ? 'Reply to this email to answer the sender directly.'
    : 'There is no reply address. The sender did not share contact details.'
  const text = [
    intro,
    '',
    ...present.map((r) => `${r.label}: ${r.value}`),
    ...(message ? ['', `${messageLabel}:`, message] : []),
    '',
    footer,
  ].join('\n')

  const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#15181C">
<p>${escapeHtml(intro)}</p>
<table cellpadding="4" cellspacing="0" style="border-collapse:collapse">
${present
  .map(
    (r) =>
      `<tr><td style="color:#555;padding-right:16px;vertical-align:top">${escapeHtml(r.label)}</td><td>${escapeHtml(String(r.value))}</td></tr>`,
  )
  .join('\n')}
</table>
${message ? `<p style="margin-top:16px;color:#555">${escapeHtml(messageLabel)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>` : ''}
<p style="margin-top:24px;color:#555">${escapeHtml(footer)}</p>
</body></html>`

  return { text, html }
}

/**
 * Sends the notification when an email adapter is configured. Never throws: the submission is
 * already stored, so a mail failure is logged and the request still succeeds.
 */
export async function sendNotification(
  payload: Payload,
  input: NotificationInput,
  context: Record<string, unknown>,
): Promise<'sent' | 'skipped' | 'failed'> {
  const to = notifyRecipient()
  if (!isEmailConfigured() || !to) return 'skipped'
  const { text, html } = renderNotification(input)
  try {
    await payload.sendEmail({
      to,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      subject: input.subject,
      text,
      html,
    })
    return 'sent'
  } catch (err) {
    payload.logger.error({ err, msg: 'Introduction email failed', ...context })
    return 'failed'
  }
}

/** Logs an unexpected failure with context. Uses Payload's logger when available. */
export function logFormError(
  payload: Payload | null,
  err: unknown,
  msg: string,
  context: Record<string, unknown>,
): void {
  if (payload) payload.logger.error({ err, msg, ...context })
  else console.error(`[agents] ${msg}`, context, err)
}
