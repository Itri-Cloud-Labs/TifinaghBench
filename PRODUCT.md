# Product

<!-- impeccable:product-schema 1 -->

> Written by `/impeccable init` from the user's confirmed brief and the repository. The user asked to skip the interview and "just build the site"; facts marked _(inferred)_ were not confirmed in words.

## Platform

web

## Stack

TanStack Start (React) website in `web/`, chosen by the user. Fully static, prerendered from the repository at build time. Hosting and domain: left open by the user ("don't worry about it"); the build must stay host-agnostic.

## Users

- **Primary:** people choosing or evaluating LLMs for Amazigh (Berber) language work: developers, researchers and language activists in Morocco, Algeria and the diaspora _(inferred)_. They want to know which model actually knows Amazigh vocabulary, in which dialect, and how sure that ranking is.
- **Secondary:** model labs and benchmark watchers comparing their models; contributors who want to run the benchmark on a new model _(inferred)_.
- Readers use English or French; the site ships in both.

## Product Purpose

TifinaghBench measures how well LLMs know Amazigh vocabulary written in Tifinagh (ⵜⵉⴼⵉⵏⴰⵖ), closed-book, across three dialects (Standard Moroccan Amazigh/IRCAM, Tarifit, Kabyle) and three tasks (Tifinagh → English, English → Tifinagh, Tifinagh ↔ Latin transliteration). The site publishes the leaderboard, per-model results, comparisons, and the methodology. Success: a visitor can tell within seconds which models lead, how large the gaps are, and whether two models are really different.

## Positioning

The only benchmark of LLMs on Amazigh vocabulary in Tifinagh. It runs models through the coding-agent harnesses people actually use (Codex, Claude Code, OpenCode), scores fairly (synonyms, homonyms and spelling conventions accepted), and separates knowing the words (TifinaghBench score) from reading the script (script score).

## Operating Context

- Results live in `results/<run>/` as public, score-only exports (`config.json`, `run.json`, `summary.json`, `report.md`). New models arrive by pull request; the site rebuilds from them.
- Methodology source of truth: `docs/methodology.md` (English); the French site carries a translation.
- Visitors arrive from the GitHub README, social posts and search, often on phones.

## Capabilities and Constraints

- **Data boundary:** the source dictionaries are unpublished pending permission from their rights holders. The site must never show dictionary words, model answers or example mistakes; only aggregate scores and run metadata. Tifinagh shown on the site is the alphabet itself, not dataset words.
- **Official setup:** judge Claude Haiku 5.5 on Claude Code, 1,000 words per dialect, seed 1, batch size 100, all dialects and tasks. Runs on another setup appear on the main leaderboard, unranked and clearly marked with what differs (user decision).
- **Uncertainty:** at 1,000 words per dialect the TifinaghBench margin is about ±1–2 points; rankings must show statistical ties honestly rather than imply false precision.
- **Costs** are reported unevenly: Codex reports none, Claude Code reports API-equivalent figures for subscription runs, OpenCode reports real spend. Never compare them as if equal.
- Pages in V1 (user decision, all at once): leaderboard, model pages, compare, methodology, dialects, run-it-yourself. English and French.

## Brand Commitments

- Name: **TifinaghBench** (one word). Headline metric: the **TifinaghBench score** (0–100); secondary: the **script score**.
- Code under the MIT license. Repository: https://github.com/Itri-Cloud-Labs/TifinaghBench.
- Tone: credible, plain and exact, like a research leaderboard; no hype _(inferred from how the user has written the README and docs)_.

## Evidence on Hand

- Eight finished runs on the official setup in `results/` (GPT-6.1-Sol, GPT-6-Astra, Claude Opus 5.5, GPT-6-Luna, DeepSeek v4.1 Flash, Claude Sonnet 5.5, GLM 5.3 Flash, Claude Haiku 5.5); Gemini 4 Argon in progress.
- `docs/methodology.md`, `docs/results-format.md`, `docs/harnesses.md`, `tifinagh-dataset/README.md` (source names and caveats).
- No testimonials, users, press or partner logos exist; none may be invented.

## Product Principles

1. **Honest numbers first.** Show uncertainty and ties; never imply a ranking the data cannot support.
2. **Protect the data boundary.** Aggregates only until the rights holders agree.
3. **Respect the language.** Tifinagh is a living script with its own community; present it with care and correct typography, not as decoration.
4. **Reproducible by anyone.** Every number traces back to a run folder and a command.

## Accessibility & Inclusion

WCAG 2.2 AA in light and dark themes; keyboard and screen-reader friendly charts; correct `lang` attributes for English, French and Tifinagh text _(inferred)_.
