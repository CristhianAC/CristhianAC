import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		passWithNoTests: true,
		expect: { requireAssertions: true },
		projects: [
			{
				extends: true,
				test: { name: 'server', environment: 'node', include: ['src/**/*.test.ts'], exclude: ['src/lib/components/**'] }
			},
			{
				extends: true,
				plugins: [svelteTesting()],
				test: { name: 'client', environment: 'jsdom', include: ['src/lib/components/**/*.test.ts'] }
			}
		]
	}
});
