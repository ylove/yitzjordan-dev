import { Geist, Geist_Mono, Hubot_Sans } from 'next/font/google'

/**
 * Site fonts. Applied as CSS variables on <html> in (frontend)/layout.tsx and
 * consumed by the @theme block in src/styles/tokens.css:
 *   --font-hubot-sans -> font-display (Hubot Sans, variable wdth + wght; headings
 *                        use wdth 102 to 105 and wght 620 to 640). Mona Sans's
 *                        sibling, so the site reads as related to vouchnetworks.org
 *                        without copying it.
 *   --font-geist      -> font-sans (UI and body)
 *   --font-geist-mono -> font-mono (data, code, terminal only)
 */
export const hubotSans = Hubot_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hubot-sans',
  weight: 'variable',
  axes: ['wdth'],
})

export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  weight: ['400', '500', '600'],
})

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
  weight: ['400', '500'],
})

export const fontVariables = [hubotSans.variable, geist.variable, geistMono.variable].join(' ')
