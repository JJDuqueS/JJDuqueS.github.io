# 0005. A Spanish version under /es/, written rather than machine-translated

Date: 2026-11-18
Status: Accepted

Moves "Spanish version" out of the MVP's out-of-scope list.

## Context
I'm Colombian and apply to remote roles in English, but recruiters and teams in Latin America also read the site. Google retired its website translator widget in 2019; the script that remains is unsupported, breaks React pages and adds Google's banner and cookies. Chrome's own translation only starts when the visitor asks for it, and search engines never see a translated page. The site is a static export, so there is no server to negotiate the language.

## Decision
- Every page exists in both languages: English at the root (`/about/`) and Spanish under `/es/` (`/es/about/`), with the same slugs.
- The interface strings live in `frontend/lib/i18n.ts`; the Spanish content lives next to the English one as `*.es.md` and `*.es.json`. The Spanish was written for the site and reviewed by me, not produced by a translation service.
- Each language has its own root layout (`app/(en)` and `app/(es)`), so every page is served with the right `<html lang>`. The 404 for unknown addresses is `app/global-not-found.tsx`, in both languages.
- Every page links to its counterpart with `hreflang` and has its own Open Graph locale and preview image.
- An EN/ES switch in the header remembers the visitor's choice in their browser. Later visits go to the chosen language. Without a choice, a visitor whose browser prefers the other language is offered it, never redirected.

## Trade-offs
- Pro: natural Spanish, in every browser, with no third-party script, and indexed by search engines.
- Pro: the choice is respected, and nobody is sent to a language they didn't ask for.
- Con: every change to the content is written twice; a test fails if an interface string has no Spanish version.
- Con: switching language is a full page load, because each language has its own root layout.
- Con: `global-not-found` is still marked experimental in Next.js.

## Alternatives considered
- Google's website translator: retired, breaks React, adds tracking, and isn't indexed.
- Chrome's built-in Translator API: no third-party script, but only in recent desktop Chrome and Edge, machine-translated, and not indexed.
- Machine translation at build time (DeepL): less work, but the text still needs a human review, which is most of the effort.
- A `[lang]` root segment (`/en/` and `/es/`): one layout, but it moves the English pages away from the URLs already shared.
