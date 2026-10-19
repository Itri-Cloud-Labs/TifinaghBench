import React, {useState} from 'react';
import {Box, Text, useApp, useInput} from 'ink';
import Select from './components/select.js';
import MultiSelect from './components/multi-select.js';
import TextPrompt from './components/text-prompt.js';
import {
	type BenchConfig,
	type Dialect,
	type Harness,
	type Reasoning,
	type SampleSize,
	type Task,
	concurrencies,
	defaultOutput,
	dialects,
	harnesses,
	modelPlaceholders,
	reasoningChoices,
	sampleSizes,
	tasks,
	validateModel,
} from './options.js';

export type Answers = {
	harness?: Harness;
	model?: string;
	dialects?: Dialect[];
	reasoning?: Reasoning;
	tasks?: Task[];
	judgeHarness?: Harness;
	judgeModel?: string;
	sampleSize?: SampleSize;
	concurrency?: number;
	output?: string;
};

type Step = keyof Answers | 'review';

const steps: Step[] = [
	'harness',
	'model',
	'dialects',
	'reasoning',
	'tasks',
	'judgeHarness',
	'judgeModel',
	'sampleSize',
	'concurrency',
	'output',
	'review',
];

const questions: Record<Step, string> = {
	harness: 'Which harness should run the benchmark?',
	model: 'Which model id should it use?',
	dialects: 'Which dialects should be benchmarked?',
	reasoning: 'What reasoning level?',
	tasks: 'Which tasks should the model be tested on?',
	judgeHarness: 'Which harness should run the judge for Tifinagh → English answers?',
	judgeModel: 'Which model id should judge?',
	sampleSize: 'How many words per dialect?',
	concurrency: 'How many sessions in parallel?',
	output: 'Where should results be written?',
	review: 'Ready to run?',
};

const helpText: Partial<Record<Step, string>> = {
	dialects: 'space to toggle · a for all · enter to confirm',
	tasks: 'space to toggle · a for all · enter to confirm',
	model: 'type or paste · enter to confirm',
	judgeModel: 'type or paste · enter to confirm',
	output: 'type or paste · enter to confirm',
};

type Props = {
	initial: Answers;
	locked: ReadonlySet<keyof Answers>;
	seed: number;
	wordCounts: Partial<Record<Dialect, number>>;
	batchSize: number;
};

// Only Tifinagh → English answers are free text, so the judge questions depend on it.
export function needsJudge(answers: Answers): boolean {
	return answers.tasks?.includes('tif-to-en') ?? true;
}

export function toConfig(answers: Required<Answers>, seed: number): BenchConfig {
	const {judgeHarness, judgeModel, ...rest} = answers;
	return {
		...rest,
		judge: needsJudge(answers) ? {harness: judgeHarness, model: judgeModel} : null,
		seed,
		timeout: 600,
		batchSize: 100,
		retries: 2,
	};
}

function labelOf<T extends string>(choices: Array<{value: T; label: string}>, value: T) {
	return choices.find(choice => choice.value === value)?.label ?? value;
}

function describe(step: keyof Answers, answers: Answers): string {
	const {harness = 'codex'} = answers;
	switch (step) {
		case 'harness':
			return labelOf(harnesses, answers.harness!);
		case 'judgeHarness':
			return labelOf(harnesses, answers.judgeHarness!);
		case 'dialects':
			return answers.dialects!.map(value => labelOf(dialects, value)).join(', ');
		case 'reasoning':
			return labelOf(reasoningChoices(harness), answers.reasoning!);
		case 'tasks':
			return answers.tasks!.map(value => labelOf(tasks, value)).join(', ');
		case 'sampleSize':
			return labelOf(sampleSizes, answers.sampleSize!);
		default:
			return String(answers[step]);
	}
}

export default function App({initial, locked, seed, wordCounts, batchSize}: Props) {
	const {exit} = useApp();
	const [answers, setAnswers] = useState<Answers>(initial);
	const isRelevant = (step: Step, current = answers) =>
		(step !== 'judgeHarness' && step !== 'judgeModel') || needsJudge(current);
	const isOpen = (step: Step, current = answers) =>
		step === 'review' || (isRelevant(step, current) && !locked.has(step));

	const [index, setIndex] = useState(() => steps.findIndex(step => isOpen(step)));
	const step = steps[index]!;
	const firstIndex = steps.findIndex(step => isOpen(step));

	const advance = (patch: Answers) => {
		const next = {...answers, ...patch};
		// Effort levels differ per harness, so drop one the new harness lacks.
		if (
			next.harness &&
			next.reasoning &&
			!reasoningChoices(next.harness).some(choice => choice.value === next.reasoning)
		) {
			delete next.reasoning;
		}

		let nextIndex = index + 1;
		while (!isOpen(steps[nextIndex]!, next)) nextIndex++;
		setAnswers(next);
		setIndex(nextIndex);
	};

	const back = () => {
		let previous = index - 1;
		while (previous >= 0 && !isOpen(steps[previous]!)) previous--;
		if (previous >= 0) setIndex(previous);
	};

	useInput((_input, key) => {
		if (key.escape) back();
	});

	const harness = answers.harness ?? 'codex';
	const dialectChoices = dialects.map(dialect => {
		const count = wordCounts[dialect.value];
		return count === undefined
			? dialect
			: {...dialect, hint: `${dialect.hint}, ${count.toLocaleString('en-US')} words`};
	});

	let prompt: React.ReactNode;
	switch (step) {
		case 'harness':
			prompt = (
				<Select
					choices={harnesses}
					initial={answers.harness}
					onSubmit={value => advance({harness: value})}
				/>
			);
			break;
		case 'model':
			prompt = (
				<TextPrompt
					initial={answers.model}
					placeholder={modelPlaceholders[harness]}
					validate={value => validateModel(harness, value)}
					onSubmit={value => advance({model: value})}
				/>
			);
			break;
		case 'dialects':
			prompt = (
				<MultiSelect
					choices={dialectChoices}
					initial={answers.dialects ?? dialects.map(dialect => dialect.value)}
					onSubmit={values => advance({dialects: values})}
				/>
			);
			break;
		case 'reasoning':
			prompt = (
				<Select
					choices={reasoningChoices(harness)}
					initial={answers.reasoning}
					onSubmit={value => advance({reasoning: value})}
				/>
			);
			break;
		case 'tasks':
			prompt = (
				<MultiSelect
					choices={tasks}
					initial={answers.tasks ?? ['tif-to-en']}
					onSubmit={values => advance({tasks: values})}
				/>
			);
			break;
		case 'judgeHarness':
			prompt = (
				<Select
					choices={harnesses}
					initial={answers.judgeHarness ?? answers.harness}
					onSubmit={value => advance({judgeHarness: value})}
				/>
			);
			break;
		case 'judgeModel': {
			const judgeHarness = answers.judgeHarness ?? harness;
			prompt = (
				<TextPrompt
					initial={
						answers.judgeModel ??
						(judgeHarness === answers.harness ? answers.model : undefined)
					}
					placeholder={modelPlaceholders[judgeHarness]}
					validate={value => validateModel(judgeHarness, value)}
					onSubmit={value => advance({judgeModel: value})}
				/>
			);
			break;
		}

		case 'sampleSize':
			prompt = (
				<Select
					choices={sampleSizes}
					initial={answers.sampleSize ?? '250'}
					onSubmit={value => advance({sampleSize: value})}
				/>
			);
			break;
		case 'concurrency':
			prompt = (
				<Select
					choices={concurrencies}
					initial={String(answers.concurrency ?? 4)}
					onSubmit={value => advance({concurrency: Number(value)})}
				/>
			);
			break;
		case 'output':
			prompt = (
				<TextPrompt
					initial={answers.output ?? defaultOutput(harness, answers.model ?? 'model')}
					validate={value => (value === '' ? 'Enter a folder.' : undefined)}
					onSubmit={value => advance({output: value})}
				/>
			);
			break;
		case 'review':
			prompt = (
				<Select
					choices={[
						{value: 'start', label: 'Start benchmark'},
						{value: 'back', label: 'Go back'},
						{value: 'cancel', label: 'Cancel'},
					]}
					onSubmit={value => {
						if (value === 'back') back();
						else if (value === 'cancel') exit();
						else exit(toConfig(answers as Required<Answers>, seed));
					}}
				/>
			);
			break;
	}

	const answered = steps
		.slice(0, index)
		.filter(
			(done): done is keyof Answers =>
				done !== 'review' && isRelevant(done) && answers[done] !== undefined,
		);

	return (
		<Box flexDirection="column">
			<Text bold color="magenta">
				ⵜⵉⴼⵉⵏⴰⵖ tifinagh-bench
			</Text>
			<Box flexDirection="column" marginY={1}>
				{answered.map(done => (
					<Text key={done}>
						<Text color="green">✔ </Text>
						<Text dimColor>{questions[done]} </Text>
						<Text>{describe(done, answers)}</Text>
					</Text>
				))}
			</Box>
			{step === 'review' && <Text>Batch size: {batchSize} words per session</Text>}
			<Text bold>{questions[step]}</Text>
			{/* A key per step remounts the prompt, so typed text and cursor never carry over. */}
			<Box key={step}>{prompt}</Box>
			<Box marginTop={1}>
				<Text dimColor>
					{helpText[step] ?? '↑/↓ to move · enter to choose'}
					{index > firstIndex ? ' · esc to go back' : ''}
				</Text>
			</Box>
		</Box>
	);
}
