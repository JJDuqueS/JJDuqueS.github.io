import type { NextConfig } from 'next';

// Static export for GitHub Pages (ADR 0002, ADR 0003). Anything that needs a
// Next.js server (route handlers with requests, middleware, image optimization)
// is off the table until the site moves to Vercel.
const nextConfig: NextConfig = {
	output: 'export',
	// /about -> about/index.html, which GitHub Pages serves without extra config.
	trailingSlash: true,
	images: { unoptimized: true },
	env: {
		// Shown in the hero and the footer: which commit this build came from.
		NEXT_PUBLIC_COMMIT_SHA: process.env.PUBLIC_COMMIT_SHA ?? '',
	},
};

export default nextConfig;
