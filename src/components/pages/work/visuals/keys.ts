/**
 * Bespoke diagrams a project page can show in "How it works". The Projects collection imports
 * this list (no React here, so the Payload CLI can load it); registry.tsx maps each key to its
 * component. Adding a key changes a Postgres enum, so it needs a migration.
 */
export const VISUAL_KEYS = [
  { value: 'none', label: 'None' },
  { value: 'roundtable', label: 'Agent Roundtable: conversation, contract, code' },
  { value: 'lawglass', label: 'Lawglass: question to cited answer' },
  { value: 'agent-union', label: 'Agent Union: grievance procedure' },
  { value: 'snapwing', label: 'Snapwing: bug report to reviewed fix' },
] as const

export type VisualKey = (typeof VISUAL_KEYS)[number]['value']
