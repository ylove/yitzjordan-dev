#!/usr/bin/env node
/**
 * Checks the schema.org JSON-LD on every page of a running build.
 *
 *   npm run build
 *   node scripts/check-jsonld.mjs --start          # starts `next start` on a spare port
 *   node scripts/check-jsonld.mjs http://localhost:3000   # or checks a server you started
 *
 * Pages come from /sitemap.xml (every indexable route, product page and published post) plus
 * the noindex routes listed in EXTRA_PATHS. For each page it:
 *   - parses every <script type="application/ld+json"> block,
 *   - checks every {"@id": ...} reference resolves to a node defined on the same page,
 *   - checks site images it points to (logo, primaryImageOfPage, image) load.
 * Exits 1 on any failure.
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

/** Routes that are not in the sitemap because they are noindex. */
const EXTRA_PATHS = []
const IMAGE_KEYS = new Set(['logo', 'primaryImageOfPage', 'image'])

const args = process.argv.slice(2)
const shouldStart = args.includes('--start')
const port = 3000 + Math.floor(Math.random() * 1000) + 1000
let base = args.find((a) => /^https?:\/\//.test(a)) ?? (shouldStart ? `http://localhost:${port}` : 'http://localhost:3000')
base = base.replace(/\/$/, '')

let server = null
if (shouldStart) {
  server = spawn('npx', ['next', 'start', '-p', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] })
  server.stderr.on('data', (d) => process.stderr.write(d))
  const deadline = Date.now() + 60_000
  for (;;) {
    try {
      const res = await fetch(`${base}/robots.txt`)
      if (res.ok) break
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) {
      console.error('next start did not come up within 60s')
      server.kill()
      process.exit(1)
    }
    await sleep(500)
  }
}

const failures = []
const fail = (msg) => failures.push(msg)

function toLocal(url, siteOrigin) {
  try {
    const u = new URL(url)
    if (siteOrigin && u.origin === siteOrigin) return `${base}${u.pathname}${u.search}`
    if (u.origin === base) return url
    return null
  } catch {
    return null
  }
}

/** Walks a JSON-LD value, collecting defined ids, references, types and image URLs. */
function walk(value, acc, key = null) {
  if (Array.isArray(value)) {
    for (const v of value) walk(v, acc, key)
    return
  }
  if (!value || typeof value !== 'object') {
    if (key && IMAGE_KEYS.has(key) && typeof value === 'string') acc.images.add(value)
    return
  }
  const keys = Object.keys(value)
  if (typeof value['@id'] === 'string') {
    if (keys.length === 1) acc.refs.add(value['@id'])
    else acc.defined.add(value['@id'])
  }
  if (key && IMAGE_KEYS.has(key) && typeof value.url === 'string') acc.images.add(value.url)
  for (const [k, v] of Object.entries(value)) {
    if (k === '@context') continue
    walk(v, acc, k)
  }
}

try {
  const sitemapRes = await fetch(`${base}/sitemap.xml`)
  if (!sitemapRes.ok) throw new Error(`/sitemap.xml returned ${sitemapRes.status}`)
  const sitemap = await sitemapRes.text()
  const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].trim()).pathname)
  const paths = [...new Set([...sitemapPaths, ...EXTRA_PATHS])]

  const rows = []
  const images = new Map() // local url -> first page that used it
  let siteOrigin = null

  for (const path of paths) {
    const res = await fetch(`${base}${path}`)
    if (!res.ok) {
      fail(`${path}: HTTP ${res.status}`)
      continue
    }
    const html = await res.text()
    const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
    if (!blocks.length) fail(`${path}: no JSON-LD blocks`)

    const acc = { defined: new Set(), refs: new Set(), images: new Set() }
    const types = []
    for (const [i, raw] of blocks.entries()) {
      let doc
      try {
        doc = JSON.parse(raw)
      } catch (e) {
        fail(`${path}: block ${i + 1} is not valid JSON (${e.message})`)
        continue
      }
      if (doc['@context'] !== 'https://schema.org') fail(`${path}: block ${i + 1} has no schema.org @context`)
      const nodes = Array.isArray(doc['@graph']) ? doc['@graph'] : [doc]
      for (const node of nodes) {
        if (!node['@type']) fail(`${path}: block ${i + 1} has a top-level node without @type`)
        types.push(...[].concat(node['@type'] ?? []))
        if (node['@type'] === 'Organization' && typeof node['@id'] === 'string') siteOrigin = new URL(node['@id']).origin
      }
      walk(doc, acc)
    }

    for (const id of acc.refs) {
      if (!acc.defined.has(id)) fail(`${path}: @id reference does not resolve on the page: ${id}`)
    }
    for (const img of acc.images) if (!images.has(img)) images.set(img, path)
    rows.push({ path, types: [...new Set(types)].join(', ') })
  }

  for (const [img, path] of images) {
    const local = toLocal(img, siteOrigin)
    if (!local) continue // off-site image, not ours to check
    const res = await fetch(local)
    if (!res.ok) fail(`${path}: image ${img} returned HTTP ${res.status}`)
  }

  const width = Math.max(...rows.map((r) => r.path.length))
  for (const r of rows) console.log(`${r.path.padEnd(width)}  ${r.types}`)
  console.log(`\n${rows.length} pages, ${images.size} images checked against ${base}`)
} catch (e) {
  fail(e instanceof Error ? e.message : String(e))
} finally {
  server?.kill()
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('JSON-LD OK')
