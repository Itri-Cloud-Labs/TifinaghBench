// Static hosts look for /404.html; the prerender writes the page to /404/index.html.
// Hosts serve 404.html at whatever URL was missed, where the client router would render a different tree
// than the prerendered /404 and fail hydration. The page is static, so it ships without the app bundle;
// only the inline theme script stays.
import fs from 'node:fs';

const from = new URL('../dist/client/404/index.html', import.meta.url);
const to = new URL('../dist/client/404.html', import.meta.url);
const html = fs
	.readFileSync(from, 'utf8')
	.replace(/<link rel="modulepreload"[^>]*>/g, '')
	.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, script => (script.includes("localStorage.getItem('theme')") ? script : ''));
fs.writeFileSync(to, html);
console.log('Wrote dist/client/404.html');

// The site must never show dictionary words: Tifinagh appears only as single letters (plus the labialization mark ⵯ).
const words = [];
const walk = dir => {
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
		if (entry.isDirectory()) walk(path);
		else if (/\.(html|js|json|txt|xml)$/.test(entry.name)) {
			for (const [match] of fs.readFileSync(path, 'utf8').matchAll(/[ⴰ-⵿]{2,}/g)) {
				if (!/^[ⴰ-⵿]ⵯ$/.test(match)) words.push(`${path.pathname.split('/dist/client/')[1]}: ${match}`);
			}
		}
	}
};
walk(new URL('../dist/client/', import.meta.url));
if (words.length) {
	console.error(`Tifinagh words found in the build:\n${[...new Set(words)].join('\n')}`);
	process.exit(1);
}
console.log('No Tifinagh words in the build');
