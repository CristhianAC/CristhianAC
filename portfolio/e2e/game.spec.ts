import { expect, test, type Page } from '@playwright/test';
import { rounds } from '../src/lib/content/rounds';
import type { Question } from '../src/lib/content/types';

type Lang = 'es' | 'en';
const copy = {
	es: { start: 'Empezar', next: 'Seguir', confirm: 'Confirmar', compiled: /Compilado/, pipeline: 'Pipeline de despliegue', prod: 'producción', unlocked: 'Desbloqueado en el set' },
	en: { start: 'Start', next: 'Continue', confirm: 'Confirm', compiled: /Compiled/, pipeline: 'Deployment pipeline', prod: 'production', unlocked: 'Unlocked on set' }
};

// Picking the first available control: choice/truefalse depend on content; order starts reversed and
// match pairs each left item with the first free (rotated) right item, so both are always wrong.
const firstPickIsWrong = (q: Question) =>
	q.kind === 'choice' ? q.answer !== 0 : q.kind === 'truefalse' ? q.answer !== true : q.kind === 'order' || q.kind === 'match';

async function answerFirst(page: Page, q: Question, lang: Lang) {
	const mechanic = page.locator(`[data-kind="${q.kind}"]`);
	await expect(mechanic).toBeVisible();
	if (q.kind === 'match') {
		const [left, right] = [mechanic.locator('ul').nth(0), mechanic.locator('ul').nth(1)];
		for (let i = 0; i < q.pairs.length; i++) {
			await left.getByRole('button').nth(i).press('Enter'); // keyboard
			await right.locator('button:enabled').first().press('Enter');
		}
		await mechanic.getByRole('button', { name: copy[lang].confirm }).click();
	} else if (q.kind === 'order') {
		await mechanic.getByRole('button', { name: copy[lang].confirm }).press('Enter');
	} else {
		await mechanic.locator('button:enabled').first().click();
	}
}

for (const lang of ['es', 'en'] as Lang[]) {
	test(`a full run reaches the end screen (${lang})`, async ({ page }) => {
		const c = copy[lang];
		await page.goto(`/${lang}`);
		await page.getByRole('button', { name: c.start }).click();
		let anecdotes = 0;
		for (const round of rounds) {
			await expect(page.getByRole('heading', { name: round.code })).toBeFocused();
			await page.getByRole('button', { name: c.next }).click();
			for (const q of round.questions) {
				if (q.kind === 'cta') continue; // the cta question is the end screen
				await answerFirst(page, q, lang);
				if (firstPickIsWrong(q)) {
					await expect(page.getByText(q.anecdote[lang])).toBeVisible();
					anecdotes++;
				} else {
					await expect(page.getByRole('heading', { name: c.compiled })).toBeVisible();
				}
				const unlocks = page.getByRole('region', { name: c.unlocked });
				if (q.id === 'p7') await expect(unlocks).toContainText('UnderCodes');
				if (q.unlocks.length === 0) await expect(unlocks).toHaveCount(0);
				await page.getByRole('button', { name: c.next }).click();
			}
		}
		expect(anecdotes).toBeGreaterThan(0);
		await expect(page.getByRole('heading', { name: 'SYSTEM' })).toBeFocused();
		await expect(page.getByRole('region', { name: c.unlocked })).toContainText('GitHub');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('a[href="https://www.linkedin.com/in/cristhianac"]')).toBeVisible();
		await expect(page.locator('a[href="https://undercodes.net"]')).toBeVisible();
		const ladder = page.getByRole('navigation', { name: c.pipeline });
		await expect(ladder.locator('[aria-current="step"]')).toContainText(c.prod);
		await expect(page.locator('.piece.compiled')).toHaveCount(12);
	});
}

test('git blame on P1 disables two options', async ({ page }) => {
	await page.goto('/es');
	await page.getByRole('button', { name: 'Empezar' }).click();
	await page.getByRole('button', { name: 'Seguir' }).click();
	const choice = page.locator('[data-kind="choice"]');
	await expect(choice.locator('button:disabled')).toHaveCount(0);
	await page.getByRole('button', { name: 'git blame' }).click();
	await expect(choice.locator('button:disabled')).toHaveCount(2);
	await expect(page.getByRole('button', { name: 'git blame' })).toBeDisabled();
});

for (const [width, height] of [[390, 844], [800, 600], [1024, 768], [1440, 900]]) {
	test(`the pipeline ladder never overlaps the stage at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height });
		await page.goto('/es');
		const ladder = (await page.getByRole('navigation', { name: 'Pipeline de despliegue' }).boundingBox())!;
		const stage = (await page.locator('[data-era]').boundingBox())!;
		const overlaps =
			ladder.x < stage.x + stage.width &&
			stage.x < ladder.x + ladder.width &&
			ladder.y < stage.y + stage.height &&
			stage.y < ladder.y + ladder.height;
		expect(overlaps).toBe(false);
	});
}
