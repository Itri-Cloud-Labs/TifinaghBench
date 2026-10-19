export type Choice<T extends string> = {
	value: T;
	label: string;
	hint?: string;
};

export type Harness = 'codex' | 'claude-code' | 'opencode';
export type Dialect = 'ircam' | 'tarifit' | 'kabyle';
export type Task = 'tif-to-en' | 'en-to-tif' | 'transliterate';
export type Reasoning =
	| 'default'
	| 'minimal'
	| 'low'
	| 'medium'
	| 'high'
	| 'xhigh'
	| 'max';
export type SampleSize = `${number}` | 'all';

export const harnesses: Array<Choice<Harness>> = [
	{value: 'codex', label: 'Codex', hint: 'OpenAI Codex CLI'},
	{value: 'claude-code', label: 'Claude Code', hint: 'Anthropic Claude Code CLI'},
	{value: 'opencode', label: 'OpenCode', hint: 'any provider through OpenCode'},
];

export const modelPlaceholders: Record<Harness, string> = {
	codex: 'model id passed to codex --model',
	'claude-code': 'e.g. claude-opus-5-5',
	opencode: 'provider/model, e.g. anthropic/claude-sonnet-5-5',
};

export const dialects: Array<Choice<Dialect> & {file: string}> = [
	{
		value: 'ircam',
		label: 'Standard Moroccan Amazigh',
		hint: 'IRCAM general dictionary',
		file: 'ircam_dictionnaire_general_amazighe_en.json',
	},
	{
		value: 'tarifit',
		label: 'Tarifit (Riffian)',
		hint: 'Abarrou illustrated dictionary',
		file: 'abarrou_dictionnaire_rifain_en.json',
	},
	{
		value: 'kabyle',
		label: 'Kabyle',
		hint: 'amazigh24 lexicon, Tifinagh generated from Latin',
		file: 'kabyle_english_lexicon_amazigh24.json',
	},
];

export const tasks: Array<Choice<Task>> = [
	{value: 'tif-to-en', label: 'Tifinagh → English', hint: 'give the meaning of a word'},
	{value: 'en-to-tif', label: 'English → Tifinagh', hint: 'write the word in Tifinagh'},
	{value: 'transliterate', label: 'Tifinagh ↔ Latin', hint: 'transliterate between scripts'},
];

const reasoningLabels: Record<Reasoning, string> = {
	default: 'Harness default',
	minimal: 'Minimal',
	low: 'Low',
	medium: 'Medium',
	high: 'High',
	xhigh: 'Extra high',
	max: 'Max',
};

const reasoningByHarness: Record<Harness, Reasoning[]> = {
	codex: ['default', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
	'claude-code': ['default', 'low', 'medium', 'high', 'xhigh', 'max'],
	opencode: ['default', 'low', 'medium', 'high'],
};

export function reasoningChoices(harness: Harness): Array<Choice<Reasoning>> {
	return reasoningByHarness[harness].map(value => ({
		value,
		label: reasoningLabels[value],
	}));
}

export const sampleSizes: Array<Choice<SampleSize>> = [
	{value: '50', label: '50 words per dialect', hint: 'quick smoke test'},
	{value: '250', label: '250 words per dialect'},
	{value: '1000', label: '1,000 words per dialect'},
	{value: 'all', label: 'Every word', hint: 'slow and expensive'},
];

export const concurrencies: Array<Choice<string>> = ['1', '4', '8', '16'].map(
	value => ({value, label: value === '1' ? '1 (sequential)' : value}),
);

export type BenchConfig = {
	harness: Harness;
	model: string;
	dialects: Dialect[];
	reasoning: Reasoning;
	tasks: Task[];
	judge: {harness: Harness; model: string} | null;
	sampleSize: SampleSize;
	concurrency: number;
	batchSize: number;
	seed: number;
	timeout: number;
	retries: number;
	datasetDir?: string;
	output: string;
};

export function validateModel(harness: Harness, model: string): string | undefined {
	if (model.trim() === '') return 'Enter a model id.';
	if (/\s/.test(model.trim())) return 'Model ids cannot contain spaces.';
	if (harness === 'opencode' && !model.includes('/')) {
		return 'OpenCode model ids look like provider/model.';
	}

	return undefined;
}

export function defaultOutput(harness: Harness, model: string): string {
	const date = new Date().toISOString().slice(0, 10);
	const slug = model.replaceAll(/[^\w.-]+/g, '-');
	return `results/${date}-${harness}-${slug}`;
}
