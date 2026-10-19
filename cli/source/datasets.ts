import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {type Dialect, dialects} from './options.js';

export const defaultDatasetDir = fileURLToPath(
	new URL('../../tifinagh-dataset/translated-datasets', import.meta.url),
);

const entryStart = Buffer.from('\n {\n  "id":');

// Counts are only shown as hints, so a missing or unreadable file is skipped.
export function countWords(datasetDir: string): Partial<Record<Dialect, number>> {
	const counts: Partial<Record<Dialect, number>> = {};
	for (const dialect of dialects) {
		try {
			const bytes = fs.readFileSync(path.join(datasetDir, dialect.file));
			// Parsing all 25 MB takes about a second, so count top-level entries by their indentation.
			let count = 0;
			for (let at = bytes.indexOf(entryStart); at !== -1; at = bytes.indexOf(entryStart, at + 1)) {
				count++;
			}

			if (count > 0) counts[dialect.value] = count;
		} catch {}
	}

	return counts;
}
