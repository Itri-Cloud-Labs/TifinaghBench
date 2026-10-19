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

export function scoreExact(question: Question, answer: string): Pick<Item, 'grade' | 'score' | 'cer' | 'scored_by' | 'matched_entry_id'> {
	const latin = question.direction === 'tif-to-latin';
	const actual = normalizeExact(answer, latin);
	const expected = question.expected.map(value => normalizeExact(value, latin));
	const match = expected.indexOf(actual);
	return {
		grade: match >= 0 ? 'correct' : 'wrong',
		score: match >= 0 ? 1 : 0,
		cer: Math.min(...expected.map(value => distance(actual, value) / Math.max(1, [...value].length))),
		scored_by: 'exact',
		...(question.task === 'en-to-tif' ? {matched_entry_id: match >= 0 ? question.expected_entry_ids![match]! : null} : {}),
	};
}
