# opencode-go/glm-5.3-flash on opencode (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 4607.4 s

Model cost: $0.7520 · Judge cost: $0.2277. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 12.0** · Script score: 80.6

With the dictionaries' own spelling conventions required: TifinaghBench 11.7 · Script score 65.4

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 34.9% (3020 correct, 231 partial, 5729 wrong, 0 errors; 0 pending, 20 skipped)

132 sessions (102 answer, 30 judge); 142 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 9.3% | 2.6% | 90.7% | 34.2% |
| Tarifit (Riffian) | 12.0% | 1.9% | 60.6% | 24.9% |
| Kabyle | 35.2% | 10.9% | 90.5% | 45.6% |
| All dialects | 18.8% | 5.2% | 80.6% | 34.9% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.8751 |
| transliterate | 0.1073 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
