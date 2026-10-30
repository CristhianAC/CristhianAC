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
