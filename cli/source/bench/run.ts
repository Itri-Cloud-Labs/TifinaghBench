import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {createHarness} from '../harnesses/index.js';
import {defaultDatasetDir} from '../datasets.js';
import type {BenchConfig, Harness} from '../options.js';
import {prepareQuestions} from './dataset.js';
import {groupQuestions, parseBatch} from './batch.js';
import {buildBatchPrompt} from './prompts.js';
import {judgeRequest, parseVerdict} from './judge.js';
import type {Attempt, BatchRecord, Item, Progress, Question, RunInfo, RunResult} from './model.js';
import {addCost, addUsage, openResults, report, summarize, writeJson} from './results.js';
import {askWithRetry, errorDetails, objectOutput} from './request.js';
import {normalizeEnglish, scoreExact} from './score.js';
import {HarnessError, type HarnessOptions, type HarnessSession, type Usage} from './types.js';

export type RunOptions = {
	factory?: (harness: Harness, options: HarnessOptions) => Promise<HarnessSession>;
	sessions?: {harness: HarnessSession; judge?: HarnessSession};
	signal?: AbortSignal;
	handleSigint?: boolean;
	dryRun?: boolean;
	onProgress?: (progress: Progress) => void;
	onLog?: (message: string) => void;
	/** Test injection; production backoff begins at 1 s and doubles. */
	retryDelayMs?: number;
};

function validateConfig(config: BenchConfig) {
	if (!Number.isSafeInteger(config.batchSize) || config.batchSize < 1) throw new Error('batchSize must be a positive integer.');
	if (!Number.isSafeInteger(config.concurrency) || config.concurrency < 1) throw new Error('concurrency must be a positive integer.');
	if (!Number.isFinite(config.timeout) || config.timeout <= 0 || config.timeout * 1000 > 2147483647) throw new Error('timeout must be positive and at most 2147483 seconds.');
	if (!Number.isSafeInteger(config.retries) || config.retries < 0) throw new Error('retries must be a nonnegative integer.');
	if (!Number.isSafeInteger(config.seed)) throw new Error('seed must be a safe integer.');
	if (config.sampleSize !== 'all' && (!/^\d+$/.test(config.sampleSize) || !Number.isSafeInteger(Number(config.sampleSize)) || Number(config.sampleSize) <= 0)) throw new Error('sampleSize must be a positive integer or all.');
	if (!config.tasks.length || !config.dialects.length) throw new Error('Select at least one dialect and task.');
	if (config.tasks.includes('tif-to-en') && !config.judge) throw new Error('Tifinagh → English requires a judge.');
}

function newItem(question: Question): Item {
	return {id: question.id, dialect: question.dialect, task: question.task,
		entry_id: question.entry.id, direction: question.direction, input: question.input,
		expected: question.expected, expected_entry_ids: question.expected_entry_ids,
		...(question.task === 'en-to-tif' ? {matched_entry_id: null} : {}),
		answer: null, grade: null, score: null, scored_by: null, batch_id: null, judge_batch_id: null, revision: 0,
		latency_ms: 0, attempts: 0, tokens: null, cost_usd: null,
		judge: {attempts: 0, tokens: null, cost_usd: null}, error: null};
}

// Integer token shares differ by at most one; the final cost share absorbs rounding.
function usageShare(usage: Usage | null, index: number, count: number): Usage | null {
	return usage === null ? null : Object.fromEntries(Object.entries(usage).map(([key, value]) =>
		[key, Math.floor(value / count) + (index < value % count ? 1 : 0)])) as Usage;
}
const costShare = (cost: number | null, index: number, count: number) => cost === null ? null
	: index === count - 1 ? cost - (cost / count) * (count - 1) : cost / count;

type Job = {kind: 'answer' | 'judge'; questions: Question[]; retry: number};

async function runBenchmarkInner(input: BenchConfig, options: RunOptions): Promise<RunResult> {
	const config: BenchConfig = {...input, batchSize: input.batchSize ?? 100, timeout: input.timeout ?? 600, retries: input.retries ?? 2,
		output: path.resolve(input.output), datasetDir: path.resolve(input.datasetDir ?? defaultDatasetDir)};
	validateConfig(config);
	const prepared = await prepareQuestions(config);
	const runFile = path.join(config.output, 'run.json');
	const prior: RunInfo | undefined = fs.existsSync(runFile) ? JSON.parse(fs.readFileSync(runFile, 'utf8')) as RunInfo : undefined;
	if (prior && Object.entries(prior.dataset).some(([key, info]) => prepared.dataset[key as keyof typeof prepared.dataset]?.sha256 !== info.sha256)) {
		throw new Error('Dataset checksum changed since the existing run; use a new --output folder.');
	}

	const storage = openResults(config);
	const questions = prepared.questions;
	const ids = new Set(questions.map(question => question.id));
	if ([...storage.items.keys()].some(id => !ids.has(id))) throw new Error('Existing items do not match the sampled questions.');
	const started = Date.now();
	const run: RunInfo = {status: 'running', message: null, started_at: new Date(started).toISOString(), finished_at: null,
		duration_s: 0, cli_version: (JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {version: string}).version,
		harness: prior?.harness ?? null, dataset: prepared.dataset, items: {total: 0, done: 0, scored: 0, errors: 0, pending: 0, skipped: 0},
		sessions: {done: 0, total: 0, answers: 0, judge: 0}, answered: 0, judge_skipped_by_exact_sense: 0,
		tokens: null, cost_usd: null, judge: {info: prior?.judge.info ?? null, items_judged: 0, tokens: null, cost_usd: null}};
	const controller = new AbortController();
	const cancel = () => {
		if (run.status === 'running') { run.status = 'cancelled'; run.message = 'Cancelled by user.'; }
		controller.abort(new Error('Run cancelled'));
	};
	options.signal?.addEventListener('abort', cancel, {once: true});
	if (options.signal?.aborted) cancel();
	const sessions: {harness?: HarnessSession; judge?: HarnessSession} = options.sessions ?? {};
	const scratch: string[] = [];
	const pending = questions.filter(question => storage.items.get(question.id)?.score == null || storage.items.get(question.id)?.error != null);
	const needsAnswer = pending.filter(question => storage.items.get(question.id)?.answer == null);
	const needsJudge = pending.filter(question => storage.items.get(question.id)?.answer != null);
	const queue: Job[] = [
		...groupQuestions(needsJudge, config).map(questions => ({kind: 'judge' as const, questions, retry: 0})),
		...groupQuestions(needsAnswer, config).map(questions => ({kind: 'answer' as const, questions, retry: 0})),
	];
	let active = 0;
	const previousSessions = storage.batches.length;
	let sequence = Math.max(0, ...storage.batches.map(batch => batch.sequence));
	let summary = summarize([...storage.items.values()], config);
	const refresh = () => {
		const items = [...storage.items.values()];
		summary = summarize(items, config);
		run.duration_s = (Date.now() - started) / 1000;
		const done = items.filter(item => item.score !== null && !item.error).length;
		run.items = {total: questions.length, done, scored: summary.overall.scored, errors: summary.overall.errors,
			pending: Math.max(0, questions.length - done), skipped: Object.values(run.dataset).reduce((sum, value) => sum + value.skipped, 0)};
		const answers = storage.batches.filter(batch => batch.kind === 'answer');
		const judges = storage.batches.filter(batch => batch.kind === 'judge');
		run.tokens = addUsage(answers.map(batch => batch.tokens));
		run.cost_usd = addCost(answers.map(batch => batch.cost_usd));
		run.judge.tokens = addUsage(judges.map(batch => batch.tokens));
		run.judge.cost_usd = addCost(judges.map(batch => batch.cost_usd));
		run.judge.items_judged = new Set(judges.flatMap(batch => Object.values(batch.id_map))).size;
		run.answered = items.filter(item => item.answer !== null).length;
		run.judge_skipped_by_exact_sense = items.filter(item => item.scored_by === 'exact-sense').length;
		run.sessions = {done: storage.batches.length, total: storage.batches.length + queue.length + active, answers: answers.length, judge: judges.length};
		options.onProgress?.({status: run.status, total: questions.length, done, answered: run.answered, sessions: run.sessions, elapsed_s: run.duration_s,
			eta_s: storage.batches.length > previousSessions ? (queue.length + active) * run.duration_s / (storage.batches.length - previousSessions) : null, summary, tokens: run.tokens, cost_usd: run.cost_usd, judge_tokens: run.judge.tokens, judge_cost_usd: run.judge.cost_usd, recent: items.slice(-5)});
	};
	const stop = (error: unknown, harness: Harness = config.harness) => {
		if (run.status !== 'running') return;
		if (error instanceof HarnessError && error.type === 'limit') {
			run.status = 'limited';
			run.message = `Usage limit reached (${harness}). Rerun the same command after it resets to resume.${error.resetAt ? ` Reset: ${error.resetAt}.` : ''}`;
		} else { run.status = 'failed'; run.message = errorDetails(error).message; }
		controller.abort(error);
	};
	const enqueue = (kind: Job['kind'], values: Question[], retry: number, priority = false) => {
		if (!values.length) return;
		const key = (question: Question) => `${question.dialect}/${question.task}/${question.direction ?? ''}`;
		const keys = new Set(values.map(key));
		// Fill queued retry/judge batches together when their group and retry budget agree.
		for (let index = queue.length - 1; index >= 0; index--) {
			const waiting = queue[index]!;
			if (waiting.kind === kind && waiting.retry === retry && keys.has(key(waiting.questions[0]!))) {
				values = [...values, ...waiting.questions];
				queue.splice(index, 1);
			}
		}
		const jobs = groupQuestions(values, config).map(questions => ({kind, questions, retry}));
		if (priority) queue.unshift(...jobs);
		else queue.push(...jobs);
	};
	try {
		refresh();
		writeJson(runFile, run);
		options.onLog?.(`Sessions ${run.sessions.done}/${run.sessions.total} · Answered ${run.answered}/${questions.length} questions · Scored ${run.items.scored}`);
		if (options.dryRun) {
			const batches = groupQuestions(questions, config).map((questions, index) => ({batch_id: `answer-${String(index + 1).padStart(6, '0')}`,
				id_map: Object.fromEntries(questions.map((question, index) => [String(index + 1), question.id])), ...buildBatchPrompt(questions)}));
			fs.writeFileSync(path.join(config.output, 'prompts.jsonl'), batches.map(batch => JSON.stringify(batch)).join('\n') + (batches.length ? '\n' : ''));
			const example = batches[0];
			if (example) options.onLog?.(`${example.batch_id}\nSystem: ${example.system}\n${example.prompt}`);
			run.status = controller.signal.aborted ? 'cancelled' : 'dry-run';
		} else if (pending.length && !controller.signal.aborted) {
			const factory = options.factory ?? createHarness;
			const open = async (harness: Harness, model: string, reasoning: BenchConfig['reasoning']) => {
				const workDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'tifinagh-bench-'));
				scratch.push(workDir);
				try { return await factory(harness, {model, reasoning, workDir}); }
				catch (error) { stop(error, harness); throw error; }
			};
			if (needsAnswer.length) {
				sessions.harness ??= await open(config.harness, config.model, config.reasoning);
				run.harness = sessions.harness.info;
			}
			// Judge creation does not ask the model; requests still use the common pool.
			if (config.judge) {
				sessions.judge ??= await open(config.judge.harness, config.judge.model, 'default');
				run.judge.info = sessions.judge.info;
			}

			writeJson(runFile, run);
			const processJob = async (job: Job) => {
				if (job.retry) await delay(Math.min(30000, (options.retryDelayMs ?? 1000) * 2 ** (job.retry - 1)), undefined, {signal: controller.signal});
				controller.signal.throwIfAborted();
				const seq = ++sequence;
				const batchId = `${job.kind}-${String(seq).padStart(6, '0')}`;
				const judge = job.kind === 'judge';
				const harness = judge ? config.judge!.harness : config.harness;
				const request = judge ? judgeRequest(job.questions.map(question => ({question, answer: storage.items.get(question.id)!.answer!}))) : buildBatchPrompt(job.questions);
				const idMap = Object.fromEntries(job.questions.map((question, index) => [String(index + 1), question.id]));
				const attempts: Attempt[] = [];
				const began = Date.now();
				let failure: unknown;
				try {
					await askWithRetry((judge ? sessions.judge : sessions.harness)!, request,
						{timeout: config.timeout, retries: 0, signal: controller.signal, retryDelayMs: 0}, attempts, () => {});
				} catch (error) { failure = error; }
				const result = attempts.at(-1)?.result;
				const parsed = parseBatch(result?.output, judge ? 'verdicts' : 'answers', new Set(Object.keys(idMap)), value => {
					if (judge) return parseVerdict(value);
					const row = objectOutput(value, ['id', 'answer']);
					if (typeof row.answer !== 'string') throw new Error('answer must be a string.');
					return row.answer;
				});
				// A rejected session can carry usage, but its output is not an answer.
				if (failure) parsed.valid.clear();
				const tokens = addUsage(attempts.map(attempt => attempt.result?.usage ?? null));
				const cost = addCost(attempts.map(attempt => attempt.result?.costUsd ?? null));
				const latency = result?.latencyMs ?? Date.now() - began;
				const retry: Question[] = [];
				const toJudge: Question[] = [];
				const snapshots = job.questions.map((question, index) => {
					const previous = storage.items.get(question.id);
					const item: Item = previous ? {...previous, judge: {...previous.judge}} : newItem(question);
					item.revision = seq;
					const target = judge ? item.judge : item;
					target.attempts++;
					target.tokens = addUsage([target.tokens, usageShare(tokens, index, job.questions.length)]);
					target.cost_usd = addCost([target.cost_usd, costShare(cost, index, job.questions.length)]);
					if (judge) item.judge_batch_id = batchId;
					else { item.batch_id = batchId; item.latency_ms = latency; }
					const value = parsed.valid.get(String(index + 1));
					if (value !== undefined) {
						item.error = null;
						if (judge) {
							const verdict = value as ReturnType<typeof parseVerdict>;
							Object.assign(item, {grade: verdict.verdict, score: {correct: 1, partial: 0.5, wrong: 0}[verdict.verdict], scored_by: 'judge', judge_note: verdict.note});
						} else {
							item.answer = value as string;
							if (question.task !== 'tif-to-en') Object.assign(item, scoreExact(question, item.answer));
							else if (!item.answer.trim()) Object.assign(item, {grade: 'wrong', score: 0, scored_by: 'empty', judge_note: 'Empty answer; no judge call.'});
							else if (question.expected.some(sense => normalizeEnglish(sense) === normalizeEnglish(item.answer!))) {
								Object.assign(item, {grade: 'correct', score: 1, scored_by: 'exact-sense'});
							} else {
								item.error = {type: 'pending-judge', message: 'Answer saved; awaiting judge.'};
								toJudge.push(question);
							}
						}
					} else {
						item.error = failure ? controller.signal.aborted ? {type: 'aborted', message: 'Run stopped; session interrupted.'} : errorDetails(failure)
							: {type: 'harness', message: `Missing, duplicate or unparseable ${judge ? 'verdict' : 'answer'} after attempt ${job.retry + 1}.`};
						const canRetry = !controller.signal.aborted && (!failure || failure instanceof HarnessError && failure.retryable)
							&& job.retry < (failure instanceof HarnessError && failure.type === 'limit' ? Math.min(2, config.retries) : config.retries);
						if (canRetry) retry.push(question);
					}
					return item;
				});
				const batch: BatchRecord = {batch_id: batchId, sequence: seq, kind: job.kind, id_map: idMap, ...request,
					raw_output: result?.rawText ?? null, harness_transcript: result?.transcript ?? null, attempts,
					issues: parsed.issues, valid_ids: [...parsed.valid.keys()], tokens, cost_usd: cost, latency_ms: latency, items: snapshots};
				storage.appendBatch(batch);
				if (failure && !controller.signal.aborted && (!(failure instanceof HarnessError) || !failure.retryable || failure.type === 'limit' && !retry.length)) stop(failure, harness);
				enqueue(job.kind, retry, job.retry + 1, failure instanceof HarnessError && failure.type === 'limit');
				enqueue('judge', toJudge, 0, true);
				for (const item of snapshots) {
					options.onLog?.(`${item.error ? '!' : item.grade === 'correct' ? '✔' : item.grade === 'partial' ? '½' : '✘'} ${item.id}: ${JSON.stringify(item.input)} → ${JSON.stringify(item.answer)}${item.error ? ` (${item.error.message})` : ''}`);
				}
			};
			const worker = async () => {
				while (!controller.signal.aborted && queue.length) {
					const job = queue.shift()!;
					active++;
					try { await processJob(job); }
					catch (error) { if (!controller.signal.aborted) stop(error, job.kind === 'judge' ? config.judge!.harness : config.harness); }
					finally {
						active--;
						refresh();
						writeJson(runFile, run);
						options.onLog?.(`Sessions ${run.sessions.done}/${run.sessions.total} · Answered ${run.answered}/${questions.length} questions · Scored ${run.items.scored}`);
					}
				}
			};
			await Promise.all(Array.from({length: Math.min(config.concurrency, queue.length)}, () => worker().catch(stop)));
		}
		if (!controller.signal.aborted && !options.dryRun) run.status = 'completed';
	} catch (error) {
		if (!controller.signal.aborted) stop(error);
	} finally {
		const closed = await Promise.allSettled([...new Set([sessions.harness, sessions.judge].filter((session): session is HarnessSession => Boolean(session)))].map(session => session.close()));
		for (const result of closed) if (result.status === 'rejected' && run.status !== 'limited' && run.status !== 'cancelled') {
			if (run.status === 'completed') run.status = 'running';
			stop(result.reason);
		}
		const removed = await Promise.allSettled(scratch.map(directory => fsp.rm(directory, {recursive: true, force: true})));
		for (const result of removed) if (result.status === 'rejected' && run.status !== 'limited' && run.status !== 'cancelled') {
			if (run.status === 'completed') run.status = 'running';
			stop(result.reason);
		}
		options.signal?.removeEventListener('abort', cancel);
		run.finished_at = new Date().toISOString();
		refresh();
		writeJson(runFile, run);
		writeJson(path.join(config.output, 'summary.json'), summary);
		fs.writeFileSync(path.join(config.output, 'report.md'), report(config, run, summary, [...storage.items.values()]));
		if (run.status === 'limited') options.onLog?.(run.message!);
	}

	return {config, run, summary, items: [...storage.items.values()]};
}

// Install signal handling before dataset I/O, so Ctrl+C during preflight also saves a cancelled run.
export async function runBenchmark(input: BenchConfig, options: RunOptions = {}): Promise<RunResult> {
	const controller = new AbortController();
	let interrupts = 0;
	const forward = () => controller.abort(options.signal?.reason ?? new Error('Run cancelled'));
	const sigint = () => {
		if (++interrupts > 1) process.exit(130);
		controller.abort(new Error('Run cancelled'));
	};
	if (options.handleSigint !== false) process.on('SIGINT', sigint);
	options.signal?.addEventListener('abort', forward, {once: true});
	if (options.signal?.aborted) forward();
	try { return await runBenchmarkInner(input, {...options, signal: controller.signal}); }
	finally {
		if (options.handleSigint !== false) process.off('SIGINT', sigint);
		options.signal?.removeEventListener('abort', forward);
	}
}
