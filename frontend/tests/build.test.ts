import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Checks the built site, so run `npm run build` first.
const pages = ['index.html', 'projects/index.html', 'about/index.html'];
const read = (page: string) => readFileSync(new URL(`../dist/${page}`, import.meta.url), 'utf8');

describe.each(pages)('built page %s', (page) => {
	const html = read(page);

	it('is prerendered in English', () => {
		expect(html).toMatch(/<html[^>]*\blang="en"/);
	});

	it('has the tags a page needs to render on phones', () => {
		expect(html).toMatch(/<meta charset="utf-8"/i);
		expect(html).toMatch(/<meta name="viewport"/);
		expect(html).toMatch(/<title>[^<]+<\/title>/);
	});

	it('has its own Open Graph title and description', () => {
		expect(html).toMatch(/<meta property="og:title" content="[^"]+"/);
		expect(html).toMatch(/<meta property="og:description" content="[^"]+"/);
	});

	it('has an absolute og:url on the published site', () => {
		expect(html).toMatch(/<meta property="og:url" content="https:\/\/jjduques\.github\.io\/[^"]*"/);
	});

	// GitHub Pages serves from the root with no base path (ADR 0002). A link that points
	// at a page the build didn't produce is broken in production too.
	it('only links to pages and files that exist in the build', () => {
		const hrefs = [...html.matchAll(/\b(?:href|src)="(\/[^"#?]*)/g)].map((match) => match[1]);
		for (const href of hrefs) {
			const target = href.endsWith('/') ? `${href}index.html` : href;
			const candidates = [target, `${target}/index.html`];
			const found = candidates.some((candidate) => existsSync(new URL(`../dist${candidate}`, import.meta.url)));
			expect(found, `${page} links to ${href}`).toBe(true);
		}
	});

	it('has exactly one main heading', () => {
		expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
	});
});

describe('built site', () => {
	it('gives every page a different title', () => {
		const titles = pages.map((page) => read(page).match(/<title>([^<]+)<\/title>/)?.[1]);
		expect(new Set(titles).size).toBe(pages.length);
	});

	it('shows how the home page was delivered', () => {
		const html = read('index.html');
		expect(html).toContain('How this page reached you');
		expect(html).toContain('data-trace');
	});

	it('links every case study on the home page to its anchor', () => {
		const html = read('index.html');
		expect(html).toContain('href="/projects#sunward"');
		expect(read('projects/index.html')).toContain('id="sunward"');
	});

	it('lists both case studies', () => {
		const html = read('projects/index.html');
		expect(html).toContain('Sunward');
		expect(html).toContain('This site');
	});
});
