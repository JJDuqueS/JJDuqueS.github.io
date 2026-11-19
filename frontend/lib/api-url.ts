// Checks the API_URL repository variable before it is baked into the site.
// Visitors' browsers call this URL directly, so it has to be the API's public HTTPS
// origin (the Tailscale Funnel URL), not an address that only exists on the laptop.

const INTERNAL = /(^|\.)(localhost|host\.docker\.internal|internal|local|lan)$|^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

// allowLocal: `next dev` may point at the API running on this machine over plain HTTP.
export function checkApiUrl(value: string | undefined, { allowLocal = false } = {}): string {
	const raw = (value ?? '').trim();
	if (raw === '') return '';
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		throw new Error(`API_URL "${raw}" is not a URL. Use the Funnel URL, e.g. https://jjd-api.tail1234.ts.net`);
	}
	const devApi = allowLocal && /^(localhost|127\.0\.0\.1)$/.test(url.hostname);
	const problems: string[] = [];
	if (!devApi && url.protocol !== 'https:') {
		problems.push('it must start with https://, or browsers block it on an HTTPS page');
	}
	if (!devApi && INTERNAL.test(url.hostname)) {
		problems.push(`${url.hostname} only exists inside your network, not for visitors`);
	}
	if (url.pathname !== '/' || url.search || url.hash) {
		problems.push('it must be only the origin, with no path: the site adds /api/contact itself');
	}
	if (problems.length > 0) {
		throw new Error(
			`API_URL "${raw}" can't be used: ${problems.join('; ')}. ` +
				'Set it to the Funnel URL (run `tailscale funnel status` on the laptop), e.g. https://jjd-api.tail1234.ts.net',
		);
	}
	return url.origin;
}
