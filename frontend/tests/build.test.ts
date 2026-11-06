import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Checks the exported site, so run `npm run build` first.
const pages = [
	'index.html',
	'projects/index.html',
	'projects/sunward/index.html',
	'projects/this-site/index.html',
	'about/index.html',
];
const out = (path: string) => new URL(`../out/${path}`, import.meta.url);
const read = (page: string) => readFileSync(out(page), 'utf8');

describe.each(pages)('exported page %s', (page) => {
	const html = read(page);

	it('is prerendered in English', () => {
		expect(html).toMatch(/<html[^>]*\blang="en"/);
	});

	it('has the tags a page needs to render on phones', () => {
		expect(html).toMatch(/<meta charset="utf-8"/i);
		expect(html).toMatch(/<meta name="viewport"/);
		expect(html).toMatch(/<title>[^<]+<\/title>/);
	});

	it('has its own Open Graph title, description and absolute URL', () => {
		expect(html).toMatch(/<meta property="og:title" content="[^"]+"/);
		expect(html).toMatch(/<meta property="og:description" content="[^"]+"/);
		expect(html).toMatch(/<meta property="og:url" content="https:\/\/jjduques\.github\.io\/[^"]*"/);
	});

	// GitHub Pages serves from the root with no base path (ADR 0002). A link to a page
	// or file the export didn't produce is broken in production too.
	it('only links to pages and files that exist in the export', () => {
		const paths = [...html.matchAll(/\b(?:href|src)="(\/[^"#?]*)/g)].map((match) => match[1]);
		for (const path of paths) {
			const decoded = decodeURIComponent(path);
			const candidates = decoded.endsWith('/') ? [`${decoded}index.html`] : [decoded, `${decoded}/index.html`];
			expect(
				candidates.some((candidate) => existsSync(out(candidate.slice(1)))),
				`${page} links to ${path}`,
			).toBe(true);
		}
	});

	it('has exactly one main heading', () => {
		expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
	});

	it('never publishes a phone number', () => {
		expect(html).not.toMatch(/\+57|315\s?626/);
	});
});

describe('exported site', () => {
	it('gives every page a different title', () => {
		const titles = pages.map((page) => read(page).match(/<title>([^<]+)<\/title>/)?.[1]);
		expect(new Set(titles).size).toBe(pages.length);
	});

	it('has a 404 page for GitHub Pages', () => {
		expect(existsSync(out('404.html'))).toBe(true);
	});

	it('draws the live flow on the home page', () => {
		const html = read('index.html');
		expect(html).toContain('How this page reached you');
		for (const node of ['GitHub Pages', 'A 2014 laptop at my house', 'SQLite']) expect(html).toContain(node);
	});

	it('offers the résumé and lists the experience on the home page', () => {
		const html = read('index.html');
		expect(html).toContain('href="/cv/juan-duque-backend-cv.pdf"');
		expect(html).toContain('Unitti');
		expect(html).not.toContain('Azure');
	});

	it('opens LinkedIn in a new tab', () => {
		const html = read('index.html');
		const links = [...html.matchAll(/<a[^>]*href="https:\/\/www\.linkedin\.com[^"]*"[^>]*>/g)].map((match) => match[0]);
		expect(links.length).toBeGreaterThan(0);
		for (const link of links) {
			expect(link).toContain('target="_blank"');
			expect(link).toMatch(/rel="[^"]*noopener/);
		}
	});

	it('has a contact form with a honeypot field', () => {
		const html = read('index.html');
		expect(html).toMatch(/<textarea[^>]*name="message"/);
		expect(html).toMatch(/<input[^>]*name="website"/);
	});

	it('draws icons for the stack', () => {
		expect(read('index.html').match(/<img[^>]*src="\/icons\/[a-z]+\.svg"/g)?.length ?? 0).toBeGreaterThanOrEqual(10);
	});

	it('links every case study from the home page', () => {
		const html = read('index.html');
		expect(html).toContain('href="/projects/sunward/"');
		expect(html).toContain('href="/projects/this-site/"');
	});
});
