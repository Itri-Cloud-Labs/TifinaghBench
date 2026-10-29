import {useEffect, useRef, useState} from 'react';
import {Link} from '@tanstack/react-router';
import type {Run} from '../data/runs';
import {runs, siteUrl} from '../data/runs';
import type {Round} from '../lib/quiz';
import {makeRounds, quizLength} from '../lib/quiz';
import {useI18n} from '../lib/lang';
import {LabLogo} from './LabLogo';

type Scored = Run & {script: NonNullable<Run['script']>};

// Models' script scores, best first, for the comparison once the quiz is done.
const models = runs.filter((run): run is Scored => run.script !== null).sort((a, b) => b.script.value - a.script.value);

// Ten letters, four sounds each. Rounds are drawn on Start, so the prerendered page matches the first client render.
export function AlphabetQuiz({challenge}: {challenge?: number}) {
	const {t} = useI18n();
	const [rounds, setRounds] = useState<Round[] | null>(null);
	const [index, setIndex] = useState(0);
	const [picked, setPicked] = useState<string | null>(null);
	const [score, setScore] = useState(0);
	const top = useRef<HTMLDivElement>(null);
	const done = rounds !== null && index >= rounds.length;

	const start = () => {
		setRounds(makeRounds());
		setIndex(0);
		setPicked(null);
		setScore(0);
		// On phones the page header pushes the answers off screen, so bring the quiz up.
		requestAnimationFrame(() => top.current?.scrollIntoView({block: 'start', behavior: 'smooth'}));
	};
	const pick = (choice: string) => {
		if (!rounds || picked !== null) return;
		setPicked(choice);
		if (choice === rounds[index]!.answer) setScore(value => value + 1);
	};
	const next = () => {
		setPicked(null);
		setIndex(value => value + 1);
	};

	// Keys 1–4 pick a sound; Enter moves on.
	useEffect(() => {
		if (!rounds || done) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			const choice = rounds[index]?.choices[Number(event.key) - 1];
			if (choice && picked === null) pick(choice);
			else if (event.key === 'Enter' && picked !== null && !(event.target instanceof HTMLButtonElement)) next();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	if (!rounds) {
		return (
			<div className="border-t-2 border-ink pt-8">
				{challenge !== undefined && <p className="mb-4 text-xl font-semibold text-link">{t.quiz.challenge(challenge)}</p>}
				<p lang="zgh" aria-hidden="true" className="tifinagh text-[clamp(3rem,10vw,5.5rem)] leading-none tracking-[0.12em] text-ink">ⵣ ⴰ ⵢ ⵜ</p>
				<button type="button" onClick={start} className="mt-8 h-12 rounded-sm bg-clay px-6 text-lg font-semibold text-clay-ink hover:bg-clay-deep">{t.quiz.start}</button>
			</div>
		);
	}

	if (done) return <div ref={top} className="scroll-mt-4"><Result score={score} onAgain={start} /></div>;

	const round = rounds[index]!;
	const last = index === rounds.length - 1;
	return (
		<div ref={top} className="scroll-mt-4 border-t-2 border-ink pt-6">
			<p className="text-sm font-semibold text-ink-2">{t.quiz.progress(index + 1, rounds.length)}</p>
			<ol className="mt-3 grid grid-cols-10 gap-1" aria-hidden="true">
				{rounds.map((_, i) => <li key={i} className={`h-1.5 rounded-[1px] ${i < index || (i === index && picked !== null) ? 'bg-ink' : 'bg-slip-3'}`} />)}
			</ol>

			<div className="mt-6 flex flex-col items-center sm:mt-10">
				<p className="text-ink-2">{t.quiz.question}</p>
				<p lang="zgh" className="tifinagh mt-4 text-[clamp(5.5rem,20vw,10rem)] leading-none text-ink">{round.letter}</p>
				<div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-3 sm:mt-10">
					{round.choices.map((choice, i) => {
						const isAnswer = choice === round.answer;
						const state = picked === null ? 'idle' : isAnswer ? 'right' : choice === picked ? 'wrong' : 'off';
						return (
							<button
								key={choice}
								type="button"
								onClick={() => pick(choice)}
								disabled={picked !== null}
								aria-keyshortcuts={String(i + 1)}
								className={`relative h-16 rounded-sm border-2 text-2xl font-semibold transition-colors duration-150 ${
									state === 'idle' ? 'border-rule-strong bg-slip text-ink hover:border-ink hover:bg-slip-2'
									: state === 'right' ? 'border-[var(--good)] bg-slip-2 text-[var(--good)]'
									: state === 'wrong' ? 'border-link bg-slip-2 text-link'
									: 'border-rule bg-slip text-ink-3'
								}`}
							>
								<span className="num absolute top-1.5 left-2 text-xs font-medium text-ink-3">{i + 1}</span>
								{choice}
							</button>
						);
					})}
				</div>
				<div className="mt-6 flex min-h-12 flex-col items-center gap-3" aria-live="polite">
					{picked === null ? (
						<p className="hidden text-xs text-ink-3 sm:block">{t.quiz.keys}</p>
					) : (
						<>
							<p className={`text-lg font-semibold ${picked === round.answer ? 'text-[var(--good)]' : 'text-link'}`}>
								{picked === round.answer ? t.quiz.right : t.quiz.wrong(round.answer)}
							</p>
							<button type="button" onClick={next} autoFocus className="h-11 rounded-sm bg-ink px-5 font-semibold text-slip hover:opacity-90">{last ? t.quiz.finish : t.quiz.next}</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function Result({score, onAgain}: {score: number; onAgain: () => void}) {
	const {lang, t, f} = useI18n();
	const [copied, setCopied] = useState(false);
	const percent = (score / quizLength) * 100;
	const rank = models.filter(run => run.script.value > percent).length + 1;
	const url = `${siteUrl}/${lang}/quiz/${score}`;
	const text = t.quiz.shareText(score);
	const rows = [...models.map(run => ({key: run.slug, run, value: run.script.value})), {key: 'you', run: null, value: percent}]
		.sort((a, b) => b.value - a.value || (a.run === null ? -1 : 1));

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
		} catch {}
	};

	return (
		<div className="border-t-2 border-ink pt-8">
			<div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
				<div>
					<h2 className="text-3xl sm:text-4xl">{t.quiz.result(score)}</h2>
					<p className="mt-3 text-lg">{t.quiz.verdict(score)}</p>
					<p className="mt-2 text-ink-2">{t.quiz.place(rank, models.length + 1)}</p>

					<p className="label mt-8">{t.quiz.share}</p>
					<div className="mt-2 flex flex-wrap gap-2">
						<a
							href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex h-11 items-center rounded-sm bg-ink px-4 font-semibold text-slip no-underline hover:opacity-90"
						>
							{t.quiz.postOnX}
						</a>
						<button type="button" onClick={copy} className="h-11 min-w-32 rounded-sm border border-rule-strong bg-slip px-4 font-semibold text-ink hover:bg-slip-2">
							{copied ? t.quiz.copied : t.quiz.copyLink}
						</button>
					</div>
					<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
						<button type="button" onClick={onAgain} className="h-11 rounded-sm bg-clay px-5 font-semibold text-clay-ink hover:bg-clay-deep">{t.quiz.again}</button>
						<Link to="/$lang/dialects" params={{lang}} hash="alphabet-title" className="font-medium">{t.quiz.learn}</Link>
					</div>
				</div>

				<section aria-labelledby="quiz-compare">
					<h3 id="quiz-compare" className="text-xl">{t.quiz.compareTitle}</h3>
					<p className="mt-1 text-sm text-ink-2">{t.quiz.compareCaption}</p>
					<ol className="mt-5 space-y-1.5">
						{rows.map(row => (
							<li key={row.key} className={`grid grid-cols-[minmax(0,11rem)_1fr_3rem] items-center gap-3 rounded-sm px-2 py-1 text-sm ${row.run ? '' : 'bg-slip-2 font-semibold'}`}>
								<span className="flex min-w-0 items-center gap-2">
									{row.run ? <LabLogo lab={row.run.lab} className="shrink-0 text-ink-2" /> : <span className="size-4 shrink-0" />}
									<span className="truncate">{row.run ? row.run.name : t.quiz.you}</span>
								</span>
								<span className="h-3 rounded-[2px] bg-slip-3">
									<span className={`block h-full rounded-[2px] ${row.run ? 'bg-ink-3' : 'bg-clay'}`} style={{width: `${Math.max(1, row.value)}%`}} />
								</span>
								<span className="num text-right">{row.run ? f.score(row.value) : `${score}/${quizLength}`}</span>
							</li>
						))}
					</ol>
				</section>
			</div>
		</div>
	);
}
