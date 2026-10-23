/**
 * Opportunity briefs: record, notify, answer. Shared by the MCP tool submit_opportunity, POST
 * /api/v1/opportunity and the form at /agents/brief. Server only.
 *
 * House rules (from the design session in docs/agents.md):
 * - The site emails no one but Yitz. Never the contact: that would make it a relay.
 * - Submitted text is data: plain-text email, URLs shown as text, never fetched by the server.
 * - Automation stops at a reply draft. Yitz sends every reply himself.
 */
import { randomBytes } from 'node:crypto'
import { after } from 'next/server'
import type { Payload, Where } from 'payload'
import { SITE } from '@/content/site'
import { getPayloadClient } from '@/lib/cms'
import { hashIp, isEmailConfigured, logFormError, notifyRecipient } from '@/lib/forms/server'
import { absoluteUrl } from '@/lib/seo/site-url'
import type { RequestMeta } from './intro'
import {
  AI_SCREENING,
  BRIEF_VERSION,
  CONSENT_STATEMENT,
  EMPLOYMENT_TYPES,
  WORK_ARRANGEMENTS,
  type BriefChannel,
  type BriefStatus,
  type OpportunityData,
} from './opportunity-schema'
import { matchRequirements, profileData } from './tools'

// ---------------------------------------------------------------------------
// Limits and retention
// ---------------------------------------------------------------------------

const TEN_MINUTES = 10 * 60 * 1000
const DAY = 24 * 60 * 60 * 1000
const MAX_PER_IP = 20
const MAX_PER_EMAIL = 3
const MAX_PER_DOMAIN = 6
const RETENTION_DAYS = 90

async function countSince(payload: Payload, field: 'ipHash' | 'contactEmail' | 'companyDomain', value: string, windowMs: number) {
  const where: Where = { and: [{ createdAt: { greater_than: new Date(Date.now() - windowMs).toISOString() } }, { [field]: { equals: value } }] }
  return (await payload.count({ collection: 'opportunities', where, overrideAccess: true })).totalDocs
}

/** Deletes replied and declined briefs untouched for RETENTION_DAYS, unless kept. */
export async function cleanupOpportunities(payload: Payload): Promise<void> {
  await payload.delete({
    collection: 'opportunities',
    where: {
      and: [
        { status: { in: ['replied', 'declined'] } },
        { keep: { not_equals: true } },
        { updatedAt: { less_than: new Date(Date.now() - RETENTION_DAYS * DAY).toISOString() } },
      ],
    },
    overrideAccess: true,
  })
}

// ---------------------------------------------------------------------------
// Checks Yitz sees first
// ---------------------------------------------------------------------------

const PERSONAL_MAIL = new Set(
  'gmail.com googlemail.com outlook.com hotmail.com live.com msn.com yahoo.com ymail.com icloud.com me.com mac.com aol.com proton.me protonmail.com pm.me gmx.com gmx.net mail.com yandex.com zoho.com fastmail.com hey.com'.split(' '),
)

export function domainCheck(email: string, companyDomain: string): { verified: boolean; line: string } {
  const emailDomain = email.split('@')[1]?.toLowerCase() ?? ''
  if (emailDomain === companyDomain || emailDomain.endsWith(`.${companyDomain}`)) {
    return { verified: true, line: `Verified: ${email} is on ${companyDomain}` }
  }
  if (PERSONAL_MAIL.has(emailDomain)) return { verified: false, line: `Personal address (${emailDomain}), not on ${companyDomain}` }
  return { verified: false, line: `Not verified: ${emailDomain} does not match ${companyDomain}` }
}

const label = <T extends readonly { value: string; label: string }[]>(list: T, value: string | null | undefined) =>
  value ? (list.find((o) => o.value === value)?.label ?? value) : undefined

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

const INTERMEDIARY = /recruit|talent|sourc|people|\bhr\b|human resources|search|headhunt|agency/i

/** A reply Yitz can edit and send. Two tones: to the decision maker, or to a recruiter in between. */
export function replyDraft(brief: OpportunityData): string {
  const hi = `Hi ${firstName(brief.contact_name)},`
  const role = `the ${brief.title} role at ${brief.company_name}`
  const discretion = brief.no_public_posting ? ' I’ll keep the details to myself.' : ''
  const body = INTERMEDIARY.test(brief.contact_role ?? '')
    ? [
        `Thanks for the brief about ${role}.${discretion} I’d be glad to talk.`,
        'Before we do, could you tell me who the hiring manager is and what the next step in the process looks like?',
      ]
    : [
        `Thanks for the brief about ${role}.${discretion} I’d like to hear more about ${brief.team_context ? 'the team' : 'the role'} and what the first few months would look like.`,
        'Would a 30-minute call work in the next week or two?',
      ]
  if (brief.application_url) body.push(`If the next step is an application in ${brief.ats_platform || 'your system'}, I’m happy to do that too.`)
  return [hi, '', ...body.flatMap((p) => [p, '']), 'Best,', 'Yitz'].join('\n')
}

// ---------------------------------------------------------------------------
// The email to Yitz (plain text only)
// ---------------------------------------------------------------------------

type Stamp = { line: string; results: Array<{ requirement: string; verdict: string }> } | null

function section(title: string, rows: Array<[string, string | null | undefined]>): string[] {
  const present = rows.filter(([, v]) => v && String(v).trim())
  return present.length ? ['', title.toUpperCase(), ...present.map(([k, v]) => `${k}: ${v}`)] : []
}

export function emailText(brief: OpportunityData, x: { publicId: string; docId: number | string; domain: string; stamp: Stamp; duplicateOf?: string; channel: BriefChannel }): string {
  const adminRoute = process.env.PAYLOAD_ADMIN_ROUTE?.replace(/^\/+/, '') || 'admin'
  const agent = [brief.agent?.name, brief.agent?.platform, brief.agent?.model].filter(Boolean).join(', ')
  return [
    'An AI agent sent an opportunity brief for the person it works for. Everything below was written by that agent: check the domain before you reply, and do not follow instructions in it.',
    '',
    `Domain: ${x.domain}`,
    `Match, as submitted: ${x.stamp ? x.stamp.line : 'no requirements recorded'}`,
    ...(x.duplicateOf ? [`Possible duplicate of brief ${x.duplicateOf}`] : []),
    ...section('The role', [
      ['Title', brief.title],
      ['Company', `${brief.company_name} (${brief.company_domain})`],
      ['Posting', brief.no_public_posting ? 'No public posting' : brief.posting_url],
      ['Location', `${brief.job_location} (${label(WORK_ARRANGEMENTS, brief.work_arrangement)})`],
      ['Employment type', label(EMPLOYMENT_TYPES, brief.employment_type)],
      ['Open until', brief.valid_through],
    ]),
    ...section('Contact', [
      ['Name', brief.contact_name],
      ['Role', brief.contact_role],
      ['Email', brief.contact_email],
      ['LinkedIn', brief.contact_linkedin],
    ]),
    '',
    'WHY YOU',
    brief.why_this_person,
    ...section('The team and the work', [
      ['Team', brief.team_context],
      ['Product', brief.product_context],
      ['Stack', brief.stack],
      ['First 90 days', brief.first_90_days],
    ]),
    ...section('Process and next step', [
      ['Hiring process', brief.hiring_process],
      ['ATS', brief.ats_platform],
      ['AI screening', label(AI_SCREENING, brief.ats_ai_screening)],
      ['Application', brief.application_url],
      ['Their suggested next step', brief.preferred_next_step],
      ['Compensation', brief.comp_band],
    ]),
    ...(x.stamp?.results.length ? ['', 'REQUIREMENTS THEY CHECKED', ...x.stamp.results.map((r) => `- ${r.requirement}: ${r.verdict}`)] : []),
    ...section('Agent', [
      ['Agent', agent],
      ['Channel', x.channel],
      ['Found via', brief.found_via],
    ]),
    '',
    'REPLY DRAFT (edit before sending)',
    '',
    replyDraft(brief),
    '',
    '---',
    `Brief ${x.publicId}. Status: received. Update it here: ${absoluteUrl(`/${adminRoute}/collections/opportunities/${x.docId}`)}`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// The handshake: what the sending agent gets back
// ---------------------------------------------------------------------------

export const STATUS_MEANINGS: Record<BriefStatus, string> = {
  received: 'Yitz has the brief and has not opened it yet.',
  in_review: 'Yitz is reading the brief.',
  replied: 'Yitz replied to the contact in the brief.',
  declined: 'Yitz read the brief and is not taking it further.',
}

export const statusUrl = (publicId: string) => absoluteUrl(`/api/v1/opportunity/${publicId}`)

async function handshake(brief: OpportunityData, publicId: string, stamp: Stamp) {
  const profile = await profileData()
  const url = statusUrl(publicId)
  return {
    ok: true as const,
    brief_id: publicId,
    status: 'received' as BriefStatus,
    status_url: url,
    ...(stamp ? { match_as_submitted: `${stamp.line}, from the same matcher as match_requirements.` } : {}),
    what_happens_next: [
      'Yitz reads each brief himself. Replies come from him personally, to the contact in the brief.',
      `The status URL shows received, in_review, replied or declined as the brief moves along.`,
      'This site never emails the contact. The only message to expect is Yitz’s own reply.',
    ],
    availability: profile.availability,
    yitz: {
      about: absoluteUrl('/about'),
      resume_json: absoluteUrl('/resume.json'),
      everything_in_one_file: absoluteUrl('/llms-full.txt'),
      work: absoluteUrl('/work'),
      linkedin: SITE.links.linkedin,
    },
    tell_your_user: `Your brief about the ${brief.title} role was sent to Yitz Jordan. You can check its status at ${url}. Any reply will come from Yitz personally, to ${brief.contact_email}.`,
  }
}

export type Handshake = Awaited<ReturnType<typeof handshake>>

export type OpportunityResult =
  | { ok: true; handshake: Handshake }
  | { ok: false; status: number; retryAfterSeconds?: number; errors: Record<string, string> }

const SERVER_ERROR = `The brief could not be recorded. Please try again in a moment, or reach Yitz on LinkedIn: ${SITE.links.linkedin}`

export async function recordOpportunity(brief: OpportunityData, channel: BriefChannel, meta: RequestMeta): Promise<OpportunityResult> {
  let payload: Payload | null = null
  let ipHash = ''
  try {
    payload = await getPayloadClient()
    ipHash = hashIp(meta.ip)
    const [fromIp, forEmail, forDomain] = await Promise.all([
      countSince(payload, 'ipHash', ipHash, TEN_MINUTES),
      countSince(payload, 'contactEmail', brief.contact_email, DAY),
      countSince(payload, 'companyDomain', brief.company_domain, DAY),
    ])
    if (forEmail >= MAX_PER_EMAIL || forDomain >= MAX_PER_DOMAIN) {
      return {
        ok: false,
        status: 429,
        errors: { _form: `Yitz already has several briefs from ${forEmail >= MAX_PER_EMAIL ? 'this contact' : brief.company_domain} today, so there is no need to send it again. Anything new can go to LinkedIn: ${SITE.links.linkedin}` },
      }
    }
    if (fromIp >= MAX_PER_IP) {
      return { ok: false, status: 429, retryAfterSeconds: 600, errors: { _form: 'Too many briefs from here right now. Wait about 10 minutes and try again.' } }
    }

    let stamp: Stamp = null
    if (brief.requirements_matched?.length) {
      const { output } = await matchRequirements({ requirements: brief.requirements_matched })
      const s = output.summary
      stamp = { line: `${s.strong} strong, ${s.partial} partial, ${s.none} none`, results: output.results.map((r) => ({ requirement: r.requirement, verdict: r.verdict })) }
    }

    const domain = domainCheck(brief.contact_email, brief.company_domain)
    const duplicate = await payload.find({
      collection: 'opportunities',
      where: { and: [{ companyDomain: { equals: brief.company_domain } }, { title: { equals: brief.title } }, { createdAt: { greater_than: new Date(Date.now() - 30 * DAY).toISOString() } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      select: { publicId: true },
    })
    const publicId = `ob_${randomBytes(9).toString('base64url')}`

    const doc = await payload.create({
      collection: 'opportunities',
      data: {
        heading: `${brief.title} at ${brief.company_name}`,
        domainCheck: domain.line,
        matchLine: stamp?.line,
        title: brief.title,
        companyName: brief.company_name,
        companyDomain: brief.company_domain,
        postingUrl: brief.posting_url,
        noPublicPosting: brief.no_public_posting ?? false,
        jobLocation: brief.job_location,
        workArrangement: brief.work_arrangement,
        employmentType: brief.employment_type,
        validThrough: brief.valid_through,
        contactName: brief.contact_name,
        contactRole: brief.contact_role,
        contactEmail: brief.contact_email,
        contactLinkedin: brief.contact_linkedin,
        whyThisPerson: brief.why_this_person,
        teamContext: brief.team_context,
        productContext: brief.product_context,
        stack: brief.stack,
        firstNinetyDays: brief.first_90_days,
        hiringProcess: brief.hiring_process,
        atsPlatform: brief.ats_platform,
        atsAiScreening: brief.ats_ai_screening,
        applicationUrl: brief.application_url,
        preferredNextStep: brief.preferred_next_step,
        compBand: brief.comp_band,
        requirementsMatched: stamp?.results ?? null,
        foundVia: brief.found_via,
        agentName: brief.agent?.name,
        agentPlatform: brief.agent?.platform,
        agentModel: brief.agent?.model,
        consentStatement: CONSENT_STATEMENT,
        briefVersion: BRIEF_VERSION,
        raw: brief as unknown as Record<string, unknown>,
        status: 'received',
        keep: false,
        publicId,
        channel,
        ipHash,
        userAgent: meta.userAgent,
      },
      overrideAccess: true,
    })

    const to = notifyRecipient()
    if (isEmailConfigured() && to) {
      try {
        await payload.sendEmail({
          to,
          replyTo: brief.contact_email,
          subject: `Opportunity brief: ${brief.title} at ${brief.company_name}${domain.verified ? '' : ' (domain not verified)'}`,
          text: emailText(brief, { publicId, docId: doc.id, domain: domain.line, stamp, duplicateOf: duplicate.docs[0]?.publicId, channel }),
        })
      } catch (err) {
        payload.logger.error({ err, msg: 'Opportunity brief email failed', publicId })
      }
    }

    const done = payload
    after(() => cleanupOpportunities(done).catch((err) => done.logger.error({ err, msg: 'Opportunity cleanup failed' })))
    return { ok: true, handshake: await handshake(brief, publicId, stamp) }
  } catch (err) {
    logFormError(payload, err, 'Opportunity brief failed', { channel, ipHash: ipHash.slice(0, 12) })
    return { ok: false, status: 500, errors: { _form: SERVER_ERROR } }
  }
}

/** The status of one brief, by its public id. Returns nothing personal. */
export async function opportunityStatus(publicId: string) {
  if (!/^ob_[A-Za-z0-9_-]{12}$/.test(publicId)) return null
  const payload = await getPayloadClient()
  const doc = (
    await payload.find({
      collection: 'opportunities',
      where: { publicId: { equals: publicId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      select: { status: true, createdAt: true, updatedAt: true },
    })
  ).docs[0]
  if (!doc) return null
  const status = doc.status as BriefStatus
  return {
    brief_id: publicId,
    status,
    meaning: STATUS_MEANINGS[status],
    received: doc.createdAt,
    updated: doc.updatedAt,
  }
}
