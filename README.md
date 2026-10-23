# yitzjordan.dev

The personal site of Yitz Jordan: work, writing, videos, and an agent channel (MCP server, REST API, llms.txt, Markdown versions of every page).

Next.js 16 (App Router) and Payload 3 in one app, on Vercel, with Neon Postgres and Vercel Blob. Structure, components and conventions follow the Vouch Networks corporate site.

## Run it

```sh
npm install
vercel env pull .env.local --environment development   # DATABASE_URL, PAYLOAD_SECRET, BLOB token
npm run dev                                            # http://localhost:3000
```

The CMS admin is at `/<PAYLOAD_ADMIN_ROUTE>`. The value must match the folder name in `src/app/(payload)/`.

| Command | What it does |
| --- | --- |
| `npm run migrate:create -- <name>` | Create a migration after changing `src/collections` or `src/globals` |
| `npm run migrate` | Apply pending migrations (production deploys run this automatically, see `scripts/vercel-build.mjs`) |
| `npm run generate:types` | Regenerate `src/payload-types.ts` |
| `npm run seed` | Seed skills, projects and videos (`scripts/seed-data.ts`). The profile and the evidence catalog are personal and live outside this repository: set `PRIVATE_SEED_DIR` to include them. Overwrites the seeded documents; use `-- --only=skills` and friends after launch |
| `npm run import:legacy` | Import the three articles from the old GitHub Pages repo (`../ylove-github-io`) |
| `npx payload run scripts/verify-legacy-parity.ts` | Check the imported articles match the originals, text and structure |
| `npm run check:jsonld -- --start` | Check every page's JSON-LD references resolve, against a production build |

Schema changes go through migrations only (`push: false`). Select fields are Postgres enums, so adding an option needs a migration.

## Content model

- **Profile** (global): the single source for the home page, `/about`, llms.txt, the MCP server and the Person JSON-LD. `availability` is shown to agents only, never on a page.
- **Articles**: research (`/research/<slug>`) and blog (`/blog/<slug>`). `anchors` pins heading ids so old links keep working.
- **Projects**: `/work/<slug>`, modeled on the vouchnetworks.org product pages, plus engineering notes. `visual` selects a coded diagram from `src/components/pages/work/visuals/`.
- **Videos**: `/videos/<slug>`, VideoObject data, click-to-load YouTube or uploaded MP4.
- **Skills** and **Evidence**: the catalog behind `match_requirements`. Every evidence entry must be public and checkable.
- **Opportunities**, **Inquiries** and **RequirementTerms**: what agents send (opportunity briefs from hiring teams, other introductions, aggregate requirement terms). Admin only.

## Agent channel

See `/agents` (or `/AGENTS.md`). No model runs on the server: tools return facts and links, and the visiting agent does the reasoning. `src/lib/agents/tools.ts` is the one data layer behind the MCP server (`/api/mcp`), the REST API (`/api/v1/*`, described by `/openapi.json`) and the Markdown twins. Opportunity briefs (`src/lib/agents/opportunity*.ts`) arrive through the MCP tool `submit_opportunity`, `POST /api/v1/opportunity` or the form at `/agents/brief`.

## Environment

See `.env.example`. On Vercel: `DATABASE_URL` (Neon integration), `BLOB_READ_WRITE_TOKEN` (Blob store), `PAYLOAD_SECRET`, `PAYLOAD_ADMIN_ROUTE`, `NEXT_PUBLIC_SITE_URL`, `INDEXNOW_KEY`, and for introduction emails `RESEND_API_KEY`, `EMAIL_FROM` and `CONTACT_NOTIFY_TO`.

## Docs

- `docs/design.md`: visual system and copy rules
- `docs/seo.md`: structured data and search rules
