<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { playSfx, setEra, stopMusic, unlock } from '$lib/audio/sound';
	import { assemble, burst, flash, glitch, hitStop, pushIn, reduced, shake, shrug, wipe } from '$lib/motion/fx';
	import { t, ui, type L } from '$lib/i18n';
	import { rounds } from '$lib/content/rounds';
	import { createGame, current, stage, submit, useLifeline, type Lifeline, type Response } from '$lib/game/engine';
	import Stage from '$lib/components/stage/Stage.svelte';
	import Host from '$lib/components/stage/Host.svelte';
	import PipelineLadder from '$lib/components/stage/PipelineLadder.svelte';
	import Lifelines from '$lib/components/Lifelines.svelte';
	import AnecdoteCard from '$lib/components/AnecdoteCard.svelte';
	import UnlockList from '$lib/components/UnlockList.svelte';
	import Choice from '$lib/components/mechanics/Choice.svelte';
	import TrueFalse from '$lib/components/mechanics/TrueFalse.svelte';
	import OrderTimeline from '$lib/components/mechanics/OrderTimeline.svelte';
	import SpotLine from '$lib/components/mechanics/SpotLine.svelte';
	import MatchPairs from '$lib/components/mechanics/MatchPairs.svelte';
	import CtaChoice from '$lib/components/mechanics/CtaChoice.svelte';

	let { data } = $props();
	const lang = $derived(data.lang);

	const TOTAL = rounds.reduce((n, r) => n + r.questions.length, 0);
	// No persistence: a reload restarts the show.
	let game = $state(createGame());
	let phase = $state<'intro' | 'title' | 'play' | 'result'>('intro');
	let correct = $state(false);
	let anecdote = $state<L>(ui.hostRight);
	let unlocks = $state<string[]>([]);
	let reveal = $state<L | null>(null);

	const round = $derived(rounds[game.round]);
	const q = $derived(current(rounds, game));
	const ended = $derived(game.finished || (phase === 'play' && q.kind === 'cta'));
	const number = $derived(game.answered.length + 1);

	const hostLine = $derived.by(() => {
		if (ended && q.kind === 'cta') return t(q.prompt, lang);
		if (phase === 'intro') return t(ui.hostWelcome, lang);
		if (phase === 'title') return t(ui.hostChapter, lang);
		if (phase === 'result') return t(correct ? ui.hostRight : ui.hostWrong, lang);
		return t(q.kind === 'truefalse' ? q.statement : q.prompt, lang);
	});

	const eyebrow = $derived(`${round.code} · ${t(ui.question, lang)} ${number}/${TOTAL}`);

	// Juice targets: overlays inside the stage and the host column (visual pivots, never layout boxes).
	let hostEl = $state<HTMLElement>();
	let wipeEl = $state<HTMLElement>();
	let flashEl = $state<HTMLElement>();
	let fxEl = $state<HTMLElement>();
	const stageEl = () => document.querySelector<HTMLElement>('[data-era]');

	// Each screen marks its heading with data-focus; moving focus there announces the new screen.
	// Focus moves at once: the motion below never delays or blocks input.
	async function go(next: typeof phase) {
		phase = next;
		reveal = null;
		await tick();
		document.querySelector<HTMLElement>('[data-focus]')?.focus();
		if (next === 'title') chapterCut();
		else if (next === 'play' && !ended) pushIn(hostEl);
	}

	// Large tier: whoosh + curtain wipe, then on the cut the CAP-0N letters slam in with hit + chapter and a shake.
	function chapterCut() {
		setEra(round.era);
		void playSfx('whoosh');
		wipe(wipeEl);
		setTimeout(
			() => {
				void playSfx('hit');
				void playSfx('chapter');
				shake(stageEl(), 0.6);
			},
			reduced() ? 0 : 300
		);
	}

	function burstFrom(el: Element | undefined, opts: Parameters<typeof burst>[3]) {
		if (!el || !fxEl) return;
		const a = el.getBoundingClientRect();
		const b = fxEl.getBoundingClientRect();
		burst(fxEl, a.x + a.width / 2 - b.x, a.y + a.height / 2 - b.y, opts);
	}

	// Medium tier. Correct: freeze frame, flash, the new set piece builds with a pixel burst.
	async function compiledJuice() {
		await hitStop(80);
		flash(flashEl);
		void playSfx('correct');
		burstFrom(document.querySelectorAll('.piece')[game.answered.length - 1], { count: 14 });
	}
	// Wrong: soft glitch and a host shrug; the anecdote card slides in on its own.
	function failedJuice() {
		void playSfx('wrong');
		glitch(stageEl());
		shrug(hostEl?.querySelector('img'));
	}

	function answer(r: Response) {
		const asked = q;
		const result = submit(rounds, game, r);
		game = result.state;
		void playSfx('select');
		if (asked.kind === 'cta') return; // the end screen stays; the link opens in a new tab
		correct = result.correct;
		anecdote = asked.anecdote;
		unlocks = asked.unlocks; // unlocked whether the answer was right or wrong
		go('result').then(result.correct ? compiledJuice : failedJuice);
	}

	// End screen: final stinger and a confetti-like pixel burst (ON AIR flicker and CTA pops are CSS/actions).
	$effect(() => {
		if (!ended) return;
		untrack(() =>
			tick().then(() => {
				void playSfx('final');
				if (fxEl) burst(fxEl, fxEl.clientWidth / 2, fxEl.clientHeight * 0.3, { count: 40, spread: 220, size: 8 });
			})
		);
	});

	// Small tier: hover tick (throttled, mouse only) and click tick on every .qbtn.
	let hovered: Element | null = null;
	let lastHover = 0;
	function onHover(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		const b = (e.target as Element).closest?.('.qbtn:not(:disabled)') ?? null;
		if (b === hovered) return;
		hovered = b;
		const now = performance.now();
		if (!b || now - lastHover < 80) return;
		lastHover = now;
		void playSfx('ui-hover', { volume: 0.5 });
	}
	function onClick(e: MouseEvent) {
		if ((e.target as Element).closest?.('.qbtn')) void playSfx('ui-click');
	}

	function begin() {
		unlock(); // user gesture: creates the audio context; music starts with CAP-01
		go('title');
	}

	// A new round starts at question 0; show its CAP-0N title card first.
	const advance = () => go(game.question === 0 && !game.finished ? 'title' : 'play');

	function lifeline(l: Lifeline) {
		const used = useLifeline(rounds, game, l);
		if (!used) return;
		game = used.state;
		void playSfx('lifeline');
		reveal = used.reveal.kind === 'text' ? used.reveal.text : ui.blameReveal;
	}

	function restart() {
		stopMusic(); // the intro stays silent
		game = createGame();
		go('intro');
	}
</script>

<svelte:document onpointerover={onHover} onclick={onClick} />

<svelte:head>
	<title>{t(ui.title, lang)}</title>
</svelte:head>

<main>
	<h1 class="sr-only">{t(ui.showTitle, lang)}</h1>
	<Stage era={round.era} compiled={ended ? TOTAL : game.answered.length} total={TOTAL}>
		<div class="set" class:intro={phase === 'intro'}>
			<div class="host" bind:this={hostEl}><Host line={hostLine} talking={phase === 'play' && !ended} /></div>

			<div class="panel">
				{#if phase === 'intro'}
					<h2 class="show-title" tabindex="-1" data-focus>{t(ui.showTitle, lang)}</h2>
					<p class="tagline">{t(ui.showTagline, lang)}</p>
					<button type="button" class="qbtn primary" onclick={begin}>{t(ui.start, lang)}</button>
				{:else if ended}
					<p class="eyebrow">{round.code} · {t(ui.question, lang)} {TOTAL}/{TOTAL}</p>
					<h2 class="system" tabindex="-1" data-focus>SYSTEM</h2>
					<p class="mono">&gt; {t(ui.system, lang)}</p>
					{#if q.kind === 'cta'}
						<UnlockList ids={q.unlocks} {lang} />
						<div class="mechanic" data-kind="cta" use:assemble={{ selector: '.qbtn', step: 90, delay: 300 }}>
							<CtaChoice question={q} {lang} onanswer={answer} />
						</div>
					{/if}
					<button type="button" class="qbtn again" use:assemble={{ delay: 600 }} onclick={restart}>{t(ui.playAgain, lang)}</button>
				{:else if phase === 'title'}
					<p class="eyebrow">{t(round.age, lang)}</p>
					<h2
						class="card-title"
						tabindex="-1"
						data-focus
						aria-label={round.code}
						use:assemble={{ selector: '.ch', preset: 'slam', step: 40, delay: 220 }}
					>
						{#each round.code as ch, i (i)}<span class="ch" aria-hidden="true">{ch}</span>{/each}
					</h2>
					<p class="round-name" use:assemble={{ delay: 520 }}>{t(round.title, lang)}</p>
					<button type="button" class="qbtn primary" use:assemble={{ delay: 600 }} onclick={() => go('play')}>{t(ui.continue, lang)}</button>
				{:else if phase === 'result'}
					{#if correct}
						<h2 class="ok" tabindex="-1" data-focus use:assemble={{ preset: 'climb' }}>{t(ui.compiled, lang)}</h2>
					{:else}
						<AnecdoteCard anecdote={t(anecdote, lang)} {lang} />
					{/if}
					<UnlockList ids={unlocks} {lang} />
					<button type="button" class="qbtn primary" onclick={advance}>{t(ui.continue, lang)}</button>
				{:else}
					<h2
						class="eyebrow"
						tabindex="-1"
						data-focus
						aria-label={eyebrow}
						use:assemble={{ selector: '.w', preset: 'kinetic', step: 35 }}
					>
						{#each eyebrow.split(' ') as w, i (i)}<span class="w" aria-hidden="true">{w}</span>{' '}{/each}
					</h2>
					<div
						class="mechanic"
						data-kind={q.kind}
						use:assemble={{ selector: ':scope > :not(.prompt) > *', step: 45, delay: 150 }}
					>
						{#if q.kind === 'choice'}
							<Choice question={q} {lang} removed={game.removed} onanswer={answer} />
						{:else if q.kind === 'truefalse'}
							<TrueFalse question={q} {lang} onanswer={answer} />
						{:else if q.kind === 'order'}
							<OrderTimeline question={q} {lang} onanswer={answer} />
						{:else if q.kind === 'spot'}
							<SpotLine question={q} {lang} onanswer={answer} />
						{:else if q.kind === 'match'}
							<MatchPairs question={q} {lang} onanswer={answer} />
						{/if}
					</div>
					<!-- Always mounted so screen readers announce text changes. -->
					<p class="reveal" class:empty={!reveal} role="status">{reveal ? t(reveal, lang) : ''}</p>
					<section class="lifelines" aria-label={t(ui.lifelines, lang)}>
						<Lifelines
							used={game.used}
							available={{
								duck: !game.used.includes('duck'),
								readme: !game.used.includes('readme'),
								blame: !game.used.includes('blame') && q.kind === 'choice'
							}}
							onuse={lifeline}
							{lang}
						/>
					</section>
				{/if}
			</div>
		</div>
		<div class="fx-wipe" bind:this={wipeEl} aria-hidden="true"></div>
		<div class="fx-flash" bind:this={flashEl} aria-hidden="true"></div>
		<div class="fx-particles" bind:this={fxEl} aria-hidden="true"></div>
	</Stage>

	<aside class="ladder">
		<PipelineLadder stage={stage(game, TOTAL)} commits={game.answered.length} {lang} />
	</aside>
</main>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	main {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: start;
		padding: 0 1rem 1rem;
	}
	.ladder {
		position: sticky;
		top: 1rem;
	}
	/* Below 1100px a side column would crowd the set: the ladder becomes a bar above the stage. */
	@media (max-width: 1100px) {
		main {
			grid-template-columns: minmax(0, 1fr);
		}
		.ladder {
			position: static;
			order: -1;
		}
	}

	.set {
		display: grid;
		grid-template-columns: auto minmax(0, 34rem);
		justify-content: center;
		align-items: end;
		gap: 2rem;
		min-height: inherit;
		padding: 2rem 1.5rem;
		box-sizing: border-box;
	}
	@media (max-width: 860px) {
		.set {
			grid-template-columns: minmax(0, 1fr);
			justify-items: center;
			align-items: start;
			gap: 1.25rem;
			padding: 1.25rem 1rem;
		}
	}

	.fx-wipe,
	.fx-flash,
	.fx-particles {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	/* Diagonal curtain; clipped away at rest, the wipe animates its clip-path. */
	.fx-wipe {
		background: repeating-linear-gradient(115deg, var(--red) 0 28px, var(--red-deep) 28px 56px);
		clip-path: polygon(0 0, 0 0, 0 0);
	}
	.fx-flash {
		background: var(--paper);
		opacity: 0;
	}
	.w,
	.ch {
		display: inline-block;
	}

	.panel {
		width: 100%;
		box-sizing: border-box;
		padding: 1.25rem 1.4rem 1.5rem;
		background: rgb(8 7 10 / 0.86);
		box-shadow:
			0 0 0 2px var(--ink),
			0 0 0 4px var(--red-deep);
	}
	/* The host reads the prompt aloud in the bubble; keep the mechanic's copy for screen readers only. */
	.mechanic :global(.prompt) {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.panel :global([data-focus]:focus) {
		outline: none;
	}

	.show-title {
		margin: 0 0 0.75rem;
		font-size: clamp(2rem, 6vw, 3.4rem);
		font-weight: 900;
		line-height: 1;
		color: var(--paper);
		text-shadow: 4px 4px 0 var(--red);
	}
	.tagline {
		margin: 0 0 1.5rem;
		line-height: 1.5;
	}
	.eyebrow,
	.mono,
	.round-name {
		font-family: var(--font-mono);
	}
	.eyebrow {
		margin: 0 0 0.75rem;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--red-lift);
	}
	.card-title {
		margin: 0;
		font-size: clamp(3rem, 12vw, 5.5rem);
		font-weight: 900;
		line-height: 1;
		text-shadow: 6px 6px 0 var(--red);
	}
	.round-name {
		margin: 0.5rem 0 1.5rem;
		font-size: 1.25rem;
	}
	.ok {
		margin: 0 0 1.2rem;
		font-family: var(--font-mono);
		font-size: 1.2rem;
		color: var(--paper);
	}
	.ok::before {
		content: '✓ ';
		color: var(--red-lift);
	}
	.system {
		margin: 0;
		font: 700 0.85rem/1 var(--font-mono);
		letter-spacing: 0.2em;
		color: var(--red-lift);
	}
	.mono {
		margin: 0.5rem 0 1.25rem;
		line-height: 1.5;
	}
	.reveal {
		margin: 1rem 0 0;
		padding: 0.6rem 0.8rem;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		background: var(--paper);
		color: var(--ink);
	}
	/* Collapsed but still rendered: a display:none live region may not be announced. */
	.reveal.empty {
		margin: 0;
		padding: 0;
	}
	.lifelines {
		margin-top: 1.25rem;
	}
	.again {
		margin-top: 1.25rem;
		text-align: center;
	}
</style>
