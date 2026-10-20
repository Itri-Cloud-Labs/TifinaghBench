# claude-opus-5-5 on claude-code (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 217.9 s

Model cost: $17.0054 · Judge cost: $0.1834. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 27.3** · Script score: 96.0

With the dictionaries' own spelling conventions required: TifinaghBench 26.3 · Script score 77.6

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 50.3% (4355 correct, 316 partial, 4309 wrong, 0 errors; 0 pending, 20 skipped)

131 sessions (100 answer, 31 judge); 458 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 21.9% | 9.6% | 99.1% | 43.5% |
| Tarifit (Riffian) | 37.2% | 7.0% | 92.5% | 45.7% |
| Kabyle | 59.0% | 29.0% | 96.5% | 61.5% |
| All dialects | 39.4% | 15.2% | 96.0% | 50.3% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.6776 |
| transliterate | 0.0597 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
