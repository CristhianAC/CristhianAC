<script module lang="ts">
	// [x, y, w, h, tone] in a piece's own pixel grid; tone maps to the era palette in eras.css.
	type Px = [number, number, number, number, 'a' | 'b' | 'c' | 'l'];
	type Piece = { name: string; w: number; h: number; px: Px[]; x: number; y: number; size: number; depth?: 'front' };

	const lamp = (x: number): Omit<Piece, 'name'> => ({
		w: 12, h: 10, x, y: 2, size: 8,
		px: [[0, 0, 12, 1, 'b'], [5, 1, 2, 2, 'b'], [3, 3, 6, 4, 'a'], [2, 4, 1, 2, 'b'], [9, 4, 1, 2, 'b'], [4, 7, 4, 1, 'l'], [5, 8, 2, 1, 'l']]
	});
	const sideScreen = (x: number): Omit<Piece, 'name'> => ({
		w: 14, h: 18, x, y: 22, size: 11,
		px: [[0, 0, 14, 14, 'b'], [1, 1, 12, 12, 'a'], [2, 8, 2, 4, 'c'], [5, 5, 2, 7, 'l'], [8, 3, 2, 9, 'c'], [11, 6, 1, 6, 'l'], [6, 14, 2, 4, 'b']]
	});
	const speaker = (x: number): Omit<Piece, 'name'> => ({
		w: 8, h: 14, x, y: 44, size: 6,
		px: [[0, 0, 8, 14, 'a'], [3, 2, 2, 2, 'b'], [1, 6, 6, 6, 'b'], [2, 7, 4, 4, 'a'], [3, 8, 2, 2, 'l']]
	});

	// Compile order follows the show: lights, podium, screens, then the rest of the studio.
	const PIECES: Piece[] = [
		{ name: 'light-left', ...lamp(8) },
		{ name: 'light-right', ...lamp(84) },
		{
			name: 'podium', w: 16, h: 16, x: 18, y: 56, size: 11,
			px: [[0, 0, 16, 2, 'b'], [2, 2, 12, 14, 'a'], [2, 6, 12, 2, 'c'], [6, 10, 4, 3, 'l'], [1, 15, 14, 1, 'b']]
		},
		{
			name: 'main-screen', w: 32, h: 18, x: 36, y: 9, size: 28,
			px: [
				[0, 0, 32, 16, 'b'], [1, 1, 30, 14, 'a'], [3, 3, 14, 1, 'l'], [3, 5, 22, 1, 'l'],
				[3, 7, 9, 1, 'c'], [3, 9, 17, 1, 'l'], [3, 11, 6, 1, 'c'], [26, 11, 3, 2, 'c'], [14, 16, 4, 2, 'b']
			]
		},
		{ name: 'screen-left', ...sideScreen(13) },
		{ name: 'screen-right', ...sideScreen(76) },
		{
			name: 'desk', w: 20, h: 12, x: 68, y: 58, size: 15,
			px: [[8, 0, 4, 2, 'c'], [0, 2, 20, 2, 'b'], [1, 4, 18, 8, 'a'], [1, 7, 18, 1, 'c'], [8, 9, 4, 2, 'l']]
		},
		{ name: 'speaker-left', ...speaker(3) },
		{ name: 'speaker-right', ...speaker(91) },
		{
			name: 'camera', w: 16, h: 16, x: 3, y: 64, size: 11, depth: 'front',
			px: [[1, 2, 10, 6, 'a'], [11, 3, 4, 4, 'b'], [12, 4, 2, 2, 'l'], [2, 3, 1, 1, 'c'], [5, 0, 4, 2, 'b'], [6, 8, 1, 6, 'b'], [2, 14, 9, 1, 'b'], [2, 15, 1, 1, 'b'], [10, 15, 1, 1, 'b']]
		},
		{
			name: 'audience', w: 64, h: 8, x: 2, y: 88, size: 96, depth: 'front',
			px: Array.from({ length: 10 }, (_, i): Px[] => [[i * 6 + 3, 0, 4, 4, 'b'], [i * 6 + 2, 4, 6, 4, 'a']]).flat()
		},
		{
			name: 'on-air', w: 20, h: 8, x: 42, y: 1, size: 16,
			px: [[0, 0, 20, 8, 'b'], [1, 1, 18, 6, 'a'], [2, 2, 16, 4, 'c'], [3, 3, 14, 2, 'l']]
		}
	];
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Era } from '$lib/content/types';
	import './eras.css';

	let { era, compiled, total, children }: { era: Era; compiled: number; total: number; children?: Snippet } = $props();

	// shortcut: 12 hand-placed slots (one per question); more pieces reuse slots, add slots if rounds grow.
	const pieces = $derived(Array.from({ length: total }, (_, i) => PIECES[i % PIECES.length]));
	const progress = $derived(total > 0 ? Math.min(compiled / total, 1) : 0);
</script>

<section class="stage" class:live={compiled >= total} data-era={era} style:--progress={progress}>
	<!-- Backdrop: one transform target for camera shake and glitch, so the interactive content never moves. -->
	<div class="backdrop" aria-hidden="true">
		<div class="layer far" aria-hidden="true"></div>
		<div class="layer floor" aria-hidden="true"></div>
		<div class="layer beams" aria-hidden="true"><i></i><i></i></div>
		<div class="layer set" aria-hidden="true">
			{#each pieces as p, i (i)}
				<svg
					class="piece {p.name} {i < compiled ? 'compiled' : 'wireframe'}"
					class:front={p.depth === 'front'}
					viewBox="0 0 {p.w} {p.h}"
					shape-rendering="crispEdges"
					style:left="{p.x}%"
					style:top="{p.y}%"
					style:width="{p.size}%"
				>
					{#each p.px as [x, y, w, h, tone], j (j)}
						<rect {x} {y} width={w} height={h} class={tone} />
					{/each}
				</svg>
			{/each}
		</div>
		<div class="layer fx" aria-hidden="true"></div>
		<div class="layer vignette" aria-hidden="true"></div>
	</div>
	<!-- Content sits above the era overlays so text stays crisp. -->
	<div class="content">
		{@render children?.()}
	</div>
</section>

<style>
	.stage {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		/* clip, unlike hidden, is not a scroll container: focus() can never scroll the set sideways. */
		overflow: clip;
		width: 100%;
		min-height: clamp(420px, 78svh, 760px);
		background: var(--ink);
	}
	.backdrop,
	.layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	/* Far: LED back wall, out of focus. */
	.far {
		inset: -8px;
		background:
			radial-gradient(ellipse 55% 45% at 50% 30%, var(--wall-glow), transparent 70%),
			repeating-linear-gradient(90deg, var(--wall-line) 0 2px, transparent 2px 24px),
			repeating-linear-gradient(0deg, var(--wall-line) 0 2px, transparent 2px 24px),
			linear-gradient(var(--wall), var(--ink) 75%);
		filter: blur(3px);
		opacity: calc(0.45 + var(--progress) * 0.55);
	}

	/* Front: glossy stage floor in perspective with a spotlight pool. */
	.floor {
		top: auto;
		height: 38%;
		background:
			radial-gradient(ellipse 30% 40% at 50% 45%, var(--pool), transparent 70%),
			repeating-linear-gradient(90deg, var(--floor-line) 0 1px, transparent 1px 40px),
			repeating-linear-gradient(0deg, var(--floor-line) 0 1px, transparent 1px 28px),
			linear-gradient(var(--floor), var(--ink));
		transform: perspective(420px) rotateX(48deg);
		transform-origin: 50% 0;
	}

	/* Spotlight cones, brighter as the set compiles. */
	.beams i {
		position: absolute;
		top: -5%;
		width: 34%;
		height: 100%;
		background: linear-gradient(var(--beam), transparent 85%);
		clip-path: polygon(46% 0, 54% 0, 100% 100%, 0 100%);
		mix-blend-mode: screen;
		opacity: calc(0.15 + var(--progress) * 0.6);
		transform-origin: 50% 0;
	}
	.beams i:first-child {
		left: 14%;
		transform: rotate(-14deg);
	}
	.beams i:last-child {
		right: 14%;
		transform: rotate(14deg);
	}

	.piece {
		position: absolute;
		height: auto;
		overflow: visible;
	}
	.piece.front {
		filter: blur(0.6px) brightness(0.7);
	}
	.wireframe rect {
		fill: none;
		stroke: var(--wire);
		stroke-width: 1px;
		stroke-dasharray: 3 2;
		vector-effect: non-scaling-stroke;
	}
	.compiled .a {
		fill: var(--set-a);
	}
	.compiled .b {
		fill: var(--set-b);
	}
	.compiled .c {
		fill: var(--set-c);
	}
	.compiled .l {
		fill: var(--set-light);
	}

	.content {
		position: relative;
		z-index: 1;
		min-height: inherit;
	}

	.vignette {
		background: radial-gradient(ellipse 75% 70% at 50% 45%, transparent 55%, rgb(8 7 10 / 0.92));
	}
	.fx {
		background: var(--fx, none);
	}

	@media (prefers-reduced-motion: no-preference) {
		.beams i:first-child {
			animation: sway-left 9s ease-in-out infinite alternate;
		}
		.beams i:last-child {
			animation: sway-right 11s ease-in-out infinite alternate;
		}
		.wireframe rect {
			animation: march 1.6s steps(5) infinite;
		}
		/* The newly compiled piece builds in pixel steps while it springs up from its base. */
		.compiled {
			transform-origin: 50% 100%;
			animation:
				compile 0.6s steps(6) backwards,
				build 0.7s var(--ease-spring, cubic-bezier(0.23, 1, 0.32, 1)) backwards;
		}
		/* End of the show: the ON AIR sign flickers on (2 dips in ~0.9 s, under the 3 flashes/s limit). */
		.live .on-air {
			animation:
				compile 0.6s steps(6) backwards,
				flicker-on 0.9s steps(1) 0.3s backwards;
		}
	}
	@keyframes build {
		from {
			transform: scale(0.85, 0.6);
		}
	}
	@keyframes flicker-on {
		0% {
			opacity: 0.15;
		}
		20% {
			opacity: 1;
		}
		45% {
			opacity: 0.35;
		}
		60%,
		100% {
			opacity: 1;
		}
	}
	@keyframes sway-left {
		to {
			transform: rotate(-6deg);
		}
	}
	@keyframes sway-right {
		to {
			transform: rotate(6deg);
		}
	}
	@keyframes march {
		to {
			stroke-dashoffset: -5;
		}
	}
	/* Pixel "compile": the shape builds bottom-up in hard steps with a flash. */
	@keyframes compile {
		from {
			clip-path: inset(100% 0 0 0);
			filter: brightness(3);
		}
		to {
			clip-path: inset(0);
		}
	}
</style>
