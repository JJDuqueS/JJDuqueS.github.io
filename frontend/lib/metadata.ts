import type { Metadata } from 'next';
import { dictionaries, LANGS, type Lang, localePath, OG_LOCALE, otherLang } from '@/lib/i18n';

// Drawn by app/og.png/route.tsx and app/og-es.png/route.tsx at build time.
export const OG_SIZE = { width: 1200, height: 630 };
export const ogImagePath = (lang: Lang) => (lang === 'en' ? '/og.png' : '/og-es.png');

// Every page gets its own title, description, Open Graph URL and preview image, in its
// language, plus links to the same page in the other language (hreflang).
// `path` is the page's English path, such as '/about/'.
export function pageMetadata({
	lang,
	title,
	description,
	path,
}: {
	lang: Lang;
	title?: string;
	description: string;
	path: string;
}): Metadata {
	const image = { url: ogImagePath(lang), ...OG_SIZE, alt: dictionaries[lang].og.alt };
	return {
		...(title ? { title } : {}),
		description,
		alternates: {
			canonical: localePath(lang, path),
			languages: {
				...Object.fromEntries(LANGS.map((code) => [code, localePath(code, path)])),
				'x-default': localePath('en', path),
			},
		},
		twitter: { card: 'summary_large_image', images: [image.url] },
		openGraph: {
			type: 'website',
			siteName: 'Juan Duque',
			locale: OG_LOCALE[lang],
			alternateLocale: OG_LOCALE[otherLang(lang)],
			url: localePath(lang, path),
			title: title ? `${title} · Juan Duque` : 'Juan Duque · Software Engineer',
			description,
			images: [image],
		},
	};
}
