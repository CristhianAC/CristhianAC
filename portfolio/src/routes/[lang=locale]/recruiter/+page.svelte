<script lang="ts">
	import RecruiterView from '$lib/components/recruiter/RecruiterView.svelte';
	import { t, ui } from '$lib/i18n';

	let { data } = $props();
</script>

<svelte:head>
	<title>{t(ui.recruiterTitle, data.lang)}</title>
</svelte:head>

<RecruiterView lang={data.lang} print={false} />
