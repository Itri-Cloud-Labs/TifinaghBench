# tifinagh-bench

How well do LLMs know Amazigh (Berber) vocabulary written in Tifinagh (ⵜⵉⴼⵉⵏⴰⵖ)?

tifinagh-bench asks models closed-book vocabulary questions in three Amazigh dialects, using about 27,000 dictionary entries. It runs them through the coding-agent harnesses people actually use: Codex, Claude Code and OpenCode.

| Task | Example |
| --- | --- |
| Tifinagh → English | ⴰⵎⴰⵡⴰⵍ → "lexicon" |
| English → Tifinagh | "weaver" → ⴰⴸⵔⵔⴰⵣ |
| Tifinagh ↔ Latin | ⵉⵖⵓⵙ ↔ iɣus |

The three dialects are Standard Moroccan Amazigh (IRCAM), Tarifit (Riffian) and Kabyle.

> **The datasets are not published yet.** We are waiting for permission from the dictionaries' rights holders, and they should be available soon. Until then the CLI needs your own copy: see [`tifinagh-dataset/README.md`](tifinagh-dataset/README.md) for the expected format.

## Quick start

Requires Node.js 22.13+, at least one harness installed and signed in, and the datasets.

```bash
cd cli
npm install
npm run dev
```

The CLI walks you through the harness, model, dialects, tasks, judge model and sample size, then shows live progress. For a cheap first run, choose 50 words per dialect, or pass `--sample=2`. See [`cli/README.md`](cli/README.md) for flags and scripted runs.

## How it works

- **Closed-book.** Tools, web search and user/project instructions are disabled in every harness, and each session runs in an empty temporary folder.
- **Batched.** One session answers up to 100 words, which keeps a 1,000-word run within a $20 subscription.
- **Fair scoring.** Synonyms and homonyms in the dictionary are all accepted. Free-text meanings are graded by an LLM judge, and exact-match tasks also record a character error rate for near misses.
- **Reproducible.** A seed picks the same words for every model. Runs resume after interruptions or usage limits, and full transcripts are kept.

Details: [methodology](docs/methodology.md) · [results format](docs/results-format.md) · [harnesses](docs/harnesses.md)

## Repository layout

```
cli/                 the benchmark CLI (TypeScript, Ink)
  examples/results/  a made-up miniature run showing the output format
docs/                methodology, results format, harness notes
tifinagh-dataset/    dataset notes (data to be released once permission is granted)
```

## Dataset caveats

The English meanings for the IRCAM and Tarifit dictionaries were machine-translated from French, and Kabyle Tifinagh spellings were generated from Latin script. Treat scores as relative comparisons between models rather than absolute measures of fluency. See [`tifinagh-dataset/README.md`](tifinagh-dataset/README.md).
