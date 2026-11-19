import Link from 'next/link';
import { LanguageSwitch } from '@/components/language-switch';
import { NavLinks } from '@/components/nav-links';
import { type Lang, localePath } from '@/lib/i18n';
import { hasResume, resumePath } from '@/lib/site';

// Phones: the name and the language switch share the first row, the links take the second.
// Wider screens: name, links and switch in one row.
export function SiteHeader({ lang }: { lang: Lang }) {
	return (
		<header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 pt-6 sm:px-8">
			<Link href={localePath(lang, '/')} className="font-display text-lg font-semibold tracking-tight text-ink no-underline">
				Juan Duque
			</Link>
			<div className="order-3 w-full sm:order-2 sm:ml-auto sm:w-auto">
				<NavLinks lang={lang} resumePath={hasResume ? resumePath : undefined} />
			</div>
			<div className="order-2 sm:order-3">
				<LanguageSwitch lang={lang} />
			</div>
		</header>
	);
}
