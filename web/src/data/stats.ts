import type {Cell, Config, Dialect, Summary, Task} from './schema';
import {dialects, meaningTasks} from './schema';

export type Estimate = {value: number; se: number; low: number; high: number};

// One question scores 1 (correct), 0.5 (partial) or 0 (wrong or failed). Failed questions stay in n.
export function cellMoments(cell: Cell): {mean: number; variance: number} {
	if (cell.n === 0) return {mean: 0, variance: 0};
	const mean = (cell.correct + 0.5 * cell.partial) / cell.n;
	const square = (cell.correct + 0.25 * cell.partial) / cell.n;
	return {mean, variance: Math.max(0, square - mean * mean) / cell.n};
}

// Equal-weight mean of cells on a 0–100 scale, with a normal 95% interval.
export function cellAverage(cells: Cell[]): Estimate {
	const scale = 100 / cells.length;
	let value = 0;
	let variance = 0;
	for (const cell of cells) {
		const moments = cellMoments(cell);
		value += moments.mean;
		variance += moments.variance;
	}
	const se = scale * Math.sqrt(variance);
	value *= scale;
	return {value, se, low: value - 1.96 * se, high: value + 1.96 * se};
}

export function cellsFor(summary: Summary, which: 'meaning' | 'script'): Cell[] {
	const chosen: readonly Task[] = which === 'meaning' ? meaningTasks : ['transliterate'];
	const cells: Cell[] = [];
	for (const dialect of dialects) {
		for (const task of chosen) {
			const cell = summary.by_dialect_and_task[dialect]?.[task];
			if (cell) cells.push(cell);
		}
	}
	return cells;
}

export function tifinaghBench(summary: Summary): Estimate | null {
	const cells = cellsFor(summary, 'meaning');
	return summary.tifinaghbench === null || cells.length !== 6 ? null : cellAverage(cells);
}

export function scriptScore(summary: Summary): Estimate | null {
	const cells = cellsFor(summary, 'script');
	return summary.script_score === null || cells.length !== 3 ? null : cellAverage(cells);
}

export const tied = (a: Estimate, b: Estimate) => Math.abs(a.value - b.value) < 1.96 * Math.hypot(a.se, b.se);

// Sorted descending; a new tier starts at the first entry that is not tied with the current tier's leader.
export function tiers<T>(entries: T[], estimate: (entry: T) => Estimate): T[][] {
	const sorted = [...entries].sort((a, b) => estimate(b).value - estimate(a).value);
	const groups: T[][] = [];
	for (const entry of sorted) {
		const current = groups.at(-1);
		if (current && tied(estimate(current[0]!), estimate(entry))) current.push(entry);
		else groups.push([entry]);
	}
	return groups;
}

export const officialSetup = {
	judge: {harness: 'claude-code', model: 'claude-haiku-5-5'},
	sampleSize: '1000',
	seed: 1,
	batchSize: 100,
	dialects: [...dialects] as Dialect[],
	tasks: ['tif-to-en', 'en-to-tif', 'transliterate'] as Task[],
};

export type SetupDifference =
	| {field: 'judge'; value: string}
	| {field: 'sampleSize'; value: string}
	| {field: 'seed'; value: string}
	| {field: 'batchSize'; value: string}
	| {field: 'dialects'; value: string}
	| {field: 'tasks'; value: string};

export function setupDifferences(config: Config): SetupDifference[] {
	const differences: SetupDifference[] = [];
	const judge = config.judge ? `${config.judge.model} (${config.judge.harness})` : 'none';
	if (config.judge?.harness !== officialSetup.judge.harness || config.judge?.model !== officialSetup.judge.model) differences.push({field: 'judge', value: judge});
	if (config.sampleSize !== officialSetup.sampleSize) differences.push({field: 'sampleSize', value: config.sampleSize});
	if (config.seed !== officialSetup.seed) differences.push({field: 'seed', value: String(config.seed)});
	if (config.batchSize !== officialSetup.batchSize) differences.push({field: 'batchSize', value: String(config.batchSize)});
	const sameSet = (a: string[], b: string[]) => a.length === b.length && b.every(item => a.includes(item));
	if (!sameSet(config.dialects, officialSetup.dialects)) differences.push({field: 'dialects', value: config.dialects.join(', ')});
	if (!sameSet(config.tasks, officialSetup.tasks)) differences.push({field: 'tasks', value: config.tasks.join(', ')});
	return differences;
}

export const slugFromFolder = (folder: string) => folder.replace(/^\d{4}-\d{2}-\d{2}-/, '');
