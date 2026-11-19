'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { basePath, dictionaries, type Lang, localePath, otherLang } from '@/lib/i18n';
import { browserLang, languageAction, saveLang, savedLang } from '@/lib/lang-preference';

// Runs once per page load. Sends visitors to the language they chose before, or offers
// the other language when their browser prefers it. Never redirects on a guess.
export function LanguagePreference({ lang }: { lang: Lang }) {
	const path = basePath(usePathname());
	const other = otherLang(lang);
	const [offer, setOffer] = useState(false);

	useEffect(() => {
		const action = languageAction(lang, savedLang(), browserLang(navigator.languages ?? [navigator.language]));
		if (action === 'redirect') {
			window.location.replace(localePath(other, path) + window.location.hash);
		} else if (action === 'offer') {
			// Reading the browser's language is only possible after hydration.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setOffer(true);
		}
	}, [lang, other, path]);

	if (!offer) return null;

	// Written in the language it offers.
	const t = dictionaries[other].langHint;
	return (
		<div lang={other} role="region" aria-label={t.text} className="mx-auto mt-4 max-w-6xl px-5 sm:px-8">
			<div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-segment bg-panel px-5 py-3 text-sm">
				<p className="text-ink">{t.text}</p>
				<div className="flex flex-wrap gap-3">
					<a
						href={localePath(other, path)}
						hrefLang={other}
						onClick={() => saveLang(other)}
						className="rounded-full bg-accent px-4 py-1.5 font-semibold text-accent-ink no-underline"
					>
						{t.go}
					</a>
					<button
						type="button"
						onClick={() => {
							saveLang(lang);
							setOffer(false);
						}}
						className="rounded-full border border-segment px-4 py-1.5 text-ink transition-colors hover:border-accent hover:text-accent"
					>
						{t.stay}
					</button>
				</div>
			</div>
		</div>
	);
}
