import {en} from './en';
import type {Messages} from './en';
import {fr} from './fr';

export const languages = ['en', 'fr'] as const;
export type Lang = (typeof languages)[number];
export const isLang = (value: string): value is Lang => (languages as readonly string[]).includes(value);

const messages: Record<Lang, Messages> = {en, fr};
export const messagesFor = (lang: Lang) => messages[lang];

const locales: Record<Lang, string> = {en: 'en-GB', fr: 'fr-FR'};

export function formatters(lang: Lang) {
	const locale = locales[lang];
	const fixed = new Intl.NumberFormat(locale, {minimumFractionDigits: 1, maximumFractionDigits: 1});
	const integer = new Intl.NumberFormat(locale, {maximumFractionDigits: 0});
	const percent = new Intl.NumberFormat(locale, {style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1});
	const usd = new Intl.NumberFormat(lang === 'en' ? 'en-US' : locale, {style: 'currency', currency: 'USD', minimumFractionDigits: 2});
	const date = new Intl.DateTimeFormat(locale, {dateStyle: 'medium', timeZone: 'UTC'});
	const dateTime = new Intl.DateTimeFormat(locale, {dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC'});
	const integerOrDecimal = (value: number) => new Intl.NumberFormat(locale, {maximumFractionDigits: 1}).format(value);
	return {
		score: (value: number | null | undefined) => value === null || value === undefined ? '—' : fixed.format(value),
		integer: (value: number) => integer.format(value),
		percent: (value: number) => percent.format(value),
		usd: (value: number) => usd.format(value),
		usdShort: (value: number) => (lang === 'en' ? `$${integerOrDecimal(value)}` : `${integerOrDecimal(value)} $`),
		date: (iso: string) => date.format(new Date(iso)),
		dateTime: (iso: string) => `${dateTime.format(new Date(iso))} UTC`,
		list: (items: string[]) => new Intl.ListFormat(locale, {style: 'long', type: 'conjunction'}).format(items),
		listParts: (items: string[]) => new Intl.ListFormat(locale, {style: 'long', type: 'conjunction'}).formatToParts(items),
	};
}

export type Formatters = ReturnType<typeof formatters>;
