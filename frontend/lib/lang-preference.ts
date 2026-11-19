import { LANG_STORAGE_KEY, type Lang } from '@/lib/i18n';

// The visitor's explicit choice, remembered in this browser. Storage can be blocked
// (private mode, settings), so every access is guarded and the site works without it.
export function savedLang(): Lang | null {
	try {
		const value = window.localStorage.getItem(LANG_STORAGE_KEY);
		return value === 'en' || value === 'es' ? value : null;
	} catch {
		return null;
	}
}

export function saveLang(lang: Lang): void {
	try {
		window.localStorage.setItem(LANG_STORAGE_KEY, lang);
	} catch {
		// Not remembered; the choice still applies to this visit.
	}
}

// The browser's first preferred language, e.g. 'es-CO' -> 'es'.
export function browserLang(languages: readonly string[]): Lang | null {
	const first = languages[0]?.toLowerCase() ?? '';
	if (first.startsWith('es')) return 'es';
	if (first.startsWith('en')) return 'en';
	return null;
}

// What to do when a page loads in `pageLang`:
// - the visitor chose the other language before: go there;
// - they never chose and their browser prefers the other language: offer it;
// - otherwise: nothing.
export function languageAction(
	pageLang: Lang,
	saved: Lang | null,
	preferred: Lang | null,
): 'redirect' | 'offer' | 'none' {
	if (saved) return saved === pageLang ? 'none' : 'redirect';
	if (preferred && preferred !== pageLang) return 'offer';
	return 'none';
}
