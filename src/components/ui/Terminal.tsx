'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from './cn'

export type TerminalProps = {
  /** One command or several lines. Lines starting with "#" render as comments. */
  commands: string | string[]
  /** Window title, e.g. "Install Agent Roundtable". */
  title?: string
  /** Text copied by the button. Defaults to the non-comment lines joined by newlines. */
  copyText?: string
  /** Prompt shown before each command. */
  prompt?: string
  className?: string
}

/**
 * A mono code block for real install commands, with a copy button and an
 * aria-live "Copied" message. Always dark, on every surface.
 *   <Terminal title="Install" commands={['npm i -g agent-roundtable', 'roundtable init']} />
 */
export function Terminal({ commands, title = 'Terminal', copyText, prompt = '$', className }: TerminalProps) {
  const lines = Array.isArray(commands) ? commands : [commands]
  const text = copyText ?? lines.filter((l) => !l.trim().startsWith('#')).join('\n')
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for browsers without the async clipboard API.
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <figure
      data-surface="ink"
      className={cn('min-w-0 max-w-full self-start overflow-hidden rounded-card border border-ink-700 bg-ink-950 text-left', className)}
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-ink-700 py-2 pr-2 pl-4">
        <span className="text-data truncate text-ink-400">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-control px-2.5 text-[0.8125rem] font-medium text-ink-300 transition-colors hover:bg-ink-800 hover:text-paper-50"
        >
          {copied ? <Check aria-hidden className="size-3.5" strokeWidth={2} /> : <Copy aria-hidden className="size-3.5" strokeWidth={1.75} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
          <span className="sr-only"> {lines.length > 1 ? 'commands' : 'command'}</span>
        </button>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-4 text-[0.875rem] leading-7">
        <code className="font-mono">
          {lines.map((line, i) => {
            const comment = line.trim().startsWith('#')
            return (
              <span key={i} className="block whitespace-pre">
                {comment ? (
                  <span className="text-ink-400">{line}</span>
                ) : (
                  <>
                    <span aria-hidden className="mr-3 select-none text-ink-500">
                      {prompt}
                    </span>
                    <span className="text-paper-100">{line}</span>
                  </>
                )}
              </span>
            )
          })}
        </code>
      </pre>
      <p aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </p>
    </figure>
  )
}
