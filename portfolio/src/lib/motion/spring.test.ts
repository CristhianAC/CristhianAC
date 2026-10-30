import { describe, expect, it } from 'vitest';
import { shakeFrames, spring, stagger, toLinear } from './spring';

describe('spring', () => {
	it('starts at 0 and settles exactly at 1', () => {
		const s = spring();
		expect(s.ease(0)).toBe(0);
		expect(s.ease(1)).toBe(1);
		expect(Math.abs(s.ease(0.95) - 1)).toBeLessThan(0.01);
		expect(s.duration).toBeGreaterThan(200);
		expect(s.duration).toBeLessThan(2000);
	});

	it('overshoots when underdamped and never when critically damped', () => {
		const samples = (e: (t: number) => number) => Array.from({ length: 101 }, (_, i) => e(i / 100));
		expect(Math.max(...samples(spring({ stiffness: 300, damping: 12 }).ease))).toBeGreaterThan(1.05);
		// damping = 2 * sqrt(k * m) is critical
		expect(Math.max(...samples(spring({ stiffness: 100, damping: 20 }).ease))).toBeLessThanOrEqual(1);
	});

	it('serialises to a CSS linear() easing that ends at 1', () => {
		const css = toLinear(spring().ease, 20);
		expect(css.startsWith('linear(0, ')).toBe(true);
		expect(css.endsWith(', 1)')).toBe(true);
		expect(css.split(',')).toHaveLength(21);
	});
});

describe('shakeFrames', () => {
	const offsets = (frame: string) => [...frame.matchAll(/-?\d+(\.\d+)?/g)].map((m) => Math.abs(Number(m[0])));

	it('decays to rest on the last frame', () => {
		const frames = shakeFrames(0.8);
		expect(offsets(frames.at(-1)!)).toEqual([0, 0, 0]);
	});

	it('scales with trauma squared and is still with no trauma', () => {
		const peak = (t: number) => Math.max(...shakeFrames(t, { maxX: 10, maxY: 10, maxRot: 0 }).flatMap(offsets));
		expect(peak(0)).toBe(0);
		expect(peak(1)).toBeLessThanOrEqual(10);
		expect(peak(0.5)).toBeLessThanOrEqual(2.5); // 0.5² × 10
		expect(peak(2)).toBe(peak(1)); // trauma is clamped to 1
	});
});

describe('stagger', () => {
	it('delays each item and caps long lists', () => {
		expect(stagger(0, 40)).toBe(0);
		expect(stagger(3, 40)).toBe(120);
		expect(stagger(50, 40, 6)).toBe(240);
	});
});
