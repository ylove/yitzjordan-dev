/** First focusable element on every page. Visible on focus. Targets <main id="main">. */
export function SkipLink({ href = '#main' }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only rounded-control bg-ink-900 px-4 py-3 font-medium text-paper-50 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]"
    >
      Skip to content
    </a>
  )
}
