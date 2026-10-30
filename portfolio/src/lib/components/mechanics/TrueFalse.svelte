<script lang="ts">
	import { t, ui, type Locale } from '$lib/i18n';
	import type { Question } from '$lib/content/types';
	import type { Response } from '$lib/game/engine';

	type Props = {
		question: Extract<Question, { kind: 'truefalse' }>;
		lang: Locale;
		removed?: number[];
		onanswer: (r: Response) => void;
	};
	let { question, lang, onanswer }: Props = $props();
	let done = $state(false);

	function pick(v: boolean) {
		if (done) return;
		done = true;
		onanswer(v);
	}
</script>

<p class="prompt">{t(question.statement, lang)}</p>
<div class="row">
	<button type="button" class="qbtn" disabled={done} onclick={() => pick(true)}>{t(ui.true, lang)}</button>
	<button type="button" class="qbtn" disabled={done} onclick={() => pick(false)}>{t(ui.false, lang)}</button>
</div>

<style>
	.prompt {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.9rem;
		padding: 4px;
	}
</style>
