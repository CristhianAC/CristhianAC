/** Pure motion math: damped springs as easing curves, trauma-based shake, stagger delays. */

export type SpringOptions = { stiffness?: number; damping?: number; mass?: number };
export type Spring = { ease: (t: number) => number; duration: number };

/** Damped harmonic oscillator from 0 to 1, normalised to `duration` (ms) so it fits CSS/WAAPI timing. */
export function spring({ stiffness = 170, damping = 14, mass = 1 }: SpringOptions = {}): Spring {
	const w0 = Math.sqrt(stiffness / mass);
	const zeta = damping / (2 * Math.sqrt(stiffness * mass));
	const wd = w0 * Math.sqrt(Math.max(1 - zeta * zeta, 0));
	// Underdamped oscillates past 1; at or above critical damping use the critical form (no overshoot).
	const x = (s: number) =>
		zeta < 1
			? 1 - Math.exp(-zeta * w0 * s) * (Math.cos(wd * s) + ((zeta * w0) / wd) * Math.sin(wd * s))
			: 1 - Math.exp(-w0 * s) * (1 + w0 * s);
	let settle = 0;
	for (let s = 0; s < 3; s += 1 / 120) if (Math.abs(1 - x(s)) > 0.002) settle = s;
	const total = settle + 1 / 120;
	return { ease: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : x(t * total)), duration: Math.round(total * 1000) };
}

/** CSS `linear()` easing sampled from any easing function. */
export function toLinear(ease: (t: number) => number, points = 40): string {
	const stops = Array.from({ length: points + 1 }, (_, i) => +ease(i / points).toFixed(3));
	return `linear(${stops.join(', ')})`;
}

/** Keyframe transforms for a camera shake: trauma decays linearly to 0, offset = trauma² × max (smooth sines, not noise). */
export function shakeFrames(trauma: number, { frames = 10, maxX = 9, maxY = 6, maxRot = 1 } = {}): string[] {
	const t0 = Math.min(Math.max(trauma, 0), 1);
	return Array.from({ length: frames + 1 }, (_, i) => {
		const k = (t0 * (1 - i / frames)) ** 2;
		const r = (n: number) => +n.toFixed(2) || 0;
		return `translate(${r(maxX * k * Math.sin(i * 1.7 + 1))}px, ${r(maxY * k * Math.sin(i * 2.3 + 2))}px) rotate(${r(maxRot * k * Math.sin(i * 1.1 + 3))}deg)`;
	});
}

/** Delay for the i-th item of a staggered entrance, capped so long lists never wait. */
export const stagger = (i: number, step: number, cap = 8) => Math.min(i, cap) * step;
