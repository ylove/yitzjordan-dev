import { APIError, type CollectionConfig, type PayloadRequest } from 'payload'
import { adminFieldAccess, isAdmin, isAdminOrSelf, isStaffUser } from './shared/access'

export const USER_ROLES = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
] as const

async function countAdmins(req: PayloadRequest) {
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    where: { role: { equals: 'admin' } },
    overrideAccess: true,
    req,
  })
  return totalDocs
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 28800, // 8 hours
    useAPIKey: true,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'updatedAt'],
  },
  access: {
    // Any user with a valid role may open the admin panel.
    admin: ({ req: { user } }) => isStaffUser(user),
    // Admins manage all users. Editors can only see and update their own account.
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        // The very first account (the create-first-user screen) is always an admin.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({
            collection: 'users',
            overrideAccess: true,
            req,
          })
          if (totalDocs === 0) return { ...data, role: 'admin' }
        }

        // Never demote the last remaining admin.
        if (
          operation === 'update' &&
          originalDoc?.role === 'admin' &&
          data?.role &&
          data.role !== 'admin' &&
          (await countAdmins(req)) <= 1
        ) {
          throw new APIError('At least one admin account is required.', 400, undefined, true)
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({
          collection: 'users',
          id,
          overrideAccess: true,
          depth: 0,
          req,
        })
        if (doc?.role === 'admin' && (await countAdmins(req)) <= 1) {
          throw new APIError('At least one admin account is required.', 400, undefined, true)
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [...USER_ROLES],
      // Only admins may set or change roles, so nobody can promote themselves.
      access: {
        create: adminFieldAccess,
        update: adminFieldAccess,
      },
      admin: {
        position: 'sidebar',
        description: 'Admins manage users and form submissions. Editors manage site content.',
      },
    },
  ],
}
