export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function pad2(n: number) {
  return String(Math.floor(Math.abs(n))).padStart(2, "0");
}

export function formatDurationMs(ms: number) {
  const total = Math.max(0, Math.round(ms));
  const cs = Math.floor((total % 1000) / 10);
  const totalSeconds = Math.floor(total / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}

export function parseHmsToMs(h: number, m: number, s: number) {
  const hh = clamp(Number.isFinite(h) ? h : 0, 0, 999);
  const mm = clamp(Number.isFinite(m) ? m : 0, 0, 59);
  const ss = clamp(Number.isFinite(s) ? s : 0, 0, 59);
  return ((hh * 60 + mm) * 60 + ss) * 1000;
}

export function splitMsToHms(ms: number) {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return { h, m, s };
}