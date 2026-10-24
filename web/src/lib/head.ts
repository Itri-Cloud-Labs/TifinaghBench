import type {Lang} from '../i18n';
import {languages, messagesFor} from '../i18n';
import {lab} from '../data/runs';

// Per-page <title>, description, Open Graph and hreflang alternates. `path` is the route after /<lang>.
export function pageHead(lang: Lang, path: string, title: string | null, description?: string) {
	const t = messagesFor(lang);
	const full = title ? `${title} · ${t.meta.siteName}` : `${t.meta.siteName}: ${t.home.title}`;
	const text = description ?? t.meta.description;
	return {
		meta: [
			{title: full},
			{name: 'description', content: text},
			{name: 'author', content: lab.name},
			{property: 'og:title', content: full},
			{property: 'og:description', content: text},
			{property: 'og:type', content: 'website'},
			{property: 'og:site_name', content: t.meta.siteName},
			{property: 'og:locale', content: lang === 'fr' ? 'fr_FR' : 'en_GB'},
		],
		links: [
			...languages.map(other => ({rel: 'alternate', hrefLang: other, href: `/${other}${path}`})),
			{rel: 'alternate', hrefLang: 'x-default', href: `/en${path}`},
		],
	};
}
