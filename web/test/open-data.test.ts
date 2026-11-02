import {describe, expect, it} from 'vitest';
import {leaderboard, llmsTxt} from '../src/data/openData';
import {bestValue, estimatedCost, pricedRuns} from '../src/data/findings';
import type {Run} from '../src/data/runs';
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

	it('marks Codex costs as estimates, and only those', () => {
		for (const model of models) expect(model.cost_estimated).toBe(model.harness === 'Codex');
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

describe('estimatedCost', () => {
	const codex = (model: string, tokens: Partial<Run['info']['tokens']>) => ({harness: 'codex', model, info: {tokens}}) as Run;

	it('charges cached input at its own rate and adds no reasoning on top of output', () => {
		const cost = estimatedCost(codex('gpt-6.1-sol', {input: 1_000_000, cachedInput: 400_000, output: 100_000, reasoning: 90_000}));
		expect(cost).toBeCloseTo(0.6 * 2 + 0.4 * 0.1 + 0.1 * 10);
	});

	it('leaves unknown models and other harnesses alone', () => {
		expect(estimatedCost(codex('gpt-unknown', {input: 1, cachedInput: 0, output: 1}))).toBeNull();
		expect(estimatedCost({...codex('gpt-6.1-sol', {}), harness: 'opencode'} as Run)).toBeNull();
	});
});

describe('bestValue', () => {
	const run = (cost: number, value: number) => ({cost, score: {value}});

	it('keeps runs that no cheaper run beats, cheapest first', () => {
		const [a, b, c, d, e] = [run(1, 10), run(2, 5), run(3, 20), run(4, 20), run(5, 30)];
		expect(bestValue([e, d, c, b, a])).toEqual([a, c, e]);
	});

	it('prefers the higher score at equal cost', () => {
		const [low, high] = [run(1, 5), run(1, 9)];
		expect(bestValue([low, high])).toEqual([high]);
	});
});
