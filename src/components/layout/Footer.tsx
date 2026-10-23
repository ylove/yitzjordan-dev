import { TrackedLink } from '@/components/analytics/TrackedLink'
import { NAV_LINKS, SITE } from '@/content/site'

const linkClass =
  'inline-block py-1 text-small text-ink-muted transition-colors hover:text-ink hover:underline hover:decoration-line-strong hover:underline-offset-4'

const COLUMNS = [
  { heading: 'Site', links: [...NAV_LINKS.map((l) => ({ label: l.label, href: l.href })), { label: 'Privacy', href: '/privacy' }] },
  {
    heading: 'Elsewhere',
    links: [
      { label: 'LinkedIn', href: SITE.links.linkedin },
      { label: 'GitHub', href: SITE.links.github },
      { label: 'Vouch Networks', href: SITE.links.vouch },
    ],
  },
  {
    heading: 'For agents',
    links: [
      { label: 'How agents can use this site', href: '/agents' },
      { label: 'llms.txt', href: '/llms.txt' },
      { label: 'AGENTS.md', href: '/AGENTS.md' },
      { label: 'RSS feed', href: '/feed.xml' },
    ],
  },
]

/** Site footer. Column titles are <p> under one sr-only <h2>, so heading order never breaks. */
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer aria-labelledby="site-footer-title" className="border-t border-line">
      <h2 id="site-footer-title" className="sr-only">
        Site footer
      </h2>
      <div className="container-page grid gap-10 py-14 md:grid-cols-12 md:gap-8 md:py-16">
        <div className="md:col-span-5">
          <p className="font-display text-h4 text-ink [font-stretch:105%]">{SITE.name}</p>
          <p className="mt-2 max-w-[40ch] text-small text-ink-muted">
            AI technical lead and full-stack engineer. Founder of Vouch Networks. Writing about how language models behave.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.heading} className="md:col-span-2 md:last:col-span-3">
            <p className="text-small font-medium text-ink">{c.heading}</p>
            <ul className="mt-3">
              {c.links.map((l) => (
                <li key={l.href}>
                  <TrackedLink href={l.href} className={linkClass}>
                    {l.label}
                  </TrackedLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page border-t border-line py-6">
        <p className="text-small text-ink-subtle">© {year} Yitz Jordan</p>
      </div>
    </footer>
  )
}
