import type {Run} from './runs';
import {rankedRuns} from './runs';
import type {Dialect, Task} from './schema';
import {dialects, meaningTasks} from './schema';
import {cellMoments} from './stats';

// Numbers behind the Findings page. Every headline there is computed from these, so it stays true as runs are added.
type Scored = Run & {score: NonNullable<Run['score']>; script: NonNullable<Run['script']>};

const cellMean = (run: Run, dialect: Dialect, task: Task) => {
	const cell = run.summary.by_dialect_and_task[dialect]?.[task];
	return cell && cell.n > 0 ? cellMoments(cell).mean * 100 : null;
};
const mean = (values: (number | null)[]) => {
	const present = values.filter((value): value is number => value !== null);
	return present.length === values.length && present.length > 0 ? present.reduce((sum, value) => sum + value, 0) / present.length : null;
};
export const median = (values: number[]) => {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

// Ranked runs only, in leaderboard order, so every chart lists the models the same way.
export const findingRuns = (): Scored[] => rankedRuns().filter((run): run is Scored => run.score !== null && run.script !== null);

// OpenAI's standard API prices in US dollars per million tokens, from https://developers.openai.com/api/docs/pricing (checked 2026-11-01).
const apiPrices: Record<string, {input: number; cachedInput: number; output: number}> = {
	'gpt-6-astra': {input: 10, cachedInput: 1, output: 50},
	'gpt-6-luna': {input: 0.1, cachedInput: 0.01, output: 0.5},
	'gpt-6.1-sol': {input: 2, cachedInput: 0.1, output: 10},
	'gpt-6.1-terra': {input: 1, cachedInput: 0.05, output: 5},
};

// Codex reports no cost, so its runs are estimated from their tokens. Cached input is part of input, and reasoning part of output.
export const estimatedCost = (run: Run) => {
	const prices = apiPrices[run.model];
	if (run.harness !== 'codex' || !prices) return null;
	const {input, cachedInput, output} = run.info.tokens;
	return ((input - cachedInput) * prices.input + cachedInput * prices.cachedInput + output * prices.output) / 1_000_000;
};

// What the model's answers cost, without judging: reported where the harness gives a cost, estimated otherwise.
export const runCost = (run: Run) => {
	const estimate = estimatedCost(run);
	if (estimate !== null) return estimate;
	const cost = run.info.cost_usd;
	return run.harness !== 'codex' && typeof cost === 'number' && cost > 0 ? cost : null;
};
export type PricedRun = Scored & {cost: number; estimated: boolean};
export const pricedRuns = (): PricedRun[] => findingRuns().flatMap(run => {
	const cost = runCost(run);
	return cost === null ? [] : [{...run, cost, estimated: estimatedCost(run) !== null}];
});

// The best-value runs, cheapest first: no cheaper run scores higher.
export const bestValue = <T extends {cost: number; score: {value: number}}>(priced: T[]): T[] => {
	let top = -Infinity;
	return [...priced].sort((a, b) => a.cost - b.cost || b.score.value - a.score.value).filter(run => {
		if (run.score.value <= top) return false;
		top = run.score.value;
		return true;
	});
};

// Tifinagh → English and English → Tifinagh, each averaged over the three dialects.
export const directions = (run: Run) => ({
	read: mean(dialects.map(dialect => cellMean(run, dialect, 'tif-to-en'))),
	write: mean(dialects.map(dialect => cellMean(run, dialect, 'en-to-tif'))),
});

// The meaning score of each dialect: its two meaning cells, averaged.
export const dialectScores = (run: Run) =>
	Object.fromEntries(dialects.map(dialect => [dialect, mean(meaningTasks.map(task => cellMean(run, dialect, task)))])) as Record<Dialect, number | null>;

// What accepting the standard spelling conventions adds, in points.
export const conventions = (run: Scored) => ({
	scriptStrict: run.scriptStrict,
	script: run.script.value,
	meaningStrict: run.scoreStrict,
	meaning: run.score.value,
});

// English → Tifinagh character error rate over all answers, in percent of the expected word's length.
export const writingCer = (run: Run) => {
	const cer = run.summary.by_task['en-to-tif']?.mean_cer;
	return cer === undefined ? null : cer * 100;
};

// The dialect most models find easiest, and how many of them.
export function easiestDialect(rows: Run[]) {
	const counts = new Map<Dialect, number>();
	for (const run of rows) {
		const scores = dialectScores(run);
		const best = dialects.reduce<Dialect | null>((top, dialect) => (scores[dialect] !== null && (top === null || scores[dialect]! > scores[top]!) ? dialect : top), null);
		if (best) counts.set(best, (counts.get(best) ?? 0) + 1);
	}
	const [dialect, count] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
	return {dialect, count};
}
