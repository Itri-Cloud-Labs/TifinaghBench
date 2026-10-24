import {useId} from 'react';

// A painted band from Kabyle and Rif pottery: hairline rails with a run of lozenges and sawtooth.
// Used sparingly, as a section break: the footer edge, the Dialects and Support pages.
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
