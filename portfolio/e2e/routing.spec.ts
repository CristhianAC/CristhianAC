import { expect, test } from '@playwright/test';

test('root redirects to /es', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/es$/);
});

test('html lang follows the locale', async ({ page }) => {
	await page.goto('/es');
	await expect(page.locator('html')).toHaveAttribute('lang', 'es');
	await page.goto('/en');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('unknown locale returns 404', async ({ page }) => {
	const res = await page.goto('/fr');
	expect(res?.status()).toBe(404);
});
