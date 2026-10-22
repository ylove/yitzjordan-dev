import {
  BlocksFeature,
  CodeBlock,
  defaultEditorFeatures,
  lexicalEditor,
  type FeatureProviderServer,
} from '@payloadcms/richtext-lexical'
import type { RichTextField } from 'payload'

/**
 * Languages offered by the Code block. Kept short on purpose: the block's language field is a
 * select, which Postgres stores as an enum, and Payload's default list is every Monaco language.
 * Adding one needs a migration.
 */
export const CODE_LANGUAGES = {
  plaintext: 'Plain text',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  tsx: 'TSX',
  json: 'JSON',
  shell: 'Shell',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  markdown: 'Markdown',
  yaml: 'YAML',
  xml: 'XML',
  sql: 'SQL',
} as const

export const codeBlock = CodeBlock({ languages: { ...CODE_LANGUAGES }, defaultLanguage: 'plaintext' })

/**
 * The feature list for long-form bodies (articles, project engineering notes). Shared by the
 * collection fields and scripts/import-legacy.ts, so imported content always matches the editor.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- feature providers have heterogeneous generics
export const articleBodyFeatures: FeatureProviderServer<any, any, any>[] = [
  ...defaultEditorFeatures,
  BlocksFeature({ blocks: [codeBlock] }),
]

export function articleBodyField(overrides: Partial<RichTextField> = {}): RichTextField {
  return {
    name: 'body',
    type: 'richText',
    editor: lexicalEditor({ features: () => articleBodyFeatures }),
    ...overrides,
  } as RichTextField
}
