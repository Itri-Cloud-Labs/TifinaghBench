/// <reference types="vite/client" />
import type {ReactNode} from 'react';
import {createRootRoute, HeadContent, Outlet, Scripts, useParams} from '@tanstack/react-router';
import {isLang} from '../i18n';
import {NotFound} from '../components/NotFound';
import css from '../styles.css?url';
import tifinaghFont from '@fontsource/noto-sans-tifinagh/files/noto-sans-tifinagh-tifinagh-400-normal.woff2?url';
import archivoFont from '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2?url';

// Runs before first paint so the stored or system theme never flashes.
const themeScript = `(()=>{try{var s=localStorage.getItem('theme');var d=s==='dark'||(s!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})()`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{charSet: 'utf-8'},
			{name: 'viewport', content: 'width=device-width, initial-scale=1'},
			{name: 'theme-color', content: '#9c3a22'},
		],
		links: [
			{rel: 'preload', href: archivoFont, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous'},
			{rel: 'preload', href: tifinaghFont, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous'},
			{rel: 'stylesheet', href: css},
			{rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml'},
		],
		scripts: [{children: themeScript}],
	}),
	component: () => <Outlet />,
	notFoundComponent: () => <NotFound />,
	shellComponent: Document,
});

function Document({children}: {children: ReactNode}) {
	const {lang} = useParams({strict: false}) as {lang?: string};
	return (
		<html lang={lang && isLang(lang) ? lang : 'en'} data-theme="light" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
