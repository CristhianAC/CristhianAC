<script lang="ts">
	import { onMount } from 'svelte';
	import { t, ui, type Locale } from '$lib/i18n';
	import { muted, setMuted, unlock } from '$lib/audio/sound';

	let { lang }: { lang: Locale } = $props();
	// The server cannot read localStorage: render "on" until mounted so hydration matches.
	let mounted = $state(false);
	onMount(() => (mounted = true));
	const off = $derived(mounted && $muted);

	function toggle() {
		const next = !off;
		setMuted(next);
		if (!next) unlock(); // unmuting is a user gesture: safe to create/resume the context (plays nothing)
	}
</script>

<button type="button" class="qbtn sound" aria-label={t(off ? ui.soundOff : ui.soundOn, lang)} onclick={toggle}>
	<svg viewBox="0 0 12 10" width="24" height="20" aria-hidden="true" shape-rendering="crispEdges">
		<path d="M0 3h2v4H0zM2 2h2v6H2zM4 1h1v8H4zM5 0h1v10H5z" fill="currentColor" />
		{#if off}
			<path d="M7 3h1v1H7zM8 4h1v2H8zM9 3h1v1H9zM7 6h1v1H7zM9 6h1v1H9zM10 2h1v1h-1zM10 7h1v1h-1z" fill="currentColor" />
		{:else}
			<path d="M7 4h1v2H7zM9 2h1v1H9zM10 3h1v4h-1zM9 7h1v1H9z" fill="currentColor" />
		{/if}
	</svg>
</button>

<style>
	.sound {
		display: inline-flex;
		width: auto;
		padding: 0.3rem 0.45rem;
		line-height: 0;
	}
</style>
