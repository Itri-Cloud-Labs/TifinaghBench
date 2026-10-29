import {alphabet} from '../data/alphabet';

// The alphabet quiz: each round shows one letter and four Latin sounds to choose from.
export const quizLength = 10;

export type Round = {letter: string; answer: string; choices: string[]};

// Plain letters and their emphatic or rounded twins. A twin makes the best wrong choice, since the
// two letters look alike and sound close.
const twins: Record<string, string> = {d: 'ḍ', t: 'ṭ', s: 'ṣ', z: 'ẓ', r: 'ṛ', h: 'ḥ', g: 'gʷ', k: 'kʷ'};
for (const [plain, twin] of Object.entries(twins)) twins[twin] = plain;

function shuffle<T>(items: T[], random: () => number): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[copy[i], copy[j]] = [copy[j]!, copy[i]!];
	}
	return copy;
}

/** Ten different letters, each with its sound and three wrong sounds, shuffled. */
export function makeRounds(random: () => number = Math.random): Round[] {
	return shuffle(alphabet, random).slice(0, quizLength).map(([letter, answer]) => {
		const twin = twins[answer];
		const others = shuffle(alphabet.map(([, latin]) => latin).filter(latin => latin !== answer && latin !== twin), random);
		const wrong = [...(twin ? [twin] : []), ...others].slice(0, 3);
		return {letter, answer, choices: shuffle([answer, ...wrong], random)};
	});
}

/** Score links carry the result in the path: /quiz/0 to /quiz/10. */
export const quizScores = Array.from({length: quizLength + 1}, (_, score) => score);
export const isQuizScore = (value: string) => /^\d+$/.test(value) && Number(value) <= quizLength;
