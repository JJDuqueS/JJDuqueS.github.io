import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/content';
import { LANGS, localePath } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';

// Written to out/sitemap.xml at build time. Lists every page in both languages, each
// pointing to its counterpart, so search engines find the case studies and the Spanish
// version without having to crawl to them.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
	const pages = ['/', '/projects/', '/about/', ...getProjects().map(({ slug }) => `/projects/${slug}/`)];
	const languages = (path: string) =>
		Object.fromEntries(LANGS.map((lang) => [lang, `${SITE_URL}${localePath(lang, path)}`]));
	return LANGS.flatMap((lang) =>
		pages.map((path) => ({
			url: `${SITE_URL}${localePath(lang, path)}`,
			changeFrequency: 'monthly' as const,
			priority: path === '/' ? 1 : 0.7,
			alternates: { languages: languages(path) },
		})),
	);
}
