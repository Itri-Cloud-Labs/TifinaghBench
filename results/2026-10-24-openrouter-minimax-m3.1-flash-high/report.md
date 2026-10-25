# openrouter/minimax/minimax-m3.1-flash on opencode (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 5161.4 s

Model cost: $1.4792 · Judge cost: $0.2038. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 1.4** · Script score: 56.5

With the dictionaries' own spelling conventions required: TifinaghBench 1.4 · Script score 48.5

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 19.8% (1745 correct, 72 partial, 7163 wrong, 0 errors; 0 pending, 20 skipped)

126 sessions (96 answer, 30 judge); 18 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 1.6% | 0.2% | 71.0% | 24.3% |
| Tarifit (Riffian) | 2.6% | 0.1% | 41.7% | 14.9% |
| Kabyle | 3.2% | 0.9% | 56.9% | 20.4% |
| All dialects | 2.4% | 0.4% | 56.5% | 19.8% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.9093 |
| transliterate | 0.1611 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
