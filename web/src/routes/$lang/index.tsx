import {createFileRoute, Link} from '@tanstack/react-router';
import {Leaderboard} from '../../components/Leaderboard';
import {Scatter} from '../../components/Scatter';
import {rankedRuns, runs} from '../../data/runs';
import type {Lang} from '../../i18n';
import {pageHead} from '../../lib/head';
import {useI18n} from '../../lib/lang';

export const Route = createFileRoute('/$lang/')({
	head: ({params}) => pageHead(params.lang as Lang, '', null),
	component: Home,
});

const median = (values: number[]) => {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

function Home() {
	const {lang, t, f} = useI18n();
	const ranked = rankedRuns();
	const leaders = ranked.filter(run => run.tier === 0);
	const meaning = median(ranked.map(run => run.score!.value));
	const script = median(ranked.filter(run => run.script).map(run => run.script!.value));
	const top = leaders.slice(0, 4).map(run => run.slug).join(',');
	return (
		<div className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<section className="grid grid-cols-1 gap-x-16 gap-y-6 pt-12 pb-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
				<div>
					<h1 className="text-3xl sm:text-4xl">{t.home.title}</h1>
					<p className="mt-4 max-w-[58ch] text-lg text-ink-2">{t.home.lede}</p>
				</div>
				{leaders.length > 0 && (
					<ul className="grid gap-4 text-base sm:grid-cols-2 lg:grid-cols-1">
						<li className="border-t border-rule-strong pt-3">
							{t.home.leader(f.list(leaders.map(run => run.name)), f.score(leaders[0]!.score!.value))}
						</li>
						<li className="border-t border-rule-strong pt-3">{t.home.gap(f.score(meaning), f.score(script))}</li>
					</ul>
				)}
			</section>

			<Leaderboard runs={runs} />

			<section aria-labelledby="scatter-heading" className="mt-24 grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
				<div>
					<h2 id="scatter-heading" className="text-2xl">{t.home.scatterTitle}</h2>
					<div className="mt-6"><Scatter runs={ranked} /></div>
				</div>
				<div className="lg:pt-14">
					<h2 className="text-xl">{t.home.whatTitle}</h2>
					{t.home.what.map(paragraph => <p key={paragraph} className="mt-3 max-w-[60ch] text-ink-2">{paragraph}</p>)}
					<p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-medium">
						<Link to="/$lang/methodology" params={{lang}}>{t.home.readMethodology}</Link>
						{leaders.length > 1 && <Link to="/$lang/compare" params={{lang}} search={{models: top}}>{t.home.compareTop}</Link>}
					</p>
				</div>
			</section>
		</div>
	);
}
