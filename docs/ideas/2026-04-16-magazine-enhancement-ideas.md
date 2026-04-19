# Kvantefysik for alle — Enhancement Ideas

- **Date:** 2026-04-16
- **Status:** Brainstorm, unranked for commitment. Ranked within tiers by bang-for-buck.
- **Audience:** The author (solo). Optimized for minimum recurring cost and maximum editorial warmth.

This document proposes concrete enhancements to the MVP defined in the spec. Every idea respects the constraints: no gradients, no AI imagery, Danish-first, static build, tight JS budget, TDD preference, solo author. Ideas are grouped by effort tier. Per-issue recurring cost is called out where relevant — anything above "nil" needs to earn its place.

---

## 1. Quick wins (a weekend or less)

Ranked by bang-for-buck. Each has near-zero recurring cost unless noted.

### 1.1 Per-issue reading progress rule — single SVG line in the margin
**What it is.** A thin horizontal rule at the top of the reading column that fills left-to-right as the reader scrolls, drawn as a 1px serif-ink line (no color shift, no gradient). Pure CSS using `animation-timeline: scroll()` where supported, with a no-op fallback. A second, very faint hairline beneath marks the percentage at which the podcast block sits, so the reader sees "I'm getting close to the audio."
**Why.** Reading depth in long-form gives readers a felt sense of progress without gamifying it. The hairline marker for the podcast is a small editorial gesture that quietly crosslinks formats.
**Effort.** S. ~30 lines of CSS, zero JS on modern browsers.
**Risk.** `animation-timeline` is still uneven in Safari; must degrade silently. Recurring cost: nil.

### 1.2 "Forrige / Næste udgave" strip with topic names, not just arrows
**What it is.** The prev/next-issue footer already exists in the spec. Upgrade it to show the neighbouring topics as typeset teasers: "← Forrige: Bølgefunktionen" and "Næste: Kvanteforvikling →", each with the issue's one-line summary in small serif italic below.
**Why.** Turns navigation into an invitation. The archive backfill plan means readers will often arrive mid-archive; making the neighbours legible is the single cheapest retention win.
**Effort.** S. Pure template change, data is already loaded.
**Risk.** Summary copy length must be constrained (clamp at 2 lines). Recurring cost: nil (summary is written anyway).

### 1.3 Glossary tooltips via `<dfn title>` — zero-JS term hints
**What it is.** Author writes `<dfn title="Den matematiske beskrivelse af en kvantetilstand">bølgefunktion</dfn>` in Markdown. CSS styles `dfn` with a dotted underline and the browser handles the tooltip natively. A small shared `glossary.md` in `src/content/` can centralize definitions; a remark plugin could later auto-wrap known terms on first mention.
**Why.** Danish quantum vocabulary is a real barrier for Udskoling and Gymnasium readers. Tooltips respect the editorial tone (no pop-ups, no modals, no JS).
**Effort.** S for the manual version; M if you add the auto-wrap plugin.
**Risk.** `title` tooltips are not mobile-friendly. Mitigate with a visible `(?)` marker on touch, or a CSS-only tap-to-reveal below the term. Recurring cost: <5 min/issue if done manually on 3–5 terms.

### 1.4 "Kvantefakta" sidebar — one surprising fact per issue
**What it is.** A recurring, typographically distinct sidebar (e.g., narrow column in Universitet/Kandidat, pullquote-style in Udskoling/Gymnasium). One verified, cited fact per issue — the kind of thing a physicist friend would tell you at dinner. Example for Superposition: "Schrödingers kat var oprindeligt tænkt som en kritik, ikke et tankeeksperiment til forsvar."
**Why.** Gives the magazine a signature section readers look for. Cheap to produce and very quotable on social.
**Effort.** S. One `<aside class="kvantefakta">` component with slot content.
**Risk.** Requires author to write one well-turned fact per issue (~10 min). Recurring cost: ~10 min/issue.

### 1.5 Print stylesheet that actually reads like a magazine page
**What it is.** A real `@media print` block: drop chrome, render the serif body at 11pt on A4/Letter, drop cap preserved, podcast block replaced with a short text "Hør episoden: kvantefysikforalle.dk/YYYY/MM" and a QR code generated at build time. One page per level.
**Why.** Danish high-school teachers print things. A legitimately printable version costs nothing to maintain and gives the magazine a life off-screen — a believable editorial touch.
**Effort.** S. One CSS file plus a build-time QR SVG generator (npm package, no runtime).
**Risk.** None. Recurring cost: nil.

### 1.6 Reading-time pill — honest, not rounded up
**What it is.** Reading time calculated from word count using a Danish-tuned WPM (~200 for prose, ~140 for math-dense paragraphs where KaTeX runs). Displayed as "7 min" for Udskoling/Gymnasium and "14 min ved normal tempo, 25 min hvis du regner med" for Universitet/Kandidat.
**Why.** The dual number for technical levels is honest about how quantum physics is actually read. Matches the editorial voice better than a single rounded number.
**Effort.** S. Build-time function over the parsed Markdown AST.
**Risk.** Need a small unit test for math-aware timing. Recurring cost: nil (auto-computed).

### 1.7 Footnote-first KaTeX — inline math, collapsible derivations
**What it is.** For Universitet/Kandidat, keep inline `$…$` but put displayed derivations behind `<details><summary>Vis udledning</summary>…</details>`. Default collapsed on Universitet, default open on Kandidat. Pure HTML, one CSS rule.
**Why.** Universitet readers often want the claim without the derivation; Kandidat readers want both. Same Markdown, different default — a small respect for time.
**Effort.** S. A Markdown convention plus a `<details>` style.
**Risk.** Author has to decide what goes inside `<details>`. Recurring cost: ~5 min/issue.

### 1.8 Signature gesture — CSS-only wave-function ripple at first mention
**What it is.** The first `.bolgefunktion` span in any issue gets a single, one-shot CSS animation: a sinusoidal ripple in the left margin (2 cycles, 1.2s, then stops forever). Respects `prefers-reduced-motion`. Never repeats within the same issue and never runs in other locations — it's a one-time signature, not chrome.
**Why.** A quantum magazine should have exactly one physics-flavored visual delight. Once, discrete, and unmistakably editorial. Never gimmicky because it never repeats.
**Effort.** S. ~40 lines of CSS using `@keyframes` and `:first-of-type`.
**Risk.** Must be opt-in per-issue (a class on the term) so it's used sparingly. Recurring cost: ~1 min/issue (author wraps the term).

### 1.9 "Til næste gang" — one open question at the foot of each level
**What it is.** Every level closes with a short question the author doesn't answer, in italic serif: *"Hvis målingen kollapser tilstanden, hvad sker der så før målingen — hvis noget overhovedet?"*. Not a cliffhanger — a gift for the curious.
**Why.** Gives the magazine a voice. Pairs naturally with the podcast, which can pick up the thread.
**Effort.** S. Frontmatter field `openQuestion: …` plus template slot.
**Risk.** Author must write one per level (4 per issue). Can be shared across levels. Recurring cost: ~10 min/issue.

### 1.10 RSS + Atom feed (deferred in spec, but it's an afternoon)
**What it is.** Build-time Atom feed at `/feed.xml` listing issues newest-first. Linked only from the site footer. Astro has a first-party `@astrojs/rss` package.
**Why.** The spec defers this, but the cost is a single file and it lets power readers track the magazine without accounts or email. The spec's "all easy later adds" might as well be "also now."
**Effort.** S. ~30 lines.
**Risk.** Nil. Recurring cost: nil.

---

## 2. Medium bets (one to two weeks)

### 2.1 Podcast-native integration — chapters, transcript, and timestamped anchors
**What it is.** When `spotifyEpisodeId` is set, also load a sibling `transcript.md` and `chapters.yaml` (optional). Render the transcript under `<details>` below the podcast embed, with chapter anchors `/YYYY/MM/<level>/#t=12:30` that deep-link to the Spotify episode at that timestamp (Spotify supports `?t=` on some surfaces; fall back to a visible timestamp if not). Anchor each in-text phrase that was also discussed in audio with a small superscript "▶ 12:30".
**Why.** This is the one addition that genuinely unifies text and audio, which is the magazine's premise. Readers who listen on walks can jump straight back to the spot they want.
**Effort.** M. Transcript is the hard part — but the author already has the audio, and a Whisper pass produces a rough Danish transcript in ~10 minutes per episode. Build pipeline handles the rest.
**Risk.** Transcript accuracy in Danish is a real concern. Editorial fix-up takes 30–60 minutes. Recurring cost: ~45 min/episode.

### 2.2 Depth continuity — "Læs også dette koncept på [niveau]"
**What it is.** At the bottom of each reading page, surface 2–3 pointers to other issues where this concept reappears. Driven by a `concepts: [superposition, maaling]` tag array per level file, resolved at build time. Deliberately not a search — it's editorial cross-reference.
**Why.** Readers who finish one issue often want "more, but adjacent." This is the curriculum-feel the spec rejected at the top level, reintroduced at the margin where it's honest.
**Effort.** M. Tag schema + a resolver + a template block.
**Risk.** The tag vocabulary needs to be small and curated (~30 concepts, max). Add a build-time check that rejects unknown concept tags. Recurring cost: ~5 min/issue to tag.

### 2.3 Editorial cover system v2 — seven hand-drawn SVG motifs the author authors
**What it is.** Rather than stock illustration or AI (rejected), commission or hand-draw seven abstract motifs (wave, particle trail, measurement arrow, lattice, operator bracket, entangled pair, eigenstate fan). Each is a clean SVG with a single-color stroke. `cover.motif: "wave"` in `index.yaml` selects one; palette drives the stroke color. A typographic cover with an abstract motif sits between "purely typographic" and "photographic illustration."
**Why.** Covers should feel distinct month-to-month without requiring a new illustration every time. A small, curated motif library respects the editorial tone and costs nothing after initial authorship.
**Effort.** M. Drawing time dominates; code is trivial.
**Risk.** Motifs must actually be good. Worth one illustrator day. Recurring cost: nil after initial set.

### 2.4 Reader feedback — a single Danish sentence and a `mailto:`
**What it is.** At the foot of every reading page: "Har du et spørgsmål eller en fejl at pege på? Skriv til [redaktion@domæne.dk](mailto:…?subject=Udgave%20%231%20-%20Superposition)". The subject pre-fills with the current issue, so replies land sorted. No form, no accounts, no service.
**Why.** Community without infrastructure. The pre-filled subject is the whole trick — the author's inbox becomes its own CMS for reader feedback.
**Effort.** S actually (listed here because 2.5 builds on it).
**Risk.** Spam. Use an obfuscated mailto or a small Cloudflare Worker to relay. Recurring cost: triage time only.

### 2.5 "Spørgsmål fra læsere" recurring section, born from 2.4
**What it is.** Once enough reader questions arrive, each issue closes with one selected question and a short answer (100–200 words). Lives in a `questions.md` file per issue; renders as a final sidebar in the Universitet level (where curious readers tend to cluster).
**Why.** Warm, Danish-feeling, and gives the magazine a heartbeat. The monthly cadence carries a visible trace of real people.
**Effort.** M once 2.4 is in place (needs a template + editorial rhythm).
**Risk.** Depends on reader volume. Fallback: author writes a plausible question themselves from friends/podcast listeners. Recurring cost: ~20 min/issue.

### 2.6 Citation ledger — Kandidat-level references rendered as a real bibliography
**What it is.** `references.yaml` per issue listing arXiv IDs, DOIs, and book ISBNs. Build-time renders a small bibliography at the end of Kandidat in a proper serif hanging-indent list. arXiv IDs auto-resolve to a title+authors line (one build-time fetch, cached).
**Why.** Kandidat readers are the harshest critics. Formal references raise the magazine's credibility without raising tone. Also a durable archive asset.
**Effort.** M. The arXiv fetch + cache is the tricky part; keep it an offline script the author runs, not a build step that hits the network.
**Risk.** Reference completeness — not every claim needs a citation. Recurring cost: ~15 min/issue at Kandidat only.

---

## 3. Moonshots (year-two wishlist, probably too much for v1)

### 3.1 Side-by-side level diff
Two columns, same concept at two levels (e.g., Gymnasium and Universitet), synchronized by concept anchors. A reader curious about what changes between depths could toggle a "Sammenlign med Universitet" button on a Gymnasium page and see the corresponding passages beside the current ones. Clever, but demands tight authorial discipline — every level must mark matching concept checkpoints. **Longer project.** Only worth it after a year of issues reveals whether readers actually depth-hop.

### 3.2 Spoken-word snippets, not full episodes
One 45-second audio clip per issue — the author reading the opening paragraph. Native `<audio>` element, no embeds, static MP3 file. Turns the cover page into something the reader can hear in the author's voice even before committing to a full podcast episode. The reason it's a moonshot and not a quick win: good recording + editing is ~30 min/issue, and ongoing maintenance at that pace starts to rival the podcast itself.

### 3.3 A "månedens figur" commissioned from a working physicist
One guest-authored sidebar per issue by a Danish physicist — three sentences, their name, their institution. Turns the magazine into something the Danish physics community will boost. Moonshot because it's ongoing relationship work, not code.

### 3.4 Danish physics-history corner
A recurring sidebar tied to the topic: "Da Niels Bohr først forklarede superposition, sagde han…" — small, cited, local. Beautiful but labor-intensive because the research burden is real. Worth it if the author enjoys it.

### 3.5 Annotated PDF issues
Once a year, collect the twelve issues into an annotated A5 PDF with a short editorial introduction. Sold or given free. Turns monthly ephemera into a year-mark. **Longer project** because the typography for print deserves more care than a `@media print` stylesheet.

---

## 4. Things to deliberately NOT do

### 4.1 Do NOT add search at MVP
The spec already defers it. Search pulls the aesthetic toward "app" and pushes toward faceted UI. With <30 issues, the archive page is the search. Revisit only after ~50 issues or if analytics show people hunting.

### 4.2 Do NOT add comments or per-paragraph annotations
Comments require moderation, accounts or anti-spam, and break the calm tone. Webmentions are tempting but add build complexity for little return when readership is new. The `mailto:` route (idea 2.4) is a strictly better community primitive at this scale.

### 4.3 Do NOT add dark mode before audit
Editorial magazines print on warm cream for a reason. A rushed dark palette turns the design into "another tech blog." If dark mode ships, it has to be separately art-directed — different ink value, different accent temperature, possibly different drop-cap weight. That's a full second design system, not a toggle. Defer until there's a specific reader complaint.

### 4.4 Do NOT add animated SVG physics diagrams across the board
One signature gesture (idea 1.8) is editorial. Multiple animated diagrams look like a science-museum touchscreen. It also invites AI-generated art through the back door. If a diagram is animated, it should be hand-authored SVG + CSS, and each one should be an explicit editorial decision, not a template feature.

### 4.5 Do NOT introduce a tagging/taxonomy UI to readers
Internal concept tags (idea 2.2) are fine because they drive editorial cross-references. But do not expose `/tags/superposition/` pages or a tag cloud. That's archive-hunting UI for a site that isn't deep enough to need it, and it creates pressure to tag consistently forever. Same goes for a "difficulty filter" on the archive — the level switcher already handles that on a per-issue basis.

### 4.6 Do NOT ship a newsletter before there's a reason
The spec defers it. An email list implies delivery obligations (DKIM, list hygiene, unsubscribes, GDPR). RSS (idea 1.10) plus a `mailto:` is enough until a reader actually asks for email.

---

## Themes noticed while writing

1. **The magazine's best moves are cross-format**, not more chrome on the page. The podcast integration (2.1) and the print stylesheet (1.5) both extend the magazine into surfaces the reader already inhabits — walks, classrooms — without adding ongoing work.
2. **Editorial warmth scales better than UI features.** A single good Kvantefakta sidebar (1.4) and a single open question (1.9) do more for return visits than any navigation tweak.
3. **Constraints are doing work.** "No AI imagery" and "no gradients" are forcing a typographic identity that's already rare. Ideas that flirt with breaking those (dark mode done quickly, animated diagrams as templates) are the ones that most quietly erode the product's honesty. The "do not do" list matters as much as the build list.
4. **Solo-author sustainability is the real axis.** Almost every quick win was chosen for zero or near-zero recurring cost. The medium bets all specify their recurring cost deliberately. Anything above ~30 min/issue of ongoing work needs a strong standalone case.
