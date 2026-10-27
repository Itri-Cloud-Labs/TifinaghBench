# opencode-go/gemini-4-argon on opencode (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 1327.9 s

Model cost: $31.7607 · Judge cost: $0.1822. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 37.8** · Script score: 96.9

With the dictionaries' own spelling conventions required: TifinaghBench 36.8 · Script score 75.8

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 57.6% (5004 correct, 329 partial, 3647 wrong, 0 errors; 0 pending, 20 skipped)

197 sessions (167 answer, 30 judge); 596 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 43.0% | 21.1% | 99.6% | 54.5% |
| Tarifit (Riffian) | 53.4% | 10.9% | 93.5% | 52.7% |
| Kabyle | 66.8% | 31.8% | 97.6% | 65.4% |
| All dialects | 54.4% | 21.3% | 96.9% | 57.6% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.5861 |
| transliterate | 0.0711 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
