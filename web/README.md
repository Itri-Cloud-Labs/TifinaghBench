# TifinaghBench website

The public site for TifinaghBench, in English and French: the leaderboard, a page per run, Compare, Methodology, Dialects and Run it. It is a static [TanStack Start](https://tanstack.com/start) site, prerendered at build time from the exported runs in [`../results/`](../results).

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in dist/client
npm test           # statistics tests, including a check against every summary.json
npm run typecheck
```

Requires Node 22.13 or later.

TifinaghBench is a project by [Itri Cloud Labs](https://ic-labs.cloud).

## How the data gets in

- `src/data/runs.ts` reads every `results/*/{summary,config,run}.json` at build time and validates it with zod (`src/data/schema.ts`). A malformed export fails the build.
- `src/data/stats.ts` recomputes the scores from the per-cell counts and adds the 95% intervals, ties and tiers. The method is written up in `content/{en,fr}/ranking.md`, which the Methodology page shows.
- A run counts as official when its setup matches `officialSetup` in `stats.ts`. Other runs stay on the leaderboard, marked with the setup differences.
- `vite.config.ts` lists the pages to prerender, one model page per results folder in each language.

## Adding a run

1. Export it with `--export-public` into `results/<run folder>` (see [Run it](../README.md#quick-start)).
2. If the model is new, add its display name and lab to `src/data/models.ts`. The build warns about unknown models.
3. Run `npm run build`.

## Content

- `content/en/methodology.md` and `content/fr/methodology.md` are the site's copies of [`docs/methodology.md`](../docs/methodology.md). Update both when the methodology changes. The site copies use placeholders where the docs quote dictionary words.
- All interface text lives in `src/i18n/en.ts` and `src/i18n/fr.ts`.
- `md-plugin.ts` turns `*.md?html` imports into HTML at build time, with KaTeX for formulas.

## The no-words rule

The dictionaries are not published, so the site never shows dictionary words, answers or example mistakes. Tifinagh appears only as single letters, on the Dialects page. `scripts/postbuild.mjs` fails the build if any run of two or more Tifinagh letters reaches `dist/client`. The only exception is a letter followed by the labialization mark ⵯ.

## Deploying

Upload `dist/client` to any static host. Pages use folder indexes (`/en/compare/index.html`), and `404.html` is served for missing paths. The 404 page ships without the app bundle, because hosts serve it at whatever URL was missed.

## Design

The visual system ("Kabyle and Rif painted pottery") is recorded in [`../DESIGN.md`](../DESIGN.md). The product brief is in [`../PRODUCT.md`](../PRODUCT.md).
