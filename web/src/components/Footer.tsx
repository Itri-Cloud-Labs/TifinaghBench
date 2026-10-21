import {Link} from '@tanstack/react-router';
import {githubUrl, lastUpdated} from '../data/runs';
import {useI18n} from '../lib/lang';
import {Frieze} from './Frieze';

export function Footer() {
	const {lang, t, f} = useI18n();
	return (
		<footer className="mt-24 bg-clay text-clay-ink">
			<Frieze tone="slip" height={14} className="block opacity-70" />
			<div className="mx-auto grid max-w-[84rem] gap-6 px-5 py-10 text-sm sm:px-8 md:grid-cols-[1fr_auto]">
				<div className="space-y-1.5 text-clay-ink-2">
					<p className="flex items-center gap-2 text-base font-semibold text-clay-ink">
						<span lang="zgh" className="tifinagh text-xl leading-none" aria-hidden="true">ⵣ</span> TifinaghBench
					</p>
					<p>{t.footer.license} {t.footer.datasets}</p>
					{lastUpdated && <p>{t.footer.updated(f.date(lastUpdated))}</p>}
				</div>
				<ul className="flex flex-wrap items-start gap-x-5 gap-y-2">
					<li><Link to="/$lang/methodology" params={{lang}} className="text-clay-ink">{t.nav.methodology}</Link></li>
					<li><Link to="/$lang/run" params={{lang}} className="text-clay-ink">{t.nav.run}</Link></li>
					<li><a href={githubUrl} className="text-clay-ink">{t.footer.source}</a></li>
				</ul>
			</div>
		</footer>
	);
}
