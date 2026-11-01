import {execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

// /results is public: scores and run metadata only. Per-question data must never land there.
// Problems name the file and field but never the value, so a failure can't repeat a leak in the public CI log.
const repo = path.resolve(import.meta.dirname, '../..');

const maxBytes: Record<string, number> = {'README.md': 1024, 'config.json': 2048, 'report.md': 4096, 'run.json': 16384, 'summary.json': 8192};
const maxIndexBytes = 32768;
const maxString = 200;
const maxArray = 50;
const tifinaghWord = /[ⴰ-⵿]{2,}/;
// Counts such as `sessions.answers` are fine; these names may only ever hold numbers.
const perQuestionKey = /question|answer|response|transcript|gloss|translation|expected|entries|items|words|senses/i;

function checkJson(value: unknown, where: string, numbersOnly: boolean, problems: string[]) {
	if (typeof value === 'number' || value === null) return;
	if (Array.isArray(value)) {
		if (numbersOnly) problems.push(`${where}: expected a number`);
		if (value.length > maxArray) problems.push(`${where}: list longer than ${maxArray} items`);
		value.forEach((item, index) => checkJson(item, `${where}[${index}]`, numbersOnly, problems));
	} else if (typeof value === 'object') {
		for (const [key, item] of Object.entries(value)) {
			const inner = `${where}.${key}`;
			const isCounts = typeof item === 'object' && item !== null && !Array.isArray(item) && Object.values(item).every(leaf => typeof leaf === 'number');
			if (perQuestionKey.test(key) && typeof item !== 'number' && !isCounts) problems.push(`${inner}: per-question field`);
			checkJson(item, inner, numbersOnly, problems);
		}
	} else if (numbersOnly) {
		problems.push(`${where}: expected a number`);
	} else if (typeof value === 'string' && value.length > maxString) {
		problems.push(`${where}: text longer than ${maxString} characters`);
	}
}

function checkResults(dir: string): string[] {
	const problems: string[] = [];
	const checkText = (file: string, name: string) => {
		if (tifinaghWord.test(fs.readFileSync(file, 'utf8'))) problems.push(`${name}: Tifinagh word`);
	};
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const full = path.join(dir, entry.name);
		if (!entry.isDirectory()) {
			if (entry.name !== 'README.md') problems.push(`${entry.name}: unexpected file`);
			else if (fs.statSync(full).size > maxIndexBytes) problems.push(`${entry.name}: larger than ${maxIndexBytes} bytes`);
			checkText(full, entry.name);
			continue;
		}
		const found = fs.readdirSync(full, {withFileTypes: true});
		for (const expected of Object.keys(maxBytes)) {
			if (!found.some(file => file.name === expected)) problems.push(`${entry.name}/${expected}: missing`);
		}
		for (const file of found) {
			const name = `${entry.name}/${file.name}`;
			const limit = maxBytes[file.name];
			if (!file.isFile() || limit === undefined) {
				problems.push(`${name}: unexpected file`);
				continue;
			}
			const filePath = path.join(full, file.name);
			if (fs.statSync(filePath).size > limit) problems.push(`${name}: larger than ${limit} bytes`);
			checkText(filePath, name);
			if (file.name.endsWith('.json')) checkJson(JSON.parse(fs.readFileSync(filePath, 'utf8')), name, file.name === 'summary.json', problems);
		}
	}
	return problems;
}

describe('public results', () => {
	it('hold only scores and run metadata', () => {
		expect(checkResults(path.join(repo, 'results'))).toEqual([]);
	});

	it('leave the datasets and full benchmark output untracked', () => {
		const tracked = execSync('git ls-files tifinagh-dataset cli/results', {cwd: repo, encoding: 'utf8'}).trim().split('\n');
		expect(tracked).toEqual(['tifinagh-dataset/README.md']);
	});
});

describe('checkResults', () => {
	let dir: string;
	afterEach(() => fs.rmSync(dir, {recursive: true, force: true}));

	// A valid run folder, then one change to it.
	function run(change: Record<string, unknown> = {}) {
		dir = fs.mkdtempSync(path.join(os.tmpdir(), 'results-'));
		const folder = path.join(dir, 'run');
		fs.mkdirSync(folder);
		const files = {'README.md': 'Run', 'report.md': 'Report', 'config.json': '{"model":"m"}', 'run.json': '{"sessions":{"answers":3},"dataset":{"ircam":{"entries":9}},"items":{"total":1}}', 'summary.json': '{"tifinaghbench":1.5,"overall":{"score":null}}', ...change};
		for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(folder, name), String(content));
		return checkResults(dir);
	}

	it('accepts a valid run, including counts named like per-question fields', () => {
		expect(run()).toEqual([]);
	});

	it.each([
		['a per-question file', {'questions.jsonl': '{}'}, 'run/questions.jsonl: unexpected file'],
		['a Tifinagh word', {'report.md': 'ⴰⴱⵛ'}, 'run/report.md: Tifinagh word'],
		['an oversized report', {'report.md': 'x'.repeat(4097)}, 'run/report.md: larger than 4096 bytes'],
		['text in the summary', {'summary.json': '{"note":"x"}'}, 'run/summary.json.note: expected a number'],
		['a per-question field', {'run.json': '{"answers":[{"id":1}]}'}, 'run/run.json.answers: per-question field'],
		['long text', {'run.json': `{"note":"${'x'.repeat(201)}"}`}, 'run/run.json.note: text longer than 200 characters'],
		['a long list', {'run.json': `{"note":[${Array(51).fill(1).join(',')}]}`}, 'run/run.json.note: list longer than 50 items'],
	])('rejects %s', (_, change, problem) => {
		expect(run(change)).toContain(problem);
	});

	it('never repeats the leaked value in its report', () => {
		const secret = 'x'.repeat(201);
		expect(run({'run.json': `{"note":"${secret}"}`}).join('\n')).not.toContain(secret);
	});
});
