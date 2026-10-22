import type { FieldHook, TextField } from 'payload'

/** "Hello, World!" -> "hello-world" */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const fallback = data?.[fallbackField]
    if (typeof fallback === 'string' && fallback.trim()) return slugify(fallback)
    return value
  }

/** A unique, URL-safe slug field that fills itself from `fallbackField` when left empty. */
export function slugField(fallbackField = 'title', overrides: Partial<TextField> = {}): TextField {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    ...overrides,
    admin: {
      position: 'sidebar',
      description: 'Lowercase letters, numbers and hyphens. Filled from the title if left empty.',
      ...(overrides.admin ?? {}),
    },
    hooks: {
      ...(overrides.hooks ?? {}),
      beforeValidate: [formatSlug(fallbackField), ...(overrides.hooks?.beforeValidate ?? [])],
    },
  } as TextField
}
