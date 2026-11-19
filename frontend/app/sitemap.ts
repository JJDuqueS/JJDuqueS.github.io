import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

// Written to out/sitemap.xml at build time. Lists every public page so search
// engines find the case studies without having to crawl to them.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
	const pages = ['/', '/projects/', '/about/', ...getProjects().map(({ slug }) => `/projects/${slug}/`)];
	return pages.map((path) => ({
		url: `${SITE_URL}${path}`,
		changeFrequency: 'monthly',
		priority: path === '/' ? 1 : 0.7,
	}));
}
