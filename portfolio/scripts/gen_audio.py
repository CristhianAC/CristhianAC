"""Synthesizes every sound of the quiz show by code (numpy only), then encodes to MP3 with ffmpeg.

Usage: npm run audio   (python3 scripts/gen_audio.py)
Writes static/audio/*.mp3 and src/lib/audio/manifest.ts (loop points). Deterministic: fixed seed.

Music: three loops at 120 BPM in A minor, 8 bars each (16 s), so crossfades stay on the beat:
  retro (CAP-01..02) pulse chiptune · mid (CAP-03..04) richer chiptune with bass and pad ·
  neon (CAP-05..FINAL) synthwave with saw pads, gated snare and sub bass.
Loops are rendered circularly (tails wrap to the start) and exported with PRE seconds of wrapped
audio on both sides; the engine loops between loopStart/loopEnd, so mp3 encoder padding never lands
inside the loop, and any decoder delay shifts both points equally over periodic content.
Approach follows the UnderCodes reel generator (ADSR, FFT filters, saw/pulse, kick/snap/hat, reverb).
"""
import os
import shutil
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "static", "audio")
MANIFEST = os.path.join(ROOT, "src", "lib", "audio", "manifest.ts")
FFMPEG = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
rng = np.random.default_rng(11)

BPM = 120
B = 60 / BPM  # 0.5 s per beat
BAR = 4 * B
BARS = 8
LOOP_N = int(round(BARS * BAR * SR))  # exact loop length in samples
PRE = 0.1  # wrapped margin around the loop, in seconds


# ---------- helpers (adapted from the reel generator) ----------
def t_(d):
    return np.arange(int(d * SR)) / SR


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def env(n, a=0.005, d=0.1, s=0.0, r=0.05):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    h_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([np.linspace(0, 1, max(a_n, 1)), np.linspace(1, s, max(d_n, 1)),
                        np.full(h_n, s), np.linspace(s, 0, max(r_n, 1))])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def _fft_filter(x, gain_fn, circular=False):
    """Zero-phase FFT filter with a Butterworth-like magnitude. circular=True keeps loops seamless."""
    n = len(x)
    if n < 2:
        return x
    m = n if circular else 1 << int(np.ceil(np.log2(n)))
    f = np.fft.rfftfreq(m, 1 / SR)
    return np.fft.irfft(np.fft.rfft(x, m) * gain_fn(np.maximum(f, 1e-6)), m)[:n]


def lp(x, f, order=2, circular=False):
    return _fft_filter(x, lambda fr: 1 / np.sqrt(1 + (fr / f) ** (2 * order)), circular)


def hp(x, f, order=2, circular=False):
    return _fft_filter(x, lambda fr: 1 / np.sqrt(1 + (f / fr) ** (2 * order)), circular)


def bp(x, lo, hi, order=2):
    return _fft_filter(x, lambda fr: 1 / np.sqrt(1 + (lo / fr) ** (2 * order)) / np.sqrt(1 + (fr / hi) ** (2 * order)))


def saw(f, t):
    return 2 * ((f * t) % 1) - 1


def pulse(f, t, duty=0.5):
    return np.where((f * t) % 1 < duty, 1.0, -1.0)


def tri(f, t):
    return 2 * np.abs(2 * ((f * t) % 1) - 1) - 1


def sweep_lp(x, f0, f1, steps=32):
    """Block-wise swept low-pass (approximates a moving filter)."""
    out = np.zeros_like(x)
    edges = np.linspace(0, len(x), steps + 1).astype(int)
    for i in range(steps):
        f = f0 * (f1 / f0) ** (i / max(steps - 1, 1))
        seg = lp(x[max(0, edges[i] - 2048):edges[i + 1]], f)
        k = edges[i + 1] - edges[i]
        if k:
            out[edges[i]:edges[i + 1]] = seg[-k:]
    return out


def place(buf, sig, at, wrap=False):
    i = int(round(at * SR))
    if wrap:
        idx = (i + np.arange(len(sig))) % len(buf)
        np.add.at(buf, idx, sig)
        return
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def norm(x, peak):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def reverb(x, decay=1.2, mix=0.25, circular=False):
    n = int(decay * SR)
    ir = lp(rng.standard_normal(n) * np.exp(-np.linspace(0, 6, n)), 6000)
    m = len(x) if circular else 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
    return x * (1 - mix) + norm(wet, np.max(np.abs(x)) or 1) * mix


def echo(x, delay, fb=0.35, taps=4):
    """Circular feedback-style delay for loops."""
    y = x.copy()
    d = int(round(delay * SR))
    for k in range(1, taps + 1):
        y += np.roll(x, d * k) * fb ** k
    return y


def crush(x, bits=4, hold=4):
    """Bit-crush + sample-and-hold for the soft glitch."""
    q = 2 ** (bits - 1)
    y = np.round(x * q) / q
    return np.repeat(y[::hold], hold)[: len(x)]


# ---------- instruments ----------
def chip(freq, d, duty=0.25, a=0.002, dec=0.12, s=0.35, r=0.04, cutoff=5000, vib=0.0):
    t = t_(d)
    f = freq * (1 + vib * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.25, 0, 1))
    ph = np.cumsum(f) / SR
    x = np.where(ph % 1 < duty, 1.0, -1.0)
    return lp(x, cutoff) * env(len(t), a, dec, s, r)


def tri_bass(freq, d):
    t = t_(d)
    return tri(freq, t) * env(len(t), 0.003, 0.08, 0.8, 0.03)


def pwm_pad(midis, d, cutoff=1400, a=0.4):
    t = t_(d)
    x = np.zeros(len(t))
    for m in midis:
        for det, ph in ((-0.003, 0.0), (0.004, 1.3)):
            width = 0.5 + 0.2 * np.sin(2 * np.pi * 0.3 * t + ph)
            x += np.where((hz(m) * (1 + det) * t) % 1 < width, 1.0, -1.0)
    return lp(x / (2 * len(midis)), cutoff) * env(len(t), a, 0.3, 0.85, 0.4)


def supersaw(midis, d, cutoff=1800, a=0.25):
    t = t_(d)
    x = np.zeros(len(t))
    for m in midis:
        for det in (-0.012, -0.005, 0.0, 0.006, 0.011):
            x += saw(hz(m) * (1 + det), t + rng.random())
    return lp(x / (5 * len(midis)), cutoff) * env(len(t), a, 0.3, 0.8, 0.3)


def saw_pluck(freq, d=0.22, c0=3200, c1=500):
    t = t_(d)
    x = saw(freq, t) * 0.6 + saw(freq * 1.005, t) * 0.4
    return sweep_lp(x, c0, c1, 8) * env(len(t), 0.002, 0.15, 0.2, 0.05)


def sub_bass(freq, d):
    t = t_(d)
    x = np.sin(2 * np.pi * freq * t) + lp(saw(freq, t), 420) * 0.5
    return np.tanh(x * 1.3) * env(len(t), 0.004, 0.08, 0.7, 0.05)


def chip_kick(g=1.0):
    t = t_(0.18)
    f = 45 + 160 * np.exp(-t * 45)
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 22) * 0.6 * g


def chip_noise(d, decay, cutoff, g=1.0):
    t = t_(d)
    return lp(crush(rng.standard_normal(len(t)), 5, 3), cutoff) * np.exp(-t * decay) * g


def kick(g=1.0):
    t = t_(0.3)
    f = 48 + 120 * np.exp(-t * 36)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)
            + hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * 0.15) * g


def snap(g=1.0):
    t = t_(0.18)
    return bp(rng.standard_normal(len(t)), 1800, 6500) * (np.exp(-t * 55) * 0.8 + np.exp(-t * 14) * 0.2) * g


def hat(g=1.0, d=0.05, decay=90):
    t = t_(d)
    return hp(rng.standard_normal(len(t)), 8000, 4) * np.exp(-t * decay) * g


def gated_snare(g=1.0):
    """80s gated snare: body + noise into a dense reverb, then hard-gated at 0.24 s."""
    t = t_(0.5)
    body = np.sin(2 * np.pi * np.cumsum(190 + 60 * np.exp(-t * 40)) / SR) * np.exp(-t * 25) * 0.5
    noise = bp(rng.standard_normal(len(t)), 900, 8000) * np.exp(-t * 18)
    x = reverb(body + noise, 0.6, 0.55)
    gate = np.ones(len(t))
    g0, g1 = int(0.22 * SR), int(0.26 * SR)
    gate[g0:g1] = np.linspace(1, 0, g1 - g0)
    gate[g1:] = 0
    return x * gate * g


def tone(freq, d=0.3, decay=9.0):
    t = t_(d)
    return (np.sin(2 * np.pi * freq * t) + 0.15 * np.sin(2 * np.pi * freq * 2 * t)) * np.exp(-t * decay) * env(len(t), 0.003, 0.05, 1, 0.03)


# ---------- music ----------
# A minor, one chord per bar: (bass root midi, chord tones)
AM, F, C, G, DM, E = (45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62]), (38, [57, 62, 65]), (40, [56, 59, 64])


def new_bus():
    return np.zeros(LOOP_N)


def stereo(mono_parts, wide_parts):
    """Mono parts sit centered; wide parts get a short Haas offset on the right channel."""
    c = sum(mono_parts)
    w = sum(wide_parts)
    left = c + w
    right = c + np.roll(w, int(0.013 * SR)) * 0.9 + w * 0.1
    return np.stack([left, right], 1)


def music_retro():
    prog = [AM, F, C, G, AM, F, G, E]
    arp, bass, lead, drums = new_bus(), new_bus(), new_bus(), new_bus()
    melody = [(0, 76, 1.5), (1.5, 74, 0.5), (2, 72, 1), (3, 71, 1),  # bar 5..8 (beats relative to bar 4)
              (4, 72, 1.5), (5.5, 69, 0.5), (6, 72, 2),
              (8, 74, 1.5), (9.5, 72, 0.5), (10, 71, 1), (11, 74, 1),
              (12, 76, 2), (14, 71, 2)]
    for bar, (root, ch) in enumerate(prog):
        s = bar * BAR
        for k in range(16):
            note = (ch + [ch[0] + 12])[[0, 1, 2, 3, 2, 1, 0, 1][k % 8]] + 12
            place(arp, chip(hz(note), B / 4, 0.25, dec=0.08, s=0.25, cutoff=4200) * (0.55 if k % 4 else 0.7), s + k * B / 4, True)
        for k in range(8):
            place(bass, tri_bass(hz(root - 12 + (12 if k % 2 else 0)), B / 2 * 0.9), s + k * B / 2, True)
        for beat in range(4):
            pos = s + beat * B
            if beat in (0, 2):
                place(drums, chip_kick(1.0), pos, True)
            if beat in (1, 3):
                place(drums, chip_noise(0.16, 22, 6500, 0.55), pos, True)
            place(drums, chip_noise(0.03, 120, 9000, 0.18), pos + B / 2, True)
        if bar == 3:
            place(drums, chip_noise(0.08, 30, 6000, 0.35), s + 3.5 * B, True)
    for at, m, dur in melody:
        place(lead, chip(hz(m), dur * B * 0.95, 0.5, dec=0.2, s=0.6, r=0.08, cutoff=3200, vib=0.006), 4 * BAR + at * B, True)
    arp = echo(arp, 0.75 * B, 0.3, 3)
    lead = reverb(echo(lead, 0.75 * B, 0.25, 2), 0.9, 0.2, circular=True)
    return stereo([bass * 0.42, drums * 0.5, lead * 0.24], [arp * 0.2])


def music_mid():
    prog = [AM, F, C, G, DM, F, G, E]
    arp, bass, pad, lead, drums = new_bus(), new_bus(), new_bus(), new_bus(), new_bus()
    melody = [(0, 69, 0.5), (0.5, 72, 0.5), (1, 76, 1), (2, 74, 0.5), (2.5, 72, 1.5),
              (4, 72, 0.5), (4.5, 74, 0.5), (5, 76, 1), (6, 79, 1), (7, 76, 1),
              (8, 77, 1.5), (9.5, 76, 0.5), (10, 74, 2),
              (12, 71, 1), (13, 74, 1), (14, 76, 2)]
    for bar, (root, ch) in enumerate(prog):
        s = bar * BAR
        place(pad, pwm_pad(ch, BAR + 0.4, 1500), s, True)
        for k in range(16):
            note = ch[[0, 2, 1, 2][k % 4]] + 12 + (12 if k % 8 >= 4 else 0)
            place(arp, chip(hz(note), B / 4, 0.125, dec=0.07, s=0.2, cutoff=3800) * (0.5 if k % 2 else 0.65), s + k * B / 4, True)
        for k, (step, octv) in enumerate([(0, 0), (0.75, 12), (1.5, 0), (2, 0), (2.75, 12), (3.5, 7)]):
            place(bass, chip(hz(root - 12 + octv), 0.22, 0.5, dec=0.1, s=0.5, cutoff=900), s + step * B, True)
        for beat in range(4):
            pos = s + beat * B
            if beat in (0, 2) or (beat == 3 and bar % 2):
                place(drums, kick(0.85) if beat != 3 else kick(0.5), pos if beat != 3 else pos + B / 2, True)
            if beat in (1, 3):
                place(drums, snap(0.5), pos, True)
                place(drums, chip_noise(0.1, 30, 6000, 0.2), pos, True)
            for q in range(4):
                place(drums, hat(0.09 if q == 2 else 0.045), pos + q * B / 4, True)
    for at, m, dur in melody:
        place(lead, chip(hz(m), dur * B * 0.92, 0.25, dec=0.15, s=0.55, r=0.06, cutoff=3000, vib=0.005), 4 * BAR + at * B, True)
    arp = echo(arp, 0.75 * B, 0.3, 3)
    lead = reverb(echo(lead, 0.75 * B, 0.25, 2), 1.1, 0.25, circular=True)
    pad = reverb(pad, 1.2, 0.3, circular=True)
    return stereo([bass * 0.38, np.tanh(drums * 0.9) * 0.55, lead * 0.22], [arp * 0.15, pad * 0.22])


def music_neon():
    prog = [AM, F, C, G, AM, F, DM, E]
    pads, bass, arp, lead, drums = new_bus(), new_bus(), new_bus(), new_bus(), new_bus()
    melody = [(0, 76, 2), (2, 79, 1), (3, 77, 1),
              (4, 76, 2), (6, 72, 2),
              (8, 74, 1.5), (9.5, 77, 0.5), (10, 76, 2),
              (12, 76, 1), (13, 71, 1), (14, 68, 2)]
    for bar, (root, ch) in enumerate(prog):
        s = bar * BAR
        place(pads, supersaw(ch + [ch[0] - 12], BAR + 0.3, 1700), s, True)
        for k in range(8):
            place(bass, sub_bass(hz(root - 12), B / 2 * 0.85) * (1.0 if k % 2 == 0 else 0.8), s + k * B / 2, True)
        for k in range(16):
            note = (ch + [ch[0] + 12])[[0, 1, 2, 3][k % 4]] + 12
            place(arp, saw_pluck(hz(note), 0.2, 2600 if k % 4 == 0 else 1900, 450), s + k * B / 4, True)
        for beat in range(4):
            pos = s + beat * B
            if beat in (0, 2):
                place(drums, kick(1.0), pos, True)
            if beat in (1, 3):
                place(drums, gated_snare(0.75), pos, True)
            for q in (0, 1, 2, 3):
                place(drums, hat(0.07 if q % 2 else 0.035), pos + q * B / 4, True)
    for at, m, dur in melody:
        t = t_(dur * B * 0.95)
        f = hz(m) * (1 + 0.006 * np.sin(2 * np.pi * 5 * t) * np.clip(t / 0.3, 0, 1))
        ph = np.cumsum(f) / SR
        x = (2 * (ph % 1) - 1) * 0.5 + (2 * ((ph * 1.004) % 1) - 1) * 0.5
        place(lead, lp(x, 2600) * env(len(t), 0.02, 0.2, 0.7, 0.1), 4 * BAR + at * B, True)
    # sidechain-style pump on pads and bass from the kick (beats 1 and 3)
    ph = (np.arange(LOOP_N) / SR) % (2 * B)
    pump = 1 - 0.45 * np.exp(-ph * 9)
    pads = reverb(pads * pump, 1.6, 0.3, circular=True)
    bass = bass * (1 - 0.3 * np.exp(-ph * 12))
    arp = echo(arp, 0.75 * B, 0.35, 3)
    lead = reverb(echo(lead, 0.75 * B, 0.3, 3), 1.4, 0.3, circular=True)
    return stereo([np.tanh(bass * 1.1) * 0.42, np.tanh(drums) * 0.55, lead * 0.2], [pads * 0.3, arp * 0.13])


# ---------- sfx ----------
def sfx_all():
    out = {}
    t = t_(0.035)
    out["ui-hover"] = (tone(2600, 0.035, 120), 0.3)
    t = t_(0.05)
    click = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 400) + np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 260) * 0.6
    out["ui-click"] = (click, 0.45)
    sel = np.zeros(int(0.2 * SR))
    place(sel, chip(hz(76), 0.07, 0.25, dec=0.05, s=0.4, cutoff=4500), 0)
    place(sel, chip(hz(81), 0.12, 0.25, dec=0.08, s=0.3, cutoff=4500), 0.055)
    out["select"] = (sel, 0.55)
    out["type-blip"] = (chip(hz(81), 0.035, 0.5, a=0.001, dec=0.03, s=0.0, r=0.003, cutoff=3200), 0.35)

    # correct: "compile" success, rising A-major arpeggio + soft sparkle
    cor = np.zeros(int(1.1 * SR))
    for k, m in enumerate([69, 73, 76, 81]):
        place(cor, chip(hz(m), 0.16 if k < 3 else 0.45, 0.25, dec=0.1, s=0.5, r=0.15, cutoff=4500), k * 0.065)
    for k, f in enumerate([2637, 3520, 3136]):  # E7, A7, G7: short soft glints, not bells
        place(cor, tone(f, 0.12, 40) * 0.18, 0.26 + k * 0.05)
    st = t_(0.5)
    place(cor, hp(rng.standard_normal(len(st)), 7000) * np.exp(-st * 9) * 0.08, 0.26)
    out["correct"] = (reverb(cor, 0.7, 0.22), 0.7)

    # wrong: soft bit-crushed buzz, two short descending tones (not punishing)
    wr = np.zeros(int(0.5 * SR))
    place(wr, chip(hz(64), 0.13, 0.5, dec=0.1, s=0.5, cutoff=2000), 0)
    place(wr, chip(hz(60), 0.22, 0.5, dec=0.15, s=0.4, r=0.08, cutoff=1600, vib=0.02), 0.12)
    out["wrong"] = (lp(crush(wr, 4, 6), 2400), 0.32)

    # lifeline: power-up, pitch-swept pulse with a quick arpeggio flourish
    t = t_(0.55)
    f = 260 * (5.0 ** (t / t[-1]) ** 0.8)
    f = f * (1 + 0.04 * np.sign(np.sin(2 * np.pi * 18 * t)))
    pw = np.where((np.cumsum(f) / SR) % 1 < 0.3, 1.0, -1.0)
    lf = lp(pw, 4000) * env(len(t), 0.01, 0.1, 0.7, 0.12) * 0.7
    tail = np.zeros(int(0.85 * SR))
    place(tail, lf, 0)
    for k, m in enumerate([81, 84, 88]):
        place(tail, chip(hz(m), 0.1, 0.125, dec=0.06, s=0.3, cutoff=5000) * 0.5, 0.5 + k * 0.05)
    out["lifeline"] = (reverb(tail, 0.6, 0.2), 0.5)

    # whoosh: band-pass noise swept up and down
    d = 0.45
    t = t_(d)
    n = rng.standard_normal(len(t))
    ws = np.zeros(len(t))
    edges = np.linspace(0, len(t), 30).astype(int)
    for i in range(29):
        c = 500 * (7000 / 500) ** np.sin(np.pi * edges[i] / len(t))
        seg = bp(n[max(0, edges[i] - 1024):edges[i + 1]], c * 0.6, min(c * 1.6, SR / 2 - 200))
        ws[edges[i]:edges[i + 1]] = seg[-(edges[i + 1] - edges[i]):]
    out["whoosh"] = (ws * np.sin(np.pi * t / d) ** 1.5, 0.6)

    # hit: impact on cut, pitched-down body + noise transient
    t = t_(0.6)
    body = np.sin(2 * np.pi * np.cumsum(38 + 110 * np.exp(-t * 20)) / SR) * np.exp(-t * 6)
    hit = np.tanh(body * 1.8) + lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 40) * 0.5
    out["hit"] = (hit, 0.75)

    # chapter: impact + A-minor(add9) saw stab opening up, with reverb
    ch = np.zeros(int(1.6 * SR))
    place(ch, hit * 0.8, 0)
    t = t_(1.1)
    stab = sum(saw(hz(m) * (1 + det), t) for m in (57, 64, 69, 71, 72) for det in (-0.004, 0.004))
    place(ch, sweep_lp(stab / 10, 600, 3200, 24) * env(len(t), 0.005, 0.4, 0.4, 0.5) * 0.9, 0.0)
    out["chapter"] = (reverb(ch, 1.2, 0.3), 0.75)

    # final: on-air win, riser into a big A-major chord with arps and a long tail (~2.8 s)
    fin = np.zeros(int(2.8 * SR))
    t = t_(0.45)
    place(fin, sweep_lp(hp(rng.standard_normal(len(t)), 400), 400, 8000, 16) * (t / t[-1]) ** 2 * 0.35, 0)
    at = 0.45
    place(fin, hit * 0.9, at)
    t = t_(2.3)
    chord = sum(saw(hz(m) * (1 + det), t + rng.random()) for m in (45, 57, 61, 64, 69, 73) for det in (-0.007, 0, 0.007))
    place(fin, lp(chord / 18, 2400) * env(len(t), 0.01, 0.5, 0.55, 1.2), at)
    for k, m in enumerate([69, 73, 76, 81, 85, 88, 93]):
        place(fin, chip(hz(m), 0.14, 0.25, dec=0.08, s=0.3, cutoff=5000) * 0.35, at + 0.05 + k * 0.06)
    t = t_(1.6)
    place(fin, hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 3.5) * 0.12, at)  # crash wash
    fin = reverb(fin, 1.8, 0.3)
    fade = np.ones(len(fin))
    fade[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 2
    out["final"] = (fin * fade, 0.75)
    return out


# ---------- io ----------
def write_wav(path, x):
    ch = 1 if x.ndim == 1 else x.shape[1]
    with wave.open(path, "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def encode(wav, mp3, kbps, channels):
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", wav, "-ac", str(channels), "-c:a", "libmp3lame",
                    "-b:a", f"{kbps}k", "-map_metadata", "-1", "-bitexact", mp3], check=True)


def measure(mp3):
    """Decode the encoded file back and report peak dBFS / RMS dBFS (what the browser will play)."""
    raw = subprocess.run([FFMPEG, "-loglevel", "error", "-i", mp3, "-f", "f32le", "-ac", "1", "-"],
                         check=True, capture_output=True).stdout
    x = np.frombuffer(raw, "<f4")
    raw2 = subprocess.run([FFMPEG, "-loglevel", "error", "-i", mp3, "-f", "f32le", "-"],
                          check=True, capture_output=True).stdout
    y = np.frombuffer(raw2, "<f4")
    db = lambda v: 20 * np.log10(max(v, 1e-9))
    return db(np.max(np.abs(y))), db(np.sqrt(np.mean(x.astype(np.float64) ** 2)))


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="gen_audio_")
    report = []
    try:
        for name, (x, peak) in sfx_all().items():
            # mono SFX; peak target leaves >= 3 dB headroom for mp3 overshoot (must stay <= -1 dBFS)
            x = hp(x, 30)
            x = norm(x, peak)
            fade = min(len(x), int(0.003 * SR))
            x[-fade:] *= np.linspace(1, 0, fade)
            wav = os.path.join(tmp, name + ".wav")
            write_wav(wav, x)
            encode(wav, os.path.join(OUT, name + ".mp3"), 96, 1)
        loops = {}
        for name, fn in (("retro", music_retro), ("mid", music_mid), ("neon", music_neon)):
            x = fn()
            x = np.stack([hp(x[:, c], 30, circular=True) for c in range(2)], 1)
            x = norm(x, 0.6)
            pre = int(PRE * SR)
            padded = np.concatenate([x[-pre:], x, x[:pre]])  # periodic margin around the exact loop
            wav = os.path.join(tmp, f"music-{name}.wav")
            write_wav(wav, padded)
            encode(wav, os.path.join(OUT, f"music-{name}.mp3"), 112, 2)
            loops[name] = (PRE, PRE + LOOP_N / SR)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    sfx_names = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith(".mp3") and not f.startswith("music-"))
    lines = [
        "// Generated by scripts/gen_audio.py (npm run audio). Do not edit by hand.",
        f"export const sfxNames = {sfx_names!r} as const;",
        "export type SfxName = (typeof sfxNames)[number];",
        "",
        "/** Loop points in seconds inside each music file (skips mp3 encoder padding). */",
        "export const tracks = {",
    ]
    for name, (a, b) in loops.items():
        lines.append(f"\t{name}: {{ file: 'music-{name}', loopStart: {a:.6f}, loopEnd: {b:.6f} }},")
    lines += ["} as const;", "export type TrackName = keyof typeof tracks;", ""]
    with open(MANIFEST, "w") as fh:
        fh.write("\n".join(lines))

    total = 0
    print(f"{'file':<22}{'peak dBFS':>10}{'RMS dBFS':>10}{'bytes':>9}")
    for f in sorted(os.listdir(OUT)):
        p = os.path.join(OUT, f)
        size = os.path.getsize(p)
        total += size
        pk, rms = measure(p)
        report.append((f, pk, rms, size))
        print(f"{f:<22}{pk:>10.2f}{rms:>10.2f}{size:>9}")
    print(f"total {total} bytes ({total / 1024 / 1024:.2f} MB)")
    bad = [f for f, pk, _, _ in report if pk > -1.0]
    if bad:
        raise SystemExit(f"peaks above -1 dBFS: {bad}")


if __name__ == "__main__":
    main()
