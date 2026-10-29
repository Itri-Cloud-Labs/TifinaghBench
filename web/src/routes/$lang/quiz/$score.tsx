import {createFileRoute, notFound} from '@tanstack/react-router';
import {QuizPage} from '../../../components/QuizPage';
import type {Lang} from '../../../i18n';
import {messagesFor} from '../../../i18n';
import {pageHead} from '../../../lib/head';
import {isQuizScore} from '../../../lib/quiz';
import {quizCardPath} from '../../../og/paths';

// The link a player shares: same quiz, with their score as the challenge and in the link preview.
export const Route = createFileRoute('/$lang/quiz/$score')({
	loader: ({params}) => {
		if (!isQuizScore(params.score)) throw notFound();
	},
	head: ({params}) => {
		const lang = params.lang as Lang;
		const t = messagesFor(lang);
		const score = Number(params.score);
		return pageHead(lang, `/quiz/${score}`, t.quiz.title, t.quiz.challenge(score), {image: quizCardPath(lang, score), alt: t.quiz.cardAlt(score)});
	},
	component: Challenge,
});

function Challenge() {
	const {score} = Route.useParams();
	return <QuizPage challenge={Number(score)} />;
}
