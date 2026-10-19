import type {BenchConfig} from '../options.js';
import type {Question} from './model.js';
import {random} from './sample.js';

/** Stable per-item ranks also preserve relative order when pending items are re-batched. */
export function groupQuestions(questions: Question[], config: Pick<BenchConfig, 'seed' | 'batchSize'>): Question[][] {
	const groups = new Map<string, Question[]>();
	for (const question of questions) {
		const key = `${question.dialect}/${question.task}/${question.direction ?? ''}`;
		const group = groups.get(key) ?? [];
		group.push(question);
		groups.set(key, group);
	}

	return [...groups].sort(([a], [b]) => a.localeCompare(b)).flatMap(([, values]) => {
		const ordered = values.map(question => ({question, rank: random(config.seed, `${question.id}/batch`)()}))
			.sort((a, b) => a.rank - b.rank || a.question.id.localeCompare(b.question.id)).map(value => value.question);
		return Array.from({length: Math.ceil(ordered.length / config.batchSize)}, (_, index) => ordered.slice(index * config.batchSize, (index + 1) * config.batchSize));
	});
}

/** Salvage each unique, well-formed known id; duplicates invalidate every occurrence. */
export function parseBatch<T>(output: unknown, field: string, ids: Set<string>, parse: (value: Record<string, unknown>) => T): {valid: Map<string, T>; issues: string[]} {
	const valid = new Map<string, T>();
	const issues: string[] = [];
	const seen = new Set<string>();
	const duplicate = new Set<string>();
	const rows = output && typeof output === 'object' ? (output as Record<string, unknown>)[field] : undefined;
	if (!Array.isArray(rows)) return {valid, issues: [`Unparseable ${field} array.`]};
	for (const row of rows) {
		if (!row || typeof row !== 'object' || typeof row.id !== 'string') {
			issues.push('Unparseable row or id.');
			continue;
		}

		if (!ids.has(row.id)) { issues.push(`Unknown id ignored: ${row.id}`); continue; }
		if (seen.has(row.id)) { duplicate.add(row.id); issues.push(`Duplicate id: ${row.id}`); }
		seen.add(row.id);
		try { valid.set(row.id, parse(row)); }
		catch { issues.push(`Unparseable value for id: ${row.id}`); }
	}

	for (const id of duplicate) valid.delete(id);
	for (const id of ids) if (!valid.has(id)) issues.push(`Missing valid ${field} for id: ${id}`);
	return {valid, issues};
}
