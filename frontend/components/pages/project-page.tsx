import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FlowArt, SunPathArt } from '@/components/project-art';
import { getProject, getProjects } from '@/lib/content';
import { dictionaries, type Lang, localePath } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';

// Only the case studies in content/projects exist; anything else is a 404.
export const projectParams = (lang: Lang) => getProjects(lang).map(({ slug }) => ({ slug }));

export function projectMetadata(lang: Lang, slug: string) {
	const project = getProject(slug, lang);
	if (!project) return {};
	return pageMetadata({ lang, title: project.title, description: project.summary, path: `/projects/${slug}/` });
}


const art: Record<string, () => React.ReactElement> = { sunward: SunPathArt, 'this-site': FlowArt };

export function ProjectPage({ lang, slug }: { lang: Lang; slug: string }) {
	const t = dictionaries[lang].projects;
	const project = getProject(slug, lang);
	if (!project) notFound();
	const Art = art[slug];

	return (
		<article className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-24">
			<Link href={localePath(lang, '/projects/')} className="text-sm text-quiet no-underline hover:text-accent">
				{t.all}
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
						<dt className="font-display font-semibold">{t.role}</dt>
						<dd className="mt-1 text-quiet">{project.role}</dd>
					</div>
					<div>
						<dt className="font-display font-semibold">{t.result}</dt>
						<dd className="mt-1 text-quiet">{project.result}</dd>
					</div>
					<div>
						<dt className="font-display font-semibold">{t.stack}</dt>
						<dd className="mt-1 text-quiet">{project.stack.join(', ')}</dd>
					</div>
				</dl>
			</div>
		</article>
	);
}
