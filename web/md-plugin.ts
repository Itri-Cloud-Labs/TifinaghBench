import fs from 'node:fs';
import katex from 'katex';
import {Marked} from 'marked';
import type {Plugin} from 'vite';

// `import html from './doc.md?html'` turns Markdown into an HTML string at build time,
// with KaTeX for $$ … $$ blocks and inline $ … $. Nothing of marked or KaTeX reaches the browser.
// Relative links resolve against docs/ in the repository and point at GitHub.
export function markdownHtml(repo = 'https://github.com/Itri-Cloud-Labs/TifinaghBench/blob/main/docs/'): Plugin {
	const marked = new Marked({gfm: true});
	marked.use({walkTokens(token) {
		if (token.type === 'link' && !/^([a-z]+:|#|\/)/i.test(token.href)) token.href = new URL(token.href, repo).href;
	}});
	const slug = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	marked.use({renderer: {
		heading({tokens, depth}) {
			const text = this.parser.parseInline(tokens);
			return `<h${depth} id="${slug(text)}">${text}</h${depth}>\n`;
		},
	}});
	const math = (source: string) => source
		.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => katex.renderToString(tex.trim(), {displayMode: true, throwOnError: true, output: 'html'}))
		.replace(/(?<![\\$\w])\$([^$\n]+?)\$(?!\w)/g, (_, tex: string) => katex.renderToString(tex.trim(), {throwOnError: true, output: 'html'}));
	return {
		name: 'markdown-html',
		enforce: 'pre',
		load(id) {
			const [file, query] = id.split('?');
			if (query !== 'html' || !file?.endsWith('.md')) return null;
			this.addWatchFile(file);
			const html = marked.parse(math(fs.readFileSync(file, 'utf8')), {async: false});
			return `export default ${JSON.stringify(html)};`;
		},
	};
}
