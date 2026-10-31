# openrouter/moonshotai/kimi-k3.1-pro on opencode (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 1843.6 s

Model cost: $11.4343 · Judge cost: $0.1988. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 13.8** · Script score: 92.0

With the dictionaries' own spelling conventions required: TifinaghBench 13.2 · Script score 78.0

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 39.9% (3468 correct, 231 partial, 5281 wrong, 0 errors; 0 pending, 20 skipped)

203 sessions (153 answer, 50 judge); 228 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 10.3% | 4.1% | 99.4% | 37.9% |
| Tarifit (Riffian) | 14.8% | 2.3% | 79.5% | 32.3% |
| Kabyle | 36.6% | 14.6% | 97.0% | 49.4% |
| All dialects | 20.6% | 7.0% | 92.0% | 39.9% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.8007 |
| transliterate | 0.0640 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
