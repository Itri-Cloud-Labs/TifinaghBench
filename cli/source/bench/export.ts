import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {BenchConfig} from '../options.js';
import type {RunInfo, Summary} from './model.js';
import {report, writeJson} from './results.js';

// Shareable subset of a results folder: scores and run metadata, but nothing that quotes the
// dictionaries (items.jsonl, transcripts/, prompts.jsonl, example mistakes) and no local paths.

const home = os.homedir();
const temporary = fs.realpathSync(os.tmpdir());

function redact<T>(value: T): T {
	if (typeof value === 'string') {
		return value
			.replaceAll(new RegExp(`${temporary.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}/[^\\s"'\`]*`, 'g'), '<tmp>')
			.replaceAll(home, '~') as T;
	}

	if (Array.isArray(value)) return value.map(redact) as T;
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redact(item)])) as T;
	}

	return value;
}

function readJson<T>(folder: string, name: string): T {
	const file = path.join(folder, name);
	if (!fs.existsSync(file)) throw new Error(`${file} not found. Is this a results folder?`);
	return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function exportPublic(source: string, destination = `${source.replace(/\/+$/, '')}-public`): string {
	const from = path.resolve(source);
	const to = path.resolve(destination);
	if (from === to) throw new Error('Export to a different folder than the results folder.');
	const config = readJson<BenchConfig>(from, 'config.json');
	const run = readJson<RunInfo>(from, 'run.json');
	const summary = readJson<Summary>(from, 'summary.json');

	const {output: _output, datasetDir: _datasetDir, ...publicConfig} = config;
	fs.mkdirSync(to, {recursive: true});
	writeJson(path.join(to, 'config.json'), redact(publicConfig));
	writeJson(path.join(to, 'run.json'), redact(run));
	writeJson(path.join(to, 'summary.json'), summary);
	fs.writeFileSync(path.join(to, 'report.md'), redact(report(config, run, summary, [], {publicReport: true})));
	fs.writeFileSync(path.join(to, 'README.md'), [
		`# ${config.model} on ${config.harness}: public results`, '',
		'Scores and run metadata from a tifinagh-bench run. `report.md` has the score tables; `summary.json` has the same numbers with counts and character error rates.', '',
		'Per-question results (`items.jsonl`) and session transcripts are withheld because they quote the source dictionaries, which are not yet published. `run.json` keeps the dataset checksums, so the run can be checked against the datasets once they are released.', '',
	].join('\n'));
	return to;
}
