import {useState} from 'react';
import {Link} from '@tanstack/react-router';
import type {Run} from '../data/runs';
import {useI18n} from '../lib/lang';
import {useWidth} from '../lib/useWidth';
import {LabLogo} from './LabLogo';

type Ranked = Run & {score: NonNullable<Run['score']>; rank: number};

// The leaderboard as columns, best first: score on top, lab and name underneath, the 95% interval as a whisker.
// Tied models share a shaded band. The axis stops at the next ten above the highest interval so the gaps stay readable.
export function LeaderboardChart({runs}: {runs: Run[]}) {
	const {lang, t, f} = useI18n();
	const [ref, width] = useWidth(960);
	const [active, setActive] = useState<string | null>(null);
	const ranked = runs.filter((run): run is Ranked => run.rank !== null && run.score !== null).sort((a, b) => a.rank - b.rank || b.score.value - a.score.value);
	if (ranked.length === 0) return null;

	// Names hang down-left at 45°, so the first columns need room on the left and the chart needs room below.
	// Columns never get narrower than 46px; below that the chart scrolls sideways inside its box.
	const reach = (run: Run) => run.name.length * 6.6 * Math.SQRT1_2;
	const right = 8;
	const plotWidth = Math.max(width, 36 + right + ranked.length * 46);
	const roughBand = (plotWidth - 36 - right) / ranked.length;
	const left = Math.max(36, ...ranked.map((run, index) => reach(run) + 4 - roughBand * (index + 0.5)));
	const band = (plotWidth - left - right) / ranked.length;
	const barWidth = Math.min(40, band * 0.62);
	const top = 30;
	const plotHeight = 300;
	const bottom = top + plotHeight;
	const logoSize = 18;
	const height = bottom + logoSize + 30 + Math.max(...ranked.map(reach));
	const max = Math.ceil(Math.max(...ranked.map(run => run.score.high)) / 10) * 10;
	const y = (value: number) => bottom - (Math.min(max, Math.max(0, value)) / max) * plotHeight;
	const x = (index: number) => left + band * index + band / 2;
	const ticks = Array.from({length: max / 10 + 1}, (_, index) => index * 10);

	// Consecutive runs with the same tier form a tied group.
	const groups: {from: number; to: number}[] = [];
	ranked.forEach((run, index) => {
		const last = groups.at(-1);
		if (last && ranked[last.from]!.tier === run.tier) last.to = index;
		else groups.push({from: index, to: index});
	});

	return (
		<figure>
			<div ref={ref} className="overflow-x-auto">
				<svg width={plotWidth} height={height} viewBox={`0 0 ${plotWidth} ${height}`} className="block" role="img" aria-labelledby="board-chart-title board-chart-desc">
					<title id="board-chart-title">{t.home.chart.title}</title>
					<desc id="board-chart-desc">{ranked.map(run => `${run.rank}. ${run.name}: ${f.score(run.score.value)}`).join('; ')}</desc>

					{groups.filter(group => group.to > group.from).map(group => (
						<rect key={group.from} x={x(group.from) - band / 2 + 2} y={top - 24} width={band * (group.to - group.from + 1) - 4} height={plotHeight + 24} rx="3" fill="var(--slip-3)" />
					))}

					{ticks.map(tick => (
						<g key={tick}>
							<line x1={left} x2={plotWidth - right} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? 'var(--rule-strong)' : 'var(--rule)'} />
							<text x={left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="num fill-ink-3 text-[12px]">{tick}</text>
						</g>
					))}

					{ranked.map((run, index) => {
						const cx = x(index);
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
								aria-label={`${run.rank}. ${run.name}: ${f.score(run.score.value)}, ${t.model.interval(f.score(run.score.low), f.score(run.score.high))}`}
							>
								<g opacity={dim ? 0.35 : 1} className="transition-opacity duration-150">
									<rect x={cx - band / 2} y={top - 24} width={band} height={height - top + 24} fill="transparent" />
									<rect x={cx - barWidth / 2} y={y(run.score.value)} width={barWidth} height={bottom - y(run.score.value)} rx="2" fill={on ? 'var(--ramp-5)' : 'var(--ramp-3)'} />
									<g stroke="var(--mark)" strokeWidth="1.5">
										<line x1={cx} x2={cx} y1={y(run.score.low)} y2={y(run.score.high)} />
										<line x1={cx - 4} x2={cx + 4} y1={y(run.score.high)} y2={y(run.score.high)} />
										<line x1={cx - 4} x2={cx + 4} y1={y(run.score.low)} y2={y(run.score.low)} />
									</g>
									<text x={cx} y={y(run.score.high) - 7} textAnchor="middle" className="num fill-ink text-[12px] font-semibold">{f.score(run.score.value)}</text>
									<LabLogo lab={run.lab} size={logoSize} x={cx - logoSize / 2} y={bottom + 10} className={on ? 'text-ink' : 'text-ink-2'} />
									<text x={cx} y={bottom + logoSize + 22} transform={`rotate(-45 ${cx} ${bottom + logoSize + 22})`} textAnchor="end" dy="0.33em" className={`text-[12px] ${on ? 'fill-ink font-semibold' : 'fill-ink-2'}`}>
										{run.name}
									</text>
								</g>
							</Link>
						);
					})}
				</svg>
			</div>
			<figcaption className="mt-3 text-xs text-ink-3">{t.home.chart.caption}</figcaption>
		</figure>
	);
}
