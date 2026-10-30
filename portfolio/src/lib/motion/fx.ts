import { shakeFrames, spring, stagger, toLinear } from './spring';

/** DOM juice on the Web Animations API. Transform/opacity/filter/clip-path only; all no-ops without WAAPI. */

const OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';
const POP = spring({ stiffness: 260, damping: 16 });
const SLAM = spring({ stiffness: 420, damping: 18 });

const supportsLinear = () => typeof CSS !== 'undefined' && CSS.supports?.('animation-timing-function', 'linear(0, 1)');
const curve = (s: typeof POP) => (supportsLinear() ? toLinear(s.ease) : OUT);
/** Spring easing for CSS (`--ease-spring`), with a strong ease-out where linear() is unsupported. */
export const springCss = () => curve(POP);

export const reduced = () =>
	typeof matchMedia === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches;

const canAnimate = (el: Element | null | undefined): el is HTMLElement => !!el && typeof el.animate === 'function';

function run(el: Element | null | undefined, frames: Keyframe[], opts: KeyframeAnimationOptions) {
	if (!canAnimate(el) || reduced()) return null;
	return el.animate(frames, opts);
}

type Preset = 'rise' | 'slam' | 'kinetic' | 'slide' | 'climb';
const PRESETS: Record<Preset, { from: Keyframe; spring: typeof POP }> = {
	rise: { from: { transform: 'translateY(14px) scale(0.96)', opacity: 0 }, spring: POP },
	kinetic: { from: { transform: 'translateY(0.6em) rotate(4deg)', opacity: 0 }, spring: POP },
	slam: { from: { transform: 'scale(2.2) translateY(-8%)', opacity: 0 }, spring: SLAM },
	slide: { from: { transform: 'translateX(-24px) rotate(-1.5deg)', opacity: 0 }, spring: POP },
	climb: { from: { transform: 'translateY(10px) scale(1.5)', opacity: 0 }, spring: SLAM }
};

export type Assemble = { selector?: string; preset?: Preset; step?: number; delay?: number } | null;

/** Svelte action: springs the node (or its `selector` children) into place, staggered. Reduced motion: one short fade. */
export function assemble(node: HTMLElement, opts: Assemble) {
	if (!opts) return;
	const targets = opts.selector ? [...node.querySelectorAll<HTMLElement>(opts.selector)] : [node];
	if (!targets.every(canAnimate)) return;
	if (reduced()) {
		for (const el of targets) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: 'backwards' });
		return;
	}
	const { from, spring: s } = PRESETS[opts.preset ?? 'rise'];
	const easing = curve(s);
	targets.forEach((el, i) =>
		el.animate([from, { transform: 'none', opacity: 1 }], {
			duration: s.duration,
			delay: (opts.delay ?? 0) + stagger(i, opts.step ?? 45),
			easing,
			fill: 'backwards'
		})
	);
}

/** Decaying "trauma" shake on a visual wrapper (never a layout box that other code measures). */
export const shake = (el: Element | null | undefined, trauma: number, duration = 380) =>
	run(el, shakeFrames(trauma).map((transform) => ({ transform })), { duration });

let lastFlash = 0;
/** White flash overlay; never more than ~3 per second. */
export function flash(el: Element | null | undefined, peak = 0.35) {
	const now = performance.now();
	if (now - lastFlash < 340) return;
	lastFlash = now;
	run(el, [{ opacity: 0 }, { opacity: peak, offset: 0.2 }, { opacity: 0 }], { duration: 180, easing: OUT });
}

/** Diagonal curtain that sweeps across: covers at ~45%, then uncovers to the right. */
export const wipe = (el: Element | null | undefined, duration = 520) =>
	run(
		el,
		[
			{ clipPath: 'polygon(0% 0%, 0% 0%, -30% 100%, -30% 100%)' },
			{ clipPath: 'polygon(0% 0%, 130% 0%, 100% 100%, -30% 100%)', offset: 0.45 },
			{ clipPath: 'polygon(130% 0%, 130% 0%, 100% 100%, 100% 100%)' }
		],
		{ duration, easing: IN_OUT }
	);

/** Soft glitch: RGB split and horizontal jitter in hard steps. */
export const glitch = (el: Element | null | undefined) =>
	run(
		el,
		[0, 3, -2, 2, -1, 0].map((x, i) => ({
			transform: `translateX(${x}px)`,
			filter: i % 5 ? `drop-shadow(${x}px 0 0 rgb(255 0 60 / 0.6)) drop-shadow(${-x}px 0 0 rgb(0 220 255 / 0.5))` : 'none'
		})),
		{ duration: 250, easing: 'steps(6)' }
	);

/** Squash & stretch shrug from the feet. */
export const shrug = (el: Element | null | undefined) =>
	run(
		el,
		[
			{ transform: 'none' },
			{ transform: 'scale(1.12, 0.86)', offset: 0.25 },
			{ transform: 'scale(0.94, 1.08) translateY(-6px) rotate(-3deg)', offset: 0.55 },
			{ transform: 'none' }
		],
		{ duration: 460, easing: OUT }
	);

/** Small importance-tier pop for a button. */
export const pop = (el: Element | null | undefined) =>
	run(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: 0.35 }, { transform: 'scale(1)' }], {
		duration: 260,
		easing: OUT
	});

/** Camera push-in: the element grows toward the viewer from a slightly wider shot. */
export const pushIn = (el: Element | null | undefined) =>
	run(el, [{ transform: 'scale(0.92) translateY(14px)' }, { transform: 'none' }], { duration: 600, easing: OUT });

/** Hit-stop: freeze the running animations inside `root` for `ms`, except under `keep` (e.g. UI text), then resume. */
export function hitStop(root: Element | null | undefined, ms = 80, keep?: string): Promise<void> {
	if (reduced() || !root?.getAnimations) return Promise.resolve();
	const frozen = root.getAnimations({ subtree: true }).filter((a) => {
		const target = (a.effect as KeyframeEffect | null)?.target;
		return a.playState === 'running' && !(keep && target?.closest(keep));
	});
	frozen.forEach((a) => a.pause());
	return new Promise((done) =>
		setTimeout(() => {
			frozen.forEach((a) => a.playState === 'paused' && a.play());
			done();
		}, ms)
	);
}

const PALETTE = ['var(--paper)', 'var(--red-lift)', 'var(--red)'];
/** Pixel particle burst at (x, y) inside `layer` (an absolutely positioned, pointer-events:none box). */
export function burst(layer: HTMLElement | null, x: number, y: number, { count = 14, spread = 90, size = 6 } = {}) {
	if (!canAnimate(layer) || reduced()) return;
	for (let i = 0; i < count; i++) {
		const p = document.createElement('i');
		const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
		const dist = spread * (0.5 + Math.random() * 0.6);
		const dx = Math.cos(angle) * dist;
		const dy = Math.sin(angle) * dist;
		p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${PALETTE[i % 3]}`;
		layer.append(p);
		p.animate(
			[
				{ transform: 'translate(-50%, -50%)', opacity: 1 },
				{ transform: `translate(${dx}px, ${dy}px)`, opacity: 1, offset: 0.6 },
				{ transform: `translate(${dx * 1.1}px, ${dy + 30}px)`, opacity: 0 }
			],
			{ duration: 600 + Math.random() * 250, easing: OUT }
		).onfinish = () => p.remove();
	}
}
