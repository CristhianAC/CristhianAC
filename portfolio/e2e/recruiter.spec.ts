import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('es recruiter page has the key facts and CV link', async ({ page }) => {
	await page.goto('/es/recruiter');
	for (const text of [
		'Cristhian Agamez',
		'UnderCodes',
		'Procto',
		'ngx-gaia-gis',
		'My Little Venture',
		'hiberus'
	]) {
		await expect(page.locator('main')).toContainText(text);
	}
	await expect(page.locator('a[href="/cv/cristhian-agamez-cv-es.pdf"]')).toBeVisible();
	await expect(page.locator('main')).toContainText('2024-02 – presente');
});

test('en recruiter page is in English with the English CV', async ({ page }) => {
	await page.goto('/en/recruiter');
	await expect(page.locator('main')).toContainText('Software architect and founder of UnderCodes');
	await expect(page.locator('a[href="/cv/cristhian-agamez-cv-en.pdf"]')).toBeVisible();
});

test('recruiter mode is one click from the game page', async ({ page }) => {
	await page.goto('/es');
	await page.getByRole('link', { name: 'Modo reclutador' }).click();
	await expect(page).toHaveURL(/\/es\/recruiter$/);
});

test('language switch keeps the page', async ({ page }) => {
	await page.goto('/es/recruiter');
	await page.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL(/\/en\/recruiter$/);
});

test('one h1 and h2 sections', async ({ page }) => {
	await page.goto('/es/recruiter');
	await expect(page.locator('h1')).toHaveCount(1);
	expect(await page.locator('h2').count()).toBeGreaterThan(3);
});

test('back button returns to the quiz show', async ({ page }) => {
	await page.goto('/es/recruiter');
	await page.getByRole('link', { name: 'Volver al show' }).first().click();
	await expect(page).toHaveURL(/\/es$/);
});
