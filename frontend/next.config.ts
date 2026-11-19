import type { NextConfig } from 'next';
import { checkApiUrl } from './lib/api-url';

// Static export for GitHub Pages (ADR 0002, ADR 0003). Anything that needs a
// Next.js server (route handlers with requests, middleware, image optimization)
// is off the table until the site moves to Vercel.
const nextConfig: NextConfig = {
	output: 'export',
	// /about -> about/index.html, which GitHub Pages serves without extra config.
	trailingSlash: true,
	images: { unoptimized: true },
	experimental: {
		// Each language has its own root layout (ADR 0005), so the 404 for unknown
		// addresses can't come from a layout: app/global-not-found.tsx is a page of its own.
		globalNotFound: true,
	},
	env: {
		// Shown in the hero and the footer: which commit this build came from.
		NEXT_PUBLIC_COMMIT_SHA: process.env.PUBLIC_COMMIT_SHA ?? '',
		// The build stops here if API_URL is an address visitors can't reach.
		NEXT_PUBLIC_API_URL: checkApiUrl(process.env.NEXT_PUBLIC_API_URL, {
			allowLocal: process.env.NODE_ENV === 'development',
		}),
	},
};

export default nextConfig;
