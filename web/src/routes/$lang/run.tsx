import {createFileRoute} from '@tanstack/react-router';
import {githubUrl} from '../../data/runs';
import type {Lang} from '../../i18n';
import {messagesFor} from '../../i18n';
import {pageHead} from '../../lib/head';
import {useI18n} from '../../lib/lang';

export const Route = createFileRoute('/$lang/run')({
	head: ({params}) => {
		const t = messagesFor(params.lang as Lang);
		return pageHead(params.lang as Lang, '/run', t.meta.titles.run, t.run.lede);
	},
	component: RunIt,
});

const quickStart = `git clone ${githubUrl}.git
cd TifinaghBench/cli
npm install
npm run dev`;

const official = `npm run build
node dist/cli.js \\
  --harness=<codex|claude-code|opencode> \\
  --model=<model id> \\
  --reasoning=<level> \\
  --dialects=ircam,tarifit,kabyle \\
  --tasks=tif-to-en,en-to-tif,transliterate \\
  --judge-harness=claude-code --judge-model=claude-haiku-5-5 \\
  --sample=1000 --batch-size=100 --seed=1 -y`;

const exportCommand = `node dist/cli.js --export-public results/<run folder> \\
  --output ../results/<run folder>`;

function Code({children}: {children: string}) {
	return (
		<pre className="mt-4 overflow-x-auto rounded-sm border border-rule bg-slip-2 p-4 font-mono text-sm leading-relaxed text-ink"><code>{children}</code></pre>
	);
}

function Step({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<section className="grid gap-x-16 gap-y-3 border-t border-rule-strong py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
			<h2 className="text-xl">{title}</h2>
			<div className="min-w-0 max-w-[70ch]">{children}</div>
		</section>
	);
}

function RunIt() {
	const {t} = useI18n();
	return (
		<div className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<header className="pt-12 pb-10">
				<h1 className="text-3xl sm:text-4xl">{t.run.title}</h1>
				<p className="mt-3 max-w-[60ch] text-lg text-ink-2">{t.run.lede}</p>
			</header>
			<Step title={t.run.requirements}>
				<ul className="list-disc space-y-1.5 pl-5 marker:text-ink-3">
					{t.run.requirementsList.map(item => <li key={item}>{item}</li>)}
				</ul>
				<p className="mt-4 text-ink-2">{t.run.datasets} <a href={`${githubUrl}/blob/main/tifinagh-dataset/README.md`}>{t.run.datasetsLink}</a></p>
			</Step>
			<Step title={t.run.quickStart}>
				<p className="text-ink-2">{t.run.quickStartText}</p>
				<Code>{quickStart}</Code>
			</Step>
			<Step title={t.run.official}>
				<p className="text-ink-2">{t.run.officialText}</p>
				<Code>{official}</Code>
				<p className="mt-4 text-ink-2">{t.run.resume}</p>
			</Step>
			<Step title={t.run.export}>
				<p className="text-ink-2">{t.run.exportText}</p>
				<Code>{exportCommand}</Code>
			</Step>
			<Step title={t.run.submit}>
				<p className="text-ink-2">{t.run.submitText}</p>
				<p className="mt-4"><a href={githubUrl} className="font-medium">{t.run.openRepo}</a></p>
			</Step>
		</div>
	);
}
