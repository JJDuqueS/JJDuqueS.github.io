// Turns the browser's Navigation Timing entry into the phases the hero draws.
// Pure, so it runs in tests without a browser.

export type NavTiming = Pick<
	PerformanceNavigationTiming,
	| 'startTime'
	| 'domainLookupStart'
	| 'domainLookupEnd'
	| 'connectStart'
	| 'secureConnectionStart'
	| 'connectEnd'
	| 'requestStart'
	| 'responseStart'
	| 'responseEnd'
	| 'transferSize'
	| 'encodedBodySize'
>;

export type PhaseId = 'browser' | 'dns' | 'connect' | 'tls' | 'server' | 'download';

export type Phase = { id: PhaseId; label: string; ms: number };

export type Trace = {
	totalMs: number;
	// Phases on the way to the server, the time spent there, and the way back.
	outbound: Phase[];
	server: Phase;
	inbound: Phase;
	htmlKb: number | null;
	fromCache: boolean;
};

const clamp = (ms: number) => (Number.isFinite(ms) && ms > 0 ? ms : 0);

export function traceFromTiming(nav: NavTiming): Trace | null {
	if (!(nav.responseEnd > 0)) return null;

	const tls = nav.secureConnectionStart > 0;
	const dns = clamp(nav.domainLookupEnd - nav.domainLookupStart);
	const connect = clamp((tls ? nav.secureConnectionStart : nav.connectEnd) - nav.connectStart);
	const tlsMs = tls ? clamp(nav.connectEnd - nav.secureConnectionStart) : 0;
	const server = clamp(nav.responseStart - nav.requestStart);
	const download = clamp(nav.responseEnd - nav.responseStart);
	const totalMs = clamp(nav.responseEnd - nav.startTime);

	// Whatever the phases don't cover (redirects, cache checks, gaps between phases)
	// is the browser getting ready, so the parts always add up to the total.
	const browser = clamp(totalMs - (dns + connect + tlsMs + server + download));

	const outbound: Phase[] = [
		{ id: 'browser' as const, label: 'Your browser getting ready', ms: browser },
		{ id: 'dns' as const, label: 'Looking up the address', ms: dns },
		{ id: 'connect' as const, label: 'Opening a connection', ms: connect },
		{ id: 'tls' as const, label: 'Setting up encryption', ms: tlsMs },
	].filter((phase) => phase.ms >= 0.5);

	return {
		totalMs,
		outbound,
		server: { id: 'server', label: 'Waiting for the server', ms: server },
		inbound: { id: 'download', label: 'Downloading the page', ms: download },
		htmlKb: nav.encodedBodySize > 0 ? nav.encodedBodySize / 1024 : null,
		fromCache: nav.transferSize === 0 && nav.encodedBodySize > 0,
	};
}

export const formatMs = (ms: number) => `${Math.max(1, Math.round(ms))} ms`;
