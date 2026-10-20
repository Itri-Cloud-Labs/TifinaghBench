# gpt-6-luna on codex (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 1236.3 s

Model cost: unreported · Judge cost: $0.1952. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 18.2** · Script score: 88.3

With the dictionaries' own spelling conventions required: TifinaghBench 17.7 · Script score 70.8

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 41.6% (3580 correct, 312 partial, 5088 wrong, 0 errors; 0 pending, 20 skipped)

123 sessions (93 answer, 30 judge); 327 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 16.1% | 3.5% | 94.9% | 38.1% |
| Tarifit (Riffian) | 19.1% | 2.7% | 75.6% | 32.6% |
| Kabyle | 49.5% | 18.2% | 94.4% | 54.1% |
| All dialects | 28.2% | 8.1% | 88.3% | 41.6% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.8193 |
| transliterate | 0.0887 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
