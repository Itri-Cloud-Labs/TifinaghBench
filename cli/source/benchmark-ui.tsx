import React from 'react';
import {render} from 'ink';
import type {BenchConfig} from './options.js';
import ProgressScreen from './components/progress.js';
import {runBenchmark, type RunOptions} from './bench/run.js';
import type {RunStatus} from './bench/model.js';
import {benchScore, percent, summaryTable} from './bench/results.js';

export const benchmarkExitCode = (status: RunStatus): number => status === 'limited' ? 3 : status === 'failed' ? 1 : status === 'cancelled' ? 130 : 0;

export async function executeBenchmark(config: BenchConfig, options: RunOptions = {}, tty = Boolean(process.stdout.isTTY && process.stdin.isTTY)) {
	let screen: ReturnType<typeof render> | undefined;
	try {
		const result = await runBenchmark(config, {
			...options,
			onProgress(progress) {
				options.onProgress?.(progress);
				if (!tty || options.dryRun) return;
				const view = <ProgressScreen progress={progress}/>;
				if (screen) screen.rerender(view);
				else screen = render(view, {exitOnCtrlC: false});
			},
			onLog(message) {
				options.onLog?.(message);
				if (!tty || options.dryRun) console.log(message);
			},
		});
		screen?.unmount();
		screen = undefined;
		console.log(`\n${result.run.status}${result.run.message ? `: ${result.run.message}` : ''}`);
		console.log(summaryTable(result.config, result.summary));
		console.log(`TifinaghBench ${benchScore(result.summary.tifinaghbench)} · Script ${benchScore(result.summary.script_score)} · Pooled ${percent(result.summary.overall.score)} · ${result.run.items.scored} scored · ${result.run.items.errors} errors · ${result.run.items.skipped} skipped`);
		console.log(`Results: ${result.config.output}`);
		process.exitCode = benchmarkExitCode(result.run.status);
		return result;
	} finally {
		screen?.unmount();
	}
}
