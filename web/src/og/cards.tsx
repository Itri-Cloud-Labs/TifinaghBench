import type {CSSProperties, ReactNode} from 'react';
import {labPaths} from '../components/LabLogo';
import type {Lab} from '../data/models';
import type {Run} from '../data/runs';
import {rankedRuns, runs, siteUrl} from '../data/runs';
import type {Lang} from '../i18n';
import {formatters, languages, messagesFor} from '../i18n';
import {cardPath, cardSize} from './paths';

// Share images for link previews, drawn with Satori at build time (scripts/cards.mjs).
// Satori lays out with flexbox only, so every element that holds more than text sets display: flex.
const color = {slip: '#f5f5f2', ink: '#241a14', ink2: '#5a4c42', ink3: '#75675c', clay: '#9c3a22', cream: '#f7efe6', tile: '#e2e0d8', rule: '#dcd8cf'};
const host = new URL(siteUrl).host;

const row: CSSProperties = {display: 'flex', alignItems: 'center'};

function Mark({size}: {size: number}) {
	return (
		<svg width={size} height={size} viewBox="0 0 32 32">
			<rect width="32" height="32" rx="4" fill={color.clay} />
			<path d="M16 5 24 16 16 27 8 16Z" fill={color.cream} />
			<path d="M16 11 20 16 16 21 12 16Z" fill={color.clay} />
		</svg>
	);
}

function Logo({lab, size}: {lab: Lab; size: number}) {
	const d = labPaths[lab];
	return (
		<div style={{...row, justifyContent: 'center', width: size * 1.75, height: size * 1.75, borderRadius: 4, background: color.tile, flexShrink: 0}}>
			{d && <svg width={size} height={size} viewBox="0 0 24 24"><path d={d} fill={color.ink} fillRule="evenodd" /></svg>}
		</div>
	);
}

function Frame({children}: {children: ReactNode}) {
	return (
		<div style={{display: 'flex', flexDirection: 'column', width: cardSize.width, height: cardSize.height, boxSizing: 'border-box', padding: '56px 64px 48px', background: color.slip, color: color.ink, fontFamily: 'Archivo'}}>
			<div style={{...row, justifyContent: 'space-between'}}>
				<div style={{...row, gap: 14, fontSize: 30, fontWeight: 700, letterSpacing: '-0.01em'}}><Mark size={40} />TifinaghBench</div>
				<div style={{fontSize: 24, fontWeight: 600, color: color.ink2}}>{host}</div>
			</div>
			{children}
		</div>
	);
}

// The score on a 0–100 track, with the leader marked when it is someone else.
function Track({value, top, label}: {value: number; top: number | null; label: string | null}) {
	return (
		<div style={{display: 'flex', position: 'relative', width: '100%', height: 16, marginTop: 28, borderRadius: 3, background: color.tile}}>
			<div style={{width: `${value}%`, height: '100%', borderRadius: 3, background: color.clay}} />
			{top !== null && <div style={{position: 'absolute', left: `${top}%`, top: -9, width: 3, height: 34, background: color.ink}} />}
			{top !== null && label && <div style={{position: 'absolute', ...(top > 60 ? {right: `${100 - top}%`, marginRight: -2} : {left: `${top}%`, marginLeft: -2}), top: 32, fontSize: 21, fontWeight: 600, color: color.ink2, whiteSpace: 'nowrap'}}>{label}</div>}
		</div>
	);
}

function Fact({label, value, last}: {label: string; value: string; last?: boolean}) {
	return (
		<div style={{...row, justifyContent: 'space-between', padding: '20px 0', borderTop: `2px solid ${color.rule}`, borderBottom: last ? `2px solid ${color.rule}` : 'none'}}>
			<span style={{fontSize: 24, fontWeight: 600}}>{label}</span>
			<span style={{fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em'}}>{value}</span>
		</div>
	);
}

function ModelCard({run, lang}: {run: Run & {score: NonNullable<Run['score']>}; lang: Lang}) {
	const t = messagesFor(lang);
	const f = formatters(lang);
	const leader = rankedRuns()[0];
	const showLeader = leader && leader !== run && leader.score;
	const task = (name: 'tif-to-en' | 'en-to-tif') => run.summary.by_task[name]?.score;
	const meaning = task('tif-to-en');
	const writing = task('en-to-tif');
	return (
		<Frame>
			<div style={{display: 'flex', flex: 1, marginTop: 44, gap: 56}}>
				<div style={{display: 'flex', flexDirection: 'column', width: 580}}>
					<div style={{...row, gap: 18}}>
						<Logo lab={run.lab} size={30} />
						<div style={{display: 'flex', flexDirection: 'column'}}>
							<span style={{fontSize: 38, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.1}}>{run.name}</span>
							<span style={{fontSize: 22, fontWeight: 500, color: color.ink2, marginTop: 4}}>{t.home.reasoningLevel(t.reasoning[run.reasoning] ?? run.reasoning)}</span>
						</div>
					</div>
					<div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 18, marginLeft: -6}}>
						<span style={{fontSize: 184, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: color.clay}}>{f.score(run.score.value)}</span>
						<span style={{fontSize: 40, fontWeight: 600, color: color.ink3}}>{t.common.of100}</span>
					</div>
					<span style={{fontSize: 30, fontWeight: 700, marginTop: 6}}>
						{run.rank !== null ? t.model.rankOf(run.rank, rankedRuns().length) : t.card.unranked}
					</span>
					<Track
						value={run.score.value}
						top={showLeader ? leader.score!.value : null}
						label={showLeader ? t.card.top(leader.name, f.score(leader.score!.value)) : null}
					/>
				</div>
				<div style={{display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center'}}>
					{meaning != null && <Fact label={t.card.meaning} value={f.percent(meaning)} />}
					{writing != null && <Fact label={t.card.writing} value={f.percent(writing)} />}
					{run.script && <Fact label={t.card.script} value={f.score(run.script.value)} last />}
				</div>
			</div>
			<div style={{fontSize: 21, fontWeight: 500, color: color.ink3}}>{t.card.footer}</div>
		</Frame>
	);
}

// The card for every other page: the question, then the top of the board.
function SiteCard({lang}: {lang: Lang}) {
	const t = messagesFor(lang);
	const f = formatters(lang);
	const top = rankedRuns().filter(run => run.score).slice(0, 4);
	return (
		<Frame>
			<div style={{fontSize: 60, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05, marginTop: 40}}>{t.home.title}</div>
			<div style={{display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 16}}>
				{top.map(run => (
					<div key={run.slug} style={{...row, gap: 20}}>
						<span style={{width: 30, fontSize: 26, fontWeight: 600, color: color.ink3}}>{run.rank}</span>
						<Logo lab={run.lab} size={22} />
						<span style={{width: 330, fontSize: 30, fontWeight: 600}}>{run.name}</span>
						<div style={{display: 'flex', flex: 1, height: 14, borderRadius: 3, background: color.tile}}>
							<div style={{width: `${run.score!.value}%`, height: '100%', borderRadius: 3, background: color.clay}} />
						</div>
						<span style={{width: 92, textAlign: 'right', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em'}}>{f.score(run.score!.value)}</span>
					</div>
				))}
			</div>
			<div style={{fontSize: 21, fontWeight: 500, color: color.ink3}}>{t.card.footer}</div>
		</Frame>
	);
}

export {cardSize};

export function cards(): {path: string; node: ReactNode}[] {
	return languages.flatMap(lang => [
		{path: cardPath(lang), node: <SiteCard lang={lang} />},
		...runs
			.filter((run): run is Run & {score: NonNullable<Run['score']>} => run.score !== null)
			.map(run => ({path: cardPath(lang, run.slug), node: <ModelCard run={run} lang={lang} />})),
	]);
}
