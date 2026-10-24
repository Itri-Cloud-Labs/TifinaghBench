import {createFileRoute, notFound, Outlet} from '@tanstack/react-router';
import {Footer} from '../components/Footer';
import {Header} from '../components/Header';
import {NotFound} from '../components/NotFound';
import {isLang} from '../i18n';
import {useI18n} from '../lib/lang';

export const Route = createFileRoute('/$lang')({
	beforeLoad: ({params}) => {
		if (!isLang(params.lang)) throw notFound();
	},
	component: Layout,
	notFoundComponent: () => (
		<Shell>
			<NotFound />
		</Shell>
	),
});

function Shell({children}: {children: React.ReactNode}) {
	const {t} = useI18n();
	return (
		<div className="flex min-h-dvh flex-col">
			<a href="#main" className="sr-only z-50 rounded-sm bg-ink px-3 py-2 text-slip focus:not-sr-only focus:fixed focus:top-3 focus:left-3">{t.nav.skip}</a>
			<Header />
			<main id="main" className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}

function Layout() {
	return (
		<Shell>
			<Outlet />
		</Shell>
	);
}
