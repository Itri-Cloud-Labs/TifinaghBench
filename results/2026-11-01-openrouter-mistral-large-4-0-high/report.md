# openrouter/mistralai/mistral-large-4-0 on opencode (reasoning: high)

Status: completed

1000 words per dialect · batch size 20 · seed 1 · 252.2 s

Model cost: $8.9691 · Judge cost: $0.2102. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 11.7** · Script score: 47.1

With the dictionaries' own spelling conventions required: TifinaghBench 11.5 · Script score 41.5

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 23.5% (1990 correct, 246 partial, 6744 wrong, 0 errors; 0 pending, 20 skipped)

196 sessions (166 answer, 30 judge); 184 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 11.8% | 0.5% | 54.1% | 22.1% |
| Tarifit (Riffian) | 11.9% | 1.0% | 24.8% | 12.6% |
| Kabyle | 39.4% | 5.8% | 62.3% | 35.9% |
| All dialects | 21.0% | 2.4% | 47.1% | 23.5% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 1.1009 |
| transliterate | 0.3317 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
