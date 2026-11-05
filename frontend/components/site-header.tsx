import Link from 'next/link';
import { NavLinks } from '@/components/nav-links';
import { hasResume, resumePath } from '@/lib/site';

export function SiteHeader() {
	return (
		<header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 pt-6 sm:px-8">
			<Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink no-underline">
				Juan Duque
			</Link>
			<NavLinks resumePath={hasResume ? resumePath : undefined} />
		</header>
	);
}
