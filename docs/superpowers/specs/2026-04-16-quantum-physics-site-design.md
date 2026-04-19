# Quantum Physics Site — Design Spec

- **Date:** 2026-04-16
- **Author:** Rajat Dua (rajat.dua@formalize.com)
- **Status:** Draft — awaiting review

## Purpose

Build a Danish-language website that makes quantum physics accessible to a wide audience by letting the visitor pick a depth level — **Udskoling, Gymnasium, Universitet, Kandidat** — and experiencing every topic at that depth. Each topic is also tied to a Spotify podcast episode the author releases (approximately once per month) so curious learners can go deeper by listening.

## Goals

- Same curriculum of quantum-physics topics explained at four distinct depths.
- A guided curriculum order (Topic 1 → 2 → 3 …) within each level, not a free-form topic library.
- One Spotify podcast episode per topic; optional so topics can ship before the episode does.
- Static site, fast, mobile-responsive, minimal JavaScript.
- Content authored in Markdown, committed to the repo.
- Danish at launch, architecture ready for additional locales later.

## Non-goals (MVP)

- User accounts, progress tracking, or comments.
- Search, newsletter, or community features.
- Interactive JS simulations — animations only (CSS / small diagrams).
- Multiple locales shipping content at launch (architecture is ready; only `da` content ships).
- A CMS — content stays as Markdown in the repo.

## Users

- **Curious learners (lay audience)** — mostly on phones, picking `Udskoling` or `Gymnasium`. Expect calm, readable prose. Want to listen to the podcast while commuting.
- **Students** — `Gymnasium` or `Universitet` readers who want more structure, light math, and a clear progression.
- **Advanced readers** — `Kandidat` users who expect formal notation (KaTeX), precise language, and references.
- **The author** — authors content in Markdown, expects build-time validation so broken topics cannot ship.

## Information architecture

### Site map

```
/                                  Landing — level picker + brief intro
/<level>/                          Level home — curriculum overview for the chosen level
/<level>/<topic>/                  Topic page — lesson content at that depth
/om/                               About the project and author
```

### URLs at MVP

- Levels: `/udskoling/`, `/gymnasium/`, `/universitet/`, `/kandidat/`
- Topics: `superposition`, `maaling`, `sammenfiltring` (ASCII slugs; `å→aa`, `ø→oe`)
- Concrete MVP pages: 4 level-home pages + 12 topic pages + `/` + `/om` = **18 static pages**

### URL behaviour

- First visit to `/` shows the level picker. The choice is saved in `localStorage` under `qp.level`.
- Return visits to `/` redirect automatically to `/<saved-level>/`, with a visible "Skift niveau" link.
- Direct visit to `/<level>/<topic>/` always renders that level; URL wins over `localStorage`.
- A persistent level switcher in the header swaps the depth on the current topic (e.g., `/gymnasium/superposition/` → clicking `Universitet` navigates to `/universitet/superposition/`).

### i18n readiness

- Astro i18n configured with `defaultLocale: 'da'`, `prefixDefaultLocale: false`, `locales: ['da']`.
- Adding English later becomes: set `locales: ['da', 'en']`, author `en` content files, ship `/en/...` routes. No refactor of the Danish routes required.
- UI chrome strings live in `src/i18n/da.json`, keyed for future locales.

## Content model

### Collection shape

```
src/content/
  topics/
    superposition/
      index.yaml                ← Topic metadata
      da/
        udskoling.md
        gymnasium.md
        universitet.md
        kandidat.md
    maaling/
      index.yaml
      da/ …
    sammenfiltring/
      index.yaml
      da/ …
```

### `index.yaml` schema (Zod-validated)

```yaml
title: Superposition              # Display title (localised later; Danish default)
slug: superposition               # URL slug
order: 1                          # Curriculum order (unique across topics)
summary: "…"                      # One-sentence teaser
spotifyEpisodeId: "4rOoJ..."      # Optional. Omit if episode not released yet.
illustration: "./hero.png"        # Optional hero image (co-located)
```

### Per-level Markdown frontmatter

```yaml
readingTimeMinutes: 7             # Optional; computed if absent
```

### Build-time contract

- Every topic directory must contain `index.yaml`.
- Every topic must have all 4 level `.md` files for every configured locale.
- `order` must be unique across the topics collection.
- `spotifyEpisodeId`, when present, must match a Spotify ID pattern.
- Any violation fails the build.

### Podcast-optional behaviour

- When `spotifyEpisodeId` is set → topic page renders the Spotify embed.
- When it is omitted → topic page renders a placeholder: "🎙 Podcast-episoden kommer snart — [følg showet på Spotify]". This lets topic text ship before the monthly podcast release.

## Page templates

### Landing (`/`)

- Hero: site title, one-line pitch ("Kvantefysik for alle. Vælg dit niveau. Skift når som helst."), no gradient backgrounds.
- 4-card level picker (Udskoling / Gymnasium / Universitet / Kandidat), each with a short depth descriptor.
- Footer links: `Om`, `Podcast`.
- Mobile: single-column card stack.

### Level home (`/<level>/`)

- Header: site chrome + level switcher.
- Page heading: "<Level>-sporet" (e.g., "Gymnasie-sporet").
- Numbered list of topics in curriculum order; each row shows title, one-line summary, reading time, and 🎙 marker (or "kommer snart").
- Mobile: compact stacked cards; numbers inline with metadata.

### Topic page (`/<level>/<topic>/`)

- Header with persistent level switcher.
- Desktop: left sidebar showing the level's 3-topic curriculum (current topic highlighted); main column with title, "Emne X af Y" eyebrow, prose, optional animated diagrams, podcast embed box, prev/next navigation at the bottom.
- Mobile: sidebar collapses to a hamburger; the curriculum appears as a "Sporet" footer strip below prev/next.
- Podcast embed sits at the bottom of the prose, in an outlined box with the label "🎙 Gå i dybden — podcast".

### About (`/om/`)

- Short bio of the author, project motivation, link to the podcast show.

## Visual direction

**Editorial.** Serif headings (Charter, Georgia fallback), warm off-white background (`#faf8f4` or similar), generous line-height (1.6), calm typography-driven layout. One restrained accent color for links and the level-highlight state. **Gradients are avoided** except where a single hero illustration genuinely needs one. Prose is the centerpiece.

## Technology stack

- **Framework:** Astro v5.x, static output.
- **Content:** Astro Content Collections + Zod schemas.
- **Styling:** Plain CSS with CSS variables (no Tailwind). Self-hosted serif webfont via `@fontsource/charter` (or close equivalent).
- **i18n:** Astro built-in (`defaultLocale: 'da'`, `prefixDefaultLocale: false`).
- **Math rendering:** `remark-math` + `rehype-katex` for Universitet and Kandidat levels.
- **Animations:** CSS keyframes and native view-transitions only. No animation libraries at MVP.
- **Podcast:** Spotify `<iframe>` embed, wrapped in a `<PodcastEmbed episodeId="…" />` component, `loading="lazy"`.
- **Images:** Astro `<Image>` (WebP/AVIF).
- **Client JS budget:** under 5 KB gzipped, limited to:
  - `level-memory` — read/write `qp.level` in localStorage; redirect `/` to `/<level>/` when a preference exists.
  - `level-switcher` — wire the header dropdown to navigate to the same topic at a different level.

### Repo layout

```
/src
  /content/topics/…          ← author content
  /components/               ← LevelPicker, LevelSwitcher, TopicCard, PodcastEmbed, CurriculumSidebar
  /layouts/                  ← BaseLayout, LevelLayout, TopicLayout
  /pages/                    ← index.astro, [level]/index.astro, [level]/[topic].astro, om.astro
  /i18n/da.json              ← UI strings
  /styles/                   ← global.css, typography.css
  /assets/                   ← fonts, shared icons
/public/                     ← favicon, static files
/astro.config.mjs
/package.json
```

### Hosting and deploy

- **Cloudflare Pages** (preferred) or **Vercel** free tier.
- Auto-deploy from `main` branch push.
- Free TLS, EU edge presence for Danish users.

## Quality, testing, and performance

### Build-time

- Zod validates every `index.yaml`.
- Build fails if any required `.md` is missing or if link integrity checks find broken internal links.

### Automated tests (Playwright)

Smoke tests running on every PR:

- Landing page loads; all 4 level cards are clickable.
- Each level home renders 3 topic rows.
- Each topic page renders: title, prose, prev/next, and either podcast embed or "kommer snart".
- Level switcher on a topic navigates to the same topic at the new level.
- Mobile viewport (375×667) renders without horizontal overflow; hamburger opens the sidebar.

### Lighthouse CI

Budgets on every PR:
- Performance ≥ 90
- Accessibility ≥ 95
- SEO ≥ 95

### Manual QA (content author checklist per topic)

- All 4 level `.md` files present and render correctly.
- Podcast embed plays (if `spotifyEpisodeId` set) or "kommer snart" shows.
- Prev/next links work in both directions.
- Math formulas render for Universitet and Kandidat.
- Reads well on a phone.

## Launch plan

1. **Phase 0 (~1 week):** Scaffold Astro project, base layout, typography, Editorial theme, CI, deploy to Cloudflare Pages with a placeholder landing page.
2. **Phase 1 (~1–2 weeks):** Build LevelPicker, LevelSwitcher, level-home template, topic-page template, PodcastEmbed, localStorage level memory, mobile layouts. Use one real topic (Superposition × 4 levels) as working content.
3. **Phase 2 (author-pace):** Author topics 2 and 3 in Markdown. Podcasts drop in as episodes release (~one per month).
4. **Phase 3:** Public launch.

## Out of scope (explicitly deferred)

- Search, comments, newsletter, community features.
- English or any other locale at content level (architecture ready).
- Interactive JS simulations.
- User accounts, progress tracking, login.
- A CMS (content stays as Markdown in-repo).
- Aggregated `/podcast/` episode listing (deferred; individual episodes are embedded on topic pages).

## Open questions for review

- Danish level names — currently **Udskoling, Gymnasium, Universitet, Kandidat**. Author may prefer `Folkeskole` or `Kandidat/Ph.d.`; please confirm.
- Topic slugs — defaulted to ASCII-safe (`maaling` for "måling"). Author may prefer native Danish characters in URLs; please confirm.
