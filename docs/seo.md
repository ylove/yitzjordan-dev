# Search and structured data

## The entity

Everything centers on one Person, `https://yitzjordan.dev/#person`, rendered on every page (compact) and in full on `/` and `/about` (ProfilePage).

- `sameAs`: professional profiles only (LinkedIn, GitHub), edited in the Profile global. The field refuses encyclopedia and entertainment hosts.
- No `alternateName`, `birthDate` or `birthPlace`.
- `worksFor`: Vouch Networks, by its own `@id` (`https://www.vouchnetworks.org/#organization`), with a stub on every page that names the founder.
- `alumniOf`: Charter and Quartz (from Profile experience entries marked `alumniOf`), and education. Other roles are described generically and stay out of the graph.
- `homeLocation`: New York first, Columbus second.
- `knowsAbout`: Skills marked `knowsAbout`, linked to Wikidata where the id is verified.

## Pages

- Work: ItemPage plus SoftwareSourceCode (or SoftwareApplication), FAQPage, BreadcrumbList.
- Articles: Article (research) or BlogPosting (blog), with a stable image at `/og/article/<slug>`.
- Videos: VideoObject with thumbnail, upload date, duration and embedUrl. No `sameAs` to the platform URL.
- `scripts/check-jsonld.mjs` must pass: every `@id` reference resolves on its page.

## Discovery

- `sitemap.xml` (with video entries), `robots.txt` (welcomes search and AI crawlers, allows `/api/mcp` and `/api/v1/`), `feed.xml`.
- llms.txt and llms-full.txt, Markdown twins (`.md` URLs and `Accept: text/markdown`), AGENTS.md.
- Publishing pings IndexNow and revalidates affected pages (`src/lib/cms/publish-hooks.ts`).
