# nithishkannanm.com

Portfolio and technical blog for Nithish Kannan M — AI systems engineer working
on memory, retrieval, and agent reliability.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · MDX · Motion ·
anime.js

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint
```

---

## How content works

All content is MDX in `content/`. Frontmatter is validated with zod at read
time, so a typo fails the build loudly instead of rendering an empty section.

```
content/
  projects/*.mdx   → /work/[slug]
  blog/*.mdx       → /blog/[slug]
```

### Adding a project

```yaml
---
title: Project name
subtitle: One line, shown in mono under the title
period: Jan 2026 — Present      # optional
org: Where, if relevant          # optional
status: shipped | active | research
featured: true                   # shows as a panel rather than a row
order: 1                         # sort order
stack: [Python, FastAPI]
summary: >-
  Two or three sentences. Used on cards, in metadata, and in llms.txt.
metrics:
  - label: Warm rate
    value: 90
    unit: "%"
    baseline: 86                 # optional comparison point
    baselineLabel: App Standby Buckets
    better: higher               # higher | lower — drives delta colouring
    fill: 0.9                    # 0–1, drives the bar. omit if not proportional
    note: optional caption
links:
  github: https://…
  pypi: https://…
---
```

Metrics animate on scroll into view, but the real figure is what's rendered in
the HTML — the count-up only overwrites it once it actually plays. A metric
never shows a placeholder zero.

### Adding a post

```yaml
---
title: Post title
description: One or two sentences. Used for cards, meta description, and RSS.
date: "2026-08-04"     # quote it — bare dates parse as numbers in YAML
tags: [Retrieval, RAG]
draft: true            # visible in dev, hidden in production
---
```

**Drafts** appear in `npm run dev` and are excluded from production builds, the
sitemap, and RSS. Flip `draft: false` to publish.

Available in MDX beyond standard markdown: `<Note>`, `<Figure>`, `<Compare>` /
`<Side>`, and `<Todo>`. Code fences support `title="file.py"`,
`showLineNumbers`, line ranges `{1,3-5}`, and `/word/` highlighting. Math uses
`$inline$` and `$$block$$`.

---

## Design system

Tokens live in `app/globals.css` under `@theme`. The look is "instrument
panel": hairline borders, never shadows; mono for labels and figures; tabular
numerals everywhere numeric; amber (`--color-signal`) used sparingly for live
state and key figures.

Motion is centralised in `lib/motion.ts` — nothing should hand-tune an easing.
Motion (motion.dev) handles scroll reveals and the mobile nav; anime.js handles
two imperative set-pieces where a shared timeline genuinely beats declarative
variants: the metric readouts and the hero trace.

Reduced motion is honoured at three levels: `useReducedMotion` gates every
Motion animation, anime timelines call `.complete()` to land on their final
frame instantly, and a CSS backstop in `globals.css` catches everything else.
A `<noscript>` override in the root layout makes animated content render in
its final state when JS is unavailable.

---

## Deploying

### Vercel (primary)

1. Push to GitHub.
2. Import the repo in Vercel — the framework is auto-detected, no build config
   needed.
3. Add the three `NEXT_PUBLIC_EMAILJS_*` variables from `.env.example`.
4. Add the domain `nithishkannanm.com` and set `www` to redirect to apex.

### Render (fallback)

Deploy as a **Node web service**, not a static site:

- Build: `npm install && npm run build`
- Start: `npm run start`

A static export would drop `/api/og`, which generates social preview images at
request time.

---

## Generated routes

| Route | What it is |
|---|---|
| `/sitemap.xml` | All published routes; excludes drafts |
| `/robots.txt` | Points at the sitemap |
| `/rss.xml` | Published posts |
| `/llms.txt` | Structured site summary for AI crawlers |
| `/api/og` | Dynamic OG images — `?title=…&subtitle=…&kind=work\|post` |

---

## Things to keep current

- `public/Nithish_Kannan_M_Resume.pdf` — the downloadable résumé.
- `lib/resume.ts` — experience, education, skills, certifications. Kept in sync
  with the résumé by hand; it's the source for both `/` and `/about`.
- `lib/site.ts` — name, URL, email, social links, nav.

---

## Previous site

The original Vite + React single-page site is preserved at
`_archive/vite-portfolio/`. It has no dependencies installed and is not part of
the build. Delete it once you're happy with this one.
