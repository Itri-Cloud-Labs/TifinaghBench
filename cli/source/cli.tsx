#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App, {type Answers, needsJudge, toConfig} from './app.js';
import {countWords, defaultDatasetDir} from './datasets.js';
import {executeBenchmark} from './benchmark-ui.js';
import {exportPublic} from './bench/export.js';
import {rescore} from './bench/rescore.js';
import {
	type BenchConfig,
	type Choice,
	dialects,
	harnesses,
	reasoningChoices,
	tasks,
	validateModel,
} from './options.js';

const cli = meow(
	`
	Usage
	  $ tifinagh-bench

	Asks for missing settings, then runs a closed-book vocabulary benchmark.

	Options
	  --harness      codex | claude-code | opencode
	  --model        Model id, e.g. claude-opus-5-5 or anthropic/claude-sonnet-5-5
	  --dialects     Comma-separated: ircam, tarifit, kabyle
	  --reasoning    default | minimal | low | medium | high | xhigh | max (depends on harness)
	  --tasks        Comma-separated: tif-to-en, en-to-tif, transliterate
	  --judge-harness  Harness for the model that grades Tifinagh → English answers
	  --judge-model    Model id of the judge
	  --sample       Any positive integer | all (question choices: 50, 250, 1000, all)
	  --concurrency  Parallel sessions (answers and judge share the pool)
	  --batch-size   Words per session (positive integer, default 100)
	  --timeout      Seconds per session (default 600)
	  --retries      Retries after retryable failures (default 2)
	  --dry-run      Write sampled prompts without model calls
	  --output       Results folder (identical config resumes)
	  --seed         Seed for sampling words (default 1)
	  --dataset      Folder with the translated datasets
	  --yes, -y      Skip the review step
	  --rescore <folder>  Re-apply the current exact-match scoring to a finished run (no model calls)
	  --export-public <folder>  Copy a run's shareable results (scores, no dictionary content)
	                 to --output, or <folder>-public

	Examples
	  $ tifinagh-bench
	  $ tifinagh-bench --harness=claude-code --model=claude-opus-5-5 --dialects=ircam,kabyle
	  $ tifinagh-bench --export-public=results/2026-10-19-codex-gpt-6-luna
`,
	{
		importMeta: import.meta,
		flags: {
			harness: {type: 'string'},
			model: {type: 'string'},
			dialects: {type: 'string'},
			reasoning: {type: 'string'},
			tasks: {type: 'string'},
			judgeHarness: {type: 'string'},
			judgeModel: {type: 'string'},
			sample: {type: 'string'},
			concurrency: {type: 'number'},
			timeout: {type: 'number', default: 600},
			batchSize: {type: 'number', default: 100},
			retries: {type: 'number', default: 2},
			dryRun: {type: 'boolean', default: false},
			exportPublic: {type: 'string'},
			rescore: {type: 'string'},
			output: {type: 'string'},
			seed: {type: 'number', default: 1},
			dataset: {type: 'string', default: defaultDatasetDir},
			yes: {type: 'boolean', shortFlag: 'y', default: false},
		},
	},
);

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

function one<T extends string>(flag: string, value: string, choices: Array<Choice<T>>): T {
	const match = choices.find(choice => choice.value === value);
	if (!match) fail(`--${flag} must be one of ${choices.map(choice => choice.value).join(', ')}.`);
	return match.value;
}

function many<T extends string>(flag: string, value: string, choices: Array<Choice<T>>): T[] {
	const values = value.split(',').map(item => item.trim()).filter(Boolean);
	if (values.length === 0) fail(`--${flag} needs at least one value.`);
	return [...new Set(values.map(item => one(flag, item, choices)))];
}

const {flags} = cli;

if (flags.rescore !== undefined) {
	try {
		const {changed, total} = rescore(flags.rescore);
		console.log(`Rescored ${flags.rescore}: ${changed} of ${total} scores changed. summary.json and report.md updated.`);
		process.exit(0);
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
}

if (flags.exportPublic !== undefined) {
	try {
		console.log(`Public results written to ${exportPublic(flags.exportPublic, flags.output)}`);
		process.exit(0);
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
}
const initial: Answers = {};
if (flags.harness !== undefined) initial.harness = one('harness', flags.harness, harnesses);
if (flags.model !== undefined) {
	const problem = initial.harness && validateModel(initial.harness, flags.model);
	if (problem) fail(problem);
	initial.model = flags.model.trim();
}

if (flags.dialects !== undefined) initial.dialects = many('dialects', flags.dialects, dialects);
if (flags.reasoning !== undefined) {
	const allowed = initial.harness
		? reasoningChoices(initial.harness)
		: harnesses.flatMap(harness => reasoningChoices(harness.value));
	initial.reasoning = one('reasoning', flags.reasoning, allowed);
}

if (flags.tasks !== undefined) initial.tasks = many('tasks', flags.tasks, tasks);
if (flags.judgeHarness !== undefined) {
	initial.judgeHarness = one('judge-harness', flags.judgeHarness, harnesses);
}

if (flags.judgeModel !== undefined) {
	const problem = initial.judgeHarness && validateModel(initial.judgeHarness, flags.judgeModel);
	if (problem) fail(`--judge-model: ${problem}`);
	initial.judgeModel = flags.judgeModel.trim();
}

if (flags.sample !== undefined) {
	if (flags.sample !== 'all' && (!/^\d+$/.test(flags.sample) || !Number.isSafeInteger(Number(flags.sample)) || Number(flags.sample) < 1)) {
		fail('--sample must be a positive integer or all.');
	}

	initial.sampleSize = flags.sample === 'all' ? 'all' : String(Number(flags.sample)) as `${number}`;
}
if (!Number.isSafeInteger(flags.batchSize) || flags.batchSize < 1) fail('--batch-size must be a positive integer.');
if (!Number.isSafeInteger(flags.seed)) fail('--seed must be a safe integer.');
if (!Number.isFinite(flags.timeout) || flags.timeout <= 0 || flags.timeout * 1000 > 2147483647) fail('--timeout must be positive and at most 2147483 seconds.');
if (!Number.isSafeInteger(flags.retries) || flags.retries < 0) fail('--retries must be a nonnegative whole number.');
if (flags.concurrency !== undefined) {
	if (!Number.isSafeInteger(flags.concurrency) || flags.concurrency < 1) {
		fail('--concurrency must be a positive whole number.');
	}

	initial.concurrency = flags.concurrency;
}

if (flags.output !== undefined) initial.output = flags.output;

// Answers that depend on a harness are only prefilled until that harness is given.
const locked = new Set(
	(Object.keys(initial) as Array<keyof Answers>).filter(key => {
		if (key === 'model' || key === 'reasoning') return initial.harness !== undefined;
		if (key === 'judgeModel') return initial.judgeHarness !== undefined;
		return true;
	}),
);
const required: Array<keyof Answers> = [
	'harness',
	'model',
	'dialects',
	'reasoning',
	'tasks',
	'judgeHarness',
	'judgeModel',
	'sampleSize',
	'concurrency',
	'output',
];
const missing = required.filter(
	key =>
		!locked.has(key) &&
		(needsJudge(initial) || (key !== 'judgeHarness' && key !== 'judgeModel')),
);

async function start(config: BenchConfig) {
	try {
		await executeBenchmark({...config, timeout: flags.timeout, batchSize: flags.batchSize, retries: flags.retries, datasetDir: flags.dataset}, {dryRun: flags.dryRun});
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
}

if (missing.length === 0 && flags.yes) {
	await start(toConfig(initial as Required<Answers>, flags.seed));
} else if (!process.stdin.isTTY) {
	const names: Record<keyof Answers, string> = {
		harness: 'harness',
		model: 'model',
		dialects: 'dialects',
		reasoning: 'reasoning',
		tasks: 'tasks',
		judgeHarness: 'judge-harness',
		judgeModel: 'judge-model',
		sampleSize: 'sample',
		concurrency: 'concurrency',
		output: 'output',
	};
	fail(
		missing.length > 0
			? `not a terminal, so pass ${missing.map(key => `--${names[key]}`).join(', ')}.`
			: 'not a terminal, so pass --yes to skip the review.',
	);
} else {
	const app = render(
		<App
			initial={initial}
			locked={locked}
			seed={flags.seed}
			wordCounts={countWords(flags.dataset)}
			batchSize={flags.batchSize}
		/>,
	);
	const config = (await app.waitUntilExit()) as BenchConfig | undefined;
	if (config) await start(config);
	else console.log('Cancelled.');
}
