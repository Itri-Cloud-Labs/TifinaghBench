---
name: TifinaghBench
description: Kabyle and Rif painted pottery on a working screen; an honest leaderboard of LLMs on Amazigh vocabulary in Tifinagh.
colors:
  slip: "#f5f5f2"
  slip-2: "#ecebe6"
  slip-3: "#e2e0d8"
  rule: "#d3cfc4"
  rule-strong: "#b3ab9c"
  ink: "#241a14"
  ink-2: "#5a4c42"
  ink-3: "#75675c"
  mark: "#241a14"
  clay: "#9c3a22"
  clay-deep: "#7c2c18"
  clay-ink: "#f7efe6"
  clay-ink-2: "#f0d7c7"
  link: "#9a3820"
  focus: "#1769aa"
  selection: "#f0d7c7"
  series-1: "#b4432a"
  series-2: "#12876a"
  series-3: "#c08a12"
  series-4: "#5f4a8b"
  ramp-1: "#cfa04e"
  ramp-2: "#ba8636"
  ramp-3: "#94641f"
  ramp-4: "#7a5218"
  ramp-5: "#5c3c10"
  ramp-6: "#3e280a"
  dark-slip: "#18130f"
  dark-slip-2: "#211a15"
  dark-slip-3: "#2b221c"
  dark-rule: "#3b3029"
  dark-rule-strong: "#5c4c40"
  dark-ink: "#efe9e1"
  dark-ink-2: "#c3b6a9"
  dark-ink-3: "#a39587"
  dark-mark: "#efe9e1"
  dark-clay: "#7e2e1b"
  dark-clay-deep: "#5e2213"
  dark-clay-ink: "#f7efe6"
  dark-clay-ink-2: "#ecc9b6"
  dark-link: "#e8987d"
  dark-focus: "#6aa8e6"
  dark-selection: "#5e2213"
  dark-series-1: "#d4503c"
  dark-series-2: "#22a080"
  dark-series-3: "#ab9426"
  dark-series-4: "#9a7ccc"
  dark-ramp-1: "#3a2a14"
  dark-ramp-2: "#5c4118"
  dark-ramp-3: "#82601f"
  dark-ramp-4: "#a98232"
  dark-ramp-5: "#cfa552"
  dark-ramp-6: "#ebcb86"
typography:
  display:
    fontFamily: "'Archivo Variable', 'Archivo', ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  display-compact:
    fontFamily: "'Archivo Variable', 'Archivo', ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Archivo Variable', 'Archivo', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Archivo Variable', 'Archivo', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "'Archivo Variable', 'Archivo', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "'Archivo Variable', 'Archivo', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    fontVariation: "'wdth' 100"
  score:
    fontFamily: "'Archivo Variable', 'Archivo', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: 1.25
    fontFeature: "'tnum' 1, 'lnum' 1"
  label:
    fontFamily: "'Archivo Variable', 'Archivo', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 88"
  tifinagh:
    fontFamily: "'Noto Sans Tifinagh', 'Archivo Variable', sans-serif"
    fontWeight: 400
    letterSpacing: "0"
  mono:
    fontFamily: "ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Menlo, monospace"
    fontSize: "0.875rem"
rounded:
  sm: "2px"
  bar-cap: "4px"
spacing:
  gutter: "20px"
  gutter-wide: "32px"
  row-y: "14px"
  column-gap: "64px"
  page-top: "48px"
  section: "96px"
  container: "84rem"
components:
  header-rail:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.clay-ink}"
    padding: "12px 32px"
  nav-link:
    textColor: "{colors.clay-ink-2}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
    typography: "{typography.body}"
  nav-link-active:
    backgroundColor: "{colors.clay-deep}"
    textColor: "{colors.clay-ink}"
  icon-button-rail:
    textColor: "{colors.clay-ink}"
    rounded: "{rounded.sm}"
    size: "36px"
  icon-button-rail-hover:
    backgroundColor: "{colors.clay-deep}"
  language-switch-current:
    backgroundColor: "{colors.clay-ink}"
    textColor: "{colors.clay}"
    padding: "4px 8px"
  select:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "36px"
    padding: "0 8px"
  button-quiet:
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  button-quiet-hover:
    backgroundColor: "{colors.slip-2}"
  leaderboard-row:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.ink}"
    padding: "14px 16px 14px 0"
  leaderboard-row-hover:
    backgroundColor: "{colors.slip-2}"
  setup-badge:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  model-chip:
    backgroundColor: "{colors.slip-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "36px"
  heatmap-tile:
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    typography: "{typography.score}"
  code-block:
    backgroundColor: "{colors.slip-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "16px"
    typography: "{typography.mono}"
  footer:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.clay-ink-2}"
    padding: "40px 32px"
---

# Design System: TifinaghBench

## Overview

**Creative North Star: "The Painted Register"**

Kabyle and Rif hand-painted pottery, translated to a working screen. The ground is cool kaolin slip; fired-clay red owns the shell (the header rail and the footer, nothing in between); manganese brown-black ink carries text and linework; ochres carry the numbers. Ornament is the potter's frieze: lozenges, sawtooth and hairline rails, drawn as crisp inline SVG, and it appears only where a band means something. Between leaderboard tiers it is the statistical gap made visible, so a change of tier reads as a change of register rather than a rule.

The surface is a research instrument first. Density is that of a well-set table: hairline rules, tabular figures, generous row height (14px vertical padding), no cards, no shadows, 2px corners. Every score on the site sits on a fixed 0 to 100 scale and is coloured from one stepped ochre ramp, so a colour and a bar length mean the same number on every page. The dark theme is the same pot fired the other way: manganese ground, slip-white ink, the clay deepened and the ochres re-stepped light-on-dark.

Tifinagh is treated as a living script, not decoration: it appears as the ⵣ in the wordmark and as single letters of the alphabet, always in Noto Sans Tifinagh with a `lang="zgh"` attribute, never as words.

**Key Characteristics:**
- Clay rail top and bottom, slip ground between; the shell colour never enters content as a fill except in the tier band.
- Painted friezes as meaning-bearing dividers only (tier gaps, header hem, footer, one section break).
- One ochre sequential ramp for every score; four glaze colours only for comparing named runs.
- Flat: hairlines and tonal slip steps, zero shadows.
- Archivo variable with width axis; tabular lining figures for every number.
- Motion is functional: rows slide in place when re-sorted (260ms), hovers fade in 150ms; reduced motion is honoured.

## Colors

A cool slip ground, manganese ink, one fired-clay shell colour, and earth-pigment data colours: ochres for magnitude, glazes for identity.

### Primary
- **Fired Clay** (`clay`): the header rail, footer field and tier-band ground. The single brand fill; it frames content, it does not decorate it. In dark it deepens (`dark-clay`) so the slip-white rail text keeps contrast.
- **Kiln Shadow** (`clay-deep`): hover and active fill on the rail (nav items, icon buttons, language switch). Exists only on clay.
- **Rail Slip** (`clay-ink`) and **Rail Blush** (`clay-ink-2`): text on clay. Rail Slip for the wordmark, active nav and icons; Rail Blush for resting nav links and footer body copy, and the footer frieze tone.
- **Clay Link** (`link`): in-content links, underlined at 40% currentColor, full on hover. Dark: a light terracotta (`dark-link`).

### Secondary
- **Ochre Ramp** (`ramp-1` to `ramp-6`): the sequential scale for every score, binned at 0, 10, 20, 35, 55, 80. Light runs pale yellow ochre to burnt umber; dark reverses so higher scores are brighter. `ramp-3` is the leaderboard bar fill; `ramp-2` is the ochre heart in the tier band; `ramp-5`/`ramp-2` are correct/partial in grade bars. Text on each bin uses the paired on-ramp colour recorded in the sidecar (ink on the two palest light bins, near-white on the rest; reversed in dark).

### Tertiary
- **Glaze Slots** (`series-1` clay red, `series-2` copper green, `series-3` ochre, `series-4` manganese violet): compare-page identity colours for up to four chosen runs, assigned by slot. Validated all-pairs for colour-vision separation in light and dark; they are the only categorical set.

### Neutral
- **Kaolin Slip** (`slip`): page ground and table rows at rest.
- **Wet Slip** (`slip-2`): row hover, code and formula wells, empty heatmap tiles, chosen-model chips.
- **Leather-hard Slip** (`slip-3`): the "wrong" segment in grade bars.
- **Hairline** (`rule`) and **Strong Hairline** (`rule-strong`): row dividers and chart gridlines; table heads, filter-row base, input borders and section tops.
- **Manganese Ink** (`ink`), **Ink 2** (`ink-2`), **Ink 3** (`ink-3`): body text; secondary text and labels; tertiary metadata, intervals and axis ticks. `mark` equals ink and is the stroke/fill for estimate dots and whiskers.
- **Focus Blue** (`focus`): the focus ring only, deliberately outside the pottery palette so it is never mistaken for data.

### Named Rules
**The Shell Rule.** Clay fills the header rail, the footer and the tier band, and nothing else. Content surfaces stay slip.

**The One Ramp Rule.** Any score, anywhere, takes its colour from the six-bin ochre ramp on a fixed 0 to 100 scale. Never rescale to the data range and never introduce a second sequential palette.

**The Glaze-for-Identity Rule.** Series colours identify a chosen run on the compare page; they never encode magnitude, and the ochre ramp never identifies a run.

## Typography

**Display Font:** Archivo Variable (with Archivo, ui-sans-serif, system-ui)
**Body Font:** Archivo Variable, same family
**Script Font:** Noto Sans Tifinagh (falling back to Archivo Variable)
**Mono Font:** ui-monospace stack, for commands and hashes only

**Character:** One grotesque doing every job, tuned by weight and the width axis: headings at 650 with slight negative tracking, labels condensed to 88% width. Plain, exact, research-leaderboard voice; the script face is the only second voice.

### Hierarchy
- **Display** (650, 2.75rem from 640px, 1.15, -0.02em; display-compact at 2.125rem below): one page title per page, balanced wrap.
- **Headline** (650, 1.625rem): section titles (scatter, dialects, methodology prose h2 with a hairline above).
- **Title** (650, 1.3125rem): secondary section heads; the same size is the in-row score figure at weight 600.
- **Lede** (400, 1.125rem, ink-2): the paragraph under each page title, 58 to 60ch.
- **Body** (400, 1rem, 1.55): running text, pretty wrap; prose capped at 70ch. Table cells drop to 0.875rem.
- **Label** (600, 0.75rem, 0.04em, uppercase, width 88, ink-2): column heads, filter field names, definition terms, task names in the heatmap, contents list heading. It names data; it is not a headline device.
- **Tifinagh** (400, tracking 0): wordmark ⵣ (1.65rem in the rail) and single alphabet letters at base, xl and 3xl sizes.

### Named Rules
**The Tabular Rule.** Every number (scores, intervals, ranks, counts, codepoints) is set with tabular lining figures and right-aligned or fixed-width so columns scan.

**The Labels-Name-Data Rule.** Uppercase label type sits on a table head, field, term or chart axis. It never sits above a page or section headline as a kicker.

**The Script-as-Letters Rule.** Tifinagh appears only as the alphabet's single letters and the ⵣ mark, always in Noto Sans Tifinagh under `lang="zgh"`. No dictionary words, ever (enforced at build by `web/scripts/postbuild.mjs`).

## Layout

One centred container (max 84rem) with 20px gutters, 32px from 640px. Pages open with a title block 48px below the rail; major sections are separated by 96px. Two-column compositions use asymmetric fractional grids (roughly 1.15 : 1 on the home intro, 1.5 : 1 for scatter and explanation, 1 : 1.3 on model headers, 1 : 2 on the alphabet) with a 64px column gap, collapsing to one column below 1024px. The leaderboard is a full-width table from 768px with the score column taking 38%; below 768px it becomes a ranked list of stacked entries with the same tier bands between groups. Below 640px the scatter becomes one 0 to 100 line per run carrying both scores, and the model heatmap stacks tasks under each dialect. Long-form pages keep prose at 70ch with a sticky contents rail from 1024px. Navigation collapses to a disclosure menu below 768px.

## Elevation & Depth

Completely flat. There are no shadows anywhere; depth is conveyed by tonal slip steps (slip, slip-2, slip-3) and by hairline rules in two strengths. The clay rail sits at the same plane as content and is separated by its painted sawtooth hem, not by a shadow.

### Named Rules
**The Fired-Flat Rule.** No box-shadow, drop-shadow or blur on any element. Separation is a hairline, a slip step, or a painted band.

## Shapes

Corners are barely softened (2px) on every interactive or contained element: buttons, selects, chips, badges, heatmap tiles, code wells, focus rings, legend swatches. The single exception is the open end of a horizontal data bar, which gets a 4px cap on its right edge only; the baseline end stays square. Dots in charts are true circles (estimate markers with a 2px slip ring). The recurring silhouette is the potter's geometry: lozenge, half-lozenge chevron and sawtooth, always on 24px or 16px repeating tiles between 1px rails.

## Components

### Buttons
Quiet and functional; there is no filled primary button in content.
- **Shape:** 2px corners.
- **Quiet button** (reset filters): 1px strong-hairline border, ink text, 6px 12px padding; hover fills wet slip.
- **Sortable column head:** label type as a button with a sort glyph; hover darkens to ink. Sort state is announced via `aria-sort`.
- **Rail icon buttons:** 36px square, rail-slip icon, kiln-shadow fill on hover. 150ms colour transitions.

### Chips
- **Model chip** (compare picker): 36px tall, wet-slip fill, strong-hairline border, a 12px glaze swatch at the start and a remove control at the end.
- **Setup badge:** 11px semibold ink-2 text in a strong-hairline outline, 2px corners; marks runs on a non-official setup and names what differs on hover and to screen readers.

### Inputs / Fields
- **Select:** 36px tall, slip ground, strong-hairline border, 2px corners, 0.875rem ink text; hover border shifts to ink-3. The field name sits above in label type.
- **Checkbox toggles:** native 16px checkbox tinted by clay `accent-color`, label text inline at 0.875rem.
- **Focus:** a 2px focus-blue outline offset 2px on every focusable element. Caret is clay.

### Navigation
Clay header rail: ⵣ plus the bold TifinaghBench wordmark at left, then text links at 0.875rem/500 in rail blush; hover and the active route take a kiln-shadow fill and rail-slip text. At right: an EN/FR segmented switch (current segment inverted to rail-slip ground with clay text), the theme toggle, GitHub. A sawtooth hem hangs below the rail onto the slip. Below 768px the links move into a disclosure panel with 10px vertical item padding.

### Leaderboard
The signature component. Rows on slip with hairline dividers, wet-slip on hover, the model name linking to its page. Each row carries rank (with `=` for a statistical tie), score in title-size tabular figures over a `± interval` line, and a score bar. When sorted by score descending, a painted tier band separates statistically distinct tiers; in any other sort the bands disappear because tiers only read in their natural order. Re-sorting slides each row from its old position (260ms, cubic-bezier(0.16, 1, 0.3, 1)).

### Score Bar
One run on the fixed 0 to 100 axis: a hairline baseline with ticks at 0, 25, 50, 75, 100, an ochre bar (ramp-3) to the score, the 95% interval as a manganese whisker, and the estimate as a manganese dot ringed in slip. Always labelled for assistive tech.

### Painted Bands
- **Tier band:** 16px clay field tiled every 24px with a slip lozenge holding an ochre heart and ochre half-lozenges at the seams. Only between leaderboard tiers.
- **Frieze:** 14px band of two 1px rails with a filled lozenge and open chevrons, in ink-2 on slip or rail blush on clay (the footer, at 70% opacity). Used as a section break on the dialects page and atop the footer.
- **Hem:** 8px sawtooth of clay triangles hanging under the header rail.
All are decorative and `aria-hidden`.

### Charts
- **Heatmap:** dialect by task tiles (2px corners, min 64px tall) filled from the ochre ramp with the paired on-ramp text colour, score in tabular title figures over a counts line. Transliteration is set apart because it measures the script, not the words. Tiles are focusable.
- **Bars:** label column plus a 0 to 100 track with a strong-hairline origin, ramp-coloured bar with a 4px end cap, tabular value.
- **Grade bars:** one 100% bar per dialect split into correct (ramp-5), partial (ramp-2), wrong (slip-3), failed (ink-3).
- **Ramp legend:** the six bins as 36px swatches with their floors.
- **Scatter:** knowing-the-words against reading-the-script, hairline grid, diagonal reference, interval crosshairs in ink-3, manganese dots with the focused run in clay; below 640px replaced by per-run gap strips.

## Do's and Don'ts

### Do:
- **Do** keep clay to the header rail, footer and tier band, with slip as the only content ground.
- **Do** colour every score from the six-bin ochre ramp with bins at 0, 10, 20, 35, 55, 80, on a fixed 0 to 100 axis.
- **Do** show uncertainty wherever a score appears: the interval whisker on bars, `± value` under scores, `=` on tied ranks.
- **Do** set every number with tabular lining figures.
- **Do** use the painted frieze, tier band and hem as inline SVG at their recorded sizes, only where a band carries meaning.
- **Do** keep corners at 2px and separation to hairlines and slip steps.
- **Do** give Tifinagh text `lang="zgh"` and the Noto Sans Tifinagh face.

### Don't:
- **Don't** add shadows, blurs or elevated cards; this world is fired flat.
- **Don't** use glaze series colours for magnitude or the ochre ramp for identity.
- **Don't** put uppercase label type above a headline as a kicker or eyebrow.
- **Don't** show dictionary words, model answers or example mistakes, in Tifinagh or any script.
- **Don't** draw a tier band in any sort order other than score descending.
- **Don't** ship raster ornament or raster icons; ornament, icons and the favicon are SVG, icons on a 20px grid with a 1.6 stroke and round caps.
- **Don't** use focus blue for anything but focus.
