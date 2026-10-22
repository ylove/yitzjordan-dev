import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Role model
 * - admin:  manages users and everything else, including form submissions.
 * - editor: creates and edits site content (pages, posts, categories, media, site settings).
 *
 * The role field itself can only be written by admins, so nobody can promote themselves.
 */
export type Role = 'admin' | 'editor'

type MaybeUser = PayloadRequest['user']

function roleOf(user: MaybeUser): Role | null {
  if (!user || user.collection !== 'users') return null
  const role = (user as { role?: unknown }).role
  return role === 'admin' || role === 'editor' ? role : null
}

export const isAdminUser = (user: MaybeUser): boolean => roleOf(user) === 'admin'

/** Any signed-in user with a valid role. */
export const isStaffUser = (user: MaybeUser): boolean => roleOf(user) !== null

export const isAdmin: Access = ({ req: { user } }) => isAdminUser(user)

export const isStaff: Access = ({ req: { user } }) => isStaffUser(user)

export const anyone: Access = () => true

export const nobody: Access = () => false

/** Admins see everything; other signed-in users only see their own user document. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (isAdminUser(user)) return true
  if (user && user.collection === 'users') return { id: { equals: user.id } }
  return false
}

/** Published documents for the public, everything for staff. */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (isStaffUser(user)) return true
  return { status: { equals: 'published' } }
}

export const adminFieldAccess: FieldAccess = ({ req: { user } }) => isAdminUser(user)
