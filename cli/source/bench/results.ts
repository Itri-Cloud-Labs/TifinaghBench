import fs from 'node:fs';
import path from 'node:path';
import type {BenchConfig} from '../options.js';
import {dialects, tasks} from '../options.js';
import type {Aggregate, BatchRecord, Item, RunInfo, Summary} from './model.js';
import type {Usage} from './types.js';

export function addUsage(values: Array<Usage | null>): Usage | null {
	const known = values.filter((value): value is Usage => value !== null);
	if (!known.length) return null;
	const result: Usage = {input: 0, output: 0};
	for (const value of known) {
		result.input += value.input;
		result.output += value.output;
		if (value.reasoning !== undefined) result.reasoning = (result.reasoning ?? 0) + value.reasoning;
		if (value.cachedInput !== undefined) result.cachedInput = (result.cachedInput ?? 0) + value.cachedInput;
	}

	return result;
}

export function addCost(values: Array<number | null>): number | null {
	const known = values.filter((value): value is number => value !== null);
	return known.length ? known.reduce((sum, value) => sum + value, 0) : null;
}

export function aggregate(items: Item[]): Aggregate {
	const scored = items.filter(item => item.error === null && item.score !== null);
	const cer = scored.flatMap(item => item.cer === undefined ? [] : [item.cer]);
	return {score: scored.length ? scored.reduce((sum, item) => sum + item.score!, 0) / scored.length : null,
		correct: scored.filter(item => item.grade === 'correct').length,
		partial: scored.filter(item => item.grade === 'partial').length,
		wrong: scored.filter(item => item.grade === 'wrong').length,
		errors: items.filter(item => item.error !== null).length, n: items.length, scored: scored.length,
		...(cer.length ? {mean_cer: cer.reduce((sum, value) => sum + value, 0) / cer.length} : {})};
}

export function summarize(items: Item[], config: BenchConfig): Summary {
	return {overall: aggregate(items),
		by_task: Object.fromEntries(config.tasks.map(task => [task, aggregate(items.filter(item => item.task === task))])),
		by_dialect: Object.fromEntries(config.dialects.map(dialect => [dialect, aggregate(items.filter(item => item.dialect === dialect))])),
		by_dialect_and_task: Object.fromEntries(config.dialects.map(dialect => [dialect,
			Object.fromEntries(config.tasks.map(task => [task, aggregate(items.filter(item => item.dialect === dialect && item.task === task))]))]))};
}

export const percent = (score: number | null | undefined): string => score == null ? '—' : `${(score * 100).toFixed(1)}%`;
const cell = (value: unknown) => String(value ?? '').replaceAll('|', '\\|').replaceAll(/[\r\n]+/g, ' ');

export function summaryTable(config: BenchConfig, summary: Summary): string {
	const labels = config.tasks.map(task => tasks.find(choice => choice.value === task)!.label);
	return [
		`| Dialect | ${labels.join(' | ')} | All tasks |`,
		`| --- | ${labels.map(() => '---:').join(' | ')} | ---: |`,
		...config.dialects.map(dialect => `| ${dialects.find(choice => choice.value === dialect)!.label} | ${config.tasks.map(task => percent(summary.by_dialect_and_task[dialect]?.[task]?.score)).join(' | ')} | ${percent(summary.by_dialect[dialect]?.score)} |`),
		`| All dialects | ${config.tasks.map(task => percent(summary.by_task[task]?.score)).join(' | ')} | ${percent(summary.overall.score)} |`,
	].join('\n');
}

export function report(config: BenchConfig, run: RunInfo, summary: Summary, items: Item[]): string {
	const overall = summary.overall;
	const mistakes = items.filter(item => item.grade === 'wrong' || item.grade === 'partial').slice(0, 5);
	return [
		`# ${cell(config.model)} on ${config.harness} (reasoning: ${config.reasoning})`, '',
		`Status: ${run.status}${run.message ? ` — ${cell(run.message)}` : ''}`, '',
		`${config.sampleSize} words per dialect · batch size ${config.batchSize} · seed ${config.seed} · ${run.duration_s.toFixed(1)} s`, '',
		`Model cost: ${run.cost_usd === null ? 'unreported' : '$' + run.cost_usd.toFixed(4)} · Judge cost: ${run.judge.cost_usd === null ? 'unreported' : '$' + run.judge.cost_usd.toFixed(4)}. Reported costs are sums of known costs; unreported calls are not estimated.`, '',
		...(config.judge ? [`Tifinagh → English judged by ${cell(config.judge.model)} on ${config.judge.harness}.`, ''] : []),
		`**Overall score: ${percent(overall.score)}** (${overall.correct} correct, ${overall.partial} partial, ${overall.wrong} wrong, ${overall.errors} errors; ${run.items.pending} pending, ${run.items.skipped} skipped)`, '',
		`${run.sessions.done} sessions (${run.sessions.answers} answer, ${run.sessions.judge} judge); ${run.judge_skipped_by_exact_sense} judge calls skipped by exact sense. Item latency is answer-batch latency. Compare scores only at the same batch size.`, '',
		summaryTable(config, summary), '',
		'## Character error rate', '', '| Task | Mean CER |', '| --- | ---: |',
		...config.tasks.filter(task => task !== 'tif-to-en').map(task => `| ${task} | ${summary.by_task[task]?.mean_cer?.toFixed(4) ?? '—'} |`), '',
		'## Example mistakes', '', '| Dialect | Task | Input | Expected | Model answer |', '| --- | --- | --- | --- | --- |',
		...mistakes.map(item => `| ${item.dialect} | ${item.task} | ${cell(item.input)} | ${cell(item.expected.join(' / '))} | ${cell(item.answer)} |`),
		...(mistakes.length ? [] : ['No scored wrong or partial answers.']), '',
		'## Errors', '', `${overall.errors} errors are excluded from scores. Item results are in items.jsonl and session attempts in transcripts/; resume retries pending/error items.`, '',
		...items.filter(item => item.error).slice(0, 10).map(item => `- ${item.id}: ${cell(item.error!.message)}`), '',
	].join('\n');
}

function canonical(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
	if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
	return JSON.stringify(value);
}

export function writeJson(file: string, value: unknown): void {
	const temporary = `${file}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, '\t')}\n`);
	fs.renameSync(temporary, file);
}

export function openResults(config: BenchConfig) {
	fs.mkdirSync(config.output, {recursive: true});
	const configFile = path.join(config.output, 'config.json');
	const itemFile = path.join(config.output, 'items.jsonl');
	if (fs.existsSync(configFile)) {
		if (canonical(JSON.parse(fs.readFileSync(configFile, 'utf8'))) !== canonical(config)) {
			throw new Error(`Results folder ${config.output} has a different config. Use a new --output folder.`);
		}
	} else {
		if (['items.jsonl', 'run.json', 'prompts.jsonl'].some(file => fs.existsSync(path.join(config.output, file)))) {
			throw new Error('Results exist without config.json; use a new --output folder.');
		}

		writeJson(configFile, config);
	}

	const items = new Map<string, Item>();
	if (fs.existsSync(itemFile)) {
		const contents = fs.readFileSync(itemFile, 'utf8');
		const lines = contents.split('\n');
		let validBytes = 0;
		for (let index = 0; index < lines.length; index++) {
			const line = lines[index]!;
			if (!line.trim()) continue;
			let item: Item;
			try {
				item = JSON.parse(line) as Item;
			} catch (error) {
				// Only an unterminated final line can be a crash during append.
				if (index !== lines.length - 1) throw new Error(`Invalid items.jsonl line ${index + 1}: ${String(error)}`);
				fs.truncateSync(itemFile, validBytes);
				break;
			}

			if (typeof item.id !== 'string' || !('error' in item)) throw new Error(`Invalid item at line ${index + 1}.`);
			items.delete(item.id);
			items.set(item.id, item);
			validBytes += Buffer.byteLength(line + (index < lines.length - 1 ? '\n' : ''));
		}

		if (fs.statSync(itemFile).size && !fs.readFileSync(itemFile, 'utf8').endsWith('\n')) fs.appendFileSync(itemFile, '\n');
	} else fs.writeFileSync(itemFile, '');

	const transcriptDir = path.join(config.output, 'transcripts');
	fs.mkdirSync(transcriptDir, {recursive: true});
	const batches: BatchRecord[] = fs.readdirSync(transcriptDir).filter(name => name.endsWith('.json')).map(name =>
		JSON.parse(fs.readFileSync(path.join(transcriptDir, name), 'utf8')) as BatchRecord).sort((a, b) => a.sequence - b.sequence);
	const append = (item: Item) => {
		fs.appendFileSync(itemFile, `${JSON.stringify(item)}\n`);
		items.delete(item.id);
		items.set(item.id, item);
	};
	// A transcript is committed before item appends. Replay only newer snapshots.
	for (const batch of batches) {
		for (const item of batch.items) if ((items.get(item.id)?.revision ?? 0) < item.revision) append(item);
	}

	return {items, batches, appendBatch(batch: BatchRecord) {
		writeJson(path.join(transcriptDir, `${batch.batch_id}.json`), batch);
		batches.push(batch);
		for (const item of batch.items) append(item);
	}};
}
