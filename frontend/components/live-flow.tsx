'use client';

import Link from 'next/link';
import { AnimatePresence, animate, motion, type MotionValue, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { fetchHealth, formatDuration, type HealthResult } from '@/lib/api-health';
import { dictionaries, type Lang, localePath } from '@/lib/i18n';
import { formatMs, traceFromTiming, type Trace } from '@/lib/timing';

// Set at build time from the API_URL repository variable (lib/api-url.ts checks it).
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

type NodeId = 'you' | 'cdn' | 'api' | 'db';
type Stage = 'waiting' | 'out' | 'server' | 'in' | 'api-out' | 'db' | 'api-in' | 'done';
type FlowText = (typeof dictionaries)['en']['flow'];

// The real trips take milliseconds, so the replay stretches the page trip to about this long
// and plays the API trip at the same scale.
const REPLAY_SECONDS = 2.4;
const MIN_STEP_SECONDS = 0.35;
const MAX_API_STEP_SECONDS = 1.6;

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// 0.4 -> "<1 ms", 2.6 -> "3 ms"
const formatDbMs = (ms: number) => (ms < 1 ? '<1 ms' : formatMs(ms));

export function LiveFlow({
	lang,
	commit,
	builtAt,
	builtAtLabel,
}: {
	lang: Lang;
	commit?: string;
	builtAt: string;
	builtAtLabel: string;
}) {
	const t = dictionaries[lang].flow;
	const reducedMotion = useReducedMotion();
	const [trace, setTrace] = useState<Trace | null | undefined>(undefined);
	const [health, setHealth] = useState<HealthResult | undefined>(API_URL ? undefined : { kind: 'none' });
	const [stage, setStage] = useState<Stage>('waiting');
	const [selected, setSelected] = useState<NodeId>('you');
	const [run, setRun] = useState(0);
	const pageProgress = useMotionValue(0);
	const apiProgress = useMotionValue(0);
	const dbProgress = useMotionValue(0);
	const healthRequest = useRef<Promise<HealthResult>>(Promise.resolve({ kind: 'none' }));

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

	// Ask the laptop how it is doing, on load and on every replay. Declared before the
	// animation so the request is already on its way when the trip starts.
	useEffect(() => {
		if (!API_URL) return;
		let cancelled = false;
		healthRequest.current = fetchHealth(API_URL).then((result) => {
			if (!cancelled) setHealth(result);
			return result;
		});
		return () => {
			cancelled = true;
		};
	}, [run]);

	const steps = trace
		? [trace.outbound.reduce((sum, phase) => sum + phase.ms, 0), trace.server.ms, trace.inbound.ms]
		: [0, 0, 0];
	const realTotal = steps[0] + steps[1] + steps[2];
	const durations = steps.map((ms) => Math.max(MIN_STEP_SECONDS, realTotal > 0 ? (REPLAY_SECONDS * ms) / realTotal : 0));
	const secondsPerMs = realTotal > 0 ? (durations[0] + durations[1] + durations[2]) / realTotal : 0;
	const slowdown = trace && trace.totalMs > 0 ? Math.round(((durations[0] + durations[1] + durations[2]) * 1000) / trace.totalMs) : 0;
	const canAnimate = Boolean(trace && !trace.fromCache && realTotal > 0);

	// One orchestrated moment: a packet fetches the page from the CDN and comes back,
	// then a second one asks the API, which checks SQLite, and comes back.
	useEffect(() => {
		if (!canAnimate || reducedMotion) return;
		let cancelled = false;
		let controls: ReturnType<typeof animate> | undefined;
		const ease = [0.45, 0, 0.55, 1] as const;
		const move = async (value: MotionValue<number>, to: number, duration: number) => {
			controls = animate(value, to, { duration, ease });
			await controls;
		};
		(async () => {
			pageProgress.set(0);
			apiProgress.set(0);
			dbProgress.set(0);
			await sleep(run === 0 ? 0.7 : 0.15);
			if (cancelled) return;
			setStage('out');
			await move(pageProgress, 1, durations[0]);
			if (cancelled) return;
			setStage('server');
			await sleep(durations[1]);
			if (cancelled) return;
			setStage('in');
			await move(pageProgress, 0, durations[2]);
			if (cancelled) return;

			const result = await healthRequest.current;
			if (cancelled) return;
			if (result.kind === 'ok') {
				const oneWay = clamp((result.ms / 2) * secondsPerMs, MIN_STEP_SECONDS, MAX_API_STEP_SECONDS);
				setStage('api-out');
				await move(apiProgress, 1, oneWay);
				if (cancelled) return;
				setStage('db');
				await move(dbProgress, 1, 0.3);
				if (cancelled) return;
				await move(dbProgress, 0, 0.3);
				if (cancelled) return;
				setStage('api-in');
				await move(apiProgress, 0, oneWay);
			}
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
	const done = shownStage === 'done';
	const pageDone = done || shownStage.startsWith('api') || shownStage === 'db';

	const apiState = health === undefined ? 'pending' : health.kind;
	const databaseOk = health?.kind === 'ok' && health.health.database === 'ok';
	// The API's numbers appear once its packet is back (or straight away without animation).
	const showApi = done || shownStage === 'db' || shownStage === 'api-in' || !canAnimate || Boolean(reducedMotion);

	const pageLabel = trace === null ? t.notMeasured : pageDone && trace ? formatMs(trace.totalMs) : t.measuring;
	const apiLabel =
		apiState === 'ok' && showApi && health?.kind === 'ok'
			? formatMs(health.ms)
			: apiState === 'offline'
				? t.offline
				: apiState === 'none'
					? ''
					: t.asking;
	const dbLabel =
		health?.kind === 'ok' && showApi
			? databaseOk
				? health.health.database_ms !== undefined
					? formatDbMs(health.health.database_ms)
					: t.ok
				: t.offline
			: '';

	const live: Record<NodeId, boolean> = {
		you: true,
		cdn: true,
		api: apiState === 'ok',
		db: databaseOk,
	};

	return (
		<section aria-labelledby="flow-title" className="mt-20 md:mt-28">
			<div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
				<h2 id="flow-title" className="text-2xl font-semibold md:text-3xl">
					{t.title}
				</h2>
				<p className="text-sm text-quiet">{t.hint}</p>
			</div>

			{/*
			  Phones: one column, top to bottom. From md up: your browser on the left, branching
			  to GitHub Pages (the page) on the first row and to the API, then SQLite, on the second.
			*/}
			<ol className="mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(3rem,0.6fr)_minmax(0,1fr)_minmax(3rem,0.6fr)_minmax(0,1fr)] md:grid-rows-2">
				<li className="md:col-start-1 md:row-span-2 md:row-start-1 md:self-center">
					<NodeButton id="you" t={t} index={0} live selected={selected === 'you'} reducedMotion={Boolean(reducedMotion)} onSelect={setSelected} />
				</li>
				<li className="contents">
					<Edge
						className="md:col-start-2 md:row-start-1"
						branch="top"
						live
						label={pageLabel}
						progress={pageProgress}
						moving={shownStage === 'out' || shownStage === 'in'}
						index={0}
						reducedMotion={Boolean(reducedMotion)}
					/>
					<div className="md:col-start-3 md:row-start-1 md:self-center md:py-3">
						<NodeButton
							id="cdn"
							t={t}
							index={1}
							live
							busy={shownStage === 'server'}
							selected={selected === 'cdn'}
							reducedMotion={Boolean(reducedMotion)}
							onSelect={setSelected}
						/>
					</div>
				</li>
				<li className="contents">
					<Edge
						className="md:col-start-2 md:row-start-2"
						branch="bottom"
						live={live.api}
						label={apiLabel}
						mobilePrefix={apiLabel ? t.fromBrowser : undefined}
						progress={apiProgress}
						moving={shownStage === 'api-out' || shownStage === 'api-in'}
						index={1}
						reducedMotion={Boolean(reducedMotion)}
					/>
					<div className="md:col-start-3 md:row-start-2 md:self-center md:py-3">
						<NodeButton
							id="api"
							t={t}
							index={2}
							live={live.api}
							pending={apiState === 'pending'}
							busy={shownStage === 'db'}
							selected={selected === 'api'}
							reducedMotion={Boolean(reducedMotion)}
							onSelect={setSelected}
						/>
					</div>
				</li>
				<li className="contents">
					<Edge
						className="md:col-start-4 md:row-start-2"
						live={live.db}
						label={dbLabel}
						progress={dbProgress}
						moving={shownStage === 'db'}
						index={2}
						reducedMotion={Boolean(reducedMotion)}
					/>
					<div className="md:col-start-5 md:row-start-2 md:self-center md:py-3">
						<NodeButton
							id="db"
							t={t}
							index={3}
							live={live.db}
							pending={apiState === 'pending'}
							selected={selected === 'db'}
							reducedMotion={Boolean(reducedMotion)}
							onSelect={setSelected}
						/>
					</div>
				</li>
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
								t={t}
								lang={lang}
								trace={trace}
								done={pageDone}
								slowdown={canAnimate && !reducedMotion ? slowdown : 0}
								onReplay={() => {
									setSelected('you');
									setRun((count) => count + 1);
								}}
								replaying={!done}
							/>
						)}
						{selected === 'cdn' && (
							<Details title={t.cdnTitle}>
								<p>
									{t.cdnBuilt}
									{commit && (
										<>
											{' '}
											{t.cdnFromCommit} <span className="tabular-nums text-ink">{commit}</span>
										</>
									)}{' '}
									{t.cdnOn} <time dateTime={builtAt}>{builtAtLabel}</time>, {t.cdnAfter}
								</p>
								<p>{t.cdnWhy}</p>
							</Details>
						)}
						{selected === 'api' && <ApiDetails t={t} lang={lang} health={health} />}
						{selected === 'db' && (
							<Details title={t.dbTitle} badge={health?.kind === 'offline' || (health?.kind === 'ok' && !databaseOk) ? t.offlineBadge : undefined}>
								<p>
									{t.dbBefore} <span className="text-ink">VACUUM INTO</span>, {t.dbAfter}
								</p>
								<p>
									{health?.kind === 'ok'
										? databaseOk
											? t.dbChecked(health.health.database_ms !== undefined ? formatDbMs(health.health.database_ms) : null)
											: t.dbUnavailable
										: t.dbUnknown}
								</p>
							</Details>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</section>
	);
}

function ApiDetails({ t, lang, health }: { t: FlowText; lang: Lang; health: HealthResult | undefined }) {
	const why = (
		<Link href={localePath(lang, '/about/')} className="text-accent underline">
			{t.apiWhy}
		</Link>
	);
	if (health === undefined) {
		return (
			<Details title={t.apiAskingTitle}>
				<p>{t.apiAskingText}</p>
			</Details>
		);
	}
	if (health.kind === 'none') {
		return (
			<Details title={t.apiNoneTitle}>
				<p>{t.apiNoneText}</p>
			</Details>
		);
	}
	if (health.kind === 'offline') {
		return (
			<Details title={t.apiOfflineTitle} badge={t.offlineBadge}>
				<p>{t.apiOfflineText}</p>
				<p>{why}</p>
			</Details>
		);
	}

	const locale = lang === 'es' ? 'es-CO' : 'en-US';
	const number = (value: number, digits = 0) => value.toLocaleString(locale, { maximumFractionDigits: digits });
	const { host, uptime_seconds } = health.health;
	const facts = [
		t.apiAnswered(formatMs(health.ms)),
		host.uptime_seconds !== null && t.laptopUp(formatDuration(host.uptime_seconds, lang)),
		host.load && t.load(number(host.load[0], 2)),
		host.memory_mb && t.memory(number(host.memory_mb.total - host.memory_mb.available), number(host.memory_mb.total)),
		t.apiUp(formatDuration(uptime_seconds, lang)),
	].filter((fact): fact is string => Boolean(fact));

	return (
		<Details title={t.apiTitle}>
			<p>{t.apiText}</p>
			<ul className="grid gap-1.5 text-sm sm:grid-cols-2">
				{facts.map((fact) => (
					<li key={fact} className="flex items-center gap-2.5 text-ink">
						<span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
						<span className="tabular-nums">{fact}</span>
					</li>
				))}
			</ul>
			<p>{why}</p>
		</Details>
	);
}

function NodeButton({
	id,
	t,
	index,
	live,
	pending = false,
	busy = false,
	selected,
	reducedMotion,
	onSelect,
}: {
	id: NodeId;
	t: FlowText;
	index: number;
	live: boolean;
	pending?: boolean;
	busy?: boolean;
	selected: boolean;
	reducedMotion: boolean;
	onSelect: (id: NodeId) => void;
}) {
	return (
		<motion.button
			type="button"
			aria-pressed={selected}
			onClick={() => onSelect(id)}
			initial={reducedMotion ? false : { opacity: 0.3, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 + index * 0.09, duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
			className={[
				'relative w-full cursor-pointer rounded-xl border bg-panel px-4 py-3.5 text-left transition-[border-color,box-shadow] duration-200',
				live ? 'border-segment' : 'border-dashed border-segment',
				selected ? 'border-solid !border-accent' : 'hover:border-quiet',
				busy ? 'shadow-[0_0_0_4px_rgb(0_230_140/0.18)]' : '',
			].join(' ')}
		>
			<span className="flex items-center gap-2.5">
				<span
					aria-hidden="true"
					className={[
						'size-2 shrink-0 rounded-full',
						live ? 'bg-accent' : 'border border-quiet bg-transparent',
						pending ? 'animate-pulse motion-reduce:animate-none' : '',
					].join(' ')}
				/>
				<span className="font-display text-lg font-semibold leading-tight">{t.nodes[id].name}</span>
			</span>
			<span className="mt-1 block pl-[1.125rem] text-sm leading-snug text-quiet">{t.nodes[id].place}</span>
			{!live && !pending && <span className="sr-only">{t.offlineSr}</span>}
		</motion.button>
	);
}

function Edge({
	className,
	branch,
	live,
	label,
	mobilePrefix,
	progress,
	moving,
	index,
	reducedMotion,
}: {
	className: string;
	// From md up, the two edges leaving your browser share a vertical line on their left.
	branch?: 'top' | 'bottom';
	live: boolean;
	label: string;
	mobilePrefix?: string;
	progress: MotionValue<number>;
	moving: boolean;
	index: number;
	reducedMotion: boolean;
}) {
	const line = live ? (moving ? 'bg-accent/50' : 'bg-segment') : '';
	return (
		<div className={`relative h-14 md:h-auto md:min-h-[5.5rem] ${className}`} aria-hidden="true">
			{branch && (
				<span
					className={[
						'absolute left-0 hidden w-0.5 md:block',
						branch === 'top' ? 'top-1/2 bottom-0' : 'top-0 bottom-1/2',
						live ? line : 'border-l border-dashed border-segment',
					].join(' ')}
				/>
			)}
			{/* the line: vertical on phones, horizontal from md up */}
			<motion.span
				initial={reducedMotion ? false : { scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ delay: 0.2 + index * 0.09, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
				className={[
					'absolute left-[1.25rem] top-0 h-full origin-top md:left-0 md:top-1/2 md:h-0 md:w-full md:origin-left',
					live ? `w-0.5 md:h-0.5 ${line}` : 'w-0 border-l border-dashed border-segment md:border-l-0 md:border-t',
				].join(' ')}
			/>
			<Packet progress={progress} visible={moving} />
			<span
				className={[
					'absolute left-10 top-1/2 -translate-y-1/2 text-sm tabular-nums md:left-1/2 md:top-[calc(50%-1.75rem)] md:-translate-x-1/2 md:translate-y-0 md:whitespace-nowrap',
					live ? 'text-ink' : 'text-quiet',
				].join(' ')}
			>
				{mobilePrefix && <span className="md:hidden">{mobilePrefix}: </span>}
				{label}
			</span>
		</div>
	);
}

function Packet({ progress, visible }: { progress: MotionValue<number>; visible: boolean }) {
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
	t,
	lang,
	trace,
	done,
	slowdown,
	onReplay,
	replaying,
}: {
	t: FlowText;
	lang: Lang;
	trace: Trace | null | undefined;
	done: boolean;
	slowdown: number;
	onReplay: () => void;
	replaying: boolean;
}) {
	if (trace === undefined) {
		return (
			<Details title={t.measuringTitle}>
				<p>{t.measuringText}</p>
			</Details>
		);
	}
	if (trace === null) {
		return (
			<Details title={t.noTimingTitle}>
				<p>{t.noTimingText}</p>
			</Details>
		);
	}
	if (trace.fromCache) {
		return (
			<Details title={t.cachedTitle(formatMs(trace.totalMs))}>
				<p>{t.cachedText}</p>
			</Details>
		);
	}

	const phases = [...trace.outbound, trace.server, trace.inbound].filter((phase) => phase.ms >= 0.5);
	const kb = trace.htmlKb
		? trace.htmlKb.toLocaleString(lang === 'es' ? 'es-CO' : 'en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
		: null;

	return (
		<div>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h3 className="text-xl font-semibold md:text-2xl">
					{done ? t.doneTitle(formatMs(trace.totalMs), kb) : t.following}
				</h3>
				<button
					type="button"
					onClick={onReplay}
					disabled={replaying}
					className="rounded-full border border-segment px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-40 disabled:hover:border-segment disabled:hover:text-ink"
				>
					{t.replay}
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
						<span className={phase.id === 'server' ? 'text-ink' : 'text-quiet'}>{t.phases[phase.id]}</span>
						<span className="tabular-nums text-quiet">{formatMs(phase.ms)}</span>
					</li>
				))}
			</ul>

			{slowdown > 1 && (
				<p className="mt-4 text-sm text-quiet">{t.slower(slowdown)}</p>
			)}
		</div>
	);
}
