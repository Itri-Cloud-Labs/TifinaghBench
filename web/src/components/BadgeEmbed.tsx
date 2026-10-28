import {useState} from 'react';
import type {Run} from '../data/runs';
import {siteUrl} from '../data/runs';
import {useI18n} from '../lib/lang';
import {badgePath} from '../og/paths';

// The model's score badge, with Markdown and HTML snippets that link back to its page.
export function BadgeEmbed({run}: {run: Run}) {
	const {lang, t, f} = useI18n();
	const [copied, setCopied] = useState<string | null>(null);
	if (!run.score) return null;
	const image = siteUrl + badgePath(run.slug);
	const page = `${siteUrl}/${lang}/models/${run.slug}`;
	const alt = t.model.badge.alt(run.name, f.score(run.score.value));
	const snippets = [
		{key: 'Markdown', code: `[![${alt}](${image})](${page})`},
		{key: 'HTML', code: `<a href="${page}"><img src="${image}" alt="${alt}"></a>`},
	];

	const copy = async (key: string, code: string) => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(key);
			setTimeout(() => setCopied(null), 1600);
		} catch {}
	};

	return (
		<section aria-labelledby="badge-title" className="mt-16 border-t border-rule-strong pt-10">
			<h2 id="badge-title" className="text-2xl">{t.model.badge.title}</h2>
			<p className="mt-2 max-w-[62ch] text-sm text-ink-2">{t.model.badge.lede}</p>
			<img src={badgePath(run.slug)} alt={alt} className="mt-5 block h-6 w-auto" />
			<div className="mt-5 grid max-w-[60rem] gap-3">
				{snippets.map(({key, code}) => (
					<div key={key} className="flex min-w-0 items-center gap-3 rounded-sm border border-rule bg-slip-2 py-1.5 pr-1.5 pl-3">
						<span className="label w-20 shrink-0">{key}</span>
						<code className="min-w-0 flex-1 truncate font-mono text-xs text-ink-2">{code}</code>
						<button type="button" onClick={() => copy(key, code)} className="h-8 min-w-22 shrink-0 rounded-sm border border-rule-strong bg-slip px-3 text-sm font-medium text-ink hover:bg-slip-3">
							{copied === key ? t.model.badge.copied : t.model.badge.copy}
						</button>
					</div>
				))}
			</div>
		</section>
	);
}
