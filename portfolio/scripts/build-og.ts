import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4175;
const server = spawn('node_modules/.bin/vite', ['preview', '--port', String(PORT), '--strictPort'], {
	stdio: 'ignore'
});
const stop = () => server.kill();
process.on('exit', stop);

async function waitUp() {
	for (let i = 0; i < 50; i++) {
		try {
			if ((await fetch(`http://localhost:${PORT}/es`)).ok) return;
		} catch {}
		await new Promise((r) => setTimeout(r, 200));
	}
	throw new Error('preview server did not start (is build/ present? run npm run build)');
}

try {
	await waitUp();
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
	await page.goto(`http://localhost:${PORT}/es`);
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: 'static/og.png' });
	await browser.close();
	console.log('wrote static/og.png');
} catch (e) {
	console.error(e);
	process.exitCode = 1;
} finally {
	stop();
}
