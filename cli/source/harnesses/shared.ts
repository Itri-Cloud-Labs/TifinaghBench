import {execFile} from 'node:child_process';
import {constants} from 'node:fs';
import {access, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {delimiter, dirname, join, resolve} from 'node:path';
import {promisify} from 'node:util';
import {HarnessError} from '../bench/types.js';
import type {AskRequest, AskResult} from '../bench/types.js';

const exec = promisify(execFile);

export async function sdkInfo(name: string) {
	let directory = dirname(fileURLToPath(import.meta.resolve(name)));
	for (;;) {
		try {
			const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
			if (pkg.name === name) return {package: name, version: String(pkg.version)};
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		}
		const parent = dirname(directory);
		if (parent === directory) throw new HarnessError('harness', `Cannot find ${name}/package.json`, false);
		directory = parent;
	}
}

export async function findBinary(name: string, fallbackDirectories: readonly string[] = []): Promise<string | null> {
	for (const directory of [...(process.env['PATH'] ?? '').split(delimiter), ...fallbackDirectories]) {
		const candidate = join(directory || '.', process.platform === 'win32' ? `${name}.exe` : name);
		try {
			await access(candidate, constants.X_OK);
			return resolve(candidate);
		} catch {}
	}
	return null;
}

export async function cliVersion(binary: string, env?: NodeJS.ProcessEnv): Promise<string | null> {
	try {
		const {stdout} = await exec(binary, ['--version'], {timeout: 5000, env});
		return stdout.trim() || null;
	} catch {
		return null;
	}
}

export function parseObject(text: string): unknown {
	try {
		const value: unknown = JSON.parse(text.trim().replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i, '$1'));
		return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
	} catch {
		return null;
	}
}

/** Include structured status/cause fields, including non-enumerable Error properties. */
export function errorMessage(error: unknown): string {
	if (typeof error === 'string') return error;
	const seen = new WeakSet<object>();
	try {
		return JSON.stringify(error, (_key, value: unknown) => {
			if (value && typeof value === 'object') {
				if (seen.has(value)) return '[circular]';
				seen.add(value);
				if (value instanceof Error) return Object.fromEntries(Object.getOwnPropertyNames(value).filter(key => key !== 'stack').map(key => [key, (value as unknown as Record<string, unknown>)[key]]));
			}
			return value;
		}) ?? String(error);
	} catch { return String(error); }
}

function resetTime(error: unknown): string | undefined {
	const message = errorMessage(error).replaceAll('\\"', '"');
	const numeric = /["']?(?:resetsAt|resets_at|resetAt|reset_at)["']?\s*[:=]\s*(\d+(?:\.\d+)?)/i.exec(message);
	if (numeric) {
		const time = Number(numeric[1]);
		const date = new Date(time < 1e12 ? time * 1000 : time);
		if (Number.isFinite(date.getTime())) return date.toISOString();
	}

	return /["']?(?:resetsAt|resets_at|resetAt|reset_at)["']?\s*[:=]\s*["']([^"']+)["']/i.exec(message)?.[1]
		?? /\bresets?\s+(?:at\s+|on\s+|in\s+)?([^\n"}]+)/i.exec(message)?.[1]?.trim();
}

export function harnessError(error: unknown, signal?: AbortSignal): HarnessError {
	if (signal?.aborted) {
		const message = errorMessage(signal.reason ?? 'Request aborted');
		const type = /timeout/i.test(message) || (signal.reason instanceof Error && signal.reason.name === 'TimeoutError') ? 'timeout' : 'aborted';
		return new HarnessError(type, message, type === 'timeout');
	}
	if (error instanceof HarnessError) return error;
	const message = errorMessage(error);
	const planLimit = /usage[_ -]limit[_ -](?:reached|exceeded)|quota[_ -](?:exceeded|exhausted)|insufficient_quota|(?:usage|plan|subscription|spend|credit).{0,30}(?:limit|exhausted|depleted|reached)|(?:hit|reached).{0,30}(?:usage|limit)|out of (?:extra usage|usage|credits)|credits_required|usage_not_included|workspace_(?:owner|member)_usage_limit_reached|your seat type|usage allocation.{0,30}disabled|group.s usage limit/i.test(message);
	const rejectedPlan = /rate_limit_event|rate_limit_info/i.test(message) && /["'](?:status|overageStatus)["']\s*:\s*["']rejected["']/i.test(message);
	const rateLimit = /\b429\b|rate[_ -]?limit(?:[_ -](?:error|exceeded|reached))?|RateLimitError/i.test(message);
	if (planLimit || rejectedPlan || rateLimit) {
		// Bare provider 429s can be short-lived; exhausted retries still stop as limited.
		return new HarnessError('limit', message, !planLimit && !rejectedPlan, resetTime(error));
	}
	if (/\b(401|403)\b|unauthori[sz]ed|authentication|not (?:logged|signed) in|invalid.{0,20}(?:api.?key|token)|(?:api.?key|credentials?).{0,30}(?:missing|required|invalid|not found)|(?:missing|required|invalid).{0,30}(?:api.?key|credentials?)|(?:oauth|access|auth).{0,20}token.{0,20}(?:expired|revoked)|ProviderAuthError|please (?:log|sign) in|(?:run|use).{0,15}(?:codex login|claude auth|\/login)/i.test(message)) {
		return new HarnessError('auth', message, false);
	}
	if (/ENOENT|not found.{0,30}(?:model|binary|executable)|(?:unknown|invalid|unsupported|unavailable|nonexistent|non-existent|no such).{0,30}model|model.{0,80}(?:not found|does not exist|not exist|not supported|not available|do not have access)|ModelNotFound|provider.{0,30}not found|(?:unsupported|invalid).{0,30}(?:reasoning|effort)|(?:reasoning|effort).{0,40}(?:not supported|not available)|\b404\b/i.test(message)) {
		return new HarnessError('harness', message, false);
	}
	return new HarnessError('harness', message);
}

/** Own active requests so close() also cancels and drains concurrent asks. */
export function lifecycle() {
	const closing = new AbortController();
	const pending = new Set<Promise<AskResult>>();
	let closePromise: Promise<void> | undefined;
	return {
		run(request: AskRequest, operation: (signal: AbortSignal) => Promise<AskResult>): Promise<AskResult> {
			if (closing.signal.aborted) return Promise.reject(new HarnessError('harness', 'Harness session is closed', false));
			const signal = AbortSignal.any([request.signal, closing.signal]);
			const promise = (async () => {
				try {
					signal.throwIfAborted();
					const result = await operation(signal);
					signal.throwIfAborted();
					return result;
				} catch (error) {
					throw harnessError(error, signal);
				}
			})();
			pending.add(promise);
			void promise.finally(() => pending.delete(promise)).catch(() => {});
			return promise;
		},
		close(dispose: () => Promise<void> = async () => {}): Promise<void> {
			closePromise ??= (async () => {
				closing.abort(new Error('Harness session closed'));
				await Promise.allSettled([...pending]);
				await dispose();
			})();
			return closePromise;
		},
	};
}
