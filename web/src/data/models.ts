// Display metadata the result exports don't carry. Add an entry when a new model's results land.
export type Lab = 'OpenAI' | 'Anthropic' | 'Google' | 'DeepSeek' | 'Zhipu AI' | 'Unknown';

export type ModelInfo = {name: string; lab: Lab};

export const models: Record<string, ModelInfo> = {
	'gpt-6.1-sol': {name: 'GPT-6.1-Sol', lab: 'OpenAI'},
	'gpt-6-astra': {name: 'GPT-6-Astra', lab: 'OpenAI'},
	'gpt-6-luna': {name: 'GPT-6-Luna', lab: 'OpenAI'},
	'claude-opus-5-5': {name: 'Claude Opus 5.5', lab: 'Anthropic'},
	'claude-sonnet-5-5': {name: 'Claude Sonnet 5.5', lab: 'Anthropic'},
	'claude-haiku-5-5': {name: 'Claude Haiku 5.5', lab: 'Anthropic'},
	'opencode-go/deepseek-v4.1-flash': {name: 'DeepSeek v4.1 Flash', lab: 'DeepSeek'},
	'opencode-go/glm-5.3-flash': {name: 'GLM 5.3 Flash', lab: 'Zhipu AI'},
	'opencode-go/gemini-4-argon-contributor': {name: 'Gemini 4 Argon', lab: 'Google'},
};

export function modelInfo(id: string): ModelInfo {
	const known = models[id];
	if (known) return known;
	console.warn(`[tifinaghbench] No display metadata for model "${id}"; add it to web/src/data/models.ts.`);
	return {name: id.replace(/^[\w-]+\//, ''), lab: 'Unknown'};
}

export const harnessNames = {codex: 'Codex', 'claude-code': 'Claude Code', opencode: 'OpenCode'} as const;

export const judgeName = (model: string) => models[model]?.name ?? model;
