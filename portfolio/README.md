# Portfolio

Bilingual (es/en) static portfolio of Cristhian Agamez, built as a pixel-art quiz show with SvelteKit 2. A recruiter view and downloadable CV PDFs are generated from the same content.

## Develop

```sh
npm install
npm run dev
npm run build
```

## Tests

```sh
npx vitest run
npx playwright test   # run `npm run build` first
npx svelte-check
```

## Content

All copy lives in `src/lib/content`. After editing it run `npm run build && npm run cv` (and `npm run og` after intro visual changes) and commit the regenerated files.

## Deploy

Vercel, configured in `vercel.json`.
