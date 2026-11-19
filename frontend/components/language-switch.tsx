'use client';

import { usePathname } from 'next/navigation';
import { basePath, dictionaries, LANG_NAMES, LANGS, type Lang, localePath } from '@/lib/i18n';
import { saveLang } from '@/lib/lang-preference';

// EN / ES in the header. Each language has its own root layout, so switching is a
// plain link (a full page load); the click also remembers the choice.
export function LanguageSwitch({ lang }: { lang: Lang }) {
	const path = basePath(usePathname());
	return (
		<ul aria-label={dictionaries[lang].nav.language} className="flex items-center rounded-full border border-segment p-0.5 text-sm">
			{LANGS.map((code) => (
				<li key={code}>
					{code === lang ? (
						<span
							aria-current="true"
							title={LANG_NAMES[code]}
							className="block rounded-full bg-segment px-2.5 py-1 font-semibold text-ink"
						>
							{code.toUpperCase()}
						</span>
					) : (
						<a
							href={localePath(code, path)}
							hrefLang={code}
							lang={code}
							title={LANG_NAMES[code]}
							onClick={() => saveLang(code)}
							className="block rounded-full px-2.5 py-1 text-quiet no-underline transition-colors hover:text-accent"
						>
							{code.toUpperCase()}
							<span className="sr-only"> ({LANG_NAMES[code]})</span>
						</a>
					)}
				</li>
			))}
		</ul>
	);
}
