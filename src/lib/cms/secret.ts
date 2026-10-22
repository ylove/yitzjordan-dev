/**
 * PAYLOAD_SECRET resolution.
 *
 * Production (NODE_ENV=production, which includes `next build` and `next start`) refuses to
 * run without a real secret. Local development and Payload CLI commands get a fixed,
 * clearly labelled fallback so a fresh checkout still boots.
 */

const DEV_FALLBACK_SECRET = 'dev-only-insecure-payload-secret-never-use-in-production'

export function getPayloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET?.trim()
  if (secret) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'PAYLOAD_SECRET is not set. Set it to a long random string (for example `openssl rand -hex 32`) in the deployment environment.',
    )
  }

  return DEV_FALLBACK_SECRET
}
