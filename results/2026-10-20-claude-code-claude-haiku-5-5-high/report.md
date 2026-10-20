# claude-haiku-5-5 on claude-code (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 1528.6 s

Model cost: $0.6933 · Judge cost: $0.2167. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 8.0** · Script score: 81.3

With the dictionaries' own spelling conventions required: TifinaghBench 7.9 · Script score 70.1

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 32.5% (2827 correct, 178 partial, 5975 wrong, 0 errors; 0 pending, 20 skipped)

123 sessions (93 answer, 30 judge); 105 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 3.9% | 0.8% | 89.0% | 31.2% |
| Tarifit (Riffian) | 8.5% | 0.9% | 61.9% | 23.8% |
| Kabyle | 25.4% | 8.4% | 93.0% | 42.3% |
| All dialects | 12.6% | 3.4% | 81.3% | 32.5% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.8666 |
| transliterate | 0.0832 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
