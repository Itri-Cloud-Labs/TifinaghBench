import {describe, expect, it} from 'vitest';
import {alphabet} from '../src/data/alphabet';
import {makeRounds, quizLength} from '../src/lib/quiz';

// A small seeded generator so every run checks the same rounds.
function seeded(seed: number) {
	return () => {
		seed = (seed * 1664525 + 1013904223) % 2 ** 32;
		return seed / 2 ** 32;
	};
}

describe('makeRounds', () => {
	it('asks ten different letters, each with four different choices that include the answer', () => {
		for (let seed = 1; seed <= 50; seed++) {
			const rounds = makeRounds(seeded(seed));
			expect(rounds).toHaveLength(quizLength);
			expect(new Set(rounds.map(round => round.letter)).size).toBe(quizLength);
			for (const round of rounds) {
				expect(round.choices).toHaveLength(4);
				expect(new Set(round.choices).size).toBe(4);
				expect(round.choices).toContain(round.answer);
				expect(alphabet).toContainEqual([round.letter, round.answer]);
			}
		}
	});

	it('offers the emphatic twin as a wrong choice', () => {
		const rounds = Array.from({length: 50}, (_, seed) => makeRounds(seeded(seed + 1))).flat();
		const emphatic = rounds.filter(round => round.answer === 'ḍ');
		expect(emphatic.length).toBeGreaterThan(0);
		for (const round of emphatic) expect(round.choices).toContain('d');
	});
});
