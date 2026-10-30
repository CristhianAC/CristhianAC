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
		<button
			type="button"
			class="qbtn"
			class:struck={removed.includes(i)}
			disabled={done || removed.includes(i)}
			onclick={() => pick(i)}
		>
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
	/* git blame: ruled-out options get struck through. */
	.struck {
		position: relative;
	}
	.struck::after {
		content: '';
		position: absolute;
		left: 0.6rem;
		right: 0.6rem;
		top: 50%;
		height: 3px;
		background: var(--red-lift);
		transform-origin: 0 50%;
	}
	@media (prefers-reduced-motion: no-preference) {
		.struck::after {
			animation: strike 0.28s cubic-bezier(0.23, 1, 0.32, 1) backwards;
		}
		.struck ~ .struck::after {
			animation-delay: 0.08s;
		}
	}
	@keyframes strike {
		from {
			transform: scaleX(0);
		}
	}
</style>
