import fs from 'node:fs';
import path from 'node:path';
import type {BenchConfig} from '../options.js';
import type {Item, RunInfo} from './model.js';
import {report, summarize, writeJson} from './results.js';
import {scoreExact} from './score.js';

// Re-applies the current exact-match scoring to a finished run from its saved answers, without model calls.
// Judged Tifinagh → English results are kept as they are. Updated items are appended (the last line per id wins).
export function rescore(folder: string): {changed: number; total: number} {
	const directory = path.resolve(folder);
	const read = <T>(name: string): T => {
		const file = path.join(directory, name);
		if (!fs.existsSync(file)) throw new Error(`${file} not found. Is this a results folder?`);
		return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
	};

	const config = read<BenchConfig>('config.json');
	const run = read<RunInfo>('run.json');
	if (run.status === 'running') throw new Error('This run is still in progress; rescore it after it finishes.');
	const itemFile = path.join(directory, 'items.jsonl');
	const latest = new Map<string, Item>();
	for (const line of fs.readFileSync(itemFile, 'utf8').split('\n')) {
		if (line.trim()) {
			const item = JSON.parse(line) as Item;
			latest.set(item.id, item);
		}
	}

	const updates: Item[] = [];
	let changed = 0;
	for (const item of latest.values()) {
		if (item.task === 'tif-to-en' || item.error !== null || item.answer === null || item.answer === undefined) continue;
		const scored = {...item, ...scoreExact(item, item.answer)};
		if (scored.score !== item.score) changed++;
		if (scored.score !== item.score || scored.strict !== item.strict || scored.matched_entry_id !== item.matched_entry_id) {
			updates.push(scored);
			latest.set(item.id, scored);
		}
	}

	if (updates.length > 0) fs.appendFileSync(itemFile, updates.map(item => `${JSON.stringify(item)}\n`).join(''));
	const items = [...latest.values()];
	const summary = summarize(items, config);
	writeJson(path.join(directory, 'summary.json'), summary);
	fs.writeFileSync(path.join(directory, 'report.md'), report(config, run, summary, items));
	return {changed, total: items.length};
}
