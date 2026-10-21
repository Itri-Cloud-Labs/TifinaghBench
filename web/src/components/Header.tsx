import {useEffect, useState} from 'react';
import {Link, useLocation} from '@tanstack/react-router';
import {githubUrl} from '../data/runs';
import {useI18n} from '../lib/lang';
import {Hem} from './Frieze';
import {GithubIcon, HeartIcon, MenuIcon, MoonIcon, SunIcon} from './Icons';

type Theme = 'light' | 'dark';

function ThemeToggle() {
	const {t} = useI18n();
	const [theme, setTheme] = useState<Theme>('light');
	useEffect(() => {
		setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
	}, []);
	const next: Theme = theme === 'dark' ? 'light' : 'dark';
	return (
		<button
			type="button"
			className="inline-flex size-9 items-center justify-center rounded-sm text-clay-ink transition-colors duration-150 hover:bg-clay-deep"
			aria-label={next === 'dark' ? t.nav.themeDark : t.nav.themeLight}
			title={next === 'dark' ? t.nav.themeDark : t.nav.themeLight}
			onClick={() => {
				document.documentElement.dataset.theme = next;
				try {
					localStorage.setItem('theme', next);
				} catch {}
				setTheme(next);
			}}
		>
			{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
		</button>
	);
}

function LanguageSwitch() {
	const {lang, t} = useI18n();
	const location = useLocation();
	const rest = location.pathname.replace(/^\/(en|fr)(?=\/|$)/, '');
	const search = location.searchStr ?? '';
	return (
		<nav aria-label={t.nav.language} className="flex items-center rounded-sm border border-clay-ink/35 text-xs font-semibold">
			{(['en', 'fr'] as const).map(code => (
				<a
					key={code}
					href={`/${code}${rest}${search}`}
					hrefLang={code}
					lang={code}
					aria-current={code === lang ? 'true' : undefined}
					className={`px-2 py-1 uppercase no-underline transition-colors duration-150 ${code === lang ? 'bg-clay-ink text-clay' : 'text-clay-ink hover:bg-clay-deep'}`}
				>
					{code}
				</a>
			))}
		</nav>
	);
}

export function Header() {
	const {lang, t} = useI18n();
	const [open, setOpen] = useState(false);
	const location = useLocation();
	useEffect(() => setOpen(false), [location.pathname]);
	const items = [
		{to: '/$lang', label: t.nav.leaderboard, exact: true},
		{to: '/$lang/compare', label: t.nav.compare},
		{to: '/$lang/findings', label: t.nav.findings},
		{to: '/$lang/methodology', label: t.nav.methodology},
		{to: '/$lang/dialects', label: t.nav.dialects},
		{to: '/$lang/run', label: t.nav.run},
	] as const;
	return (
		<header className="bg-clay text-clay-ink">
			<div className="mx-auto flex max-w-[84rem] items-center gap-6 px-5 py-3 sm:px-8">
				<Link to="/$lang" params={{lang}} className="flex shrink-0 items-center gap-2.5 text-clay-ink no-underline">
					<span lang="zgh" className="tifinagh text-[1.65rem] leading-none" aria-hidden="true">ⵣ</span>
					<span className="text-lg font-bold tracking-[-0.01em]">TifinaghBench</span>
				</Link>
				<nav aria-label="Main" className="hidden flex-1 lg:block">
					<ul className="flex items-center gap-1">
						{items.map(item => (
							<li key={item.to}>
								<Link
									to={item.to}
									params={{lang}}
									activeOptions={{exact: 'exact' in item}}
									className="block rounded-sm px-3 py-1.5 text-sm font-medium text-clay-ink-2 no-underline transition-colors duration-150 hover:bg-clay-deep hover:text-clay-ink data-[status=active]:bg-clay-deep data-[status=active]:text-clay-ink"
								>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<div className="ml-auto flex items-center gap-2 lg:ml-0">
					<LanguageSwitch />
					<ThemeToggle />
					<Link to="/$lang/support" params={{lang}} className="hidden h-9 items-center gap-1.5 sm:inline-flex rounded-sm px-2 text-sm font-medium text-clay-ink no-underline transition-colors duration-150 hover:bg-clay-deep data-[status=active]:bg-clay-deep" aria-label={t.nav.support} title={t.nav.support}>
						<HeartIcon />
						<span className="hidden xl:inline">{t.nav.support}</span>
					</Link>
					<a href={githubUrl} className="hidden size-9 items-center justify-center rounded-sm text-clay-ink transition-colors duration-150 hover:bg-clay-deep sm:inline-flex" aria-label={t.nav.github} title={t.nav.github}>
						<GithubIcon />
					</a>
					<button type="button" className="inline-flex size-9 items-center justify-center rounded-sm text-clay-ink hover:bg-clay-deep lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(value => !value)}>
						<MenuIcon />
						<span className="sr-only">{t.nav.menu}</span>
					</button>
				</div>
			</div>
			<nav id="mobile-nav" aria-label="Main" hidden={!open} className="border-t border-clay-ink/20 lg:hidden">
				<ul className="mx-auto max-w-[84rem] px-5 py-2">
					{items.map(item => (
						<li key={item.to}>
							<Link to={item.to} params={{lang}} activeOptions={{exact: 'exact' in item}} className="block rounded-sm px-3 py-2.5 text-clay-ink no-underline data-[status=active]:bg-clay-deep">
								{item.label}
							</Link>
						</li>
					))}
					<li><Link to="/$lang/support" params={{lang}} className="block rounded-sm px-3 py-2.5 text-clay-ink no-underline data-[status=active]:bg-clay-deep">{t.nav.support}</Link></li>
					<li><a href={githubUrl} className="block rounded-sm px-3 py-2.5 text-clay-ink no-underline">{t.nav.github}</a></li>
				</ul>
			</nav>
			<div className="bg-slip"><Hem /></div>
		</header>
	);
}
