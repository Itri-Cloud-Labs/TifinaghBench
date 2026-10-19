import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {dialects, type BenchConfig, type Task} from '../options.js';
import type {DatasetInfo, Entry, Question} from './model.js';
import {buildPrompt} from './prompts.js';
import {random, sample} from './sample.js';
import {normalizeEnglish} from './score.js';

const text = (value: unknown): string => typeof value === 'string' ? value.trim() : '';

export function parseEntry(value: unknown): Entry {
	if (!value || typeof value !== 'object') throw new Error('Dataset entry must be an object.');
	const raw = value as Record<string, unknown>;
	if (typeof raw.id !== 'string' && typeof raw.id !== 'number') throw new Error('Dataset entry is missing an id.');
	const senses = Array.isArray(raw.senses) ? raw.senses.flatMap(sense => {
		if (typeof sense === 'string') return [sense];
		if (sense && typeof sense === 'object' && Array.isArray(sense.glosses)) return sense.glosses.filter((gloss: unknown) => typeof gloss === 'string') as string[];
		return [];
	}) : [];
	const meaning = text(raw.meaning);
	return {id: raw.id, word: text(raw.word), latin: text(raw.latin), meaning,
		senses: [...new Set([meaning, ...senses].map(text).filter(Boolean))]};
}

export function supports(entry: Entry, task: Task): boolean {
	return Boolean(entry.word && (task === 'transliterate' ? entry.latin : task === 'en-to-tif' ? normalizeEnglish(entry.meaning) : entry.senses.length));
}

export async function prepareQuestions(config: BenchConfig) {
	const questions: Question[] = [];
	const dataset: Partial<Record<import('../options.js').Dialect, DatasetInfo>> = {};
	for (const dialect of config.dialects) {
		const file = dialects.find(choice => choice.value === dialect)!.file;
		const bytes = await fs.readFile(path.join(config.datasetDir!, file)).catch((error: NodeJS.ErrnoException) => {
			if (error.code !== 'ENOENT') throw error;
			throw new Error(`Dataset file ${file} not found in ${config.datasetDir}. The datasets are not published yet (see tifinagh-dataset/README.md); pass --dataset to use your own copy.`);
		});
		const raw: unknown = JSON.parse(bytes.toString('utf8'));
		if (!Array.isArray(raw)) throw new Error(`${file} must contain a JSON array.`);
		const entries = raw.map(parseEntry);
		if (new Set(entries.map(entry => String(entry.id))).size !== entries.length) throw new Error(`Duplicate entry ids in ${file}.`);
		const selected = sample(entries, config.sampleSize === 'all' ? 'all' : Number(config.sampleSize), random(config.seed, dialect));
		// Words sharing a meaning (synonyms) or a spelling (homonyms) are all valid answers.
		const meanings = new Map<string, Entry[]>();
		const spellings = new Map<string, Entry[]>();
		for (const entry of entries) {
			if (supports(entry, 'en-to-tif')) {
				const key = normalizeEnglish(entry.meaning);
				meanings.set(key, [...(meanings.get(key) ?? []), entry]);
			}

			if (supports(entry, 'tif-to-en')) {
				const key = entry.word.normalize('NFC');
				spellings.set(key, [...(spellings.get(key) ?? []), entry]);
			}
		}

		const info: DatasetInfo = {file, sha256: createHash('sha256').update(bytes).digest('hex'), entries: entries.length,
			sampled: selected.length, skipped: 0, skipped_by_task: {}, unsupported_by_task: {}};
		for (const task of config.tasks) {
			info.unsupported_by_task[task] = entries.filter(entry => !supports(entry, task)).length;
			info.skipped_by_task[task] = 0;
		}

		for (const entry of selected) {
			for (const task of config.tasks) {
				if (!supports(entry, task)) {
					info.skipped++;
					info.skipped_by_task[task]!++;
					continue;
				}

				const direction = task === 'transliterate'
					? random(config.seed, `${dialect}/${entry.id}/direction`)() < 0.5 ? 'tif-to-latin' : 'latin-to-tif'
					: undefined;
				const equivalents = task === 'en-to-tif' ? meanings.get(normalizeEnglish(entry.meaning))!
					: task === 'tif-to-en' ? spellings.get(entry.word.normalize('NFC'))! : [];
				const input = task === 'en-to-tif' ? entry.meaning : direction === 'latin-to-tif' ? entry.latin : entry.word;
				questions.push({id: `${dialect}/${entry.id}/${task}`, dialect, task, entry, direction, input,
					// en-to-tif keeps one word per entry: score.ts maps a match index to expected_entry_ids.
					expected: task === 'en-to-tif' ? equivalents.map(value => value.word)
						: task === 'tif-to-en' ? [...new Set(equivalents.flatMap(value => value.senses))]
						: [direction === 'tif-to-latin' ? entry.latin : entry.word],
					...(equivalents.length > 0 ? {expected_entry_ids: equivalents.map(value => value.id)} : {}),
					request: buildPrompt(task, dialect, input, direction)});
			}
		}

		dataset[dialect] = info;
	}

	return {questions, dataset};
}
