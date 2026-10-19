import type {Harness, Reasoning} from '../options.js';

// Contract between the benchmark engine (source/bench/) and the harness adapters (source/harnesses/).

export type Usage = {
	input: number;
	output: number;
	/** Reasoning tokens when the harness reports them separately. */
	reasoning?: number;
	cachedInput?: number;
};

export type AskRequest = {
	/** Instructions for the model. Adapters send it as a system prompt where the SDK allows, otherwise prepend it to the prompt. */
	system: string;
	prompt: string;
	/** JSON schema of the object the model must return. Adapters use the SDK's structured output support. */
	schema: Record<string, unknown>;
	/** Aborted on timeout or when the user stops the run. Adapters must stop the request promptly. */
	signal: AbortSignal;
};

export type AskResult = {
	/** Parsed object matching `schema`, or null when the harness returned nothing parseable. */
	output: unknown;
	/** Final text the harness returned, before parsing. */
	rawText: string;
	usage: Usage | null;
	/** Cost reported by the harness, null when it does not report one. */
	costUsd: number | null;
	latencyMs: number;
	/** JSON-serialisable harness messages/events for transcripts/. */
	transcript: unknown;
};

export type HarnessErrorType = 'timeout' | 'aborted' | 'auth' | 'harness' | 'limit';

export class HarnessError extends Error {
	constructor(
		readonly type: HarnessErrorType,
		message: string,
		/** False for errors that will not go away on retry, such as missing auth or an unknown model. */
		readonly retryable = type !== 'auth' && type !== 'limit',
		readonly resetAt?: string,
		/** Returned spending/transcript, even if the session failed. */
		readonly result?: AskResult,
	) {
		super(message);
		this.name = 'HarnessError';
	}
}

export type HarnessInfo = {
	name: Harness;
	/** Version of the harness CLI/binary, null if it cannot be found. */
	version: string | null;
	sdk: {package: string; version: string};
	/** Settings actually applied (model, effort, sandbox, tools…), recorded in run.json. */
	settings: Record<string, unknown>;
};

export type HarnessOptions = {
	model: string;
	reasoning: Reasoning;
	/** Empty scratch folder to use as the working directory, so no project files or instructions are visible. */
	workDir: string;
};

/**
 * One harness configured for one model. Every `ask` is an independent conversation: no history,
 * no tools, no web access, no user/project instructions. `ask` may be called concurrently.
 */
export type HarnessSession = {
	readonly info: HarnessInfo;
	ask(request: AskRequest): Promise<AskResult>;
	close(): Promise<void>;
};
