import { afterEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { tracks } from './manifest';
import { MUTE_KEY, muted, playSfx, readMuted, setEra, setMuted, stopMusic, trackForEra, unlock } from './sound';

afterEach(() => vi.unstubAllGlobals());

const memoryStorage = () => {
	const data = new Map<string, string>();
	return {
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v)
	};
};

describe('trackForEra', () => {
	it('maps chapters to retro, mid and neon loops', () => {
		expect(trackForEra('cap01')).toBe('retro');
		expect(trackForEra('cap02')).toBe('retro');
		expect(trackForEra('cap03')).toBe('mid');
		expect(trackForEra('cap04')).toBe('mid');
		expect(trackForEra('cap05')).toBe('neon');
		expect(trackForEra('final')).toBe('neon');
	});

	it('every track has a positive loop inside the file', () => {
		for (const t of Object.values(tracks)) expect(t.loopEnd).toBeGreaterThan(t.loopStart);
	});
});

describe('mute persistence', () => {
	it('defaults to not muted', () => {
		vi.stubGlobal('localStorage', memoryStorage());
		expect(readMuted()).toBe(false);
	});

	it('persists and restores the muted flag', () => {
		const storage = memoryStorage();
		vi.stubGlobal('localStorage', storage);
		setMuted(true);
		expect(storage.getItem(MUTE_KEY)).toBe('1');
		expect(readMuted()).toBe(true);
		expect(get(muted)).toBe(true);
		setMuted(false);
		expect(readMuted()).toBe(false);
		expect(get(muted)).toBe(false);
	});

	it('survives a throwing storage', () => {
		const boom = () => {
			throw new Error('blocked');
		};
		vi.stubGlobal('localStorage', { getItem: boom, setItem: boom });
		expect(readMuted()).toBe(false);
		expect(() => setMuted(true)).not.toThrow();
		expect(get(muted)).toBe(true);
		setMuted(false);
	});
});

describe('without Web Audio', () => {
	it('every call is a silent no-op', async () => {
		expect(globalThis.AudioContext).toBeUndefined();
		expect(() => unlock()).not.toThrow();
		await expect(playSfx('correct', { pitch: 1.2, volume: 0.5 })).resolves.toBeUndefined();
		expect(() => setEra('cap03')).not.toThrow();
		expect(() => stopMusic()).not.toThrow();
	});
});
