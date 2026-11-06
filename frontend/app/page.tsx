import { ContactDialogButton } from '@/components/contact-dialog';
import { ContactForm } from '@/components/contact-form';
import { LiveFlow } from '@/components/live-flow';
import { ProjectCard } from '@/components/project-card';
import { Section } from '@/components/section';
import { buildInfo } from '@/lib/build-info';
import { getExperience, getProjects, getStack } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { hasPortrait, hasResume, person, portraitPath, resumePath } from '@/lib/site';
import { stackIcon } from '@/lib/stack-icons';

export const metadata = pageMetadata({
	description:
		'Juan Duque is a backend-focused Software Engineer in Colombia, building real-time systems in Python and Node.js. Open to remote roles.',
	path: '/',
});

export default function Home() {
	const projects = getProjects();
	const experience = getExperience();
	const stack = getStack();

	return (
		<>
			<div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-24">
				<header className="grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
					<div>
						<h1 className="font-display text-[clamp(3.5rem,13vw,9rem)] leading-[0.88] font-bold tracking-[-0.035em] [font-stretch:78%]">
							Juan José Duque S.
						</h1>
						<p className="mt-6 max-w-2xl text-xl leading-snug md:text-2xl">
							Software Engineer building real-time backends in Python and Node.js.
						</p>
						<p className="mt-3 max-w-2xl text-quiet">
							More than four years on production systems: microservices, REST APIs and asynchronous pipelines.
							Based in {person.location}, working in English at a C1 level, open to remote roles.
						</p>
					</div>
					{hasPortrait && (
						// A plain img: the static export serves the file as it is.
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={portraitPath}
							alt="Juan Duque"
							width={400}
							height={400}
							className="order-first size-36 rounded-3xl object-cover md:order-none md:size-60 lg:size-84"
						/>
					)}
				</header>

				<ul className="mt-9 flex flex-wrap gap-3">
					{hasResume && (
						<li>
							<a
								href={resumePath}
								download
								className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink no-underline transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
							>
								Download résumé (PDF)
							</a>
						</li>
					)}
					<li>
						<ContactDialogButton className="inline-flex cursor-pointer items-center rounded-full border border-segment px-5 py-2.5 font-semibold text-ink transition-colors hover:border-accent hover:text-accent">
							Email me
						</ContactDialogButton>
					</li>
					<li>
						<a
							href={person.linkedin}
							target="_blank"
							rel="me noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-full border border-segment px-5 py-2.5 font-semibold text-ink no-underline transition-colors hover:border-accent hover:text-accent"
						>
							LinkedIn
							<NewTabIcon />
							<span className="sr-only">(opens in a new tab)</span>
						</a>
					</li>
				</ul>

				<LiveFlow commit={buildInfo.commit} builtAt={buildInfo.builtAt} builtAtLabel={buildInfo.builtAtLabel} />
			</div>

			<Section id="experience" title="Experience">
				<ul className="grid gap-12">
					{experience.map((job) => (
						<li key={job.id}>
							<h3 className="text-2xl font-semibold">
								{job.role}, <span className="text-accent">{job.company}</span>
							</h3>
							<p className="mt-1 text-quiet">
								{job.start} to {job.end}, {job.location.toLowerCase()}
							</p>
							<ul className="mt-5 grid max-w-3xl gap-3">
								{job.highlights.map((highlight) => (
									<li key={highlight} className="relative pl-6">
										<span aria-hidden="true" className="absolute left-0 top-[0.7em] h-px w-3 bg-accent" />
										{highlight}
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</Section>

			<Section id="work" title="Selected work">
				<div className="grid gap-5 lg:grid-cols-2">
					{projects.map((project) => (
						<ProjectCard key={project.slug} project={project} />
					))}
				</div>
			</Section>

			<Section id="stack" title="Stack">
				<dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
					{stack.map(({ group, items }) => (
						<div key={group} className="border-t border-rule pt-4">
							<dt className="font-display text-lg font-semibold">{group}</dt>
							<dd className="mt-3">
								<ul className="flex flex-wrap gap-x-4 gap-y-2.5">
									{items.map((item) => {
										const icon = stackIcon(item);
										return (
											<li key={item} className="flex items-center gap-2 text-quiet">
												{icon && (
													// eslint-disable-next-line @next/next/no-img-element
													<img src={icon} alt="" width={16} height={16} loading="lazy" className="size-4 shrink-0" />
												)}
												{item}
											</li>
										);
									})}
								</ul>
							</dd>
						</div>
					))}
				</dl>
			</Section>

			<Section id="contact" title="Contact">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
					<div>
						<p className="text-xl leading-snug md:text-2xl">
							I&apos;m open to remote roles, wherever the team is. Send me a message, or write to{' '}
							<a href={`mailto:${person.email}`} className="text-accent underline">
								{person.email}
							</a>
							.
						</p>
						<p className="mt-4 text-quiet">
							You can also find me on{' '}
							<a href={person.linkedin} target="_blank" rel="me noopener noreferrer" className="text-ink underline">
								LinkedIn<span className="sr-only"> (opens in a new tab)</span>
							</a>
							{hasResume && (
								<>
									, or{' '}
									<a href={resumePath} download className="text-ink underline">
										download my résumé
									</a>
								</>
							)}
							.
						</p>
					</div>
					<div className="relative">
						<ContactForm />
					</div>
				</div>
			</Section>
		</>
	);
}

function NewTabIcon() {
	return (
		<svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
			<path d="M6 3H3.5A.5.5 0 0 0 3 3.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10M9 3h4v4M13 3 7.5 8.5" />
		</svg>
	);
}
