import { describe, expect, it } from 'vitest';
import { checkApiUrl } from '@/lib/api-url';

describe('checkApiUrl', () => {
	it('accepts the public Funnel origin and normalizes it', () => {
		expect(checkApiUrl('https://jjd-api.tail1234.ts.net')).toBe('https://jjd-api.tail1234.ts.net');
		expect(checkApiUrl(' https://jjd-api.tail1234.ts.net/ ')).toBe('https://jjd-api.tail1234.ts.net');
	});

	it('leaves the form off when the variable is empty', () => {
		expect(checkApiUrl(undefined)).toBe('');
		expect(checkApiUrl('')).toBe('');
	});

	it('rejects the n8n webhook URL that only exists on the laptop', () => {
		expect(() => checkApiUrl('http://host.docker.internal:5678/webhook/portfolio-contact')).toThrow(
			/https.*only exists inside your network.*no path/,
		);
	});

	it('rejects local, private and plain HTTP addresses', () => {
		for (const bad of ['http://jjd-api.tail1234.ts.net', 'https://localhost:8080', 'https://192.168.1.20', 'https://10.0.0.5', 'nope']) {
			expect(() => checkApiUrl(bad), bad).toThrow();
		}
	});

	it('accepts the local API only in development', () => {
		expect(checkApiUrl('http://127.0.0.1:8000', { allowLocal: true })).toBe('http://127.0.0.1:8000');
		expect(() => checkApiUrl('http://127.0.0.1:8000')).toThrow();
		expect(() => checkApiUrl('http://host.docker.internal:5678', { allowLocal: true })).toThrow();
	});
});
