import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import type {Choice} from '../options.js';

type Props<T extends string> = {
	choices: Array<Choice<T>>;
	initial?: T;
	onSubmit: (value: T) => void;
};

export default function Select<T extends string>({choices, initial, onSubmit}: Props<T>) {
	const [cursor, setCursor] = useState(() =>
		Math.max(0, choices.findIndex(choice => choice.value === initial)),
	);

	useInput((input, key) => {
		if (key.upArrow || input === 'k') {
			setCursor(index => (index - 1 + choices.length) % choices.length);
		} else if (key.downArrow || input === 'j') {
			setCursor(index => (index + 1) % choices.length);
		} else if (key.return) {
			onSubmit(choices[cursor]!.value);
		} else if (/^[1-9]$/.test(input) && Number(input) <= choices.length) {
			onSubmit(choices[Number(input) - 1]!.value);
		}
	});

	return (
		<Box flexDirection="column">
			{choices.map((choice, index) => {
				const active = index === cursor;
				return (
					<Text key={choice.value}>
						<Text color="cyan">{active ? '❯ ' : '  '}</Text>
						<Text bold={active} color={active ? 'cyan' : undefined}>
							{choice.label}
						</Text>
						{choice.hint ? <Text dimColor> — {choice.hint}</Text> : null}
					</Text>
				);
			})}
		</Box>
	);
}
