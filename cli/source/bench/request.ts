import {setTimeout as delay} from 'node:timers/promises';
import {HarnessError, type AskResult, type HarnessSession} from './types.js';
import type {Attempt, Prompt} from './model.js';

export function errorDetails(error: unknown): {type: string; message: string} {
	return {type: error instanceof HarnessError ? error.type : 'harness', message: error instanceof Error ? error.message : String(error)};
}

export function objectOutput(output: unknown, keys: string[]): Record<string, unknown> {
	if (!output || typeof output !== 'object' || Array.isArray(output) ||
		Object.keys(output).length !== keys.length || !keys.every(key => key in output)) {
		throw new HarnessError('harness', 'Harness returned invalid structured output.');
	}

	return output as Record<string, unknown>;
}

export async function askWithRetry(
	session: HarnessSession, request: Prompt, options: {timeout: number; retries: number; signal: AbortSignal; retryDelayMs: number},
	attempts: Attempt[], validate: (result: AskResult) => void,
): Promise<AskResult> {
	for (let attempt = 0; ; attempt++) {
		options.signal.throwIfAborted();
		const controller = new AbortController();
		const forward = () => controller.abort(options.signal.reason);
		options.signal.addEventListener('abort', forward, {once: true});
		const timer = setTimeout(() => controller.abort(new Error(`timeout after ${options.timeout} s`)), options.timeout * 1000);
		const record: Attempt = {request};
		attempts.push(record);
		let rejectAbort: (() => void) | undefined;
		try {
			const aborted = new Promise<never>((_resolve, reject) => {
				rejectAbort = () => reject(new HarnessError(options.signal.aborted ? 'aborted' : 'timeout',
					controller.signal.reason instanceof Error ? controller.signal.reason.message : String(controller.signal.reason)));
				controller.signal.addEventListener('abort', rejectAbort, {once: true});
			});
			record.result = await Promise.race([session.ask({...request, signal: controller.signal}), aborted]);
			validate(record.result);
			return record.result;
		} catch (error) {
			if (error instanceof HarnessError && error.result) record.result = error.result;
			record.error = errorDetails(error);
			if (options.signal.aborted || !(error instanceof HarnessError) || !error.retryable || attempt >= options.retries) throw error;
		} finally {
			clearTimeout(timer);
			options.signal.removeEventListener('abort', forward);
			if (rejectAbort) controller.signal.removeEventListener('abort', rejectAbort);
		}

		await delay(Math.min(30000, options.retryDelayMs * 2 ** attempt), undefined, {signal: options.signal});
	}
}
