# claude-sonnet-5-5 on claude-code (reasoning: high)

Status: completed

1000 words per dialect · batch size 100 · seed 1 · 959.9 s

Model cost: $5.9781 · Judge cost: $0.2170. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-haiku-5-5 on claude-code.

**TifinaghBench: 12.9** · Script score: 89.4

With the dictionaries' own spelling conventions required: TifinaghBench 12.3 · Script score 73.6

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 38.4% (3330 correct, 242 partial, 5408 wrong, 0 errors; 0 pending, 20 skipped)

127 sessions (97 answer, 30 judge); 164 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 9.3% | 0.9% | 97.4% | 35.9% |
| Tarifit (Riffian) | 14.1% | 2.2% | 78.0% | 31.5% |
| Kabyle | 38.6% | 12.0% | 92.8% | 47.8% |
| All dialects | 20.7% | 5.1% | 89.4% | 38.4% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.8174 |
| transliterate | 0.0725 |

## Errors

0 errors are excluded from scores.

Per-question results and transcripts are withheld until the datasets are released.
