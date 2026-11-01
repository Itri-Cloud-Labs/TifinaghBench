import {describe, expect, it} from 'vitest';
import {leaderboard, llmsTxt} from '../src/data/openData';
import {pricedRuns} from '../src/data/findings';
import {runs} from '../src/data/runs';

describe('leaderboard', () => {
	const {models} = leaderboard();

	it('lists every scored run, best first, with scores on the 0–100 scale', () => {
		expect(models).toHaveLength(runs.filter(run => run.score !== null).length);
		for (const [index, model] of models.entries()) {
			expect(model.score).toBeGreaterThanOrEqual(0);
			expect(model.score).toBeLessThanOrEqual(100);
			expect(model.score_95_interval[0]!).toBeLessThanOrEqual(model.score!);
			if (index > 0) expect(model.score).toBeLessThanOrEqual(models[index - 1]!.score!);
		}
	});

	it('never gives Codex runs a cost', () => {
		for (const model of models) if (model.harness === 'Codex') expect(model.cost_usd).toBeNull();
	});

	it('names each model in llms.txt', () => {
		const text = llmsTxt();
		for (const model of models) expect(text).toContain(model.url);
	});
});

describe('pricedRuns', () => {
	it('keeps only ranked runs with a positive cost, best first', () => {
		const priced = pricedRuns();
		for (const [index, run] of priced.entries()) {
			expect(run.cost).toBeGreaterThan(0);
			expect(run.rank).not.toBeNull();
			if (index > 0) expect(run.score.value).toBeLessThanOrEqual(priced[index - 1]!.score.value);
		}
	});
});
