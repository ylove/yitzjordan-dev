'use client'

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { CopyText } from '@/components/ui/CopyText'
import { cn } from '@/components/ui/cn'
import { AI_SCREENING, CONSENT_STATEMENT, EMPLOYMENT_TYPES, WORK_ARRANGEMENTS } from '@/lib/agents/opportunity-options'

type Kind = 'text' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox' | 'lines'
type Field = { key: string; label: string; kind?: Kind; required?: boolean; options?: readonly { value: string; label: string }[]; hint?: string }
type Group = { title: string; fields: Field[] }

/** Field keys match the template and the API exactly, so an agent can map one onto the other. */
const GROUPS: Group[] = [
  {
    title: 'The role',
    fields: [
      { key: 'title', label: 'Role title', required: true },
      { key: 'company_name', label: 'Company', required: true },
      { key: 'company_domain', label: 'Company domain', required: true, hint: 'For example example.com' },
      { key: 'posting_url', label: 'Job posting', kind: 'url', hint: 'Required unless there is no public posting' },
      { key: 'no_public_posting', label: 'There is no public posting', kind: 'checkbox', hint: 'Then describe the team and the product below' },
      { key: 'job_location', label: 'Location', required: true, hint: 'For example "New York, 3 days in office"' },
      { key: 'work_arrangement', label: 'Arrangement', kind: 'select', required: true, options: WORK_ARRANGEMENTS },
      { key: 'employment_type', label: 'Employment type', kind: 'select', options: EMPLOYMENT_TYPES },
      { key: 'valid_through', label: 'Open until', hint: 'A date, if known' },
    ],
  },
  {
    title: 'Who I should talk to',
    fields: [
      { key: 'contact_name', label: 'Name', required: true },
      { key: 'contact_role', label: 'Their role', hint: 'Hiring manager, recruiter, founder' },
      { key: 'contact_email', label: 'Work email', kind: 'email', required: true },
      { key: 'contact_linkedin', label: 'LinkedIn', kind: 'url' },
    ],
  },
  {
    title: 'The team and the work',
    fields: [
      { key: 'why_this_person', label: 'Why me', kind: 'textarea', required: true, hint: 'A sentence or two. Cite a project, article or match from this site.' },
      { key: 'team_context', label: 'The team', kind: 'textarea', hint: 'Size, what it owns, who leads it' },
      { key: 'product_context', label: 'The product or projects', kind: 'textarea' },
      { key: 'stack', label: 'Stack', kind: 'textarea' },
      { key: 'first_90_days', label: 'The first 90 days', kind: 'textarea' },
    ],
  },
  {
    title: 'The process and my next step',
    fields: [
      { key: 'hiring_process', label: 'Hiring process', kind: 'textarea', hint: 'Steps and timeline' },
      { key: 'ats_platform', label: 'Applicant tracking system', hint: 'Greenhouse, Ashby, Workday' },
      { key: 'ats_ai_screening', label: 'Does AI screen applications?', kind: 'select', options: AI_SCREENING },
      { key: 'application_url', label: 'Application link', kind: 'url', hint: 'If the process needs one' },
      { key: 'preferred_next_step', label: 'What I should do next', kind: 'textarea' },
      { key: 'comp_band', label: 'Compensation range', hint: 'If you can share it' },
    ],
  },
  {
    title: 'About the agent',
    fields: [
      { key: 'requirements_matched', label: 'Requirements you checked', kind: 'lines', hint: 'One per line' },
      { key: 'found_via', label: 'How you found this site' },
      { key: 'agent.name', label: 'Agent', hint: 'Claude, ChatGPT, Gemini' },
      { key: 'agent.platform', label: 'Where it runs' },
      { key: 'agent.model', label: 'Model' },
    ],
  },
]

const ALL_FIELDS = GROUPS.flatMap((g) => g.fields)
type Values = Record<string, string | boolean>

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

function fromBase64Url(value: string): string | null {
  try {
    const bin = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
  } catch {
    return null
  }
}

/** Reads a draft: JSON (fenced or not, plain or percent-encoded or base64url), or key=value pairs. */
export function parseDraft(raw: string): Record<string, unknown> | null {
  let t = raw.trim().replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim()
  if (t.startsWith('#')) t = t.slice(1)
  if (t.startsWith('brief=')) t = t.slice('brief='.length)
  const candidates = [t, decode(t), fromBase64Url(t) ?? '']
  for (const c of candidates) {
    const s = c.trim()
    if (s.startsWith('{')) {
      try {
        const parsed = JSON.parse(s)
        if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
      } catch {
        // try the next form
      }
    }
  }
  if (/^[a-z_.]+=/.test(t)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of new URLSearchParams(t)) {
      if (k === 'requirements_matched' || k === 'r') out.requirements_matched = [...((out.requirements_matched as string[]) ?? []), ...v.split(';')]
      else out[k] = v
    }
    return out
  }
  return null
}

function toValues(draft: Record<string, unknown>): Values {
  const values: Values = {}
  for (const f of ALL_FIELDS) {
    const raw = f.key.startsWith('agent.') ? (draft.agent as Record<string, unknown> | undefined)?.[f.key.slice(6)] : draft[f.key]
    if (raw === undefined || raw === null) continue
    if (f.kind === 'checkbox') values[f.key] = raw === true || raw === 'true'
    else if (f.kind === 'lines') values[f.key] = Array.isArray(raw) ? raw.map(String).join('\n') : String(raw)
    else values[f.key] = String(raw)
  }
  return values
}

function toBody(values: Values, consent: boolean, website: string) {
  const str = (k: string) => (typeof values[k] === 'string' ? (values[k] as string).trim() : '')
  const body: Record<string, unknown> = { consent, website }
  for (const f of ALL_FIELDS) {
    if (f.key.startsWith('agent.')) continue
    if (f.kind === 'checkbox') body[f.key] = values[f.key] === true
    else if (f.kind === 'lines') {
      const lines = str(f.key).split('\n').map((l) => l.trim()).filter(Boolean)
      if (lines.length) body[f.key] = lines
    } else if (str(f.key)) body[f.key] = str(f.key)
  }
  const agent = { name: str('agent.name'), platform: str('agent.platform'), model: str('agent.model') }
  if (agent.name || agent.platform || agent.model) body.agent = agent
  return body
}

type Handshake = {
  brief_id: string
  status_url: string
  what_happens_next?: string[]
  tell_your_user?: string
}

const inputClass =
  'block w-full rounded-control border border-line-strong bg-surface-raised px-3 py-2.5 text-body text-ink placeholder:text-ink-subtle focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent aria-[invalid=true]:border-danger'

export function BriefForm() {
  const id = useId()
  const [values, setValues] = useState<Values>({})
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<Handshake | null>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)

  const fill = useCallback((raw: string, source: string) => {
    const parsed = parseDraft(raw)
    if (!parsed) {
      setNotice('That draft could not be read. Paste the JSON your agent wrote, with or without its code fence.')
      return
    }
    setValues((v) => ({ ...v, ...toValues(parsed) }))
    setErrors({})
    setNotice(`Filled from ${source}. Check every field before you send it, then tick the consent box.`)
  }, [])

  // A link from an agent can carry the draft after the #, which never reaches the server.
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.slice(1)
      if (hash) fill(hash, 'the link your agent gave you')
    }
    const frame = requestAnimationFrame(apply)
    window.addEventListener('hashchange', apply)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', apply)
    }
  }, [fill])

  const set = (key: string, value: string | boolean) => setValues((v) => ({ ...v, [key]: value }))

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSending(true)
    setErrors({})
    try {
      const res = await fetch('/api/v1/opportunity?via=form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toBody(values, consent, website)),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setDone(data as Handshake)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setErrors((data as { errors?: Record<string, string> }).errors ?? { _form: 'The brief could not be sent. Try again in a moment.' })
      requestAnimationFrame(() => errorRef.current?.focus())
    } catch {
      setErrors({ _form: 'The brief could not be sent. Check the connection and try again.' })
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-2xl rounded-card border border-line bg-surface-raised p-6 md:p-8" role="status">
        <p className="text-h3 text-ink">Sent. Thank you.</p>
        {done.tell_your_user ? <p className="mt-3 text-body text-ink-muted">{done.tell_your_user}</p> : null}
        {done.what_happens_next?.length ? (
          <ul className="mt-5 list-disc space-y-2 pl-5 text-body text-ink-muted marker:text-ink-subtle">
            {done.what_happens_next.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <CopyText className="mt-6" label={`Status of brief ${done.brief_id}`} value={done.status_url} />
      </div>
    )
  }

  const fieldErrors = Object.entries(errors).filter(([k]) => k !== '_form')

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl" aria-label="Opportunity brief">
      <div className="rounded-card border border-line bg-surface-raised p-5 md:p-6">
        <label htmlFor={`${id}-draft`} className="text-h4 text-ink">
          Working with an agent? Paste its draft here.
        </label>
        <p id={`${id}-draft-hint`} className="mt-1 text-small text-ink-muted">
          The JSON from the template, with or without a code fence. The fields below fill in, and you check them before sending.
        </p>
        <textarea
          id={`${id}-draft`}
          aria-describedby={`${id}-draft-hint`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          spellCheck={false}
          className={cn(inputClass, 'mt-3 font-mono text-[0.875rem]')}
        />
        <button
          type="button"
          onClick={() => fill(draft, 'the draft')}
          className="mt-3 inline-flex h-10 items-center rounded-control border border-line-strong px-4 text-small font-medium text-ink hover:bg-surface-hover"
        >
          Fill the form
        </button>
      </div>

      {notice ? (
        <p role="status" className="mt-5 text-body text-ink">
          {notice}
        </p>
      ) : null}

      {errors._form || fieldErrors.length ? (
        <p ref={errorRef} tabIndex={-1} role="alert" className="mt-6 rounded-control border border-danger px-4 py-3 text-body text-ink">
          {errors._form ?? `Fix ${fieldErrors.length === 1 ? 'one field' : `${fieldErrors.length} fields`} below, then send it again.`}
        </p>
      ) : null}

      {GROUPS.map((group) => (
        <fieldset key={group.title} className="mt-10 border-t border-line pt-6">
          <legend className="float-left mb-5 w-full text-h3 text-ink">{group.title}</legend>
          <div className="clear-both grid gap-5 md:grid-cols-2">
            {group.fields.map((f) => {
              const fid = `${id}-${f.key}`
              const err = errors[f.key]
              const described = [f.hint ? `${fid}-hint` : '', err ? `${fid}-err` : ''].filter(Boolean).join(' ') || undefined
              const wide = f.kind === 'textarea' || f.kind === 'lines' || f.kind === 'checkbox'
              if (f.kind === 'checkbox') {
                return (
                  <div key={f.key} className="md:col-span-2">
                    <label className="flex items-start gap-3 text-body text-ink">
                      <input
                        id={fid}
                        type="checkbox"
                        name={f.key}
                        checked={values[f.key] === true}
                        onChange={(e) => set(f.key, e.target.checked)}
                        aria-describedby={described}
                        className="mt-1 size-4 accent-[var(--color-cobalt-500)]"
                      />
                      <span>
                        {f.label} <code className="text-data text-ink-subtle">{f.key}</code>
                        {f.hint ? (
                          <span id={`${fid}-hint`} className="block text-small text-ink-muted">
                            {f.hint}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </div>
                )
              }
              const common = {
                id: fid,
                name: f.key,
                value: typeof values[f.key] === 'string' ? (values[f.key] as string) : '',
                'aria-invalid': err ? true : undefined,
                'aria-describedby': described,
                'aria-required': f.required || undefined,
                className: inputClass,
              }
              return (
                <div key={f.key} className={wide ? 'md:col-span-2' : undefined}>
                  <label htmlFor={fid} className="flex flex-wrap items-baseline gap-x-2 text-small font-medium text-ink">
                    {f.label}
                    {f.required ? <span className="text-ink-subtle">(required)</span> : null}
                    <code className="text-data font-normal text-ink-subtle">{f.key}</code>
                  </label>
                  <div className="mt-1.5">
                    {f.kind === 'textarea' || f.kind === 'lines' ? (
                      <textarea {...common} rows={f.kind === 'lines' ? 4 : 3} onChange={(e) => set(f.key, e.target.value)} />
                    ) : f.kind === 'select' ? (
                      <select {...common} onChange={(e) => set(f.key, e.target.value)}>
                        <option value="">Choose</option>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input {...common} type={f.kind === 'email' ? 'email' : f.kind === 'url' ? 'url' : 'text'} onChange={(e) => set(f.key, e.target.value)} />
                    )}
                  </div>
                  {f.hint ? (
                    <p id={`${fid}-hint`} className="mt-1 text-small text-ink-muted">
                      {f.hint}
                    </p>
                  ) : null}
                  {err ? (
                    <p id={`${fid}-err`} className="mt-1 text-small font-medium text-danger">
                      {err}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </fieldset>
      ))}

      {/* Hidden from people and assistive technology; scripts that fill every field fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="mt-10 border-t border-line pt-6">
        <label className="flex items-start gap-3 text-body text-ink">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${id}-consent-err` : undefined}
            className="mt-1 size-4 accent-[var(--color-cobalt-500)]"
          />
          <span>
            {CONSENT_STATEMENT} <code className="text-data text-ink-subtle">consent</code>
          </span>
        </label>
        {errors.consent ? (
          <p id={`${id}-consent-err`} className="mt-1 text-small font-medium text-danger">
            {errors.consent}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={sending}
          className="mt-6 inline-flex h-12 items-center rounded-control bg-action px-6 text-[0.9375rem] font-medium text-action-ink hover:bg-action-hover disabled:opacity-60"
        >
          {sending ? 'Sending' : 'Send the brief'}
        </button>
        <p className="mt-3 text-small text-ink-muted">It goes to Yitz only. This site never emails the contact.</p>
      </div>
    </form>
  )
}
