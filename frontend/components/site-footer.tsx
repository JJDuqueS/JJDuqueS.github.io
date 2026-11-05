import { buildInfo } from '@/lib/build-info';

export function SiteFooter() {
	return (
		<footer className="mx-auto mt-24 max-w-6xl border-t border-rule px-5 py-8 text-sm text-quiet sm:px-8">
			Built with Next.js by GitHub Actions
			{buildInfo.commit && <> from commit {buildInfo.commit}</>}, and served by GitHub Pages.
		</footer>
	);
}
