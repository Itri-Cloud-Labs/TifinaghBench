# gpt-6.1-terra on codex (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 766.4 s

Model cost: unreported · Judge cost: $0.1837. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 20.9** · Script score: 94.5

With the dictionaries' own spelling conventions required: TifinaghBench 20.4 · Script score 75.7

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 45.5% (3944 correct, 286 partial, 4750 wrong, 0 errors; 0 pending, 20 skipped)

123 sessions (93 answer, 30 judge); 421 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 20.0% | 6.2% | 97.2% | 41.1% |
| Tarifit (Riffian) | 27.6% | 3.8% | 90.6% | 40.8% |
| Kabyle | 52.2% | 15.7% | 95.8% | 54.6% |
| All dialects | 33.2% | 8.6% | 94.5% | 45.5% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.7413 |
| transliterate | 0.0637 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
