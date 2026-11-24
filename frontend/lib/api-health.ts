// Calls the API's /api/health from the visitor's browser and times the round trip.
// Pure apart from fetch and the clock, which tests pass in.

export type Health = {
	status: 'ok' | 'degraded';
	database: 'ok' | 'unavailable';
	database_ms?: number;
	uptime_seconds: number;
	host: {
		uptime_seconds: number | null;
		load: number[] | null;
		memory_mb: { total: number; available: number } | null;
	};
};

export type HealthResult =
	| { kind: 'ok'; ms: number; health: Health }
	| { kind: 'offline' }
	| { kind: 'none' };

export async function fetchHealth(
	apiUrl: string,
	{
		timeoutMs = 5000,
		fetchImpl = fetch,
		now = () => performance.now(),
	}: { timeoutMs?: number; fetchImpl?: typeof fetch; now?: () => number } = {},
): Promise<HealthResult> {
	if (!apiUrl) return { kind: 'none' };
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	const start = now();
	try {
		const response = await fetchImpl(`${apiUrl}/api/health`, { cache: 'no-store', signal: controller.signal });
		const ms = now() - start;
		// 503 still carries a body: the API is up but its database isn't.
		if (!response.ok && response.status !== 503) return { kind: 'offline' };
		const health = (await response.json()) as Health;
		if (typeof health?.status !== 'string') return { kind: 'offline' };
		return { kind: 'ok', ms, health };
	} catch {
		return { kind: 'offline' };
	} finally {
		clearTimeout(timer);
	}
}

const UNITS = {
	en: { day: ['day', 'days'], hour: ['hour', 'hours'], minute: ['minute', 'minutes'] },
	es: { day: ['día', 'días'], hour: ['hora', 'horas'], minute: ['minuto', 'minutos'] },
} as const;

// 450495 -> "5 days", 7200 -> "2 hours", 59 -> "1 minute". The largest unit only.
export function formatDuration(seconds: number, lang: 'en' | 'es'): string {
	const units = UNITS[lang];
	const [value, unit] =
		seconds >= 86400
			? [Math.floor(seconds / 86400), units.day]
			: seconds >= 3600
				? [Math.floor(seconds / 3600), units.hour]
				: [Math.max(1, Math.floor(seconds / 60)), units.minute];
	return `${value} ${value === 1 ? unit[0] : unit[1]}`;
}
