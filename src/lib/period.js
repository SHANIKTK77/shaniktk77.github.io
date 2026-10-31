// Turns the period strings in data.js ("Oct 2022 – Present", "2020 – 2021") into numbers so
// the career can be drawn on a time axis. Times are decimal years: Jul 2021 -> 2021.5.

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const toYears = (date) => date.getFullYear() + date.getMonth() / 12;

// "Oct 2022" -> 2022.75, "2020" -> 2020, "Present" -> now. Returns null if it can't tell.
export function parsePoint(text, now = new Date()) {
  const value = (text || "").trim().toLowerCase();
  if (value === "present") return toYears(now);
  const match = /^(?:([a-z]{3})[a-z]*\s+)?(\d{4})$/.exec(value);
  if (!match) return null;
  const month = match[1] ? MONTHS.indexOf(match[1]) : 0;
  if (month < 0) return null;
  return Number(match[2]) + month / 12;
}

export function parsePeriod(period, now = new Date()) {
  const [from, to] = (period || "").split(/\s*[–-]\s*/);
  const start = parsePoint(from, now);
  const end = parsePoint(to, now);
  if (start == null || end == null || end < start) return null;
  return { start, end, current: /present/i.test(to) };
}

// 4.08 years -> "4y 1m"
export function formatSpan(years) {
  const months = Math.round(years * 12);
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (!y) return `${m}m`;
  return m ? `${y}y ${m}m` : `${y}y`;
}
