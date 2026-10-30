import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('no element animates with reduced motion', async ({ page }) => {
	await page.goto('/es');
	await expect(page.locator('[data-era]')).toBeVisible();
	const animated = await page.evaluate(() =>
		[...document.querySelectorAll('*')]
			.filter((el) => getComputedStyle(el).animationName !== 'none')
			.map((el) => el.tagName + '.' + el.getAttribute('class'))
	);
	expect(animated).toEqual([]);
});

test('the stage animates when motion is allowed', async ({ browser }) => {
	const context = await browser.newContext({ reducedMotion: 'no-preference' });
	const page = await context.newPage();
	await page.goto('/es');
	const animated = await page.evaluate(
		() => [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).animationName !== 'none').length
	);
	expect(animated).toBeGreaterThan(0);
	await context.close();
});

// Any running animation (CSS or WAAPI) that touches more than opacity.
const movingAnimations = (page: import('@playwright/test').Page) =>
	page.evaluate(() =>
		document
			.getAnimations()
			.filter((a) => a.playState === 'running')
			.flatMap((a) => (a.effect as KeyframeEffect).getKeyframes())
			.flatMap((k) => Object.keys(k))
			.filter((p) => !['offset', 'computedOffset', 'easing', 'composite', 'opacity'].includes(p))
	);

test('reduced motion: answering only fades, and the host bubble shows its whole line at once', async ({ page }) => {
	await page.goto('/es');
	const typed = page.locator('.bubble .typed');
	await expect(typed).toHaveText((await page.locator('.bubble .sr-only').textContent())!);
	await expect(typed.locator('.rest')).toHaveText('');
	await page.getByRole('button', { name: 'Empezar' }).click();
	expect(await movingAnimations(page)).toEqual([]);
	await page.getByRole('button', { name: 'Seguir' }).click();
	await expect(typed.locator('.rest')).toHaveText('');
	await page.locator('[data-kind] button:enabled').first().click();
	await expect(page.getByRole('button', { name: 'Seguir' })).toBeVisible();
	expect(await movingAnimations(page)).toEqual([]);
});

test('with motion the game still advances through a few questions', async ({ browser }) => {
	const context = await browser.newContext({ reducedMotion: 'no-preference' });
	const page = await context.newPage();
	await page.goto('/es');
	await page.getByRole('button', { name: 'Empezar' }).click();
	await expect(page.getByRole('heading', { name: 'CAP-01' })).toBeFocused();
	await page.getByRole('button', { name: 'Seguir' }).click();
	for (let n = 1; n <= 3; n++) {
		await expect(page.getByRole('heading', { name: new RegExp(`Pregunta ${n}/`) })).toBeFocused();
		await page.locator('[data-kind] button:enabled').first().click();
		await page.getByRole('button', { name: 'Seguir' }).click();
		if (n === 2) {
			// CAP-02 title card between rounds: wipe, slam, shake
			await expect(page.getByRole('heading', { name: 'CAP-02' })).toBeFocused();
			await page.getByRole('button', { name: 'Seguir' }).click();
		}
	}
	await expect(page.getByRole('heading', { name: /Pregunta 4\// })).toBeVisible();
	await context.close();
});
