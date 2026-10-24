import {createFileRoute, Link, notFound} from '@tanstack/react-router';
import {Bars, GradeBars, Heatmap, RampLegend} from '../../../components/Charts';
import {ArrowLeftIcon, ArrowRightIcon, ExternalIcon} from '../../../components/Icons';
import {SetupBadge} from '../../../components/Leaderboard';
import {ScoreBar} from '../../../components/ScoreBar';
import {judgeName} from '../../../data/models';
import type {Run} from '../../../data/runs';
import {rankedRuns, runBySlug, runFolderUrl, runs} from '../../../data/runs';
import {dialects, meaningTasks, tasks} from '../../../data/schema';
import {cellAverage, cellMoments} from '../../../data/stats';
import type {Lang} from '../../../i18n';
import {messagesFor} from '../../../i18n';
import {pageHead} from '../../../lib/head';
import {useI18n} from '../../../lib/lang';

// Harnesses report versions as "2.1.302 (Claude Code)", "codex-cli 0.163.0" or "opencode v2.0.32".
const harnessVersion = (version?: string | null) => version?.match(/\d+(?:\.\d+)+/)?.[0] ?? '';

export const Route = createFileRoute('/$lang/models/$slug')({
	loader: ({params}) => {
		if (!runBySlug(params.slug)) throw notFound();
	},
	head: ({params}) => {
		const run = runBySlug(params.slug);
		const lang = params.lang as Lang;
		const t = messagesFor(lang);
		return pageHead(lang, `/models/${params.slug}`, run ? `${run.name} (${t.reasoning[run.reasoning] ?? run.reasoning})` : null);
	},
	component: ModelPage,
});

function Figure({label, estimate, strict, hint}: {label: string; estimate: Run['score']; strict: number | null; hint?: string}) {
	const {t, f} = useI18n();
	return (
		<div className="border-t-2 border-ink pt-3">
			<p className="text-sm font-semibold text-ink-2">{label}</p>
			<p className="mt-1 flex items-baseline gap-2">
				<span className="num text-[3.25rem] leading-none font-semibold tracking-[-0.02em]">{f.score(estimate?.value)}</span>
				<span className="text-sm text-ink-3">{t.common.of100}</span>
			</p>
			{estimate && <p className="num mt-2 text-sm text-ink-2">{t.model.interval(f.score(estimate.low), f.score(estimate.high))}</p>}
			{strict !== null && <p className="num text-sm text-ink-3">{t.model.strict(f.score(strict))}</p>}
			<div className="mt-3"><ScoreBar estimate={estimate} label={label} /></div>
			{hint && <p className="mt-2 text-xs text-ink-3">{hint}</p>}
		</div>
	);
}

// The run in plain words: right answers in 10, best dialect, weakest cell, and how it handles the script.
function Summary({run}: {run: Run}) {
	const {t, f} = useI18n();
	if (!run.score) return null;
	const grid = run.summary.by_dialect_and_task;
	const meaning = (dialect: (typeof dialects)[number]) => {
		const cells = meaningTasks.map(task => grid[dialect]?.[task]).filter(cell => cell !== undefined);
		return cells.length === 2 ? cellAverage(cells).value : -1;
	};
	const best = [...dialects].sort((a, b) => meaning(b) - meaning(a))[0]!;
	const weakest = dialects.flatMap(dialect => meaningTasks.map(task => ({dialect, task, cell: grid[dialect]?.[task]})))
		.filter(entry => entry.cell !== undefined)
		.sort((a, b) => cellMoments(a.cell!).mean - cellMoments(b.cell!).mean)[0];
	const script = run.script?.value;
	return (
		<p className="mt-5 max-w-[48ch] text-lg">
			{t.model.inTen(run.name, Math.round(run.score.value / 10))}{' '}
			{t.model.best(t.dialect[best])}{' '}
			{weakest && t.model.weakest(weakest.task, t.dialect[weakest.dialect])}
			{script !== undefined && <>{' '}<span className="text-ink-2">{t.model.scriptLevel(script >= 95 ? 'high' : script >= 85 ? 'good' : 'low', f.score(script))}</span></>}
		</p>
	);
}

function Detail({term, children}: {term: string; children: React.ReactNode}) {
	return (
		<div className="grid gap-1 border-b border-rule py-3 sm:grid-cols-[12rem_1fr] sm:gap-6">
			<dt className="text-sm text-ink-2">{term}</dt>
			<dd className="text-sm">{children}</dd>
		</div>
	);
}

function ModelPage() {
	const {lang, t, f} = useI18n();
	const {slug} = Route.useParams();
	const run = runBySlug(slug)!;
	const index = runs.indexOf(run);
	const previous = runs[index - 1];
	const next = runs[index + 1];
	const total = rankedRuns().length;
	const tied = run.tiedWith.map(other => runBySlug(other)!).filter(Boolean);
	const grid = run.summary.by_dialect_and_task;
	const cost = run.info.cost_usd;
	const costText = cost === null || run.harness === 'codex'
		? t.model.costNone
		: run.harness === 'claude-code' ? t.model.costApi(f.usd(cost)) : f.usd(cost);
	const compareWith = [run.slug, ...tied.map(other => other.slug)].slice(0, 4);
	if (compareWith.length < 2 && runs[0] && runs[0] !== run) compareWith.push(runs[0].slug);

	return (
		<article className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<nav className="pt-8 text-sm">
				<Link to="/$lang" params={{lang}} className="inline-flex items-center gap-1 text-ink-2"><ArrowLeftIcon width={16} height={16} />{t.model.back}</Link>
			</nav>

			<header className="grid gap-x-16 gap-y-8 pt-6 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
				<div>
					<h1 className="text-3xl sm:text-4xl">{run.name}</h1>
					<p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-2">
						<span>{run.lab}</span>
						<span aria-hidden="true">·</span>
						<span>{run.harnessName}{run.provider ? ` · ${run.provider}` : ''}</span>
						<span aria-hidden="true">·</span>
						<span>{t.model.reasoning}: {t.reasoning[run.reasoning] ?? run.reasoning}</span>
						{!run.official && <SetupBadge differences={run.differences} />}
					</p>
					<Summary run={run} />
					<p className="mt-6 text-lg">
						{run.rank !== null ? (
							<>
								<span className="font-semibold">{t.model.rankOf(run.rank, total)}</span>
								{tied.length > 0 && (
									<span className="block text-base text-ink-2">
										{t.model.tiedWith}{' '}
										{f.listParts(tied.map(other => other.name)).map((part, i) => {
											const other = tied.find(item => item.name === part.value);
											return part.type === 'element' && other
												? <Link key={i} to="/$lang/models/$slug" params={{lang, slug: other.slug}}>{other.name}</Link>
												: <span key={i}>{part.value}</span>;
										})}
									</span>
								)}
							</>
						) : <span className="text-base text-ink-2">{t.model.unrankedNote}</span>}
					</p>
					<p className="mt-6">
						<Link to="/$lang/compare" params={{lang}} search={{models: compareWith.join(',')}} className="font-medium">{t.model.compareWith}</Link>
					</p>
				</div>
				<div className="grid gap-8 sm:grid-cols-2">
					<Figure label={t.model.score} estimate={run.score} strict={run.scoreStrict} hint={t.home.scoreHint} />
					<Figure label={t.model.script} estimate={run.script} strict={run.scriptStrict} hint={t.home.scriptHint} />
				</div>
			</header>

			<section aria-labelledby="grid-title" className="border-t border-rule-strong pt-10">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<h2 id="grid-title" className="text-2xl">{t.model.grid}</h2>
						<p className="mt-2 max-w-[62ch] text-sm text-ink-2">{t.model.gridCaption}</p>
					</div>
					<RampLegend />
				</div>
				<div className="mt-6"><Heatmap grid={grid} caption={t.model.grid} /></div>
			</section>

			<section className="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-2">
				<div>
					<h2 className="text-xl">{t.model.byDialect}</h2>
					<p className="mt-1 mb-5 text-sm text-ink-2">{t.model.meaningOnly}</p>
					<Bars
						label={t.model.byDialect}
						rows={dialects.map(dialect => {
							const cells = meaningTasks.map(task => grid[dialect]?.[task]).filter(cell => cell !== undefined);
							return {key: dialect, label: t.dialect[dialect], value: cells.length === 2 ? cellAverage(cells).value : null};
						})}
					/>
				</div>
				<div>
					<h2 className="text-xl">{t.model.byTask}</h2>
					<p className="mt-1 mb-5 text-sm text-ink-2">&nbsp;</p>
					<Bars
						label={t.model.byTask}
						rows={tasks.map(task => {
							const cells = dialects.map(dialect => grid[dialect]?.[task]).filter(cell => cell !== undefined);
							return {key: task, label: t.task[task], value: cells.length === 3 ? cellAverage(cells).value : null};
						})}
					/>
				</div>
				<div>
					<h2 className="text-xl">{t.model.grades}</h2>
					<p className="mt-1 mb-5 text-sm text-ink-2">{t.model.gradesCaption}</p>
					<GradeBars grid={grid} />
				</div>
				<div>
					<h2 className="text-xl">{t.model.cer}</h2>
					<p className="mt-1 mb-5 max-w-[60ch] text-sm text-ink-2">{t.model.cerCaption}</p>
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-rule-strong">
								<td />
								{(['en-to-tif', 'transliterate'] as const).map(task => <th key={task} scope="col" className="label py-2 text-right">{t.task[task]}</th>)}
							</tr>
						</thead>
						<tbody>
							{dialects.map(dialect => (
								<tr key={dialect} className="border-b border-rule">
									<th scope="row" className="py-2.5 text-left font-normal text-ink-2">{t.dialect[dialect]}</th>
									{(['en-to-tif', 'transliterate'] as const).map(task => {
										const cer = grid[dialect]?.[task]?.mean_cer;
										return <td key={task} className="num py-2.5 text-right">{cer === undefined ? '—' : f.percent(cer)}</td>;
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section aria-labelledby="run-title" className="mt-16 border-t border-rule-strong pt-10">
				<h2 id="run-title" className="text-2xl">{t.model.run}</h2>
				<dl className="mt-4 max-w-[60rem]">
					<Detail term={t.model.setup}>
						{run.official ? t.model.setupOfficial : run.differences.map(d => t.difference[d.field](d.value)).join(' · ')}
					</Detail>
					<Detail term={t.model.harness}>
						{run.harnessName} <span className="num">{harnessVersion(run.info.harness.version)}</span>
						{run.info.harness.sdk && <span className="block text-ink-3">{run.info.harness.sdk.package} {run.info.harness.sdk.version}</span>}
					</Detail>
					{run.provider && <Detail term={t.model.provider}>{run.provider}</Detail>}
					<Detail term={t.model.judge}>{run.config.judge ? `${judgeName(run.config.judge.model)} (${run.config.judge.harness === 'claude-code' ? 'Claude Code' : run.config.judge.harness})` : '—'}</Detail>
					<Detail term={t.model.sample}><span className="num">{t.model.sampleValue(f.integer(Number(run.config.sampleSize)))} {run.config.seed}</span></Detail>
					<Detail term={t.model.batch}><span className="num">{run.config.batchSize}</span></Detail>
					<Detail term={t.model.sessions}><span className="num">{t.model.sessionsValue(run.info.sessions.answers, run.info.sessions.judge)}</span></Detail>
					<Detail term={t.model.tokens}><span className="num">{t.model.tokensValue(f.integer(run.info.tokens.input), f.integer(run.info.tokens.output), f.integer(run.info.tokens.reasoning))}</span></Detail>
					<Detail term={t.model.cost}><span className="num">{costText}</span></Detail>
					{run.info.judge && <Detail term={t.model.judgeCost}><span className="num">{run.info.judge.cost_usd === null ? t.model.costNone : f.usd(run.info.judge.cost_usd)}</span></Detail>}
					<Detail term={t.model.dates}>{t.model.datesValue(f.dateTime(run.info.started_at), run.info.finished_at ? f.dateTime(run.info.finished_at) : t.common.pending)}</Detail>
					{run.info.cli_version && <Detail term={t.model.cli}><span className="num">{run.info.cli_version}</span></Detail>}
				</dl>
				<details className="mt-6 max-w-[60rem] rounded-sm border border-rule">
					<summary className="cursor-pointer px-4 py-3 text-sm font-semibold hover:bg-slip-2">{t.model.checksums}</summary>
					<div className="border-t border-rule px-4 py-3">
						<p className="text-xs text-ink-2">{t.model.checksumsHint}</p>
						<ul className="mt-3 space-y-2">
							{Object.entries(run.info.dataset).map(([dialect, data]) => (
								<li key={dialect} className="text-xs">
									<span className="font-semibold">{t.dialect[dialect as keyof typeof t.dialect] ?? dialect}</span>
									<code className="mt-0.5 block font-mono break-all text-ink-2">{data.sha256}</code>
								</li>
							))}
						</ul>
					</div>
				</details>
				<p className="mt-6 text-sm">
					<a href={runFolderUrl(run.folder)} className="inline-flex items-center gap-1">{t.model.folder}<ExternalIcon /></a>
				</p>
			</section>

			<nav aria-label={`${t.model.previous} / ${t.model.next}`} className="mt-16 grid grid-cols-2 gap-6 border-t border-rule-strong pt-6">
				<div>
					{previous && (
						<Link to="/$lang/models/$slug" params={{lang, slug: previous.slug}} className="group inline-flex flex-col no-underline">
							<span className="inline-flex items-center gap-1 text-xs text-ink-3"><ArrowLeftIcon width={14} height={14} />{t.model.previous}</span>
							<span className="font-semibold text-ink group-hover:underline">{previous.name}</span>
						</Link>
					)}
				</div>
				<div className="text-right">
					{next && (
						<Link to="/$lang/models/$slug" params={{lang, slug: next.slug}} className="group inline-flex flex-col items-end no-underline">
							<span className="inline-flex items-center gap-1 text-xs text-ink-3">{t.model.next}<ArrowRightIcon width={14} height={14} /></span>
							<span className="font-semibold text-ink group-hover:underline">{next.name}</span>
						</Link>
					)}
				</div>
			</nav>
		</article>
	);
}
