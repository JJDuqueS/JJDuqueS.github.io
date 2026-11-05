import type { Metadata } from 'next';

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
		openGraph: {
			type: 'website',
			siteName: 'Juan Duque',
			url: path,
			...(title ? { title: `${title} · Juan Duque` } : { title: 'Juan Duque · Software Engineer' }),
			description,
		},
	};
}
