import { describe, expect, it } from 'vitest';
import { traceFromTiming, type NavTiming } from '@/lib/timing';

const base: NavTiming = {
	startTime: 0,
	domainLookupStart: 5,
	domainLookupEnd: 15,
	connectStart: 15,
	secureConnectionStart: 25,
	connectEnd: 40,
	requestStart: 41,
	responseStart: 61,
	responseEnd: 70,
	transferSize: 9000,
	encodedBodySize: 8704,
};

describe('traceFromTiming', () => {
	it('splits a request into its phases', () => {
		const trace = traceFromTiming(base)!;
		expect(trace.outbound.map((phase) => [phase.id, phase.ms])).toEqual([
			['browser', 6],
			['dns', 10],
			['connect', 10],
			['tls', 15],
		]);
		expect(trace.server.ms).toBe(20);
		expect(trace.inbound.ms).toBe(9);
		expect(trace.htmlKb).toBe(8.5);
	});

	it('always adds up to the total', () => {
		const trace = traceFromTiming(base)!;
		const sum = [...trace.outbound, trace.server, trace.inbound].reduce((total, phase) => total + phase.ms, 0);
		expect(sum).toBeCloseTo(trace.totalMs);
	});

	it('leaves out encryption on plain HTTP', () => {
		const trace = traceFromTiming({ ...base, secureConnectionStart: 0 })!;
		expect(trace.outbound.map((phase) => phase.id)).not.toContain('tls');
		expect(trace.outbound.find((phase) => phase.id === 'connect')?.ms).toBe(25);
	});

	it('recognizes a page served from the browser cache', () => {
		expect(traceFromTiming({ ...base, transferSize: 0 })!.fromCache).toBe(true);
	});

	it('returns nothing before the page has finished arriving', () => {
		expect(traceFromTiming({ ...base, responseEnd: 0 })).toBeNull();
	});
});
