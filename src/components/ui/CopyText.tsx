'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from './cn'

/** A single value (a URL, a command) with a copy button and an aria-live confirmation. */
export function CopyText({ value, label, className }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the value is selectable text, so it can still be copied by hand.
    }
  }

  return (
    <div className={cn('min-w-0 max-w-full rounded-card border border-line bg-surface-raised', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line py-2 pr-2 pl-4">
        <span className="text-data text-ink-subtle">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-control px-2.5 text-[0.8125rem] font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          {copied ? <Check aria-hidden className="size-3.5" strokeWidth={2} /> : <Copy aria-hidden className="size-3.5" strokeWidth={1.75} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
          <span className="sr-only"> {label}</span>
        </button>
      </div>
      <p className="overflow-x-auto px-4 py-3.5 font-mono text-[0.9375rem] whitespace-nowrap text-ink select-all">{value}</p>
      <p aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </p>
    </div>
  )
}
