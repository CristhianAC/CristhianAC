<script lang="ts">
	import { t, ui, type Locale } from '$lib/i18n';
	import { assemble } from '$lib/motion/fx';

	let { anecdote, lang }: { anecdote: string; lang: Locale } = $props();
</script>

<article class="card" use:assemble={{ preset: 'slide' }}>
	<h2 tabindex="-1" data-focus>{t(ui.buildFailed, lang)}</h2>
	<p>{anecdote}</p>
</article>

<style>
	.card {
		margin-bottom: 1.2rem;
		padding: 1rem 1.2rem;
		background: var(--paper);
		color: var(--ink);
		box-shadow:
			0 0 0 4px var(--ink),
			0 0 0 8px var(--red);
	}
	h2 {
		margin: 0 0 0.5rem;
		font: 700 0.85rem/1.3 var(--font-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--red-deep);
	}
	h2:focus {
		outline: none;
	}
	p {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.5;
	}
</style>
