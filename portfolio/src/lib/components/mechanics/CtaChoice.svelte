<script lang="ts">
	import { t, type Locale } from '$lib/i18n';
	import type { Question } from '$lib/content/types';
	import type { Response } from '$lib/game/engine';

	type Props = {
		question: Extract<Question, { kind: 'cta' }>;
		lang: Locale;
		removed?: number[];
		onanswer: (r: Response) => void;
	};
	let { question, lang, onanswer }: Props = $props();
	let done = false;

	// Never preventDefault: the link must still navigate (in a new tab, so the finished show stays).
	function pick(i: number) {
		if (done) return;
		done = true;
		onanswer(i);
	}
</script>

<p class="prompt">{t(question.prompt, lang)}</p>
<div class="list">
	{#each question.ctas as cta, i}
		<a class="qbtn primary" href={cta.href} target="_blank" rel="noopener noreferrer" onclick={() => pick(i)}>{t(cta.label, lang)}</a>
	{/each}
</div>

<style>
	.prompt {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.list {
		display: grid;
		gap: 0.9rem;
		padding: 4px;
	}
</style>
