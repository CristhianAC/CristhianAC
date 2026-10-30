<script lang="ts">
	import { t, type Locale } from '$lib/i18n';
	import type { Question } from '$lib/content/types';
	import type { Response } from '$lib/game/engine';

	type Props = {
		question: Extract<Question, { kind: 'spot' }>;
		lang: Locale;
		removed?: number[];
		onanswer: (r: Response) => void;
	};
	let { question, lang, onanswer }: Props = $props();
	let done = $state(false);

	function pick(i: number) {
		if (done) return;
		done = true;
		onanswer(i);
	}
</script>

<p class="prompt">{t(question.prompt, lang)}</p>
<div class="code">
	{#each question.lines as line, i}
		<button type="button" class="qbtn line" disabled={done} onclick={() => pick(i)}>
			<span class="no" aria-hidden="true">{i + 1}</span><code>{line}</code>
		</button>
	{/each}
</div>

<style>
	.prompt {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.code {
		display: grid;
		gap: 0.4rem;
		padding: 4px;
	}
	.line {
		display: flex;
		gap: 1rem;
		white-space: pre;
		overflow-x: auto;
		box-shadow: 0 0 0 3px var(--red-deep);
	}
	.no {
		color: var(--red-lift);
	}
	code {
		font-family: var(--font-mono);
	}
</style>
