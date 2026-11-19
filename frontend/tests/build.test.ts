import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Checks the exported site, so run `npm run build` first.
const englishPages = [
	'index.html',
	'projects/index.html',
	'projects/sunward/index.html',
	'projects/this-site/index.html',
	'about/index.html',
];
// The same pages in Spanish, under /es/ with the same slugs (ADR 0005).
const spanishPages = englishPages.map((page) => `es/${page}`);
const pages = [...englishPages, ...spanishPages];
const langOf = (page: string) => (page.startsWith('es/') ? 'es' : 'en');
const urlOf = (page: string) => `https://jjduques.github.io/${page.replace(/index\.html$/, '')}`;
const out = (path: string) => new URL(`../out/${path}`, import.meta.url);
const read = (page: string) => readFileSync(out(page), 'utf8');

describe.each(pages)('exported page %s', (page) => {
	const html = read(page);

	it('is prerendered in its language', () => {
		expect(html).toMatch(new RegExp(`<html[^>]*\\blang="${langOf(page)}"`));
	});

	it('points to itself as canonical and to both language versions', () => {
		const english = urlOf(page.replace(/^es\//, ''));
		const spanish = urlOf(page.startsWith('es/') ? page : `es/${page}`);
		expect(html).toContain(`<link rel="canonical" href="${urlOf(page)}"/>`);
		expect(html).toContain(`<link rel="alternate" hrefLang="en" href="${english}"/>`);
		expect(html).toContain(`<link rel="alternate" hrefLang="es" href="${spanish}"/>`);
		expect(html).toContain(`<link rel="alternate" hrefLang="x-default" href="${english}"/>`);
	});

	it('links to the same page in the other language', () => {
		const counterpart = page.startsWith('es/') ? `/${page.slice(3)}` : `/es/${page}`;
		expect(html).toContain(`href="${counterpart.replace(/index\.html$/, '')}"`);
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

	it('shows the large preview image in its language when shared', () => {
		const image = langOf(page) === 'es' ? 'og-es.png' : 'og.png';
		expect(html).toContain(`<meta property="og:image" content="https://jjduques.github.io/${image}"/>`);
		expect(html).toContain('<meta name="twitter:card" content="summary_large_image"/>');
	});

	it('has exactly one main heading', () => {
		expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
	});

	it('never publishes a phone number', () => {
		expect(html).not.toMatch(/\+57|315\s?626/);
	});
});

describe('exported site', () => {
	it('gives every page a different title within each language', () => {
		for (const group of [englishPages, spanishPages]) {
			const titles = group.map((page) => read(page).match(/<title>([^<]+)<\/title>/)?.[1]);
			expect(new Set(titles).size).toBe(group.length);
		}
	});

	it('draws a 1200x630 PNG preview image in each language', () => {
		for (const file of ['og.png', 'og-es.png']) {
			const png = readFileSync(out(file));
			expect(png.subarray(1, 4).toString(), file).toBe('PNG');
			expect([png.readUInt32BE(16), png.readUInt32BE(20)], file).toEqual([1200, 630]);
		}
	});

	it('lists every page in the sitemap and points robots.txt at it', () => {
		const sitemap = read('sitemap.xml');
		for (const page of pages) {
			const path = page.replace(/index\.html$/, '');
			expect(sitemap).toContain(`<loc>https://jjduques.github.io/${path}</loc>`);
		}
		expect(read('robots.txt')).toContain('Sitemap: https://jjduques.github.io/sitemap.xml');
	});

	it('has a 404 page for GitHub Pages, in both languages', () => {
		expect(read('404.html')).toContain('No hay ninguna página');
		expect(existsSync(out('404.html'))).toBe(true);
	});

	it('draws the live flow on the home page', () => {
		const html = read('index.html');
		expect(html).toContain('How this page reached you');
		for (const node of ['GitHub Pages', 'A 2014 laptop working as a homelab', 'SQLite']) expect(html).toContain(node);
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

	it('shows the Spanish home page in Spanish', () => {
		const html = read('es/index.html');
		for (const text of ['Cómo te llegó esta página', 'Experiencia', 'Trabajo destacado', 'Reduje la latencia', 'Leer el caso de estudio', 'Enviar mensaje']) {
			expect(html, text).toContain(text);
		}
		expect(html).toContain('href="/es/projects/sunward/"');
		expect(html).toContain('href="/es/about/"');
	});
});
