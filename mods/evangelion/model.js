// Pure state/telemetry logic. No Herdr access and no simulated agent metrics.
export const REPLACED = { main: "my-herdr", terminals: "my-terminals", win98: "win98-dark" };
export const TITLES = { main: "Herdr", terminals: "Terminals", win98: "Windows 98", winxp: "Windows XP", "herdr-t3": "Herdr T3", "main-folders": "Space Folders", "herdr-sim": "Herdr Sim", lcars: "LCARS", evangelion: "Evangelion", fallout: "Fallout" };
export function layoutTitle(name) {
  const original = Object.keys(REPLACED).find(k => REPLACED[k] === name);
  const base = String(name).replace(/^my-/, "");
  return TITLES[original] ?? TITLES[name] ?? TITLES[base] ?? base.split(/[-_ ]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}
export function listedLayouts(names) {
  return [...new Set(names)].filter(n => !(REPLACED[n] && names.includes(REPLACED[n])));
}
export const STATUS = { working: "ACTIVE", blocked: "NEEDS YOU", done: "COMPLETE", idle: "STANDBY" };
export function livery(agent, selected) {
  if ([0, 1, 2].includes(selected)) return selected;
  const app = `${agent?.app ?? ""} ${agent?.program?.key ?? ""}`.toLowerCase();
  return app.includes("codex") ? 1 : app.includes("claude") ? 2 : 0;
}
export function tally(agents) {
  return agents.reduce((s, a) => { s[a.status] = (s[a.status] ?? 0) + 1; return s; }, { working: 0, blocked: 0, done: 0, idle: 0 });
}
export function parseNetwork(text) {
  const m = text.match(/Network interfaces:\s*([^\n]*)/);
  if (!m) return { state: /No network information|No IPv[46]/i.test(text) ? "down" : "unknown", interfaces: [] };
  const interfaces = m[1].trim().split(/\s+/).filter(x => x && !/^(none|\(none\))$/i.test(x));
  return { state: interfaces.length && /\(Reachable\)/.test(text) ? "up" : "down", interfaces };
}
export function parseBattery(text) {
  if (!/InternalBattery/.test(text)) return /Now drawing from/.test(text) ? { present: false } : { present: null };
  const m = text.match(/(\d+)%;\s*([^;\n]+)/);
  if (!m) return { present: true, percent: null, charging: false, ac: /'AC Power'/.test(text) };
  return { present: true, percent: Math.min(100, Math.max(0, Number(m[1]))), charging: /^(charging|finishing charge)$/i.test(m[2].trim()), ac: /'AC Power'/.test(text), state: m[2].trim() };
}
export function toggleCell(board, index, size = 5) {
  const next = [...board], row = Math.floor(index / size), col = index % size;
  for (const [r, c] of [[row,col],[row-1,col],[row+1,col],[row,col-1],[row,col+1]]) {
    if (r >= 0 && r < size && c >= 0 && c < size) next[r * size + c] = !next[r * size + c];
  }
  return next;
}
export function containment(seed = 1) {
  // Scramble by legal moves; replaying these moves always solves the board.
  let board = Array(25).fill(false), state = seed >>> 0;
  const solution = [];
  for (let i = 0; i < 9; i++) { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; const cell = state % 25; board = toggleCell(board, cell); solution.push(cell); }
  if (!board.some(Boolean)) { board = toggleCell(board, 12); solution.push(12); }
  return { board, solution };
}
export function memoryDeck(seed = 1) {
  let state = seed >>> 0;
  const cards = Array.from({ length: 16 }, (_, i) => i % 8);
  for (let i = 15; i > 0; i--) { state = (Math.imul(state,1664525)+1013904223) >>> 0; const j = state % (i+1); [cards[i],cards[j]] = [cards[j],cards[i]]; }
  return cards;
}
export function memoryPick(state, index) {
  if (state.matched.includes(index) || state.open.includes(index) || state.open.length === 2) return state;
  const open = [...state.open, index];
  if (open.length < 2) return { ...state, open };
  const match = state.cards[open[0]] === state.cards[open[1]];
  return { ...state, turns: state.turns + 1, open: match ? [] : open, matched: match ? [...state.matched,...open] : state.matched };
}
