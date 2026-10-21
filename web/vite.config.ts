import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import {tanstackStart} from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {markdownHtml} from './md-plugin';

const here = path.dirname(fileURLToPath(import.meta.url));
const resultsDir = path.resolve(here, '../results');
const slugs = fs.readdirSync(resultsDir, {withFileTypes: true})
	.filter(entry => entry.isDirectory() && fs.existsSync(path.join(resultsDir, entry.name, 'summary.json')))
	.map(entry => entry.name.replace(/^\d{4}-\d{2}-\d{2}-/, ''));
const sections = ['', '/compare', '/methodology', '/dialects', '/run'];
const pages = ['/', '/404', ...['en', 'fr'].flatMap(lang => [
	...sections.map(section => `/${lang}${section}`),
	...slugs.map(slug => `/${lang}/models/${slug}`),
])].map(page => ({path: page}));

export default defineConfig({
	server: {port: 3000, fs: {allow: [path.resolve(here, '..')]}},
	plugins: [
		markdownHtml(),
		tailwindcss(),
		tanstackStart({
			pages,
			prerender: {enabled: true, crawlLinks: false, failOnError: true, autoSubfolderIndex: true},
		}),
		viteReact(),
	],
});
