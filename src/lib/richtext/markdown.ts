/**
 * Lexical to Markdown for agents (llms-full.txt, .md twins, MCP tools). Uses the article feature
 * set, which is a superset of the default editor, so every body converts. Server only.
 */
import { convertLexicalToMarkdown, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import config from '@payload-config'
import { articleBodyFeatures } from '@/fields/articleBody'

let editorConfigPromise: ReturnType<typeof editorConfigFactory.fromFeatures> | null = null

function getEditorConfig() {
  editorConfigPromise ??= (async () => editorConfigFactory.fromFeatures({ config: await config, features: articleBodyFeatures }))()
  return editorConfigPromise
}

export async function lexicalToMarkdown(data: unknown): Promise<string> {
  if (!data || typeof data !== 'object') return ''
  try {
    const editorConfig = await getEditorConfig()
    return convertLexicalToMarkdown({ data: data as SerializedEditorState, editorConfig }).trim()
  } catch (err) {
    console.error('[markdown] conversion failed', err instanceof Error ? err.message : err)
    return ''
  }
}
