/* Core helpers shared by question data and the app: fractions, number lines, answer parsing. */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const F = (n, d) => `<span class="fr"><span class="nu">${n}</span><span class="de">${d}</span></span>`;
const M = (w, n, d, neg) => `<span class="mx">${neg ? '−' : ''}${w}${F(n, d)}</span>`;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = v => String(v).replace('-', '−');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stripTags = h => String(h).replace(/<span class="nu">([^<]*)<\/span><span class="de">([^<]*)<\/span>/g, ' $1/$2').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* Student answers: 12, -5, 3.75, 3/4, 2 3/4, -1 1/2 (commas and the − sign are accepted) */
function parseNum(raw) {
  const s = String(raw).trim().replace(/[−–—]/g, '-').replace(/,/g, '').replace(/\s+/g, ' ');
  let m;
  if ((m = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/))) { const d = +m[4]; if (!d) return null; return { v: (+m[2] + +m[3] / d) * (m[1] ? -1 : 1), frac: true, n: +m[3], d, w: +m[2], neg: !!m[1] }; }
  if ((m = s.match(/^(-?)(\d+)\/(\d+)$/))) { const d = +m[3]; if (!d) return null; return { v: +m[2] / d * (m[1] ? -1 : 1), frac: true, n: +m[2], d, neg: !!m[1] }; }
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return { v: parseFloat(s), frac: false };
  return null;
}
function prettyParsed(p) {
  if (!p) return '';
  if (!p.frac) return fmt(p.v);
  if (p.w !== undefined) return M(p.w, p.n, p.d, p.neg);
  return (p.neg ? '−' : '') + F(p.n, p.d);
}

/* Horizontal number line (SVG). o: {min,max,step,labels:'all'|'even'|[...], points:[{v,c}], interactive, id} */
function NL(o) {
  if (o.vertical) return NLV(o);
  const w = o.w || 660, h = 72, pad = 40, { min, max, step } = o;
  const X = v => pad + (v - min) / (max - min) * (w - 2 * pad);
  const n = Math.round((max - min) / step);
  const lab = v => o.labels === 'all' ? true : o.labels === 'even' ? v % 2 === 0 : (o.labels || []).includes(v);
  let s = `<svg class="nl ${o.interactive ? 'inter' : ''}" ${o.id ? `id="${o.id}"` : ''} viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Number line from ${min} to ${max}">`;
  s += `<line class="ax" x1="10" y1="26" x2="${w - 10}" y2="26"/><polyline class="ax" points="20,17 10,26 20,35"/><polyline class="ax" points="${w - 20},17 ${w - 10},26 ${w - 20},35"/>`;
  for (let i = 0; i <= n; i++) {
    const v = +(min + i * step).toFixed(6), x = X(v);
    s += `<line class="tk" x1="${x}" y1="17" x2="${x}" y2="35"/>`;
    if (lab(v)) s += `<text x="${x}" y="60">${v}</text>`;
    if (o.interactive) { const sp = Math.max(28, (w - 2 * pad) / n); s += `<g class="hit" data-v="${v}" tabindex="0" role="button" aria-label="Tick mark ${i + 1} of ${n + 1}"><rect x="${x - sp / 2}" y="0" width="${sp}" height="72" fill="transparent"/><circle class="ghost" cx="${x}" cy="26" r="9"/></g>`; }
  }
  s += `<g class="pts">${(o.points || []).map((p, i) => `<circle class="pt" style="animation-delay:${i * .12}s" cx="${X(p.v)}" cy="26" r="9" fill="${p.c || '#1d4fd8'}"/>`).join('')}</g></svg>`;
  return s;
}
function nlX(o, v) { const w = o.w || 660, pad = 40; return pad + (v - o.min) / (o.max - o.min) * (w - 2 * pad); }
/* Vertical number line (top = max) */
function NLV(o) {
  const w = 150, h = 460, pad = 30, { min, max, step } = o, x0 = 90;
  const Y = v => pad + (max - v) / (max - min) * (h - 2 * pad);
  const n = Math.round((max - min) / step);
  const lab = v => o.labels === 'all' ? true : o.labels === 'even' ? v % 2 === 0 : (o.labels || []).includes(v);
  let s = `<svg class="nl vert ${o.interactive ? 'inter' : ''}" ${o.id ? `id="${o.id}"` : ''} viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vertical number line from ${min} to ${max}">`;
  s += `<line class="ax" x1="${x0}" y1="8" x2="${x0}" y2="${h - 8}"/><polyline class="ax" points="${x0 - 9},18 ${x0},8 ${x0 + 9},18"/><polyline class="ax" points="${x0 - 9},${h - 18} ${x0},${h - 8} ${x0 + 9},${h - 18}"/>`;
  for (let i = 0; i <= n; i++) {
    const v = +(min + i * step).toFixed(6), y = Y(v);
    s += `<line class="tk" x1="${x0 - 9}" y1="${y}" x2="${x0 + 9}" y2="${y}"/>`;
    if (lab(v)) s += `<text x="${x0 - 30}" y="${y + 6}">${v}</text>`;
    if (o.interactive) s += `<g class="hit" data-v="${v}" tabindex="0" role="button" aria-label="Tick mark ${n + 1 - i} of ${n + 1} from the bottom"><rect x="${x0 - 60}" y="${y - (h - 2 * pad) / n / 2}" width="110" height="${(h - 2 * pad) / n}" fill="transparent"/><circle class="ghost" cx="${x0}" cy="${y}" r="9"/></g>`;
  }
  s += `<g class="pts">${(o.points || []).map(p => `<circle class="pt" cx="${x0}" cy="${Y(p.v)}" r="9" fill="${p.c || '#1d4fd8'}"/>`).join('')}</g></svg>`;
  return s;
}
function nlPos(o, v) { if (!o.vertical) return { x: nlX(o, v), y: 26 }; const h = 460, pad = 30; return { x: 90, y: pad + (o.max - v) / (o.max - o.min) * (h - 2 * pad) }; }
const wrapNL = c => `<div class="nlwrap" ${c && c.vertical ? 'style="max-width:200px"' : ''}>${NL(c)}</div>`;
