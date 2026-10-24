import {useEffect, useRef, useState} from 'react';
import {Link} from '@tanstack/react-router';
import type {Run} from '../data/runs';
import {useI18n} from '../lib/lang';

type Scored = Run & {score: NonNullable<Run['score']>; script: NonNullable<Run['script']>};

const median = (values: number[]) => {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

// The SVG is drawn at the container's real width, so text keeps its size from phones to desktops.
function useWidth(initial: number) {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(initial);
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const observer = new ResizeObserver(([entry]) => entry && setWidth(Math.round(entry.contentRect.width)));
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	return [ref, width] as const;
}

// The cliff: one line per run from its script score (left) down to its TifinaghBench score (right), both on 0–100.
// Every line falls, which is the finding: models read the script but do not know the words.
export function Cliff({runs}: {runs: Run[]}) {
	const {lang, t, f} = useI18n();
	const [ref, width] = useWidth(760);
	const [active, setActive] = useState<string | null>(null);
	const points = runs.filter((run): run is Scored => run.score !== null && run.script !== null);
	if (points.length === 0) return null;

	const narrow = width < 520;
	const height = narrow ? 440 : 500;
	const labelSize = narrow ? 12 : 13;
	const left = 34;
	const right = width - Math.min(narrow ? 178 : 230, width * 0.5);
	const top = 52;
	const bottom = height - 16;
	const y = (value: number) => bottom - (Math.min(100, Math.max(0, value)) / 100) * (bottom - top);
	const ticks = [0, 25, 50, 75, 100];

	// Names sit right of the right axis in score order, at least one line apart, pulled up if they run off the bottom.
	const sorted = [...points].sort((a, b) => b.score.value - a.score.value);
	const gap = labelSize + 6;
	const positions = new Map<string, number>();
	let cursor = -Infinity;
	for (const run of sorted) {
		cursor = Math.max(y(run.score.value), cursor + gap);
		positions.set(run.slug, cursor);
	}
	const overflow = Math.max(0, cursor - bottom);
	if (overflow > 0) for (const [slug, value] of positions) positions.set(slug, value - overflow);

	const scriptMedian = median(points.map(run => run.script.value));
	const scoreMedian = median(points.map(run => run.score.value));
	const dropText = t.home.cliff.points(f.integer(Math.round(scriptMedian - scoreMedian)));
	const fromText = t.home.cliff.from(f.score(scriptMedian), f.score(scoreMedian));

	return (
		<figure>
			{narrow && (
				<p className="mb-4" aria-hidden="true">
					<span className="label block">{t.home.cliff.drop}</span>
					<span className="block text-3xl font-semibold text-link">{dropText}</span>
					<span className="block text-xs text-ink-2">{fromText}</span>
				</p>
			)}
			<div ref={ref}>
				<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block h-auto max-w-full" role="img" aria-labelledby="cliff-title cliff-desc">
					<title id="cliff-title">{t.home.cliffTitle}</title>
					<desc id="cliff-desc">{sorted.map(run => t.home.cliff.describe(run.name, f.score(run.script.value), f.score(run.score.value))).join('; ')}</desc>

					{/* Axis titles */}
					<text x={left} y={16} className="fill-ink text-[13px] font-semibold">{t.home.cliff.left}</text>
					<text x={left} y={32} className="fill-ink-3 text-[12px]">{t.home.cliff.leftSub}</text>
					<text x={narrow ? right + 4 : right} y={16} textAnchor={narrow ? 'start' : 'end'} className="fill-ink text-[13px] font-semibold">{t.home.cliff.right}</text>
					<text x={narrow ? right + 4 : right} y={32} textAnchor={narrow ? 'start' : 'end'} className="fill-ink-3 text-[12px]">{t.home.cliff.rightSub}</text>

					{/* Grid and axes */}
					{ticks.map(tick => (
						<g key={tick}>
							<line x1={left} x2={right} y1={y(tick)} y2={y(tick)} stroke="var(--rule)" />
							<text x={left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="num fill-ink-3 text-[12px]">{tick}</text>
						</g>
					))}
					<line x1={left} x2={left} y1={y(100)} y2={y(0)} stroke="var(--rule-strong)" />
					<line x1={right} x2={right} y1={y(100)} y2={y(0)} stroke="var(--rule-strong)" />

					{/* The median drop sits in the empty lower-left triangle; narrow charts show it above instead */}
					{!narrow && (
						<g aria-hidden="true">
							<text x={left + 14} y={y(26)} className="fill-ink-2 text-[12px] font-semibold tracking-[0.06em] uppercase">{t.home.cliff.drop}</text>
							<text x={left + 14} y={y(26) + 38} className="fill-link text-[36px] font-semibold">{dropText}</text>
							<text x={left + 14} y={y(26) + 60} className="fill-ink-2 text-[12px]">{fromText}</text>
						</g>
					)}

					{/* Runs: inactive lines first, the active one on top */}
					{[...sorted].sort((a, b) => Number(a.slug === active) - Number(b.slug === active)).map(run => {
						const y1 = y(run.script.value);
						const y2 = y(run.score.value);
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
								aria-label={t.home.cliff.describe(run.name, f.score(run.script.value), f.score(run.score.value))}
							>
								<g opacity={dim ? 0.22 : 1} className="transition-opacity duration-150">
									<line x1={left} y1={y1} x2={right} y2={y2} stroke={on ? 'var(--series-1)' : 'var(--ink-3)'} strokeWidth={on ? 2.5 : 1.5} />
									<line x1={left} y1={y1} x2={right} y2={y2} stroke="transparent" strokeWidth="14" />
									<circle cx={left} cy={y1} r={on ? 6.5 : 5} fill={on ? 'var(--series-1)' : 'var(--mark)'} stroke="var(--slip)" strokeWidth="2" />
									<circle cx={right} cy={y2} r={on ? 6.5 : 5} fill={on ? 'var(--series-1)' : 'var(--mark)'} stroke="var(--slip)" strokeWidth="2" />
									{on && <text x={left + 12} y={y1 - 10} stroke="var(--slip)" strokeWidth="4" paintOrder="stroke" className="num fill-link text-[13px] font-semibold">{f.score(run.script.value)}</text>}
									{Math.abs(labelY - y2) > 1 && <path d={`M${right + 7} ${y2} L${right + 12} ${labelY}`} fill="none" stroke="var(--rule-strong)" />}
									<text x={right + 16} y={labelY} dy="0.33em" className={on ? 'fill-ink font-semibold' : 'fill-ink-2'} style={{fontSize: labelSize}}>
										{run.name}
										<tspan className="num fill-ink-3" dx="6">{f.score(run.score.value)}</tspan>
									</text>
									<rect x={right + 12} y={labelY - gap / 2} width={width - right - 12} height={gap} fill="transparent" />
								</g>
							</Link>
						);
					})}
				</svg>
			</div>
		</figure>
	);
}
