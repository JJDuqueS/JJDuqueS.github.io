import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Written to out/robots.txt. Everything is public; it only points crawlers to the sitemap.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: '*', allow: '/' },
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
