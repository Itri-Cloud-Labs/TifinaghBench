import {useState} from 'react';
import {Link} from '@tanstack/react-router';
import type {PricedRun} from '../data/findings';
import {useI18n} from '../lib/lang';
import {LabLogo} from './LabLogo';

const size = {width: 720, height: 380, left: 44, right: 32, top: 12, bottom: 56};
const plot = {width: size.width - size.left - size.right, height: size.height - size.top - size.bottom};
const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const radius = 7;
const charWidth = 7.4;
const labelHeight = 16;
// The chart scales down to about half size on phones, so its axis text starts larger there.
const axisText = 'text-[22px] sm:text-xs';

type Box = {x: number; y: number; width: number; height: number};
const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

// Tries each side of each dot in turn, and takes the first spot clear of the dots, the labels so far and the plot's edges.
function placeLabels(points: {key: string; label: string; x: number; y: number}[]) {
	const dots = points.map(point => ({x: point.x - radius, y: point.y - radius, width: radius * 2, height: radius * 2}));
	const placed: Box[] = [];
	return new Map(points.map(point => {
		const width = point.label.length * charWidth;
		const sides = [
			{x: point.x + radius + 4, anchor: 'start', y: point.y},
			{x: point.x - radius - 4, anchor: 'end', y: point.y},
			{x: point.x, anchor: 'middle', y: point.y - radius - 10},
			{x: point.x, anchor: 'middle', y: point.y + radius + 10},
		] as const;
		const box = (side: (typeof sides)[number]): Box => ({
			x: side.anchor === 'start' ? side.x : side.anchor === 'end' ? side.x - width : side.x - width / 2,
			y: side.y - labelHeight / 2,
			width,
			height: labelHeight,
		});
		const fits = (item: Box) => item.x >= size.left && item.x + item.width <= size.width - size.right && item.y >= 0 && item.y + item.height <= size.top + plot.height;
		const side = sides.find(option => {
			const item = box(option);
			return fits(item) && !dots.some(dot => overlaps(item, dot)) && !placed.some(other => overlaps(item, other));
		}) ?? sides[0];
		placed.push(box(side));
		return [point.key, side];
	}));
}

// Cost against score for every run with a known cost. Cost spans two orders of magnitude, so its axis is logarithmic.
export function CostChart({runs, caption}: {runs: PricedRun[]; caption: string}) {
	const {lang, t, f} = useI18n();
	const copy = t.findings.value;
	const [active, setActive] = useState<string | null>(null);
	const [table, setTable] = useState(false);

	const costs = runs.map(run => run.cost);
	const low = steps.findLast(step => step <= Math.min(...costs)) ?? steps[0]!;
	const high = steps.find(step => step >= Math.max(...costs)) ?? steps.at(-1)!;
	const top = Math.ceil(Math.max(...runs.map(run => run.score.value)) / 10) * 10;
	const scaleX = (cost: number) => size.left + (Math.log(cost / low) / Math.log(high / low)) * plot.width;
	const scaleY = (score: number) => size.top + plot.height - (score / top) * plot.height;
	const xTicks = steps.filter(step => step >= low && step <= high);
	const yTicks = Array.from({length: top / 10 + 1}, (_, index) => index * 10);

	const points = runs.map(run => ({key: run.slug, label: run.name, x: scaleX(run.cost), y: scaleY(run.score.value)}));
	const labels = placeLabels(points);
	const current = runs.find(run => run.slug === active);

	return (
		<figure>
			<p className="mb-2 hidden min-h-5 text-sm text-ink-2 sm:block" aria-hidden="true">
				{current ? <><span className="font-semibold text-ink">{current.name}</span> · <span className="num">{f.usd(current.cost)}</span> · <span className="num">{f.score(current.score.value)}</span></> : copy.hint}
			</p>
			<svg viewBox={`0 0 ${size.width} ${size.height}`} className="block w-full" aria-hidden="true">
				{yTicks.map(tick => (
					<g key={tick}>
						<line x1={size.left} x2={size.width - size.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke={tick === 0 ? 'var(--rule-strong)' : 'var(--rule)'} />
						<text x={size.left - 8} y={scaleY(tick)} dy="0.32em" textAnchor="end" className={`num fill-ink-3 ${axisText}`}>{tick}</text>
					</g>
				))}
				{xTicks.map(tick => (
					<g key={tick}>
						<line x1={scaleX(tick)} x2={scaleX(tick)} y1={size.top} y2={size.top + plot.height} stroke="var(--rule)" />
						<text x={scaleX(tick)} y={size.top + plot.height + 22} textAnchor="middle" className={`num fill-ink-3 ${axisText}`}>{f.usdShort(tick)}</text>
					</g>
				))}
				<text x={size.left + plot.width / 2} y={size.height - 4} textAnchor="middle" className={`fill-ink-2 ${axisText}`}>{copy.axis}</text>
				{runs.map((run, index) => {
					const point = points[index]!;
					const side = labels.get(run.slug)!;
					return (
						<g key={run.slug} opacity={active !== null && active !== run.slug ? 0.45 : 1} className="transition-opacity duration-150" onMouseEnter={() => setActive(run.slug)} onMouseLeave={() => setActive(null)}>
							<circle cx={point.x} cy={point.y} r={16} fill="transparent" />
							<circle cx={point.x} cy={point.y} r={radius} fill="var(--pair-b)" stroke="var(--slip)" strokeWidth={2} />
							<text x={side.x} y={side.y} dy="0.32em" textAnchor={side.anchor} className="fill-ink hidden text-[13px] font-semibold sm:block">{run.name}</text>
						</g>
					);
				})}
			</svg>
			<figcaption className="mt-3 max-w-[62ch] text-sm text-ink-2">{caption}</figcaption>
			{/* Dots go unlabelled on phones, so the table stays open there. */}
			<button type="button" onClick={() => setTable(open => !open)} aria-expanded={table} className="mt-4 hidden text-sm font-semibold text-link underline underline-offset-2 sm:inline">
				{table ? t.findings.hideTable : t.findings.table}
			</button>
			<div className={`${table ? 'sm:mt-3' : 'sm:sr-only'} mt-3 overflow-x-auto text-sm`}>
				<table className="w-full min-w-[20rem]">
					<caption className="sr-only">{caption}</caption>
					<thead>
						<tr className="border-b border-rule-strong">
							<th scope="col" className="label py-2 pr-4 text-left">{t.home.model}</th>
							<th scope="col" className="label py-2 pl-4 text-right">{copy.cost}</th>
							<th scope="col" className="label py-2 pl-4 text-right">{copy.score}</th>
						</tr>
					</thead>
					<tbody>
						{runs.map(run => (
							<tr key={run.slug} className="border-b border-rule">
								<th scope="row" className="py-2 pr-4 text-left font-normal">
									<Link to="/$lang/models/$slug" params={{lang, slug: run.slug}} className="inline-flex items-center gap-2"><LabLogo lab={run.lab} className="shrink-0" />{run.name}</Link>
								</th>
								<td className="num py-2 pl-4 text-right">{f.usd(run.cost)}</td>
								<td className="num py-2 pl-4 text-right">{f.score(run.score.value)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</figure>
	);
}
