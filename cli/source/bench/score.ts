import type {Item, Question} from './model.js';

export function normalizeEnglish(value: string): string {
	return value.normalize('NFC').toLowerCase().trim().replaceAll(/\s+/gu, ' ').replace(/[\p{P}]+$/gu, '').trim();
}

export function normalizeExact(value: string, latin = false): string {
	const normalized = value.normalize('NFC').trim().replaceAll(/\s+/gu, ' ');
	return latin
		? normalized.toLowerCase().replaceAll('ǝ', 'ə').replaceAll('ε', 'ɛ')
		: normalized;
}

// Spelling conventions the dictionaries mix, folded away before comparing (see docs/methodology.md):
// schwa is dropped, spirant letters map to their plain counterparts, and š/ž are written c/j.
const tifinaghFolds: Record<string, string> = {'ⴻ': '', 'ⵝ': 'ⵜ', 'ⴸ': 'ⴷ', 'ⴲ': 'ⴱ', 'ⴿ': 'ⴽ', 'ⴵ': 'ⴳ'};
const latinFolds: Array<[RegExp, string]> = [[/[ǝəe]/gu, ''], [/š/gu, 'c'], [/ž/gu, 'j'], [/ǧ/gu, 'j'], [/ε/gu, 'ɛ']];

export function foldSpelling(value: string, latin = false): string {
	const normalized = normalizeExact(value, latin);
	if (!latin) return [...normalized].map(char => tifinaghFolds[char] ?? char).join('');
	// Letter rules first (š carries an accent), then drop accents such as the line below ḏ ṯ ḇ,
	// keeping the dot below that marks emphatics (ḍ ṭ ṣ ẓ ṛ ḥ).
	const lettered = latinFolds.reduce((text, [pattern, replacement]) => text.replaceAll(pattern, replacement), normalized);
	return lettered.normalize('NFD').replaceAll(/(?!\u0323)\p{Mn}/gu, '').normalize('NFC');
}

export function distance(left: string, right: string): number {
	const a = [...left];
	const b = [...right];
	let row = b.map((_, index) => index + 1);
	row.unshift(0);
	for (let i = 0; i < a.length; i++) {
		const next = [i + 1];
		for (let j = 0; j < b.length; j++) {
			next.push(Math.min(next[j]! + 1, row[j + 1]! + 1, row[j]! + (a[i] === b[j] ? 0 : 1)));
		}

		row = next;
	}

	return row[b.length]!;
}

/** Scores with spelling conventions folded; `strict` records whether the unfolded spelling also matched. */
export function scoreExact(question: Pick<Question, 'direction' | 'expected' | 'expected_entry_ids' | 'task'>, answer: string): Pick<Item, 'grade' | 'score' | 'cer' | 'scored_by' | 'matched_entry_id' | 'strict'> {
	const latin = question.direction === 'tif-to-latin';
	const actual = normalizeExact(answer, latin);
	const expected = question.expected.map(value => normalizeExact(value, latin));
	const folded = foldSpelling(answer, latin);
	const match = question.expected.findIndex(value => foldSpelling(value, latin) === folded);
	return {
		grade: match >= 0 ? 'correct' : 'wrong',
		score: match >= 0 ? 1 : 0,
		strict: expected.includes(actual),
		cer: Math.min(...expected.map(value => distance(actual, value) / Math.max(1, [...value].length))),
		scored_by: 'exact',
		...(question.task === 'en-to-tif' ? {matched_entry_id: match >= 0 ? question.expected_entry_ids![match]! : null} : {}),
	};
}
