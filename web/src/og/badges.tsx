import type {Run} from '../data/runs';
import {runs} from '../data/runs';
import {formatters} from '../i18n';
import {badgePath, badgeHeight} from './paths';

// Small score badges for READMEs and posts, drawn with Satori into SVG (scripts/cards.mjs).
// Satori turns the text into outlines, so the badge looks the same without the font installed.
const color = {ink: '#241a14', clay: '#9c3a22', cream: '#f7efe6'};

function Badge({run}: {run: Run & {score: NonNullable<Run['score']>}}) {
	const f = formatters('en');
	const value = run.rank !== null ? `${f.score(run.score.value)} · #${run.rank}` : f.score(run.score.value);
	const half = {display: 'flex', alignItems: 'center', height: badgeHeight, padding: '0 9px', fontSize: 13, fontWeight: 600, color: color.cream} as const;
	return (
		<div style={{display: 'flex', borderRadius: 4, overflow: 'hidden', fontFamily: 'Archivo'}}>
			<div style={{...half, gap: 6, paddingLeft: 7, background: color.ink}}>
				<svg width={16} height={16} viewBox="0 0 32 32">
					<path d="M16 3 26 16 16 29 6 16Z" fill={color.cream} />
					<path d="M16 11 20 16 16 21 12 16Z" fill={color.ink} />
				</svg>
				TifinaghBench
			</div>
			<div style={{...half, background: color.clay}}>{value}</div>
		</div>
	);
}

export function badges() {
	return runs
		.filter((run): run is Run & {score: NonNullable<Run['score']>} => run.score !== null)
		.map(run => ({path: badgePath(run.slug), node: <Badge run={run} />}));
}
