<script lang="ts">
	import { t, ui } from '$lib/i18n';

	let { data } = $props();
</script>

<svelte:head>
	<title>{t(ui.title, data.lang)}</title>
</svelte:head>
