# claude-fable-5-2 on claude-code (reasoning: medium)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 89.8 s

Model cost: $8.0424 · Judge cost: $0.2094. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 34.1** · Script score: 96.8

With the dictionaries' own spelling conventions required: TifinaghBench 32.9 · Script score 77.9

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 55.1% (4796 correct, 295 partial, 3889 wrong, 0 errors; 0 pending, 20 skipped)

131 sessions (101 answer, 30 judge); 422 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 37.9% | 16.4% | 99.5% | 51.3% |
| Tarifit (Riffian) | 45.8% | 11.3% | 93.4% | 50.3% |
| Kabyle | 64.5% | 28.9% | 97.4% | 63.6% |
| All dialects | 49.4% | 18.9% | 96.8% | 55.1% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.6140 |
| transliterate | 0.0594 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
