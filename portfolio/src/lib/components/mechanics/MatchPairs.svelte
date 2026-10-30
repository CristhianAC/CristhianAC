<script lang="ts">
	import { tick } from 'svelte';
	import { t, ui, type Locale } from '$lib/i18n';
	import type { Question } from '$lib/content/types';
	import type { Response } from '$lib/game/engine';

	type Props = {
		question: Extract<Question, { kind: 'match' }>;
		lang: Locale;
		removed?: number[];
		onanswer: (r: Response) => void;
	};
	let { question, lang, onanswer }: Props = $props();
	// One instance is mounted per question, so reading it once is intended.
	// svelte-ignore state_referenced_locally
	const n = question.pairs.length;
	// Right column rotated by one so the identity pairing is never positional.
	// svelte-ignore state_referenced_locally
	const rightOrder = question.pairs.map((_, p) => (p + 1) % n);
	// svelte-ignore state_referenced_locally
	let chosen = $state<(number | null)[]>(question.pairs.map(() => null));
	let activeLeft = $state<number | null>(null);
	let done = $state(false);
	const complete = $derived(chosen.every((c) => c !== null));
	let leftButtons = $state<HTMLButtonElement[]>([]);
	let confirmButton = $state<HTMLButtonElement>();

	function pickLeft(i: number) {
		if (done) return;
		chosen[i] = null; // re-selecting a left item frees its pairing
		activeLeft = i;
	}
	async function pickRight(j: number) {
		if (done || activeLeft === null) return;
		chosen[activeLeft] = j;
		activeLeft = null;
		// The right column disables itself; hand focus to the next unpaired item (or Confirm).
		await tick();
		const next = chosen.indexOf(null);
		(next === -1 ? confirmButton : leftButtons[next])?.focus();
	}
	function confirm() {
		if (done || !complete) return;
		done = true;
		onanswer(chosen as number[]);
	}
</script>

<p class="prompt">{t(question.prompt, lang)}</p>
<div class="cols">
	<ul>
		{#each question.pairs as pair, i}
			<li>
				<button
					type="button"
					class="qbtn"
					bind:this={leftButtons[i]}
					class:selected={activeLeft === i}
					aria-pressed={activeLeft === i}
					disabled={done}
					onclick={() => pickLeft(i)}
				>
					{t(pair.left, lang)}{#if chosen[i] !== null}
						→ {t(question.pairs[chosen[i]!].right, lang)}{/if}
				</button>
			</li>
		{/each}
	</ul>
	<ul aria-label={t(ui.pickRight, lang)}>
		{#each rightOrder as j}
			<li>
				<button
					type="button"
					class="qbtn"
					disabled={done || activeLeft === null || chosen.includes(j)}
					onclick={() => pickRight(j)}
				>
					{t(question.pairs[j].right, lang)}
				</button>
			</li>
		{/each}
	</ul>
</div>
<button
	type="button"
	class="qbtn primary"
	bind:this={confirmButton}
	disabled={done || !complete}
	onclick={confirm}
>{t(ui.confirm, lang)}</button>

<style>
	.prompt {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.2rem;
		margin-bottom: 1.2rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 4px;
		display: grid;
		gap: 0.9rem;
		align-content: start;
	}
	@media (max-width: 560px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
</style>
