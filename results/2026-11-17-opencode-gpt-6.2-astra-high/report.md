# openai/gpt-6.2-astra on opencode (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 4110.3 s

Model cost: $23.5272 · Judge cost: $0.2099. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 33.6** · Script score: 97.4

With the dictionaries' own spelling conventions required: TifinaghBench 32.4 · Script score 82.0

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 54.9% (4772 correct, 317 partial, 3891 wrong, 0 errors; 0 pending, 20 skipped)

124 sessions (94 answer, 30 judge); 356 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 33.1% | 14.2% | 99.6% | 49.0% |
| Tarifit (Riffian) | 46.0% | 10.3% | 94.9% | 50.5% |
| Kabyle | 64.9% | 33.1% | 97.6% | 65.2% |
| All dialects | 48.0% | 19.2% | 97.4% | 54.9% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.6512 |
| transliterate | 0.0429 |

## Errors

0 errors. Questions that failed after all retries count as 0 in TifinaghBench and the script score, and are left out of pooled accuracy and CER.

Per-question results and transcripts are withheld until the datasets are released.
