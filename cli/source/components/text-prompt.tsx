import React, {useState} from 'react';
import {Box, Text, useInput, usePaste} from 'ink';

type Props = {
	initial?: string;
	placeholder?: string;
	validate?: (value: string) => string | undefined;
	onSubmit: (value: string) => void;
};

export default function TextPrompt({initial = '', placeholder, validate, onSubmit}: Props) {
	const [value, setValue] = useState(initial);
	const [error, setError] = useState<string>();

	const edit = (change: (previous: string) => string) => {
		setError(undefined);
		setValue(change);
	};

	useInput((input, key) => {
		if (key.return) {
			const trimmed = value.trim();
			const problem = validate?.(trimmed);
			if (problem) setError(problem);
			else onSubmit(trimmed);
		} else if (key.backspace || key.delete) {
			edit(previous => previous.slice(0, -1));
		} else if (key.ctrl && input === 'u') {
			edit(() => '');
		} else if (input && !key.ctrl && !key.meta && !key.escape && !key.tab) {
			edit(previous => previous + input);
		}
	});

	usePaste(text => {
		edit(previous => previous + text.replaceAll(/[\r\n]+/g, ''));
	});

	return (
		<Box flexDirection="column">
			<Text>
				<Text color="cyan">❯ </Text>
				{value === '' && placeholder ? (
					<Text dimColor>{placeholder}</Text>
				) : (
					<Text>{value}</Text>
				)}
				<Text inverse> </Text>
			</Text>
			{error ? <Text color="red">{error}</Text> : null}
		</Box>
	);
}
