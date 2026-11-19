import Link from 'next/link';
import { FlowArt, SunPathArt } from '@/components/project-art';
import type { Project } from '@/lib/content';
import { dictionaries, type Lang, localePath } from '@/lib/i18n';

const art: Record<string, () => React.ReactElement> = {
	sunward: SunPathArt,
	'this-site': FlowArt,
};

export function ProjectCard({
	lang,
	project,
	headingLevel = 'h3',
}: {
	lang: Lang;
	project: Project;
	headingLevel?: 'h2' | 'h3';
}) {
	const Art = art[project.slug];
	const Heading = headingLevel;
	return (
		<Link
			href={localePath(lang, `/projects/${project.slug}/`)}
			className="group flex flex-col rounded-2xl border border-rule bg-panel/60 p-5 text-ink no-underline transition-colors duration-200 hover:border-segment md:p-6"
		>
			{Art && (
				<div className="-mx-1 mb-5 aspect-[16/7] overflow-hidden rounded-xl bg-paper/60">
					<Art />
				</div>
			)}
			<Heading className="text-2xl font-semibold group-hover:text-accent">{project.title}</Heading>
			<p className="mt-2 text-quiet">{project.summary}</p>
			<p className="mt-4 text-sm text-quiet">{project.stack.slice(0, 5).join(', ')}</p>
			<span className="mt-5 text-sm font-medium text-accent">{dictionaries[lang].projectCard.read}</span>
		</Link>
	);
}
