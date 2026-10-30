import { expect, test } from '@playwright/test';
import { profile } from '../src/lib/content/profile';

for (const lang of ['es', 'en']) {
	test(`${lang} cv pdf is served`, async ({ request }) => {
		const res = await request.get(`/cv/cristhian-agamez-cv-${lang}.pdf`);
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('application/pdf');
		expect((await res.body()).length).toBeGreaterThan(20 * 1024);
	});
}

test('es cv page has the recruiter experience, no header, noindex', async ({ page }) => {
	await page.goto('/es/cv');
	for (const r of profile.experience) {
		await expect(page.locator('main')).toContainText(r.org);
	}
	await expect(page.locator('body > div > header')).toHaveCount(0);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});
