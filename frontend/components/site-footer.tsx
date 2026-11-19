import { buildInfo } from '@/lib/build-info';
import { dictionaries, type Lang } from '@/lib/i18n';

export function SiteFooter({ lang }: { lang: Lang }) {
	const t = dictionaries[lang].footer;
	return (
		<footer className="mx-auto mt-24 max-w-6xl border-t border-rule px-5 py-8 text-sm text-quiet sm:px-8">
			{t.built}
			{buildInfo.commit && (
				<>
					{' '}
					{t.fromCommit} {buildInfo.commit}
				</>
			)}
			, {t.served}
		</footer>
	);
}
