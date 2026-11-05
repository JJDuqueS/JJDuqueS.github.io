import { ProjectCard } from '@/components/project-card';
import { getProjects } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
	title: 'Projects',
	description: 'Case studies by Juan Duque: the problem, the solution, the stack, his role and the result.',
	path: '/projects/',
});

export default function ProjectsPage() {
	const projects = getProjects();
	return (
		<div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-24">
			<h1 className="font-display text-6xl leading-[0.95] font-bold tracking-[-0.03em] [font-stretch:80%] md:text-8xl">
				Projects
			</h1>
			<p className="mt-5 max-w-2xl text-xl text-quiet">What the problem was, what I built and how it turned out.</p>
			<div className="mt-14 grid gap-5 lg:grid-cols-2">
				{projects.map((project) => (
					<ProjectCard key={project.slug} project={project} headingLevel="h2" />
				))}
			</div>
		</div>
	);
}
