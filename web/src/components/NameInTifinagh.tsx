import {useId, useState} from 'react';
import {transcribe} from '../lib/tifinagh';
import {useI18n} from '../lib/lang';

// Type a name, see it in Tifinagh. Each new letter fades in as it is typed.
export function NameInTifinagh() {
	const {t} = useI18n();
	const copy = t.dialects.name;
	const inputId = useId();
	const [name, setName] = useState('');
	const [copied, setCopied] = useState(false);
	const pieces = transcribe(name || copy.placeholder).filter(piece => piece.tifinagh);
	const output = pieces.map(piece => piece.tifinagh).join('');
	const empty = !name.trim() || !transcribe(name).some(piece => piece.tifinagh.trim());

	const copyOutput = async () => {
		try {
			await navigator.clipboard.writeText(output);
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
		} catch {}
	};

	return (
		<div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
			<div>
				<h2 id="name-title" className="text-2xl">{copy.title}</h2>
				<p className="mt-3 text-ink-2">{copy.lede}</p>
				<label htmlFor={inputId} className="label mt-6 block">{copy.label}</label>
				<input
					id={inputId}
					type="text"
					value={name}
					onChange={event => setName(event.target.value.slice(0, 40))}
					placeholder={copy.placeholder}
					autoComplete="given-name"
					spellCheck={false}
					className="mt-1.5 h-11 w-full max-w-sm rounded-sm border border-rule-strong bg-slip px-3 text-lg text-ink placeholder:text-ink-3 hover:border-ink-3"
				/>
				<p className="mt-2 text-xs text-ink-3">{copy.note}</p>
			</div>
			<div className="flex min-w-0 flex-col justify-center border-t-2 border-ink pt-5">
				<p
					lang="zgh"
					className={`tifinagh text-[clamp(2.5rem,7vw,4.5rem)] leading-tight break-words ${empty ? 'text-ink-3 opacity-60' : 'text-ink'}`}
				>
					{[...output].map((char, index) => /\s/u.test(char) ? ' ' : <span key={`${index}-${char}`} className="letter-in">{char}</span>)}
				</p>
				{empty && <p className="mt-1 text-sm text-ink-3">{copy.empty}</p>}
				{!empty && (
					<>
						<p className="label mt-6">{copy.breakdown}</p>
						<ol className="mt-2 flex flex-wrap gap-x-1 gap-y-2" aria-label={copy.breakdown}>
							{pieces.filter(piece => piece.tifinagh.trim()).map((piece, index) => (
								<li key={index} className="flex min-w-10 flex-col items-center rounded-sm bg-slip-2 px-2 pt-1.5 pb-1">
									<span lang="zgh" className="tifinagh text-xl leading-none">{piece.tifinagh}</span>
									<span className="mt-1 text-xs text-ink-2">{piece.latin}</span>
								</li>
							))}
						</ol>
						<p className="mt-5">
							<button type="button" onClick={copyOutput} className="rounded-sm border border-rule-strong px-3 py-1.5 text-sm hover:bg-slip-2">
								{copied ? copy.copied : copy.copy}
							</button>
						</p>
					</>
				)}
			</div>
		</div>
	);
}
