import type {BenchConfig, Dialect, Task} from '../options.js';
import type {AskResult, HarnessInfo, Usage} from './types.js';

export type Entry = {
	id: number | string;
	word: string;
	latin: string;
	meaning: string;
	senses: string[];
};
export type Prompt = {system: string; prompt: string; schema: Record<string, unknown>};
export type Question = {
	id: string;
	dialect: Dialect;
	task: Task;
	entry: Entry;
	direction?: 'tif-to-latin' | 'latin-to-tif';
	input: string;
	expected: string[];
	expected_entry_ids?: Array<string | number>;
	request: Prompt;
};
export type DatasetInfo = {
	file: string;
	sha256: string;
	entries: number;
	sampled: number;
	skipped: number;
	skipped_by_task: Partial<Record<Task, number>>;
	unsupported_by_task: Partial<Record<Task, number>>;
};
export type Grade = 'correct' | 'partial' | 'wrong';
export type Item = {
	id: string;
	dialect: Dialect;
	task: Task;
	entry_id: string | number;
	direction?: Question['direction'];
	input: string;
	expected: string[];
	expected_entry_ids?: Array<string | number>;
	matched_entry_id?: string | number | null;
	/** Exact-match tasks: whether the answer also matched without spelling-convention folding. */
	strict?: boolean;
	answer: string | null;
	grade: Grade | null;
	score: number | null;
	cer?: number;
	scored_by: 'exact' | 'exact-sense' | 'empty' | 'judge' | null;
	batch_id: string | null;
	judge_batch_id: string | null;
	/** Monotonic batch sequence for crash recovery. */
	revision: number;
	judge_note?: string;
	latency_ms: number;
	attempts: number;
	tokens: Usage | null;
	cost_usd: number | null;
	judge: {attempts: number; tokens: Usage | null; cost_usd: number | null};
	error: {type: string; message: string} | null;
};
export type Aggregate = {
	score: number | null;
	correct: number;
	partial: number;
	wrong: number;
	errors: number;
	n: number;
	scored: number;
	mean_cer?: number;
};
export type Summary = {
	/** Official score in [0, 1]: equal-weight mean of the dialect × meaning-task cells, unanswered = 0. Null unless all dialects and both meaning tasks ran. */
	tifinaghbench: number | null;
	/** Same, for transliteration only. */
	script_score: number | null;
	/** Both scores again with exact matches required to use the dictionary's own spelling conventions. */
	tifinaghbench_strict: number | null;
	script_score_strict: number | null;
	/** Pooled accuracy over scored questions (errors excluded). */
	overall: Aggregate;
	by_task: Partial<Record<Task, Aggregate>>;
	by_dialect: Partial<Record<Dialect, Aggregate>>;
	by_dialect_and_task: Partial<Record<Dialect, Partial<Record<Task, Aggregate>>>>;
};
export type RunStatus = 'running' | 'completed' | 'cancelled' | 'failed' | 'limited' | 'dry-run';
export type RunInfo = {
	status: RunStatus;
	message: string | null;
	started_at: string;
	finished_at: string | null;
	duration_s: number;
	cli_version: string;
	harness: HarnessInfo | null;
	dataset: Partial<Record<Dialect, DatasetInfo>>;
	items: {total: number; done: number; scored: number; errors: number; pending: number; skipped: number};
	sessions: {done: number; total: number; answers: number; judge: number};
	answered: number;
	judge_skipped_by_exact_sense: number;
	tokens: Usage | null;
	cost_usd: number | null;
	judge: {info: HarnessInfo | null; items_judged: number; tokens: Usage | null; cost_usd: number | null};
};
export type Progress = {
	status: RunStatus;
	total: number;
	done: number;
	elapsed_s: number;
	eta_s: number | null;
	answered: number;
	sessions: RunInfo['sessions'];
	summary: Summary;
	tokens: Usage | null;
	cost_usd: number | null;
	judge_tokens: Usage | null;
	judge_cost_usd: number | null;
	recent: Item[];
};
export type RunResult = {config: BenchConfig; run: RunInfo; summary: Summary; items: Item[]};
export type BatchRecord = Prompt & {
	batch_id: string;
	sequence: number;
	kind: 'answer' | 'judge';
	id_map: Record<string, string>;
	attempts: Attempt[];
	raw_output: string | null;
	harness_transcript: unknown;
	issues: string[];
	valid_ids: string[];
	tokens: Usage | null;
	cost_usd: number | null;
	latency_ms: number;
	/** Durable item snapshots, replayed if a crash interrupts items.jsonl appends. */
	items: Item[];
};
export type Attempt = {
	request: Prompt;
	result?: AskResult;
	error?: {type: string; message: string};
};
