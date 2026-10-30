# EN VIVO DESDE PRODUCCIÓN — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Cristhian's portfolio as a static, bilingual pixel-art quiz show with a recruiter mode and a generated CV.

**Architecture:** SvelteKit fully prerendered (`adapter-static`) with `/es` and `/en` routes. One typed content module feeds the game, recruiter mode and the CV, so facts live in one place. Game rules are a pure TypeScript engine; Svelte components only render state and send responses. HD-2D look and era evolution are CSS (layers, filters, palette tokens) over the approved PixelLab host sprite.

**Tech Stack:** SvelteKit 3.x, Svelte 5 (runes), TypeScript, Vite, Vitest 5 + @testing-library/svelte, Playwright (+ @axe-core/playwright) for e2e and CV PDF rendering, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-30-quiz-show-portfolio-design.md` and `docs/superpowers/specs/2026-10-30-quiz-content-draft.md`. Executors read both.

## Global Constraints

- All paths are relative to `portfolio/` (the git root is its parent, `CristhianAC/`).
- Work on branch `feat/quiz-show-portfolio`; never commit to `main`.
- Commit messages: Conventional Commits, no `Co-Authored-By` or AI attribution lines.
- Node ≥ 22. Package manager: npm.
- Bilingual: every user-facing string exists in `es` and `en`; routes `/es/...` and `/en/...` are prerendered.
- No losing: a wrong answer shows the anecdote and the game continues.
- Recruiter mode reachable from every screen in one click.
- Brand tokens: red `#bf0000`, red-lift `#e01a1a`, red-deep `#8f0000`, ink `#08070a`, paper `#f4f2ef`. Fonts: Red Hat Display + Source Code Pro.
- Pixel art scaled with `image-rendering: pixelated` only.
- Respect `prefers-reduced-motion`: no bob, shake, flicker or animated transitions.
- No backend, no analytics, no new PixelLab generations in this plan.
- Facts come only from the spec section 6 and the content draft; wording may be polished, facts may not change.
- Sound: none in v1 (spec allows optional; Claude's call: skip).

## Review Focus

1. **Keyboard-only and screen-reader play** — every mechanic, including "order the timeline", must be completable without a mouse (move-up/move-down buttons, not drag only). Test in Task 6.
2. **No JavaScript** — `/es/recruiter` and `/en/recruiter` must show all facts and projects in the prerendered HTML. Test in Task 4.
3. **Lifeline on a question it does not fit** — `blame` on a non-choice question returns `null` and the button is disabled; nothing throws. Test in Task 3.
4. **Narrow phone (360×640)** — game and recruiter pages have no horizontal scroll and all answer controls are visible. Test in Task 9.
5. **Reduced motion** — with `prefers-reduced-motion: reduce`, the host does not bob and no CSS animation runs. Test in Task 5.

---

## File Structure

```
portfolio/
  package.json, svelte.config.js, vite.config.ts, playwright.config.ts, vercel.json, .gitignore
  static/sprites/host/{south,east,...}.png      # moved from assets/sprites/cristhian-host/Idle/rotations
  static/cv/cristhian-agamez-cv-{es,en}.pdf     # generated (Task 8), committed
  scripts/build-cv.ts
  src/app.html, src/app.css                     # tokens, fonts, base
  src/params/locale.ts
  src/lib/i18n.ts                               # Locale, L, t(), ui strings
  src/lib/content/types.ts                      # content model
  src/lib/content/profile.ts                    # facts, experience, education, links
  src/lib/content/projects.ts
  src/lib/content/rounds.ts                     # 6 rounds, 12 questions
  src/lib/content/content.test.ts
  src/lib/game/engine.ts, engine.test.ts        # pure rules
  src/lib/components/stage/{Stage,Host,PipelineLadder}.svelte, eras.css
  src/lib/components/mechanics/{Choice,TrueFalse,OrderTimeline,SpotLine,MatchPairs,CtaChoice}.svelte
  src/lib/components/mechanics/mechanics.test.ts
  src/lib/components/{Lifelines,AnecdoteCard,RecruiterButton,LangSwitch}.svelte
  src/lib/components/recruiter/RecruiterView.svelte   # shared by /recruiter and /cv
  src/routes/+layout.ts, +page.ts (redirect / → /es)
  src/routes/[lang=locale]/+layout.svelte, +layout.ts, +page.svelte (game)
  src/routes/[lang=locale]/recruiter/+page.svelte
  src/routes/[lang=locale]/cv/+page.svelte       # print layout, source for PDF
  e2e/*.spec.ts
```

---

### Task 1: Scaffold, branch and locale routing

**Files:**
- Create: `package.json`, `svelte.config.js`, `vite.config.ts`, `playwright.config.ts`, `.gitignore`, `src/app.html`, `src/app.css`, `src/params/locale.ts`, `src/lib/i18n.ts`, `src/routes/+layout.ts`, `src/routes/+page.ts`, `src/routes/[lang=locale]/+layout.ts`, `src/routes/[lang=locale]/+layout.svelte`, `src/routes/[lang=locale]/+page.svelte` (placeholder title), `e2e/routing.spec.ts`
- Move: `assets/sprites/cristhian-host/Idle/rotations/*.png` → `static/sprites/host/`; delete `assets/`

**Interfaces:**
- Produces: `type Locale = 'es' | 'en'`; `type L = Record<Locale, string>`; `const locales: Locale[]`; `t(value: L, lang: Locale): string`; `ui: Record<string, L>` (UI strings, extended by later tasks); `match(param: string): param is Locale` in `src/params/locale.ts`. Layout load returns `{ lang: Locale }`.

- [ ] **Step 1:** `git switch -c feat/quiz-show-portfolio` from `CristhianAC/`. Commit the already-deleted old site plus the two spec docs: `git add -u portfolio && git add portfolio/docs` → `chore: remove old astro portfolio and add quiz show spec`. Do not stage `../.DS_Store`.
- [ ] **Step 2:** Scaffold SvelteKit (TypeScript, Vitest, Playwright) with `npx sv create` into `portfolio/` (minimal template); switch to `@sveltejs/adapter-static` with `prerender = true` in `src/routes/+layout.ts` and `trailingSlash = 'never'`. `.gitignore` adds `.superpowers/`, `build/`, `.svelte-kit/`, `test-results/`.
- [ ] **Step 3: Write the failing test** `e2e/routing.spec.ts`:
  - `GET /` ends on `/es`.
  - `/es` has `<html lang="es">` and `/en` has `lang="en"`.
  - `/fr` returns 404.
- [ ] **Step 4:** Run `npx playwright test e2e/routing.spec.ts` → FAIL.
- [ ] **Step 5:** Implement `locale.ts` matcher, `[lang=locale]/+layout.ts` with `entries = () => [{lang:'es'},{lang:'en'}]`, root `+page.ts` `redirect(307, '/es')`, and set `lang` on `<html>` via `%lang%` in `app.html` + `transformPageChunk` in `hooks.server.ts` (create it).
- [ ] **Step 6:** Run `npm run build && npx playwright test e2e/routing.spec.ts` → PASS; `build/es.html` and `build/en.html` exist.
- [ ] **Step 7:** Commit `feat: scaffold sveltekit static site with es/en routing`.

---

### Task 2: Content model and data

**Files:**
- Create: `src/lib/content/types.ts`, `profile.ts`, `projects.ts`, `rounds.ts`, `content.test.ts`

**Interfaces:**
- Consumes: `L`, `Locale` from Task 1.
- Produces (in `types.ts`):

```ts
export type Era = 'cap01' | 'cap02' | 'cap03' | 'cap04' | 'cap05' | 'final';
type Base = { id: string; anecdote: L; duckHint: L; readme: L; unlocks: string[] };
export type Question = Base & (
  | { kind: 'choice'; prompt: L; options: L[]; answer: number }
  | { kind: 'truefalse'; statement: L; answer: boolean }
  | { kind: 'order'; prompt: L; items: L[] }            // items listed in the correct order
  | { kind: 'spot'; prompt: L; lines: string[] }         // any line is accepted (content P4)
  | { kind: 'match'; prompt: L; pairs: { left: L; right: L }[] } // correct pairing = same index
  | { kind: 'cta'; prompt: L; ctas: { label: L; href: string }[] }
);
export type Round = { code: 'CAP-01'|'CAP-02'|'CAP-03'|'CAP-04'|'CAP-05'|'FINAL'; era: Era; age: L; title: L; questions: Question[] };
export type Project = { id: string; name: string; summary: L; stack: string[]; links: { label: L; href: string }[] };
export type Role = { id: string; title: L; org: string; period: string; summary: L };
export type Profile = { name: string; headline: L; location: string; links: { linkedin: string; github: string; undercodes: string };
  experience: Role[]; education: Role[]; teaching: Role[]; certificates: string[]; skills: string[]; awards: L[] };
```
- `profile: Profile`, `projects: Project[]`, `rounds: Round[]` exported from their files.

- [ ] **Step 1: Write the failing tests** `content.test.ts`:
  - `rounds` has 6 rounds with codes in order `CAP-01…CAP-05, FINAL` and exactly 2 questions each (12 total).
  - Every `L` value reachable from `rounds`, `projects`, `profile` has non-empty `es` and `en` (walk objects recursively).
  - `choice`: `0 <= answer < options.length`, `options.length === 4`.
  - At least 3 rounds contain a question whose `kind !== 'choice'`.
  - Last question of `FINAL` is `kind: 'cta'` with hrefs `https://www.linkedin.com/in/cristhianac` and `https://undercodes.net`.
  - Every id in any `unlocks` exists in `projects` or `profile.experience`/`education`/`teaching`.
  - Question ids are unique.
- [ ] **Step 2:** `npx vitest run src/lib/content` → FAIL.
- [ ] **Step 3:** Fill `rounds.ts` from the content draft P1–P12 (mechanics as drafted: P1 choice, P2 truefalse, P3 choice, P4 spot, P5 choice, P6 order, P7 choice, P8 match, P9 choice, P10 truefalse, P11 choice, P12 cta). English is a faithful translation. `duckHint` and `readme` are one sentence each that point at the answer. Fill `profile.ts` from spec §6 and `projects.ts` from spec §6.1 (Procto credits Mateo Guerrero Escobar and tutor Daniel José Romero Martínez).
- [ ] **Step 4:** `npx vitest run src/lib/content` → PASS.
- [ ] **Step 5:** Commit `feat: add bilingual content model and quiz data`.

---

### Task 3: Game engine

**Files:**
- Create: `src/lib/game/engine.ts`, `src/lib/game/engine.test.ts`

**Interfaces:**
- Consumes: `Round`, `Question` from Task 2.
- Produces:

```ts
export type Lifeline = 'duck' | 'readme' | 'blame';
export type Response = number | boolean | number[]; // choice/spot/cta: index; truefalse: boolean; order/match: index array
export type GameState = { round: number; question: number; answered: { id: string; correct: boolean }[];
  used: Lifeline[]; removed: number[]; finished: boolean };
export type Stage = 'build' | 'test' | 'staging' | 'produccion';
export function createGame(): GameState;
export function current(rounds: Round[], s: GameState): Question;
export function isCorrect(q: Question, r: Response): boolean;
export function submit(rounds: Round[], s: GameState, r: Response): { state: GameState; correct: boolean };
export type Reveal = { kind: 'text'; text: L } | { kind: 'removed'; options: number[] };
export function useLifeline(rounds: Round[], s: GameState, l: Lifeline): { state: GameState; reveal: Reveal } | null;
export function stage(s: GameState, total: number): Stage;
```

- [ ] **Step 1: Write the failing tests:**
  - `createGame()` → `{round:0, question:0, answered:[], used:[], removed:[], finished:false}`.
  - `isCorrect`: choice index match; truefalse equality; order correct only for `[0,1,…,n-1]`; spot always `true`; match correct only for identity array; cta always `true`.
  - `submit` with a wrong answer: `correct === false`, state advances to next question, `answered` gets `{id, correct:false}` (no losing).
  - `submit` on the 2nd question of a round moves to `round+1, question 0` and clears `removed`.
  - `submit` on the last question sets `finished: true`; further `submit` returns the same state unchanged.
  - `useLifeline('blame')` on a choice question returns `removed` with exactly 2 wrong indices (the two lowest wrong indices) and never the answer; on a non-choice question returns `null`.
  - `useLifeline('duck')` returns `{kind:'text', text: q.duckHint}`; `readme` returns `q.readme`.
  - Each lifeline works once: second call with the same lifeline returns `null`.
  - `stage`: 0–2 answered → `build`, 3–5 → `test`, 6–8 → `staging`, ≥9 → `produccion` (total 12; thresholds = `floor(total/4)` multiples).
- [ ] **Step 2:** `npx vitest run src/lib/game` → FAIL.
- [ ] **Step 3:** Implement the functions in `engine.ts` as pure functions (return new objects, never mutate input).
- [ ] **Step 4:** `npx vitest run src/lib/game` → PASS.
- [ ] **Step 5:** Commit `feat: add pure quiz game engine`.

---

### Task 4: Recruiter mode

**Files:**
- Create: `src/lib/components/recruiter/RecruiterView.svelte`, `src/lib/components/RecruiterButton.svelte`, `src/lib/components/LangSwitch.svelte`, `src/routes/[lang=locale]/recruiter/+page.svelte`, `e2e/recruiter.spec.ts`
- Modify: `src/routes/[lang=locale]/+layout.svelte` (header with `RecruiterButton` + `LangSwitch` on every page), `src/lib/i18n.ts` (UI strings)

**Interfaces:**
- Consumes: `profile`, `projects`, `t`, `Locale`.
- Produces: `<RecruiterView lang={Locale} print={boolean} />` (reused by Task 8). `<RecruiterButton lang />` links to `/{lang}/recruiter`. `<LangSwitch lang path />` links to the same page in the other locale.

- [ ] **Step 1: Write the failing test** `e2e/recruiter.spec.ts` with `javaScriptEnabled: false`:
  - `/es/recruiter` contains "Cristhian Agamez", "UnderCodes", "Procto", "ngx-gaia-gis", "My Little Venture", "hiberus", and a link to `/cv/cristhian-agamez-cv-es.pdf`.
  - `/en/recruiter` shows the English headline and links to `-en.pdf`.
  - From `/es` (game), a link with accessible name "Modo reclutador" reaches `/es/recruiter` in one click.
  - Page has exactly one `<h1>` and sections use `<h2>`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement `RecruiterView`: summary, experience, projects (with links), education, teaching, certificates, skills, awards, contact, CV download. Plain semantic HTML; brand tokens; no animation.
- [ ] **Step 4:** `npm run build && npx playwright test e2e/recruiter.spec.ts` → PASS.
- [ ] **Step 5:** Commit `feat: add recruiter mode page`.

---

### Task 5: Stage, host and era visuals

**Files:**
- Create: `src/lib/components/stage/Stage.svelte`, `Host.svelte`, `PipelineLadder.svelte`, `eras.css`, `src/lib/components/stage/stage.test.ts`, `e2e/motion.spec.ts`

**Interfaces:**
- Consumes: `Era`, `Stage` type, `L`.
- Produces:
  - `<Stage era={Era} compiled={number} total={number}>{children}</Stage>` — renders `total` set pieces; pieces with index `< compiled` have class `compiled`, others `wireframe`. Root has `data-era={era}`.
  - `<Host line={string} talking={boolean} direction?="south" />` — sprite `/sprites/host/{direction}.png` at an integer scale (3× desktop, 2× ≤480 px), speech bubble with `aria-live="polite"`.
  - `<PipelineLadder stage={Stage} commits={number} lang />` — four steps `build → test → staging → producción`, current one `aria-current="step"`.

- [ ] **Step 1: Write the failing tests** (`stage.test.ts`, testing-library):
  - `Stage` with `compiled=3,total=12` → 3 `.compiled` and 9 `.wireframe` pieces; root `data-era="cap01"`.
  - `PipelineLadder stage="staging"` → the "staging" item has `aria-current="step"`.
  - `Host` renders `img` with `alt` "Cristhian" and the bubble text.
  `e2e/motion.spec.ts`: with `reducedMotion: 'reduce'`, every element's computed `animation-name` on `/es` is `none`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. Set pieces are inline SVG pixel shapes (`shape-rendering="crispEdges"`), no new sprites. `eras.css` defines per-`data-era` palette and filters: `cap01` low-color/dither + scanlines, `cap02`–`cap04` progressively richer palette, `cap05` warmer light, `final` UnderCodes neon (red glow/bloom via `drop-shadow`/`filter`). HD-2D depth: 3 background layers with blur on the far layer and a vignette. All animation inside `@media (prefers-reduced-motion: no-preference)`.
- [ ] **Step 4:** Run vitest + motion e2e → PASS.
- [ ] **Step 5:** Commit `feat: add stage, host and era visuals`.

---

### Task 6: Answer mechanics and lifelines UI

**Files:**
- Create: `src/lib/components/mechanics/{Choice,TrueFalse,OrderTimeline,SpotLine,MatchPairs,CtaChoice}.svelte`, `mechanics.test.ts`, `src/lib/components/Lifelines.svelte`

**Interfaces:**
- Consumes: `Question` variants, `Response`, `Lifeline`, `Reveal`.
- Produces: every mechanic takes `{ question, lang, removed?: number[], onanswer: (r: Response) => void }` and calls `onanswer` once. `<Lifelines used={Lifeline[]} available={Record<Lifeline, boolean>} onuse={(l: Lifeline) => void} lang />`.

- [ ] **Step 1: Write the failing tests** (`mechanics.test.ts`):
  - `Choice`: clicking option 2 calls `onanswer(2)`; options listed in `removed` are disabled.
  - `TrueFalse`: buttons "Verdadero"/"Falso" (es) call `true`/`false`.
  - `OrderTimeline`: keyboard only — focus item, press "move up" button, then "Confirmar" → `onanswer` receives the new index order.
  - `SpotLine`: lines are buttons; selecting line 3 → `onanswer(3)`.
  - `MatchPairs`: select left 0 then right 1, … then confirm → index array; works with keyboard.
  - `CtaChoice`: renders links with the two hrefs; clicking one calls `onanswer(index)` and does not prevent navigation.
  - `Lifelines`: used lifeline button is disabled; `available.blame=false` disables "git blame".
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. All controls are native `<button>`/`<a>`; visible focus ring; labels from `ui` strings in `i18n.ts`. Drag-and-drop is optional sugar on top of the buttons.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: add quiz mechanics and lifelines`.

---

### Task 7: Game page wiring

**Files:**
- Create: `src/lib/components/AnecdoteCard.svelte`, `e2e/game.spec.ts`
- Modify: `src/routes/[lang=locale]/+page.svelte`, `src/lib/i18n.ts`

**Interfaces:**
- Consumes: everything from Tasks 2, 3, 5, 6.
- Produces: the playable game at `/{lang}`.

Flow: intro screen (title "EN VIVO DESDE PRODUCCIÓN" / "LIVE FROM PRODUCTION", host greets, "Empezar"/"Start" + recruiter link) → per question: host reads prompt, mechanic, lifelines → after submit: correct → short "compilado" message; wrong → `AnecdoteCard` with `anecdote`, then "Seguir"/"Continue" → Stage `compiled` = `answered.length`, ladder from `stage()` → round change shows `CAP-0N` title card → FINAL `cta` question → end screen with the SYSTEM message and both CTAs. State lives in a `$state` holding `GameState`; no persistence (reload restarts — Claude's call).

- [ ] **Step 1: Write the failing test** `e2e/game.spec.ts`:
  - Play all 12 questions picking the first available option each time (keyboard where needed); every wrong answer shows an anecdote and the game reaches the end screen with links to LinkedIn and undercodes.net.
  - Using "git blame" on P1 disables two options.
  - Ladder ends at "producción".
  - Same run passes on `/en`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement the page.
- [ ] **Step 4:** `npm run build && npx playwright test e2e/game.spec.ts` → PASS.
- [ ] **Step 5:** Commit `feat: wire playable quiz show`.

---

### Task 8: CV pages and PDFs

**Files:**
- Create: `src/routes/[lang=locale]/cv/+page.svelte`, `scripts/build-cv.ts`, `static/cv/cristhian-agamez-cv-es.pdf`, `static/cv/cristhian-agamez-cv-en.pdf`, `e2e/cv.spec.ts`
- Modify: `package.json` (script `"cv": "npm run build && tsx scripts/build-cv.ts"`)

**Interfaces:**
- Consumes: `RecruiterView` with `print={true}`.
- Produces: two committed PDFs linked from recruiter mode.

- [ ] **Step 1: Write the failing test** `e2e/cv.spec.ts`: `/cv/cristhian-agamez-cv-es.pdf` and `-en.pdf` respond 200 with `application/pdf` and size > 20 KB; `/es/cv` contains the same experience entries as `/es/recruiter`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement `/[lang]/cv` (A4 print CSS, no header/game chrome, `noindex`) and `build-cv.ts`: serve `build/` with `vite preview`, open `/es/cv` and `/en/cv` in Playwright Chromium, `page.pdf({ format: 'A4', printBackground: true })` into `static/cv/`. (Claude's call: PDFs are generated by script and committed, not built on Vercel.)
- [ ] **Step 4:** `npm run cv && npm run build && npx playwright test e2e/cv.spec.ts` → PASS. Open both PDFs and check 1–2 pages, no clipped text.
- [ ] **Step 5:** Commit `feat: generate bilingual cv pdfs from content`.

---

### Task 9: SEO, accessibility, mobile and deploy config

**Files:**
- Create: `vercel.json`, `static/robots.txt`, `src/routes/sitemap.xml/+server.ts`, `e2e/quality.spec.ts`
- Modify: `src/routes/[lang=locale]/+layout.svelte` (meta), `package.json` (devDep `@axe-core/playwright`)

**Interfaces:**
- Consumes: all pages.
- Produces: deployable site for `cristhianac.dev`.

- [ ] **Step 1: Write the failing test** `e2e/quality.spec.ts`:
  - Each of `/es`, `/en`, `/es/recruiter`, `/en/recruiter`: has `<title>`, meta description, `og:title`, `og:image`, `<link rel="alternate" hreflang="es|en|x-default">`, canonical on `https://cristhianac.dev`.
  - axe reports 0 violations of impact `serious` or `critical` on those 4 pages.
  - At viewport 360×640: `document.documentElement.scrollWidth <= 360` on the game and recruiter pages, and the first question's answer controls are within the viewport after scrolling them into view.
  - `/sitemap.xml` lists the 4 URLs.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement meta (OG image = a static 1200×630 PNG composed from the host sprite on the stage, made with code, saved to `static/og.png`), sitemap (prerendered), robots, `vercel.json` with `"cleanUrls": true` and long cache headers for `/sprites/*`.
- [ ] **Step 4:** `npm run build && npx playwright test` (whole suite) and `npx vitest run` → all PASS.
- [ ] **Step 5:** Commit `feat: add seo, a11y checks and vercel config`.
