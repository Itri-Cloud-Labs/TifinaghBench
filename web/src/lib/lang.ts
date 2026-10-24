import {useParams} from '@tanstack/react-router';
import type {Lang} from '../i18n';
import {formatters, isLang, messagesFor} from '../i18n';

export function useLang(): Lang {
	const {lang} = useParams({strict: false}) as {lang?: string};
	return lang && isLang(lang) ? lang : 'en';
}

export function useI18n() {
	const lang = useLang();
	return {lang, t: messagesFor(lang), f: formatters(lang)};
}
