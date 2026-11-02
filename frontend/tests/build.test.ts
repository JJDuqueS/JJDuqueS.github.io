import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Checks the built site, so run `npm run build` first.
const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

describe('built home page', () => {
	it('is prerendered in English', () => {
		expect(home).toMatch(/<html[^>]*\blang="en"/);
	});

	it('has the tags a page needs to render on phones', () => {
		expect(home).toMatch(/<meta charset="utf-8"/i);
		expect(home).toMatch(/<meta name="viewport"/);
		expect(home).toMatch(/<title>[^<]+<\/title>/);
	});
});
