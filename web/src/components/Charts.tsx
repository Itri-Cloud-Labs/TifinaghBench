import type {Cell, Dialect, Task} from '../data/schema';
import {dialects, tasks} from '../data/schema';
import {cellMoments} from '../data/stats';
import {useI18n} from '../lib/lang';

// Every score on the site uses this one stepped ochre ramp, so a colour means the same number everywhere.
export const bins = [0, 10, 20, 35, 55, 80] as const;
export const binOf = (score: number) => bins.reduce((index, floor, i) => (score >= floor ? i + 1 : index), 1);
const cellScore = (cell: Cell | undefined) => (cell && cell.n > 0 ? cellMoments(cell).mean * 100 : null);

export function RampLegend() {
	const {f} = useI18n();
	return (
		<div className="flex items-center gap-2 text-xs text-ink-2" aria-hidden="true">
			<span className="num">0</span>
			<span className="flex">
				{bins.map((floor, index) => (
					<span key={floor} className="flex flex-col items-start">
						<span className="block h-3 w-9" style={{background: `var(--ramp-${index + 1})`}} />
						<span className="num mt-1 text-[0.6875rem] text-ink-3">{index === 0 ? '' : f.integer(floor)}</span>
					</span>
				))}
			</span>
			<span className="num">100</span>
		</div>
	);
}

// Dialects × tasks. The transliteration column is set apart: it measures the script, not the words.
export function Heatmap({grid, caption}: {grid: Partial<Record<Dialect, Partial<Record<Task, Cell>>>>; caption: string}) {
	const {t, f} = useI18n();
	const tile = (dialect: Dialect, task: Task) => {
		const cell = grid[dialect]?.[task];
		const score = cellScore(cell);
		const bin = score === null ? 0 : binOf(score);
		return (
			<div
				tabIndex={0}
				className="group relative flex min-h-16 flex-col justify-center rounded-sm px-3 py-2.5 outline-offset-2"
				style={score === null ? {background: 'var(--slip-2)'} : {background: `var(--ramp-${bin})`, color: `var(--on-ramp-${bin})`}}
			>
				<span className="num text-xl font-semibold leading-none">{f.score(score)}</span>
				{cell && (
					<span className="num mt-1 text-xs leading-tight">
						{t.model.cellDetail(cell.correct, cell.partial, cell.wrong, cell.errors, cell.n)}
					</span>
				)}
			</div>
		);
	};
	return (
		<div>
			{/* Phones: one block per dialect, tasks stacked, so no column hides off-screen. */}
			<div className="space-y-6 sm:hidden">
				{dialects.map(dialect => (
					<section key={dialect} aria-label={t.dialect[dialect]}>
						<h3 className="text-sm font-semibold">{t.dialect[dialect]}</h3>
						<dl className="mt-2 space-y-[3px]">
							{tasks.map(task => (
								<div key={task} className={`grid grid-cols-[7rem_1fr] items-center gap-3 ${task === 'transliterate' ? 'pt-2' : ''}`}>
									<dt className="label">{t.task[task]}</dt>
									<dd>{tile(dialect, task)}</dd>
								</div>
							))}
						</dl>
					</section>
				))}
			</div>
			<table className="hidden w-full border-separate border-spacing-[3px] sm:table">
				<caption className="sr-only">{caption}</caption>
				<thead>
					<tr>
						<td />
						{tasks.map(task => (
							<th key={task} scope="col" className={`label pb-2 text-left font-semibold ${task === 'transliterate' ? 'pl-5' : ''}`}>{t.task[task]}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{dialects.map(dialect => (
						<tr key={dialect}>
							<th scope="row" className="pr-4 text-left text-sm font-semibold whitespace-nowrap">{t.dialect[dialect]}</th>
							{tasks.map(task => (
								<td key={task} className={task === 'transliterate' ? 'pl-5' : ''}>{tile(dialect, task)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

// Horizontal bars on the fixed 0–100 scale, value at the tip.
export function Bars({rows, label}: {rows: {key: string; label: string; value: number | null}[]; label: string}) {
	const {f} = useI18n();
	return (
		<ul aria-label={label} className="space-y-3">
			{rows.map(row => (
				<li key={row.key} className="grid grid-cols-[minmax(8rem,11rem)_1fr] items-center gap-4">
					<span className="text-sm text-ink-2">{row.label}</span>
					<span className="flex items-center gap-2">
						<span className="relative h-5 flex-1 border-l border-rule-strong">
							<span className="absolute inset-y-0 left-0 right-0 m-auto h-px bg-rule" />
							{row.value !== null && (
								<span className="absolute inset-y-0 left-0 my-auto h-3.5 rounded-r-[4px]" style={{width: `${Math.max(0.5, row.value)}%`, background: `var(--ramp-${binOf(row.value)})`}} />
							)}
						</span>
						<span className="num w-11 text-right text-sm font-semibold">{f.score(row.value)}</span>
					</span>
				</li>
			))}
		</ul>
	);
}

// Correct / partial / wrong / failed as one 100% bar per dialect, separated by 2px surface gaps.
export function GradeBars({grid}: {grid: Partial<Record<Dialect, Partial<Record<Task, Cell>>>>}) {
	const {t, f} = useI18n();
	const parts = [
		{key: 'correct', label: t.model.correct, color: 'var(--ramp-5)'},
		{key: 'partial', label: t.model.partial, color: 'var(--ramp-2)'},
		{key: 'wrong', label: t.model.wrong, color: 'var(--slip-3)'},
		{key: 'errors', label: t.model.failed, color: 'var(--ink-3)'},
	] as const;
	return (
		<div>
			<ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-2">
				{parts.map(part => (
					<li key={part.key} className="flex items-center gap-1.5">
						<span className="inline-block size-3 rounded-[2px] border border-rule" style={{background: part.color}} />
						{part.label}
					</li>
				))}
			</ul>
			<ul className="space-y-4">
				{dialects.map(dialect => {
					const cell = grid[dialect]?.['tif-to-en'];
					if (!cell || cell.n === 0) return null;
					return (
						<li key={dialect}>
							<p className="mb-1.5 flex justify-between text-sm">
								<span className="text-ink-2">{t.dialect[dialect]}</span>
								<span className="num text-xs text-ink-3">{t.model.cellDetail(cell.correct, cell.partial, cell.wrong, cell.errors, cell.n)}</span>
							</p>
							<span className="flex h-4 gap-[2px]" role="img" aria-label={t.model.cellDetail(cell.correct, cell.partial, cell.wrong, cell.errors, cell.n)}>
								{parts.map(part => {
									const count = cell[part.key];
									if (count === 0) return null;
									return <span key={part.key} title={`${part.label}: ${f.integer(count)}`} className="block h-full first:rounded-l-[2px] last:rounded-r-[2px]" style={{width: `${(count / cell.n) * 100}%`, background: part.color}} />;
								})}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
