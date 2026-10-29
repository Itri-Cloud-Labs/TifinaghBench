import {createFileRoute} from '@tanstack/react-router';
import {QuizPage} from '../../../components/QuizPage';
import type {Lang} from '../../../i18n';
import {messagesFor} from '../../../i18n';
import {pageHead} from '../../../lib/head';
import {quizCardPath} from '../../../og/paths';

export const Route = createFileRoute('/$lang/quiz/')({
	head: ({params}) => {
		const lang = params.lang as Lang;
		const t = messagesFor(lang);
		return pageHead(lang, '/quiz', t.quiz.title, t.quiz.lede, {image: quizCardPath(lang), alt: t.quiz.cardAlt(null)});
	},
	component: () => <QuizPage />,
});
