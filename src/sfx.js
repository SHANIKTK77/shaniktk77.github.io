// Tiny synthesized UI sounds (no audio files). Off until the visitor turns them on.
const KEY = "sk-sound";

const SOUNDS = {
  hover: { type: "triangle", from: 1500, to: 1900, dur: 0.045, vol: 0.025 },
  click: { type: "square", from: 540, to: 240, dur: 0.09, vol: 0.035 },
  power: { type: "sawtooth", from: 160, to: 960, dur: 0.32, vol: 0.035 },
};

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

// Browsers only allow audio after a gesture, so wake the context on the first one
export function unlockAudio() {
  if (enabled) audio();
}
