import type {Harness} from '../options.js';
import type {HarnessOptions, HarnessSession} from '../bench/types.js';
import {HarnessError} from '../bench/types.js';
import {createClaudeCode} from './claude-code.js';
import {createCodex} from './codex.js';
import {createOpencode} from './opencode.js';
import {harnessError} from './shared.js';

export async function createHarness(
	harness: Harness,
	options: HarnessOptions,
): Promise<HarnessSession> {
	try {
		switch (harness) {
			case 'codex': return await createCodex(options);
			case 'claude-code': return await createClaudeCode(options);
			case 'opencode': return await createOpencode(options);
			default: throw new HarnessError('harness', `Unknown harness: ${String(harness)}`, false);
		}
	} catch (error) {
		throw harnessError(error);
	}
}
