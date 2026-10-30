<script lang="ts">
	type Direction = 'south' | 'south-east' | 'east' | 'north-east' | 'north' | 'north-west' | 'west' | 'south-west';

	let { line, talking, direction = 'south' }: { line: string; talking: boolean; direction?: Direction } = $props();
</script>

<figure class="host" class:talking>
	<!-- Live region stays mounted so screen readers announce each new line. -->
	<p class="bubble" class:empty={!line} aria-live="polite">{line}</p>
	<img src="/sprites/host/{direction}.png" alt="Cristhian" width="96" height="96" />
</figure>

<style>
	.host {
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	img {
		width: 288px; /* 3x of 96 */
		height: 288px;
		image-rendering: pixelated;
		filter: drop-shadow(0 12px 0 rgb(8 7 10 / 0.6));
	}
	.bubble {
		position: relative;
		max-width: min(34ch, 86vw);
		margin: 0;
		padding: 0.75rem 1rem;
		background: var(--paper);
		color: var(--ink);
		font-family: var(--font-mono);
		font-size: 0.95rem;
		line-height: 1.4;
		/* Stepped pixel border: no rounded corners. */
		box-shadow:
			0 -4px 0 0 var(--ink),
			0 4px 0 0 var(--ink),
			-4px 0 0 0 var(--ink),
			4px 0 0 0 var(--ink),
			0 0 0 8px var(--red);
	}
	.bubble::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: -16px;
		width: 8px;
		height: 8px;
		background: var(--paper);
		box-shadow: 0 8px 0 var(--red);
		transform: translateX(-50%);
	}
	.bubble.empty {
		visibility: hidden;
	}
	.talking .bubble:not(.empty)::before {
		content: '▮';
		position: absolute;
		right: 0.4rem;
		bottom: 0.2rem;
		color: var(--red);
		font-size: 0.7rem;
	}

	@media (max-width: 480px) {
		img {
			width: 192px; /* 2x */
			height: 192px;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		img {
			animation: bob 1.4s steps(2) infinite;
		}
		.talking img {
			animation-duration: 0.5s;
		}
		.talking .bubble:not(.empty)::before {
			animation: blink 1s steps(1) infinite;
		}
	}
	@keyframes bob {
		50% {
			transform: translateY(-3px);
		}
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
