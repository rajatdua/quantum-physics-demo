# Quantum Physics Magazine — Design Spec

- **Date:** 2026-04-16
- **Author:** Rajat Dua (rajat.dua@formalize.com)
- **Status:** Draft — awaiting review
- **Supersedes:** [`2026-04-16-quantum-physics-site-design.md`](./2026-04-16-quantum-physics-site-design.md)

## Purpose

Build a Danish-language **monthly digital magazine** that makes quantum physics accessible to a wide audience. Each issue is one topic — matched to a monthly podcast episode the author releases — explained at four depths (Udskoling, Gymnasium, Universitet, Kandidat). Readers pick their depth, read the issue, and follow the podcast for more.

## Why a magazine (not a curriculum)

The author publishes one podcast episode per month. Framing the site as a magazine matches that rhythm honestly, frees readers from false "progression" between unrelated topics, and makes it trivial to backfill older podcast episodes as additional archive issues without migrations or ordering conflicts.

## Goals

- One issue per month; each issue = one topic at four depths.
- Each issue ties to one podcast episode (optional — text can ship before the episode).
- Issues are date-addressed, so backfilling older podcasts is a pure additive operation.
- Magazine chrome — issue numbers, typographic covers, optional illustration, palettes.
- Level choice is sticky per-reader via localStorage.
- Static site, fast, mobile-responsive, minimal JavaScript.
- Content authored in Markdown; committed to the repo.
- Danish at launch, architecture ready for additional locales later.
- Test-driven implementation (TDD) for logic, schema validation, and page behaviors.

## Non-goals (MVP)

- Accounts, progress tracking, comments.
- Search, newsletter sign-up, RSS (deferred — all easy later adds).
- Interactive JS simulations (occasional animated diagrams in Markdown are fine).
- Multiple locales shipping content at launch (architecture ready; only `da` ships).
- A CMS — content stays as Markdown in the repo.
- AI-generated cover illustrations. The author will not use AI imagery.

## Users

- **Curious learners (lay audience)** — mostly on phones; `Udskoling` or `Gymnasium`. Want calm, readable prose and a podcast to listen to on a walk.
- **Students** — `Gymnasium` / `Universitet`. Want more structure and light math.
- **Advanced readers** — `Kandidat`. Expect formal notation (KaTeX), precise language, references.
- **The author** — authors issues in Markdown, wants build-time validation so broken issues can't ship, and wants an ergonomic pattern for backfilling older podcasts.

## Information architecture

### Site map

```
/                              Latest issue cover (auto-resolved by release date)
/YYYY/MM/                      Issue cover (canonical URL, e.g., /2026/04/)
/YYYY/MM/<level>/              Issue read at chosen depth (e.g., /2026/04/gymnasium/)
/arkiv/                        Archive — newsstand grid of all issues
/om/                           About the magazine and author
```

### Level slugs

`udskoling`, `gymnasium`, `universitet`, `kandidat` (ASCII; lowercase).

### URL behaviour

- `/` statically renders the most recent issue whose `releaseDate <= build-day`. (The scheduled rebuild — see "Tech architecture" — ensures the home reflects the right issue without a manual push.)
- `/YYYY/MM/` is the canonical cover URL for that issue.
- Clicking "Læs videre" on the cover navigates to `/YYYY/MM/<stored-level>/`, falling back to `gymnasium` for first-time visitors.
- A persistent level switcher in the header navigates to the same issue at a new level and updates `localStorage`.
- Direct visits to `/YYYY/MM/<level>/` always render that depth; URL wins over `localStorage`.
- `/arkiv/` lists all issues — published ones link to their covers, future-dated ones render as grayed-out "Kommer snart" cards.

### Issue numbering

Display-only labels (`#1`, `#2`, …). Computed at build time by sorting all issues (including backfilled ones) ascending by `releaseDate` and assigning a number by position. Not part of URLs, so numbering shifts on backfill but never breaks a link.

### i18n readiness

Astro i18n configured with `defaultLocale: 'da'`, `prefixDefaultLocale: false`, `locales: ['da']`. Adding English later: add `'en'` to `locales`, author `en` content files, ship `/en/YYYY/MM/…` routes. No refactor of the Danish routes required. UI strings live in `src/i18n/da.json`.

## Content model

### Collection shape

```
src/content/
  issues/
    2026-04/
      index.yaml
      cover.jpg                  ← optional illustration
      da/
        udskoling.md
        gymnasium.md
        universitet.md
        kandidat.md
    2025-11/                     ← backfilled — just drop the folder in
      index.yaml
      da/
        udskoling.md
        gymnasium.md
        universitet.md
        kandidat.md
```

### `index.yaml` schema (Zod-validated)

```yaml
topic: "Superposition"              # Display title
releaseDate: "2026-04-15"           # ISO date — drives sort order and labels
summary: "Hvad betyder det at være to steder på én gang?"
spotifyEpisodeId: "4rOoJ..."        # Optional
cover:                              # Optional — if absent, typographic cover is rendered
  image: "./cover.jpg"
  alt: "Stjerner i en superposition"
  credit: "Anna Hansen"             # Optional
palette: "warm"                     # Enum: warm | cool | mono | ink. Default: warm.
nextIssue:                          # Optional — shown only on the current/latest issue cover
  releaseDate: "2026-05-15"
```

### Per-level Markdown frontmatter

```yaml
readingTimeMinutes: 7                # Optional; computed if absent
```

### Build-time contract (fails the build)

- Every issue folder must have `index.yaml`.
- Folder name must match `YYYY-MM` and align with the year/month of `releaseDate`.
- Every issue must have all 4 level `.md` files for every configured locale.
- `releaseDate` must be a valid ISO date; unique across issues.
- `spotifyEpisodeId`, if present, must match the Spotify ID pattern (22 alphanumeric chars).
- `cover.image`, if present, must resolve to an existing file.
- `palette`, if present, must be one of the enum values.

### Podcast-optional behaviour

- When `spotifyEpisodeId` is set → the embed renders (on the cover teaser and in the reading page).
- When omitted → both spots render "Podcast-episoden kommer snart — [følg showet på Spotify]".

## Page templates

### Home cover (`/`)

Statically renders the latest published issue's cover.

- Header: brand, level switcher, Arkiv, Om
- Monospace eyebrow: `UDGAVE #1 · APRIL 2026`
- Large serif topic title
- One-line summary
- Two primary buttons: **Læs videre →** (to `/YYYY/MM/<level>/`) and **Lyt til podcasten** (to Spotify)
- Footer row: podcast duration, reading time, right-aligned `NY UDGAVE D. DD. MMM YYYY` teaser when `nextIssue.releaseDate` is set
- If the issue has a `cover.image`: split 2/3 typography, 1/3 illustration panel on desktop; stacked on mobile
- If no illustration: full-width typographic layout

### Issue cover (`/YYYY/MM/`)

Same component as the home cover, but always for that issue regardless of whether it is currently the latest.

### Reading page (`/YYYY/MM/<level>/`)

- Header (shared)
- Letterboxed reading column (max ~560px) centred
- Monospace eyebrow: `UDGAVE #1 · APRIL 2026 · GYMNASIUM`
- Serif topic title
- Body prose rendered from the level's Markdown file
- First paragraph receives a **drop cap** (serif, slightly oversized)
- KaTeX math rendered for Universitet and Kandidat levels
- Podcast block (either Spotify embed or "kommer snart")
- Prev / Next **issue** navigation at the bottom (previous and next released issues by release date, not prev/next levels)

### Archive (`/arkiv/`)

- Header (shared)
- Heading "Arkiv"
- Grid of issue cards (desktop: 3 cols; mobile: list)
- Published issues: issue number, month, topic, duration/reading-time. Click → `/YYYY/MM/`
- Future-dated issues: grayed-out card labelled "Kommer snart"

### About (`/om/`)

Short Danish copy about the magazine, the author, and the podcast. Authored by the user post-scaffolding.

## Visual direction

**Editorial typography.** Serif body (Charter, Georgia fallback), warm off-white reading background (`#faf8f4`), generous line-height (1.6). **No gradients.**

**Cover palettes** (per-issue via `palette` field):
- `warm` (default) — cream background, ink text, terracotta accent
- `cool` — muted paper-blue background, ink text, deep teal accent
- `mono` — black background, cream text
- `ink` — deep navy background, cream text, warm-gold accent

Reading pages stay on the consistent warm/cream Editorial theme regardless of cover palette for readability. Covers only use the palette.

Palettes are defined as CSS blocks (`.palette-warm { --cover-bg: …; --cover-text: …; --cover-accent: … }`) in `src/styles/palettes.css`. Adding a new palette = one new CSS block + one line in the Zod enum.

## Technology stack

- **Framework:** Astro v5.x, static output
- **Content:** Astro Content Collections + Zod schemas
- **Styling:** Plain CSS with CSS variables (no Tailwind). Self-hosted Charter via `@fontsource/charter`
- **i18n:** Astro built-in (`defaultLocale: 'da'`, `prefixDefaultLocale: false`)
- **Math:** `remark-math` + `rehype-katex`
- **Images:** Astro `<Image>` for cover illustrations when present (WebP/AVIF, responsive)
- **Animations:** CSS keyframes only, no library
- **Podcast:** Spotify `<iframe>` in a reusable `<PodcastEmbed episodeId="…" />`
- **Client JS budget:** under 5 KB gzipped — `level-memory` + `level-switcher`

### Repo layout

```
/src
  /content/issues/<YYYY-MM>/…
  /components/                  ← IssueCover, TypographicCover, IllustratedCover, LevelSwitcher, PodcastEmbed, ArchiveCard, IssueNav, SiteHeader
  /layouts/                     ← BaseLayout
  /pages/
    index.astro                 ← latest issue cover
    [year]/[month]/index.astro  ← issue cover
    [year]/[month]/[level]/index.astro ← reading page
    arkiv.astro                 ← archive
    om.astro                    ← about
  /lib/                         ← issues.ts (loader helpers + numbering), validate-issues.ts (+ tests)
  /i18n/da.json                 ← UI strings
  /styles/                      ← global.css, typography.css, palettes.css, cover.css, reading.css, archive.css, header.css
  /scripts/                     ← level-memory.ts, level-switcher.ts
  /assets/fonts/                ← self-hosted Charter
/public/                        ← favicon, static files
/tests/e2e/                     ← Playwright tests
/.github/workflows/             ← CI (build/test/LHCI) + scheduled rebuild
/astro.config.mjs
/package.json
```

### Build and deploy

- **Cloudflare Pages** (preferred) auto-deploys on push to `main`.
- **Scheduled GitHub Action** runs daily at 07:00 Europe/Copenhagen (`cron: "0 5 * * *"` UTC) and triggers a Pages deploy hook. This way a future-dated issue "goes live" on its release date without a manual push.
- **Manual rebuild** remains available (any push to `main`).

## Implementation discipline — TDD

Per the author's preference:

- **Unit logic** (date parsing, issue-numbering, validators): write a failing Vitest unit test first. Red → Green → Refactor.
- **Page behaviors** (latest-issue resolution, level switcher nav, localStorage redirect, archive rendering published vs. future, mobile hamburger): write a failing Playwright test first against a preview build, then implement the page.
- **Static content pages** without logic (About): skip the TDD ceremony; verify with `astro check` + a smoke test.
- Every test step must include running the test and observing failure before implementation.

## Quality, testing, performance

### Build-time
- Zod validates every `index.yaml`.
- Folder-name-vs-releaseDate check.
- Required-level-files check.
- Link integrity check on internal anchors.

### Automated tests (Playwright; desktop + mobile projects)
- `/` renders the latest published issue cover; does NOT render a future-dated issue.
- `/2026/04/` renders the cover with correct issue number.
- `/2026/04/gymnasium/` renders the reading page with drop cap, podcast slot, prev/next issue nav.
- Level switcher navigates to same issue at new level.
- `/arkiv/` renders published + future-dated cards appropriately.
- Mobile viewport: no horizontal overflow, hamburger opens.
- Cover palette class applies correctly per issue.
- Illustration cover renders when `cover.image` is provided; typographic cover renders otherwise.

### Lighthouse CI
- Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 (on `/`, a cover, a reading page).

### Manual QA (per new issue)
- All 4 level `.md` files present and render
- Palette or illustration renders as intended
- Podcast embed plays (if `spotifyEpisodeId` set) or "kommer snart" shows
- Prev/next issue links work
- Math renders for Universitet and Kandidat
- Reads well on a phone

## Launch plan

1. **Phase 0 (~1 week):** Astro scaffold (reuse the Task 1 files already created), i18n, content schema for `issues`, validators with unit tests, CI.
2. **Phase 1 (~1–2 weeks):** Typography, palettes, BaseLayout, SiteHeader, PodcastEmbed, TypographicCover, IllustratedCover, IssueCover wrapper, reading template (with drop cap), archive template, about page placeholder, issue-numbering helper, level-memory / level-switcher, mobile styles, scheduled rebuild action.
3. **Phase 2 (author):** Write issue #1 (Superposition × 4 levels), pick a palette, optionally provide a cover illustration.
4. **Phase 3:** Deploy to Cloudflare Pages; hook up scheduled rebuild.
5. **Launch.** Monthly cadence: drop a new `YYYY-MM/` folder, commit, push. Backfill older podcasts by dropping `YYYY-MM/` folders with past dates — the archive and numbering handle it automatically.

## Out of scope (explicitly deferred)

- Search, comments, newsletter, community.
- English or any other locale at content level.
- Interactive JS simulations.
- User accounts, progress tracking.
- A CMS.
- AI-generated cover illustrations.
- Aggregated `/podcast/` episode page (episodes are already embedded on issue pages; a separate list is low value at MVP).

## Open questions for review

- Danish level names remain **Udskoling, Gymnasium, Universitet, Kandidat**. Flag if alternatives (e.g., Folkeskole, Ph.d.) are preferred.
- Whether the "Lyt til podcasten" button on the cover should link to Spotify directly or scroll down to the embedded podcast block on the reading page. Current spec: link out to Spotify for one-tap listening on mobile.
- Scheduled rebuild time defaults to **07:00 Europe/Copenhagen (05:00 UTC)**. Adjust if another hour is preferable for how you typically publish.
