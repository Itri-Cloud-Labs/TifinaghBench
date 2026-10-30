import {createFileRoute, Link} from '@tanstack/react-router';
import {Frieze} from '../../components/Frieze';
import {HeartIcon} from '../../components/Icons';
import {githubUrl, runs, sponsorUrl} from '../../data/runs';
import type {Lang} from '../../i18n';
import {messagesFor} from '../../i18n';
import {pageHead} from '../../lib/head';
import {useI18n} from '../../lib/lang';

export const Route = createFileRoute('/$lang/support')({
	head: ({params}) => {
		const t = messagesFor(params.lang as Lang);
		return pageHead(params.lang as Lang, '/support', t.meta.titles.support, t.support.lede);
	},
	component: Support,
});

// Costs come from the published runs; harnesses that do not report a cost are left out.
const modelCosts = runs.map(run => run.info.cost_usd).filter((cost): cost is number => typeof cost === 'number' && cost > 0);
const judgeCosts = runs.map(run => run.info.judge?.cost_usd).filter((cost): cost is number => typeof cost === 'number' && cost > 0);
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

function Section({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<section className="grid grid-cols-1 gap-x-16 gap-y-3 border-t border-rule-strong py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
			<h2 className="text-xl">{title}</h2>
			<div className="min-w-0 max-w-[62ch]">{children}</div>
		</section>
	);
}

function Support() {
	const {lang, t, f} = useI18n();
	return (
		<div className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<header className="grid grid-cols-1 gap-x-16 gap-y-8 pt-12 pb-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
				<div>
					<h1 className="text-3xl sm:text-4xl">{t.support.title}</h1>
					<p className="mt-4 max-w-[58ch] text-lg text-ink-2">{t.support.lede}</p>
				</div>
				<div>
					<a
						href={sponsorUrl}
						className="inline-flex items-center gap-3 rounded-sm border-2 border-ink px-6 py-3.5 text-lg font-semibold text-ink no-underline transition-colors duration-150 hover:bg-slip-2"
					>
						<HeartIcon width={22} height={22} className="text-link" />
						{t.support.button}
					</a>
					<p className="mt-3 text-sm text-ink-2">{t.support.buttonNote}</p>
				</div>
			</header>

			{modelCosts.length > 0 && judgeCosts.length > 0 && (
				<Section title={t.support.costsTitle}>
					<p className="text-ink-2">{t.support.costs(f.usd(Math.min(...modelCosts)), f.usd(Math.max(...modelCosts)), f.usd(average(judgeCosts)))}</p>
				</Section>
			)}

			<Section title={t.support.fundsTitle}>
				<ul className="list-disc space-y-2 pl-5 text-ink-2 marker:text-ink-3">
					{t.support.funds.map(item => <li key={item}>{item}</li>)}
				</ul>
			</Section>

			<Section title={t.support.freeTitle}>
				<ul className="list-disc space-y-2 pl-5 text-ink-2 marker:text-ink-3">
					<li><a href={githubUrl}>{t.support.free.star}</a></li>
					<li>{t.support.free.run} <Link to="/$lang/run" params={{lang}}>{t.support.free.runLink}</Link></li>
					<li>{t.support.free.share}</li>
					<li><a href={`${githubUrl}/issues`}>{t.support.free.issues}</a></li>
				</ul>
			</Section>

			<Frieze className="mt-6 block" />
			<p className="pt-8 text-center text-xl font-semibold">{t.support.thanks}</p>
		</div>
	);
}
