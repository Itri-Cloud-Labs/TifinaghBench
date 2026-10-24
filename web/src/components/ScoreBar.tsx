import type {Estimate} from '../data/stats';

// One run's score on the fixed 0–100 scale every chart on the site shares:
// a bar from the baseline to the score, the 95% interval as a whisker, the estimate as a ringed dot.
export function ScoreBar({estimate, value, height = 20, label}: {estimate?: Estimate | null; value?: number | null; height?: number; label: string}) {
	const score = estimate?.value ?? value ?? null;
	const mid = height / 2;
	const clamp = (x: number) => Math.max(0, Math.min(100, x));
	return (
		<svg className="block w-full overflow-visible" height={height} role="img" aria-label={label}>
			<svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" width="100%" height={height} className="overflow-visible">
				<line x1="0" x2="100" y1={mid} y2={mid} stroke="var(--rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
				{[0, 25, 50, 75, 100].map(tick => (
					<line key={tick} x1={tick} x2={tick} y1={mid - 4} y2={mid + 4} stroke="var(--rule-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
				))}
				{score !== null && <rect x="0" y={mid - 3} width={clamp(score)} height="6" fill="var(--ramp-3)" />}
				{estimate && (
					<g stroke="var(--mark)" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
						<line x1={clamp(estimate.low)} x2={clamp(estimate.high)} y1={mid} y2={mid} vectorEffect="non-scaling-stroke" />
						<line x1={clamp(estimate.low)} x2={clamp(estimate.low)} y1={mid - 5} y2={mid + 5} vectorEffect="non-scaling-stroke" />
						<line x1={clamp(estimate.high)} x2={clamp(estimate.high)} y1={mid - 5} y2={mid + 5} vectorEffect="non-scaling-stroke" />
					</g>
				)}
			</svg>
			{score !== null && (
				<circle cx={`${clamp(score)}%`} cy={mid} r="4.5" fill="var(--mark)" stroke="var(--slip)" strokeWidth="2" />
			)}
		</svg>
	);
}
