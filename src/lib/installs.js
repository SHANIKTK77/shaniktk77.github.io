// Google Play shows installs as tiers like "100M+" or "500K+". These helpers turn the
// tier in a game's `badge` into a number so the site can draw it to scale.

const UNITS = { K: 1e3, M: 1e6, B: 1e9 };

// "100M+ downloads" -> 100000000. Returns null when the badge has no tier.
export function parseInstalls(badge) {
  const match = /([\d.]+)\s*([KMB])\+/i.exec(badge || "");
  if (!match) return null;
  return Number(match[1]) * UNITS[match[2].toUpperCase()];
}

// "100M+ downloads" -> "100M+"
export function installTier(badge) {
  const match = /([\d.]+\s*[KMB]\+)/i.exec(badge || "");
  return match ? match[1].replace(/\s/g, "") : null;
}

// Position of an install count on a log scale from 100K (0) to 100M (1).
// Tiers are an order of magnitude apart, so a linear bar would hide every game below 50M.
export function installScale(installs) {
  if (!installs) return 0;
  const min = 5; // log10(100K)
  const max = 8; // log10(100M)
  const t = (Math.log10(installs) - min) / (max - min);
  return Math.min(1, Math.max(0.04, 0.12 + t * 0.88));
}
