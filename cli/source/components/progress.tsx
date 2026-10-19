import React, {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import type {Progress} from '../bench/model.js';
import {addCost, addUsage, percent} from '../bench/results.js';

export function duration(seconds: number | null): string {
	if (seconds === null || !Number.isFinite(seconds)) return '—';
	return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
}

export default function ProgressScreen({progress}: {progress: Progress}) {
	const [tick, setTick] = useState(0);
	useEffect(() => {
		const timer = setInterval(() => setTick(value => value + 1), 1000);
		return () => clearInterval(timer);
	}, []);
	const [received, setReceived] = useState(Date.now());
	useEffect(() => {setReceived(Date.now());}, [progress]);
	useInput((input, key) => {
		if (key.ctrl && input === 'c') process.emit('SIGINT');
	});
	const elapsed = progress.elapsed_s + (progress.status === 'running' ? (Date.now() - received) / 1000 : 0);
	const filled = progress.total ? Math.round(progress.done / progress.total * 24) : 0;
	const tokens = addUsage([progress.tokens, progress.judge_tokens]);
	const cost = addCost([progress.cost_usd, progress.judge_cost_usd]);
	// tick keeps elapsed time moving while no question has finished.
	void tick;
	return (
		<Box flexDirection="column">
			<Text bold color="magenta">ⵜⵉⴼⵉⵏⴰⵖ tifinagh-bench · {progress.status}</Text>
			<Text color="cyan">{'█'.repeat(filled)}{'░'.repeat(24 - filled)} {progress.done}/{progress.total} questions done · {progress.answered} answered</Text>
			<Text>Sessions {progress.sessions.done}/{progress.sessions.total} (total grows as judging/retries are queued)</Text>
			<Text>Elapsed {duration(elapsed)} · ETA {duration(progress.eta_s === null ? null : Math.max(0, progress.eta_s - (elapsed - progress.elapsed_s)))}</Text>
			<Box flexDirection="column" marginY={1}>
				{Object.entries(progress.summary.by_dialect_and_task).map(([dialect, groups]) => (
					<Text key={dialect}>{dialect.padEnd(8)} {Object.entries(groups).map(([task, value]) => `${task}: ${percent(value.score)} (${value.scored})`).join(' · ')}</Text>
				))}
			</Box>
			<Text>Errors {progress.summary.overall.errors} · Tokens {tokens ? `${tokens.input} in / ${tokens.output} out${tokens.reasoning === undefined ? '' : ` / ${tokens.reasoning} reasoning`}` : 'unreported'} · Cost {cost === null ? 'unreported' : `$${cost.toFixed(4)} reported (judge included)`}</Text>
			<Box flexDirection="column" marginTop={1}>
				{progress.recent.map(item => (
					<Text key={item.id} wrap="truncate-end" color={item.error ? 'yellow' : item.grade === 'correct' ? 'green' : item.grade === 'partial' ? 'yellow' : 'red'}>
						{item.error ? '!' : item.grade === 'correct' ? '✔' : item.grade === 'partial' ? '½' : '✘'} {item.dialect}/{item.task} {item.input.replaceAll(/\s+/g, ' ')} → {(item.answer ?? item.error?.message ?? '').replaceAll(/\s+/g, ' ')}
					</Text>
				))}
			</Box>
			<Text dimColor>Ctrl+C to stop and save · again to exit immediately</Text>
		</Box>
	);
}
