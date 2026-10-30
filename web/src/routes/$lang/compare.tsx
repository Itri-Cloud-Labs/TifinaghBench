import {useEffect, useState} from 'react';
import {createFileRoute, Link, useNavigate} from '@tanstack/react-router';
import {CloseIcon} from '../../components/Icons';
import {LabLogo} from '../../components/LabLogo';
import type {Run} from '../../data/runs';
import {runBySlug, runs} from '../../data/runs';
import type {Dialect, Task} from '../../data/schema';
import {dialects, meaningTasks} from '../../data/schema';
import {cellMoments, tied} from '../../data/stats';
import type {Lang} from '../../i18n';
import {messagesFor} from '../../i18n';
import {pageHead} from '../../lib/head';
import {useI18n} from '../../lib/lang';

type Search = {models?: string};
const max = 4;

export const Route = createFileRoute('/$lang/compare')({
	validateSearch: (search: Record<string, unknown>): Search => (typeof search.models === 'string' ? {models: search.models} : {}),
	head: ({params}) => {
		const t = messagesFor(params.lang as Lang);
		return pageHead(params.lang as Lang, '/compare', t.meta.titles.compare, t.compare.lede);
	},
	component: Compare,
});

// Positions are the colour identity: removing a run leaves its slot empty, so the others keep their colour.
function useSlots(): [(Run | null)[], (slots: (Run | null)[]) => void] {
	const {models} = Route.useSearch();
	const navigate = useNavigate({from: Route.fullPath});
	// The page is prerendered without a query, so the first client render matches it before reading ?models=.
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => setHydrated(true), []);
	const parsed = (hydrated ? models ?? '' : '').split(',').slice(0, max).map(slug => (slug ? runBySlug(slug) ?? null : null));
	const slots = parsed.some(Boolean) ? parsed : runs.filter(run => run.rank !== null).slice(0, 3);
	const set = (next: (Run | null)[]) => {
		const value = next.map(run => run?.slug ?? '').join(',').replace(/,+$/, '');
		void navigate({search: value ? {models: value} : {}, replace: true, resetScroll: false});
	};
	return [slots, set];
}

const cellScore = (run: Run, dialect: Dialect, task: Task) => {
	const cell = run.summary.by_dialect_and_task[dialect]?.[task];
	return cell && cell.n > 0 ? cellMoments(cell).mean * 100 : null;
};

function Compare() {
	const {lang, t, f} = useI18n();
	const [slots, setSlots] = useSlots();
	const chosen = slots.flatMap((run, slot) => (run ? [{run, slot}] : []));
	const available = runs.filter(run => !chosen.some(item => item.run.slug === run.slug));
	const add = (slug: string) => {
		const run = runBySlug(slug);
		if (!run) return;
		const next = [...slots];
		const empty = next.indexOf(null);
		if (empty >= 0) next[empty] = run;
		else if (next.length < max) next.push(run);
		setSlots(next);
	};
	const remove = (slot: number) => setSlots(slots.map((run, index) => (index === slot ? null : run)));
	const groups: {label: string; cells: {dialect: Dialect; task: Task}[]}[] = [
		{label: t.compare.meaning, cells: dialects.flatMap(dialect => meaningTasks.map(task => ({dialect, task})))},
		{label: t.compare.scriptGroup, cells: dialects.map(dialect => ({dialect, task: 'transliterate' as const}))},
	];
	const pairs = chosen.flatMap((a, i) => chosen.slice(i + 1).map(b => [a.run, b.run] as const)).filter(([a, b]) => a.score && b.score);

	return (
		<div className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<header className="pt-12 pb-8">
				<h1 className="text-3xl sm:text-4xl">{t.compare.title}</h1>
				<p className="mt-3 max-w-[60ch] text-lg text-ink-2">{t.compare.lede}</p>
			</header>

			<section aria-labelledby="pick-title" className="border-y border-rule-strong py-5">
				<h2 id="pick-title" className="label mb-3">{t.compare.pick}</h2>
				<div className="flex flex-wrap items-center gap-2">
					{chosen.map(({run, slot}) => (
						<span key={run.slug} className="inline-flex h-9 items-center gap-2 rounded-sm border border-rule-strong bg-slip-2 pr-1 pl-3 text-sm">
							<span className="inline-block size-3 rounded-[2px]" style={{background: `var(--series-${slot + 1})`}} aria-hidden="true" />
							<LabLogo lab={run.lab} className="shrink-0 text-ink-2" />
							<Link to="/$lang/models/$slug" params={{lang, slug: run.slug}} className="font-semibold text-ink no-underline hover:underline">{run.name}</Link>
							<span className="text-xs text-ink-3">{t.reasoning[run.reasoning] ?? run.reasoning}</span>
							<button type="button" onClick={() => remove(slot)} className="inline-flex size-7 items-center justify-center rounded-sm text-ink-2 hover:bg-slip-3 hover:text-ink" aria-label={t.compare.remove(run.name)}>
								<CloseIcon />
							</button>
						</span>
					))}
					<label className="inline-flex items-center gap-2">
						<span className="sr-only">{t.compare.add}</span>
						<select
							value=""
							disabled={chosen.length >= max || available.length === 0}
							onChange={event => add(event.target.value)}
							className="h-9 rounded-sm border border-dashed border-rule-strong bg-slip px-2 text-sm text-ink disabled:opacity-50"
						>
							<option value="">{chosen.length >= max ? t.compare.limit : `+ ${t.compare.add}`}</option>
							{available.map(run => <option key={run.slug} value={run.slug}>{run.name} ({t.reasoning[run.reasoning] ?? run.reasoning})</option>)}
						</select>
					</label>
				</div>
			</section>

			{chosen.length < 2 ? (
				<p className="py-16 text-ink-2">{t.compare.minimum}</p>
			) : (
				<>
					<section aria-labelledby="pairs-title" className="mt-12">
						<h2 id="pairs-title" className="text-2xl">{t.compare.pairs}</h2>
						<p className="mt-2 text-sm text-ink-2">{t.compare.pairsCaption}</p>
						<div className="mt-5 overflow-x-auto">
							<table className="w-full min-w-[36rem] text-sm">
								<thead>
									<tr className="border-b border-rule-strong">
										<th scope="col" className="label py-2 pr-4 text-left">{t.home.model}</th>
										<th scope="col" className="label py-2 pr-4 text-left">{t.home.model}</th>
										<th scope="col" className="label py-2 pr-4 text-right">{t.compare.difference}</th>
										<th scope="col" className="label py-2 text-left">{t.compare.verdict}</th>
									</tr>
								</thead>
								<tbody>
									{pairs.map(([a, b]) => {
										const difference = a.score!.value - b.score!.value;
										const margin = 1.96 * Math.hypot(a.score!.se, b.score!.se);
										const isTie = tied(a.score!, b.score!);
										const leader = difference >= 0 ? a : b;
										return (
											<tr key={`${a.slug}-${b.slug}`} className="border-b border-rule">
												<td className="py-3 pr-4"><span className="flex items-center gap-2"><LabLogo lab={a.lab} className="shrink-0 text-ink-2" />{a.name}<span className="num text-ink-3">{f.score(a.score!.value)}</span></span></td>
												<td className="py-3 pr-4"><span className="flex items-center gap-2"><LabLogo lab={b.lab} className="shrink-0 text-ink-2" />{b.name}<span className="num text-ink-3">{f.score(b.score!.value)}</span></span></td>
												<td className="num py-3 pr-4 text-right">{difference >= 0 ? '+' : '−'}{f.score(Math.abs(difference))} <span className="text-ink-3">± {f.score(margin)}</span></td>
												<td className={`py-3 ${isTie ? 'text-ink-2' : 'font-semibold'}`}>{isTie ? t.compare.tie : t.compare.ahead(leader.name)}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</section>

					<section aria-labelledby="cells-title" className="mt-16">
						<h2 id="cells-title" className="text-2xl">{t.compare.cells}</h2>
						<p className="mt-2 text-sm text-ink-2">{t.compare.cellsCaption}</p>
						<ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Legend">
							{chosen.map(({run, slot}) => (
								<li key={run.slug} className="flex items-center gap-2">
									<span className="inline-block h-3 w-5 rounded-[2px]" style={{background: `var(--series-${slot + 1})`}} aria-hidden="true" />
									{run.name}
								</li>
							))}
						</ul>
						{groups.map(group => (
							<div key={group.label} className="mt-10">
								<h3 className="label border-b border-rule-strong pb-2">{group.label}</h3>
								<div className="grid gap-x-12 md:grid-cols-2">
									{group.cells.map(({dialect, task}) => (
										<figure key={`${dialect}-${task}`} className="border-b border-rule py-4">
											<figcaption className="mb-2 text-sm"><span className="font-semibold">{t.dialect[dialect]}</span> <span className="text-ink-2">· {t.task[task]}</span></figcaption>
											<ul className="space-y-[3px]">
												{chosen.map(({run, slot}) => {
													const value = cellScore(run, dialect, task);
													return (
														<li key={run.slug} className="grid grid-cols-[1fr_3rem] items-center gap-3" title={run.name}>
															<span className="relative h-4 border-l border-rule-strong">
																{value !== null && <span className="absolute inset-y-0 left-0 rounded-r-[4px]" style={{width: `${Math.max(0.5, value)}%`, background: `var(--series-${slot + 1})`}} />}
															</span>
															<span className="num text-right text-xs"><span className="sr-only">{run.name}: </span>{f.score(value)}</span>
														</li>
													);
												})}
											</ul>
										</figure>
									))}
								</div>
							</div>
						))}
					</section>
				</>
			)}
		</div>
	);
}
