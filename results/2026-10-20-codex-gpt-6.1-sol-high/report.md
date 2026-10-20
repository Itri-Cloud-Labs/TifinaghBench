# gpt-6.1-sol on codex (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 2857.4 s

Model cost: unreported · Judge cost: $0.1874. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 29.9** · Script score: 96.5

With the dictionaries' own spelling conventions required: TifinaghBench 29.0 · Script score 77.5

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 52.1% (4526 correct, 309 partial, 4145 wrong, 0 errors; 0 pending, 20 skipped)

123 sessions (93 answer, 30 judge); 508 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 31.0% | 11.2% | 99.6% | 47.3% |
| Tarifit (Riffian) | 38.7% | 8.0% | 92.8% | 46.6% |
| Kabyle | 62.0% | 28.4% | 97.0% | 62.5% |
| All dialects | 43.9% | 15.9% | 96.5% | 52.1% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.6632 |
| transliterate | 0.0605 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
