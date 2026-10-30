<script lang="ts">
	import '../../app.css';
	import { page } from '$app/state';
	import RecruiterButton from '$lib/components/RecruiterButton.svelte';
	import LangSwitch from '$lib/components/LangSwitch.svelte';

	let { data, children } = $props();
	const path = $derived(page.url.pathname.slice(data.lang.length + 1));
</script>

<header>
	<RecruiterButton lang={data.lang} />
	<LangSwitch lang={data.lang} {path} />
</header>

{@render children()}

<style>
	header {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		padding: 0.75rem 1rem;
	}
	header :global(a) {
		color: var(--paper);
		font-family: var(--font-mono);
		font-size: 0.875rem;
	}
	header :global(a:hover) {
		color: var(--red-lift);
	}
</style>
