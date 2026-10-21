import {useState} from 'react';
import {Link} from '@tanstack/react-router';
import type {Run} from '../data/runs';
import {useI18n} from '../lib/lang';

// Meaning against script, both on the fixed 0–100 scale. The diagonal is "knows the words as well as the script".
export function Scatter({runs}: {runs: Run[]}) {
	const {lang, t, f} = useI18n();
	const [active, setActive] = useState<string | null>(null);
	const points = runs.filter((run): run is Run & {score: NonNullable<Run['score']>; script: NonNullable<Run['script']>} => run.score !== null && run.script !== null);
	const width = 720;
	const height = 440;
	const plot = {left: 52, right: 452, top: 16, bottom: 392};
	const x = (value: number) => plot.left + (value / 100) * (plot.right - plot.left);
	const y = (value: number) => plot.bottom - (value / 100) * (plot.bottom - plot.top);
	const ticks = [0, 25, 50, 75, 100];

	// Labels sit in a column right of the plot, in the points' vertical order, at least 18px apart.
	const sorted = [...points].sort((a, b) => b.score.value - a.score.value);
	const gap = 19;
	const positions = new Map<string, number>();
	let cursor = -Infinity;
	for (const run of sorted) {
		const wanted = y(run.score.value);
		cursor = Math.max(wanted, cursor + gap);
		positions.set(run.slug, cursor);
	}
	const overflow = Math.max(0, cursor - (plot.bottom - 4));
	if (overflow > 0) for (const [slug, value] of positions) positions.set(slug, value - overflow);

	return (
		<figure>
			<svg viewBox={`0 0 ${width} ${height}`} className="hidden h-auto w-full max-w-[48rem] sm:block" role="img" aria-labelledby="scatter-title scatter-desc">
				<title id="scatter-title">{t.home.scatterTitle}</title>
				<desc id="scatter-desc">{points.map(run => `${run.name}: ${f.score(run.score.value)} / ${f.score(run.script.value)}`).join('; ')}</desc>
				{ticks.map(tick => (
					<g key={tick}>
						<line x1={plot.left} x2={plot.right} y1={y(tick)} y2={y(tick)} stroke="var(--rule)" />
						<line x1={x(tick)} x2={x(tick)} y1={plot.top} y2={plot.bottom} stroke="var(--rule)" />
						<text x={plot.left - 10} y={y(tick)} dy="0.32em" textAnchor="end" className="num fill-ink-3 text-[12px]">{tick}</text>
						<text x={x(tick)} y={plot.bottom + 20} textAnchor="middle" className="num fill-ink-3 text-[12px]">{tick}</text>
					</g>
				))}
				<line x1={x(0)} y1={y(0)} x2={x(100)} y2={y(100)} stroke="var(--rule-strong)" />
				<text x={x(34)} y={y(34)} dy="-0.6em" transform={`rotate(-43.2 ${x(34)} ${y(34)})`} className="fill-ink-3 text-[12px]">{t.home.diagonal}</text>
				<text x={(plot.left + plot.right) / 2} y={height - 4} textAnchor="middle" className="fill-ink-2 text-[12.5px] font-semibold">{t.home.scriptAxis}</text>
				<text x={14} y={(plot.top + plot.bottom) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(plot.top + plot.bottom) / 2})`} className="fill-ink-2 text-[12.5px] font-semibold">{t.home.meaningAxis}</text>
				{points.map(run => {
					const px = x(run.script.value);
					const py = y(run.score.value);
					const labelY = positions.get(run.slug)!;
					const on = active === run.slug;
					const dim = active !== null && !on;
					return (
						<Link
							key={run.slug}
							to="/$lang/models/$slug"
							params={{lang, slug: run.slug}}
							onMouseEnter={() => setActive(run.slug)}
							onMouseLeave={() => setActive(null)}
							onFocus={() => setActive(run.slug)}
							onBlur={() => setActive(null)}
							className="no-underline outline-none"
							aria-label={`${run.name}: TifinaghBench ${f.score(run.score.value)}, ${t.home.script} ${f.score(run.script.value)}`}
						>
							<g opacity={dim ? 0.35 : 1} className="transition-opacity duration-150">
								<line x1={x(run.script.low)} x2={x(Math.min(100, run.script.high))} y1={py} y2={py} stroke="var(--ink-3)" strokeWidth="1.25" />
								<line x1={px} x2={px} y1={y(run.score.low)} y2={y(run.score.high)} stroke="var(--ink-3)" strokeWidth="1.25" />
								<path d={`M${px + 7} ${py} C ${px + 40} ${py}, ${plot.right - 10} ${labelY}, ${plot.right + 14} ${labelY}`} fill="none" stroke={on ? 'var(--ink)' : 'var(--rule-strong)'} strokeWidth="1" />
								<circle cx={px} cy={py} r={on ? 6.5 : 5} fill={on ? 'var(--clay)' : 'var(--mark)'} stroke="var(--slip)" strokeWidth="2" />
								<text x={plot.right + 20} y={labelY} dy="0.33em" className={`text-[13px] ${on ? 'fill-ink font-semibold' : 'fill-ink-2'}`}>
									{run.name}
									<tspan className="num fill-ink-3" dx="6">{f.score(run.score.value)}</tspan>
								</text>
								<circle cx={px} cy={py} r="12" fill="transparent" />
							</g>
						</Link>
					);
				})}
			</svg>
			<GapStrips runs={sorted} />
			<figcaption className="mt-3 max-w-[62ch] text-sm text-ink-2">
				<span className="hidden sm:inline">{t.home.scatterCaption}</span>
				<span className="sm:hidden">{t.home.gapCaption}</span>
			</figcaption>
		</figure>
	);
}

// On phones the scatter is too small to read, so each run gets one 0–100 line with both scores on it.
function GapStrips({runs}: {runs: (Run & {score: NonNullable<Run['score']>; script: NonNullable<Run['script']>})[]}) {
	const {lang, t, f} = useI18n();
	return (
		<div className="sm:hidden">
			<p className="flex gap-5 text-xs text-ink-2" aria-hidden="true">
				<span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-clay" />{t.home.meaningAxis}</span>
				<span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-mark" />{t.home.script}</span>
			</p>
			<ol className="mt-3">
				{runs.map(run => (
					<li key={run.slug} className="border-b border-rule py-2.5">
						<Link to="/$lang/models/$slug" params={{lang, slug: run.slug}} className="flex items-baseline justify-between text-sm text-ink no-underline">
							<span className="font-semibold">{run.name}</span>
							<span className="num text-xs text-ink-2">{f.score(run.score.value)} · {f.score(run.script.value)}</span>
						</Link>
						<span className="relative mt-2 block h-3" aria-hidden="true">
							<span className="absolute inset-x-0 top-1/2 h-px bg-rule-strong" />
							<span className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink-3" style={{left: `${run.score.value}%`, right: `${100 - run.script.value}%`}} />
							<span className="absolute top-0 size-3 -translate-x-1/2 rounded-full border-2 border-slip bg-clay" style={{left: `${run.score.value}%`}} />
							<span className="absolute top-0 size-3 -translate-x-1/2 rounded-full border-2 border-slip bg-mark" style={{left: `${run.script.value}%`}} />
						</span>
					</li>
				))}
			</ol>
			<p className="num mt-1 flex justify-between text-[0.75rem] text-ink-3" aria-hidden="true"><span>0</span><span>50</span><span>100</span></p>
		</div>
	);
}
