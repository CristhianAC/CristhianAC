# EN VIVO DESDE PRODUCCIÓN — Quiz Show Portfolio

Design document · 2026-10-30 · Status: draft for approval

## 1. Intent

Cristhian Agamez's personal portfolio (cristhianac.dev) is rebuilt from scratch as an original
pixel-art TV quiz show called **"EN VIVO DESDE PRODUCCIÓN"** ("Live from production").
Cristhian is the host. The visitor is the contestant. Answering questions about Cristhian's
life "compiles" his portfolio: each answer adds a piece of the set and unlocks a real
portfolio item (project, role, skill, story).

Why: the previous Astro "macOS desktop" portfolio was deleted (2026-10-30). Cristhian wants
something gamified and dynamic that shows personality, carries the UnderCodes brand tone,
and still works as a serious portfolio for recruiters and clients.

Success: a visitor finishes the show (or skips via recruiter mode), remembers something
specific about Cristhian, and clicks one of the two final CTAs (LinkedIn or undercodes.net).

## 2. Goals

- Original game show concept. It must not read as a "Who Wants to Be a Millionaire" clone.
- Tells Cristhian's real story in chronological "chapters" (life eras).
- Every portfolio fact a recruiter needs is reachable, both inside the game and in recruiter mode.
- Bilingual Spanish / English.
- Works well on mobile and desktop.
- Uses UnderCodes brand colors and tone.

## 3. Non-goals

- Not a full game engine experience (no Godot/Unity web export).
- No backend, accounts, leaderboards or analytics dashboards in v1.
- No blog / CMS in v1.

## 4. Anti-goals (failure even if it "works")

- The visitor can **lose**. There is no losing: a wrong answer reveals an anecdote instead.
- A recruiter must play to find the CV, contact or projects. Recruiter mode is mandatory and
  always one click away.
- Heavy load or bad mobile experience (the reason Godot was rejected).
- Content invisible to search engines or screen readers.
- Generic AI look: it must feel hand-directed and on-brand.

## 5. The show

### 5.1 Format

- Title: **EN VIVO DESDE PRODUCCIÓN** (EN: "LIVE FROM PRODUCTION").
- Host: Cristhian's pixel-art sprite, on stage, delivering the questions.
- The set starts as a **wireframe**. Each answered question "compiles" a part of the set
  (lights, podium, screens, audience) and reveals a portfolio piece.
- **Prize ladder = deployment pipeline**: `build → test → staging → producción`. Progress is
  shown as commits climbing the pipeline instead of money.
- **Lifelines** (one use each):
  - **Rubber duck** — the duck "talks through" the question and hints at the answer.
  - **Leer el README** — shows a short text that contains the answer.
  - **git blame** — removes wrong options by "blaming" them on someone.
- **No losing**: a wrong answer plays an anecdote related to the question, then the show
  continues. The portfolio piece is unlocked either way.

### 5.2 Rounds (life chapters)

Rounds follow Cristhian's life, numbered in UnderCodes style `CAP-0N`. Each round uses a
different mechanic (see 5.3). The art evolves from 8-bit retro in CAP-01 to UnderCodes neon in
the FINAL.

| Round | Age / time | Story beat | Unlocks |
|-------|-----------|------------|---------|
| CAP-01 | 11 | Coding games in Unity with C# courses his mom bought | Origin story, Unity/C# |
| CAP-02 | 13 | HTML/PHP/CSS sites for family businesses | First web work |
| CAP-03 | 16 | Founds Marat Studio (design + PHP/WordPress) | Design background, Codetec, DIGIPRICE |
| CAP-04 | 20 | UnderCodes S.A.S. constituted 18/02/2024 (Barranquilla) | UnderCodes, Olympus Analytics, Uninorte, InNova, teaching |
| CAP-05 | 21 | Exchange in Spain (Universidad de Cantabria, Aug 2025–Sep 2026); expands UnderCodes to Spain; hiberus Full Stack for Banco Santander | International work, Java/Angular/React |
| FINAL | Today | CTO & co-founder My Little Venture; UnderCodes as Odoo Partner | Contact CTAs |

### 5.3 Mechanics per round

Each round must feel different. Four options per question is the default; at least three
rounds use another mechanic. Candidate mechanics (builder picks one per round, see section 10):

- Multiple choice (4 options).
- Order the timeline (drag events into order).
- True / false rapid fire.
- Spot the bug (pick the broken line in a tiny code snippet).
- Match the logo / tech to the project.

### 5.4 Final question and CTAs

The final question routes to contact. It ends with a "SYSTEM" message offering two CTAs:

- **LinkedIn**: "send SYSTEM" to Cristhian on LinkedIn (https://www.linkedin.com/in/cristhianac).
- **undercodes.net**: visit UnderCodes (official Odoo Partner; Odoo + custom software for
  companies that outgrew spreadsheets).

### 5.5 Recruiter mode

- A "Modo reclutador / Recruiter mode" button is visible from the first screen and during play.
- It skips the show and shows a plain, fast, accessible page: summary, experience, projects,
  skills, education, contact, CV download.
- Same content source as the game (no duplicated facts).

## 6. Content (source of truth)

Facts confirmed by Cristhian (2026-10-30):

- Born 18 Dec 2003; Barranquilla, Colombia.
- Systems Engineering, Universidad del Norte, 2021–2026.
- UnderCodes S.A.S.: CEO/founder; constituted 18/02/2024, registered at Cámara de Comercio de
  Barranquilla 26/02/2024; official Odoo Partner; expanded to Spain.
- Olympus Analytics: CTO & co-founder, Jan 2024–present (Artemisa: biodiversity / species control).
- My Little Venture: CTO & co-founder, Dec 2025–present (US kids' financial education; Next.js,
  Strapi, AWS Lambda, DynamoDB, COPPA).
- hiberus: Full Stack developer for Banco Santander, Feb–Aug 2026 (Java, Angular, React).
- Graphic design: Codetec technologist 2019–2020; Senior Graphic Designer at DIGIPRICE Jan–Apr 2021.
- Teaching: peer tutor Uninorte 2023; Diploma in Pedagogy Uninorte 2023–2024; technical
  consultant for the "Digital Business" curriculum at U. Sergio Arboleda 2025.
- InNova (Uninorte): creative director 2022–23, president 2023–24.
- Won Uninorte's first debate tournament (2025).
- Certificates: Python & Django REST API, Flutter UI, logo design (Domestika), Xamarin,
  Angular, Blender, Premiere.
- Loves software architecture.

### 6.1 Portfolio pieces (chosen by Cristhian, 2026-10-30)

| Piece | Source | Public |
|-------|--------|--------|
| **Procto (CheatingAI)** — thesis: online exam proctoring with computer vision (MediaPipe, DeepFace/Facenet), timestamped evidence and a 0–100 risk score, plus code-plagiarism detection (Winnowing, Redis/Celery). FastAPI + SvelteKit 5, Docker Compose, Supabase. With Mateo Guerrero Escobar; tutor Daniel José Romero Martínez. | github.com/CristhianAC/CheatingAI | Yes |
| **ngx-gaia-gis** — Angular 20 library for OpenLayers maps (GeoTIFF rasters, points, polygon drawing), published on npm. | github.com/Olympus-Analytics/ngx-gaia-gis | Yes |
| **UnderCodes website** | undercodes.net (repo private) | Live site |
| **My Little Venture website** | https://mylittleventure.com/ | Live site |
| **Artemisa (Olympus Analytics)** — biodiversity / species control service | https://artemisa.olympus-analytics.dev/ | Live site |
| **Selected GitHub repos** — Claude's pick, pending Cristhian's review: NeoReg (microservices + RAG), KmpMovies (Kotlin Multiplatform), shadow-protocol (UE5 team game), nvim-cristhianac | github.com/CristhianAC | Yes |

Old entries (portfolio site, MIPS Visual Sim) are dropped unless Cristhian says otherwise.
### 6.2 CV

The old CV PDF (`portfolio/public/CV.pdf` in git history) has wrong dates and is not used.
Cristhian asked Claude to generate a new one. It is generated from the same content source as
the game and recruiter mode, in Spanish and English, so the three never disagree. Recruiter mode
offers the PDF matching the current language.

Note: the old config's dates (UnderCodes 2023, Krea & Solventech 2020–2023) conflict with the
facts above. The facts above win.

## 7. Visual direction

- **Style: HD-2D cinematic** (chosen by Cristhian over Hi-Bit 320×180 and 480×270): pixel-art
  sprites on layered 2D sets with depth, lighting, bloom and depth-of-field, like Octopath Traveler.
- **Host sprite (approved)**: `assets/sprites/cristhian-host/Idle/rotations/*.png`, 96×96 px,
  8 directions, low top-down view, black outline. PixelLab character id
  `6d788522-d20e-41de-88d3-1569590687df`. Every new sprite uses it as the style reference.
- Brand tokens (UnderCodes): red `#bf0000`, red-lift `#e01a1a`, red-deep `#8f0000`,
  ink `#08070a`, paper `#f4f2ef`. Fonts: Red Hat Display + Source Code Pro.
- Tone: direct, short, a bit contrarian. Chapters numbered `CAP-0N`.
- Pixel art is scaled with nearest-neighbor only (no smoothing).

## 8. Constraints

- Static site, fast first load on mobile; SEO and accessibility are required.
- Bilingual with prerendered `/es` and `/en` routes.
- Sprites made with PixelLab. The account is on a trial with very few generations left, so the
  asset list must be planned before generating.
- Must respect `prefers-reduced-motion`.
- Deploy: Vercel (used by the previous portfolio).

## 9. Decided "how"

- **Web, not a game engine.** Godot web export was rejected (heavy load, poor mobile, no SEO/a11y).
- **SvelteKit** proposed as the framework (Claude's call during brainstorming, not yet
  contested): static prerender per language, small runtime, good animation story.

## 9b. Claude's calls (pending Cristhian's review)

- **Art evolution is done in code, not with new sprites.** The same host sprite and set pieces
  are restyled per era (palette swap, dithering/scanline filters for CAP-01, bloom/neon glow for
  FINAL). Reason: about 4 PixelLab trial generations remain.
- **Playthrough length: about 3–4 minutes**, 2 questions per round (12 total). Each answer
  compiles one set piece, so the set has about 12 pieces.
- **Host view stays as generated** (low top-down, front-facing "south" rotation on stage).
  Talking/gesture feel comes from code (bob, squash, speech bubble) until more credits exist.

## 10. Left to the builder

- Question text, mechanics and anecdotes are drafted in
  `2026-10-30-quiz-content-draft.md` (gaps filled by Cristhian). The builder translates to English
  and may polish wording; facts must not change.
- How the CV PDF is produced (build-time generation or a committed file rendered once).
- Rendering technique for HD-2D effects (CSS layers vs canvas/WebGL), within the performance
  constraint.
- Sound: optional, off by default.
- Asset list (sets per era, props, lifeline icons, UI), to be approved before spending PixelLab
  generations.
