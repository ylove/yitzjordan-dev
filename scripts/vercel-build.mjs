#!/usr/bin/env node
/**
 * Vercel build: apply pending Payload migrations on production deploys only, then build.
 * Preview deploys share the production database, so they never migrate it.
 */
import { spawnSync } from 'node:child_process'

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: process.env })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

if (process.env.VERCEL_ENV === 'production') run('npx', ['payload', 'migrate'])
else console.log(`[build] skipping migrations (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'unset'})`)
run('npx', ['next', 'build'])
