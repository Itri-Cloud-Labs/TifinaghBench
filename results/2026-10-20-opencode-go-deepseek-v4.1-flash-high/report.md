# opencode-go/deepseek-v4.1-flash on opencode (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 3970.9 s

Model cost: $1.8262 · Judge cost: $0.2190. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 16.8** · Script score: 93.1

With the dictionaries' own spelling conventions required: TifinaghBench 16.3 · Script score 77.3

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 42.2% (3677 correct, 234 partial, 5069 wrong, 0 errors; 0 pending, 20 skipped)

126 sessions (94 answer, 32 judge); 307 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 13.3% | 5.4% | 99.2% | 39.3% |
| Tarifit (Riffian) | 17.0% | 3.5% | 82.6% | 34.5% |
| Kabyle | 44.0% | 17.4% | 97.4% | 53.0% |
| All dialects | 24.7% | 8.8% | 93.1% | 42.2% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.7912 |
| transliterate | 0.0636 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
