// FNV-1a seed derivation plus Mulberry32. Separate streams keep dialect order irrelevant.
export function random(seed: number, key: string): () => number {
	let state = seed >>> 0;
	for (const character of key) {
		state = Math.imul(state ^ character.codePointAt(0)!, 16777619) >>> 0;
	}

	return () => {
		state = (state + 0x6D2B79F5) >>> 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

export function sample<T>(entries: T[], size: number | 'all', rng: () => number): T[] {
	const shuffled = [...entries];
	for (let index = shuffled.length - 1; index > 0; index--) {
		const other = Math.floor(rng() * (index + 1));
		[shuffled[index], shuffled[other]] = [shuffled[other]!, shuffled[index]!];
	}

	return shuffled.slice(0, size === 'all' ? undefined : size);
}
