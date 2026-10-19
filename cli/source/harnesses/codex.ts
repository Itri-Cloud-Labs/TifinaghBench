import {Codex} from '@openai/codex-sdk';
import type {ThreadEvent, ThreadOptions} from '@openai/codex-sdk';
import {copyFile, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {homedir, tmpdir} from 'node:os';
import {join} from 'node:path';
import {HarnessError} from '../bench/types.js';
import type {HarnessOptions, HarnessSession, Usage} from '../bench/types.js';
import {cliVersion, findBinary, harnessError, lifecycle, parseObject, sdkInfo} from './shared.js';

export async function createCodex(options: HarnessOptions): Promise<HarnessSession> {
	const binary = await findBinary('codex');
	if (!binary) throw new HarnessError('harness', 'Codex CLI not found. Install the Codex CLI and run codex login.', false);
	const [version, sdk] = await Promise.all([cliVersion(binary), sdkInfo('@openai/codex-sdk')]);
	const directory = await mkdtemp(join(tmpdir(), 'tifinagh-codex-'));
	try {
		// Keep login credentials, but no user config, skills, plugins, MCP, or instructions.
		try {
			await copyFile(join(process.env['CODEX_HOME'] ?? join(homedir(), '.codex'), 'auth.json'), join(directory, 'auth.json'));
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		}
		// SDK 0.163 has no exec-flags option. exec replaces the shim, preserving SDK cancellation.
		const launcher = join(directory, 'codex');
		const quotedBinary = `'${binary.replaceAll("'", "'\\''")}'`;
		await writeFile(launcher, `#!/bin/sh\nshift\nexec ${quotedBinary} exec --ephemeral --ignore-user-config --ignore-rules "$@"\n`, {mode: 0o700});
		const config = {
			suppress_unstable_features_warning: true,
			project_doc_max_bytes: 0,
			project_doc_fallback_filenames: [],
			developer_instructions: '',
			mcp_servers: {},
			plugins: {_default: {enabled: false}},
			skills: {bundled: {enabled: false}, include_instructions: false},
			history: {persistence: 'none'},
			tools: {update_plan: {enabled: false}},
			features: {
				shell_tool: false, unified_exec: false, apply_patch_freeform: false,
				view_image: false,
				apps: false, plugins: false, skill_search: false, skip_host_skill_discovery: true,
				multi_agent: false, multi_agent_v2: false,
				js_repl: false, code_mode: false, browser_use: false, image_generation: false,
				memories: false, tool_search: false, tool_suggest: false,
				request_permissions_tool: false, sleep_tool: false,
			},
		};
		const threadOptions: ThreadOptions = {
			model: options.model,
			workingDirectory: options.workDir,
			sandboxMode: 'read-only',
			networkAccessEnabled: false,
			webSearchMode: 'disabled',
			approvalPolicy: 'never',
			skipGitRepoCheck: true,
			...(options.reasoning === 'default' ? {} : {modelReasoningEffort: options.reasoning}),
		};
		const env = Object.fromEntries(Object.entries(process.env).filter(([key, value]) => value !== undefined && !key.startsWith('CODEX_'))) as Record<string, string>;
		const codex = new Codex({
			codexPathOverride: launcher,
			config,
			env: {...env, CODEX_HOME: directory, HOME: directory, XDG_CONFIG_HOME: directory},
		});
		const active = lifecycle();
		return {
			info: {
				name: 'codex', version, sdk,
				settings: {...threadOptions, config, ephemeral: true, ignoreUserConfig: true, ignoreRules: true, isolatedHome: true, systemPrompt: 'prepended to user prompt'},
			},
			ask(request) {
				return active.run(request, async signal => {
					const start = performance.now();
					const transcript: ThreadEvent[] = [];
					let rawText = '';
					let usage: Usage | null = null;
					try {
						const thread = codex.startThread(threadOptions);
						const {events} = await thread.runStreamed(`${request.system}\n\n${request.prompt}`, {outputSchema: request.schema, signal});
						for await (const event of events) {
							transcript.push(event);
							if (event.type === 'turn.failed') throw harnessError(event.error);
							if (event.type === 'error') throw harnessError(event);
							if ('item' in event && event.item.type === 'error') {
								const mapped = harnessError(event.item);
								if (mapped.type === 'limit') throw mapped;
							}
							if (event.type.startsWith('item.') && 'item' in event) {
								if (['command_execution', 'mcp_tool_call', 'web_search', 'file_change'].includes(event.item.type)) {
									throw new HarnessError('harness', `Codex attempted a disabled tool: ${event.item.type}`, false);
								}
								if (event.type === 'item.completed' && event.item.type === 'agent_message') rawText = event.item.text;
							}
							if (event.type === 'turn.completed') {
								usage = {input: event.usage.input_tokens, output: event.usage.output_tokens, cachedInput: event.usage.cached_input_tokens};
								if (event.usage.reasoning_output_tokens !== undefined) usage.reasoning = event.usage.reasoning_output_tokens;
							}
						}
					} catch (error) {
						const mapped = harnessError(error);
						throw new HarnessError(mapped.type, mapped.message, mapped.retryable, mapped.resetAt,
							{output: null, rawText, usage, costUsd: null, latencyMs: performance.now() - start, transcript});
					}
					return {output: parseObject(rawText), rawText, usage, costUsd: null, latencyMs: performance.now() - start, transcript};
				});
			},
			close: () => active.close(() => rm(directory, {recursive: true, force: true})),
		};
	} catch (error) {
		await rm(directory, {recursive: true, force: true});
		throw error;
	}
}
