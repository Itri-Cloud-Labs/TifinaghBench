---
version: 1
slug: "web-src-routes-index-tsx"
primary_target: "web/src/routes/index.tsx"
related_targets: ["web/src"]
---

## Scope and mode

The TifinaghBench public site (`web/`), led by the leaderboard home. Mode: **Operate** for the leaderboard, model and compare pages; **Read** for methodology, dialects and run-it pages, which share the same world. Audience, job and constraints: see PRODUCT.md.

## Direction contract

THESIS: Honest ranking. Models are grouped into statistically distinct tiers, each tier a register set apart by a painted band, instead of the category default: a flat table ranked to 0.1-point precision the data cannot support.

OWN-WORLD: Kabyle and Rif hand-painted pottery, translated to a working screen. Cool kaolin-white slip ground; fired-clay red owns the shell (header rail, footer); manganese brown-black ink for text and linework; red ochre and yellow ochre as the two data hues. Crisp SVG geometric friezes (chevrons, lozenges) used only as tier dividers and the wordmark. Archivo, tabular figures; Noto Sans Tifinagh for the script. 2px corners, hairline rules, no shadows. Dark theme: manganese ground, slip-white ink, same clay and ochres re-stepped.
Raises (from declined challengers): star atlas: one fixed ochre ramp for every score; gate board: rows keep identity when re-sorted (animated in place); botanical folio: every score chart on a fixed 0–100 scale; goods catalog: every model page carries the same fixed furniture.

STORY: The visitor sees who leads, that the top two are a tie, and that every model reads the script but few know the words; then drills into a model, compares, or reads how it is measured.

FIRST VIEWPORT: Clay-red header rail: ⵣ TifinaghBench wordmark, nav (Leaderboard, Compare, Methodology, Dialects, Run it), language and theme switches, GitHub. Below on slip: headline question (~2.5rem) left, two computed facts right. Filter row (strict toggle, lab, harness, different-setup toggle). Then the leaderboard table, tier bands drawn between tiers, interval whiskers in each row; first two tiers visible above the fold at 1440×900. Primary actions: model rows (links), Compare.

FORM: Kabyle/Rif painted pottery, candidate 7 of 7 on the grounded list; seed:69ea7052a0b1f99a

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

Tier friezes: the painted band between tiers is the statistical gap made visible; re-sorting animates rows in place.

## Unresolved

- Session ran without the decision page: the user said "just build it", so the assigned direction was built unattended.

ADAPTATIONS (after finish review):
- Different-setup toggle omitted until a run on a different setup exists. Every published run uses the official setup, so the toggle would filter nothing; such runs already appear on the main board with a SetupBadge, per the user's decision. Add the toggle with the first off-setup run.
- Compare slot colours use glaze colours (clay, copper green, ochre, manganese violet) instead of only red/yellow ochre: a strict red–black–ochre set of four fails all-pairs colour-vision separation.
- Below 640px the scatter becomes one 0–100 line per run with both scores (the STORY gap), and the model heatmap stacks tasks under each dialect.
