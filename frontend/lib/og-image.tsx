import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { dictionaries, type Lang, localePath } from '@/lib/i18n';
import { OG_SIZE } from '@/lib/metadata';
import { hasPortrait, portraitPath } from '@/lib/site';

// The preview LinkedIn, Slack and others show for every page (lib/metadata.ts), drawn at
// build time from the site's own palette, fonts and portrait, so it never drifts from
// the site. Served by app/og.png/route.tsx (English) and app/og-es.png/route.tsx.

const paper = '#030b0a';
const panel = '#07130f';
const ink = '#e6eeeb';
const quiet = '#9aaba5';
const segment = '#2a3d37';
const accent = '#00e68c';

// The image renderer reads WOFF, not WOFF2, so it uses the static Fontsource files.
const font = (pkg: string, file: string) =>
	readFile(join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));

export async function ogImage(lang: Lang) {
	const t = dictionaries[lang].og;
	const [display, text, portrait] = await Promise.all([
		font('bricolage-grotesque', 'bricolage-grotesque-latin-800-normal.woff'),
		font('instrument-sans', 'instrument-sans-latin-500-normal.woff'),
		hasPortrait ? readFile(join(process.cwd(), 'public', portraitPath)) : null,
	]);

	const steps = t.steps;

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '72px 80px',
					background: paper,
					color: ink,
					fontFamily: 'Instrument Sans',
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column', maxWidth: portrait ? 700 : 1040 }}>
					<div style={{ fontFamily: 'Bricolage Grotesque', fontSize: 104, lineHeight: 0.92, letterSpacing: -3 }}>
						Juan Duque
					</div>
					<div style={{ marginTop: 28, fontSize: 38, lineHeight: 1.25 }}>
						{t.subtitle}
					</div>

					<div style={{ display: 'flex', alignItems: 'center', marginTop: 56 }}>
						{steps.map((step, index) => (
							<div key={step} style={{ display: 'flex', alignItems: 'center' }}>
								<div
									style={{
										display: 'flex',
										padding: '10px 18px',
										borderRadius: 12,
										border: `2px ${index < 2 ? 'solid' : 'dashed'} ${index === 0 ? accent : segment}`,
										background: panel,
										fontSize: 24,
										color: index < 2 ? ink : quiet,
									}}
								>
									{step}
								</div>
								{index < steps.length - 1 && (
									<div
										style={{
											width: 44,
											height: 0,
											borderTop: `3px ${index === 0 ? 'solid' : 'dashed'} ${index === 0 ? accent : segment}`,
										}}
									/>
								)}
							</div>
						))}
					</div>

					<div style={{ marginTop: 40, fontSize: 26, color: quiet }}>{`jjduques.github.io${localePath(lang, '/').replace(/\/$/, '')}`}</div>
				</div>

				{portrait && (
					// Not a page: the image renderer only understands a plain <img>.
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={`data:image/jpeg;base64,${portrait.toString('base64')}`}
						width={300}
						height={300}
						alt=""
						style={{ borderRadius: 40, border: `4px solid ${accent}`, objectFit: 'cover' }}
					/>
				)}
			</div>
		),
		{
			...OG_SIZE,
			fonts: [
				{ name: 'Bricolage Grotesque', data: display, weight: 800, style: 'normal' },
				{ name: 'Instrument Sans', data: text, weight: 500, style: 'normal' },
			],
		},
	);
}
