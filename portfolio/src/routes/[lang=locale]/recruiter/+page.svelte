<script lang="ts">
	import RecruiterShow from '$lib/components/recruiter/RecruiterShow.svelte';
	import { t, ui } from '$lib/i18n';

	let { data } = $props();
</script>

<svelte:head>
	<title>{t(ui.recruiterTitle, data.lang)}</title>
</svelte:head>

<RecruiterShow lang={data.lang} />
