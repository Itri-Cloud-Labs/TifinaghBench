import {query} from '@anthropic-ai/claude-agent-sdk';
import type {Options, SDKMessage, SDKResultMessage} from '@anthropic-ai/claude-agent-sdk';
import {HarnessError} from '../bench/types.js';
import type {HarnessOptions, HarnessSession, Usage} from '../bench/types.js';
import {cliVersion, findBinary, harnessError, lifecycle, parseObject, sdkInfo} from './shared.js';

function resultUsage(result: SDKResultMessage): Usage {
	const models = Object.values(result.modelUsage ?? {});
	const usage: Usage = models.length > 0 ? {
		input: models.reduce((sum, model) => sum + model.inputTokens + model.cacheReadInputTokens + model.cacheCreationInputTokens, 0),
		output: models.reduce((sum, model) => sum + model.outputTokens, 0),
		cachedInput: models.reduce((sum, model) => sum + model.cacheReadInputTokens, 0),
	} : {
		input: result.usage.input_tokens + (result.usage.cache_read_input_tokens ?? 0) + (result.usage.cache_creation_input_tokens ?? 0),
		output: result.usage.output_tokens,
		cachedInput: result.usage.cache_read_input_tokens ?? 0,
	};
	if (models.some(model => model.thinkingTokens !== undefined)) usage.reasoning = models.reduce((sum, model) => sum + (model.thinkingTokens ?? 0), 0);
	return usage;
}

export async function createClaudeCode(options: HarnessOptions): Promise<HarnessSession> {
	if (options.reasoning === 'minimal') throw new HarnessError('harness', 'Claude Code does not support minimal effort.', false);
	const binary = await findBinary('claude');
	if (!binary) throw new HarnessError('harness', 'Claude Code CLI not found. Install Claude Code and sign in.', false);
	const [version, sdk] = await Promise.all([cliVersion(binary), sdkInfo('@anthropic-ai/claude-agent-sdk')]);
	const settings = {
		model: options.model,
		cwd: options.workDir,
		tools: [],
		allowedTools: [],
		mcpServers: {},
		strictMcpConfig: true,
		settingSources: [],
		plugins: [],
		skills: [],
		persistSession: false,
		settings: {
			disableAllHooks: true,
			autoMemoryEnabled: false,
			disableBundledSkills: true,
			syncClaudeAiSkills: false,
			syncClaudeAiPlugins: false,
			enabledPlugins: {
				'cc-plugin-agents-md@builtin': false,
				'cc-plugin-telemetry@builtin': false,
				'cc-plugin-plugin-authoring@builtin': false,
			},
		},
		permissionMode: 'dontAsk',
		extraArgs: {'safe-mode': null, 'disable-slash-commands': null, 'no-chrome': null},
		...(options.reasoning === 'default' ? {} : {effort: options.reasoning}),
	} satisfies Options;
	const active = lifecycle();
	return {
		info: {name: 'claude-code', version, sdk, settings: {...settings, systemPrompt: 'custom string replacing preset'}},
		ask(request) {
			return active.run(request, async signal => {
				const start = performance.now();
				const abortController = new AbortController();
				const abort = () => abortController.abort(signal.reason);
				signal.addEventListener('abort', abort, {once: true});
				if (signal.aborted) abort();
				const transcript: SDKMessage[] = [];
				let stderr = '';
				let response: ReturnType<typeof query> | undefined;
				let result: SDKResultMessage | undefined;
				const texts: string[] = [];
				try {
					response = query({prompt: request.prompt, options: {
						...settings,
						pathToClaudeCodeExecutable: binary,
						systemPrompt: request.system,
						outputFormat: {type: 'json_schema', schema: request.schema},
						abortController,
						stderr: data => { stderr = (stderr + data).slice(-8000); },
					}});
					for await (const message of response) {
						transcript.push(message);
						if (message.type === 'rate_limit_event' && message.rate_limit_info.status === 'rejected') throw harnessError(message);
						if (message.type === 'system' && message.subtype === 'api_retry' && (message.error_status === 429 || message.error === 'rate_limit')) throw harnessError(message);
						if (message.type === 'assistant' && message.error === 'rate_limit') throw harnessError(message);
						if (message.type === 'assistant') {
							for (const block of message.message.content) {
								if (block.type === 'text') texts.push(block.text);
							}
						}
						if (message.type === 'result') result = message;
					}
					if (!result) throw new Error(`Claude Code returned no result. ${stderr}`);
					if (result.subtype !== 'success') throw harnessError(result);
					if (result.is_error) throw harnessError(result);
					const rawText = result.result || texts.join('\n');
					const usage = resultUsage(result);
					return {output: result.structured_output ?? parseObject(rawText), rawText, usage, costUsd: result.total_cost_usd, latencyMs: performance.now() - start, transcript};
				} catch (error) {
					const mapped = harnessError(error instanceof HarnessError ? error : {error, stderr});
					throw new HarnessError(mapped.type, mapped.message, mapped.retryable, mapped.resetAt, {
						output: null, rawText: result?.subtype === 'success' ? result.result : texts.join('\n'),
						usage: result ? resultUsage(result) : null,
						costUsd: result?.total_cost_usd ?? null, latencyMs: performance.now() - start, transcript,
					});
				} finally {
					signal.removeEventListener('abort', abort);
					response?.close();
				}
			});
		},
		close: () => active.close(),
	};
}
