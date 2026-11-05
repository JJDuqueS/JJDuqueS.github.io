export function Section({
	id,
	title,
	intro,
	children,
}: {
	id: string;
	title: string;
	intro?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section aria-labelledby={`${id}-title`} id={id} className="mx-auto mt-28 max-w-6xl scroll-mt-8 px-5 sm:px-8 md:mt-36">
			<div className="grid gap-x-12 gap-y-4 md:grid-cols-[14rem_minmax(0,1fr)]">
				<div>
					<h2 id={`${id}-title`} className="text-3xl font-semibold md:sticky md:top-8 md:text-4xl">
						{title}
					</h2>
					{intro && <p className="mt-3 text-quiet">{intro}</p>}
				</div>
				<div>{children}</div>
			</div>
		</section>
	);
}
