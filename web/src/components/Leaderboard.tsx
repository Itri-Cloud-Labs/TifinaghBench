import {Fragment, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Link} from '@tanstack/react-router';
import type {Run} from '../data/runs';
import type {SetupDifference} from '../data/stats';
import {useI18n} from '../lib/lang';
import {TierBand} from './Frieze';
import {SortIcon} from './Icons';
import {ScoreBar} from './ScoreBar';

type SortKey = 'score' | 'script' | 'name' | 'lab' | 'harness';
type Sort = {key: SortKey; direction: 'asc' | 'desc'};

export function SetupBadge({differences}: {differences: SetupDifference[]}) {
	const {t} = useI18n();
	const text = differences.map(d => t.difference[d.field](d.value)).join(' · ');
	return (
		<span className="inline-flex items-center gap-1 rounded-sm border border-rule-strong px-1.5 py-0.5 text-[0.6875rem] font-semibold text-ink-2" title={text}>
			{t.home.differentSetup}
			<span className="sr-only">: {text}</span>
		</span>
	);
}

// Rows keep their identity when the order changes: each slides from where it was.
function useRowMotion(order: string) {
	const rows = useRef(new Map<string, HTMLElement>());
	const previous = useRef(new Map<string, number>());
	useLayoutEffect(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const next = new Map<string, number>();
		for (const [key, element] of rows.current) {
			const top = element.getBoundingClientRect().top;
			next.set(key, top);
			const before = previous.current.get(key);
			if (!reduce && before !== undefined && Math.abs(before - top) > 1) {
				element.animate([{transform: `translateY(${before - top}px)`}, {transform: 'translateY(0)'}], {duration: 260, easing: 'cubic-bezier(0.16, 1, 0.3, 1)'});
			}
		}
		previous.current = next;
	}, [order]);
	return (key: string) => (element: HTMLElement | null) => {
		if (element) rows.current.set(key, element);
		else rows.current.delete(key);
	};
}

export function Leaderboard({runs}: {runs: Run[]}) {
	const {lang, t, f} = useI18n();
	const [strict, setStrict] = useState(false);
	const [showOther, setShowOther] = useState(true);
	const [lab, setLab] = useState('');
	const [harness, setHarness] = useState('');
	const [sort, setSort] = useState<Sort>({key: 'score', direction: 'desc'});

	const labs = useMemo(() => [...new Set(runs.map(run => run.lab))].sort(), [runs]);
	const harnesses = useMemo(() => [...new Set(runs.map(run => run.harnessName))].sort(), [runs]);
	const headline = (run: Run) => (strict ? run.scoreStrict : run.score?.value) ?? -1;
	const scriptValue = (run: Run) => (strict ? run.scriptStrict : run.script?.value) ?? -1;

	const visible = runs.filter(run => (showOther || run.official) && (!lab || run.lab === lab) && (!harness || run.harnessName === harness));
	const compare = (a: Run, b: Run) => {
		const sign = sort.direction === 'asc' ? 1 : -1;
		switch (sort.key) {
			case 'score': return sign * (headline(a) - headline(b));
			case 'script': return sign * (scriptValue(a) - scriptValue(b));
			case 'name': return sign * a.name.localeCompare(b.name);
			case 'lab': return sign * a.lab.localeCompare(b.lab) || headline(b) - headline(a);
			case 'harness': return sign * a.harnessName.localeCompare(b.harnessName) || headline(b) - headline(a);
		}
	};
	// Tiers only read in their natural order: folded scores, best first.
	const tiered = sort.key === 'score' && sort.direction === 'desc' && !strict;
	const ranked = visible.filter(run => run.rank !== null).sort(compare);
	const unranked = visible.filter(run => run.rank === null).sort(compare);
	const ordered = tiered ? [...ranked, ...unranked] : [...visible].sort(compare);
	const rowRef = useRowMotion(ordered.map(run => run.slug).join() + (strict ? 's' : ''));

	const header = (key: SortKey, label: string, className = '') => {
		const active = sort.key === key;
		return (
			<th scope="col" aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={`py-3 pr-4 text-left align-bottom ${className}`}>
				<button
					type="button"
					className="label inline-flex items-center gap-1 rounded-sm hover:text-ink"
					onClick={() => setSort(current => ({key, direction: current.key === key ? (current.direction === 'asc' ? 'desc' : 'asc') : key === 'score' || key === 'script' ? 'desc' : 'asc'}))}
				>
					{label}
					<SortIcon sorted={active ? sort.direction : null} />
					<span className="sr-only">{t.home.sortBy(label)}</span>
				</button>
			</th>
		);
	};

	const rankCell = (run: Run) => (
		run.rank === null
			? <span className="text-xs text-ink-3">{t.home.unranked}</span>
			: (
				<span className="inline-flex items-baseline gap-1">
					<span className="num text-lg font-semibold">{run.rank}</span>
					{run.tiedWith.length > 0 && <span className="text-xs font-semibold text-ink-3" title={t.home.tiedRank}>=<span className="sr-only"> {t.home.tiedRank}</span></span>}
				</span>
			)
	);

	const row = (run: Run) => {
		const score = strict ? run.scoreStrict : run.score?.value;
		const script = strict ? run.scriptStrict : run.script?.value;
		return (
			<tr key={run.slug} ref={rowRef(run.slug)} className="group border-b border-rule bg-slip transition-colors duration-150 hover:bg-slip-2">
				<td className="w-16 py-3.5 pr-4 align-middle">{rankCell(run)}</td>
				<td className="py-3.5 pr-4 align-middle">
					<Link to="/$lang/models/$slug" params={{lang, slug: run.slug}} className="font-semibold text-ink no-underline group-hover:underline">
						{run.name}
					</Link>
					<span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">
						{run.lab}
						{!run.official && <SetupBadge differences={run.differences} />}
					</span>
				</td>
				<td className="py-3.5 pr-4 align-middle text-sm text-ink-2">
					{run.harnessName}
					{run.provider && <span className="block text-xs text-ink-3">{run.provider}</span>}
				</td>
				<td className="py-3.5 pr-4 align-middle text-sm text-ink-2">{t.reasoning[run.reasoning] ?? run.reasoning}</td>
				<td className="py-3.5 pr-4 align-middle">
					<div className="flex items-center gap-4">
						<span className="flex w-[4.5rem] shrink-0 flex-col items-end leading-tight">
							<span className="num text-xl font-semibold">{f.score(score)}</span>
							{!strict && run.score && <span className="num text-[0.6875rem] text-ink-3">± {f.score(1.96 * run.score.se)}</span>}
						</span>
						<div className="min-w-32 flex-1">
							<ScoreBar
								estimate={strict ? null : run.score}
								value={score}
								label={strict || !run.score ? f.score(score) : `${f.score(run.score.value)}, ${t.model.interval(f.score(run.score.low), f.score(run.score.high))}`}
							/>
						</div>
					</div>
				</td>
				<td className="num py-3.5 pr-4 text-right align-middle text-base text-ink-2">{f.score(script)}</td>
				<td className="num py-3.5 text-right align-middle text-sm text-ink-3">{f.score(strict ? run.score?.value : run.scoreStrict)}</td>
			</tr>
		);
	};

	const dividerRow = (key: string, content: React.ReactNode) => (
		<tr key={key} aria-hidden="true">
			<td colSpan={7} className="py-0">{content}</td>
		</tr>
	);

	const tierGroups = useMemo(() => {
		const groups = new Map<number, Run[]>();
		for (const run of ranked) groups.set(run.tier!, [...(groups.get(run.tier!) ?? []), run]);
		return [...groups.values()];
	}, [ranked]);

	const card = (run: Run) => {
		const score = strict ? run.scoreStrict : run.score?.value;
		const script = strict ? run.scriptStrict : run.script?.value;
		return (
			<li key={run.slug} ref={rowRef(`card-${run.slug}`)} className="border-b border-rule py-4">
				<div className="flex items-start gap-4">
					<div className="w-10 shrink-0 pt-1">{rankCell(run)}</div>
					<div className="min-w-0 flex-1">
						<Link to="/$lang/models/$slug" params={{lang, slug: run.slug}} className="font-semibold text-ink">{run.name}</Link>
						<p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">
							{run.lab} · {run.harnessName} · {t.reasoning[run.reasoning] ?? run.reasoning}
							{!run.official && <SetupBadge differences={run.differences} />}
						</p>
						<div className="mt-3 flex items-center gap-3">
							<span className="num w-11 text-xl font-semibold">{f.score(score)}</span>
							{!strict && run.score && <span className="num text-xs text-ink-3">± {f.score(1.96 * run.score.se)}</span>}
							<div className="flex-1"><ScoreBar estimate={strict ? null : run.score} value={score} label={f.score(score)} /></div>
						</div>
						<p className="mt-1.5 text-xs text-ink-2">{t.home.script} <span className="num font-semibold text-ink">{f.score(script)}</span></p>
					</div>
				</div>
			</li>
		);
	};

	const reset = () => {
		setLab('');
		setHarness('');
		setShowOther(true);
		setStrict(false);
	};

	return (
		<section aria-labelledby="board-title">
			<h2 id="board-title" className="sr-only">{t.home.boardCaption}</h2>
			<div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-rule-strong pb-4">
				<label className="flex flex-col gap-1">
					<span className="label">{t.home.lab}</span>
					<select value={lab} onChange={event => setLab(event.target.value)} className="h-9 min-w-36 rounded-sm border border-rule-strong bg-slip px-2 text-sm text-ink hover:border-ink-3">
						<option value="">{t.home.all}</option>
						{labs.map(item => <option key={item} value={item}>{item}</option>)}
					</select>
				</label>
				<label className="flex flex-col gap-1">
					<span className="label">{t.home.harness}</span>
					<select value={harness} onChange={event => setHarness(event.target.value)} className="h-9 min-w-36 rounded-sm border border-rule-strong bg-slip px-2 text-sm text-ink hover:border-ink-3">
						<option value="">{t.home.all}</option>
						{harnesses.map(item => <option key={item} value={item}>{item}</option>)}
					</select>
				</label>
				<label className="flex h-9 items-center gap-2 text-sm" title={t.home.strictHint}>
					<input type="checkbox" checked={strict} onChange={event => setStrict(event.target.checked)} className="size-4" />
					{t.home.strict}
				</label>
				{runs.some(run => !run.official) && (
					<label className="flex h-9 items-center gap-2 text-sm">
						<input type="checkbox" checked={showOther} onChange={event => setShowOther(event.target.checked)} className="size-4" />
						{t.home.otherSetups}
					</label>
				)}
				<p className="ml-auto max-w-[22rem] text-xs text-ink-2">{strict ? t.home.strictHint : t.home.tierGap}</p>
			</div>

			{visible.length === 0 ? (
				<div className="py-16 text-center">
					<p className="text-ink-2">{t.home.noMatches}</p>
					<button type="button" onClick={reset} className="mt-3 rounded-sm border border-rule-strong px-3 py-1.5 text-sm hover:bg-slip-2">{t.home.resetFilters}</button>
				</div>
			) : (
				<>
					<table className="hidden w-full border-collapse md:table">
						<caption className="sr-only">{t.home.boardCaption}</caption>
						<thead>
							<tr className="border-b border-rule-strong">
								<th scope="col" className="label py-3 pr-4 text-left align-bottom">{t.home.rank}</th>
								{header('name', t.home.model)}
								{header('harness', t.home.harness)}
								<th scope="col" className="label py-3 pr-4 text-left align-bottom">{t.home.reasoning}</th>
								{header('score', t.home.score, 'w-[38%]')}
								{header('script', t.home.script, 'text-right')}
								<th scope="col" className="label py-3 text-right align-bottom">{strict ? t.home.score : t.home.strict}</th>
							</tr>
						</thead>
						<tbody>
							{tiered ? (
								<>
									{tierGroups.map((group, index) => (
										<Fragment key={`tier-${index}`}>
											{index > 0 && dividerRow(`frieze-${index}`, <TierBand className="my-1.5 block" />)}
											{group.map(row)}
										</Fragment>
									))}
									{unranked.length > 0 && dividerRow('unranked', <p className="label pt-6 pb-2">{t.home.unranked}</p>)}
									{unranked.map(row)}
								</>
							) : ordered.map(row)}
						</tbody>
					</table>
					<ol className="md:hidden">
						{tiered ? tierGroups.map((group, index) => (
							<Fragment key={`tier-${index}`}>
								{index > 0 && <li aria-hidden="true"><TierBand className="my-1.5 block" /></li>}
								{group.map(card)}
							</Fragment>
						)).concat(unranked.map(card)) : ordered.map(card)}
					</ol>
				</>
			)}
			<p className="mt-3 text-xs text-ink-3">{t.home.scoreHint}. {t.home.scriptHint}.</p>
		</section>
	);
}
