// The scene's latest frame numbers, shared with whatever wants to show them (the hero HUD).
// A tiny store rather than React context: the scene publishes twice a second at most.

let latest = null;
const listeners = new Set();

export function publishStats(stats) {
  latest = stats;
  listeners.forEach((fn) => fn(stats));
}

export function subscribeStats(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function latestStats() {
  return latest;
}
