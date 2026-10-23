# Design and copy

The site is a sibling of vouchnetworks.org: the same component structure, type scale shape and rules, with its own palette and display face.

## Visual

- Light-first. Warm paper (`paper-100`), graphite ink (`ink-900`), one cobalt accent used for underlines, focus rings and status dots only. A graphite `ink` surface for contrast panels.
- Hubot Sans for headings (wdth 102 to 105), Geist for text, Geist Mono for data and code.
- 6px controls, 10px cards. Shadows only on menus. No glows, gradients or neon.
- Tokens live in `src/styles/tokens.css`. Components read semantic tokens (`bg-surface`, `text-ink`, `border-line`) and flip with `data-surface`.
- Contrast: every text token is at least 4.5:1 on its surface (values in the token comments).

## Copy

- No eyebrows: no small label above a heading.
- No em or en dashes in site copy. Periods, commas and colons.
- No italics in headings. No decorative emoji (Snapwing's reaction emoji are its interface, so its copy shows them). No exclamation marks.
- Avoid: ship, shipped, measured, seamless, leverage, empower, unlock, cutting-edge, next-gen, robust, world-class, game-changing, synergy, "X, not Y" slogans, numbered section labels, question headlines.
- First person on pages, specific and plain. Third person only in machine-facing summaries.
- Evergreen: nothing about looking for a job. Contact is LinkedIn; hiring teams' agents send an opportunity brief (/agents/brief).
- Honest status labels: "Open source", "In development", the real version number. Every figure on a project page has a source.
- Authored articles keep their author's punctuation; the dash rule applies to site copy.

## Type

- Hubot Sans draws a barred zero that reads as a theta at heading sizes. `typeset()` (src/components/ui/typeset.tsx) sets digits in Geist and keeps hyphenated words on one line; `Heading` applies it to string children.
