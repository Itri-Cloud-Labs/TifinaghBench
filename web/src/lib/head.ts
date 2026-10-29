import type {Lang} from '../i18n';
import {languages, messagesFor} from '../i18n';
import {lab, siteUrl} from '../data/runs';
import {cardPath, cardSize} from '../og/paths';

// Per-page <title>, description, Open Graph and hreflang alternates. `path` is the route after /<lang>.
// `card` points the link preview at a page's own share image; other pages use the leaderboard card.
export function pageHead(lang: Lang, path: string, title: string | null, description?: string, card?: {image: string; alt: string}) {
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
			{property: 'og:url', content: `${siteUrl}/${lang}${path}`},
			{property: 'og:image', content: siteUrl + (card?.image ?? cardPath(lang))},
			{property: 'og:image:width', content: String(cardSize.width)},
			{property: 'og:image:height', content: String(cardSize.height)},
			{property: 'og:image:alt', content: card?.alt ?? t.card.siteAlt},
			{name: 'twitter:card', content: 'summary_large_image'},
		],
		links: [
			...languages.map(other => ({rel: 'alternate', hrefLang: other, href: `/${other}${path}`})),
			{rel: 'alternate', hrefLang: 'x-default', href: `/en${path}`},
		],
	};
}
