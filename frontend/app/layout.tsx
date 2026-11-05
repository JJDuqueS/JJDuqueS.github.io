import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource-variable/instrument-sans';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: { default: 'Juan Duque · Software Engineer', template: '%s · Juan Duque' },
};

export const viewport: Viewport = {
	themeColor: '#030b0a',
	colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<a
					href="#main"
					className="absolute -left-[100vw] z-50 rounded bg-accent px-3 py-2 font-semibold text-accent-ink focus:left-4 focus:top-3"
				>
					Skip to content
				</a>
				<SiteHeader />
				<main id="main">{children}</main>
				<SiteFooter />
			</body>
		</html>
	);
}
