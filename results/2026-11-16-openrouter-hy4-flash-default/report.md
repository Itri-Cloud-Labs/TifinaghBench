# openrouter/tencent/hy4-flash on opencode (reasoning: default)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 5402.5 s

Model cost: $0.5414 · Judge cost: $0.2161. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 14.9** · Script score: 87.1

With the dictionaries' own spelling conventions required: TifinaghBench 14.5 · Script score 76.6

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 39.0% (3375 correct, 256 partial, 5349 wrong, 0 errors; 0 pending, 20 skipped)

131 sessions (101 answer, 30 judge); 227 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 15.3% | 1.8% | 98.5% | 38.6% |
| Tarifit (Riffian) | 18.7% | 2.7% | 66.2% | 29.3% |
| Kabyle | 40.8% | 9.8% | 96.7% | 49.2% |
| All dialects | 24.9% | 4.8% | 87.1% | 39.0% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.8207 |
| transliterate | 0.0816 |

## Errors

0 errors. Questions that failed after all retries count as 0 in TifinaghBench and the script score, and are left out of pooled accuracy and CER.

Per-question results and transcripts are withheld until the datasets are released.
