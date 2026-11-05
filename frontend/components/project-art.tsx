// Small drawings for the project cards. They move a little when the card is hovered,
// in answer to the visitor, not on their own.

export function SunPathArt() {
	return (
		<svg viewBox="0 0 320 140" className="h-full w-full" aria-hidden="true">
			<line x1="16" y1="118" x2="304" y2="118" stroke="var(--color-segment)" strokeWidth="1.5" />
			<path d="M40 118 Q160 -22 280 118" fill="none" stroke="var(--color-segment)" strokeWidth="1.5" strokeDasharray="4 6" />
			{[0.2, 0.35, 0.5, 0.65, 0.8].map((t) => {
				const x = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 160 + t * t * 280;
				const y = (1 - t) * (1 - t) * 118 + 2 * (1 - t) * t * -22 + t * t * 118;
				return <circle key={t} cx={x} cy={y} r="2" fill="var(--color-quiet)" />;
			})}
			<g className="origin-[160px_118px] -rotate-[38deg] transition-transform duration-700 ease-out-soft group-hover:rotate-[18deg] motion-reduce:transition-none">
				<circle cx="160" cy="48" r="11" fill="var(--color-accent)" />
				<circle cx="160" cy="48" r="20" fill="var(--color-accent)" opacity="0.12" />
			</g>
		</svg>
	);
}

export function FlowArt() {
	const xs = [36, 124, 212, 290];
	return (
		<svg viewBox="0 0 320 140" className="h-full w-full" aria-hidden="true">
			<line x1={xs[0]} y1="70" x2={xs[1]} y2="70" stroke="var(--color-segment)" strokeWidth="2" />
			<line x1={xs[1]} y1="70" x2={xs[3]} y2="70" stroke="var(--color-segment)" strokeWidth="1.5" strokeDasharray="4 6" />
			{xs.map((x, index) => (
				<rect
					key={x}
					x={x - 18}
					y="52"
					width="36"
					height="36"
					rx="9"
					fill="var(--color-panel)"
					stroke="var(--color-segment)"
					strokeDasharray={index > 1 ? '4 4' : undefined}
				/>
			))}
			<circle
				cx={xs[0]}
				cy="70"
				r="6"
				fill="var(--color-accent)"
				className="transition-transform duration-700 ease-out-soft group-hover:translate-x-[88px] motion-reduce:transition-none"
			/>
		</svg>
	);
}
