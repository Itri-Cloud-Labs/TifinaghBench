import {OpenCode} from '@opencode-ai/client';
import type {SessionMessageAssistant, SessionMessageInfo} from '@opencode-ai/client';
import {spawn} from 'node:child_process';
import {access, mkdtemp, rm} from 'node:fs/promises';
import {homedir, tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {setTimeout as delay} from 'node:timers/promises';
import {HarnessError} from '../bench/types.js';
import type {HarnessOptions, HarnessSession} from '../bench/types.js';
import {cliVersion, findBinary, harnessError, lifecycle, parseObject, sdkInfo} from './shared.js';

// V2 stores provider credentials in SQLite. Read only this table, never launch
// a server against the user's database or copy their conversations.
function credentials(path: string) {
	const database = new DatabaseSync(path, {readOnly: true});
	try {
		return database.prepare('SELECT id, integration_id, label, value, connector_id, method_id, active, time_created, time_updated FROM credential').all();
	} finally {
		database.close();
	}
}

function failure(error: unknown, signal?: AbortSignal): HarnessError {
	// The HTTP SDK's UnexpectedStatus/Transport errors keep the useful status
	// or underlying failure in cause, rather than in their generic message.
	return harnessError(error instanceof Error && error.cause !== undefined ? {message: error.message, cause: error.cause} : error, signal);
}

export async function createOpencode(options: HarnessOptions): Promise<HarnessSession> {
	const binary = await findBinary('opencode', [join(homedir(), '.opencode', 'bin')]);
	if (!binary) throw new HarnessError('harness', 'OpenCode CLI not found on PATH or in ~/.opencode/bin. Install OpenCode 2.x and configure provider authentication.', false);
	const slash = options.model.indexOf('/');
	if (slash < 1 || slash === options.model.length - 1) throw new HarnessError('harness', 'OpenCode model must be provider/model.', false);
	if (!['default', 'low', 'medium', 'high'].includes(options.reasoning)) throw new HarnessError('harness', `OpenCode does not support ${options.reasoning} effort in this adapter.`, false);
	const variant = options.reasoning === 'default' ? undefined : options.reasoning;
	const model = {providerID: options.model.slice(0, slash), id: options.model.slice(slash + 1), ...(variant === undefined ? {} : {variant})};
	const directory = await mkdtemp(join(tmpdir(), 'tifinagh-opencode-'));
	const data = join(directory, 'data', 'opencode', 'opencode.db');
	const permissions = [{action: '*', resource: '*', effect: 'deny'}];
	// V2 implements even providers and config readers as plugins. Console/policy
	// are guarded by OpenCode; retain only model/catalog and our agent config too.
	const plugins = ['-*', 'opencode.models.dev', 'opencode.provider.*', 'opencode.config.agent', 'opencode.config.compaction', 'opencode.config.snapshot'];
	const config = {
		model: options.model, default_agent: 'benchmark', permissions,
		plugins, mcp: {}, skills: [], instructions: [],
		policies: [{action: 'tool.use', resource: '*', effect: 'deny'}, {action: 'integration.use', resource: '*', effect: 'deny'}],
		share: 'disabled', snapshots: false, update: 'disable', warming: false,
		formatter: false, lsp: false, compaction: {auto: false},
		agents: {
			benchmark: {mode: 'primary', system: 'Answer the user directly using only your existing knowledge.', permissions},
			title: {disabled: true}, summary: {disabled: true},
		},
	};
	const environment: NodeJS.ProcessEnv = {
		...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('OPENCODE_') || key === 'OPENCODE_API_KEY')),
		HOME: directory, XDG_CONFIG_HOME: join(directory, 'config'), XDG_DATA_HOME: join(directory, 'data'),
		XDG_STATE_HOME: join(directory, 'state'), XDG_CACHE_HOME: join(directory, 'cache'),
		OPENCODE_CONFIG_DIR: join(directory, 'config', 'opencode'),
		OPENCODE_CONFIG_CONTENT: JSON.stringify(config),
		OPENCODE_DISABLE_PROJECT_CONFIG: 'true', OPENCODE_DISABLE_CLAUDE_CODE: 'true',
		OPENCODE_DISABLE_AUTOUPDATE: 'true', OPENCODE_DISABLE_FILEWATCHER: 'true', OPENCODE_DISABLE_FFF: 'true',
	};
	let stop: () => Promise<void> = () => rm(directory, {recursive: true, force: true});
	try {
		// Even --version initializes OpenCode's logger. Isolate that process too.
		const [version, sdk] = await Promise.all([cliVersion(binary, environment), sdkInfo('@opencode-ai/client')]);
		// The 2.x API is still a prerelease: accept any 2.x, and run.json records the version tested against.
		if (!version || !/^(?:opencode v)?2\.\d+\.\d+$/.test(version)) throw new HarnessError('harness', `This adapter requires OpenCode 2.x; found ${version ?? 'an unknown version'}.`, false);
		const source = join(process.env['XDG_DATA_HOME'] ?? join(homedir(), '.local', 'share'), 'opencode', 'opencode.db');
		let stored: ReturnType<typeof credentials> = [];
		try {
			await access(source);
			stored = credentials(source);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		}
		// The in-process SDK would run another OpenCode version. Use the installed
		// binary with the official HTTP client, in its own HOME and all XDG roots.
		const server = spawn(binary, ['serve', '--hostname=127.0.0.1', '--port=0'], {cwd: options.workDir, env: environment, stdio: ['ignore', 'pipe', 'pipe']});
		let serverOutput = '';
		let stopPromise: Promise<void> | undefined;
		let exited = false;
		const stopped = new AbortController();
		server.once('exit', () => { exited = true; stopped.abort(new Error('OpenCode server exited')); });
		server.once('error', () => { exited = true; stopped.abort(new Error('OpenCode server failed')); });
		stop = () => {
			stopPromise ??= (async () => {
				if (!exited) {
					await new Promise<void>(resolve => {
						const timer = setTimeout(() => server.kill('SIGKILL'), 2000);
						server.once('exit', () => { clearTimeout(timer); resolve(); });
						server.kill('SIGTERM');
					});
				}
				await rm(directory, {recursive: true, force: true});
			})();
			return stopPromise;
		};
		const {url, password} = await new Promise<{url: string; password: string}>((resolve, reject) => {
			const diagnostic = () => serverOutput.replace(/server password\s+\S+/g, 'server password [redacted]');
			const timer = setTimeout(() => fail(new Error(`OpenCode server startup timed out. ${diagnostic()}`)), 30000);
			const fail = (error: Error) => { clearTimeout(timer); reject(error); };
			server.once('error', fail);
			server.once('exit', code => fail(new Error(`OpenCode server exited (${code}). ${diagnostic()}`)));
			const collect = (chunk: Buffer) => {
				serverOutput = (serverOutput + chunk.toString()).slice(-8000);
				// Both complete lines are required; pipe chunks can split either line.
				const listening = /(?:opencode )?server listening on\s+(http:\/\/127\.0\.0\.1:\d+)\r?\n/.exec(serverOutput);
				const secret = /server password\s+([^\s]+)\r?\n/.exec(serverOutput);
				if (listening && secret) { clearTimeout(timer); resolve({url: listening[1]!, password: secret[1]!}); }
			};
			server.stdout.on('data', collect);
			server.stderr.on('data', collect);
		});
		// Startup initialized the isolated schema. Import credentials before the
		// first API request activates provider caches. The beta client has no
		// credential.create endpoint; only this private database is written.
		const database = new DatabaseSync(data);
		try {
			const insert = database.prepare('INSERT INTO credential (id, integration_id, label, value, connector_id, method_id, active, time_created, time_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
			for (const row of stored) insert.run(row.id!, row.integration_id!, row.label!, row.value!, row.connector_id!, row.method_id!, row.active!, row.time_created!, row.time_updated!);
		} finally {
			database.close();
		}
		stored = [];
		const client = OpenCode.make({baseUrl: url, headers: {Authorization: `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}`}});
		const startupSignal = AbortSignal.any([stopped.signal, AbortSignal.timeout(30000)]);
		let catalog = await client.model.list(undefined, {signal: startupSignal});
		let selected = catalog.data.find(entry => entry.providerID === model.providerID && entry.id === model.id);
		// A fresh data/cache root initially serves the bundled catalog while the
		// current catalog downloads. New free models may appear only after refresh.
		const refreshDeadline = performance.now() + 5000;
		while (!selected && performance.now() < refreshDeadline) {
			await delay(250, undefined, {signal: startupSignal});
			catalog = await client.model.list(undefined, {signal: startupSignal});
			selected = catalog.data.find(entry => entry.providerID === model.providerID && entry.id === model.id);
		}
		if (!selected) throw new HarnessError('harness', `OpenCode model not found: ${options.model}`, false);
		if (!selected.enabled) throw new HarnessError('auth', `OpenCode model ${options.model} is disabled or has no provider credentials.`, false);
		if (variant !== undefined && !selected.variants.some(entry => entry.id === variant)) throw new HarnessError('harness', `OpenCode model ${options.model} does not support reasoning variant ${variant}.`, false);
		const active = lifecycle();
		return {
			info: {
				name: 'opencode', version, sdk,
				settings: {
					testedWith: 'opencode v2.0.32',
					config, binary, model, directory: options.workDir,
					server: {url, startupTimeoutMs: 30000, authentication: 'HTTP Basic; printed server password'},
					reasoningMapping: 'low/medium/high select the same named model variant, validated against /api/model; default leaves variant unset.',
					structuredOutput: 'JSON schema in prompt; shared parseObject (V2 session API has no native output schema).',
					systemPrompt: 'Prepended to user prompt; custom benchmark agent replaces the built-in agent prompt.',
					isolatedHome: true, isolatedConfig: true, isolatedData: true,
					credentials: 'Only credential rows copied read-only from user SQLite into private temporary data; provider environment variables retained.',
					sessionPersistence: 'Fresh session per ask; deleted in finally; isolated database removed on close.',
					plugins: 'All optional plugins disabled; built-in provider/catalog/config components retained; Console/policy are guarded by OpenCode.',
					instructionIsolation: 'Project discovery disabled; instruction/skill/MCP/tool plugins disabled; isolated HOME and all XDG roots. OpenCode still supplies built-in date/environment context.',
				},
			},
			ask(request) {
				return active.run(request, async requestSignal => {
					const signal = AbortSignal.any([requestSignal, stopped.signal]);
					const start = performance.now();
					let sessionID: string | undefined;
					let abortTask: Promise<unknown> | undefined;
					let state: Awaited<ReturnType<typeof client.session.get>> | undefined;
					const transcript: SessionMessageInfo[] = [];
					const abort = () => {
						if (sessionID) abortTask ??= client.session.interrupt({sessionID}, {signal: AbortSignal.timeout(3000)}).catch(() => {});
					};
					signal.addEventListener('abort', abort, {once: true});
					try {
						signal.throwIfAborted();
						const created = await client.session.create({title: 'tifinagh-bench', agent: 'benchmark', model, location: {directory: options.workDir}}, {signal});
						sessionID = created.id;
						if (signal.aborted) abort();
						signal.throwIfAborted();
						await client.session.prompt({sessionID, text: `${request.system}\n\n${request.prompt}\n\nReturn only a JSON object matching this JSON schema, with no Markdown or commentary:\n${JSON.stringify(request.schema)}`}, {signal});
						// Beta's wait route predates /api/experimental/session/.../wait.
						// Poll the stable session endpoint through the official client.
						state = await client.session.get({sessionID}, {signal});
						while (!state.outcome) {
							// Surface provider quotas while OpenCode is internally waiting to retry.
							const recent = await client.message.list({sessionID, limit: 10, order: 'desc'}, {signal});
							const latest = recent.data.find(message => message.type === 'assistant');
							if (latest?.type === 'assistant' && (latest.error || latest.retry?.error)) {
								const mapped = failure(latest.error ?? latest.retry!.error);
								if (mapped.type === 'limit') { transcript.push(...recent.data); throw mapped; }
							}
							await delay(150, undefined, {signal});
							state = await client.session.get({sessionID}, {signal});
						}
						let cursor: string | undefined;
						do {
							const page = await client.message.list({sessionID, limit: 100, ...(cursor ? {cursor} : {order: 'asc' as const})}, {signal});
							transcript.push(...page.data);
							cursor = page.cursor.next ?? undefined;
						} while (cursor);
						const messages = transcript.filter((message): message is SessionMessageAssistant => message.type === 'assistant');
						for (const message of messages) {
							if (message.error) throw message.error;
							if (message.content.some(part => part.type === 'tool')) throw new HarnessError('harness', 'OpenCode attempted a disabled tool.', false);
						}
						if (state.outcome !== 'succeeded' || messages.length === 0) throw new Error(`OpenCode session ${state.outcome} without a successful response`);
						const rawText = messages.at(-1)!.content.filter(part => part.type === 'text').map(part => part.text).join('\n');
						return {
							output: parseObject(rawText), rawText,
							usage: {input: state.tokens.input + state.tokens.cache.read + state.tokens.cache.write, output: state.tokens.output, reasoning: state.tokens.reasoning, cachedInput: state.tokens.cache.read},
							costUsd: typeof state.cost === 'number' ? state.cost : null,
							latencyMs: performance.now() - start, transcript,
						};
					} catch (error) {
						abort();
						const mapped = failure(error, requestSignal);
						throw new HarnessError(mapped.type, mapped.message, mapped.retryable, mapped.resetAt, {
							output: null, rawText: '', transcript, latencyMs: performance.now() - start,
							usage: state ? {input: state.tokens.input + state.tokens.cache.read + state.tokens.cache.write,
								output: state.tokens.output, reasoning: state.tokens.reasoning, cachedInput: state.tokens.cache.read} : null,
							costUsd: state?.cost ?? null,
						});
					} finally {
						signal.removeEventListener('abort', abort);
						await abortTask;
						if (sessionID) await client.session.remove({sessionID}, {signal: AbortSignal.timeout(3000)}).catch(() => {});
					}
				});
			},
			close: () => active.close(stop),
		};
	} catch (error) {
		await stop();
		throw failure(error);
	}
}
