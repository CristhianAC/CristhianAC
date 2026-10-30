<script lang="ts">
	import type { Stage as PipelineStage } from '$lib/game/engine';
	import { t, ui, type Locale } from '$lib/i18n';

	let { stage, commits, lang }: { stage: PipelineStage; commits: number; lang: Locale } = $props();

	const STEPS: PipelineStage[] = ['build', 'test', 'staging', 'produccion'];
	const label = (s: PipelineStage) => (s === 'produccion' ? t(ui.production, lang) : s);
	const at = $derived(STEPS.indexOf(stage));
</script>

<nav class="ladder" aria-label={t(ui.pipeline, lang)}>
	<p class="commits">{commits} {t(ui.commits, lang)}</p>
	<!-- DOM order build → producción; drawn bottom-up like a prize ladder. -->
	<ol>
		{#each STEPS as s, i (s)}
			<li class:done={i < at} class:current={i === at} aria-current={i === at ? 'step' : undefined}>
				<span class="node" aria-hidden="true"></span>
				<span class="label">{label(s)}</span>
				{#if i === at}<span class="head" aria-hidden="true">HEAD</span>{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.ladder {
		font-family: var(--font-mono);
		color: var(--paper);
		background: rgb(8 7 10 / 0.78);
		padding: 0.75rem 1rem;
		box-shadow:
			0 0 0 2px var(--ink),
			0 0 0 4px var(--red-deep);
	}
	.commits {
		margin: 0 0 0.5rem;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--red-lift);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column-reverse;
	}
	li {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.35rem 0;
		color: rgb(244 242 239 / 0.4);
	}
	/* Commit graph rail between nodes. */
	li:not(:last-child)::before {
		content: '';
		position: absolute;
		left: 4px;
		bottom: 50%;
		width: 2px;
		height: 100%;
		background: rgb(244 242 239 / 0.2);
	}
	li.done:not(:last-child)::before {
		background: var(--red);
	}
	.node {
		flex: none;
		width: 10px;
		height: 10px;
		box-shadow: inset 0 0 0 2px currentColor;
	}
	li.done {
		color: var(--paper);
	}
	li.done .node {
		background: var(--red);
		box-shadow: none;
	}
	li.current {
		color: var(--paper);
		font-weight: 600;
	}
	li.current .node {
		background: var(--red-lift);
		box-shadow: 0 0 0 2px var(--ink), 0 0 0 4px var(--red-lift);
	}
	.head {
		font-size: 0.65rem;
		padding: 0 0.3rem;
		background: var(--red);
		color: var(--paper);
	}

	@media (prefers-reduced-motion: no-preference) {
		li.current .node {
			animation: pulse 1.2s steps(2) infinite;
		}
	}
	@keyframes pulse {
		50% {
			box-shadow: 0 0 0 2px var(--ink), 0 0 0 4px var(--red-lift), 0 0 12px 4px rgb(224 26 26 / 0.6);
		}
	}
</style>
