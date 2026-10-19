import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import type {Choice} from '../options.js';

type Props<T extends string> = {
	choices: Array<Choice<T>>;
	initial?: T[];
	onSubmit: (values: T[]) => void;
};

export default function MultiSelect<T extends string>({choices, initial = [], onSubmit}: Props<T>) {
	const [cursor, setCursor] = useState(0);
	const [selected, setSelected] = useState(() => new Set(initial));
	const [error, setError] = useState<string>();

	const toggle = (value: T) => {
		setError(undefined);
		setSelected(previous => {
			const next = new Set(previous);
			if (next.has(value)) next.delete(value);
			else next.add(value);
			return next;
		});
	};

	useInput((input, key) => {
		if (key.upArrow || input === 'k') {
			setCursor(index => (index - 1 + choices.length) % choices.length);
		} else if (key.downArrow || input === 'j') {
			setCursor(index => (index + 1) % choices.length);
		} else if (input === ' ') {
			toggle(choices[cursor]!.value);
		} else if (input === 'a') {
			setError(undefined);
			setSelected(previous =>
				previous.size === choices.length
					? new Set()
					: new Set(choices.map(choice => choice.value)),
			);
		} else if (key.return) {
			if (selected.size === 0) {
				setError('Select at least one.');
				return;
			}

			onSubmit(choices.map(choice => choice.value).filter(value => selected.has(value)));
		}
	});

	return (
		<Box flexDirection="column">
			{choices.map((choice, index) => {
				const active = index === cursor;
				const checked = selected.has(choice.value);
				return (
					<Text key={choice.value}>
						<Text color="cyan">{active ? '❯ ' : '  '}</Text>
						<Text color={checked ? 'green' : 'gray'}>{checked ? '◉ ' : '◯ '}</Text>
						<Text bold={active}>{choice.label}</Text>
						{choice.hint ? <Text dimColor> — {choice.hint}</Text> : null}
					</Text>
				);
			})}
			{error ? <Text color="red">{error}</Text> : null}
		</Box>
	);
}
