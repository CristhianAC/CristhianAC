<script lang="ts">
	import '../../app.css';
	import { page } from '$app/state';
	import RecruiterButton from '$lib/components/RecruiterButton.svelte';
	import { t, ui } from '$lib/i18n';
	import LangSwitch from '$lib/components/LangSwitch.svelte';

	let { data, children } = $props();
	const path = $derived(page.url.pathname.slice(data.lang.length + 1));
	const ORIGIN = 'https://cristhianac.dev';
	const rest = $derived(page.url.pathname.slice(3));
	const title = $derived(t(path === '/recruiter' ? ui.recruiterTitle : ui.title, data.lang));
	const description = $derived(t(ui.description, data.lang));
</script>

<svelte:head>
	<meta name="description" content={description} />
	<link rel="canonical" href="{ORIGIN}{page.url.pathname}" />
	<link rel="alternate" hreflang="es" href="{ORIGIN}/es{rest}" />
	<link rel="alternate" hreflang="en" href="{ORIGIN}/en{rest}" />
	<link rel="alternate" hreflang="x-default" href="{ORIGIN}/es{rest}" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content="{ORIGIN}{page.url.pathname}" />
	<meta property="og:image" content="{ORIGIN}/og.png" />
	<meta property="og:locale" content={data.lang === 'es' ? 'es_CO' : 'en_US'} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<header>
	<nav aria-label={t(ui.navLabel, data.lang)}>
		<RecruiterButton lang={data.lang} />
		<LangSwitch lang={data.lang} {path} />
	</nav>
</header>

{@render children()}

<style>
	header {
		padding: 0.75rem 1rem;
	}
	nav {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
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
