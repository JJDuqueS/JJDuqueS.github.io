import { describe, expect, it } from 'vitest';
import { basePath, dictionaries, langOfPath, localePath } from '@/lib/i18n';
import { browserLang, languageAction } from '@/lib/lang-preference';

describe('paths', () => {
	it('puts Spanish under /es/ with the same slugs', () => {
		expect(localePath('en', '/about/')).toBe('/about/');
		expect(localePath('es', '/about/')).toBe('/es/about/');
		expect(localePath('es', '/')).toBe('/es/');
	});

	it('finds the English path of any page, with or without a trailing slash', () => {
		expect(basePath('/es/projects/sunward')).toBe('/projects/sunward/');
		expect(basePath('/es/')).toBe('/');
		expect(basePath('/es')).toBe('/');
		expect(basePath('/about')).toBe('/about/');
		expect(basePath('/')).toBe('/');
		expect(langOfPath('/es/about/')).toBe('es');
		expect(langOfPath('/estimates/')).toBe('en');
	});
});

describe('language preference', () => {
	it('reads the browser’s first language', () => {
		expect(browserLang(['es-CO', 'en'])).toBe('es');
		expect(browserLang(['en-US', 'es'])).toBe('en');
		expect(browserLang(['fr-FR'])).toBeNull();
		expect(browserLang([])).toBeNull();
	});

	it('follows an explicit choice, offers the browser’s language, and never guesses a redirect', () => {
		expect(languageAction('en', 'es', null)).toBe('redirect');
		expect(languageAction('es', 'es', 'en')).toBe('none');
		expect(languageAction('en', null, 'es')).toBe('offer');
		expect(languageAction('es', null, 'en')).toBe('offer');
		expect(languageAction('en', null, 'en')).toBe('none');
		expect(languageAction('en', null, null)).toBe('none');
	});
});

describe('dictionaries', () => {
	// Every string the English site shows has a Spanish counterpart that isn't a copy.
	const leaves = (value: unknown, path = ''): [string, string][] =>
		typeof value === 'string'
			? [[path, value]]
			: value && typeof value === 'object'
				? Object.entries(value).flatMap(([key, child]) => leaves(child, `${path}.${key}`))
				: [];
	const same = new Set(['.nav.resume', '.home.stack', '.projects.stack', '.flow.nodes.cdn.name', '.flow.nodes.api.name', '.flow.nodes.db.name', '.og.steps.1', '.og.steps.2', '.og.steps.3', '.flow.ok']);

	it('translates every string', () => {
		const es = new Map(leaves(dictionaries.es));
		for (const [path, text] of leaves(dictionaries.en)) {
			expect(es.has(path), path).toBe(true);
			if (!same.has(path) && !/(skip|langHint)/.test(path)) expect(es.get(path), path).not.toBe(text);
		}
	});
});
