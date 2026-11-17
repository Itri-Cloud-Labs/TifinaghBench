# openai/gpt-6.2-sol on opencode (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 257.3 s

Model cost: $7.5152 · Judge cost: $0.2002. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 31.2** · Script score: 96.8

With the dictionaries' own spelling conventions required: TifinaghBench 30.2 · Script score 81.7

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 53.1% (4597 correct, 339 partial, 4044 wrong, 0 errors; 0 pending, 20 skipped)

204 sessions (93 answer, 111 judge); 472 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 29.8% | 11.7% | 99.6% | 47.0% |
| Tarifit (Riffian) | 43.0% | 9.1% | 93.5% | 48.6% |
| Kabyle | 63.0% | 30.5% | 97.2% | 63.6% |
| All dialects | 45.2% | 17.1% | 96.8% | 53.1% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.6742 |
| transliterate | 0.0441 |

## Errors

0 errors. Questions that failed after all retries count as 0 in TifinaghBench and the script score, and are left out of pooled accuracy and CER.

Per-question results and transcripts are withheld until the datasets are released.
