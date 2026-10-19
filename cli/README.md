# tifinagh-bench CLI

Runs the benchmark through Codex, Claude Code or OpenCode. Requires Node.js 22.13+ and at least one harness installed and signed in.

```bash
npm install
npm run dev
```

The CLI asks for:
- the harness, model and reasoning level
- dialects and tasks
- a judge model (only when Tifinagh → English is selected)
- sample size, parallel sessions and results folder

You then review your choices and confirm; Esc goes back. Progress shows live, and results are written as they arrive.

## Flags

Every question has a flag; any flag you pass skips its question. With all of them plus `--yes`, the CLI runs without prompts, for example in scripts:

```bash
npm run dev -- --harness=codex --model=gpt-6-luna --reasoning=low \
  --dialects=ircam,tarifit,kabyle --tasks=tif-to-en,en-to-tif \
  --judge-harness=claude-code --judge-model=claude-haiku-5-5 \
  --sample=250 --concurrency=4 --output=results/luna-250 --yes
```

| Flag | Values / default |
| --- | --- |
| `--harness` | `codex`, `claude-code`, `opencode` |
| `--model` | Model id as the harness expects it; OpenCode uses `provider/model` |
| `--reasoning` | `default`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` (depends on harness) |
| `--dialects` | Comma-separated: `ircam`, `tarifit`, `kabyle` |
| `--tasks` | Comma-separated: `tif-to-en`, `en-to-tif`, `transliterate` |
| `--judge-harness`, `--judge-model` | Judge for `tif-to-en` |
| `--sample` | Words per dialect: any positive number, or `all` |
| `--batch-size` | Words per session; default 100. Only compare scores at the same batch size |
| `--concurrency` | Parallel sessions, judge included |
| `--timeout` | Seconds per session; default 600 |
| `--retries` | Retries for failed sessions and missing answers; default 2 |
| `--seed` | Sampling seed; default 1 |
| `--dataset` | Dataset folder; default `../tifinagh-dataset/translated-datasets` |
| `--output` | Results folder; default `results/<date>-<harness>-<model>` |
| `--dry-run` | Sample and build prompts without calling any model |
| `--yes`, `-y` | Skip the review step |

Exit codes: 0 completed, 1 failed, 3 stopped at a usage limit (rerun the same command to resume), 130 cancelled.

## Costs

Batching keeps runs small. In a real run, 100 words took one Codex session of about 10k input tokens and 30 seconds. Rough sizes per run:

| Words per dialect | Sessions (3 dialects × 2 tasks) |
| ---: | ---: |
| 50 | ~6 + judging |
| 250 | ~18 + judging |
| 1,000 | ~60 + judging |

Reasoning levels above `low` can multiply output tokens. Try `--dry-run` or `--sample=2` first.

## Development

```bash
npm run typecheck
npm run build      # compiles to dist/
npm start -- --help
```

| Path | Contents |
| --- | --- |
| `source/cli.tsx` | Flags and entry point |
| `source/app.tsx`, `source/components/` | Question flow and progress screen |
| `source/bench/` | Sampling, prompts, scoring, judging, results and the run loop |
| `source/harnesses/` | Codex, Claude Code and OpenCode adapters |

`runBenchmark()` in `source/bench/run.ts` accepts injected harness sessions, so the engine can be tested with a fake harness.

More detail: [methodology](../docs/methodology.md), [results format](../docs/results-format.md), [harnesses](../docs/harnesses.md).
