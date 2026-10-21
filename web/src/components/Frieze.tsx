import {useId} from 'react';

// A painted band from Kabyle and Rif pottery: hairline rails with a run of lozenges and sawtooth.
// Used only where a band means something: between leaderboard tiers, and under the header rail.
export function Frieze({tone = 'ink', height = 14, className}: {tone?: 'ink' | 'clay' | 'slip'; height?: number; className?: string}) {
	const id = useId().replace(/:/g, '');
	const color = tone === 'clay' ? 'var(--clay)' : tone === 'slip' ? 'var(--clay-ink-2)' : 'var(--ink-2)';
	return (
		<svg className={className} width="100%" height={height} aria-hidden="true" focusable="false" preserveAspectRatio="none">
			<defs>
				<pattern id={`frieze-${id}`} width="24" height="14" patternUnits="userSpaceOnUse" y={(height - 14) / 2}>
					<path d="M0 1.5h24M0 12.5h24" stroke={color} strokeWidth="1" />
					<path d="M12 3.5 16.5 7 12 10.5 7.5 7Z" fill={color} />
					<path d="M0 3.5 3 7 0 10.5M24 3.5 21 7l3 3.5" fill="none" stroke={color} strokeWidth="1" />
				</pattern>
			</defs>
			<rect width="100%" height={height} fill={`url(#frieze-${id})`} />
		</svg>
	);
}

// The painted band between leaderboard tiers: a clay field with slip lozenges and ochre hearts,
// so a tier change reads as a change of register, not a rule.
export function TierBand({className}: {className?: string}) {
	const id = useId().replace(/:/g, '');
	return (
		<svg className={className} width="100%" height="16" aria-hidden="true" focusable="false">
			<defs>
				<pattern id={`band-${id}`} width="24" height="16" patternUnits="userSpaceOnUse">
					<rect width="24" height="16" fill="var(--clay)" />
					<path d="M12 2.5 17.5 8 12 13.5 6.5 8Z" fill="var(--slip)" />
					<path d="M12 5.5 14.5 8 12 10.5 9.5 8Z" fill="var(--ramp-2)" />
					<path d="M0 2.5 3 8 0 13.5ZM24 2.5 21 8l3 5.5Z" fill="var(--ramp-2)" />
				</pattern>
			</defs>
			<rect width="100%" height="16" fill={`url(#band-${id})`} />
		</svg>
	);
}

// The sawtooth hem under the clay header rail.
export function Hem() {
	const id = useId().replace(/:/g, '');
	return (
		<svg width="100%" height="8" aria-hidden="true" focusable="false" className="block">
			<defs>
				<pattern id={`hem-${id}`} width="16" height="8" patternUnits="userSpaceOnUse">
					<path d="M0 0h16L8 8Z" fill="var(--clay)" />
				</pattern>
			</defs>
			<rect width="100%" height="8" fill={`url(#hem-${id})`} />
		</svg>
	);
}
