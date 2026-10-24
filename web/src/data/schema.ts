import {z} from 'zod';

export const dialects = ['ircam', 'tarifit', 'kabyle'] as const;
export const tasks = ['tif-to-en', 'en-to-tif', 'transliterate'] as const;
export const meaningTasks = ['tif-to-en', 'en-to-tif'] as const;
export type Dialect = (typeof dialects)[number];
export type Task = (typeof tasks)[number];

const cell = z.object({
	score: z.number().nullable(),
	correct: z.number().int().nonnegative(),
	partial: z.number().int().nonnegative(),
	wrong: z.number().int().nonnegative(),
	errors: z.number().int().nonnegative(),
	n: z.number().int().nonnegative(),
	scored: z.number().int().nonnegative(),
	mean_cer: z.number().optional(),
});
export type Cell = z.infer<typeof cell>;

const byTask = z.record(z.enum(tasks), cell);

export const summarySchema = z.object({
	tifinaghbench: z.number().nullable(),
	script_score: z.number().nullable(),
	tifinaghbench_strict: z.number().nullable(),
	script_score_strict: z.number().nullable(),
	overall: cell,
	by_task: byTask,
	by_dialect: z.record(z.enum(dialects), cell),
	by_dialect_and_task: z.record(z.enum(dialects), byTask),
});
export type Summary = z.infer<typeof summarySchema>;

export const configSchema = z.object({
	harness: z.enum(['codex', 'claude-code', 'opencode']),
	model: z.string().min(1),
	dialects: z.array(z.enum(dialects)),
	reasoning: z.string(),
	tasks: z.array(z.enum(tasks)),
	sampleSize: z.string(),
	judge: z.object({harness: z.string(), model: z.string()}).nullable().optional(),
	seed: z.number().int(),
	batchSize: z.number().int(),
	retries: z.number().int().optional(),
	timeout: z.number().optional(),
	concurrency: z.number().int().optional(),
});
export type Config = z.infer<typeof configSchema>;

const tokens = z.object({
	input: z.number(),
	output: z.number(),
	reasoning: z.number(),
	cachedInput: z.number(),
});

export const runSchema = z.object({
	status: z.string(),
	started_at: z.string(),
	finished_at: z.string().nullable(),
	duration_s: z.number().nullable().optional(),
	cli_version: z.string().optional(),
	harness: z.object({
		name: z.string(),
		version: z.string().nullable().optional(),
		sdk: z.object({package: z.string(), version: z.string().nullable()}).optional(),
	}),
	dataset: z.record(z.string(), z.object({
		file: z.string(),
		sha256: z.string(),
		entries: z.number(),
		sampled: z.number(),
	})),
	sessions: z.object({done: z.number(), total: z.number(), answers: z.number(), judge: z.number()}),
	tokens,
	cost_usd: z.number().nullable(),
	judge: z.object({
		items_judged: z.number(),
		tokens,
		cost_usd: z.number().nullable(),
	}).nullable().optional(),
});
export type RunInfo = z.infer<typeof runSchema>;
