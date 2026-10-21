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
