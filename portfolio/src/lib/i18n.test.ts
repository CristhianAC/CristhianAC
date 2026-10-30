import { describe, expect, it } from 'vitest';
import { presenterLine, presenterLines, type Locale } from './i18n';

describe('presenterLine', () => {
	const langs: Locale[] = ['es', 'en'];

	it('has 6–8 short lines in both languages', () => {
		expect(presenterLines.length).toBeGreaterThanOrEqual(6);
		expect(presenterLines.length).toBeLessThanOrEqual(8);
		for (const line of presenterLines)
			for (const lang of langs) expect(line[lang].split(/\s+/).length, line[lang]).toBeLessThanOrEqual(8);
	});

	it('never repeats back-to-back across a 12-question run and fills in the number', () => {
		for (const lang of langs) {
			const run = Array.from({ length: 12 }, (_, i) => presenterLine(i, lang));
			run.forEach((line, i) => {
				expect(line).not.toContain('{n}');
				if (i > 0) expect(line).not.toBe(run[i - 1]);
			});
			expect(run[0]).toContain('1'); // question 1 is announced by number
		}
	});

	it('is deterministic per question', () => {
		expect(presenterLine(4, 'es')).toBe(presenterLine(4, 'es'));
	});
});
