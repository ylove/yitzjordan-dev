import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge that knows our custom utilities. Without this it reads
 * `text-h2` as a text color and silently drops it next to `text-ink`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'h4', 'lead', 'body', 'small', 'data', 'stat'] }],
    },
  },
})

/** Join class names and resolve Tailwind conflicts (last one wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
