import type { Metadata } from 'next';

// Drawn by app/og.png/route.tsx at build time.
export const OG_IMAGE = {
	url: '/og.png',
	width: 1200,
	height: 630,
	alt: 'Juan Duque, Software Engineer building real-time backends in Python and Node.js',
};

// Every page gets its own title, description and Open Graph URL, so links
// shared on LinkedIn show the right preview.
export function pageMetadata({
	title,
	description,
	path,
}: {
	title?: string;
	description: string;
	path: string;
}): Metadata {
	return {
		...(title ? { title } : {}),
		description,
		alternates: { canonical: path },
		twitter: { card: 'summary_large_image', images: [OG_IMAGE.url] },
		openGraph: {
			type: 'website',
			siteName: 'Juan Duque',
			url: path,
			...(title ? { title: `${title} · Juan Duque` } : { title: 'Juan Duque · Software Engineer' }),
			description,
			images: [OG_IMAGE],
		},
	};
}
