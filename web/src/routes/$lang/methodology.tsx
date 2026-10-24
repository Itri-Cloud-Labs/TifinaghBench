import katexCss from 'katex/dist/katex.min.css?url';
import {createFileRoute} from '@tanstack/react-router';
import methodologyEn from '../../../content/en/methodology.md?html';
import methodologyFr from '../../../content/fr/methodology.md?html';
import rankingEn from '../../../content/en/ranking.md?html';
import rankingFr from '../../../content/fr/ranking.md?html';
import {githubUrl} from '../../data/runs';
import type {Lang} from '../../i18n';
import {messagesFor} from '../../i18n';
import {pageHead} from '../../lib/head';
import {useI18n} from '../../lib/lang';

// The table of contents is read from the rendered h2 headings.
// The headings are already HTML-escaped, and React escapes text again, so entities are decoded first.
const entities: Record<string, string> = {amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'"};
const decode = (text: string) => text.replace(/&(amp|lt|gt|quot|#39);/g, (_, name: string) => entities[name]!);
const toc = (html: string) => [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map(([, id, text]) => ({id: id!, text: decode(text!.replace(/<[^>]+>/g, ''))}));

const docs = {en: {methodology: methodologyEn, ranking: rankingEn}, fr: {methodology: methodologyFr, ranking: rankingFr}};

export const Route = createFileRoute('/$lang/methodology')({
	head: ({params}) => {
		const t = messagesFor(params.lang as Lang);
		const head = pageHead(params.lang as Lang, '/methodology', t.methodology.title, t.methodology.lede);
		return {...head, links: [...head.links, {rel: 'stylesheet', href: katexCss}]};
	},
	component: Methodology,
});

function Methodology() {
	const {lang, t} = useI18n();
	return (
		<div className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<header className="pt-12 pb-4">
				<h1 className="text-3xl sm:text-4xl">{t.methodology.title}</h1>
				<p className="mt-3 max-w-[60ch] text-lg text-ink-2">{t.methodology.lede}</p>
			</header>
			<div className="grid gap-x-16 lg:grid-cols-[minmax(0,70ch)_minmax(0,1fr)]">
				<div className="min-w-0">
					<div className="prose-doc" dangerouslySetInnerHTML={{__html: docs[lang].methodology}} />
					<div className="prose-doc" dangerouslySetInnerHTML={{__html: docs[lang].ranking}} />
				</div>
				<nav aria-label={t.methodology.contents} className="hidden lg:block">
					<div className="sticky top-8 mt-12 border-t border-rule-strong pt-3">
						<p className="label">{t.methodology.contents}</p>
						<ul className="mt-3 space-y-2 text-sm">
							{[...toc(docs[lang].methodology), ...toc(docs[lang].ranking)].map(item => (
								<li key={item.id}><a href={`#${item.id}`} className="text-ink-2 no-underline hover:text-ink hover:underline">{item.text}</a></li>
							))}
						</ul>
					</div>
				</nav>
			</div>
			<p className="mt-12 max-w-[70ch] border-t border-rule pt-4 text-sm text-ink-3">
				<a href={`${githubUrl}/blob/main/docs/methodology.md`}>{t.methodology.source}</a>
			</p>
		</div>
	);
}
