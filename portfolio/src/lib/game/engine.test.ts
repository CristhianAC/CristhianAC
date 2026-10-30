import { describe, expect, it } from 'vitest';
import type { Question, Round } from '$lib/content/types';
import { rounds as realRounds } from '$lib/content/rounds';
import { createGame, current, isCorrect, stage, submit, useLifeline } from './engine';

const l = (s: string) => ({ es: s, en: s });
const base = (id: string) => ({ id, anecdote: l(`a-${id}`), duckHint: l(`d-${id}`), readme: l(`r-${id}`), unlocks: [] });
const choice = (id: string, answer: number): Question => ({
	...base(id), kind: 'choice', prompt: l('p'), options: [l('0'), l('1'), l('2'), l('3')], answer
});
const tf: Question = { ...base('tf'), kind: 'truefalse', statement: l('s'), answer: true };
const order: Question = { ...base('or'), kind: 'order', prompt: l('p'), items: [l('a'), l('b'), l('c')] };
const spot: Question = { ...base('sp'), kind: 'spot', prompt: l('p'), lines: ['x', 'y'] };
const match: Question = { ...base('ma'), kind: 'match', prompt: l('p'), pairs: [{ left: l('a'), right: l('b') }, { left: l('c'), right: l('d') }] };
const cta: Question = { ...base('ct'), kind: 'cta', prompt: l('p'), ctas: [{ label: l('x'), href: '/' }] };
const round = (questions: Question[]): Round =>
	({ code: 'CAP-01', era: 'cap01', age: l('a'), title: l('t'), questions });
const fixture = [round([choice('c1', 2), tf]), round([choice('c2', 0), cta])];

describe('engine', () => {
	it('createGame', () => {
		expect(createGame()).toEqual({ round: 0, question: 0, answered: [], used: [], removed: [], finished: false });
	});

	it('isCorrect per kind', () => {
		expect(isCorrect(choice('c', 2), 2)).toBe(true);
		expect(isCorrect(choice('c', 2), 1)).toBe(false);
		expect(isCorrect(tf, true)).toBe(true);
		expect(isCorrect(tf, false)).toBe(false);
		expect(isCorrect(order, [0, 1, 2])).toBe(true);
		expect(isCorrect(order, [1, 0, 2])).toBe(false);
		expect(isCorrect(spot, 1)).toBe(true);
		expect(isCorrect(match, [0, 1])).toBe(true);
		expect(isCorrect(match, [1, 0])).toBe(false);
		expect(isCorrect(cta, 0)).toBe(true);
	});

	it('wrong answer records and advances without losing', () => {
		const s0 = createGame();
		const { state, correct } = submit(fixture, s0, 1);
		expect(correct).toBe(false);
		expect(state).toMatchObject({ round: 0, question: 1, finished: false });
		expect(state.answered).toEqual([{ id: 'c1', correct: false }]);
		expect(s0.answered).toEqual([]); // input not mutated
	});

	it('moves to next round and clears removed', () => {
		let s = { ...createGame(), removed: [0, 1] };
		s = submit(fixture, s, 2).state;
		s = submit(fixture, s, true).state;
		expect(s).toMatchObject({ round: 1, question: 0, removed: [] });
		expect(current(fixture, s).id).toBe('c2');
	});

	it('finishes on last question and then ignores submits', () => {
		let s = createGame();
		for (const r of [2, true, 0, 0]) s = submit(fixture, s, r).state;
		expect(s.finished).toBe(true);
		expect(s.answered).toHaveLength(4);
		const again = submit(fixture, s, 0);
		expect(again.state).toBe(s);
	});

	it('blame removes the two lowest wrong options, never the answer', () => {
		const out = useLifeline(fixture, createGame(), 'blame')!;
		expect(out.reveal).toEqual({ kind: 'removed', options: [0, 1] });
		expect(out.state.removed).toEqual([0, 1]);
		expect(out.state.used).toEqual(['blame']);
		const s = submit(fixture, submit(fixture, createGame(), 2).state, true).state; // round 1, answer 0
		const out2 = useLifeline(fixture, s, 'blame')!;
		expect(out2.reveal).toEqual({ kind: 'removed', options: [1, 2] });
	});

	it('clears blamed options on a same-round advance', () => {
		const out = useLifeline(fixture, createGame(), 'blame')!;
		const state = submit(fixture, out.state, 2).state;
		expect(state.removed).toEqual([]);
	});

	it('blame on a non-choice question returns null', () => {
		const s = { ...createGame(), question: 1 };
		expect(useLifeline(fixture, s, 'blame')).toBeNull();
	});

	it('duck and readme reveal text', () => {
		const q = current(fixture, createGame());
		expect(useLifeline(fixture, createGame(), 'duck')!.reveal).toEqual({ kind: 'text', text: q.duckHint });
		expect(useLifeline(fixture, createGame(), 'readme')!.reveal).toEqual({ kind: 'text', text: q.readme });
	});

	it('each lifeline works once; unknown returns null', () => {
		const first = useLifeline(fixture, createGame(), 'duck')!;
		expect(useLifeline(fixture, first.state, 'duck')).toBeNull();
		expect(useLifeline(fixture, createGame(), 'nope' as never)).toBeNull();
	});

	it('stage thresholds for total 12', () => {
		const at = (n: number) => stage({ ...createGame(), answered: Array(n).fill({ id: 'x', correct: true }) }, 12);
		expect([0, 2, 3, 5, 6, 8, 9, 12].map(at)).toEqual(
			['build', 'build', 'test', 'test', 'staging', 'staging', 'produccion', 'produccion']
		);
	});

	it('plays the real content to the end', () => {
		let s = createGame();
		const total = realRounds.reduce((n, r) => n + r.questions.length, 0);
		for (let i = 0; i < total; i++) s = submit(realRounds, s, 0).state;
		expect(s.finished).toBe(true);
		expect(s.answered).toHaveLength(total);
	});
});
