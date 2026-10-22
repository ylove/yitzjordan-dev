import type { CollectionConfig, Field } from 'payload'
import { SUBMISSION_STATUSES } from '../../lib/forms/schema'
import { isAdmin, nobody } from './access'

/** Submitted values are visible to admins but can never be edited. Only `status` changes. */
export function readOnlyField(field: Field): Field {
  return {
    ...field,
    access: { ...('access' in field ? field.access : {}), update: () => false },
    admin: { ...('admin' in field ? field.admin : {}), readOnly: true },
  } as Field
}

/** Workflow status and request metadata shared by every submission collection. */
export const submissionMetaFields: Field[] = [
  {
    name: 'status',
    type: 'select',
    required: true,
    defaultValue: 'new',
    index: true,
    options: [...SUBMISSION_STATUSES],
    admin: { position: 'sidebar' },
  },
  readOnlyField({
    name: 'ipHash',
    label: 'IP hash',
    type: 'text',
    index: true,
    admin: {
      position: 'sidebar',
      description:
        'SHA-256 of the client IP and the server secret. Used for rate limiting. The raw IP is never stored.',
    },
  }),
  readOnlyField({
    name: 'userAgent',
    type: 'text',
    admin: { position: 'sidebar' },
  }),
]

export const submissionAccess: NonNullable<CollectionConfig['access']> = {
  // Only admins can see submissions, since they contain personal details.
  read: isAdmin,
  // Submissions arrive through /api/v1/intro and the MCP server only. Those
  // routes validate, rate limit and then write with overrideAccess.
  create: nobody,
  update: isAdmin,
  delete: isAdmin,
}
