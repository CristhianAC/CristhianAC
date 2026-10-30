import { describe, expect, it } from 'vitest';
import { profile } from './profile';
import { projects } from './projects';
import { rounds } from './rounds';

const isL = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && 'es' in v && 'en' in v;

function collectL(v: unknown, out: Record<string, unknown>[] = []) {
	if (Array.isArray(v)) v.forEach((x) => collectL(x, out));
	else if (isL(v)) out.push(v);
	else if (typeof v === 'object' && v !== null) Object.values(v).forEach((x) => collectL(x, out));
	return out;
}

const questions = rounds.flatMap((r) => r.questions);

describe('content', () => {
	it('has 6 rounds in order with 2 questions each', () => {
		expect(rounds.map((r) => r.code)).toEqual(['CAP-01', 'CAP-02', 'CAP-03', 'CAP-04', 'CAP-05', 'FINAL']);
		expect(rounds.every((r) => r.questions.length === 2)).toBe(true);
		expect(questions).toHaveLength(12);
	});

	it('every localized value has non-empty es and en', () => {
		const all = collectL({ rounds, projects, profile });
		expect(all.length).toBeGreaterThan(50);
		for (const l of all) {
			expect(typeof l.es === 'string' && l.es.trim() !== '').toBe(true);
			expect(typeof l.en === 'string' && l.en.trim() !== '').toBe(true);
		}
	});

	it('choice questions have 4 options and a valid answer', () => {
		for (const q of questions) {
			if (q.kind !== 'choice') continue;
			expect(q.options).toHaveLength(4);
			expect(q.answer).toBeGreaterThanOrEqual(0);
			expect(q.answer).toBeLessThan(q.options.length);
		}
	});

	it('at least 3 rounds have a non-choice question', () => {
		expect(rounds.filter((r) => r.questions.some((q) => q.kind !== 'choice')).length).toBeGreaterThanOrEqual(3);
	});

	it('FINAL ends with the contact cta', () => {
		const last = rounds[5].questions[1];
		expect(last.kind).toBe('cta');
		if (last.kind !== 'cta') return;
		expect(last.ctas.map((c) => c.href)).toEqual([
			'https://www.linkedin.com/in/cristhianac',
			'https://undercodes.net'
		]);
	});

	it('every unlock id exists', () => {
		const ids = new Set([
			...projects.map((p) => p.id),
			...[...profile.experience, ...profile.education, ...profile.teaching].map((r) => r.id)
		]);
		for (const id of questions.flatMap((q) => q.unlocks)) expect(ids.has(id), id).toBe(true);
	});

	it('question ids are unique', () => {
		const ids = questions.map((q) => q.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('every project and CV role is unlocked by some question', () => {
		const unlocked = new Set(questions.flatMap((q) => q.unlocks));
		const ids = [
			...projects.map((x) => x.id),
			...[...profile.experience, ...profile.education, ...profile.teaching].map((x) => x.id)
		];
		expect(ids.filter((id) => !unlocked.has(id))).toEqual([]);
	});
});
