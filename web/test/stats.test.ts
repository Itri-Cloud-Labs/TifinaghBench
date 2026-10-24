import {describe, expect, it} from 'vitest';
import {runs} from '../src/data/runs';
import type {Cell, Config} from '../src/data/schema';
import {cellAverage, cellMoments, setupDifferences, slugFromFolder, tied, tiers} from '../src/data/stats';

const cell = (correct: number, partial: number, wrong: number, errors = 0): Cell => ({
	score: null, correct, partial, wrong, errors, n: correct + partial + wrong + errors, scored: correct + partial + wrong,
});

describe('cell moments', () => {
	it('scores partial answers as half and failed questions as zero', () => {
		expect(cellMoments(cell(50, 20, 30)).mean).toBeCloseTo(0.6);
		expect(cellMoments(cell(50, 20, 20, 10)).mean).toBeCloseTo(0.6);
	});
	it('matches the variance of a {0, 0.5, 1} sample mean', () => {
		const {variance} = cellMoments(cell(1, 1, 2));
		const values = [1, 0.5, 0, 0];
		const mean = values.reduce((a, b) => a + b) / 4;
		const population = values.reduce((a, b) => a + (b - mean) ** 2, 0) / 4;
		expect(variance).toBeCloseTo(population / 4);
	});
	it('handles empty cells', () => {
		expect(cellMoments(cell(0, 0, 0))).toEqual({mean: 0, variance: 0});
	});
});

describe('cell average', () => {
	it('averages cells with equal weight on a 0–100 scale', () => {
		const estimate = cellAverage([cell(100, 0, 0), cell(0, 0, 100)]);
		expect(estimate.value).toBeCloseTo(50);
		expect(estimate.se).toBe(0);
	});
});

describe('ties and tiers', () => {
	const at = (value: number, se: number) => ({value, se, low: value - 1.96 * se, high: value + 1.96 * se});
	it('calls a gap inside the combined margin a tie', () => {
		expect(tied(at(29.9, 0.6), at(29.4, 0.6))).toBe(true);
		expect(tied(at(29.9, 0.6), at(27.3, 0.6))).toBe(false);
	});
	it('starts a new tier when an entry is not tied with the tier leader', () => {
		const groups = tiers([at(10, 0.5), at(30, 0.5), at(29.5, 0.5), at(20, 0.5), at(19.6, 0.5)], value => value);
		expect(groups.map(group => group.map(entry => entry.value))).toEqual([[30, 29.5], [20, 19.6], [10]]);
	});
});

describe('setup comparison', () => {
	const official: Config = {
		harness: 'codex', model: 'x', dialects: ['ircam', 'tarifit', 'kabyle'], reasoning: 'high',
		tasks: ['tif-to-en', 'en-to-tif', 'transliterate'], sampleSize: '1000',
		judge: {harness: 'claude-code', model: 'claude-haiku-5-5'}, seed: 1, batchSize: 100,
	};
	it('accepts the official setup in any order', () => {
		expect(setupDifferences({...official, dialects: ['kabyle', 'ircam', 'tarifit']})).toEqual([]);
	});
	it('lists every difference', () => {
		const fields = setupDifferences({...official, judge: {harness: 'codex', model: 'gpt-6-luna'}, sampleSize: '250', batchSize: 50}).map(d => d.field);
		expect(fields).toEqual(['judge', 'sampleSize', 'batchSize']);
	});
});

describe('slugs', () => {
	it('drops the date prefix', () => {
		expect(slugFromFolder('2026-10-20-codex-gpt-6.1-sol-high')).toBe('codex-gpt-6.1-sol-high');
	});
});

describe('published results', () => {
	it('loads every run', () => {
		expect(runs.length).toBeGreaterThanOrEqual(8);
		expect(new Set(runs.map(run => run.slug)).size).toBe(runs.length);
	});
	it('reproduces each summary’s TifinaghBench and script score from the counts', () => {
		for (const run of runs) {
			if (run.summary.tifinaghbench !== null) expect(run.score?.value).toBeCloseTo(run.summary.tifinaghbench * 100, 6);
			if (run.summary.script_score !== null) expect(run.script?.value).toBeCloseTo(run.summary.script_score * 100, 6);
		}
	});
	it('ranks official runs with shared ranks for ties', () => {
		const ranked = runs.filter(run => run.rank !== null);
		expect(ranked[0]?.rank).toBe(1);
		for (const run of ranked) expect(run.tiedWith.every(slug => runs.find(other => other.slug === slug)?.rank === run.rank)).toBe(true);
	});
});
