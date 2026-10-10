// Tiny synthesized UI sounds (no audio files). Off until the visitor turns them on.
const KEY = "sk-sound";

const SOUNDS = {
  hover: { type: "triangle", from: 1500, to: 1900, dur: 0.045, vol: 0.025 },
  click: { type: "square", from: 540, to: 240, dur: 0.09, vol: 0.035 },
  power: { type: "sawtooth", from: 160, to: 960, dur: 0.32, vol: 0.035 },
  hit: { type: "square", from: 190, to: 50, dur: 0.14, vol: 0.05 },
};

// Rising arpeggio for achievements
const CHIME = [523.25, 659.25, 783.99, 1046.5];

let ctx = null;
let enabled = false;

export function savedSound() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch (e) {
    return false;
  }
}

function audio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setSound(on) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch (e) {
    // Without storage the choice just isn't remembered
  }
}

export function play(name) {
  if (!enabled) return;
  const ac = audio();
  const s = SOUNDS[name];
  if (!ac || !s || ac.state !== "running") return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = s.type;
  osc.frequency.setValueAtTime(s.from, t);
  osc.frequency.exponentialRampToValueAtTime(s.to, t + s.dur);
  gain.gain.setValueAtTime(s.vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + s.dur + 0.02);
}

export function chime() {
  if (!enabled) return;
  const ac = audio();
  if (!ac || ac.state !== "running") return;
  CHIME.forEach((f, i) => {
    const t = ac.currentTime + i * 0.075;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

// Engine hum for the drivable hero: two detuned oscillators through a low-pass filter.
// Pass a level from 0 (idle) to 1 (top speed), or null to fade it out.
let engine = null;

export function setEngine(level, boost) {
  if (!engine && (level === null || !enabled)) return;
  const ac = audio();
  if (!ac || ac.state !== "running") return;
  const t = ac.currentTime;
  if (!engine) {
    const a = ac.createOscillator();
    const b = ac.createOscillator();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();
    a.type = "sawtooth";
    b.type = "square";
    filter.type = "lowpass";
    filter.Q.value = 6;
    gain.gain.value = 0;
    a.connect(filter);
    b.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    a.start();
    b.start();
    engine = { a, b, filter, gain };
  }
  const on = enabled && level !== null;
  const l = on ? level : 0;
  const f = 42 + l * 150;
  engine.a.frequency.setTargetAtTime(f, t, 0.06);
  engine.b.frequency.setTargetAtTime(f * 0.5 + 1.5, t, 0.06);
  engine.filter.frequency.setTargetAtTime(260 + l * 1500 + (boost ? 900 : 0), t, 0.08);
  engine.gain.gain.setTargetAtTime(on ? 0.022 + l * 0.018 : 0, t, on ? 0.08 : 0.15);
}

// Browsers only allow audio after a gesture, so wake the context on the first one
export function unlockAudio() {
  if (enabled) audio();
}
