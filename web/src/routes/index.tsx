import {useEffect} from 'react';
import {createFileRoute} from '@tanstack/react-router';

// Static hosts serve this page at /: a meta refresh sends everyone to /en/, and the script
// sends French browsers to /fr/ first.
export const Route = createFileRoute('/')({
	head: () => ({
		meta: [
			{title: 'TifinaghBench'},
			{httpEquiv: 'refresh', content: '1; url=/en'},
			{name: 'robots', content: 'noindex'},
		],
		links: [{rel: 'canonical', href: '/en'}],
		scripts: [{children: `try{location.replace(/^fr\\b/i.test(navigator.language)?'/fr':'/en')}catch(e){}`}],
	}),
	component: LanguageChoice,
});

function LanguageChoice() {
	useEffect(() => {
		window.location.replace(/^fr\b/i.test(navigator.language) ? '/fr' : '/en');
	}, []);
	return (
		<main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6">
			<p className="text-2xl font-semibold"><span lang="zgh" className="tifinagh mr-2 text-clay">ⵣ</span>TifinaghBench</p>
			<p className="flex gap-6 text-lg">
				<a href="/en" hrefLang="en" lang="en">English</a>
				<a href="/fr" hrefLang="fr" lang="fr">Français</a>
			</p>
		</main>
	);
}
