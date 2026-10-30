import { spawn } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { chromium } from '@playwright/test';

const PORT = 4174;
const out = 'static/cv';
mkdirSync(out, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
	stdio: 'ignore'
});
const stop = () => server.kill();
process.on('exit', stop);

async function waitUp() {
	for (let i = 0; i < 50; i++) {
		try {
			if ((await fetch(`http://localhost:${PORT}/es/cv`)).ok) return;
		} catch {}
		await new Promise((r) => setTimeout(r, 200));
	}
	throw new Error('preview server did not start (is build/ present? run npm run build)');
}

try {
	await waitUp();
	const browser = await chromium.launch();
	for (const lang of ['es', 'en']) {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${PORT}/${lang}/cv`);
		const path = `${out}/cristhian-agamez-cv-${lang}.pdf`;
		await page.pdf({ path, format: 'A4', printBackground: true, preferCSSPageSize: true });
		if (statSync(path).size < 20_000) throw new Error(`${path} too small`);
		console.log('wrote', path);
	}
	await browser.close();
} catch (e) {
	console.error(e);
	process.exitCode = 1;
} finally {
	stop();
}
