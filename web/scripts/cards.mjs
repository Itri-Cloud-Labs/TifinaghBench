// Draws the link-preview images into dist/client/og/ after the site build: one per model and language,
// plus one per language for every other page. Also draws a score badge per model into dist/client/badge/. src/og/cards.tsx holds the layouts and reads the same
// results as the site, so the cards follow each new run without hand-made graphics.
import fs from 'node:fs';
import {Resvg} from '@resvg/resvg-js';
import viteReact from '@vitejs/plugin-react';
import satori from 'satori';
import {createServer} from 'vite';

const root = new URL('..', import.meta.url);
const font = weight => ({
	name: 'Archivo',
	weight,
	style: 'normal',
	data: fs.readFileSync(new URL(`node_modules/@fontsource/archivo/files/archivo-latin-${weight}-normal.woff`, root)),
});
const fonts = [500, 600, 700, 800].map(font);

// Vite resolves the import.meta.glob calls that load /results, as it does for the pages.
const server = await createServer({
	root: root.pathname,
	configFile: false,
	logLevel: 'error',
	appType: 'custom',
	server: {middlewareMode: true, hmr: false, fs: {allow: [new URL('..', root).pathname]}},
	plugins: [viteReact()],
});
try {
	const {cards, cardSize} = await server.ssrLoadModule('/src/og/cards.tsx');
	for (const {path, node} of cards()) {
		const svg = await satori(node, {...cardSize, fonts});
		const png = new Resvg(svg, {fitTo: {mode: 'width', value: cardSize.width}}).render().asPng();
		const out = new URL(`dist/client${path}`, root);
		fs.mkdirSync(new URL('.', out), {recursive: true});
		fs.writeFileSync(out, png);
	}
	console.log(`Wrote ${cards().length} share cards to dist/client/og/`);

	// Badges stay SVG: no width is given, so each one is as wide as its text.
	const {badges} = await server.ssrLoadModule('/src/og/badges.tsx');
	const {badgeHeight} = await server.ssrLoadModule('/src/og/paths.ts');
	for (const {path, node} of badges()) {
		const out = new URL(`dist/client${path}`, root);
		fs.mkdirSync(new URL('.', out), {recursive: true});
		fs.writeFileSync(out, await satori(node, {height: badgeHeight, fonts}));
	}
	console.log(`Wrote ${badges().length} badges to dist/client/badge/`);
} finally {
	await server.close();
}
