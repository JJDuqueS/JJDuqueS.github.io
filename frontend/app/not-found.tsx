import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-24">
			<h1 className="font-display text-6xl font-bold tracking-[-0.03em] [font-stretch:80%] md:text-8xl">Not found</h1>
			<p className="mt-5 max-w-xl text-xl text-quiet">
				There&apos;s no page at this address. <Link href="/" className="text-accent underline">Go to the home page</Link>.
			</p>
		</div>
	);
}
