<script lang="ts">
	import { t, type Locale } from '$lib/i18n';
	import type { Question } from '$lib/content/types';
	import type { Response } from '$lib/game/engine';

	type Props = {
		question: Extract<Question, { kind: 'choice' }>;
		lang: Locale;
		removed?: number[];
		onanswer: (r: Response) => void;
	};
	let { question, lang, removed = [], onanswer }: Props = $props();
	let done = $state(false);

	function pick(i: number) {
		if (done) return;
		done = true;
		onanswer(i);
	}
</script>

<p class="prompt">{t(question.prompt, lang)}</p>
<div class="list">
	{#each question.options as option, i}
		<button type="button" class="qbtn" disabled={done || removed.includes(i)} onclick={() => pick(i)}>
			{t(option, lang)}
		</button>
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
