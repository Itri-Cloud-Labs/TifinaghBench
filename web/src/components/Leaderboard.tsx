import {Fragment} from 'react';
import {Link} from '@tanstack/react-router';
import type {Run} from '../data/runs';
import type {SetupDifference} from '../data/stats';
import {useI18n} from '../lib/lang';
import {Explain} from './Explain';
import {LabLogo} from './LabLogo';
import {ScoreBar} from './ScoreBar';

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

// The home leaderboard: rank, model, score. Script scores, strict spelling and run details live on each model's page.
export function Leaderboard({runs}: {runs: Run[]}) {
	const {lang, t, f} = useI18n();
	const ranked = runs.filter(run => run.rank !== null).sort((a, b) => a.rank! - b.rank! || b.score!.value - a.score!.value);
	const unranked = runs.filter(run => run.rank === null);
	const tiers: Run[][] = [];
	for (const run of ranked) {
		if (tiers.at(-1)?.[0]?.tier === run.tier) tiers.at(-1)!.push(run);
		else tiers.push([run]);
	}

	const row = (run: Run) => {
		const score = run.score;
		return (
			<li key={run.slug} className="group grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-b border-rule py-4 md:grid-cols-[4rem_minmax(14rem,1fr)_minmax(0,1.6fr)] md:gap-x-6">
				<span className="flex flex-col items-start self-start pt-0.5 md:flex-row md:items-baseline md:gap-1 md:self-center md:pt-0">
					{run.rank === null
						? <span className="text-xs text-ink-3">{t.home.unranked}</span>
						: <>
							<span className="num text-lg font-semibold">{run.rank}</span>
							{run.tiedWith.length > 0 && <span className="text-xs font-semibold whitespace-nowrap text-ink-2" title={t.home.tiedRank}>{t.home.tied}<span className="sr-only">: {t.home.tiedRank}</span></span>}
						</>}
				</span>
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-slip-3 text-ink"><LabLogo lab={run.lab} size={20} /></span>
					<div className="min-w-0">
						<Link to="/$lang/models/$slug" params={{lang, slug: run.slug}} className="font-semibold text-ink no-underline group-hover:underline">{run.name}</Link>
						<p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">
							{run.lab} · {run.harnessName} · {t.home.reasoningLevel(t.reasoning[run.reasoning] ?? run.reasoning)}
							{!run.official && <SetupBadge differences={run.differences} />}
						</p>
					</div>
				</div>
				<div className="col-start-2 flex items-center gap-4 md:col-start-auto">
					<span className="flex w-[4.25rem] shrink-0 flex-col items-end leading-tight">
						<span className="num text-xl font-semibold">{f.score(score?.value)}</span>
						{score && <span className="num text-[0.6875rem] text-ink-3">± {f.score(1.96 * score.se)}</span>}
					</span>
					<div className="min-w-24 flex-1">
						<ScoreBar estimate={score} label={score ? `${f.score(score.value)}, ${t.model.interval(f.score(score.low), f.score(score.high))}` : f.score(null)} />
					</div>
				</div>
			</li>
		);
	};

	// Between tiers: one painted lozenge from the frieze and a plain sentence saying how big the step is.
	const step = (above: Run[], below: Run[]) => (
		<li className="flex items-center gap-2.5 pt-5 pb-1.5 text-xs font-medium text-ink-2">
			<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="shrink-0"><path d="M5 0 10 5 5 10 0 5Z" className="fill-clay dark:fill-link" /></svg>
			{t.home.step(f.score((above.at(-1)!.score?.value ?? 0) - (below[0]!.score?.value ?? 0)))}
		</li>
	);

	return (
		<section aria-labelledby="board-title">
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-rule-strong pb-3">
				<h2 id="board-title" className="text-xl">{t.home.boardTitle}</h2>
				<Explain label={t.home.readTable} text={t.home.readTable} wide>
					<dl className="space-y-2.5">
						{(['score', 'interval', 'tied', 'harness', 'reasoning'] as const).map(term => (
							<div key={term}>
								<dt className="font-semibold">{t.home.explain[term].title}</dt>
								<dd className="mt-0.5 text-ink-2">{t.home.explain[term].text}</dd>
							</div>
						))}
					</dl>
				</Explain>
			</div>
			<ol>
				{tiers.map((group, index) => (
					<Fragment key={group[0]!.slug}>
						{index > 0 && step(tiers[index - 1]!, group)}
						{group.map(row)}
					</Fragment>
				))}
				{unranked.length > 0 && <li className="label pt-6 pb-2">{t.home.unranked}</li>}
				{unranked.map(row)}
			</ol>
			<p className="mt-3 text-xs text-ink-3">{t.home.scoreHint}.</p>
		</section>
	);
}
