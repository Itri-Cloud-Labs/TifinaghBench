import type {Grade, Question} from './model.js';
import {buildJudgePrompt} from './prompts.js';
import {HarnessError} from './types.js';
import {objectOutput} from './request.js';

export const judgeRequest = (values: Array<{question: Question; answer: string}>) => buildJudgePrompt(values);

export function parseVerdict(output: unknown): {verdict: Grade; note: string} {
	const value = objectOutput(output, ['id', 'verdict', 'note']);
	if (!['correct', 'partial', 'wrong'].includes(String(value.verdict)) || typeof value.note !== 'string') {
		throw new HarnessError('harness', 'Judge returned invalid structured output.');
	}

	return value as {verdict: Grade; note: string};
}
