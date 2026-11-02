import { readFileSync } from 'node:fs';
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

	it('has exactly one main heading', () => {
		expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
	});
});

describe('built site', () => {
	it('gives every page a different title', () => {
		const titles = pages.map((page) => read(page).match(/<title>([^<]+)<\/title>/)?.[1]);
		expect(new Set(titles).size).toBe(pages.length);
	});

	it('lists both case studies', () => {
		const html = read('projects/index.html');
		expect(html).toContain('Sunward');
		expect(html).toContain('This site');
	});
});
