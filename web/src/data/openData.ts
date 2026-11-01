import {dialectScores, directions, runCost} from './findings';
import {lab, lastUpdated, runs, siteUrl} from './runs';

// The public scores as data, written to /leaderboard.json and /llms.txt at build time (scripts/cards.mjs).
// Published scores and run metadata only; everything here is already on the site.
const round = (value: number | null) => (value === null ? null : Math.round(value * 10) / 10);

export function leaderboard() {
	return {
		name: 'TifinaghBench',
		description: 'How well AI models know Amazigh vocabulary written in Tifinagh, closed-book. Scores run from 0 to 100.',
		url: siteUrl,
		methodology: `${siteUrl}/en/methodology`,
		publisher: lab,
		updated: lastUpdated,
		models: runs.filter(run => run.score !== null).map(run => {
			const {read, write} = directions(run);
			const dialects = dialectScores(run);
			return {
				rank: run.rank,
				tied_with: run.tiedWith,
				slug: run.slug,
				name: run.name,
				lab: run.lab,
				model: run.model,
				harness: run.harnessName,
				reasoning: run.reasoning,
				score: round(run.score!.value),
				score_95_interval: [round(run.score!.low), round(run.score!.high)],
				score_strict: round(run.scoreStrict),
				script_score: round(run.script?.value ?? null),
				reading: round(read),
				writing: round(write),
				by_dialect: {ircam: round(dialects.ircam), tarifit: round(dialects.tarifit), kabyle: round(dialects.kabyle)},
				cost_usd: runCost(run) === null ? null : Math.round(runCost(run)! * 100) / 100,
				url: `${siteUrl}/en/models/${run.slug}`,
			};
		}),
	};
}

export function llmsTxt() {
	const data = leaderboard();
	const rows = data.models.map(model => `- ${model.rank === null ? 'Unranked' : `#${model.rank}`} ${model.name} (${model.reasoning} reasoning): ${model.score} out of 100, ${model.url}`);
	return `# TifinaghBench

> ${data.description}

Run by ${lab.name}. It tests three dialects (Standard Moroccan Amazigh, Tarifit and Kabyle) without dictionaries or web search. Models with tied ranks are too close to separate statistically. Please cite the score with its model and reasoning level, and link to the source.

The word lists are not published, and this data holds no questions or answers.

## Data

- [Leaderboard as JSON](${siteUrl}/leaderboard.json): every score, its 95% interval, and the cost where one is known

## Pages

- [Leaderboard](${siteUrl}/en)
- [Findings](${siteUrl}/en/findings)
- [Methodology](${siteUrl}/en/methodology)
- [Dialects and the script](${siteUrl}/en/dialects)
- [Compare models](${siteUrl}/en/compare)
- [French version](${siteUrl}/fr)

## Results${data.updated ? ` (updated ${data.updated.slice(0, 10)})` : ''}

${rows.join('\n')}
`;
}
