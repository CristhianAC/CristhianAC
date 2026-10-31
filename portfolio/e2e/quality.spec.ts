import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ORIGIN = 'https://cristhianagamez.undercodes.net';
const pages = ['/es', '/en', '/es/recruiter', '/en/recruiter'];

for (const path of pages) {
	test(`seo meta on ${path}`, async ({ page }) => {
		await page.goto(path);
		await expect(page).toHaveTitle(/Cristhian Agamez/);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
		await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${ORIGIN}/og.png`);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', ORIGIN + path);
		const rest = path.slice(3);
		await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute('href', `${ORIGIN}/es${rest}`);
		await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `${ORIGIN}/en${rest}`);
		await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `${ORIGIN}/es${rest}`);
	});

	test(`axe: no serious or critical violations on ${path}`, async ({ page }) => {
		await page.goto(path);
		const { violations } = await new AxeBuilder({ page }).analyze();
		const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
		expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
	});

	test(`no horizontal scroll at 360x640 on ${path}`, async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 640 });
		await page.goto(path);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
	});
}

test('first question controls are reachable at 360x640', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 640 });
	await page.goto('/es');
	await page.getByRole('button', { name: 'Empezar' }).click();
	await page.getByRole('button', { name: 'Seguir' }).click();
	const control = page.locator('[data-kind] button:enabled').first();
	await control.scrollIntoViewIfNeeded();
	const box = (await control.boundingBox())!;
	expect(box.x).toBeGreaterThanOrEqual(0);
	expect(box.x + box.width).toBeLessThanOrEqual(360);
	expect(box.y + box.height).toBeLessThanOrEqual(640);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test('sitemap lists the 4 pages and excludes cv', async ({ request }) => {
	const res = await request.get('/sitemap.xml');
	expect(res.status()).toBe(200);
	const body = await res.text();
	for (const p of pages) expect(body).toContain(`<loc>${ORIGIN}${p}</loc>`);
	expect(body).not.toContain('/cv');
});

test('sound toggle flips its accessible name and persists across reloads', async ({ page }) => {
	await page.goto('/es');
	await page.getByRole('button', { name: 'Sonido: activado' }).click();
	await expect(page.getByRole('button', { name: 'Sonido: desactivado' })).toBeVisible();
	await page.goto('/en');
	await expect(page.getByRole('button', { name: 'Sound: off' })).toBeVisible();
	await page.getByRole('button', { name: 'Sound: off' }).click();
	await expect(page.getByRole('button', { name: 'Sound: on' })).toBeVisible();
});
