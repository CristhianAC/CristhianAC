import type { L } from '$lib/i18n';
import type { Question, Round } from '$lib/content/types';

export type Lifeline = 'duck' | 'readme' | 'blame';
export type Response = number | boolean | number[]; // choice/spot/cta: index; truefalse: boolean; order/match: index array
export type GameState = {
	round: number;
	question: number;
	answered: { id: string; correct: boolean }[];
	used: Lifeline[];
	removed: number[];
	finished: boolean;
};
export type Stage = 'build' | 'test' | 'staging' | 'produccion';
export type Reveal = { kind: 'text'; text: L } | { kind: 'removed'; options: number[] };

const STAGES: Stage[] = ['build', 'test', 'staging', 'produccion'];

export const createGame = (): GameState => ({
	round: 0,
	question: 0,
	answered: [],
	used: [],
	removed: [],
	finished: false
});

export const current = (rounds: Round[], s: GameState): Question => rounds[s.round].questions[s.question];

const isIdentity = (r: Response) => Array.isArray(r) && r.every((v, i) => v === i);

export function isCorrect(q: Question, r: Response): boolean {
	switch (q.kind) {
		case 'choice':
			return r === q.answer;
		case 'truefalse':
			return r === q.answer;
		case 'order':
			return isIdentity(r) && (r as number[]).length === q.items.length;
		case 'match':
			return isIdentity(r) && (r as number[]).length === q.pairs.length;
		default: // spot, cta: any response is accepted
			return true;
	}
}

export function submit(rounds: Round[], s: GameState, r: Response): { state: GameState; correct: boolean } {
	if (s.finished) return { state: s, correct: false };
	const q = current(rounds, s);
	const correct = isCorrect(q, r);
	const answered = [...s.answered, { id: q.id, correct }];
	if (s.question + 1 < rounds[s.round].questions.length)
		return { state: { ...s, answered, question: s.question + 1, removed: [] }, correct };
	if (s.round + 1 < rounds.length)
		return { state: { ...s, answered, round: s.round + 1, question: 0, removed: [] }, correct };
	return { state: { ...s, answered, removed: [], finished: true }, correct };
}

export function useLifeline(
	rounds: Round[],
	s: GameState,
	l: Lifeline
): { state: GameState; reveal: Reveal } | null {
	if (s.finished || s.used.includes(l)) return null;
	const q = current(rounds, s);
	const used = [...s.used, l];
	if (l === 'duck') return { state: { ...s, used }, reveal: { kind: 'text', text: q.duckHint } };
	if (l === 'readme') return { state: { ...s, used }, reveal: { kind: 'text', text: q.readme } };
	if (l === 'blame' && q.kind === 'choice') {
		const options = q.options.map((_, i) => i).filter((i) => i !== q.answer).slice(0, 2);
		return { state: { ...s, used, removed: options }, reveal: { kind: 'removed', options } };
	}
	return null;
}

export function stage(s: GameState, total: number): Stage {
	const step = Math.max(1, Math.floor(total / 4));
	return STAGES[Math.min(3, Math.floor(s.answered.length / step))];
}
