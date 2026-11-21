import {useEffect, useRef, useState} from 'react';
import {Link} from '@tanstack/react-router';
import type {RaceStep} from '../data/findings';
import type {Run} from '../data/runs';
import {useI18n} from '../lib/lang';
import {PauseIcon, PlayIcon, ReplayIcon} from './Icons';
import {LabLogo} from './LabLogo';
import {ScoreBar} from './ScoreBar';

const rowHeight = 52;
const stepMs = 1200;

// The leaderboard replayed in the order the runs finished: each step adds one model and the board re-sorts around it.
// The page renders the finished board; the replay starts the first time it scrolls into view, unless the reader prefers less motion.
export function Race({runs, steps}: {runs: Run[]; steps: RaceStep[]}) {
	const {lang, t, f} = useI18n();
	const [index, setIndex] = useState(steps.length - 1);
	const [playing, setPlaying] = useState(false);
	const figure = useRef<HTMLElement>(null);

	useEffect(() => {
		const element = figure.current;
		if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting) return;
			observer.disconnect();
			setIndex(0);
			setPlaying(true);
		}, {threshold: 0.35});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!playing) return;
		if (index >= steps.length - 1) {
			setPlaying(false);
			return;
		}
		const timer = setTimeout(() => setIndex(value => value + 1), stepMs);
		return () => clearTimeout(timer);
	}, [playing, index, steps.length]);

	const step = steps[index];
	if (!step) return null;
	const bySlug = new Map(runs.map(run => [run.slug, run]));
	const arrival = bySlug.get(step.slug);
	const atEnd = index === steps.length - 1;
	const toggle = () => {
		if (playing) setPlaying(false);
		else {
			if (atEnd) setIndex(0);
			setPlaying(true);
		}
	};

	return (
		<figure ref={figure}>
			<div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3">
				<div className="flex gap-2">
					<button type="button" onClick={toggle} className="inline-flex size-10 items-center justify-center rounded-sm bg-ink text-slip hover:opacity-90">
						{playing ? <PauseIcon /> : atEnd ? <ReplayIcon /> : <PlayIcon />}
						<span className="sr-only">{playing ? t.findings.race.pause : atEnd ? t.findings.race.replay : t.findings.race.play}</span>
					</button>
				</div>
				<label className="flex min-w-48 flex-1 items-center gap-3">
					<span className="sr-only">{t.findings.race.scrub}</span>
					<input
						type="range"
						min={0}
						max={steps.length - 1}
						value={index}
						onChange={event => {
							setPlaying(false);
							setIndex(Number(event.target.value));
						}}
						aria-valuetext={`${f.date(step.finishedAt)}, ${arrival?.name ?? ''}`}
						className="w-full accent-clay dark:accent-link"
					/>
				</label>
				<p className="w-full text-sm sm:w-auto sm:min-w-[16rem]">
					<span className="num font-semibold">{f.date(step.finishedAt)}</span>
					<span className="text-ink-2"> · {t.findings.race.count(index + 1)}</span>
				</p>
			</div>

			<p className="mb-3 min-h-6 text-sm text-ink-2" aria-live="off">
				{arrival && t.findings.race.joined(arrival.name, step.rank[step.slug]!, step.tied[step.slug]!)}
			</p>

			<ol className="relative border-t border-rule transition-[height] duration-700 ease-out" style={{height: step.order.length * rowHeight}}>
				{steps.at(-1)!.order.map(slug => {
					const run = bySlug.get(slug);
					const position = step.order.indexOf(slug);
					if (!run) return null;
					const present = position !== -1;
					const isNew = slug === step.slug;
					return (
						<li
							key={slug}
							aria-hidden={!present}
							className={`absolute inset-x-0 top-0 grid grid-cols-[4.5rem_minmax(0,1fr)_3.25rem] items-center gap-x-3 border-b border-rule transition-[transform,opacity,background-color] duration-700 ease-out sm:grid-cols-[5rem_minmax(0,16rem)_3.5rem_minmax(0,1fr)] sm:gap-x-5 ${isNew ? 'bg-slip-3' : ''}`}
							style={{
								height: rowHeight,
								transform: `translateY(${(present ? position : step.order.length) * rowHeight}px)`,
								opacity: present ? 1 : 0,
								visibility: present ? 'visible' : 'hidden',
							}}
						>
							<span className="flex items-baseline gap-1 pl-2 whitespace-nowrap">
								<span className="num font-semibold">{present ? step.rank[slug] : ''}</span>
								{present && step.tied[slug] && <span className="text-[0.6875rem] font-semibold text-ink-2">{t.home.tied}</span>}
							</span>
							<span className="flex min-w-0 items-center gap-2.5">
								<span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-slip-3 text-ink"><LabLogo lab={run.lab} size={16} /></span>
								<Link to="/$lang/models/$slug" params={{lang, slug}} tabIndex={present ? undefined : -1} className="truncate text-sm font-semibold text-ink no-underline hover:underline">{run.name}</Link>
							</span>
							<span className="num pr-2 text-right font-semibold sm:pr-0">{f.score(run.score?.value)}</span>
							<span className="hidden pr-2 sm:block">
								<ScoreBar estimate={run.score} height={16} label={`${run.name}: ${f.score(run.score?.value)}`} />
							</span>
						</li>
					);
				})}
			</ol>
			<figcaption className="mt-3 text-xs text-ink-3">{t.findings.race.caption}</figcaption>
		</figure>
	);
}
