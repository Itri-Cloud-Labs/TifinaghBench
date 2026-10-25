import {createFileRoute} from '@tanstack/react-router';
import type {DotRow} from '../../components/DotRows';
import {DotRows} from '../../components/DotRows';
import {Cliff} from '../../components/Cliff';
import {rankedRuns} from '../../data/runs';
import {conventions, dialectScores, directions, easiestDialect, findingRuns, median, writingCer} from '../../data/findings';
import {dialects} from '../../data/schema';
import type {Lang} from '../../i18n';
import {messagesFor} from '../../i18n';
import {pageHead} from '../../lib/head';
import {useI18n} from '../../lib/lang';

export const Route = createFileRoute('/$lang/findings')({
	head: ({params}) => {
		const t = messagesFor(params.lang as Lang);
		return pageHead(params.lang as Lang, '/findings', t.findings.title, t.findings.lede);
	},
	component: Findings,
});

function Finding({id, title, text, children}: {id: string; title: string; text: string; children: React.ReactNode}) {
	return (
		<section aria-labelledby={id} className="grid grid-cols-1 gap-x-16 gap-y-6 border-t border-rule-strong py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
			<div>
				<h2 id={id} className="text-2xl">{title}</h2>
				<p className="mt-3 max-w-[48ch] text-ink-2">{text}</p>
			</div>
			<div className="min-w-0">{children}</div>
		</section>
	);
}

function Findings() {
	const {t, f} = useI18n();
	const runs = findingRuns();
	const total = runs.length;
	const row = (run: (typeof runs)[number], values: DotRow['values']): DotRow => ({key: run.slug, label: run.name, lab: run.lab, values});

	const readWrite = runs.map(run => ({run, ...directions(run)}));
	const readsBetter = readWrite.filter(item => item.read !== null && item.write !== null && item.read > item.write).length;
	const ratio = median(readWrite.filter(item => item.read !== null && item.write).map(item => item.read! / item.write!));

	const easiest = easiestDialect(runs);

	const gains = runs.map(run => conventions(run));
	const maxGain = (strict: 'scriptStrict' | 'meaningStrict', official: 'script' | 'meaning') =>
		Math.max(0, ...gains.filter(item => item[strict] !== null).map(item => item[official] - item[strict]!));

	const cers = runs.map(writingCer).filter((value): value is number => value !== null);
	const medianCer = cers.length ? median(cers) : null;

	return (
		<div className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<header className="pt-12 pb-10">
				<h1 className="text-3xl sm:text-4xl">{t.findings.title}</h1>
				<p className="mt-3 max-w-[60ch] text-lg text-ink-2">{t.findings.lede}</p>
			</header>

			<Finding id="script-words" title={t.home.cliffTitle} text={t.findings.cliffText}>
				<Cliff runs={rankedRuns()} />
			</Finding>

			<Finding id="read-write" title={t.findings.readWrite.title(readsBetter, total)} text={t.findings.readWrite.text(f.score(ratio))}>
				<DotRows
					connect
					caption={t.findings.readWrite.caption}
					series={[
						{key: 'write', label: t.findings.readWrite.write, color: 'var(--pair-a)'},
						{key: 'read', label: t.findings.readWrite.read, color: 'var(--pair-b)'},
					]}
					rows={readWrite.map(item => row(item.run, {read: item.read, write: item.write}))}
				/>
			</Finding>

			{easiest.dialect && (
				<Finding id="dialects" title={t.findings.dialects.title(t.dialect[easiest.dialect], easiest.count, total)} text={t.findings.dialects.text}>
					<DotRows
						caption={t.findings.dialects.caption}
						series={dialects.map((dialect, index) => ({key: dialect, label: t.dialect[dialect], color: `var(--series-${index + 1})`}))}
						rows={runs.map(run => row(run, dialectScores(run)))}
					/>
				</Finding>
			)}

			<Finding
				id="conventions"
				title={t.findings.conventions.title(f.integer(Math.round(maxGain('scriptStrict', 'script'))), f.integer(Math.round(maxGain('meaningStrict', 'meaning'))))}
				text={t.findings.conventions.text}
			>
				<div className="space-y-12">
					{(['script', 'meaning'] as const).map(which => (
						<div key={which}>
							<h3 className="label mb-3">{t.findings.conventions[which]}</h3>
							<DotRows
								connect
								caption={`${t.findings.conventions[which]}. ${t.findings.conventions.caption}`}
								series={[
									{key: 'strict', label: t.findings.conventions.strict, color: 'var(--pair-a)'},
									{key: 'accepted', label: t.findings.conventions.accepted, color: 'var(--pair-b)'},
								]}
								rows={runs.map((run, index) => {
									const item = gains[index]!;
									return row(run, which === 'script' ? {strict: item.scriptStrict, accepted: item.script} : {strict: item.meaningStrict, accepted: item.meaning});
								})}
							/>
						</div>
					))}
				</div>
			</Finding>

			{medianCer !== null && (
				<Finding id="near-misses" title={t.findings.cer.title(medianCer < 50)} text={t.findings.cer.text(f.integer(Math.round(medianCer)))}>
					<DotRows
						unit=" %"
						caption={t.findings.cer.caption}
						series={[{key: 'cer', label: t.findings.cer.series, color: 'var(--pair-a)'}]}
						rows={runs.map(run => row(run, {cer: writingCer(run)}))}
					/>
				</Finding>
			)}
		</div>
	);
}
