import {createFileRoute} from '@tanstack/react-router';
import {Footer} from '../components/Footer';
import {Header} from '../components/Header';
import {NotFound} from '../components/NotFound';

// Prerendered to /404.html for static hosts. Shown in English, with links into both languages.
export const Route = createFileRoute('/404')({
	head: () => ({meta: [{title: 'Page not found · TifinaghBench'}, {name: 'robots', content: 'noindex'}]}),
	component: () => (
		<div className="flex min-h-dvh flex-col">
			<Header />
			<main id="main" className="flex-1"><NotFound /></main>
			<Footer />
		</div>
	),
});
