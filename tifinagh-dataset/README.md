# Tifinagh dataset

> **The datasets are not published yet.** We are waiting for permission from the dictionaries' rights holders before releasing them. They should be available soon.

The benchmark uses about 27,000 Amazigh dictionary entries in Tifinagh script, with English meanings:

| Dialect | Source | Entries |
| --- | --- | ---: |
| Standard Moroccan Amazigh | IRCAM, *Dictionnaire général de la langue amazighe* | 13,673 |
| Tarifit (Riffian) | Abarrou, *Dictionnaire rifain-français illustré* | 12,151 |
| Kabyle | Kabyle–English lexicon from [tifin.amazigh24.com](https://tifin.amazigh24.com) | 1,137 |

The IRCAM and Tarifit meanings were machine-translated from French, with the French kept alongside. Kabyle Tifinagh spellings were generated from Latin script.

## Using the CLI before the release

The CLI expects the datasets in `tifinagh-dataset/translated-datasets/`, or wherever `--dataset` points. Each dialect is one JSON array file:

| Dialect | File |
| --- | --- |
| Standard Moroccan Amazigh | `ircam_dictionnaire_general_amazighe_en.json` |
| Tarifit | `abarrou_dictionnaire_rifain_en.json` |
| Kabyle | `kabyle_english_lexicon_amazigh24.json` |

Each entry needs at least:
- `id`: unique within the file
- `word`: Tifinagh
- `latin`: Latin script
- `meaning`: English
- `senses`: English strings, or objects with a `glosses` array of strings
