<script lang="ts">
	import { t, ui, type Locale } from '$lib/i18n';
	import type { Question } from '$lib/content/types';
	import type { Response } from '$lib/game/engine';

	type Props = {
		question: Extract<Question, { kind: 'order' }>;
		lang: Locale;
		removed?: number[];
		onanswer: (r: Response) => void;
	};
	let { question, lang, onanswer }: Props = $props();
	// Items arrive in the correct order; start reversed so the initial order is never already correct.
	// svelte-ignore state_referenced_locally
	let order = $state(question.items.map((_, i) => i).reverse());
	let done = $state(false);
	let dragFrom = $state<number | null>(null);

	function move(from: number, to: number) {
		if (done || to < 0 || to >= order.length) return;
		const next = [...order];
		next.splice(to, 0, next.splice(from, 1)[0]);
		order = next;
	}
	function confirm() {
		if (done) return;
		done = true;
		onanswer([...order]);
	}
</script>

<p class="prompt">{t(question.prompt, lang)}</p>
<ol class="list">
	{#each order as original, pos (original)}
		<li
			draggable={!done}
			ondragstart={() => (dragFrom = pos)}
			ondragover={(e) => e.preventDefault()}
			ondrop={() => dragFrom !== null && move(dragFrom, pos)}
		>
			<span class="text">{t(question.items[original], lang)}</span>
			<button
				type="button"
				class="qbtn mini"
				disabled={done || pos === 0}
				aria-label="{t(ui.moveUp, lang)}: {t(question.items[original], lang)}"
				onclick={() => move(pos, pos - 1)}>▲</button
			>
			<button
				type="button"
				class="qbtn mini"
				disabled={done || pos === order.length - 1}
				aria-label="{t(ui.moveDown, lang)}: {t(question.items[original], lang)}"
				onclick={() => move(pos, pos + 1)}>▼</button
			>
		</li>
	{/each}
</ol>
<button type="button" class="qbtn primary" disabled={done} onclick={confirm}>{t(ui.confirm, lang)}</button>

<style>
	.prompt {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.list {
		list-style: none;
		margin: 0 0 1.2rem;
		padding: 4px;
		display: grid;
		gap: 0.9rem;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--ink);
		font-family: var(--font-mono);
		box-shadow: 0 0 0 4px var(--red-deep);
	}
	.text {
		flex: 1;
	}
	.mini {
		width: auto;
		padding: 0.4rem 0.7rem;
	}
</style>
