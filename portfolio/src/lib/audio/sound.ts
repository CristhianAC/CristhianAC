import { get, writable } from 'svelte/store';
import type { Era } from '$lib/content/types';
import { sfxNames, tracks, type SfxName, type TrackName } from './manifest';

/** Small Web Audio engine. Every export is a silent no-op on the server or without Web Audio. */

export const MUTE_KEY = 'sound-muted';
const FADE = 1.2; // music crossfade, seconds
const DUCK = 0.5; // -6 dB
const VARY: ReadonlySet<SfxName> = new Set(['ui-hover', 'ui-click', 'select', 'type-blip']);
const DUCKERS: ReadonlySet<SfxName> = new Set(['correct', 'wrong', 'chapter', 'final']);
const ERA_TRACK: Record<Era, TrackName> = {
	cap01: 'retro',
	cap02: 'retro',
	cap03: 'mid',
	cap04: 'mid',
	cap05: 'neon',
	final: 'neon'
};

export const trackForEra = (era: Era): TrackName => ERA_TRACK[era];

export function readMuted(): boolean {
	try {
		return globalThis.localStorage?.getItem(MUTE_KEY) === '1';
	} catch {
		return false;
	}
}

/** Svelte store: `$muted` in components. Default is not muted. */
export const muted = writable(readMuted());

type Graph = { ctx: AudioContext; master: GainNode; music: GainNode; duck: GainNode; sfx: GainNode };
type Playing = { name: TrackName; src: AudioBufferSourceNode; gain: GainNode; startedAt: number };

let graph: Graph | null = null;
let playing: Playing | null = null;
let wanted: TrackName | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();

function audioContextClass(): typeof AudioContext | undefined {
	if (typeof window === 'undefined') return undefined;
	return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

function applyMute(): void {
	if (!graph) return;
	const now = graph.ctx.currentTime;
	graph.master.gain.cancelScheduledValues(now);
	graph.master.gain.setTargetAtTime(get(muted) ? 0 : 1, now, 0.02);
}

export function setMuted(value: boolean): void {
	muted.set(value);
	try {
		globalThis.localStorage?.setItem(MUTE_KEY, value ? '1' : '0');
	} catch {
		// storage blocked: keep the in-memory value
	}
	applyMute();
}

function load(file: string): Promise<AudioBuffer | null> {
	let p = buffers.get(file);
	if (!p) {
		const ctx = graph!.ctx;
		p = fetch(`/audio/${file}.mp3`)
			.then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
			.then((data) => ctx.decodeAudioData(data))
			.catch(() => {
				buffers.delete(file); // allow a retry later
				return null;
			});
		buffers.set(file, p);
	}
	return p;
}

/** Call from a user gesture (e.g. "Empezar"): creates/resumes the context and preloads SFX. Plays nothing. */
export function unlock(): void {
	const AC = audioContextClass();
	if (!AC) return;
	try {
		if (!graph) {
			const ctx = new AC();
			const master = ctx.createGain();
			const music = ctx.createGain();
			const duck = ctx.createGain();
			const sfx = ctx.createGain();
			music.gain.value = 0.55;
			sfx.gain.value = 0.9;
			music.connect(duck).connect(master);
			sfx.connect(master);
			master.connect(ctx.destination);
			graph = { ctx, master, music, duck, sfx };
			watchResume();
			applyMute();
			for (const name of sfxNames) void load(name);
			if (wanted) void startTrack(wanted);
		}
		if (graph.ctx.state === 'suspended') graph.ctx.resume().catch(() => {});
	} catch {
		graph = null;
	}
}

/** Browsers suspend (or on iOS "interrupt") the context in the background: resume when visible or on the next gesture. */
function watchResume(): void {
	const resume = () => {
		if (!graph || graph.ctx.state === 'running' || document.visibilityState !== 'visible') return;
		graph.ctx.resume().catch(() => {});
	};
	document.addEventListener('visibilitychange', resume);
	window.addEventListener('pointerdown', resume, true);
	window.addEventListener('keydown', resume, true);
}

function duckMusic(seconds: number): void {
	const g = graph!.duck.gain;
	const now = graph!.ctx.currentTime;
	g.cancelScheduledValues(now);
	g.setValueAtTime(g.value, now);
	g.linearRampToValueAtTime(DUCK, now + 0.06);
	g.setValueAtTime(DUCK, now + Math.max(seconds, 0.5));
	g.linearRampToValueAtTime(1, now + Math.max(seconds, 0.5) + 0.5);
}

export async function playSfx(name: SfxName, opts: { pitch?: number; volume?: number } = {}): Promise<void> {
	if (!graph || get(muted)) return;
	const buffer = await load(name);
	if (!buffer || !graph || get(muted)) return;
	const { ctx, sfx } = graph;
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	const jitter = VARY.has(name) ? 1 + (Math.random() * 2 - 1) * 0.03 : 1;
	src.playbackRate.value = (opts.pitch ?? 1) * jitter;
	const gain = ctx.createGain();
	gain.gain.value = opts.volume ?? 1;
	src.connect(gain).connect(sfx);
	src.onended = () => {
		src.disconnect();
		gain.disconnect();
	};
	if (DUCKERS.has(name)) duckMusic(buffer.duration);
	src.start();
}

function fadeOut(p: Playing, seconds: number): void {
	const now = graph!.ctx.currentTime;
	p.gain.gain.cancelScheduledValues(now);
	p.gain.gain.setValueAtTime(p.gain.gain.value, now);
	p.gain.gain.linearRampToValueAtTime(0, now + seconds);
	p.src.onended = () => {
		p.src.disconnect();
		p.gain.disconnect();
	};
	p.src.stop(now + seconds + 0.05);
}

async function startTrack(name: TrackName): Promise<void> {
	const { file, loopStart, loopEnd } = tracks[name];
	const buffer = await load(file);
	if (!buffer || !graph || wanted !== name || playing?.name === name) return; // stale request
	const { ctx, music } = graph;
	const len = loopEnd - loopStart;
	// same tempo and loop length: keep the bar position so the crossfade stays on the beat
	const pos = playing ? (((ctx.currentTime - playing.startedAt) % len) + len) % len : 0;
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	src.loop = true;
	src.loopStart = loopStart;
	src.loopEnd = loopEnd;
	const gain = ctx.createGain();
	const now = ctx.currentTime;
	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(1, now + FADE);
	src.connect(gain).connect(music);
	src.start(now, loopStart + pos);
	if (playing) fadeOut(playing, FADE);
	playing = { name, src, gain, startedAt: now - pos };
}

/** Crossfades to the loop of this era; before unlock() it is remembered and starts on unlock. */
export function setEra(era: Era): void {
	const name = trackForEra(era);
	wanted = name;
	if (graph && playing?.name !== name) void startTrack(name);
}

export function stopMusic(): void {
	wanted = null;
	if (!graph || !playing) return;
	fadeOut(playing, 0.6);
	playing = null;
}
