<script lang="ts">
	import { t, ui, type Locale } from '$lib/i18n';

	let { lang }: { lang: Locale } = $props();
</script>

<a href="/{lang}/recruiter">{t(ui.recruiter, lang)}</a>
