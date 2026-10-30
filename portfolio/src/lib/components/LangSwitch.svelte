<script lang="ts">
	import { t, ui, type Locale } from '$lib/i18n';

	/** `path` is the page path after the locale, e.g. "" or "/recruiter". */
	let { lang, path }: { lang: Locale; path: string } = $props();
	const other = $derived<Locale>(lang === 'es' ? 'en' : 'es');
</script>

<a href="/{other}{path}" hreflang={other} lang={other}>{t(ui.switchLang, lang)}</a>
