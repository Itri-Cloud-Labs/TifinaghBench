import {useI18n} from '../lib/lang';
import {AlphabetQuiz} from './AlphabetQuiz';

export function QuizPage({challenge}: {challenge?: number}) {
	const {t} = useI18n();
	return (
		<div className="mx-auto max-w-[84rem] px-5 pb-8 sm:px-8">
			<header className="pt-12 pb-10">
				<h1 className="max-w-[24ch] text-3xl sm:text-4xl">{t.quiz.title}</h1>
				<p className="mt-3 max-w-[60ch] text-lg text-ink-2">{t.quiz.lede}</p>
			</header>
			<AlphabetQuiz challenge={challenge} />
		</div>
	);
}
