import localFont from 'next/font/local';

// The Fontsource files, loaded through next/font so they are preloaded and each one gets a
// fallback with matching metrics: text doesn't move when the real font arrives.
// Latin only: it covers English and Spanish (á, é, ñ, ¿, ¡).
// The display face keeps its width and optical-size axes; the headings use font-stretch.
export const display = localFont({
	src: '../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2',
	weight: '200 800',
	style: 'normal',
	display: 'swap',
	variable: '--font-bricolage',
	declarations: [{ prop: 'font-stretch', value: '75% 100%' }],
	fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
	adjustFontFallback: 'Arial',
});

export const sans = localFont({
	src: '../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
	weight: '400 700',
	style: 'normal',
	display: 'swap',
	variable: '--font-instrument',
	fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
	adjustFontFallback: 'Arial',
});
