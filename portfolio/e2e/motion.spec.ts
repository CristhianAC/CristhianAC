import { expect, test } from '@playwright/test';
import { rounds } from '../src/lib/content/rounds';
import { presenterLine } from '../src/lib/i18n';

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

for (const [width, height] of [[390, 844], [1280, 800]]) {
	test(`the host and bubble stay on screen after every transition at ${width}px`, async ({ browser }) => {
		const context = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width, height } });
		const page = await context.newPage();
		const settled = () =>
			page.waitForFunction(() =>
				document
					.getAnimations()
					.every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity)
			);
		const onScreen = async (screen: string) => {
			await settled();
			// The stage clips, it must not be a scroll container: focus() used to scroll it sideways (timing
			// dependent), which pushed the host and bubble off the left edge on every later screen.
			const scrolled = await page.locator('[data-era]').evaluate((el) => {
				el.scrollLeft = 400;
				el.scrollTop = 400;
				return [el.scrollLeft, el.scrollTop];
			});
			expect(scrolled, `stage scroll on ${screen}`).toEqual([0, 0]);
			for (const sel of ['.bubble', '.host img']) {
				const box = (await page.locator(sel).boundingBox())!;
				expect(box.x, `${sel} left on ${screen}`).toBeGreaterThanOrEqual(0);
				expect(box.x + box.width, `${sel} right on ${screen}`).toBeLessThanOrEqual(width);
			}
		};
		await page.goto('/es');
		await onScreen('intro');
		await page.getByRole('button', { name: 'Empezar' }).click();
		await expect(page.getByRole('heading', { name: 'CAP-01' })).toBeFocused();
		await onScreen('title');
		await page.getByRole('button', { name: 'Seguir' }).click();
		await expect(page.getByRole('heading', { name: /Pregunta 1\// })).toBeFocused();
		await onScreen('question');
		await page.locator('[data-kind] button:enabled').first().click();
		await expect(page.getByRole('button', { name: 'Seguir' })).toBeVisible();
		await onScreen('result');
		await context.close();
	});
}

test('with motion the typewriter types the presenter line and the prompt assembles word by word', async ({ browser }) => {
	const context = await browser.newContext({ reducedMotion: 'no-preference' });
	const page = await context.newPage();
	await page.goto('/es');
	await page.getByRole('button', { name: 'Empezar' }).click();
	await page.getByRole('button', { name: 'Seguir' }).click();
	const rest = page.locator('.bubble .typed .rest');
	await expect(rest).not.toHaveText(''); // still typing right after the line appears
	await expect(rest).toHaveText(''); // and it finishes
	// The host speaks a presenter line; the question is only on the panel, split into words for the stagger.
	const prompt = (rounds[0].questions[0] as { prompt: { es: string } }).prompt.es;
	await expect(page.locator('.bubble .sr-only')).toHaveText(presenterLine(0, 'es'));
	await expect(page.locator('.bubble')).not.toContainText(prompt);
	expect(await page.locator('.kinetic-prompt .w').count()).toBeGreaterThan(3);
	// One accessible copy: the panel's sr-only text; the word spans and the mechanic's own prompt are hidden.
	await expect(page.locator('.kinetic-prompt .sr-only')).toHaveText(prompt);
	await expect(page.locator('.kinetic-prompt .w').first().locator('..')).toHaveAttribute('aria-hidden', 'true');
	await expect(page.locator('.mechanic .prompt')).toBeHidden();
	await context.close();
});
