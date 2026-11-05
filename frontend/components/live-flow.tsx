'use client';

import Link from 'next/link';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { formatMs, traceFromTiming, type Trace } from '@/lib/timing';

type NodeId = 'you' | 'cdn' | 'api' | 'db';
type Stage = 'waiting' | 'out' | 'server' | 'in' | 'done';

const nodes: { id: NodeId; name: string; place: string; live: boolean }[] = [
	{ id: 'you', name: 'You', place: 'Your browser', live: true },
	{ id: 'cdn', name: 'GitHub Pages', place: 'A CDN edge near you', live: true },
	{ id: 'api', name: 'API', place: 'A 2014 laptop at my house', live: false },
	{ id: 'db', name: 'SQLite', place: 'One file on that laptop', live: false },
];

// The real trip takes a few milliseconds, so the replay stretches it to about this long.
const REPLAY_SECONDS = 2.4;
const MIN_STEP_SECONDS = 0.35;

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export function LiveFlow({ commit, builtAt, builtAtLabel }: { commit?: string; builtAt: string; builtAtLabel: string }) {
	const reducedMotion = useReducedMotion();
	const [trace, setTrace] = useState<Trace | null | undefined>(undefined);
	const [stage, setStage] = useState<Stage>('waiting');
	const [selected, setSelected] = useState<NodeId>('you');
	const [run, setRun] = useState(0);
	const progress = useMotionValue(0);

	// Read the browser's timing for this page once it has arrived.
	useEffect(() => {
		const read = () => {
			const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
			setTrace(entry ? traceFromTiming(entry) : null);
		};
		if (document.readyState === 'complete') read();
		else window.addEventListener('load', read, { once: true });
		return () => window.removeEventListener('load', read);
	}, []);

	const steps = trace
		? [trace.outbound.reduce((sum, phase) => sum + phase.ms, 0), trace.server.ms, trace.inbound.ms]
		: [0, 0, 0];
	const realTotal = steps[0] + steps[1] + steps[2];
	const durations = steps.map((ms) => Math.max(MIN_STEP_SECONDS, realTotal > 0 ? (REPLAY_SECONDS * ms) / realTotal : 0));
	const slowdown = trace && trace.totalMs > 0 ? Math.round((durations[0] + durations[1] + durations[2]) * 1000 / trace.totalMs) : 0;
	const canAnimate = Boolean(trace && !trace.fromCache && realTotal > 0);

	// One orchestrated moment: a packet leaves your browser, waits at the CDN and comes back.
	useEffect(() => {
		if (!canAnimate || reducedMotion) return;
		let cancelled = false;
		let controls: ReturnType<typeof animate> | undefined;
		(async () => {
			progress.set(0);
			await sleep(run === 0 ? 0.7 : 0.15);
			if (cancelled) return;
			setStage('out');
			controls = animate(progress, 1, { duration: durations[0], ease: [0.45, 0, 0.55, 1] });
			await controls;
			if (cancelled) return;
			setStage('server');
			await sleep(durations[1]);
			if (cancelled) return;
			setStage('in');
			controls = animate(progress, 0, { duration: durations[2], ease: [0.45, 0, 0.55, 1] });
			await controls;
			if (!cancelled) setStage('done');
		})();
		return () => {
			cancelled = true;
			controls?.stop();
		};
		// durations are derived from trace; re-running on every render would restart the trip.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trace, run, reducedMotion, canAnimate]);

	// Without an animation to play (no timing, a cached page, reduced motion) the trip is shown finished.
	const shownStage: Stage = trace !== undefined && (!canAnimate || reducedMotion) ? 'done' : stage;
	const moving = shownStage === 'out' || shownStage === 'in';
	const done = shownStage === 'done';

	return (
		<section aria-labelledby="flow-title" className="mt-20 md:mt-28">
			<div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
				<h2 id="flow-title" className="text-2xl font-semibold md:text-3xl">
					How this page reached you
				</h2>
				<p className="text-sm text-quiet">Select a step to see what it does.</p>
			</div>

			<ol className="mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(2.5rem,0.6fr)_minmax(0,1fr)_minmax(2.5rem,0.6fr)_minmax(0,1fr)_minmax(2.5rem,0.6fr)_minmax(0,1fr)]">
				{nodes.map((node, index) => (
					<FlowStep key={node.id}>
						<NodeButton
							node={node}
							index={index}
							selected={selected === node.id}
							busy={node.id === 'cdn' && shownStage === 'server'}
							reducedMotion={Boolean(reducedMotion)}
							onSelect={() => setSelected(node.id)}
						/>
						{index < nodes.length - 1 && (
							<Edge
								live={node.live && nodes[index + 1].live}
								label={
									node.id === 'you'
										? trace === null
											? 'not measured'
											: done && trace
												? formatMs(trace.totalMs)
												: 'measuring'
										: 'next'
								}
								progress={node.id === 'you' ? progress : undefined}
								moving={node.id === 'you' && moving}
								index={index}
								reducedMotion={Boolean(reducedMotion)}
							/>
						)}
					</FlowStep>
				))}
			</ol>

			<div className="mt-6 min-h-[13rem] rounded-2xl border border-rule bg-panel/60 p-5 md:p-7" aria-live="polite">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={selected}
						initial={reducedMotion ? false : { opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
						transition={{ duration: 0.18 }}
					>
						{selected === 'you' && (
							<YouDetails
								trace={trace}
								done={done}
								slowdown={canAnimate && !reducedMotion ? slowdown : 0}
								onReplay={() => {
									setSelected('you');
									setRun((count) => count + 1);
								}}
								replaying={!done}
							/>
						)}
						{selected === 'cdn' && (
							<Details title="GitHub Pages serves a file that was built in advance">
								<p>
									GitHub Actions built this page
									{commit && (
										<>
											{' '}
											from commit <span className="tabular-nums text-ink">{commit}</span>
										</>
									)}{' '}
									on <time dateTime={builtAt}>{builtAtLabel}</time>, after the linter, the type checker and the
									tests passed. Nothing runs on a server when you ask for it.
								</p>
								<p>
									The pages live on a CDN instead of my laptop on purpose: they stay up when the power or the
									internet goes out at home.
								</p>
							</Details>
						)}
						{selected === 'api' && (
							<Details title="Next: an API on a 2014 laptop" badge="Not live yet">
								<p>
									A small FastAPI service will run on an ASUS X200MA with a Celeron and 2 GB of RAM, reached
									through Cloudflare Tunnel so no ports are open on my home network. It will receive the contact
									form and report its own health.
								</p>
								<p>
									When it&apos;s live, this step will show its real status. <Link href="/about/" className="text-accent underline">Why a laptop</Link>
								</p>
							</Details>
						)}
						{selected === 'db' && (
							<Details title="Next: one SQLite file" badge="Not live yet">
								<p>
									It will store contact messages and nothing else. No database server competing for 2 GB of RAM,
									and backups taken with <span className="text-ink">VACUUM INTO</span>, because copying a live
									database file isn&apos;t safe.
								</p>
							</Details>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</section>
	);
}

// Each list item holds a node and the edge after it; `contents` lets both sit in the parent grid.
function FlowStep({ children }: { children: React.ReactNode }) {
	return <li className="contents">{children}</li>;
}

function NodeButton({
	node,
	index,
	selected,
	busy,
	reducedMotion,
	onSelect,
}: {
	node: (typeof nodes)[number];
	index: number;
	selected: boolean;
	busy: boolean;
	reducedMotion: boolean;
	onSelect: () => void;
}) {
	return (
		<motion.button
			type="button"
			aria-pressed={selected}
			onClick={onSelect}
			initial={reducedMotion ? false : { opacity: 0.3, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 + index * 0.09, duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
			className={[
				'relative w-full cursor-pointer rounded-xl border bg-panel px-4 py-3.5 text-left transition-[border-color,box-shadow] duration-200',
				node.live ? 'border-segment' : 'border-dashed border-segment',
				selected ? 'border-solid !border-accent' : 'hover:border-quiet',
				busy ? 'shadow-[0_0_0_4px_rgb(0_230_140/0.18)]' : '',
			].join(' ')}
		>
			<span className="flex items-center gap-2.5">
				<span
					aria-hidden="true"
					className={[
						'size-2 shrink-0 rounded-full',
						node.live ? 'bg-accent' : 'border border-quiet bg-transparent',
					].join(' ')}
				/>
				<span className="font-display text-lg font-semibold leading-tight">{node.name}</span>
			</span>
			<span className="mt-1 block pl-[1.125rem] text-sm leading-snug text-quiet">{node.place}</span>
			{!node.live && <span className="sr-only">(not live yet)</span>}
		</motion.button>
	);
}

function Edge({
	live,
	label,
	progress,
	moving,
	index,
	reducedMotion,
}: {
	live: boolean;
	label: string;
	progress?: ReturnType<typeof useMotionValue<number>>;
	moving: boolean;
	index: number;
	reducedMotion: boolean;
}) {
	return (
		<div className="relative h-14 md:h-auto md:min-h-[5.5rem]" aria-hidden="true">
			{/* the line: vertical on phones, horizontal from md up */}
			<motion.span
				initial={reducedMotion ? false : { scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ delay: 0.2 + index * 0.09, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
				className={[
					'absolute left-[1.25rem] top-0 h-full origin-top md:left-0 md:top-1/2 md:h-0 md:w-full md:origin-left',
					live
						? `w-0.5 md:h-0.5 ${moving ? 'bg-accent/50' : 'bg-segment'}`
						: 'w-0 border-l border-dashed border-segment md:border-l-0 md:border-t',
				].join(' ')}
			/>
			{progress && <Packet progress={progress} visible={moving} />}
			<span
				className={[
					'absolute left-10 top-1/2 -translate-y-1/2 text-sm tabular-nums md:left-1/2 md:top-[calc(50%-1.75rem)] md:-translate-x-1/2 md:translate-y-0 md:whitespace-nowrap',
					live ? 'text-ink' : 'text-quiet',
				].join(' ')}
			>
				{label}
			</span>
		</div>
	);
}

function Packet({ progress, visible }: { progress: ReturnType<typeof useMotionValue<number>>; visible: boolean }) {
	return (
		<motion.span
			style={{ '--p': progress } as unknown as CSSProperties}
			className={[
				'absolute size-3 rounded-full bg-accent shadow-[0_0_14px_rgb(0_230_140/0.7)] transition-opacity duration-150',
				'left-[calc(1.25rem_-_5px)] top-[calc(var(--p)*100%_-_6px)]',
				'md:left-[calc(var(--p)*100%_-_6px)] md:top-[calc(50%_-_5px)]',
				visible ? 'opacity-100' : 'opacity-0',
			].join(' ')}
		/>
	);
}

function Details({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
	return (
		<div>
			<h3 className="flex flex-wrap items-center gap-3 text-xl font-semibold md:text-2xl">
				{title}
				{badge && (
					<span className="rounded-full border border-dashed border-segment px-2.5 py-0.5 font-sans text-xs font-medium text-quiet">
						{badge}
					</span>
				)}
			</h3>
			<div className="mt-3 max-w-3xl space-y-3 text-quiet">{children}</div>
		</div>
	);
}

function YouDetails({
	trace,
	done,
	slowdown,
	onReplay,
	replaying,
}: {
	trace: Trace | null | undefined;
	done: boolean;
	slowdown: number;
	onReplay: () => void;
	replaying: boolean;
}) {
	if (trace === undefined) {
		return <Details title="Measuring your visit">{<p>Your browser is still timing this page.</p>}</Details>;
	}
	if (trace === null) {
		return (
			<Details title="Your browser didn't share its timing">
				<p>Some browsers and privacy settings hide it. The page still came from GitHub Pages, as the next step shows.</p>
			</Details>
		);
	}
	if (trace.fromCache) {
		return (
			<Details title={`${formatMs(trace.totalMs)}, straight from your browser`}>
				<p>Your browser had this page saved, so nothing crossed the network this time. Reload without the cache to see the full trip.</p>
			</Details>
		);
	}

	const phases = [...trace.outbound, trace.server, trace.inbound].filter((phase) => phase.ms >= 0.5);
	const kb = trace.htmlKb ? `${trace.htmlKb.toFixed(1)} KB of HTML` : 'the HTML';

	return (
		<div>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h3 className="text-xl font-semibold md:text-2xl">
					{done ? `${formatMs(trace.totalMs)} from your request to the last byte of ${kb}` : 'Following your request'}
				</h3>
				<button
					type="button"
					onClick={onReplay}
					disabled={replaying}
					className="rounded-full border border-segment px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-40 disabled:hover:border-segment disabled:hover:text-ink"
				>
					Replay the trip
				</button>
			</div>

			<div className="mt-5 flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
				{phases.map((phase) => (
					<motion.span
						key={phase.id}
						className={phase.id === 'server' ? 'bg-accent' : 'bg-segment'}
						style={{ flexGrow: phase.ms, minWidth: 4 }}
						initial={false}
						animate={{ opacity: done ? 1 : 0.35 }}
					/>
				))}
			</div>

			<ul className="mt-4 grid max-w-xl gap-1.5 text-sm">
				{phases.map((phase) => (
					<li key={phase.id} className="grid grid-cols-[0.75rem_1fr_auto] items-center gap-3">
						<span aria-hidden="true" className={`size-3 rounded-sm ${phase.id === 'server' ? 'bg-accent' : 'bg-segment'}`} />
						<span className={phase.id === 'server' ? 'text-ink' : 'text-quiet'}>{phase.label}</span>
						<span className="tabular-nums text-quiet">{formatMs(phase.ms)}</span>
					</li>
				))}
			</ul>

			{slowdown > 1 && (
				<p className="mt-4 text-sm text-quiet">The animation replays your real timings about {slowdown}× slower, so you can follow it.</p>
			)}
		</div>
	);
}
