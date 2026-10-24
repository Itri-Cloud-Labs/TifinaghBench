// Letter-by-letter transcription of a Latin-script name into IRCAM Tifinagh. Not a translation:
// Amazigh Latin letters (ḍ ɣ ɛ …) map one to one, and letters Tifinagh lacks take the closest sound.

const digraphs: Record<string, string> = {
	sh: 'ⵛ', ch: 'ⵛ', gh: 'ⵖ', kh: 'ⵅ', ou: 'ⵓ', ph: 'ⴼ', th: 'ⵜ', dj: 'ⵊ', gw: 'ⴳⵯ', kw: 'ⴽⵯ',
};

const letters: Record<string, string> = {
	a: 'ⴰ', b: 'ⴱ', d: 'ⴷ', e: 'ⴻ', f: 'ⴼ', g: 'ⴳ', h: 'ⵀ', i: 'ⵉ', j: 'ⵊ', k: 'ⴽ', l: 'ⵍ', m: 'ⵎ',
	n: 'ⵏ', q: 'ⵇ', r: 'ⵔ', s: 'ⵙ', t: 'ⵜ', u: 'ⵓ', w: 'ⵡ', x: 'ⴽⵙ', y: 'ⵢ', z: 'ⵣ',
	// No o, p or v in the IRCAM alphabet: the nearest sound stands in.
	o: 'ⵓ', p: 'ⴱ', v: 'ⴼ',
	// Amazigh Latin letters.
	ḍ: 'ⴹ', ṭ: 'ⵟ', ṣ: 'ⵚ', ẓ: 'ⵥ', ṛ: 'ⵕ', ḥ: 'ⵃ', ɛ: 'ⵄ', ε: 'ⵄ', ɣ: 'ⵖ', γ: 'ⵖ', č: 'ⵛ', š: 'ⵛ', ǧ: 'ⵊ', ž: 'ⵊ', ə: 'ⴻ', ǝ: 'ⴻ',
	// Common letters from French and Spanish names.
	ç: 'ⵙ', ñ: 'ⵏⵢ', ß: 'ⵙⵙ', æ: 'ⴰⵢ', œ: 'ⴻ',
};

export type Piece = {latin: string; tifinagh: string};

/** Splits a name into sounds, each with its Tifinagh letters. Spaces and hyphens pass through. */
export function transcribe(input: string): Piece[] {
	const text = input.normalize('NFC').toLowerCase();
	const pieces: Piece[] = [];
	let index = 0;
	while (index < text.length) {
		const pair = text.slice(index, index + 2);
		if (digraphs[pair]) {
			pieces.push({latin: pair, tifinagh: digraphs[pair]});
			index += 2;
			continue;
		}
		const char = text[index]!;
		index++;
		if (/[\s\-'’]/u.test(char)) {
			pieces.push({latin: char, tifinagh: char === '’' || char === '\'' ? '' : char});
			continue;
		}
		// English c: soft before e, i, y; hard elsewhere.
		if (char === 'c') {
			pieces.push({latin: char, tifinagh: /[eiyéèêë]/u.test(text[index] ?? '') ? 'ⵙ' : 'ⴽ'});
			continue;
		}
		const direct = letters[char] ?? letters[char.normalize('NFD').replace(/\p{Mn}/gu, '')];
		if (direct) pieces.push({latin: char, tifinagh: direct});
	}
	return pieces;
}

export const toTifinagh = (input: string) => transcribe(input).map(piece => piece.tifinagh).join('');
