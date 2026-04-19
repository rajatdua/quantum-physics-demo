# Quantum Physics Magazine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Danish-language monthly digital magazine on Astro. Each issue is one topic matched to a podcast episode, explained at four depths (Udskoling, Gymnasium, Universitet, Kandidat). Date-addressed issues, typographic covers with optional illustration, 4 palettes, letterboxed reading, mobile-responsive, i18n-ready.

**Architecture:** Static Astro v5 site. `issues` content collection with one folder per issue (`YYYY-MM`) holding `index.yaml` + per-level Markdown. URLs are date-based (`/YYYY/MM/`, `/YYYY/MM/<level>/`). Home renders the latest published issue cover; archive lists all. Issue numbering is display-only, auto-computed from chronological order. Scheduled GitHub Action triggers daily rebuilds so future-dated issues go live on release day without a manual push.

**Tech Stack:** Astro v5, TypeScript, Zod (schema), Vitest (unit), Playwright (e2e), remark-math + rehype-katex (math), @fontsource/source-serif-4 (fonts), Lighthouse CI, GitHub Actions, Cloudflare Pages.

**Reference spec:** `docs/superpowers/specs/2026-04-16-quantum-physics-magazine-design.md`

**TDD discipline:** Per spec, logic and page behaviors are test-first. Each task's "Write failing test" and "Run test to see it fails" steps MUST be followed literally — don't skip the fail observation.

## Commit strategy note

The author's environment (signed commits via 1Password SSH agent) blocks per-task commits in the sandbox during this run. Per-task commit steps in this plan are **documented for reference and for out-of-sandbox execution**. If you are running in the sandbox, skip the `git add`/`git commit` steps in each task — commits will be batched into a single final commit by the author.

## Pre-existing state

- `package.json`, `tsconfig.json`, `astro.config.mjs`, `src/env.d.ts` were scaffolded earlier and remain. Task 1 adjusts them.
- `.gitignore` already includes `.superpowers/`, `node_modules/`, `dist/`, `.astro/`, editor/OS files.
- `docs/superpowers/specs/2026-04-16-quantum-physics-magazine-design.md` is the authoritative spec.
- The prior `docs/superpowers/specs/2026-04-16-quantum-physics-site-design.md` is historical (superseded).
- No `npm install` has run yet. Dependencies are listed in `package.json` but not installed.

---

## Phase 0 — Scaffolding adjustments

### Task 1: Update package.json dependencies and install

**Files:**
- Modify: `package.json`
- Create: `package-lock.json` (via npm install)

- [ ] **Step 1: Verify current package.json**

Read `/package.json`. Confirm it contains `astro`, `@fontsource/source-serif-4`, `@astrojs/check`, `@playwright/test`, `@lhci/cli`, `typescript` — if any are missing, add them.

- [ ] **Step 2: Add magazine-specific dependencies**

Edit `package.json` `dependencies` to include Markdown math + plugin infrastructure:

```json
"dependencies": {
  "astro": "^5.0.0",
  "@fontsource/source-serif-4": "^5.1.0",
  "remark-math": "^6.0.0",
  "rehype-katex": "^7.0.0",
  "katex": "^0.16.11"
}
```

Add `vitest` to `devDependencies`:

```json
"devDependencies": {
  "@astrojs/check": "^0.9.0",
  "@playwright/test": "^1.48.0",
  "@lhci/cli": "^0.14.0",
  "typescript": "^5.6.0",
  "vitest": "^2.1.0"
}
```

Add scripts:

```json
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test:unit": "vitest run",
  "test:unit:watch": "vitest",
  "test:e2e": "playwright test",
  "test:lhci": "lhci autorun"
}
```

- [ ] **Step 3: Install**

Run: `npm install`
Expected: exit 0; `node_modules/` populated; `package-lock.json` created.

- [ ] **Step 4: Verify Astro CLI**

Run: `npx astro --version`
Expected: prints `5.x.x`.

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add package.json package-lock.json
git commit -m "chore: pin magazine dependencies (math, vitest)"
```

---

### Task 2: Update astro.config.mjs for Markdown math

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Replace `astro.config.mjs` with:**

```javascript
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://example.com',
  i18n: {
    defaultLocale: 'da',
    locales: ['da'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  build: {
    format: 'directory'
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
});
```

- [ ] **Step 2: Verify**

Run: `npx astro check`
Expected: 0 errors (may report no content collections yet — that's fine).

- [ ] **Step 3: Commit** (skip in sandbox)

```bash
git add astro.config.mjs
git commit -m "feat(config): enable remark-math + rehype-katex"
```

---

### Task 3: Install Vitest and add config

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node'
  }
});
```

- [ ] **Step 2: Create `tests/unit/` directory with placeholder**

Create `tests/unit/.gitkeep`:

```
```
(empty file)

- [ ] **Step 3: Run the unit test runner**

Run: `npm run test:unit`
Expected: exits 0 (no tests yet, that's the expected state).

- [ ] **Step 4: Commit** (skip in sandbox)

```bash
git add vitest.config.ts tests/
git commit -m "chore(test): configure Vitest for unit tests"
```

---

## Phase 1 — TDD core: validators and issue helpers

### Task 4: validate-issues — folder name vs releaseDate

**Files:**
- Create: `src/lib/validate-issues.ts`
- Create: `tests/unit/validate-issues.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/validate-issues.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { assertFolderMatchesReleaseDate } from '../../src/lib/validate-issues';

describe('assertFolderMatchesReleaseDate', () => {
  it('passes when folder name matches year/month of releaseDate', () => {
    expect(() => assertFolderMatchesReleaseDate('2026-04', '2026-04-15')).not.toThrow();
  });

  it('passes at month boundary (first day)', () => {
    expect(() => assertFolderMatchesReleaseDate('2026-04', '2026-04-01')).not.toThrow();
  });

  it('passes at month boundary (last day)', () => {
    expect(() => assertFolderMatchesReleaseDate('2026-04', '2026-04-30')).not.toThrow();
  });

  it('throws when year differs', () => {
    expect(() =>
      assertFolderMatchesReleaseDate('2026-04', '2025-04-15')
    ).toThrow(/2026-04.*2025-04/);
  });

  it('throws when month differs', () => {
    expect(() =>
      assertFolderMatchesReleaseDate('2026-04', '2026-05-15')
    ).toThrow(/2026-04.*2026-05/);
  });

  it('throws on malformed folder name', () => {
    expect(() =>
      assertFolderMatchesReleaseDate('april-2026', '2026-04-15')
    ).toThrow(/YYYY-MM/);
  });

  it('throws on malformed releaseDate', () => {
    expect(() =>
      assertFolderMatchesReleaseDate('2026-04', '2026/04/15')
    ).toThrow(/ISO/);
  });
});
```

- [ ] **Step 2: Run the test — expect failure**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module '../../src/lib/validate-issues'`.

- [ ] **Step 3: Implement `src/lib/validate-issues.ts` with just this function**

```typescript
const FOLDER_RE = /^(\d{4})-(\d{2})$/;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function assertFolderMatchesReleaseDate(folder: string, releaseDate: string): void {
  const folderMatch = FOLDER_RE.exec(folder);
  if (!folderMatch) {
    throw new Error(`Issue folder must be YYYY-MM, got "${folder}"`);
  }
  const isoMatch = ISO_RE.exec(releaseDate);
  if (!isoMatch) {
    throw new Error(`releaseDate must be ISO YYYY-MM-DD, got "${releaseDate}"`);
  }
  const [, fy, fm] = folderMatch;
  const [, iy, im] = isoMatch;
  if (fy !== iy || fm !== im) {
    throw new Error(
      `Issue folder "${folder}" does not match releaseDate year/month (${iy}-${im})`
    );
  }
}
```

- [ ] **Step 4: Run the test — expect pass**

Run: `npm run test:unit`
Expected: PASS — 7 tests pass.

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add src/lib/validate-issues.ts tests/unit/validate-issues.test.ts
git commit -m "feat(validate): assert folder name matches releaseDate"
```

---

### Task 5: validate-issues — required level files

**Files:**
- Modify: `src/lib/validate-issues.ts`
- Modify: `tests/unit/validate-issues.test.ts`

- [ ] **Step 1: Add failing tests to `tests/unit/validate-issues.test.ts`**

Append:

```typescript
import { assertAllLevelFilesPresent } from '../../src/lib/validate-issues';

describe('assertAllLevelFilesPresent', () => {
  it('passes when all 4 level files exist', () => {
    const files = new Set([
      'issues/2026-04/da/udskoling.md',
      'issues/2026-04/da/gymnasium.md',
      'issues/2026-04/da/universitet.md',
      'issues/2026-04/da/kandidat.md'
    ]);
    expect(() => assertAllLevelFilesPresent('2026-04', 'da', files)).not.toThrow();
  });

  it('throws when one level file is missing (names the missing level)', () => {
    const files = new Set([
      'issues/2026-04/da/udskoling.md',
      'issues/2026-04/da/gymnasium.md',
      'issues/2026-04/da/universitet.md'
    ]);
    expect(() =>
      assertAllLevelFilesPresent('2026-04', 'da', files)
    ).toThrow(/kandidat/);
  });

  it('throws with all missing levels listed', () => {
    const files = new Set(['issues/2026-04/da/udskoling.md']);
    try {
      assertAllLevelFilesPresent('2026-04', 'da', files);
      throw new Error('should have thrown');
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      expect(e.message).toContain('gymnasium');
      expect(e.message).toContain('universitet');
      expect(e.message).toContain('kandidat');
    }
  });
});
```

- [ ] **Step 2: Run the test — expect failure**

Run: `npm run test:unit`
Expected: FAIL — `assertAllLevelFilesPresent is not a function` (or import error).

- [ ] **Step 3: Implement the function**

Append to `src/lib/validate-issues.ts`:

```typescript
export const levelSlugs = ['udskoling', 'gymnasium', 'universitet', 'kandidat'] as const;
export type Level = typeof levelSlugs[number];

export function assertAllLevelFilesPresent(
  folder: string,
  locale: string,
  files: Set<string>
): void {
  const missing: Level[] = [];
  for (const level of levelSlugs) {
    const expected = `issues/${folder}/${locale}/${level}.md`;
    if (!files.has(expected)) missing.push(level);
  }
  if (missing.length > 0) {
    throw new Error(
      `Issue "${folder}" (${locale}) is missing level files: ${missing.join(', ')}`
    );
  }
}
```

- [ ] **Step 4: Run the test — expect pass**

Run: `npm run test:unit`
Expected: PASS — all tests pass.

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add src/lib/validate-issues.ts tests/unit/validate-issues.test.ts
git commit -m "feat(validate): assert all 4 level files present per issue"
```

---

### Task 6: validate-issues — unique release dates

**Files:**
- Modify: `src/lib/validate-issues.ts`
- Modify: `tests/unit/validate-issues.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/unit/validate-issues.test.ts`:

```typescript
import { assertUniqueReleaseDates } from '../../src/lib/validate-issues';

describe('assertUniqueReleaseDates', () => {
  it('passes when all dates are unique', () => {
    expect(() =>
      assertUniqueReleaseDates([
        { folder: '2026-04', releaseDate: '2026-04-15' },
        { folder: '2026-05', releaseDate: '2026-05-15' }
      ])
    ).not.toThrow();
  });

  it('throws when two issues share a releaseDate', () => {
    expect(() =>
      assertUniqueReleaseDates([
        { folder: '2026-04', releaseDate: '2026-04-15' },
        { folder: '2026-04-backup', releaseDate: '2026-04-15' }
      ])
    ).toThrow(/2026-04-15.*2026-04.*2026-04-backup/);
  });
});
```

- [ ] **Step 2: Run the test — expect failure**

Run: `npm run test:unit`
Expected: FAIL — import error.

- [ ] **Step 3: Implement the function**

Append to `src/lib/validate-issues.ts`:

```typescript
export function assertUniqueReleaseDates(
  issues: Array<{ folder: string; releaseDate: string }>
): void {
  const byDate = new Map<string, string[]>();
  for (const issue of issues) {
    const folders = byDate.get(issue.releaseDate) ?? [];
    folders.push(issue.folder);
    byDate.set(issue.releaseDate, folders);
  }
  for (const [date, folders] of byDate) {
    if (folders.length > 1) {
      throw new Error(
        `Duplicate releaseDate ${date} on issues: ${folders.join(', ')}`
      );
    }
  }
}
```

- [ ] **Step 4: Run the test — expect pass**

Run: `npm run test:unit`
Expected: PASS — all tests pass.

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add src/lib/validate-issues.ts tests/unit/validate-issues.test.ts
git commit -m "feat(validate): enforce unique releaseDates across issues"
```

---

### Task 7: Issue numbering helper (TDD)

**Files:**
- Create: `src/lib/issue-numbering.ts`
- Create: `tests/unit/issue-numbering.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/issue-numbering.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { computeIssueNumbers } from '../../src/lib/issue-numbering';

describe('computeIssueNumbers', () => {
  it('assigns #1 to the earliest issue, #2 to the next, etc.', () => {
    const numbered = computeIssueNumbers([
      { folder: '2026-05', releaseDate: '2026-05-15' },
      { folder: '2026-04', releaseDate: '2026-04-15' },
      { folder: '2026-06', releaseDate: '2026-06-15' }
    ]);
    expect(numbered).toEqual([
      { folder: '2026-04', releaseDate: '2026-04-15', number: 1 },
      { folder: '2026-05', releaseDate: '2026-05-15', number: 2 },
      { folder: '2026-06', releaseDate: '2026-06-15', number: 3 }
    ]);
  });

  it('is stable — input order does not affect output assignment', () => {
    const a = computeIssueNumbers([
      { folder: '2026-04', releaseDate: '2026-04-15' },
      { folder: '2026-05', releaseDate: '2026-05-15' }
    ]);
    const b = computeIssueNumbers([
      { folder: '2026-05', releaseDate: '2026-05-15' },
      { folder: '2026-04', releaseDate: '2026-04-15' }
    ]);
    expect(a).toEqual(b);
  });

  it('backfilling an older issue renumbers downstream (documented behavior)', () => {
    const before = computeIssueNumbers([
      { folder: '2026-04', releaseDate: '2026-04-15' }
    ]);
    expect(before[0].number).toBe(1);

    const after = computeIssueNumbers([
      { folder: '2026-04', releaseDate: '2026-04-15' },
      { folder: '2025-11', releaseDate: '2025-11-15' }
    ]);
    expect(after.find((i) => i.folder === '2025-11')?.number).toBe(1);
    expect(after.find((i) => i.folder === '2026-04')?.number).toBe(2);
  });

  it('handles empty input', () => {
    expect(computeIssueNumbers([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test — expect failure**

Run: `npm run test:unit`
Expected: FAIL — import error.

- [ ] **Step 3: Implement `src/lib/issue-numbering.ts`**

```typescript
export interface IssueRef {
  folder: string;
  releaseDate: string; // ISO YYYY-MM-DD
}

export interface NumberedIssue extends IssueRef {
  number: number;
}

export function computeIssueNumbers<T extends IssueRef>(
  issues: T[]
): Array<T & { number: number }> {
  return [...issues]
    .sort((a, b) => (a.releaseDate < b.releaseDate ? -1 : a.releaseDate > b.releaseDate ? 1 : 0))
    .map((issue, i) => ({ ...issue, number: i + 1 }));
}
```

- [ ] **Step 4: Run the test — expect pass**

Run: `npm run test:unit`
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add src/lib/issue-numbering.ts tests/unit/issue-numbering.test.ts
git commit -m "feat(lib): compute issue numbers from chronological order"
```

---

### Task 8: Latest-published-issue resolver (TDD)

**Files:**
- Create: `src/lib/latest-issue.ts`
- Create: `tests/unit/latest-issue.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/latest-issue.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { resolveLatestPublished } from '../../src/lib/latest-issue';

const issues = [
  { folder: '2026-04', releaseDate: '2026-04-15' },
  { folder: '2026-05', releaseDate: '2026-05-15' },
  { folder: '2026-06', releaseDate: '2026-06-15' }
];

describe('resolveLatestPublished', () => {
  it('returns the most recent issue at or before today', () => {
    const result = resolveLatestPublished(issues, new Date('2026-05-20'));
    expect(result?.folder).toBe('2026-05');
  });

  it('returns the issue whose releaseDate equals today', () => {
    const result = resolveLatestPublished(issues, new Date('2026-05-15'));
    expect(result?.folder).toBe('2026-05');
  });

  it('skips future-dated issues', () => {
    const result = resolveLatestPublished(issues, new Date('2026-04-20'));
    expect(result?.folder).toBe('2026-04');
  });

  it('returns undefined when no issues are yet published', () => {
    const result = resolveLatestPublished(issues, new Date('2026-03-01'));
    expect(result).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    const result = resolveLatestPublished([], new Date('2026-05-01'));
    expect(result).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npm run test:unit`
Expected: FAIL — import error.

- [ ] **Step 3: Implement `src/lib/latest-issue.ts`**

```typescript
import type { IssueRef } from './issue-numbering';

export function resolveLatestPublished<T extends IssueRef>(
  issues: T[],
  today: Date
): T | undefined {
  const todayIso = today.toISOString().slice(0, 10);
  const published = issues.filter((i) => i.releaseDate <= todayIso);
  if (published.length === 0) return undefined;
  return published.reduce((latest, i) =>
    i.releaseDate > latest.releaseDate ? i : latest
  );
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npm run test:unit`
Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add src/lib/latest-issue.ts tests/unit/latest-issue.test.ts
git commit -m "feat(lib): resolve the latest published issue for today"
```

---

## Phase 1 — Content schema and i18n

### Task 9: Content collection schema

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/issues/_example/index.yaml` (test fixture, removed later)
- Create: `src/content/issues/_example/da/{udskoling,gymnasium,universitet,kandidat}.md` (fixtures)

- [ ] **Step 1: Create `src/content.config.ts`**

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const spotifyIdPattern = /^[A-Za-z0-9]{22}$/;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const paletteEnum = z.enum(['warm', 'cool', 'mono', 'ink']);

const issues = defineCollection({
  loader: glob({ pattern: '*/index.yaml', base: './src/content/issues' }),
  schema: z.object({
    topic: z.string().min(1),
    releaseDate: z.string().regex(isoDate, 'releaseDate must be ISO YYYY-MM-DD'),
    summary: z.string().min(1).max(240),
    spotifyEpisodeId: z.string().regex(spotifyIdPattern).optional(),
    cover: z
      .object({
        image: z.string().min(1),
        alt: z.string().min(1),
        credit: z.string().optional()
      })
      .optional(),
    palette: paletteEnum.default('warm'),
    nextIssue: z
      .object({
        releaseDate: z.string().regex(isoDate)
      })
      .optional()
  })
});

const issueBodies = defineCollection({
  loader: glob({
    pattern: '*/da/*.md',
    base: './src/content/issues'
  }),
  schema: z.object({
    readingTimeMinutes: z.number().int().positive().optional()
  })
});

export const collections = { issues, issueBodies };
```

- [ ] **Step 2: Create the example fixture so Astro can sync**

Create `src/content/issues/_example/index.yaml`:

```yaml
topic: Eksempelemne
releaseDate: "2000-01-01"
summary: "Fjerne før launch — fixture til at content-collection ikke er tom under udvikling."
palette: warm
```

Create `src/content/issues/_example/da/udskoling.md`:

```markdown
---
---

Fjern før launch.
```

Create identical files at:
- `src/content/issues/_example/da/gymnasium.md`
- `src/content/issues/_example/da/universitet.md`
- `src/content/issues/_example/da/kandidat.md`

- [ ] **Step 3: Sync and check**

Run: `npx astro sync && npx astro check`
Expected: 0 errors.

- [ ] **Step 4: Commit** (skip in sandbox)

```bash
git add src/content.config.ts src/content/issues/_example/
git commit -m "feat(content): issues collection with Zod schema + dev fixture"
```

---

### Task 10: Danish UI dictionary + t() helper

**Files:**
- Create: `src/i18n/da.json`
- Create: `src/i18n/index.ts`

- [ ] **Step 1: Create `src/i18n/da.json`**

```json
{
  "site": {
    "title": "Kvantefysik",
    "tagline": "Kvantefysik for alle"
  },
  "nav": {
    "about": "Om",
    "archive": "Arkiv",
    "level": "Niveau",
    "menu": "Menu"
  },
  "levels": {
    "udskoling": { "name": "Udskoling", "short": "Udsk." },
    "gymnasium": { "name": "Gymnasium", "short": "Gym." },
    "universitet": { "name": "Universitet", "short": "Uni." },
    "kandidat": { "name": "Kandidat", "short": "Kand." }
  },
  "cover": {
    "issueEyebrow": "Udgave #{number} · {month} {year}",
    "readMore": "Læs videre →",
    "listenPodcast": "Lyt til podcasten",
    "nextIssue": "Ny udgave d. {date}",
    "readingTime": "{minutes} min læsetid",
    "level": "Niveau"
  },
  "reading": {
    "eyebrow": "Udgave #{number} · {month} {year} · {level}",
    "previousIssue": "Forrige udgave",
    "nextIssue": "Næste udgave"
  },
  "archive": {
    "heading": "Arkiv",
    "subtitle": "Alle udgivne udgaver",
    "comingSoon": "Kommer snart"
  },
  "podcast": {
    "heading": "🎙 Gå i dybden — podcast",
    "comingSoonTitle": "Podcast-episoden kommer snart",
    "follow": "Følg showet på Spotify"
  },
  "months": {
    "1": "januar", "2": "februar", "3": "marts", "4": "april",
    "5": "maj", "6": "juni", "7": "juli", "8": "august",
    "9": "september", "10": "oktober", "11": "november", "12": "december"
  },
  "monthsAbbr": {
    "1": "jan", "2": "feb", "3": "mar", "4": "apr",
    "5": "maj", "6": "jun", "7": "jul", "8": "aug",
    "9": "sep", "10": "okt", "11": "nov", "12": "dec"
  }
}
```

- [ ] **Step 2: Create `src/i18n/index.ts`**

```typescript
import da from './da.json';

export const locales = ['da'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'da';

const dictionaries = { da } satisfies Record<Locale, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  const parts = key.split('.');
  let node: unknown = dictionaries[locale];
  for (const part of parts) {
    if (isRecord(node) && part in node) {
      node = node[part];
    } else {
      throw new Error(`i18n key not found: ${key} (locale: ${locale})`);
    }
  }
  if (typeof node !== 'string') {
    throw new Error(`i18n key is not a string: ${key} (locale: ${locale})`);
  }
  return node.replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ''));
}

export function formatDanishDate(iso: string, locale: Locale = 'da'): string {
  const [y, m, d] = iso.split('-');
  const month = t(locale, `months.${parseInt(m, 10)}`);
  return `${parseInt(d, 10)}. ${month} ${y}`;
}

export function formatDanishMonthYear(iso: string, locale: Locale = 'da'): string {
  const [y, m] = iso.split('-');
  const month = t(locale, `months.${parseInt(m, 10)}`);
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalized} ${y}`;
}
```

- [ ] **Step 3: Verify with check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 4: Commit** (skip in sandbox)

```bash
git add src/i18n/
git commit -m "feat(i18n): Danish dictionary with t(), date formatters"
```

---

### Task 11: Issue loader helpers (ties content collections to lib)

**Files:**
- Create: `src/lib/issues.ts`

- [ ] **Step 1: Create `src/lib/issues.ts`**

```typescript
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { computeIssueNumbers } from './issue-numbering';
import { resolveLatestPublished } from './latest-issue';
import { levelSlugs, type Level } from './validate-issues';

export type IssueEntry = CollectionEntry<'issues'>;
export type IssueBodyEntry = CollectionEntry<'issueBodies'>;

export async function getAllIssues(): Promise<IssueEntry[]> {
  const all = await getCollection('issues');
  return all.filter((entry) => !entry.id.startsWith('_'));
}

export async function getIssuesNumbered() {
  const entries = await getAllIssues();
  const refs = entries.map((entry) => ({
    folder: entry.id,
    releaseDate: entry.data.releaseDate,
    entry
  }));
  return computeIssueNumbers(refs);
}

export async function getLatestPublishedIssue(today: Date = new Date()) {
  const numbered = await getIssuesNumbered();
  return resolveLatestPublished(numbered, today);
}

export async function getIssueBody(
  folder: string,
  level: Level,
  locale: string = 'da'
): Promise<IssueBodyEntry> {
  const all = await getCollection('issueBodies');
  const match = all.find((entry) => entry.id === `${folder}/${locale}/${level}`);
  if (!match) {
    throw new Error(
      `Missing body for issue ${folder} (${locale}/${level}). ` +
      `Expected: src/content/issues/${folder}/${locale}/${level}.md`
    );
  }
  return match;
}

export { levelSlugs, type Level };
```

- [ ] **Step 2: Verify compile**

Run: `npx astro sync && npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit** (skip in sandbox)

```bash
git add src/lib/issues.ts
git commit -m "feat(lib): issue loaders (all, numbered, latest, body)"
```

---

## Phase 1 — Styles and palettes

### Task 12: Design tokens + typography + palettes

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/typography.css`
- Create: `src/styles/palettes.css`
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
:root {
  --color-bg: #faf8f4;
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-text-muted: #5a5a5a;
  --color-border: #e3dfd5;
  --color-accent: #8a3a1f;
  --color-accent-soft: #f3e5d7;

  --font-serif: "Source Serif 4", Georgia, "Times New Roman", serif;
  --font-sans: system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --size-step--2: 0.75rem;
  --size-step--1: 0.875rem;
  --size-step-0: 1rem;
  --size-step-1: 1.125rem;
  --size-step-2: 1.375rem;
  --size-step-3: 1.75rem;
  --size-step-4: 2.25rem;
  --size-step-5: 3rem;
  --size-step-6: 4rem;

  --line-body: 1.6;
  --line-heading: 1.1;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;

  --content-max: 36rem;
  --page-max: 1080px;

  --radius-sm: 4px;
  --radius-md: 8px;
}
```

- [ ] **Step 2: Create `src/styles/typography.css`**

```css
@import "@fontsource/source-serif-4/400.css";
@import "@fontsource/source-serif-4/400-italic.css";
@import "@fontsource/source-serif-4/700.css";

html {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: var(--line-body);
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, h4 {
  line-height: var(--line-heading);
  font-weight: 700;
  margin: 0 0 var(--space-4) 0;
}
h1 { font-size: var(--size-step-5); font-weight: 400; }
h2 { font-size: var(--size-step-3); }
h3 { font-size: var(--size-step-2); }

p {
  margin: 0 0 var(--space-4) 0;
  max-width: var(--content-max);
}

a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--size-step--1);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: var(--space-2);
}
```

- [ ] **Step 3: Create `src/styles/palettes.css`**

```css
/* Each palette sets the cover backdrop + its accent + text tone.
   Add a new palette by adding a block and an enum value in content.config.ts. */

.palette-warm {
  --cover-bg: #faf8f4;
  --cover-text: #1a1a1a;
  --cover-accent: #8a3a1f;
}
.palette-cool {
  --cover-bg: #e8ecef;
  --cover-text: #1a1a1a;
  --cover-accent: #0f4c5c;
}
.palette-mono {
  --cover-bg: #0e0e0e;
  --cover-text: #f4f1ea;
  --cover-accent: #f4f1ea;
}
.palette-ink {
  --cover-bg: #0b1b2b;
  --cover-text: #f4f1ea;
  --cover-accent: #d9a74a;
}
```

- [ ] **Step 4: Create `src/styles/global.css`**

```css
@import "./tokens.css";
@import "./typography.css";
@import "./palettes.css";

*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; min-height: 100vh; }

img, svg, picture, video { display: block; max-width: 100%; height: auto; }

.page {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-5);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add src/styles/
git commit -m "feat(styles): editorial typography, tokens, and 4 cover palettes"
```

---

## Phase 1 — Layouts and base components

### Task 13: BaseLayout

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `public/favicon.svg`

- [ ] **Step 1: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import { t } from '../i18n';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
const siteTitle = t('da', 'site.tagline');
const fullTitle = title === siteTitle ? title : `${title} · ${siteTitle}`;
---
<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    {description && <meta name="description" content={description} />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous" />
    <meta property="og:title" content={fullTitle} />
    {description && <meta property="og:description" content={description} />}
    <meta property="og:type" content="website" />
  </head>
  <body>
    <slot name="header" />
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create `public/favicon.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="26" fill="#faf8f4" stroke="#1a1a1a" stroke-width="3"/>
  <circle cx="32" cy="32" r="4" fill="#8a3a1f"/>
</svg>
```

- [ ] **Step 3: Commit** (skip in sandbox)

```bash
git add src/layouts/ public/favicon.svg
git commit -m "feat(layout): BaseLayout with OG + KaTeX stylesheet"
```

---

### Task 14: SiteHeader + LevelSwitcher

**Files:**
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/LevelSwitcher.astro`
- Create: `src/scripts/level-switcher.ts`
- Create: `src/styles/header.css`

- [ ] **Step 1: Create `src/scripts/level-switcher.ts`**

```typescript
const LEVEL_KEY = 'qp.level';
const LEVEL_IN_PATH = /^\/(\d{4})\/(\d{2})\/(udskoling|gymnasium|universitet|kandidat)\/?$/;
const ISSUE_IN_PATH = /^\/(\d{4})\/(\d{2})\/?$/;

function currentIssueAndLevel(): { year: string; month: string; level?: string } | null {
  const path = window.location.pathname;
  const levelMatch = LEVEL_IN_PATH.exec(path);
  if (levelMatch) return { year: levelMatch[1], month: levelMatch[2], level: levelMatch[3] };
  const issueMatch = ISSUE_IN_PATH.exec(path);
  if (issueMatch) return { year: issueMatch[1], month: issueMatch[2] };
  return null;
}

function initLevelSwitcher(): void {
  const select = document.querySelector<HTMLSelectElement>('[data-level-switcher]');
  if (!select) return;

  const ctx = currentIssueAndLevel();
  if (ctx?.level) select.value = ctx.level;

  select.addEventListener('change', () => {
    const newLevel = select.value;
    try { localStorage.setItem(LEVEL_KEY, newLevel); } catch { /* ignore */ }
    if (ctx) {
      window.location.assign(`/${ctx.year}/${ctx.month}/${newLevel}/`);
    }
  });
}

initLevelSwitcher();
```

- [ ] **Step 2: Create `src/components/LevelSwitcher.astro`**

```astro
---
import { t } from '../i18n';
import { levelSlugs } from '../lib/issues';
---
<label class="level-switcher">
  <span class="visually-hidden">{t('da', 'nav.level')}</span>
  <select data-level-switcher aria-label={t('da', 'nav.level')}>
    {levelSlugs.map((slug) => (
      <option value={slug}>{t('da', `levels.${slug}.name`)}</option>
    ))}
  </select>
</label>

<script>
  import '../scripts/level-switcher.ts';
</script>
```

- [ ] **Step 3: Create `src/components/SiteHeader.astro`**

```astro
---
import { t } from '../i18n';
import LevelSwitcher from './LevelSwitcher.astro';

interface Props {
  showSwitcher?: boolean;
}

const { showSwitcher = true } = Astro.props;
---
<header class="site-header">
  <div class="site-header__inner">
    <a class="site-header__brand" href="/">{t('da', 'site.title')}</a>
    <nav class="site-header__nav" aria-label="Primary">
      {showSwitcher && <LevelSwitcher />}
      <a href="/arkiv/">{t('da', 'nav.archive')}</a>
      <a href="/om/">{t('da', 'nav.about')}</a>
    </nav>
  </div>
</header>
```

- [ ] **Step 4: Create `src/styles/header.css`**

```css
.site-header {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}
.site-header__inner {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-3) var(--space-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
}
.site-header__brand {
  font-weight: 700;
  font-size: var(--size-step-1);
  color: var(--color-text);
  text-decoration: none;
}
.site-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  font-family: var(--font-sans);
  font-size: var(--size-step--1);
}
.site-header__nav a {
  color: var(--color-text);
  text-decoration: none;
}
.site-header__nav a:hover { text-decoration: underline; }
.level-switcher select {
  font-family: var(--font-sans);
  font-size: var(--size-step--1);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text);
}
@media (max-width: 540px) {
  .site-header__inner { padding: var(--space-2) var(--space-3); gap: var(--space-3); }
  .site-header__nav { gap: var(--space-3); }
}
```

- [ ] **Step 5: Import `header.css` in `global.css`**

Append to `src/styles/global.css`:

```css
@import "./header.css";
```

- [ ] **Step 6: Commit** (skip in sandbox)

```bash
git add src/components/ src/scripts/level-switcher.ts src/styles/header.css src/styles/global.css
git commit -m "feat(ui): SiteHeader with LevelSwitcher (localStorage + URL aware)"
```

---

### Task 15: PodcastEmbed

**Files:**
- Create: `src/components/PodcastEmbed.astro`
- Create: `src/styles/podcast.css`

- [ ] **Step 1: Create `src/components/PodcastEmbed.astro`**

```astro
---
import { t } from '../i18n';

interface Props {
  episodeId?: string;
  showUrl?: string;
}

const { episodeId, showUrl = 'https://open.spotify.com' } = Astro.props;
---
<section class="podcast">
  <div class="podcast__eyebrow">{t('da', 'podcast.heading')}</div>
  {episodeId ? (
    <iframe
      title="Spotify podcast episode"
      src={`https://open.spotify.com/embed/episode/${episodeId}`}
      width="100%"
      height="152"
      frameborder="0"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
      loading="lazy"
      data-testid="podcast-embed"
    ></iframe>
  ) : (
    <div class="podcast__pending" data-testid="podcast-pending">
      <p><strong>{t('da', 'podcast.comingSoonTitle')}</strong></p>
      <p><a href={showUrl} target="_blank" rel="noopener">{t('da', 'podcast.follow')} →</a></p>
    </div>
  )}
</section>
```

- [ ] **Step 2: Create `src/styles/podcast.css`**

```css
.podcast {
  margin-top: var(--space-6);
  padding: var(--space-4);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.podcast__eyebrow {
  font-family: var(--font-mono);
  font-size: var(--size-step--2);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}
.podcast__pending p { margin: 0 0 var(--space-2) 0; }
.podcast iframe { border-radius: var(--radius-sm); }
```

- [ ] **Step 3: Import in global.css**

Append to `src/styles/global.css`:

```css
@import "./podcast.css";
```

- [ ] **Step 4: Commit** (skip in sandbox)

```bash
git add src/components/PodcastEmbed.astro src/styles/podcast.css src/styles/global.css
git commit -m "feat(ui): PodcastEmbed with kommer-snart fallback"
```

---

### Task 16: TypographicCover component

**Files:**
- Create: `src/components/TypographicCover.astro`
- Create: `src/styles/cover.css`

- [ ] **Step 1: Create `src/components/TypographicCover.astro`**

```astro
---
import { t, formatDanishMonthYear, formatDanishDate } from '../i18n';

interface Props {
  palette: 'warm' | 'cool' | 'mono' | 'ink';
  number: number;
  releaseDate: string;
  topic: string;
  summary: string;
  readMoreHref: string;
  podcastHref: string;
  readingTimeMinutes?: number;
  nextIssueDate?: string;
}

const {
  palette, number, releaseDate, topic, summary,
  readMoreHref, podcastHref, readingTimeMinutes, nextIssueDate
} = Astro.props;

const monthYear = formatDanishMonthYear(releaseDate);
const eyebrow = t('da', 'cover.issueEyebrow', {
  number,
  month: monthYear.split(' ')[0],
  year: monthYear.split(' ')[1]
});
const nextText = nextIssueDate ? t('da', 'cover.nextIssue', { date: formatDanishDate(nextIssueDate) }) : null;
const readingText = readingTimeMinutes ? t('da', 'cover.readingTime', { minutes: readingTimeMinutes }) : null;
---
<section class:list={['cover', 'cover--typographic', `palette-${palette}`]}>
  <div class="cover__body">
    <div class="cover__eyebrow">{eyebrow}</div>
    <h1 class="cover__topic">{topic}</h1>
    <p class="cover__summary">{summary}</p>
    <div class="cover__cta">
      <a class="cover__btn cover__btn--primary" href={readMoreHref} data-testid="read-more">{t('da', 'cover.readMore')}</a>
      <a class="cover__btn cover__btn--secondary" href={podcastHref} target="_blank" rel="noopener">{t('da', 'cover.listenPodcast')}</a>
    </div>
    <footer class="cover__footer">
      {readingText && <span>{readingText}</span>}
      {nextText && <span class="cover__next">{nextText}</span>}
    </footer>
  </div>
</section>
```

- [ ] **Step 2: Create `src/styles/cover.css`**

```css
.cover {
  background: var(--cover-bg);
  color: var(--cover-text);
  padding: var(--space-8) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}
.cover__body {
  max-width: var(--page-max);
  margin: 0 auto;
}
.cover__eyebrow {
  font-family: var(--font-mono);
  font-size: var(--size-step--1);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cover-accent);
  margin-bottom: var(--space-3);
}
.cover__topic {
  font-size: var(--size-step-6);
  line-height: 1;
  font-weight: 400;
  max-width: 14ch;
  margin: 0 0 var(--space-4) 0;
  color: var(--cover-text);
}
.cover__summary {
  max-width: 44ch;
  font-size: var(--size-step-1);
  color: var(--cover-text);
  opacity: 0.82;
  margin: 0 0 var(--space-6) 0;
}
.cover__cta {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
.cover__btn {
  display: inline-block;
  padding: var(--space-3) var(--space-5);
  font-family: var(--font-sans);
  font-size: var(--size-step-0);
  text-decoration: none;
  border: 1px solid var(--cover-text);
  border-radius: var(--radius-sm);
  color: var(--cover-text);
  background: transparent;
}
.cover__btn--primary {
  background: var(--cover-text);
  color: var(--cover-bg);
}
.cover__footer {
  font-family: var(--font-mono);
  font-size: var(--size-step--2);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--cover-text);
  opacity: 0.7;
  display: flex;
  gap: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--cover-text);
  border-top-color: color-mix(in srgb, var(--cover-text) 20%, transparent);
}
.cover__next { margin-left: auto; }

@media (max-width: 640px) {
  .cover { padding: var(--space-6) var(--space-4); }
  .cover__topic { font-size: var(--size-step-4); }
  .cover__cta { flex-direction: column; }
  .cover__btn { text-align: center; }
}
```

- [ ] **Step 3: Import in global.css**

Append to `src/styles/global.css`:

```css
@import "./cover.css";
```

- [ ] **Step 4: Commit** (skip in sandbox)

```bash
git add src/components/TypographicCover.astro src/styles/cover.css src/styles/global.css
git commit -m "feat(ui): TypographicCover with palette-scoped styling"
```

---

### Task 17: IllustratedCover + IssueCover wrapper

**Files:**
- Create: `src/components/IllustratedCover.astro`
- Create: `src/components/IssueCover.astro`

- [ ] **Step 1: Create `src/components/IllustratedCover.astro`**

```astro
---
import { t, formatDanishMonthYear, formatDanishDate } from '../i18n';

interface Props {
  palette: 'warm' | 'cool' | 'mono' | 'ink';
  number: number;
  releaseDate: string;
  topic: string;
  summary: string;
  readMoreHref: string;
  podcastHref: string;
  readingTimeMinutes?: number;
  nextIssueDate?: string;
  image: string;
  alt: string;
  credit?: string;
}

const {
  palette, number, releaseDate, topic, summary,
  readMoreHref, podcastHref, readingTimeMinutes, nextIssueDate,
  image, alt, credit
} = Astro.props;

const monthYear = formatDanishMonthYear(releaseDate);
const eyebrow = t('da', 'cover.issueEyebrow', {
  number,
  month: monthYear.split(' ')[0],
  year: monthYear.split(' ')[1]
});
const nextText = nextIssueDate ? t('da', 'cover.nextIssue', { date: formatDanishDate(nextIssueDate) }) : null;
const readingText = readingTimeMinutes ? t('da', 'cover.readingTime', { minutes: readingTimeMinutes }) : null;
---
<section class:list={['cover', 'cover--illustrated', `palette-${palette}`]}>
  <div class="cover__grid">
    <div class="cover__text">
      <div class="cover__eyebrow">{eyebrow}</div>
      <h1 class="cover__topic">{topic}</h1>
      <p class="cover__summary">{summary}</p>
      <div class="cover__cta">
        <a class="cover__btn cover__btn--primary" href={readMoreHref} data-testid="read-more">{t('da', 'cover.readMore')}</a>
        <a class="cover__btn cover__btn--secondary" href={podcastHref} target="_blank" rel="noopener">{t('da', 'cover.listenPodcast')}</a>
      </div>
    </div>
    <figure class="cover__illustration">
      <img src={image} alt={alt} loading="eager" />
      {credit && <figcaption>{credit}</figcaption>}
    </figure>
  </div>
  <footer class="cover__footer cover__footer--illustrated">
    {readingText && <span>{readingText}</span>}
    {nextText && <span class="cover__next">{nextText}</span>}
  </footer>
</section>

<style>
  .cover--illustrated { padding: 0; }
  .cover__grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    max-width: var(--page-max);
    margin: 0 auto;
  }
  .cover__text { padding: var(--space-7) var(--space-6); }
  .cover__illustration { margin: 0; background: var(--color-surface); }
  .cover__illustration img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .cover__illustration figcaption {
    font-family: var(--font-mono);
    font-size: var(--size-step--2);
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-muted);
  }
  .cover__footer--illustrated {
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-3) var(--space-6);
  }
  @media (max-width: 720px) {
    .cover__grid { grid-template-columns: 1fr; }
    .cover__illustration img { aspect-ratio: 3/2; }
    .cover__text { padding: var(--space-6) var(--space-4); }
    .cover__footer--illustrated { padding: var(--space-3) var(--space-4); }
  }
</style>
```

- [ ] **Step 2: Create `src/components/IssueCover.astro` wrapper**

```astro
---
import TypographicCover from './TypographicCover.astro';
import IllustratedCover from './IllustratedCover.astro';

interface Props {
  palette: 'warm' | 'cool' | 'mono' | 'ink';
  number: number;
  releaseDate: string;
  topic: string;
  summary: string;
  readMoreHref: string;
  podcastHref: string;
  readingTimeMinutes?: number;
  nextIssueDate?: string;
  cover?: { image: string; alt: string; credit?: string };
}

const props = Astro.props;
---
{props.cover ? (
  <IllustratedCover {...props} image={props.cover.image} alt={props.cover.alt} credit={props.cover.credit} />
) : (
  <TypographicCover {...props} />
)}
```

- [ ] **Step 3: Commit** (skip in sandbox)

```bash
git add src/components/IllustratedCover.astro src/components/IssueCover.astro
git commit -m "feat(ui): IllustratedCover and IssueCover wrapper"
```

---

### Task 18: Home page (`/`) — renders latest published issue

**Files:**
- Create: `src/pages/index.astro`
- Create: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write the failing Playwright test**

Create `tests/e2e/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('home shows the latest published issue cover', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Udgave #/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('read-more')).toBeVisible();
});
```

(Playwright setup comes in Task 27 — for now this test exists but won't run. It will be wired when Playwright is configured.)

- [ ] **Step 2: Create `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';
import IssueCover from '../components/IssueCover.astro';
import { getIssuesNumbered, getLatestPublishedIssue, getIssueBody } from '../lib/issues';
import { t } from '../i18n';

const latest = await getLatestPublishedIssue();
const allNumbered = await getIssuesNumbered();

if (!latest) {
  // Edge case: no issue published yet. Render a placeholder.
}

const podcastHref = latest?.entry.data.spotifyEpisodeId
  ? `https://open.spotify.com/episode/${latest.entry.data.spotifyEpisodeId}`
  : 'https://open.spotify.com';

const defaultLevel = 'gymnasium';
const readMoreHref = latest ? `/${latest.folder.replace('-', '/')}/${defaultLevel}/` : '/';

let readingMinutes: number | undefined;
if (latest) {
  try {
    const body = await getIssueBody(latest.folder, defaultLevel);
    readingMinutes = body.data.readingTimeMinutes;
  } catch { /* no body yet for default level */ }
}

const description = latest?.entry.data.summary ?? t('da', 'site.tagline');
const title = latest ? latest.entry.data.topic : t('da', 'site.tagline');
---
<BaseLayout title={title} description={description}>
  <SiteHeader slot="header" showSwitcher={false} />
  {latest ? (
    <IssueCover
      palette={latest.entry.data.palette}
      number={latest.number}
      releaseDate={latest.entry.data.releaseDate}
      topic={latest.entry.data.topic}
      summary={latest.entry.data.summary}
      readMoreHref={readMoreHref}
      podcastHref={podcastHref}
      readingTimeMinutes={readingMinutes}
      nextIssueDate={latest.entry.data.nextIssue?.releaseDate}
      cover={latest.entry.data.cover}
    />
  ) : (
    <section class="cover palette-warm">
      <div class="cover__body">
        <h1 class="cover__topic">{t('da', 'site.tagline')}</h1>
        <p class="cover__summary">Første udgave kommer snart.</p>
      </div>
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: exit 0; `dist/index.html` exists and contains the fixture's topic ("Eksempelemne").

- [ ] **Step 4: Commit** (skip in sandbox)

```bash
git add src/pages/index.astro tests/e2e/home.spec.ts
git commit -m "feat(pages): home page renders latest published issue cover"
```

---

### Task 19: Issue cover page (`/YYYY/MM/`)

**Files:**
- Create: `src/pages/[year]/[month]/index.astro`

- [ ] **Step 1: Create `src/pages/[year]/[month]/index.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import SiteHeader from '../../../components/SiteHeader.astro';
import IssueCover from '../../../components/IssueCover.astro';
import { getIssuesNumbered, getIssueBody } from '../../../lib/issues';

export async function getStaticPaths() {
  const numbered = await getIssuesNumbered();
  return numbered.map((i) => {
    const [year, month] = i.folder.split('-');
    return { params: { year, month }, props: { issue: i } };
  });
}

type NumberedIssueEntry = Awaited<ReturnType<typeof getIssuesNumbered>>[number];
type Props = { issue: NumberedIssueEntry };

const { issue } = Astro.props;

const defaultLevel = 'gymnasium';
const readMoreHref = `/${issue.folder.replace('-', '/')}/${defaultLevel}/`;
const podcastHref = issue.entry.data.spotifyEpisodeId
  ? `https://open.spotify.com/episode/${issue.entry.data.spotifyEpisodeId}`
  : 'https://open.spotify.com';

let readingMinutes: number | undefined;
try {
  const body = await getIssueBody(issue.folder, defaultLevel);
  readingMinutes = body.data.readingTimeMinutes;
} catch { /* noop */ }
---
<BaseLayout title={issue.entry.data.topic} description={issue.entry.data.summary}>
  <SiteHeader slot="header" showSwitcher={false} />
  <IssueCover
    palette={issue.entry.data.palette}
    number={issue.number}
    releaseDate={issue.entry.data.releaseDate}
    topic={issue.entry.data.topic}
    summary={issue.entry.data.summary}
    readMoreHref={readMoreHref}
    podcastHref={podcastHref}
    readingTimeMinutes={readingMinutes}
    nextIssueDate={issue.entry.data.nextIssue?.releaseDate}
    cover={issue.entry.data.cover}
  />
</BaseLayout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: exit 0; `dist/2000/01/index.html` exists (from `_example` fixture? No — fixture folder is `_example` which is filtered out in `getAllIssues`). After Task 24 seeds real content, `/2026/04/` will generate.

- [ ] **Step 3: Commit** (skip in sandbox)

```bash
git add src/pages/[year]/
git commit -m "feat(pages): issue cover page at /YYYY/MM/"
```

---

### Task 20: Reading page with drop cap (`/YYYY/MM/<level>/`)

**Files:**
- Create: `src/pages/[year]/[month]/[level]/index.astro`
- Create: `src/components/IssueNav.astro`
- Create: `src/styles/reading.css`

- [ ] **Step 1: Create `src/components/IssueNav.astro`**

```astro
---
import { t, formatDanishMonthYear } from '../i18n';
import type { NumberedIssue } from '../lib/issue-numbering';

interface Props {
  previous?: { folder: string; releaseDate: string };
  next?: { folder: string; releaseDate: string };
  level: string;
}

const { previous, next, level } = Astro.props;

function href(folder: string) {
  return `/${folder.replace('-', '/')}/${level}/`;
}
---
<nav class="issue-nav" aria-label="Udgavenavigation">
  {previous ? (
    <a class="issue-nav__link issue-nav__link--prev" href={href(previous.folder)}>
      <span class="issue-nav__label">← {t('da', 'reading.previousIssue')}</span>
      <span class="issue-nav__month">{formatDanishMonthYear(previous.releaseDate)}</span>
    </a>
  ) : <span />}
  {next ? (
    <a class="issue-nav__link issue-nav__link--next" href={href(next.folder)}>
      <span class="issue-nav__label">{t('da', 'reading.nextIssue')} →</span>
      <span class="issue-nav__month">{formatDanishMonthYear(next.releaseDate)}</span>
    </a>
  ) : <span />}
</nav>
```

- [ ] **Step 2: Create `src/styles/reading.css`**

```css
.reading {
  max-width: 36rem;
  margin: 0 auto;
  padding: var(--space-6) var(--space-5);
}
.reading__eyebrow {
  font-family: var(--font-mono);
  font-size: var(--size-step--1);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: var(--space-3);
}
.reading__title {
  font-size: var(--size-step-4);
  font-weight: 400;
  margin: 0 0 var(--space-5) 0;
}
.reading__prose {
  font-size: var(--size-step-1);
  line-height: 1.7;
}
.reading__prose > p:first-of-type::first-letter {
  font-weight: 700;
  font-size: 3.2em;
  float: left;
  line-height: 0.9;
  padding: 0.05em 0.08em 0 0;
}
.reading__prose h2 { margin-top: var(--space-6); }
.reading__prose img { border-radius: var(--radius-sm); margin: var(--space-4) 0; }

.issue-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}
.issue-nav__link {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.issue-nav__link:hover { border-color: var(--color-accent); }
.issue-nav__link--next { text-align: right; }
.issue-nav__label {
  font-family: var(--font-mono);
  font-size: var(--size-step--2);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.issue-nav__month { font-size: var(--size-step-0); }
@media (max-width: 480px) {
  .reading { padding: var(--space-5) var(--space-4); }
  .reading__title { font-size: var(--size-step-3); }
  .reading__prose { font-size: var(--size-step-0); }
}
```

- [ ] **Step 3: Import in global.css**

Append to `src/styles/global.css`:

```css
@import "./reading.css";
```

- [ ] **Step 4: Create `src/pages/[year]/[month]/[level]/index.astro`**

```astro
---
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import SiteHeader from '../../../../components/SiteHeader.astro';
import PodcastEmbed from '../../../../components/PodcastEmbed.astro';
import IssueNav from '../../../../components/IssueNav.astro';
import { getIssuesNumbered, getIssueBody, levelSlugs, type Level } from '../../../../lib/issues';
import { render } from 'astro:content';
import { t, formatDanishMonthYear } from '../../../../i18n';

export async function getStaticPaths() {
  const numbered = await getIssuesNumbered();
  return numbered.flatMap((issue) => {
    const [year, month] = issue.folder.split('-');
    return levelSlugs.map((level) => ({
      params: { year, month, level },
      props: { issue, level, allIssues: numbered }
    }));
  });
}

type NumberedIssueEntry = Awaited<ReturnType<typeof getIssuesNumbered>>[number];
type Props = {
  issue: NumberedIssueEntry;
  level: Level;
  allIssues: NumberedIssueEntry[];
};

const { issue, level, allIssues } = Astro.props;

const body = await getIssueBody(issue.folder, level);
const { Content } = await render(body);

const idx = allIssues.findIndex((i) => i.folder === issue.folder);
const previous = idx > 0
  ? { folder: allIssues[idx - 1].folder, releaseDate: allIssues[idx - 1].entry.data.releaseDate }
  : undefined;
const next = idx < allIssues.length - 1
  ? { folder: allIssues[idx + 1].folder, releaseDate: allIssues[idx + 1].entry.data.releaseDate }
  : undefined;

const monthYear = formatDanishMonthYear(issue.entry.data.releaseDate);
const eyebrow = t('da', 'reading.eyebrow', {
  number: issue.number,
  month: monthYear.split(' ')[0],
  year: monthYear.split(' ')[1],
  level: t('da', `levels.${level}.name`)
});
---
<BaseLayout title={issue.entry.data.topic} description={issue.entry.data.summary}>
  <SiteHeader slot="header" />
  <article class="reading">
    <div class="reading__eyebrow">{eyebrow}</div>
    <h1 class="reading__title">{issue.entry.data.topic}</h1>
    <div class="reading__prose">
      <Content />
    </div>
    <PodcastEmbed episodeId={issue.entry.data.spotifyEpisodeId} />
    <IssueNav previous={previous} next={next} level={level} />
  </article>
</BaseLayout>
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 6: Commit** (skip in sandbox)

```bash
git add src/pages/[year]/[month]/[level]/ src/components/IssueNav.astro src/styles/reading.css src/styles/global.css
git commit -m "feat(pages): reading page with drop cap and issue nav"
```

---

### Task 21: Archive (`/arkiv/`) + ArchiveCard

**Files:**
- Create: `src/components/ArchiveCard.astro`
- Create: `src/pages/arkiv.astro`
- Create: `src/styles/archive.css`

- [ ] **Step 1: Create `src/components/ArchiveCard.astro`**

```astro
---
import { t, formatDanishMonthYear } from '../i18n';
import type { NumberedIssue } from '../lib/issue-numbering';

interface Props {
  issue: NumberedIssue & { topic: string; palette: string; summary: string };
  isPublished: boolean;
}

const { issue, isPublished } = Astro.props;
const monthYear = formatDanishMonthYear(issue.releaseDate);
const eyebrow = `#${issue.number} · ${monthYear.toUpperCase()}`;
const href = `/${issue.folder.replace('-', '/')}/`;
---
{isPublished ? (
  <a class:list={['archive-card', `palette-${issue.palette}`]} href={href} data-testid="archive-card-published">
    <div class="archive-card__eyebrow">{eyebrow}</div>
    <div class="archive-card__topic">{issue.topic}</div>
    <div class="archive-card__summary">{issue.summary}</div>
  </a>
) : (
  <div class="archive-card archive-card--pending" data-testid="archive-card-pending">
    <div class="archive-card__eyebrow">{eyebrow}</div>
    <div class="archive-card__topic">{t('da', 'archive.comingSoon')}</div>
  </div>
)}
```

- [ ] **Step 2: Create `src/styles/archive.css`**

```css
.archive { padding: var(--space-6) 0; }
.archive__heading { font-size: var(--size-step-4); font-weight: 400; margin: 0 0 var(--space-2) 0; }
.archive__subtitle { color: var(--color-text-muted); margin: 0 0 var(--space-6) 0; }
.archive__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.archive-card {
  aspect-ratio: 3/4;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--cover-bg, var(--color-surface));
  color: var(--cover-text, var(--color-text));
  text-decoration: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.archive-card:hover { border-color: var(--color-accent); }
.archive-card__eyebrow {
  font-family: var(--font-mono);
  font-size: var(--size-step--2);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cover-accent, var(--color-accent));
}
.archive-card__topic { font-size: var(--size-step-2); }
.archive-card__summary { font-family: var(--font-sans); font-size: var(--size-step--1); opacity: 0.75; }
.archive-card--pending {
  opacity: 0.45;
  background: var(--color-surface);
  color: var(--color-text);
  filter: grayscale(1);
}
@media (max-width: 720px) {
  .archive__grid { grid-template-columns: 1fr; }
  .archive-card {
    aspect-ratio: auto;
    padding: var(--space-3);
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
  }
  .archive-card__eyebrow { min-width: 6rem; }
}
```

- [ ] **Step 3: Import in global.css**

Append:

```css
@import "./archive.css";
```

- [ ] **Step 4: Create `src/pages/arkiv.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';
import ArchiveCard from '../components/ArchiveCard.astro';
import { getIssuesNumbered } from '../lib/issues';
import { t } from '../i18n';

const numbered = await getIssuesNumbered();
const todayIso = new Date().toISOString().slice(0, 10);
const sorted = [...numbered].sort((a, b) =>
  b.entry.data.releaseDate.localeCompare(a.entry.data.releaseDate)
);
---
<BaseLayout title={t('da', 'archive.heading')} description={t('da', 'archive.subtitle')}>
  <SiteHeader slot="header" />
  <section class="archive page">
    <h1 class="archive__heading">{t('da', 'archive.heading')}</h1>
    <p class="archive__subtitle">{t('da', 'archive.subtitle')}</p>
    <div class="archive__grid">
      {sorted.map((i) => (
        <ArchiveCard
          issue={{
            folder: i.folder,
            releaseDate: i.entry.data.releaseDate,
            number: i.number,
            topic: i.entry.data.topic,
            palette: i.entry.data.palette,
            summary: i.entry.data.summary
          }}
          isPublished={i.entry.data.releaseDate <= todayIso}
        />
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: exit 0; `dist/arkiv/index.html` exists.

- [ ] **Step 6: Commit** (skip in sandbox)

```bash
git add src/components/ArchiveCard.astro src/pages/arkiv.astro src/styles/archive.css src/styles/global.css
git commit -m "feat(pages): archive with published and coming-soon cards"
```

---

### Task 22: About page (`/om/`)

**Files:**
- Create: `src/pages/om.astro`

- [ ] **Step 1: Create `src/pages/om.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';
import { t } from '../i18n';
---
<BaseLayout title={t('da', 'nav.about')}>
  <SiteHeader slot="header" />
  <article class="reading">
    <div class="reading__eyebrow">OM</div>
    <h1 class="reading__title">Om projektet</h1>
    <div class="reading__prose">
      <p><em>[DA: Forfatteren — udskift dette afsnit med projektets motivation og en kort bio.]</em></p>
      <p><em>[DA: Link til Spotify-showet.]</em></p>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: exit 0; `dist/om/index.html` exists.

- [ ] **Step 3: Commit** (skip in sandbox)

```bash
git add src/pages/om.astro
git commit -m "feat(pages): /om/ placeholder with reading layout"
```

---

### Task 23: Level memory script on the home page

**Files:**
- Create: `src/scripts/level-memory.ts`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/scripts/level-memory.ts`**

```typescript
const LEVEL_KEY = 'qp.level';
const VALID = new Set(['udskoling', 'gymnasium', 'universitet', 'kandidat']);

function rewriteReadMore(): void {
  const link = document.querySelector<HTMLAnchorElement>('[data-testid="read-more"]');
  if (!link) return;
  try {
    const stored = localStorage.getItem(LEVEL_KEY);
    if (!stored || !VALID.has(stored)) return;
    const replaced = link.href.replace(/\/(udskoling|gymnasium|universitet|kandidat)\/?$/, `/${stored}/`);
    link.href = replaced;
  } catch { /* ignore */ }
}

rewriteReadMore();
```

- [ ] **Step 2: Add the script to `src/pages/index.astro`**

Append at the very bottom of `src/pages/index.astro`:

```astro
<script>
  import '../scripts/level-memory.ts';
</script>
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit** (skip in sandbox)

```bash
git add src/scripts/level-memory.ts src/pages/index.astro
git commit -m "feat(client): rewrite 'Læs videre' to stored level on home"
```

---

## Phase 1 — Seed content

### Task 24: Seed content (Superposition × 4 levels, April 2026)

**Files:**
- Create: `src/content/issues/2026-04/index.yaml`
- Create: `src/content/issues/2026-04/da/udskoling.md`
- Create: `src/content/issues/2026-04/da/gymnasium.md`
- Create: `src/content/issues/2026-04/da/universitet.md`
- Create: `src/content/issues/2026-04/da/kandidat.md`
- Delete: `src/content/issues/_example/`

> **Author note:** Danish prose is placeholder for build validation. The native-fluent author replaces before launch.

- [ ] **Step 1: Create `src/content/issues/2026-04/index.yaml`**

```yaml
topic: Superposition
releaseDate: "2026-04-15"
summary: "Hvad betyder det at være to steder på én gang?"
palette: warm
```

- [ ] **Step 2: Create `src/content/issues/2026-04/da/udskoling.md`**

```markdown
---
readingTimeMinutes: 5
---

Forestil dig en mønt, mens den snurrer i luften. Er den plat eller krone? I hverdagen siger vi, at den endnu ikke "er blevet" til det ene eller det andet.

I kvantefysik er det anderledes: en partikel kan faktisk være i *flere* tilstande samtidig. Først når vi måler, bestemmer den sig.

## Hvorfor det er mærkeligt

Vi er vant til, at ting er ét sted ad gangen. Men for meget små ting — som elektroner — holder den regel ikke længere.

## Hvad du skal huske

- Partikler kan være i to tilstande samtidig, indtil vi måler.
- Måling tvinger partiklen til at "vælge".
- Det er ikke en fejl i måleinstrumentet — det er sådan verden virker på de mindste skalaer.
```

- [ ] **Step 3: Create `src/content/issues/2026-04/da/gymnasium.md`**

```markdown
---
readingTimeMinutes: 7
---

En kvantetilstand kan være en *blanding* af to eller flere muligheder. Før vi måler, er en partikel ikke nødvendigvis i én bestemt tilstand — den er i en superposition af flere.

## Et konkret eksempel

Tænk på en elektrons spin. Den kan være "op" eller "ned", men indtil vi måler, kan den lige så godt være en kombination af begge.

## Hvorfor kvantemekanik kræver dette

I klassisk fysik har en partikel altid en veldefineret position og hastighed. I kvantefysik beskriver vi partiklen med en *bølgefunktion*, som indeholder alle de mulige tilstande samtidig.

Først når vi måler, "kollapser" bølgefunktionen til én tilstand.

## Kort opsummering

- Kvantepartikler beskrives af bølgefunktioner.
- Inden en måling kan de være i flere tilstande samtidig.
- Måling giver altid ét resultat — men fordelingen af resultater er bestemt af bølgefunktionens form.
```

- [ ] **Step 4: Create `src/content/issues/2026-04/da/universitet.md`**

```markdown
---
readingTimeMinutes: 10
---

For en to-niveau-kvantetilstand er en generel superposition givet ved

$$
|\psi\rangle = \alpha\,|0\rangle + \beta\,|1\rangle,\qquad |\alpha|^2 + |\beta|^2 = 1.
$$

Her er $\alpha$ og $\beta$ komplekse amplituder, og $|\alpha|^2$, $|\beta|^2$ er sandsynligheden for at måle henholdsvis $|0\rangle$ og $|1\rangle$.

## Hilbert-rum og superpositionsprincippet

Kvantetilstande lever i et komplekst Hilbert-rum $\mathcal{H}$. Hvis $|\phi_1\rangle$ og $|\phi_2\rangle$ er tilstande, er enhver lineær kombination

$$
|\psi\rangle = c_1\,|\phi_1\rangle + c_2\,|\phi_2\rangle
$$

også en gyldig tilstand (op til normalisering). Dette er kernen i superpositionsprincippet.

## Måling

Målingens udfald er probabilistisk. Efter en måling i $\{|0\rangle, |1\rangle\}$-basen finder vi systemet i $|0\rangle$ med sandsynlighed $|\alpha|^2$.

## Hvad du skal kunne

- Skrive en to-niveau superposition.
- Forklare kravet om normalisering.
- Beregne målingsandsynligheder fra amplituder.
```

- [ ] **Step 5: Create `src/content/issues/2026-04/da/kandidat.md`**

```markdown
---
readingTimeMinutes: 12
---

For systemer i blandede tilstande — eller når vi er interesserede i delsystemer af sammensatte systemer — er ren-tilstands-formalismen utilstrækkelig. Vi generaliserer til densitetsoperatoren

$$
\rho = \sum_i p_i\,|\psi_i\rangle\langle\psi_i|,\qquad \mathrm{Tr}\,\rho = 1,\ \rho \succeq 0.
$$

En *ren* superposition $|\psi\rangle = \sum_k c_k\,|k\rangle$ svarer til $\rho = |\psi\rangle\langle\psi|$ med $\rho^2 = \rho$, mens $\rho^2 \neq \rho$ karakteriserer en blandet tilstand.

## Koherens og dekohærens

Off-diagonale elementer $\rho_{mn}$ med $m \neq n$ indkoder kvantekohærens. Miljøkobling undertrykker disse eksponentielt,

$$
\rho_{mn}(t) = \rho_{mn}(0)\,e^{-t/\tau_{mn}},
$$

hvilket effektivt reducerer systemet til en klassisk blanding.

## Superposition i relation til målinger

Ifølge projektionspostulatet sker en ideel projektiv måling i basen $\{|k\rangle\}$ som

$$
\rho \mapsto \sum_k P_k\,\rho\,P_k,\qquad P_k = |k\rangle\langle k|.
$$

Delvise målinger og POVM'er generaliserer dette videre.

## Referencer

- Nielsen & Chuang, *Quantum Computation and Quantum Information*, kapitel 2.
- Breuer & Petruccione, *The Theory of Open Quantum Systems*.
```

- [ ] **Step 6: Remove the example fixture**

```bash
rm -rf src/content/issues/_example
```

- [ ] **Step 7: Build the site**

Run: `npm run build`
Expected: exit 0. Generated paths:
- `dist/index.html` (home = April 2026)
- `dist/2026/04/index.html`
- `dist/2026/04/udskoling/index.html`
- `dist/2026/04/gymnasium/index.html`
- `dist/2026/04/universitet/index.html`
- `dist/2026/04/kandidat/index.html`
- `dist/arkiv/index.html`
- `dist/om/index.html`

- [ ] **Step 8: Commit** (skip in sandbox)

```bash
git add src/content/issues/2026-04/
git rm -r src/content/issues/_example
git commit -m "content: seed April 2026 issue (Superposition × 4 levels)"
```

---

## Phase 1 — End-to-end tests

### Task 25: Playwright config + home + reading + podcast tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/home.spec.ts` (replace the stub from Task 18)
- Create: `tests/e2e/reading.spec.ts`
- Create: `tests/e2e/podcast.spec.ts`
- Modify: `.gitignore` (Playwright artifacts)

- [ ] **Step 1: Install browsers**

Run: `npx playwright install --with-deps chromium`
Expected: chromium installed.

- [ ] **Step 2: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } }
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
```

- [ ] **Step 3: Rewrite `tests/e2e/home.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('home shows the latest published issue cover', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Udgave #1/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Superposition' })).toBeVisible();
  await expect(page.getByTestId('read-more')).toBeVisible();
  await expect(page.getByRole('link', { name: /Lyt til podcasten/ })).toBeVisible();
});

test('read-more link targets the gymnasium level by default', async ({ page }) => {
  await page.goto('/');
  const href = await page.getByTestId('read-more').getAttribute('href');
  expect(href).toBe('/2026/04/gymnasium/');
});

test('read-more link respects stored level preference', async ({ page, context }) => {
  await context.addInitScript(() => localStorage.setItem('qp.level', 'universitet'));
  await page.goto('/');
  const href = await page.getByTestId('read-more').getAttribute('href');
  expect(href).toBe('/2026/04/universitet/');
});
```

- [ ] **Step 4: Create `tests/e2e/reading.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('reading page renders title, eyebrow, prose, podcast, and issue nav', async ({ page }) => {
  await page.goto('/2026/04/gymnasium/');
  await expect(page.getByRole('heading', { level: 1, name: 'Superposition' })).toBeVisible();
  await expect(page.getByText(/Udgave #1.*GYMNASIUM/i)).toBeVisible();
  // Podcast slot renders — either embed or pending
  const pending = page.getByTestId('podcast-pending');
  const embed = page.getByTestId('podcast-embed');
  await expect(pending.or(embed)).toBeVisible();
});

test('level switcher navigates to same issue at new level', async ({ page }) => {
  await page.goto('/2026/04/gymnasium/');
  await page.locator('[data-level-switcher]').selectOption('universitet');
  await page.waitForURL('**/2026/04/universitet/');
  await expect(page).toHaveURL(/\/2026\/04\/universitet\/$/);
});
```

- [ ] **Step 5: Create `tests/e2e/podcast.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('podcast renders coming-soon when episodeId is absent', async ({ page }) => {
  // Seed content ships without spotifyEpisodeId.
  await page.goto('/2026/04/gymnasium/');
  await expect(page.getByTestId('podcast-pending')).toBeVisible();
  await expect(page.getByTestId('podcast-embed')).toHaveCount(0);
});
```

- [ ] **Step 6: Add Playwright artifacts to `.gitignore`**

Append:

```
test-results/
playwright-report/
playwright/.cache/
```

- [ ] **Step 7: Run the tests**

Run: `npm run test:e2e`
Expected: all tests pass (Playwright boots a preview server, runs against the real built site).

- [ ] **Step 8: Commit** (skip in sandbox)

```bash
git add playwright.config.ts tests/e2e/ .gitignore
git commit -m "test(e2e): home, reading, podcast specs"
```

---

### Task 26: Playwright archive + mobile + cover palette tests

**Files:**
- Create: `tests/e2e/archive.spec.ts`
- Create: `tests/e2e/mobile.spec.ts`
- Create: `tests/e2e/cover-palette.spec.ts`

- [ ] **Step 1: Create `tests/e2e/archive.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('archive lists the published issue as a linkable card', async ({ page }) => {
  await page.goto('/arkiv/');
  await expect(page.getByRole('heading', { level: 1, name: 'Arkiv' })).toBeVisible();
  const published = page.getByTestId('archive-card-published');
  await expect(published).toHaveCount(1);
  await expect(published).toContainText(/Superposition/);
});
```

- [ ] **Step 2: Create `tests/e2e/mobile.spec.ts`**

```typescript
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] });

test('mobile home: no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const [bodyWidth, viewportWidth] = await page.evaluate(() => [document.body.scrollWidth, window.innerWidth]);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
});

test('mobile reading page: no horizontal overflow', async ({ page }) => {
  await page.goto('/2026/04/gymnasium/');
  const [bodyWidth, viewportWidth] = await page.evaluate(() => [document.body.scrollWidth, window.innerWidth]);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
});
```

- [ ] **Step 3: Create `tests/e2e/cover-palette.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('cover has the palette class from frontmatter', async ({ page }) => {
  await page.goto('/2026/04/');
  // April 2026 issue uses palette: warm
  const cover = page.locator('.cover').first();
  await expect(cover).toHaveClass(/palette-warm/);
});
```

- [ ] **Step 4: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: all tests pass on both desktop and mobile projects.

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add tests/e2e/
git commit -m "test(e2e): archive, mobile overflow, cover palette"
```

---

## Phase 1 — CI and deploy

### Task 27: Lighthouse CI config

**Files:**
- Create: `lighthouserc.json`

- [ ] **Step 1: Create `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview -- --port 4322",
      "url": [
        "http://localhost:4322/",
        "http://localhost:4322/2026/04/",
        "http://localhost:4322/2026/04/gymnasium/",
        "http://localhost:4322/arkiv/"
      ],
      "numberOfRuns": 1,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

- [ ] **Step 2: Run**

Run: `npm run build && npm run test:lhci`
Expected: all assertions pass.

- [ ] **Step 3: Commit** (skip in sandbox)

```bash
git add lighthouserc.json
git commit -m "chore(ci): Lighthouse budgets (perf 90, a11y 95, seo 95)"
```

---

### Task 28: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx astro check
      - run: npm run test:unit
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
        env:
          CI: "true"
      - run: npm run test:lhci
```

- [ ] **Step 2: Commit** (skip in sandbox)

```bash
git add .github/workflows/ci.yml
git commit -m "chore(ci): GitHub Actions — check, unit, build, e2e, lhci"
```

---

### Task 29: Scheduled rebuild workflow

**Files:**
- Create: `.github/workflows/scheduled-rebuild.yml`

- [ ] **Step 1: Create `.github/workflows/scheduled-rebuild.yml`**

```yaml
name: Scheduled rebuild

on:
  schedule:
    # 07:00 Europe/Copenhagen = 05:00 UTC (CET) / 05:00 UTC (CEST shifts to 05:00 UTC — same trigger; CF redeploys daily regardless)
    - cron: "0 5 * * *"
  workflow_dispatch:

jobs:
  trigger-pages-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare Pages deploy hook
        run: |
          if [ -z "${{ secrets.CLOUDFLARE_PAGES_DEPLOY_HOOK }}" ]; then
            echo "CLOUDFLARE_PAGES_DEPLOY_HOOK secret is not configured. Skipping."
            exit 0
          fi
          curl -X POST "${{ secrets.CLOUDFLARE_PAGES_DEPLOY_HOOK }}"
```

- [ ] **Step 2: Commit** (skip in sandbox)

```bash
git add .github/workflows/scheduled-rebuild.yml
git commit -m "chore(ci): daily scheduled Cloudflare Pages rebuild

The deploy-hook URL is a repo secret (CLOUDFLARE_PAGES_DEPLOY_HOOK)
set after the Pages project is created. Until then the workflow no-ops."
```

---

### Task 30: Cloudflare Pages deploy files + runbook

**Files:**
- Create: `public/_headers`
- Create: `public/_redirects`
- Create: `docs/DEPLOY.md`

- [ ] **Step 1: Create `public/_headers`**

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

- [ ] **Step 2: Create `public/_redirects`**

```
# Normalize trailing slashes for the top-level paths Astro serves as directories
/arkiv  /arkiv/  301
/om     /om/     301
```

- [ ] **Step 3: Create `docs/DEPLOY.md`**

```markdown
# Deploy — Cloudflare Pages

## One-time setup

1. Sign in at https://dash.cloudflare.com/ and create a Pages project.
2. Connect the GitHub repository `quantum-physics-demo`.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `20`
4. Production branch: `main`.
5. Create a deploy hook under Pages settings → Builds & deployments → Deploy hooks. Copy the URL.
6. Add a GitHub Actions secret `CLOUDFLARE_PAGES_DEPLOY_HOOK` with that URL. The scheduled workflow uses it.
7. (Optional) Add a custom domain later.

## Preview deploys

Every push to a non-main branch gets a preview URL. Every PR gets a comment with the preview link.

## Production

Push to `main`. Cloudflare Pages rebuilds and deploys in ~1–2 minutes.

Future-dated issues go live on their release date thanks to the scheduled rebuild workflow.

## Env vars

None required at MVP.
```

- [ ] **Step 4: Build and verify**

Run: `npm run build && ls dist/`
Expected: `dist/_headers`, `dist/_redirects`, and all generated pages are present.

- [ ] **Step 5: Commit** (skip in sandbox)

```bash
git add public/_headers public/_redirects docs/DEPLOY.md
git commit -m "chore(deploy): Cloudflare Pages headers, redirects, runbook"
```

---

### Task 31: Wire cross-entry validators into the unit test suite

**Files:**
- Create: `tests/unit/content-integrity.test.ts`

This task invokes the validators built in Tasks 4, 5, and 6 against the real `src/content/issues/` tree. If an author ships an issue with a folder/date mismatch, a missing level file, or a duplicate `releaseDate`, the unit tests fail and CI blocks the PR. Tasks 4–6 are pure-function unit tests; this task is the integration bridge.

- [ ] **Step 1: Write the test**

Create `tests/unit/content-integrity.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  assertFolderMatchesReleaseDate,
  assertAllLevelFilesPresent,
  assertUniqueReleaseDates
} from '../../src/lib/validate-issues';

const ISSUES_DIR = join(process.cwd(), 'src', 'content', 'issues');

function parseReleaseDate(yamlPath: string): string {
  const raw = readFileSync(yamlPath, 'utf8');
  const match = /^releaseDate:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m.exec(raw);
  if (!match) throw new Error(`Could not parse releaseDate from ${yamlPath}`);
  return match[1];
}

function collectIssueFolders(): string[] {
  if (!existsSync(ISSUES_DIR)) return [];
  return readdirSync(ISSUES_DIR)
    .filter((name) => !name.startsWith('_'))
    .filter((name) => statSync(join(ISSUES_DIR, name)).isDirectory());
}

function collectAllFiles(folder: string): Set<string> {
  const files = new Set<string>();
  const base = join(ISSUES_DIR, folder, 'da');
  if (!existsSync(base)) return files;
  for (const name of readdirSync(base)) {
    if (name.endsWith('.md')) {
      files.add(`issues/${folder}/da/${name}`);
    }
  }
  return files;
}

describe('content integrity (cross-entry)', () => {
  const folders = collectIssueFolders();

  it('every issue folder has an index.yaml whose year/month matches the folder name', () => {
    for (const folder of folders) {
      const yamlPath = join(ISSUES_DIR, folder, 'index.yaml');
      expect(existsSync(yamlPath)).toBe(true);
      const releaseDate = parseReleaseDate(yamlPath);
      expect(() => assertFolderMatchesReleaseDate(folder, releaseDate)).not.toThrow();
    }
  });

  it('every issue has all 4 required Danish level files', () => {
    for (const folder of folders) {
      const files = collectAllFiles(folder);
      expect(() => assertAllLevelFilesPresent(folder, 'da', files)).not.toThrow();
    }
  });

  it('no two issues share a releaseDate', () => {
    const issues = folders.map((folder) => ({
      folder,
      releaseDate: parseReleaseDate(join(ISSUES_DIR, folder, 'index.yaml'))
    }));
    expect(() => assertUniqueReleaseDates(issues)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm run test:unit`
Expected: PASS (assuming seed content from Task 24 is in place; all three checks pass for April 2026).

- [ ] **Step 3: Sanity-check the test catches a break**

Temporarily rename `src/content/issues/2026-04/da/kandidat.md` to `kandidat.md.bak`.

Run: `npm run test:unit`
Expected: FAIL — "Issue 2026-04 (da) is missing level files: kandidat".

Restore the file by renaming `kandidat.md.bak` back to `kandidat.md`.

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 4: Commit** (skip in sandbox)

```bash
git add tests/unit/content-integrity.test.ts
git commit -m "test(content): cross-entry validation integrates tasks 4-6 validators"
```

---

## Completion criteria

- `npm run test:unit` passes (unit tests for validators + issue numbering + latest-issue resolver + cross-entry integrity).
- `npm run build` succeeds with the April 2026 issue rendered at `/`, `/2026/04/`, and all four `/2026/04/<level>/` paths.
- `npm run test:e2e` passes on both `desktop` and `mobile` projects.
- `npm run test:lhci` passes with performance ≥ 0.9, a11y ≥ 0.95, SEO ≥ 0.95.
- GitHub Actions CI runs all of the above on every PR.
- Site is deployed to Cloudflare Pages at a preview URL.
- Scheduled-rebuild workflow exists (no-ops until the deploy-hook secret is set).

## Author responsibilities after launch

- Write real Danish prose for Superposition (April 2026 issue).
- Write `/om/` content.
- Add `spotifyEpisodeId` to `2026-04/index.yaml` when the podcast episode is released.
- Each subsequent month: drop a new `src/content/issues/YYYY-MM/` folder (with `index.yaml` and 4 Markdown files), push to `main`. Cloudflare rebuilds automatically.
- Backfill older podcasts anytime by dropping `YYYY-MM/` folders with past dates — archive and issue numbers adjust automatically.
- Set up Cloudflare Pages project and the `CLOUDFLARE_PAGES_DEPLOY_HOOK` GitHub secret for the scheduled rebuild.
