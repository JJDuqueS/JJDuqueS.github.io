import { ProjectCard } from '@/components/project-card';
import { getProjects } from '@/lib/content';
import { dictionaries, type Lang } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';

export const projectsMetadata = (lang: Lang) =>
	pageMetadata({
		lang,
		title: dictionaries[lang].projects.title,
		description: dictionaries[lang].projects.description,
		path: '/projects/',
	});

export function ProjectsPage({ lang }: { lang: Lang }) {
	const t = dictionaries[lang].projects;
	const projects = getProjects(lang);
	return (
		<div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-24">
			<h1 className="font-display text-6xl leading-[0.95] font-bold tracking-[-0.03em] [font-stretch:80%] md:text-8xl">
				{t.title}
			</h1>
			<p className="mt-5 max-w-2xl text-xl text-quiet">{t.lead}</p>
			<div className="mt-14 grid gap-5 lg:grid-cols-2">
				{projects.map((project) => (
					<ProjectCard key={project.slug} lang={lang} project={project} headingLevel="h2" />
				))}
			</div>
		</div>
	);
}
