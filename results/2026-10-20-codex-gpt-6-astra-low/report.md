# gpt-6-astra on codex (reasoning: low)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 718.4 s

Model cost: unreported · Judge cost: $0.1886. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 29.4** · Script score: 96.4

With the dictionaries' own spelling conventions required: TifinaghBench 28.5 · Script score 77.7

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 51.8% (4501 correct, 293 partial, 4186 wrong, 0 errors; 0 pending, 20 skipped)

127 sessions (97 answer, 30 judge); 503 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 29.0% | 11.7% | 99.0% | 46.6% |
| Tarifit (Riffian) | 37.8% | 9.0% | 93.0% | 46.7% |
| Kabyle | 62.1% | 26.7% | 97.1% | 62.0% |
| All dialects | 43.0% | 15.8% | 96.4% | 51.8% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.6553 |
| transliterate | 0.0600 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
