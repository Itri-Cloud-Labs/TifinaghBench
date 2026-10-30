import {createFileRoute, Link} from '@tanstack/react-router';
import {Leaderboard} from '../../components/Leaderboard';
import {lab, rankedRuns, runs, siteUrl} from '../../data/runs';
import type {Lang} from '../../i18n';
import {messagesFor} from '../../i18n';
import {pageHead} from '../../lib/head';
import {useI18n} from '../../lib/lang';

export const Route = createFileRoute('/$lang/')({
	head: ({params}) => {
		const lang = params.lang as Lang;
		const t = messagesFor(lang);
		// Tells search engines the site's name and who runs it.
		const site = {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: t.meta.siteName,
			url: `${siteUrl}/${lang}`,
			inLanguage: lang,
			description: t.meta.description,
			publisher: {'@type': 'Organization', name: lab.name, url: lab.url},
		};
		return {...pageHead(lang, '', null), scripts: [{type: 'application/ld+json', children: JSON.stringify(site)}]};
	},
	component: Home,
});

// One question on this page: which models know Amazigh, and by how much. Everything else is one click away.
function Home() {
	const {lang, t, f} = useI18n();
	const leaders = rankedRuns().filter(run => run.tier === 0);
	const top = leaders[0]?.score?.value;
	const compare = rankedRuns().slice(0, Math.max(2, Math.min(4, leaders.length))).map(run => run.slug).join(',');
	const item = (title: string, text: string) => (
		<>
			<span className="font-semibold text-link group-hover:underline">{title}</span>
			<span className="mt-1 block text-sm text-ink-2">{text}</span>
		</>
	);
	return (
		<div className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<section className="pt-12 pb-10">
				<p className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<span lang="zgh" className="tifinagh text-3xl leading-none text-clay dark:text-link">ⴰⵣⵓⵍ</span>
					<span className="text-sm text-ink-2">{t.home.greeting}</span>
				</p>
				<h1 className="text-3xl sm:text-4xl">{t.home.title}</h1>
				<p className="mt-4 max-w-[52ch] text-lg text-ink-2">{t.home.lede}</p>
				{top !== undefined && (
					<p className="mt-5 max-w-[52ch] text-lg">
						{t.home.answer(f.integer(Math.round(top / 10)), f.list(leaders.map(run => run.name)), f.score(top))}
					</p>
				)}
			</section>

			<Leaderboard runs={runs} />

			<nav aria-label={t.home.nextLabel} className="mt-20 grid gap-x-12 gap-y-6 border-t border-rule-strong pt-8 sm:grid-cols-3">
				<Link to="/$lang/findings" params={{lang}} className="group block no-underline">{item(t.nav.findings, t.home.next.findings)}</Link>
				<Link to="/$lang/methodology" params={{lang}} className="group block no-underline">{item(t.nav.methodology, t.home.next.methodology)}</Link>
				<Link to="/$lang/compare" params={{lang}} search={{models: compare}} className="group block no-underline">{item(t.nav.compare, t.home.next.compare)}</Link>
			</nav>
		</div>
	);
}
