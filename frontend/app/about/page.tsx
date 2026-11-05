import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
	title: 'About this site',
	description:
		'How this site is built: Next.js pages on a CDN, a small API on a 2014 laptop, and the trade-offs behind each decision.',
	path: '/about/',
});

const decisions = [
	{
		title: 'Pages on a CDN, the API on a laptop',
		text: 'The pages are plain files on GitHub Pages. Only the small API will run on the laptop at home.',
		pro: 'The portfolio stays up when the power or the internet goes out at home. Only the API goes down with it.',
		con: 'Two places to operate instead of one, and the API has to accept requests from another origin.',
	},
	{
		title: 'Next.js, exported as static files',
		text: 'The first version used Astro. It was lighter, but it showed little React and looked too plain, so I rebuilt it with Next.js, React and Tailwind, exported ahead of time.',
		pro: 'React and TypeScript end to end, with no server to run. Moving to Vercel later means connecting the repository.',
		con: 'Every page ships the React runtime, and a static export gives up server features such as image optimization.',
	},
	{
		title: 'SQLite, not Postgres',
		text: 'The only data will be contact messages, stored in a database file used by this site alone.',
		pro: 'No database server competing for 2 GB of RAM.',
		con: 'One writer at a time and a single machine. Backups need care, because copying a live file is not safe.',
	},
	{
		title: 'Cloudflare Tunnel, not open ports',
		text: 'A connector inside the laptop opens the connection outward, and Cloudflare handles HTTPS for the API.',
		pro: 'No open ports on my home network and no need for a public IP.',
		con: 'The API depends on Cloudflare, which also sits in the path of all its traffic.',
	},
	{
		title: 'Build in CI, never on the server',
		text: 'GitHub Actions runs the linter, the type checker and the tests, then builds. Nothing is published unless they pass.',
		pro: 'A slow laptop never compiles anything, and what runs is what was tested.',
		con: 'Publishing depends on GitHub, which hosts the code, the CI and the pages.',
	},
	{
		title: 'What it costs',
		text: 'Nothing so far. A domain will be the first expense.',
		pro: 'The hardware already existed and the services used have free tiers.',
		con: 'I am the operations team, so every failure is mine to fix.',
	},
];

const trip = [
	'Your browser asks GitHub Pages for the page, and its CDN sends back a file that was built in advance.',
	'When the API is live, its requests go to Cloudflare over HTTPS and travel through a tunnel to the laptop.',
	'On the laptop, Caddy passes them to FastAPI, which stores contact messages in SQLite.',
];

export default function AboutPage() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-24">
			<h1 className="max-w-5xl font-display text-5xl leading-[0.95] font-bold tracking-[-0.03em] [font-stretch:80%] md:text-7xl">
				The pages come from a CDN. The API will come from a 2014 laptop.
			</h1>
			<p className="mt-6 max-w-2xl text-xl text-quiet">
				The laptop is an ASUS X200MA with a Celeron N2830, 2 GB of RAM and a 500 GB hard drive.
			</p>
			<p className="mt-8 max-w-2xl">
				This site is a working example of how I think about software: start from the real constraints, choose the
				simplest thing that fits and be honest about what each choice costs. The pages went to a free host, because a
				laptop at home is a poor place for the part a recruiter opens first. The backend goes on the laptop, where its
				limits are worth showing.
			</p>

			<section aria-labelledby="trip-title" className="mt-20">
				<h2 id="trip-title" className="text-3xl font-semibold md:text-4xl">
					How a request gets here
				</h2>
				<ol className="mt-6 grid max-w-3xl gap-4">
					{trip.map((step, index) => (
						<li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
							<span className="font-display text-xl font-semibold text-accent tabular-nums">{index + 1}</span>
							<span>{step}</span>
						</li>
					))}
				</ol>
			</section>

			<section aria-labelledby="decisions-title" className="mt-20">
				<h2 id="decisions-title" className="text-3xl font-semibold md:text-4xl">
					The decisions
				</h2>
				<div className="mt-8 grid gap-5 md:grid-cols-2">
					{decisions.map(({ title, text, pro, con }) => (
						<section key={title} className="rounded-2xl border border-rule bg-panel/60 p-6">
							<h3 className="text-xl font-semibold">{title}</h3>
							<p className="mt-2 text-quiet">{text}</p>
							<dl className="mt-5 grid gap-3 text-[0.95rem]">
								<div className="grid grid-cols-[2.75rem_1fr] gap-2">
									<dt className="font-semibold text-accent">Pro</dt>
									<dd>{pro}</dd>
								</div>
								<div className="grid grid-cols-[2.75rem_1fr] gap-2">
									<dt className="font-semibold text-quiet">Con</dt>
									<dd>{con}</dd>
								</div>
							</dl>
						</section>
					))}
				</div>
			</section>
		</div>
	);
}
