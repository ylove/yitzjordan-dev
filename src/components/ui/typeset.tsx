import { Fragment, type ReactNode } from 'react'

/**
 * Typesetting for the display face. Hubot Sans draws a barred zero that reads as a theta at
 * heading sizes, so runs of digits are set in Geist; and hyphenated words ("full-stack") stay on
 * one line instead of breaking at the hyphen.
 */
export function typeset(text: string): ReactNode {
  return text.split(/(\d[\d.,:%]*|[A-Za-z]+(?:-[A-Za-z]+)+)/).map((part, i) => {
    if (!part) return null
    if (/^\d/.test(part)) {
      return (
        <span key={i} className="font-sans tracking-[-0.04em]">
          {part}
        </span>
      )
    }
    if (/^[A-Za-z]+-/.test(part)) {
      return (
        <span key={i} className="whitespace-nowrap">
          {part}
        </span>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}
