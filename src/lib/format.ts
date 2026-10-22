/** Display helpers shared by pages, feeds and agent output. */

const DATE = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' })
const MONTH = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' })

export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : DATE.format(d)
}

/** "2014-01" or "2014" -> "Jan 2014" / "2014". */
export function formatMonth(value: string | null | undefined): string {
  if (!value) return ''
  if (/^\d{4}$/.test(value)) return value
  const d = new Date(`${value.slice(0, 7)}-01T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? value : MONTH.format(d)
}

/** 103 -> "1:43", 3725 -> "1:02:05". */
export function formatDuration(seconds: number | null | undefined): string {
  const s = Math.max(0, Math.round(seconds ?? 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`
}

/** ISO date (YYYY-MM-DD) for machine output. */
export function isoDay(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10)
}
