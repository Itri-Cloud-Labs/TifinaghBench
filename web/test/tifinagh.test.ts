import {describe, expect, it} from 'vitest';
import {toTifinagh, transcribe} from '../src/lib/tifinagh';

describe('toTifinagh', () => {
	it('maps Amazigh names letter by letter', () => {
		expect(toTifinagh('Massinissa')).toBe('ⵎⴰⵙⵙⵉⵏⵉⵙⵙⴰ');
		expect(toTifinagh('Tiziri')).toBe('ⵜⵉⵣⵉⵔⵉ');
		expect(toTifinagh('Azul')).toBe('ⴰⵣⵓⵍ');
	});

	it('reads digraphs as one sound', () => {
		expect(toTifinagh('Bouchra')).toBe('ⴱⵓⵛⵔⴰ');
		expect(toTifinagh('Ghita')).toBe('ⵖⵉⵜⴰ');
		expect(toTifinagh('Khalid')).toBe('ⵅⴰⵍⵉⴷ');
	});

	it('keeps Amazigh Latin letters and folds accents', () => {
		expect(toTifinagh('Ɣ ḍ ɛ')).toBe('ⵖ ⴹ ⵄ');
		expect(toTifinagh('Hélène')).toBe('ⵀⴻⵍⴻⵏⴻ');
		expect(toTifinagh('François')).toBe('ⴼⵔⴰⵏⵙⵓⵉⵙ');
	});

	it('gives letters Tifinagh lacks the nearest sound', () => {
		expect(toTifinagh('Paolo')).toBe('ⴱⴰⵓⵍⵓ');
		expect(toTifinagh('Victor')).toBe('ⴼⵉⴽⵜⵓⵔ');
		expect(toTifinagh('Alex')).toBe('ⴰⵍⴻⴽⵙ');
		expect(toTifinagh('Cécile')).toBe('ⵙⴻⵙⵉⵍⴻ');
	});

	it('drops digits and symbols but keeps spaces and hyphens', () => {
		expect(toTifinagh('Jean-Luc 2')).toBe('ⵊⴻⴰⵏ-ⵍⵓⴽ ');
		expect(transcribe('ab').map(piece => piece.latin)).toEqual(['a', 'b']);
	});
});
