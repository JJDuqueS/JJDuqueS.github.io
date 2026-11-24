import { describe, expect, it } from 'vitest';
import { fetchHealth, formatDuration } from '@/lib/api-health';

const body = {
	status: 'ok',
	database: 'ok',
	database_ms: 1.2,
	uptime_seconds: 4219,
	host: { uptime_seconds: 450495, load: [0.6, 1.49, 2.2], memory_mb: { total: 1528, available: 673 } },
};

const clock = (...values: number[]) => () => values.shift() ?? 0;

describe('fetchHealth', () => {
	it('times the round trip and returns the health', async () => {
		const fetchImpl = (async (url: string) => {
			expect(url).toBe('https://api.example.ts.net/api/health');
			return new Response(JSON.stringify(body), { status: 200 });
		}) as unknown as typeof fetch;
		const result = await fetchHealth('https://api.example.ts.net', { fetchImpl, now: clock(100, 282) });
		expect(result).toEqual({ kind: 'ok', ms: 182, health: body });
	});

	it('still reads a degraded answer (503)', async () => {
		const degraded = { ...body, status: 'degraded', database: 'unavailable' };
		const fetchImpl = (async () => new Response(JSON.stringify(degraded), { status: 503 })) as unknown as typeof fetch;
		const result = await fetchHealth('https://api.example.ts.net', { fetchImpl, now: clock(0, 50) });
		expect(result.kind === 'ok' && result.health.database).toBe('unavailable');
	});

	it('reports offline on network errors, other statuses and timeouts', async () => {
		const failing = (async () => {
			throw new TypeError('Failed to fetch');
		}) as unknown as typeof fetch;
		expect(await fetchHealth('https://x.ts.net', { fetchImpl: failing })).toEqual({ kind: 'offline' });
		const badGateway = (async () => new Response('nope', { status: 502 })) as unknown as typeof fetch;
		expect(await fetchHealth('https://x.ts.net', { fetchImpl: badGateway })).toEqual({ kind: 'offline' });
		const hanging = ((_: string, init: RequestInit) =>
			new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(new Error('aborted'))))) as unknown as typeof fetch;
		expect(await fetchHealth('https://x.ts.net', { fetchImpl: hanging, timeoutMs: 10 })).toEqual({ kind: 'offline' });
	});

	it('does nothing when the build has no API', async () => {
		expect(await fetchHealth('')).toEqual({ kind: 'none' });
	});
});

describe('formatDuration', () => {
	it('uses the largest unit, in both languages', () => {
		expect(formatDuration(450495, 'en')).toBe('5 days');
		expect(formatDuration(86400, 'es')).toBe('1 día');
		expect(formatDuration(7200, 'es')).toBe('2 horas');
		expect(formatDuration(59, 'en')).toBe('1 minute');
		expect(formatDuration(600, 'en')).toBe('10 minutes');
	});
});
