# Results format

Each run writes one folder (by default `results/<date>-<harness>-<model>`):

```
results/2026-10-19-claude-code-claude-opus-5-5/
├── config.json      resolved settings: harness, model, dialects, tasks, judge, batch size, seed, …
├── run.json         status, timings, harness/judge versions and settings, dataset checksums, sessions, tokens, cost
├── items.jsonl      one record per question (append-only; the last record per id wins)
├── summary.json     scores, counts and mean CER by task, by dialect, and by both
├── report.md        readable summary with example mistakes
└── transcripts/     one file per session: answer-000001.json, judge-000003.json, …
```

A dry run (`--dry-run`) also writes `prompts.jsonl`, one row per planned batch, and makes no model calls.

See [`cli/examples/results/`](../cli/examples/results/) for a complete miniature run. Its answers, grades and costs are invented; it's a format reference only.

## items.jsonl

One JSON object per question:

| Field | Meaning |
| --- | --- |
| `id` | `<dialect>/<entryId>/<task>` |
| `dialect`, `task`, `entry_id`, `direction` | What was asked (`direction` only for transliteration) |
| `input`, `answer` | What the model saw and wrote |
| `expected`, `expected_entry_ids` | Every accepted answer (synonyms or homonyms) and the entries they come from |
| `matched_entry_id` | English → Tifinagh: which accepted word the model wrote, or null |
| `grade`, `score` | `correct`/`partial`/`wrong` → 1 / 0.5 / 0 |
| `scored_by` | `exact`, `exact-sense`, `judge` or `empty` |
| `cer` | Character error rate, for exact-match tasks |
| `judge`, `judge_note` | Judge attempts, usage and cost, and the judge's one-sentence explanation |
| `batch_id`, `judge_batch_id` | Transcript files for the answer and judge sessions |
| `tokens`, `cost_usd` | This item's even share of its sessions' usage |
| `latency_ms` | Latency of the item's answer **batch**, not of this one answer |
| `attempts` | Number of sessions that included the item |
| `error` | Why it failed after all retries (failed items are excluded from scores) |

Items are appended as they change: an answer arrives, then the judge grades it. Use the last line for each `id`.

## Transcripts

Each `transcripts/<batch_id>.json` holds:
- **The request:** the system prompt, prompt and JSON schema, plus `id_map` (short id → item id).
- **The reply:** the raw output, every attempt, validation `issues` (missing, duplicate or unknown ids) and the accepted `valid_ids`.
- **Session data:** the full harness message transcript and the session's tokens, cost and latency.

## Usage and cost

Usage is recorded once per session, with model and judge totals kept separate in `run.json`. Item shares are split evenly, so per-item numbers add up to the session totals. Costs are only what the harness reports. Codex reports none, so its cost stays `null` rather than being estimated.

## Resuming

Rerun the same command with the same output folder to continue an interrupted, cancelled or `limited` run:
- **Kept:** scored items are skipped, and answers already accepted only retry judging.
- **Re-asked:** everything else is batched again in the same deterministic order, with a fresh retry budget.
- **Refused:** resuming fails if anything in `config.json` (including batch size and seed) or the dataset checksums changed.

`run.json` timings describe the latest invocation. Session and usage totals add up across all invocations.
