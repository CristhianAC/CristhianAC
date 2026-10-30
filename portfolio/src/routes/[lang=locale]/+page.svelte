<script lang="ts">
	import { t, ui } from '$lib/i18n';
	import Stage from '$lib/components/stage/Stage.svelte';
	import Host from '$lib/components/stage/Host.svelte';
	import PipelineLadder from '$lib/components/stage/PipelineLadder.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{t(ui.title, data.lang)}</title>
</svelte:head>

<!-- Placeholder demo with fixed props; Task 7 wires the game here. -->
<main>
	<Stage era="cap01" compiled={3} total={12}>
		<div class="demo">
			<div class="host"><Host line={t(ui.hostWelcome, data.lang)} talking={true} /></div>
			<div class="ladder"><PipelineLadder stage="test" commits={3} lang={data.lang} /></div>
		</div>
	</Stage>
</main>

<style>
	.demo {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: end center;
		padding: 1rem;
	}
	.host {
		margin-bottom: 6%;
	}
	.ladder {
		position: absolute;
		top: 1rem;
		right: 1rem;
	}
</style>
