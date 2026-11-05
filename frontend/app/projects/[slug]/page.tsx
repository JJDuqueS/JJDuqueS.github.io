import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FlowArt, SunPathArt } from '@/components/project-art';
import { getProject, getProjects } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';

// Only the case studies in content/projects exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
	return getProjects().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/projects/[slug]'>) {
	const { slug } = await params;
	const project = getProject(slug);
	if (!project) return {};
	return pageMetadata({ title: project.title, description: project.summary, path: `/projects/${slug}/` });
}

const art: Record<string, () => React.ReactElement> = { sunward: SunPathArt, 'this-site': FlowArt };

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
	const { slug } = await params;
	const project = getProject(slug);
	if (!project) notFound();
	const Art = art[slug];

	return (
		<article className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-24">
			<Link href="/projects/" className="text-sm text-quiet no-underline hover:text-accent">
				All projects
			</Link>
			<h1 className="mt-4 font-display text-6xl leading-[0.95] font-bold tracking-[-0.03em] [font-stretch:80%] md:text-8xl">
				{project.title}
			</h1>
			<p className="mt-5 max-w-2xl text-xl text-quiet">{project.summary}</p>

			{Art && (
				<div className="group mt-12 aspect-[16/6] max-w-4xl overflow-hidden rounded-2xl border border-rule bg-panel/60">
					<Art />
				</div>
			)}

			<div className="mt-14 grid gap-12 md:grid-cols-[minmax(0,1fr)_16rem]">
				<div className="prose-case" dangerouslySetInnerHTML={{ __html: project.html }} />
				<dl className="grid content-start gap-6 border-t border-rule pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8">
					<div>
						<dt className="font-display font-semibold">My role</dt>
						<dd className="mt-1 text-quiet">{project.role}</dd>
					</div>
					<div>
						<dt className="font-display font-semibold">Result</dt>
						<dd className="mt-1 text-quiet">{project.result}</dd>
					</div>
					<div>
						<dt className="font-display font-semibold">Stack</dt>
						<dd className="mt-1 text-quiet">{project.stack.join(', ')}</dd>
					</div>
				</dl>
			</div>
		</article>
	);
}
