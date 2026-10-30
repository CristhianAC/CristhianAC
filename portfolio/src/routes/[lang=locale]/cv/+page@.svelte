<script lang="ts">
	import '../../../app.css';
	import RecruiterView from '$lib/components/recruiter/RecruiterView.svelte';
	import { page } from '$app/state';
	import type { Locale } from '$lib/i18n';
	import { profile } from '$lib/content/profile';

	// The layout reset drops the [lang] layout's data, so read the param directly.
	const lang = page.params.lang as Locale;
</script>

<svelte:head>
	<title>{profile.name} · CV</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<RecruiterView {lang} print={true} />

<style>
	@page {
		size: A4;
		margin: 10mm;
	}
	:global(html, body) {
		background: var(--paper);
	}
	:global(a.cv) {
		display: none !important;
	}
	/* Compact so the CV fits on 1-2 A4 pages. */
	:global(.recruiter) {
		font-size: 8.5pt;
		line-height: 1.3;
		max-width: none;
		padding: 0;
	}
	:global(.recruiter h2) {
		font-size: 12pt;
		margin: 0.6rem 0 0.3rem;
	}
	:global(.recruiter h3) {
		font-size: 10pt;
	}
	:global(.recruiter h1) {
		font-size: 22pt;
	}
	:global(.recruiter .period) {
		font-size: 8pt;
	}
	:global(.recruiter li) {
		break-inside: avoid;
	}
	:global(.recruiter .roles li) {
		margin-bottom: 0.3rem;
	}
	:global(.recruiter p) {
		margin: 0.1rem 0;
	}
</style>
