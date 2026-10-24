import {Link} from '@tanstack/react-router';
import {useI18n} from '../lib/lang';

export function NotFound() {
	const {lang, t} = useI18n();
	return (
		<div className="mx-auto max-w-[84rem] px-5 py-24 sm:px-8">
			<p className="num text-5xl font-semibold text-ink-3" aria-hidden="true">404</p>
			<h1 className="mt-4 text-3xl">{t.notFound.title}</h1>
			<p className="mt-3 text-ink-2">{t.notFound.text}</p>
			<p className="mt-6"><Link to="/$lang" params={{lang}}>{t.notFound.home}</Link></p>
		</div>
	);
}
