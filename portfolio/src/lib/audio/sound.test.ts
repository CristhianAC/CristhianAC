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

// Minimal fake of the Web Audio graph: enough to observe which sources start, stop and disconnect.
class FakeParam {
	value = 1;
	setValueAtTime() {}
	linearRampToValueAtTime() {}
	setTargetAtTime() {}
	cancelScheduledValues() {}
}
class FakeNode {
	disconnected = false;
	connect<T>(n: T) {
		return n;
	}
	disconnect() {
		this.disconnected = true;
	}
}
class FakeGain extends FakeNode {
	gain = new FakeParam();
}
class FakeSource extends FakeNode {
	buffer: { duration: number } | null = null;
	loop = false;
	loopStart = 0;
	loopEnd = 0;
	playbackRate = new FakeParam();
	started = false;
	stopped = false;
	onended: (() => void) | null = null;
	gainNode: FakeGain | null = null;
	connect<T>(n: T) {
		if (n instanceof FakeGain) this.gainNode = n;
		return n;
	}
	start() {
		this.started = true;
	}
	stop() {
		this.stopped = true;
	}
}
class FakeContext {
	static last: FakeContext;
	currentTime = 0;
	state = 'running';
	destination = new FakeNode();
	sources: FakeSource[] = [];
	resumes = 0;
	constructor() {
		FakeContext.last = this;
	}
	createGain() {
		return new FakeGain();
	}
	createBufferSource() {
		const s = new FakeSource();
		this.sources.push(s);
		return s;
	}
	decodeAudioData() {
		return Promise.resolve({ duration: 1 });
	}
	resume() {
		this.resumes++;
		this.state = 'running';
		return Promise.resolve();
	}
}

describe('audio graph (fake AudioContext)', () => {
	const listeners = new Map<string, () => void>();
	const flush = () => new Promise((r) => setTimeout(r, 0));

	async function load() {
		vi.resetModules();
		listeners.clear();
		const on = (type: string, fn: () => void) => listeners.set(type, fn);
		vi.stubGlobal('localStorage', memoryStorage());
		vi.stubGlobal('window', { AudioContext: FakeContext, addEventListener: on });
		vi.stubGlobal('document', { visibilityState: 'visible', addEventListener: on });
		vi.stubGlobal('fetch', () => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }));
		return import('./sound');
	}
	const started = () => FakeContext.last.sources.filter((s) => s.started);
	const musicPlaying = () => started().filter((s) => s.loop && !s.stopped);

	it('starts nothing before unlock()', async () => {
		const s = await load();
		FakeContext.last = undefined as unknown as FakeContext;
		s.setEra('cap01');
		await s.playSfx('correct');
		await flush();
		expect(FakeContext.last).toBeUndefined();
		s.unlock();
		await flush();
		expect(started().filter((x) => !x.loop)).toHaveLength(0); // unlock plays no SFX
		expect(musicPlaying()).toHaveLength(1); // the remembered era starts on unlock
	});

	it('starts no SFX while muted', async () => {
		const s = await load();
		s.setMuted(true);
		s.unlock();
		await s.playSfx('correct');
		await s.playSfx('ui-click');
		expect(started()).toHaveLength(0);
	});

	it('rapid era changes leave exactly one music source playing', async () => {
		const s = await load();
		s.unlock();
		s.setEra('cap01');
		s.setEra('cap05');
		s.setEra('cap01');
		await flush();
		await flush();
		expect(musicPlaying()).toHaveLength(1);
		s.setEra('cap05');
		await flush();
		expect(musicPlaying()).toHaveLength(1);
	});

	it('disconnects SFX and faded-out music sources when they end', async () => {
		const s = await load();
		s.unlock();
		await s.playSfx('select');
		const sfx = started().find((x) => !x.loop)!;
		sfx.onended?.();
		expect(sfx.disconnected).toBe(true);
		expect(sfx.gainNode?.disconnected).toBe(true);
		s.setEra('cap01');
		await flush();
		const music = musicPlaying()[0];
		s.stopMusic();
		music.onended?.();
		expect(music.disconnected).toBe(true);
	});

	it('resumes a suspended context when the page is visible again or on the next gesture', async () => {
		const s = await load();
		s.unlock();
		const ctx = FakeContext.last;
		const before = ctx.resumes;
		ctx.state = 'suspended';
		listeners.get('visibilitychange')?.();
		expect(ctx.resumes).toBe(before + 1);
		ctx.state = 'interrupted';
		listeners.get('pointerdown')?.();
		expect(ctx.resumes).toBe(before + 2);
	});
});
