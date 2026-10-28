import type {Config, RunInfo, Summary} from './schema';
import {configSchema, runSchema, summarySchema} from './schema';
import type {Lab} from './models';
import {harnessNames, modelInfo} from './models';
import type {Estimate, SetupDifference} from './stats';
import {scriptScore, setupDifferences, slugFromFolder, tiers, tifinaghBench} from './stats';

// The public exports in /results are the only data source. Each folder is one run.
const summaries = import.meta.glob<unknown>('../../../results/*/summary.json', {eager: true, import: 'default'});
const configs = import.meta.glob<unknown>('../../../results/*/config.json', {eager: true, import: 'default'});
const runInfos = import.meta.glob<unknown>('../../../results/*/run.json', {eager: true, import: 'default'});

export type Run = {
	folder: string;
	slug: string;
	model: string;
	name: string;
	lab: Lab;
	harness: Config['harness'];
	harnessName: string;
	provider: string | null;
	reasoning: string;
	config: Config;
	summary: Summary;
	info: RunInfo;
	score: Estimate | null;
	scoreStrict: number | null;
	script: Estimate | null;
	scriptStrict: number | null;
	differences: SetupDifference[];
	official: boolean;
	rank: number | null;
	tier: number | null;
	tiedWith: string[];
};

function parse<T>(schema: {safeParse(value: unknown): {success: true; data: T} | {success: false; error: {message: string}}}, value: unknown, file: string): T {
	const result = schema.safeParse(value);
	if (!result.success) throw new Error(`[tifinaghbench] Invalid results export ${file}: ${result.error.message}`);
	return result.data;
}

function load(): Run[] {
	const runs: Run[] = [];
	for (const [file, raw] of Object.entries(summaries)) {
		const folder = file.split('/').at(-2)!;
		const base = file.replace(/summary\.json$/, '');
		if (!configs[`${base}config.json`] || !runInfos[`${base}run.json`]) throw new Error(`[tifinaghbench] ${folder} needs config.json and run.json next to summary.json.`);
		const summary = parse(summarySchema, raw, file);
		const config = parse(configSchema, configs[`${base}config.json`], `${base}config.json`);
		const info = parse(runSchema, runInfos[`${base}run.json`], `${base}run.json`);
		const meta = modelInfo(config.model);
		const differences = setupDifferences(config);
		const score = info.status === 'completed' ? tifinaghBench(summary) : null;
		runs.push({
			folder,
			slug: slugFromFolder(folder),
			model: config.model,
			name: meta.name,
			lab: meta.lab,
			harness: config.harness,
			harnessName: harnessNames[config.harness],
			provider: config.model.startsWith('opencode-go/') ? 'OpenCode Go' : null,
			reasoning: config.reasoning,
			config,
			summary,
			info,
			score,
			scoreStrict: summary.tifinaghbench_strict === null ? null : summary.tifinaghbench_strict * 100,
			script: info.status === 'completed' ? scriptScore(summary) : null,
			scriptStrict: summary.script_score_strict === null ? null : summary.script_score_strict * 100,
			differences,
			official: differences.length === 0,
			rank: null,
			tier: null,
			tiedWith: [],
		});
	}

	// Ranks and tiers come from official-setup runs only; other setups stay on the board, unranked.
	const ranked = runs.filter((run): run is Run & {score: Estimate} => run.official && run.score !== null);
	let position = 1;
	tiers(ranked, run => run.score).forEach((group, index) => {
		for (const run of group) {
			run.rank = position;
			run.tier = index;
			run.tiedWith = group.filter(other => other !== run).map(other => other.slug);
		}
		position += group.length;
	});

	return runs.sort((a, b) => (b.score?.value ?? -1) - (a.score?.value ?? -1));
}

export const runs: Run[] = load();
export const runBySlug = (slug: string) => runs.find(run => run.slug === slug);
export const rankedRuns = () => runs.filter(run => run.rank !== null);
export const lastUpdated = runs.reduce<string | null>((latest, run) => {
	const finished = run.info.finished_at;
	return finished && (!latest || finished > latest) ? finished : latest;
}, null);
export const lab = {name: 'Itri Cloud Labs', url: 'https://ic-labs.cloud'};
export const siteUrl = 'https://tifinaghbench.ic-labs.cloud';
export const sponsorUrl = 'https://github.com/sponsors/Itri-Cloud-Labs';
export const githubUrl = 'https://github.com/Itri-Cloud-Labs/TifinaghBench';
export const runFolderUrl = (folder: string) => `${githubUrl}/tree/main/results/${folder}`;
