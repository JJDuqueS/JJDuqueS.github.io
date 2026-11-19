'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { basePath, dictionaries, type Lang, localePath } from '@/lib/i18n';

export function NavLinks({ lang, resumePath }: { lang: Lang; resumePath?: string }) {
	const t = dictionaries[lang].nav;
	const current = basePath(usePathname());
	const links = [
		{ path: '/projects/', label: t.projects },
		{ path: '/about/', label: t.about },
		{ path: '/#contact', label: t.contact },
	];

	return (
		<nav aria-label={t.label}>
			<ul className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.95rem]">
				{links.map(({ path, label }) => (
					<li key={path}>
						<Link
							href={path === '/#contact' ? `${localePath(lang, '/')}#contact` : localePath(lang, path)}
							aria-current={path !== '/#contact' && current.startsWith(path) ? 'page' : undefined}
							className="text-quiet no-underline transition-colors hover:text-ink aria-[current=page]:text-accent"
						>
							{label}
						</Link>
					</li>
				))}
				{resumePath && (
					<li>
						<a
							href={resumePath}
							download
							className="rounded-full border border-segment px-3.5 py-1.5 text-ink no-underline transition-colors hover:border-accent hover:text-accent"
						>
							{t.resume}
						</a>
					</li>
				)}
			</ul>
		</nav>
	);
}
