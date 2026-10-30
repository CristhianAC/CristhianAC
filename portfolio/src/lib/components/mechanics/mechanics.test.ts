import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Choice from './Choice.svelte';
import TrueFalse from './TrueFalse.svelte';
import OrderTimeline from './OrderTimeline.svelte';
import SpotLine from './SpotLine.svelte';
import MatchPairs from './MatchPairs.svelte';
import CtaChoice from './CtaChoice.svelte';
import Lifelines from '../Lifelines.svelte';
import type { Question } from '$lib/content/types';

const l = (s: string) => ({ es: s, en: s });
const base = { id: 'q', anecdote: l('a'), duckHint: l('d'), readme: l('r'), unlocks: [] };
const q = <K extends Question['kind']>(x: Extract<Question, { kind: K }>) => x;

describe('Choice', () => {
	const question = q({ ...base, kind: 'choice', prompt: l('p'), options: [l('A'), l('B'), l('C')], answer: 0 });
	it('answers with the clicked index, once', async () => {
		const onanswer = vi.fn();
		render(Choice, { question, lang: 'es', onanswer });
		await fireEvent.click(screen.getByText('C'));
		await fireEvent.click(screen.getByText('B'));
		expect(onanswer).toHaveBeenCalledOnce();
		expect(onanswer).toHaveBeenCalledWith(2);
	});
	it('disables removed options', () => {
		render(Choice, { question, lang: 'es', removed: [1], onanswer: vi.fn() });
		expect((screen.getByText('B') as HTMLButtonElement).disabled).toBe(true);
		expect((screen.getByText('A') as HTMLButtonElement).disabled).toBe(false);
	});
});

describe('TrueFalse', () => {
	const question = q({ ...base, kind: 'truefalse', statement: l('s'), answer: true });
	it('maps Verdadero/Falso to booleans', async () => {
		const a = vi.fn();
		render(TrueFalse, { question, lang: 'es', onanswer: a });
		await fireEvent.click(screen.getByRole('button', { name: 'Falso' }));
		expect(a).toHaveBeenCalledWith(false);
		expect(screen.getByRole('button', { name: 'Verdadero' })).toBeTruthy();
	});
	it('answers true in English', async () => {
		const a = vi.fn();
		render(TrueFalse, { question, lang: 'en', onanswer: a });
		await fireEvent.click(screen.getByRole('button', { name: 'True' }));
		expect(a).toHaveBeenCalledWith(true);
	});
});

describe('OrderTimeline', () => {
	const question = q({ ...base, kind: 'order', prompt: l('p'), items: [l('one'), l('two'), l('three')] });
	it('starts shuffled and answers with the arranged original indices', async () => {
		const a = vi.fn();
		render(OrderTimeline, { question, lang: 'es', onanswer: a });
		// start: [2,1,0]; move "three" is at top (disabled up); move "one" up -> [2,0,1]
		await fireEvent.click(screen.getByRole('button', { name: 'Subir: one' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
		expect(a).toHaveBeenCalledOnce();
		expect(a).toHaveBeenCalledWith([2, 0, 1]);
	});
	it('can reach the correct order with buttons only', async () => {
		const a = vi.fn();
		render(OrderTimeline, { question, lang: 'es', onanswer: a });
		await fireEvent.click(screen.getByRole('button', { name: 'Bajar: three' })); // [1,2,0]
		await fireEvent.click(screen.getByRole('button', { name: 'Bajar: three' })); // [1,0,2]
		await fireEvent.click(screen.getByRole('button', { name: 'Subir: one' })); // [0,1,2]
		await fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
		expect(a).toHaveBeenCalledWith([0, 1, 2]);
	});
});

describe('SpotLine', () => {
	it('answers with the selected line index', async () => {
		const a = vi.fn();
		const question = q({ ...base, kind: 'spot', prompt: l('p'), lines: ['a = 1', 'b = 2', 'c = 3', 'd = 4'] });
		render(SpotLine, { question, lang: 'es', onanswer: a });
		await fireEvent.click(screen.getByText('d = 4'));
		expect(a).toHaveBeenCalledWith(3);
	});
});

describe('MatchPairs', () => {
	const question = q({
		...base,
		kind: 'match',
		prompt: l('p'),
		pairs: [
			{ left: l('L0'), right: l('R0') },
			{ left: l('L1'), right: l('R1') },
			{ left: l('L2'), right: l('R2') }
		]
	});
	it('builds the index array and needs all pairs before confirming', async () => {
		const a = vi.fn();
		render(MatchPairs, { question, lang: 'es', onanswer: a });
		const confirm = screen.getByRole('button', { name: 'Confirmar' }) as HTMLButtonElement;
		expect(confirm.disabled).toBe(true);
		for (const [left, right] of [['L0', 'R0'], ['L1', 'R1'], ['L2', 'R2']]) {
			await fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${left}`) }));
			// right column buttons are exactly the right label
			await fireEvent.click(screen.getByRole('button', { name: right }));
		}
		expect(confirm.disabled).toBe(false);
		await fireEvent.click(confirm);
		expect(a).toHaveBeenCalledOnce();
		expect(a).toHaveBeenCalledWith([0, 1, 2]);
	});
	it('shows the right column in a different order than the left', () => {
		render(MatchPairs, { question, lang: 'es', onanswer: vi.fn() });
		const right = screen.getAllByRole('list')[1].querySelectorAll('button');
		expect([...right].map((b) => b.textContent?.trim())).toEqual(['R1', 'R2', 'R0']);
	});
});

describe('CtaChoice', () => {
	it('renders links and reports the index without blocking navigation', async () => {
		const a = vi.fn();
		const question = q({
			...base,
			kind: 'cta',
			prompt: l('p'),
			ctas: [
				{ label: l('Uno'), href: '#a' },
				{ label: l('Dos'), href: '#b' }
			]
		});
		render(CtaChoice, { question, lang: 'es', onanswer: a });
		const link = screen.getByRole('link', { name: 'Dos' });
		expect(link.getAttribute('href')).toBe('#b');
		expect(screen.getByRole('link', { name: 'Uno' }).getAttribute('href')).toBe('#a');
		// fireEvent returns false when default was prevented
		expect(await fireEvent.click(link)).toBe(true);
		expect(a).toHaveBeenCalledWith(1);
	});
});

describe('Lifelines', () => {
	it('disables used and unavailable lifelines', () => {
		render(Lifelines, {
			used: ['duck'],
			available: { duck: true, readme: true, blame: false },
			onuse: vi.fn(),
			lang: 'es'
		});
		expect((screen.getByRole('button', { name: 'Patito de goma' }) as HTMLButtonElement).disabled).toBe(true);
		expect((screen.getByRole('button', { name: 'git blame' }) as HTMLButtonElement).disabled).toBe(true);
		expect((screen.getByRole('button', { name: 'Leer el README' }) as HTMLButtonElement).disabled).toBe(false);
	});
	it('calls onuse with the lifeline', async () => {
		const onuse = vi.fn();
		render(Lifelines, {
			used: [],
			available: { duck: true, readme: true, blame: true },
			onuse,
			lang: 'en'
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Read the README' }));
		expect(onuse).toHaveBeenCalledWith('readme');
	});
});
