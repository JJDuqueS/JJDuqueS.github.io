'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
	{ href: '/projects/', label: 'Projects' },
	{ href: '/about/', label: 'About' },
	{ href: '/#contact', label: 'Contact' },
];

export function NavLinks({ resumePath }: { resumePath?: string }) {
	const pathname = usePathname();
	const isCurrent = (href: string) => href !== '/#contact' && pathname.startsWith(href);

	return (
		<nav aria-label="Main">
			<ul className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.95rem]">
				{links.map(({ href, label }) => (
					<li key={href}>
						<Link
							href={href}
							aria-current={isCurrent(href) ? 'page' : undefined}
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
							Résumé
						</a>
					</li>
				)}
			</ul>
		</nav>
	);
}
