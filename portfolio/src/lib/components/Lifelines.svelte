<script lang="ts">
	import { t, ui, type Locale } from '$lib/i18n';
	import type { Lifeline } from '$lib/game/engine';
	import { pop } from '$lib/motion/fx';

	type Props = {
		used: Lifeline[];
		available: Record<Lifeline, boolean>;
		onuse: (l: Lifeline) => void;
		lang: Locale;
	};
	let { used, available, onuse, lang }: Props = $props();
	const labels: Record<Lifeline, string> = {
		duck: 'lifelineDuck',
		readme: 'lifelineReadme',
		blame: 'lifelineBlame'
	};
	const all: Lifeline[] = ['duck', 'readme', 'blame'];
</script>

<div class="lifelines">
	{#each all as l}
		<button type="button" class="qbtn" disabled={used.includes(l) || !available[l]} onclick={(e) => (pop(e.currentTarget), onuse(l))}>
			{t(ui[labels[l]], lang)}
		</button>
	{/each}
</div>

<style>
	.lifelines {
		display: flex;
		flex-wrap: wrap;
		gap: 0.9rem;
		padding: 4px;
	}
	.qbtn {
		width: auto;
		font-size: 0.9rem;
	}
</style>
