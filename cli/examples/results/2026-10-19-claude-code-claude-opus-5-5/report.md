# claude-opus-5-5 on claude-code (reasoning: high)

Status: completed

2 words per dialect · batch size 100 · seed 1 · 0.1 s

Model cost: $0.0090 · Judge cost: $0.0030. Reported costs are sums of known costs; unreported calls are not estimated.

Tifinagh → English judged by claude-sonnet-5-5 on claude-code.

**TifinaghBench: 62.5** · Script score: 100.0

With the dictionaries' own spelling conventions required: TifinaghBench 62.5 · Script score 100.0

TifinaghBench is the equal-weight mean of the 3 dialects × 2 meaning tasks, with unanswered questions counted as 0; the script score is the same for transliteration. Both need all three dialects.

Pooled accuracy: 75.0% (12 correct, 3 partial, 3 wrong, 0 errors; 0 pending, 0 skipped)

12 sessions (9 answer, 3 judge); 3 judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.

| Dialect | Tifinagh → English | English → Tifinagh | Tifinagh ↔ Latin | All tasks |
| --- | ---: | ---: | ---: | ---: |
| Standard Moroccan Amazigh | 75.0% | 50.0% | 100.0% | 75.0% |
| Tarifit (Riffian) | 75.0% | 50.0% | 100.0% | 75.0% |
| Kabyle | 75.0% | 50.0% | 100.0% | 75.0% |
| All dialects | 75.0% | 50.0% | 100.0% | 75.0% |

## Character error rate

| Task | Mean CER |
| --- | ---: |
| en-to-tif | 0.5000 |
| transliterate | 0.0000 |

## Example mistakes

| Dialect | Task | Input | Expected | Model answer |
| --- | --- | --- | --- | --- |
| ircam | en-to-tif | fantasia | ⴰⵎⴰⵡⴰⵍ / ⵜⴰⴼⵔⴰⵡⵜ |  |
| ircam | tif-to-en | ⵜⴰⵎⵔⵔⵓⵜ | punishment | a related meaning |
| kabyle | en-to-tif | The cheekbone / The curve. It’s the « tip » of the cheek, the small bump that rises when you smile. | ⵜⵉⵡⵊⵉⵜ |  |
| kabyle | tif-to-en | ⵉⵖⵓⵙ | he is thirsty | a related meaning |
| tarifit | en-to-tif | To compensate. ; compensate | ⵄⵡⵡⴹ |  |

## Errors

0 errors are excluded from scores. Item results are in items.jsonl and session attempts in transcripts/; resume retries pending/error items.

