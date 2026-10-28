# TifinaghBench results

Public results of TifinaghBench V1 runs: scores and run metadata only. Per-question results and transcripts are withheld until the datasets are released (see [`tifinagh-dataset/README.md`](../tifinagh-dataset/README.md)).

All runs use the same setup: 1,000 words per dialect, seed 1, batch size 100, all three dialects and tasks, and Claude Haiku 5.5 (on Claude Code) as the judge for Tifinagh → English. Scores use spelling-convention folding; see [methodology](../docs/methodology.md).

## Leaderboard

| # | Model | Harness | Reasoning | **TifinaghBench** | Script score | Strict TifinaghBench |
| ---: | --- | --- | --- | ---: | ---: | ---: |
| 1 | [Gemini 4 Argon](2026-10-21-opencode-go-gemini-4-argon-high/report.md) | OpenCode | high | **37.8** | 96.9 | 36.8 |
| 2 | [GPT-6.1-Sol](2026-10-20-codex-gpt-6.1-sol-high/report.md) | Codex | high | **29.9** | 96.5 | 29.0 |
| 3 | [GPT-6-Astra](2026-10-20-codex-gpt-6-astra-low/report.md) | Codex | low | **29.4** | 96.4 | 28.5 |
| 4 | [Claude Opus 5.5](2026-10-20-claude-code-claude-opus-5-5-high/report.md) | Claude Code | high | **27.3** | 96.0 | 26.3 |
| 5 | [GPT-6.1-Terra](2026-10-28-codex-gpt-6.1-terra-high/report.md) | Codex | high | **20.9** | 94.5 | 20.4 |
| 6 | [GPT-6-Luna](2026-10-19-codex-gpt-6-luna-high/report.md) | Codex | high | **18.2** | 88.3 | 17.7 |
| 7 | [DeepSeek v4.1 Flash](2026-10-20-opencode-go-deepseek-v4.1-flash-high/report.md) | OpenCode | high | **16.8** | 93.1 | 16.3 |
| 8 | [Claude Sonnet 5.5](2026-10-20-claude-code-claude-sonnet-5-5-high/report.md) | Claude Code | high | **12.9** | 89.4 | 12.3 |
| 9 | [GLM 5.3 Flash](2026-10-20-opencode-go-glm-5.3-flash-high/report.md) | OpenCode | high | **12.0** | 80.6 | 11.7 |
| 10 | [Claude Haiku 5.5](2026-10-20-claude-code-claude-haiku-5-5-high/report.md) | Claude Code | high | **8.0** | 81.3 | 7.9 |
| 11 | [MiniMax M3.1 Flash](2026-10-24-openrouter-minimax-m3.1-flash-high/report.md) | OpenCode (OpenRouter) | high | **1.4** | 56.5 | 1.4 |

At 1,000 words per dialect the margin of error on TifinaghBench is about ±1–2 points (95%). Gemini 4 Argon leads by 8 points, far outside that margin, mostly on Tifinagh → English. GPT-6.1-Sol and GPT-6-Astra are tied. Claude Opus 5.5 is 2–2.6 points behind them, at the edge of that margin, and well ahead of GPT-6.1-Terra, which is in turn clearly ahead of GPT-6-Luna. GPT-6-Luna and DeepSeek v4.1 Flash are tied. Claude Sonnet 5.5 and GLM 5.3 Flash are also tied, clearly behind that pair. Claude Haiku 5.5 is also the judge, so it graded its own Tifinagh → English answers; it still scored lower on that task than every model except MiniMax M3.1 Flash. MiniMax M3.1 Flash is last by a wide margin: it transliterates about half the words correctly but almost never knows what they mean.

## Scores by dialect and task

Tifinagh → English / English → Tifinagh / Tifinagh ↔ Latin, in %.

| Model | Standard Moroccan Amazigh | Tarifit | Kabyle |
| --- | ---: | ---: | ---: |
| Gemini 4 Argon (high) | 43.0 / 21.1 / 99.6 | 53.4 / 10.9 / 93.5 | 66.8 / 31.8 / 97.6 |
| GPT-6.1-Sol (high) | 31.0 / 11.2 / 99.6 | 38.7 / 8.0 / 92.8 | 62.0 / 28.4 / 97.0 |
| GPT-6-Astra (low) | 29.0 / 11.7 / 99.0 | 37.8 / 9.0 / 93.0 | 62.1 / 26.7 / 97.1 |
| Claude Opus 5.5 (high) | 21.9 / 9.6 / 99.1 | 37.2 / 7.0 / 92.5 | 59.0 / 29.0 / 96.5 |
| GPT-6.1-Terra (high) | 20.0 / 6.2 / 97.2 | 27.6 / 3.8 / 90.6 | 52.2 / 15.7 / 95.8 |
| GPT-6-Luna (high) | 16.1 / 3.5 / 94.9 | 19.1 / 2.7 / 75.6 | 49.5 / 18.2 / 94.4 |
| DeepSeek v4.1 Flash (high) | 13.3 / 5.4 / 99.2 | 17.0 / 3.5 / 82.6 | 44.0 / 17.4 / 97.4 |
| Claude Sonnet 5.5 (high) | 9.3 / 0.9 / 97.4 | 14.1 / 2.2 / 78.0 | 38.6 / 12.0 / 92.8 |
| GLM 5.3 Flash (high) | 9.3 / 2.6 / 90.7 | 12.0 / 1.9 / 60.6 | 35.2 / 10.9 / 90.5 |
| Claude Haiku 5.5 (high) | 3.9 / 0.8 / 89.0 | 8.5 / 0.9 / 61.9 | 25.4 / 8.4 / 93.0 |
| MiniMax M3.1 Flash (high) | 1.6 / 0.2 / 71.0 | 2.6 / 0.1 / 41.7 | 3.2 / 0.9 / 56.9 |

## Runs

Each folder has `report.md` (score tables), `summary.json` (all scores and counts), `config.json` (settings) and `run.json` (versions, dataset checksums, sessions, tokens and cost).

- [`2026-10-21-opencode-go-gemini-4-argon-high`](2026-10-21-opencode-go-gemini-4-argon-high/): 219,473 input / 117,783 output tokens (1,707,659 reasoning); model cost $31.76 as reported by OpenCode, judge cost $0.18.
- [`2026-10-20-codex-gpt-6.1-sol-high`](2026-10-20-codex-gpt-6.1-sol-high/): 1,074,029 input / 478,011 output tokens (320,688 reasoning); model cost not reported, judge cost $0.19.
- [`2026-10-20-codex-gpt-6-astra-low`](2026-10-20-codex-gpt-6-astra-low/): 1,042,163 input / 163,647 output tokens (7,775 reasoning); model cost not reported, judge cost $0.19.
- [`2026-10-20-claude-code-claude-opus-5-5-high`](2026-10-20-claude-code-claude-opus-5-5-high/): 735,978 input / 728,783 output tokens (494,495 reasoning); model cost $17.01 as reported by Claude Code (API-equivalent, run on a subscription), judge cost $0.18.
- [`2026-10-28-codex-gpt-6.1-terra-high`](2026-10-28-codex-gpt-6.1-terra-high/): 1,055,611 input / 162,059 output tokens (6,923 reasoning); model cost not reported, judge cost $0.18.
- [`2026-10-19-codex-gpt-6-luna-high`](2026-10-19-codex-gpt-6-luna-high/): 1,003,026 input / 282,988 output tokens (126,226 reasoning); model cost not reported, judge cost $0.20.
- [`2026-10-20-opencode-go-deepseek-v4.1-flash-high`](2026-10-20-opencode-go-deepseek-v4.1-flash-high/): 212,104 input / 164,952 output tokens (2,826,343 reasoning); model cost $1.83, judge cost $0.22.
- [`2026-10-20-opencode-go-glm-5.3-flash-high`](2026-10-20-opencode-go-glm-5.3-flash-high/): 212,948 input / 226,739 output tokens (1,213,801 reasoning); model cost $0.75, judge cost $0.23.
- [`2026-10-20-claude-code-claude-sonnet-5-5-high`](2026-10-20-claude-code-claude-sonnet-5-5-high/): 736,459 input / 477,488 output tokens (238,873 reasoning); model cost $5.98 as reported by Claude Code (API-equivalent, run on a subscription), judge cost $0.22.
- [`2026-10-20-claude-code-claude-haiku-5-5-high`](2026-10-20-claude-code-claude-haiku-5-5-high/): 784,886 input / 1,170,057 output tokens (923,891 reasoning); model cost $0.69, judge cost $0.22.
- [`2026-10-24-openrouter-minimax-m3.1-flash-high`](2026-10-24-openrouter-minimax-m3.1-flash-high/): 223,193 input / 144,977 output tokens (2,268,884 reasoning); model cost $1.48 (OpenRouter, through OpenCode), judge cost $0.20.

GPT-6-Astra and Claude Sonnet 5.5 stopped at a usage limit (Codex and Claude Code respectively) and were resumed with the same settings; token totals cover both invocations. Claude Opus 5.5 stopped at the Claude Code usage limit twice and was finished on a second Claude account, with the same settings throughout; token totals cover all three invocations. Gemini 4 Argon stopped at OpenCode Go usage limits (5-hour and weekly) several times and was resumed with the same settings. Its Tarifit batches took longer than the default 600 s session timeout, so the last part ran with a 1,800 s timeout; the timeout has no effect on scoring. GLM 5.3 Flash timed out or broke off in 9 of its 102 answer batches; every affected question was answered on retry, so no question counts as unanswered.
