/** Server-safe link helpers, usable from server and client components alike. */

const OWN_HOSTS = new Set(['yitzjordan.dev', 'www.yitzjordan.dev'])

/** True for links that leave the site: other hosts, mailto:, tel: and sms:. */
export function isExternalHref(href: string): boolean {
  if (/^(mailto|tel|sms):/i.test(href)) return true
  if (!/^https?:\/\//i.test(href)) return false
  try {
    return !OWN_HOSTS.has(new URL(href).hostname.toLowerCase())
  } catch {
    return true
  }
}

/** True for external http(s) links, which TrackedLink opens in a new tab. */
export function opensInNewTab(href: string, external?: boolean): boolean {
  return (external ?? isExternalHref(href)) && /^https?:\/\//i.test(href)
}
