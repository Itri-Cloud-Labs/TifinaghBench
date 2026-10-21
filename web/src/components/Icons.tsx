import type {SVGProps} from 'react';

// One drawn set: 20px grid, 1.6 stroke, round caps.
const base = {width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true} as const;

export const SunIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}><circle cx="10" cy="10" r="3.4" /><path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7 6 6M14 14l1.3 1.3M4.7 15.3 6 14M14 6l1.3-1.3" /></svg>
);
export const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}><path d="M15.8 12.4A6.3 6.3 0 0 1 7.6 4.2a6.3 6.3 0 1 0 8.2 8.2Z" /></svg>
);
export const GithubIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}><path d="M7.6 16.2c-3.2 1-3.2-1.6-4.5-1.9m9 3.5v-2.5c0-.8.1-1.3-.4-1.8 2-.2 4.2-1 4.2-4.6 0-1-.4-1.9-1-2.6.1-.3.4-1.3-.1-2.6 0 0-.8-.3-2.6 1a9 9 0 0 0-4.7 0C5.8 3.7 5 4 5 4c-.5 1.3-.2 2.3-.1 2.6-.6.7-1 1.6-1 2.6 0 3.6 2.2 4.4 4.2 4.6-.5.4-.5 1-.4 1.8v2.5" /></svg>
);
export const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}><path d="M10 16.2s-6.2-3.6-6.2-8.1A3.4 3.4 0 0 1 10 6.1a3.4 3.4 0 0 1 6.2 2c0 4.5-6.2 8.1-6.2 8.1Z" /></svg>
);
export const ArrowLeftIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
);
export const ArrowRightIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}><path d="m7.5 4.5 5.5 5.5-5.5 5.5" /></svg>
);
export const SortIcon = ({sorted, ...props}: SVGProps<SVGSVGElement> & {sorted: 'asc' | 'desc' | null}) => (
	<svg {...base} width={14} height={14} {...props}>
		<path d="m6 8 4-4 4 4" opacity={sorted === 'asc' ? 1 : 0.35} />
		<path d="m6 12 4 4 4-4" opacity={sorted === 'desc' ? 1 : 0.35} />
	</svg>
);
export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} width={14} height={14} {...props}><path d="m5 5 10 10M15 5 5 15" /></svg>
);
export const ExternalIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} width={14} height={14} {...props}><path d="M8 4H4.5v11.5H16V12M11 4h5v5M16 4l-7 7" /></svg>
);
export const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}><path d="M3.5 6h13M3.5 10h13M3.5 14h13" /></svg>
);
