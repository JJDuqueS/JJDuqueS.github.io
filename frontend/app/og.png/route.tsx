import { ogImage } from '@/lib/og-image';

// /og.png: the English preview image. A route with a .png name, so GitHub Pages serves it as an image.
export const dynamic = 'force-static';

export function GET() {
	return ogImage('en');
}
