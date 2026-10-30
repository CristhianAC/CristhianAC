import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	compilerOptions: { runes: true },
	kit: {
		adapter: adapter(),
		prerender: {
			// CV PDFs are added in a later task; remove this once they exist.
			handleHttpError: ({ path, message }) => {
				if (path.startsWith('/cv/')) return;
				throw new Error(message);
			}
		}
	}
};
