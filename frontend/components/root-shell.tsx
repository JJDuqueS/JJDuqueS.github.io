import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import { LanguagePreference } from '@/components/language-preference';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { display, sans } from '@/lib/fonts';
import { dictionaries, type Lang } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';

// Each language has its own root layout (app/(en) and app/(es)), so every page is served
// with the right <html lang>. Both render this shell.

export const rootMetadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: { default: 'Juan Duque · Software Engineer', template: '%s · Juan Duque' },
};

export const rootViewport: Viewport = {
	themeColor: '#030b0a',
	colorScheme: 'dark',
};

export function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
	return (
		<html lang={lang} className={`${display.variable} ${sans.variable}`}>
			<body>
				<a
					href="#main"
					className="absolute -left-[100vw] z-50 rounded bg-accent px-3 py-2 font-semibold text-accent-ink focus:left-4 focus:top-3"
				>
					{dictionaries[lang].skip}
				</a>
				<SiteHeader lang={lang} />
				<LanguagePreference lang={lang} />
				<main id="main">{children}</main>
				<SiteFooter lang={lang} />
			</body>
		</html>
	);
}
