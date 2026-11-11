import {copyFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createAgentSession, createExtensionRuntime, getAgentDir, ModelRuntime, SessionManager, SettingsManager} from '@earendil-works/pi-coding-agent';
import type {AgentSession, ResourceLoader} from '@earendil-works/pi-coding-agent';
import {HarnessError} from '../bench/types.js';
import type {HarnessOptions, HarnessSession, Usage} from '../bench/types.js';
import {harnessError, lifecycle, parseObject, sdkInfo} from './shared.js';

type Message = AgentSession['messages'][number];
type Assistant = Extract<Message, {role: 'assistant'}>;

// Nothing is discovered: no extensions, skills, prompt templates, themes or AGENTS.md, and the
// system prompt is exactly the benchmark's.
function resources(system: string): ResourceLoader {
	return {
		getExtensions: () => ({extensions: [], errors: [], runtime: createExtensionRuntime()}),
		getSkills: () => ({skills: [], diagnostics: []}),
		getPrompts: () => ({prompts: [], diagnostics: []}),
		getThemes: () => ({themes: [], diagnostics: []}),
		getAgentsFiles: () => ({agentsFiles: []}),
		getSystemPrompt: () => system,
		getSystemPromptSource: () => undefined,
		getAppendSystemPrompt: () => [],
		getAppendSystemPromptSources: () => [],
		extendResources: () => {},
		reload: async () => {},
	};
}

// Pi counts reasoning inside output and cache reads outside input; the other adapters report
// input including cache and output excluding reasoning.
function usageOf(messages: Assistant[]): Usage {
	const sum = (pick: (message: Assistant) => number | undefined) => messages.reduce((total, message) => total + (pick(message) ?? 0), 0);
	const reasoning = messages.some(message => message.usage.reasoning !== undefined) ? sum(message => message.usage.reasoning) : undefined;
	return {
		input: sum(message => message.usage.input + message.usage.cacheRead + message.usage.cacheWrite),
		output: sum(message => message.usage.output) - (reasoning ?? 0),
		...(reasoning === undefined ? {} : {reasoning}),
		cachedInput: sum(message => message.usage.cacheRead),
	};
}

export async function createPi(options: HarnessOptions): Promise<HarnessSession> {
	const slash = options.model.indexOf('/');
	if (slash < 1 || slash === options.model.length - 1) throw new HarnessError('harness', 'Pi model must be provider/model, e.g. openrouter/google/gemini-4-carbon.', false);
	const provider = options.model.slice(0, slash);
	const id = options.model.slice(slash + 1);
	const thinkingLevel = options.reasoning === 'default' ? undefined : options.reasoning;
	const sdk = await sdkInfo('@earendil-works/pi-coding-agent');
	const directory = await mkdtemp(join(tmpdir(), 'tifinagh-pi-'));
	const stop = () => rm(directory, {recursive: true, force: true});
	try {
		// Pi's saved credentials are copied, so token refreshes never touch the user's file.
		// Provider environment variables such as OPENROUTER_API_KEY also work.
		const authPath = join(directory, 'auth.json');
		try {
			await copyFile(join(getAgentDir(), 'auth.json'), authPath);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		}
		const runtime = await ModelRuntime.create({authPath, modelsPath: null, modelsStorePath: join(directory, 'models-store.json'), allowModelNetwork: true, refreshOnCreate: false});
		// Fetch the provider's current catalog (for OpenRouter, the models, limits and prices this key
		// may use), so models newer than the bundled catalog resolve.
		const refreshed = await runtime.refresh({allowNetwork: true, providers: [provider], signal: AbortSignal.timeout(30000)});
		const model = runtime.getModel(provider, id);
		if (!model) {
			const reason = refreshed.errors.get(provider);
			throw new HarnessError('harness', `Pi model not found: ${options.model}${reason ? ` (catalog refresh failed: ${String(reason)})` : ''}`, false);
		}
		if (!runtime.hasConfiguredAuth(provider)) throw new HarnessError('auth', `Pi has no credentials for ${provider}. Run pi and /login ${provider}, or set the provider's API key environment variable.`, false);

		const open = (system: string) => createAgentSession({
			cwd: options.workDir, agentDir: directory, model, modelRuntime: runtime,
			...(thinkingLevel === undefined ? {} : {thinkingLevel}),
			resourceLoader: resources(system), noTools: 'all', tools: [],
			sessionManager: SessionManager.inMemory(options.workDir),
			// The benchmark retries failed batches itself; Pi must not retry or compact on its own.
			settingsManager: SettingsManager.inMemory({compaction: {enabled: false}, retry: {enabled: false}}),
		});
		// Pi clamps unsupported thinking levels to what the model offers. Refuse instead, so a run is
		// never recorded at a level it did not use.
		const {session: probe} = await open('');
		try {
			if (thinkingLevel !== undefined && probe.thinkingLevel !== thinkingLevel) {
				throw new HarnessError('harness', `Pi model ${options.model} does not support reasoning ${thinkingLevel}; it offers ${probe.getAvailableThinkingLevels().join(', ')}.`, false);
			}
			if (probe.getActiveToolNames().length > 0) throw new HarnessError('harness', `Pi enabled tools despite noTools: ${probe.getActiveToolNames().join(', ')}`, false);
		} finally {
			probe.dispose();
		}

		const active = lifecycle();
		return {
			info: {
				name: 'pi', version: `pi ${sdk.version}`, sdk,
				settings: {
					model: {provider, id, api: model.api, maxTokens: model.maxTokens, contextWindow: model.contextWindow},
					thinkingLevel: thinkingLevel ?? 'Pi default',
					reasoningMapping: 'Pi thinking level of the same name, checked against the model; unsupported levels are refused, not clamped.',
					tools: 'none (noTools: all, tools: [])',
					structuredOutput: 'JSON schema in prompt; shared parseObject (Pi has no native output schema).',
					systemPrompt: 'custom string replacing Pi\'s prompt; no AGENTS.md, SYSTEM.md, extensions, skills, prompt templates or themes',
					catalog: `bundled catalog refreshed from the provider at startup${refreshed.errors.size > 0 ? ' (refresh failed; bundled catalog used)' : ''}`,
					credentials: 'copy of Pi auth.json in a private temporary agent dir, plus provider environment variables',
					sessions: 'fresh in-memory session per ask; settings in memory with compaction and Pi retries off',
					cost: 'sum of Pi usage.cost.total: the billed cost when the provider reports it, otherwise Pi\'s catalog estimate',
				},
			},
			ask(request) {
				return active.run(request, async signal => {
					const start = performance.now();
					let session: AgentSession | undefined;
					let aborting: Promise<void> | undefined;
					const abort = () => { aborting ??= session?.abort().catch(() => {}); };
					signal.addEventListener('abort', abort, {once: true});
					const assistants = () => (session?.messages ?? []).filter((message): message is Assistant => message.role === 'assistant');
					const transcript = () => ({systemPrompt: session?.systemPrompt, messages: session?.messages ?? []});
					try {
						({session} = await open(request.system));
						signal.throwIfAborted();
						await session.prompt(`${request.prompt}\n\nReturn only a JSON object matching this JSON schema, with no Markdown or commentary:\n${JSON.stringify(request.schema)}`, {expandPromptTemplates: false});
						signal.throwIfAborted();
						const messages = assistants();
						const last = messages.at(-1);
						if (!last) throw new Error('Pi returned no assistant message.');
						if (messages.some(message => message.content.some(part => part.type === 'toolCall'))) throw new HarnessError('harness', 'Pi attempted a disabled tool.', false);
						if (last.stopReason === 'error' || last.stopReason === 'aborted') throw new Error(last.errorMessage ?? `Pi stopped: ${last.stopReason}`);
						const rawText = last.content.flatMap(part => part.type === 'text' ? [part.text] : []).join('\n');
						return {
							output: parseObject(rawText), rawText, usage: usageOf(messages),
							costUsd: messages.reduce((total, message) => total + message.usage.cost.total, 0),
							latencyMs: performance.now() - start, transcript: transcript(),
						};
					} catch (error) {
						abort();
						const mapped = harnessError(error, signal);
						const messages = assistants();
						throw new HarnessError(mapped.type, mapped.message, mapped.retryable, mapped.resetAt, {
							output: null, rawText: '', transcript: transcript(), latencyMs: performance.now() - start,
							usage: messages.length > 0 ? usageOf(messages) : null,
							costUsd: messages.length > 0 ? messages.reduce((total, message) => total + message.usage.cost.total, 0) : null,
						});
					} finally {
						signal.removeEventListener('abort', abort);
						await aborting;
						session?.dispose();
					}
				});
			},
			close: () => active.close(stop),
		};
	} catch (error) {
		await stop();
		throw harnessError(error);
	}
}
