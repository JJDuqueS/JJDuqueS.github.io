import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource-variable/instrument-sans';
import './globals.css';
import type { Metadata } from 'next';

/* eslint-disable @next/next/no-html-link-for-pages -- each home page has its own root layout, so a full page load is what happens anyway */

// The 404 for any unknown address (GitHub Pages serves it as out/404.html). Each language
// has its own root layout, so this page stands alone and speaks both.
export const metadata: Metadata = {
	title: 'Not found · Juan Duque',
	robots: { index: false },
};

export default function GlobalNotFound() {
	return (
		<html lang="en">
			<body>
				<main className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
					<h1 className="font-display text-6xl font-bold tracking-[-0.03em] [font-stretch:80%] md:text-8xl">
						Not found
					</h1>
					<p className="mt-5 max-w-xl text-xl text-quiet">
						There&apos;s no page at this address.{' '}
						<a href="/" className="text-accent underline">
							Go to the home page
						</a>
						.
					</p>
					<p lang="es" className="mt-3 max-w-xl text-xl text-quiet">
						No hay ninguna página en esta dirección.{' '}
						<a href="/es/" className="text-accent underline">
							Ir al inicio
						</a>
						.
					</p>
				</main>
			</body>
		</html>
	);
}
