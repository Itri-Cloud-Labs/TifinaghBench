import {createFileRoute} from '@tanstack/react-router';
import {Frieze} from '../../components/Frieze';
import {runs} from '../../data/runs';
import {dialects} from '../../data/schema';
import type {Lang} from '../../i18n';
import {messagesFor} from '../../i18n';
import {pageHead} from '../../lib/head';
import {useI18n} from '../../lib/lang';

export const Route = createFileRoute('/$lang/dialects')({
	head: ({params}) => {
		const t = messagesFor(params.lang as Lang);
		return pageHead(params.lang as Lang, '/dialects', t.dialects.title, t.dialects.lede);
	},
	component: Dialects,
});

// The 33 letters of the IRCAM standard alphabet (Unicode Tifinagh block, U+2D30–U+2D7F).
const alphabet: [string, string][] = [
	['ⴰ', 'a'], ['ⴱ', 'b'], ['ⴳ', 'g'], ['ⴳⵯ', 'gʷ'], ['ⴷ', 'd'], ['ⴹ', 'ḍ'], ['ⴻ', 'e'], ['ⴼ', 'f'], ['ⴽ', 'k'], ['ⴽⵯ', 'kʷ'], ['ⵀ', 'h'],
	['ⵃ', 'ḥ'], ['ⵄ', 'ɛ'], ['ⵅ', 'x'], ['ⵇ', 'q'], ['ⵉ', 'i'], ['ⵊ', 'j'], ['ⵍ', 'l'], ['ⵎ', 'm'], ['ⵏ', 'n'], ['ⵓ', 'u'], ['ⵔ', 'r'],
	['ⵕ', 'ṛ'], ['ⵖ', 'ɣ'], ['ⵙ', 's'], ['ⵚ', 'ṣ'], ['ⵛ', 'c'], ['ⵜ', 't'], ['ⵟ', 'ṭ'], ['ⵡ', 'w'], ['ⵢ', 'y'], ['ⵣ', 'z'], ['ⵥ', 'ẓ'],
];
const spirants: [string, string, string][] = [
	['ⴸ', 'YADH', 'ⴷ'], ['ⵝ', 'YATH', 'ⵜ'], ['ⴲ', 'YABH', 'ⴱ'], ['ⴿ', 'YAKHH', 'ⴽ'], ['ⴵ', 'BERBER ACADEMY YAJ', 'ⴳ'],
];
const codepoints = (text: string) => [...text].map(char => `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`).join(' ');

function Dialects() {
	const {t, f} = useI18n();
	const dataset = runs[0]?.info.dataset ?? {};
	return (
		<div className="mx-auto max-w-[84rem] px-5 sm:px-8">
			<header className="pt-12 pb-10">
				<h1 className="text-3xl sm:text-4xl">{t.dialects.title}</h1>
				<p className="mt-3 max-w-[60ch] text-lg text-ink-2">{t.dialects.lede}</p>
			</header>

			<div className="grid gap-x-12 gap-y-12 lg:grid-cols-3">
				{dialects.map(dialect => {
					const about = t.dialects.about[dialect];
					const entries = dataset[dialect]?.entries;
					return (
						<section key={dialect} aria-labelledby={`dialect-${dialect}`} className="border-t-2 border-ink pt-4">
							<h2 id={`dialect-${dialect}`} className="text-2xl">{t.dialect[dialect]}</h2>
							<p className="mt-3 text-ink-2">{about.region}</p>
							<p className="mt-3">{about.text}</p>
							<dl className="mt-5 text-sm">
								<div className="border-t border-rule py-2.5">
									<dt className="label">{t.dialects.source}</dt>
									<dd className="mt-1">{about.source}</dd>
								</div>
								{entries !== undefined && (
									<div className="border-t border-rule py-2.5">
										<dt className="label">{t.dialects.entries}</dt>
										<dd className="num mt-1">{f.integer(entries)}</dd>
									</div>
								)}
								<div className="border-y border-rule py-2.5">
									<dt className="label">{t.dialects.caveat}</dt>
									<dd className="mt-1 text-ink-2">{about.caveat}</dd>
								</div>
							</dl>
						</section>
					);
				})}
			</div>

			<Frieze className="mt-20 block" />

			<section aria-labelledby="alphabet-title" className="mt-12">
				<div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
					<div>
						<h2 id="alphabet-title" className="text-2xl">{t.dialects.alphabetTitle}</h2>
						<p className="mt-3 text-ink-2">{t.dialects.alphabetLede}</p>
						<div className="mt-8 space-y-3" aria-label={t.dialects.sizes}>
							<p className="label">{t.dialects.sizes}</p>
							{['text-base', 'text-xl', 'text-3xl'].map(size => (
								<p key={size} lang="zgh" className={`tifinagh ${size} leading-snug break-words text-ink`}>
									{alphabet.map(([letter]) => letter).join(' ')}
								</p>
							))}
						</div>
					</div>
					<ul className="grid grid-cols-3 border-t border-l border-rule sm:grid-cols-11">
						{alphabet.map(([letter, latin]) => (
							<li key={letter} className="flex flex-col items-center border-r border-b border-rule px-1 pt-4 pb-3">
								<span lang="zgh" className="tifinagh text-[2.25rem] leading-none text-ink">{letter}</span>
								<span className="mt-3 text-base font-semibold">{latin}</span>
								<span className="num mt-0.5 text-[0.6875rem] text-ink-3">{codepoints(letter)}</span>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section aria-labelledby="spirants-title" className="mt-20 grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
				<div>
					<h2 id="spirants-title" className="text-2xl">{t.dialects.spirantsTitle}</h2>
					<p className="mt-3 text-ink-2">{t.dialects.spirantsLede}</p>
				</div>
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-rule-strong">
							<th scope="col" className="label py-2 pr-4 text-left">{t.dialects.letter}</th>
							<th scope="col" className="label py-2 pr-4 text-left">Unicode</th>
							<th scope="col" className="label py-2 pr-4 text-left">{t.dialects.codepoint}</th>
							<th scope="col" className="label py-2 text-left">{t.dialects.plain}</th>
						</tr>
					</thead>
					<tbody>
						{spirants.map(([letter, name, plain]) => (
							<tr key={letter} className="border-b border-rule">
								<td lang="zgh" className="tifinagh py-3 pr-4 text-3xl leading-none">{letter}</td>
								<td className="py-3 pr-4 text-xs text-ink-2">TIFINAGH LETTER {name}</td>
								<td className="num py-3 pr-4 text-ink-2">{codepoints(letter)}</td>
								<td className="py-3"><span lang="zgh" className="tifinagh text-3xl leading-none">{plain}</span> <span className="num ml-2 text-xs text-ink-3">{codepoints(plain)}</span></td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		</div>
	);
}
