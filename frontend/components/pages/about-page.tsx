import { dictionaries, type Lang } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';

export const aboutMetadata = (lang: Lang) =>
	pageMetadata({
		lang,
		title: dictionaries[lang].about.title,
		description: dictionaries[lang].about.description,
		path: '/about/',
	});

export function AboutPage({ lang }: { lang: Lang }) {
	const t = dictionaries[lang].about;
	return (
		<div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-24">
			<h1 className="max-w-5xl font-display text-5xl leading-[0.95] font-bold tracking-[-0.03em] [font-stretch:80%] md:text-7xl">
				{t.heading}
			</h1>
			<p className="mt-6 max-w-2xl text-xl text-quiet">
				{t.laptop}
			</p>
			<p className="mt-8 max-w-2xl">
				{t.intro}
			</p>

			<section aria-labelledby="trip-title" className="mt-20">
				<h2 id="trip-title" className="text-3xl font-semibold md:text-4xl">
					{t.tripTitle}
				</h2>
				<ol className="mt-6 grid max-w-3xl gap-4">
					{t.trip.map((step, index) => (
						<li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
							<span className="font-display text-xl font-semibold text-accent tabular-nums">{index + 1}</span>
							<span>{step}</span>
						</li>
					))}
				</ol>
			</section>

			<section aria-labelledby="decisions-title" className="mt-20">
				<h2 id="decisions-title" className="text-3xl font-semibold md:text-4xl">
					{t.decisionsTitle}
				</h2>
				<div className="mt-8 grid gap-5 md:grid-cols-2">
					{t.decisions.map(({ title, text, pro, con }) => (
						<section key={title} className="rounded-2xl border border-rule bg-panel/60 p-6">
							<h3 className="text-xl font-semibold">{title}</h3>
							<p className="mt-2 text-quiet">{text}</p>
							<dl className="mt-5 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-3 text-[0.95rem]">
								<dt className="font-semibold text-accent">{t.pro}</dt>
								<dd>{pro}</dd>
								<dt className="font-semibold text-quiet">{t.con}</dt>
								<dd>{con}</dd>
							</dl>
						</section>
					))}
				</div>
			</section>
		</div>
	);
}
