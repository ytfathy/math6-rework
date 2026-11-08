/* Builds questions + step-by-step explanations from the compact list in dsl.js */
(function () {
const SRC = { A: ['Final Revision 1', 40], B: ['Final Revision 2', 40], C: ['Final Revision 3', 40], D: ['Final Revision 4', 50], E: ['General Revision 1', 50], F: ['General Revision 2', 50], G: ['W5 Classwork M3 L2', 20], H: ['W6 Classwork LCM & GCF', 10], I: ['W6 HW Learning Check 2', 10] };
const MI = '−';
const g = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
class R { constructor(n, d = 1) { if (d < 0) { n = -n; d = -d; } const k = g(n, d) || 1; this.n = n / k; this.d = d / k; }
  add(o) { return new R(this.n * o.d + o.n * this.d, this.d * o.d); } sub(o) { return new R(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new R(this.n * o.n, this.d * o.d); } div(o) { return new R(this.n * o.d, this.d * o.n); }
  cmp(o) { return this.n * o.d - o.n * this.d; } abs() { return new R(Math.abs(this.n), this.d); } neg() { return new R(-this.n, this.d); }
  f() { return this.n / this.d; } }
const F = (n, d) => `<span class="fr"><span class="nu">${n}</span><span class="de">${d}</span></span>`;
const M = (w, n, d, neg) => `<span class="mx">${neg ? MI : ''}${w}${F(n, d)}</span>`;
const sgn = s => String(s).replace('-', MI);
const comma = n => n.toLocaleString('en-US');
// decimal strings -> exact rationals
function decR(t) { const [a, b = ''] = t.split('.'); return new R(parseInt(a + b, 10), 10 ** b.length); }
function parseF(s) { s = s.trim(); const neg = s.startsWith('-'); const t = s.replace(/^-/, ''); let v, m;
  if ((m = t.match(/^(\d+) (\d+)\/(\d+)$/))) v = new R(+m[1] * +m[3] + +m[2], +m[3]);
  else if (/^\d+\/\d+$/.test(t)) { const [a, b] = t.split('/'); v = new R(+a, +b); }
  else v = decR(t);
  return neg ? v.neg() : v; }
function H(s) { s = s.trim(); const neg = s.startsWith('-'); const t = s.replace(/^-/, ''); let m;
  if ((m = t.match(/^(\d+) (\d+)\/(\d+)$/))) return M(m[1], m[2], m[3], neg);
  if (/^\d+\/\d+$/.test(t)) { const [a, b] = t.split('/'); return (neg ? MI : '') + F(a, b); }
  return (neg ? MI : '') + t; }
function FH(r, mixed = true) { if (r.d === 1) return sgn(r.n); const neg = r.n < 0, a = r.abs();
  if (mixed && a.cmp(new R(1)) > 0) return M(Math.floor(a.n / a.d), a.n % a.d, a.d, neg);
  return (neg ? MI : '') + F(a.n, a.d); }
const asf = r => F(r.n, r.d);
function improper(s) { const t = s.replace(/^-/, ''); let m;
  if ((m = t.match(/^(\d+) (\d+)\/(\d+)$/))) { const w = +m[1], n = +m[2], d = +m[3]; return [`${H(s)} = ${F(`${w} × ${d} + ${n}`, d)} = ${F(w * d + n, d)}`, new R(w * d + n, d)]; }
  if (/^\d+$/.test(t)) return [`${H(s)} = ${F(t, 1)}`, new R(+t)];
  return [null, parseF(s)]; }
function simp(num, den) { const out = [], fr = new R(num, den), gg = g(num, den);
  if (gg > 1 && den !== 1) { if (fr.d === 1) out.push(`Simplify: ${F(num, den)} = ${num} ÷ ${den} = <b>${fr.n}</b>`); else out.push(`Simplify (divide top and bottom by ${gg}): ${F(num, den)} = ${asf(fr)}`); }
  if (fr.d !== 1 && fr.abs().cmp(new R(1)) > 0) { const a = fr.abs(); out.push(`Write as a mixed number: ${asf(fr)} = <b>${FH(fr)}</b> (${a.n} ÷ ${a.d} = ${Math.floor(a.n / a.d)} remainder ${a.n % a.d})`); }
  else if (fr.d !== 1) out.push(`The answer is <b>${FH(fr)}</b>.`);
  if (fr.d === 1 && gg === 1 && den === 1) out.push(`The answer is <b>${fr.n}</b>.`);
  return out; }
const factors = n => { const r = []; for (let i = 1; i <= n; i++) if (n % i === 0) r.push(i); return r; };
function nlcfg(min, max, step, labels, pts, color) { const c = { min, max, step, labels }; if (pts) c.points = pts.map(p => color ? { v: p, c: color } : { v: p }); return c; }
const dp = s => s.includes('.') ? s.split('.')[1].length : 0;
const pad = (s, p) => p === 0 ? s : (!s.includes('.') ? s + '.' + '0'.repeat(p) : s + '0'.repeat(p - dp(s)));
function fmtR(r) { // exact terminating rational -> plain decimal string (like Decimal.normalize)
  let d = r.d, a2 = 0, a5 = 0; while (d % 2 === 0) { d /= 2; a2++; } while (d % 5 === 0) { d /= 5; a5++; }
  const k = Math.max(a2, a5); const n = Math.abs(r.n) * 2 ** (k - a2) * 5 ** (k - a5);
  let s = String(n).padStart(k + 1, '0'); if (k) s = s.slice(0, -k) + '.' + s.slice(-k);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return (r.n < 0 ? '-' : '') + s; }
const terminating = r => { let d = r.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };

function gen(code, typ, a) {
  const q = { t: 'input' };
  if (typ === 'gcf') { const x = +a[0], y = +a[1], G = g(x, y), fx = factors(x), fy = factors(y);
    const b = arr => arr.map(f => f === G ? `<b>${f}</b>` : f).join(', ');
    Object.assign(q, { l: 'fm', sk: 'F.6 Greatest common factor', p: `What is the <b>greatest common factor</b> of ${x} and ${y}?`, parts: [{ a: G }], hint: 'List all the factors of each number. Which is the biggest one they share?',
      ex: [`Factors of ${x}: ${b(fx)}`, `Factors of ${y}: ${b(fy)}`, `Common factors: ${fx.filter(f => fy.includes(f)).join(', ')}. The greatest is <b>${G}</b>.`] }); }
  else if (typ === 'gcfword') { const [unit, X, Y, text] = a, x = +X, y = +Y, G = g(x, y);
    Object.assign(q, { l: 'fm', sk: 'F.10 GCF and LCM: word problems', p: text, parts: [{ a: G, post: unit }], hint: '"Greatest number of equal groups with nothing left over" means find the greatest common factor.',
      ex: [`Each row must split both ${x} and ${y} evenly, so the number of rows must be a common factor of ${x} and ${y}.`, `Factors of ${x}: ${factors(x).join(', ')}`, `Factors of ${y}: ${factors(y).join(', ')}`, `The greatest common factor is <b>${G}</b>, so she can plant <b>${G} ${unit}</b>.`] }); }
  else if (typ === 'lcm') { const x = +a[0], y = +a[1], l = x * y / g(x, y);
    const mul = n => Array.from({ length: l / n }, (_, i) => n * (i + 1)); const f = arr => arr.map(v => v === l ? `<b>${v}</b>` : v).join(', ') + ', …';
    const ex = [`Multiples of ${x}: ${f(mul(x))}`, `Multiples of ${y}: ${f(mul(y))}`, `The first multiple they share is <b>${l}</b>.`];
    if (g(x, y) === 1) ex.push(`Shortcut: ${x} and ${y} share no common factor except 1, so the LCM is ${x} × ${y} = ${l}.`);
    else if (l === Math.max(x, y)) ex.push(`Shortcut: ${Math.max(x, y)} is already a multiple of ${Math.min(x, y)}, so the LCM is ${Math.max(x, y)}.`);
    Object.assign(q, { l: 'fm', sk: 'F.8 Least common multiple', p: `What is the <b>least common multiple</b> of ${x} and ${y}?`, parts: [{ a: l }], hint: `Count by ${Math.max(x, y)}s. Which one is also a multiple of ${Math.min(x, y)}?`, ex }); }
  else if (typ === 'rec') { const s = a[0], v = parseF(s), r = new R(1).div(v), [step, imp] = improper(s); let ex = [];
    if (/^\d+$/.test(s)) ex = [`Write ${s} as a fraction: ${F(s, 1)}`, `Flip it: ${F(s, 1)} → <b>${asf(r)}</b>`, `Check: ${s} × ${asf(r)} = 1 ✔`];
    else { if (step) ex.push('First change the mixed number to an improper fraction: ' + step); ex.push(`Flip the numerator and denominator: ${asf(imp)} → <b>${FH(r, false)}</b>`); ex.push(`Check: ${asf(imp)} × ${asf(r)} = 1 ✔`); }
    Object.assign(q, { l: 'rd', sk: 'M.2 Reciprocals', p: `What is the reciprocal of ${H(s)}?`, parts: [{ a: r.f(), f: 1, show: FH(r, false) }], hint: 'Write the number as a fraction (change mixed numbers to improper fractions first), then flip it upside down.', ex }); }
  else if (typ === 'div' || typ === 'divword') { let unit, X, Y, text; if (typ === 'divword') [unit, X, Y, text] = a; else [X, Y] = a;
    const vx = parseF(X), vy = parseF(Y), r = vx.div(vy); const mixed = [X, Y].some(s => /\d+ \d+\//.test(s)), whole = [X, Y].some(s => /^\d+$/.test(s));
    let sk = mixed ? 'M.10 Divide fractions and mixed numbers' : whole ? 'M.3 Divide whole numbers and unit fractions' : 'M.7 Divide fractions'; const ex = [];
    if (typ === 'divword') { sk = 'M.12 Divide fractions and mixed numbers: word problems'; ex.push(`Divide the total by the size of each share: ${H(X)} ÷ ${H(Y)}`); }
    for (const s of [X, Y]) { const [st] = improper(s); if (st) ex.push('Rewrite ' + st); }
    ex.push(`Keep – Change – Flip: ${asf(vx)} ÷ ${asf(vy)} = ${asf(vx)} × ${asf(new R(1).div(vy))}`);
    const num = vx.n * vy.d, den = vx.d * vy.n;
    ex.push(`Multiply: ${F(`${vx.n} × ${vy.d}`, `${vx.d} × ${vy.n}`)} = ${F(num, den)}`); ex.push(...simp(num, den));
    const part = { a: r.f(), show: FH(r) }; if (r.d !== 1) part.f = 1;
    if (typ === 'divword') { part.post = unit; q.p = text + '<br><i style="font-size:.85em;color:var(--muted)">Write your answer as a fraction or as a whole or mixed number.</i>';
      const last = ex[ex.length - 1]; ex[ex.length - 1] = last.endsWith('.') ? last.replace(/\.+$/, '') + ` ${unit}.` : last + ` ${unit}`; }
    else { part.pre = `<span class="eq">${H(X)} ÷ ${H(Y)} =</span>`; q.p = 'Divide.'; }
    Object.assign(q, { l: 'rd', sk, parts: [part], hint: 'Keep the first number, change ÷ to ×, and flip the second number. Change mixed numbers and whole numbers to fractions first.', ex }); }
  else if (typ === 'frop') { const [X, op, Y] = a, vx = parseF(X), vy = parseF(Y); const r = op === '+' ? vx.add(vy) : op === '-' ? vx.sub(vy) : vx.mul(vy);
    const prompt = { '+': 'Add. Write your answer as a fraction or as a whole or mixed number.', '-': 'Subtract.', '×': 'Multiply. Write your answer as a fraction or as a whole or mixed number.' }[op]; const ex = [];
    if (op === '×') { for (const s of [X, Y]) { const [st] = improper(s); if (st) ex.push('Rewrite ' + st); }
      const num = vx.n * vy.n, den = vx.d * vy.d; ex.push(`Multiply tops and bottoms: ${asf(vx)} × ${asf(vy)} = ${F(`${vx.n} × ${vy.n}`, `${vx.d} × ${vy.d}`)} = ${F(num, den)}`); ex.push(...simp(num, den)); }
    else { const mx = X.match(/^(\d+) (\d+)\/(\d+)$/), my = Y.match(/^(\d+) (\d+)\/(\d+)$/);
      if (mx && my && op === '+') { const w = +mx[1] + +my[1], fr = new R(+mx[2], +mx[3]).add(new R(+my[2], +my[3]));
        ex.push(`Add the whole numbers: ${mx[1]} + ${my[1]} = ${w}`, `Add the fractions: ${F(mx[2], mx[3])} + ${F(my[2], my[3])} = ${FH(fr)}`, `${w} + ${FH(fr)} = <b>${FH(r)}</b>`); }
      else { const d = vx.d * vy.d / g(vx.d, vy.d), nx = vx.n * d / vx.d, ny = vy.n * d / vy.d;
        ex.push(vx.d !== vy.d ? `Use the common denominator ${d}: ${asf(vx)} = ${F(nx, d)}, ${asf(vy)} = ${F(ny, d)}` : `The denominators are already the same (${d}).`);
        const sym = op === '+' ? '+' : MI, res = op === '+' ? nx + ny : nx - ny; ex.push(`${F(nx, d)} ${sym} ${F(ny, d)} = ${F(res, d)}`); ex.push(...simp(res, d)); } }
    const part = { pre: `<span class="eq">${H(X)} ${op === '-' ? '−' : op} ${H(Y)} =</span>`, a: r.f(), show: FH(r) }; if (r.d !== 1) part.f = 1;
    Object.assign(q, { l: 'fo', sk: 'N.1 Add, subtract, multiply, or divide two fractions', p: prompt, parts: [part],
      hint: { '×': 'Change mixed numbers to improper fractions, then multiply the tops and the bottoms.', '+': 'Add the whole numbers, then add the fractions.', '-': 'Make the denominators the same, then subtract the numerators.' }[op], ex }); }
  else if (typ === 'f2d') { const [n, d] = a[0].split('/'), v = new R(+n, +d);
    Object.assign(q, { l: 'fo', sk: 'G.7 Convert between decimals and fractions', p: `Write ${H(a[0])} as a decimal number.`, parts: [{ a: v.f(), dec: 1 }], hint: 'The denominator 10 means tenths.', ex: [`${H(a[0])} means ${n} tenths.`, `${n} tenths is written <b>${fmtR(v)}</b>.`] }); }
  else if (typ === 'd2f') { const s = a[0], p = dp(s), n = parseInt(s.replace('0.', '').replace('.', ''), 10), d = 10 ** p, fr = new R(n, d);
    const ex = [`${s} has ${p} decimal places, so it means ${n} ${p === 2 ? 'hundredths' : p === 1 ? 'tenths' : 'thousandths'}: ${F(n, d)}`];
    ex.push(fr.d !== d ? `Simplify: ${F(n, d)} = <b>${asf(fr)}</b>` : `${n} and ${d} share no common factor, so the answer is <b>${F(n, d)}</b>.`);
    Object.assign(q, { l: 'fo', sk: 'G.7 Convert between decimals and fractions', p: `Write ${s} as a fraction.`, parts: [{ a: fr.f(), f: 1, show: asf(fr) }], hint: 'Read the decimal aloud using place value (tenths, hundredths…), then write it as a fraction.', ex }); }
  else if (typ === 'dec' || typ === 'word') { let x, op, y, unit = null, text; if (typ === 'dec') [x, op, y] = a; else [unit, op, x, y, text] = a;
    const p = Math.max(dp(x), dp(y)), r = op === '+' ? decR(x).add(decR(y)) : decR(x).sub(decR(y)), rs = fmtR(r), sym = op === '+' ? '+' : MI, ex = [];
    if (typ === 'word') ex.push(op === '+' ? 'This is an <b>addition</b> problem: we combine the two amounts.' : 'This is a <b>subtraction</b> problem: we take one amount away from (or compare it with) the other.');
    ex.push(pad(x, p) !== x || pad(y, p) !== y ? `Line up the decimal points and add zeros so both numbers have ${p} decimal places: ${pad(x, p)} ${sym} ${pad(y, p)}` : `Line up the decimal points: ${x} ${sym} ${y}`);
    ex.push(`${pad(x, p)} ${sym} ${pad(y, p)} = <b>${rs}</b>` + (unit ? ` ${unit}` : ''));
    const part = { a: r.f() }; if (unit) part.post = unit; else part.pre = `<span class="eq">${x} ${sym} ${y} =</span>`;
    Object.assign(q, { l: 'de', sk: unit ? 'H.2 Add and subtract decimals: word problems' : 'H.1 Add and subtract decimal numbers', p: unit ? text : (op === '+' ? 'Add.' : 'Subtract.'), parts: [part],
      hint: (unit ? 'Decide whether to add (in all, total, together) or subtract (left, how much more, shorter). ' : '') + 'Line up the decimal points and fill empty places with zeros.', ex }); }
  else if (typ === 'opp' || typ === 'opp2' || typ === 'ropp') { const s = a[0], v = parseF(s), o = v.neg(), side = v.n > 0 ? 'right' : 'left';
    if (typ === 'opp2') Object.assign(q, { l: 'ab', sk: 'O.4 Understanding opposite integers', p: 'Answer both parts.',
      parts: [{ lab: `What number is the opposite of ${sgn(s)}?`, a: o.f() }, { lab: `What number is the opposite of the opposite of ${sgn(s)}?`, a: v.f() }],
      hint: 'The opposite is the same distance from 0 on the other side. The opposite of the opposite brings you back.',
      ex: [`The opposite of ${sgn(s)} is <b>${FH(o)}</b> (same distance from 0, other side).`, `The opposite of ${FH(o)} is ${sgn(s)}, so the opposite of the opposite of ${sgn(s)} is <b>${sgn(s)}</b>.`] });
    else { const ex = v.n === 0 ? ['0 is neither positive nor negative.', 'The opposite of 0 is <b>0</b>.'] : [`${H(s)} is ${H(s.replace(/^-/, ''))} units to the ${side} of 0.`, `Its opposite is the same distance on the other side: <b>${s.startsWith('-') ? H(s.slice(1)) : MI + H(s)}</b>.`];
      const show = s.startsWith('-') ? H(s.slice(1)) : (v.n === 0 ? H(s) : MI + H(s)); const part = { a: o.f(), show }; if (s.includes('/')) part.f = 1;
      Object.assign(q, { l: 'ab', sk: typ === 'opp' ? 'O.4 Understanding opposite integers' : 'Q.7 Opposites of rational numbers', p: typ === 'opp' ? `What number is the opposite of ${sgn(s)}?` : `What is the <b>opposite</b> of ${H(s)}?`, parts: [part], hint: 'The opposite is the same distance from 0 but on the other side. Change the sign.', ex }); } }
  else if (typ === 'absnl' || typ === 'absnl1') { const n = +a[0], mn = a.length > 1 ? +a[1] : 0, mx = a.length > 2 ? +a[2] : 10, st = a.length > 3 ? +a[3] : 1;
    let parts = [{ lab: 'What is its distance from 0?', a: Math.abs(n), post: 'units' }, { lab: `What is the absolute value of ${sgn(n)}?`, a: Math.abs(n) }]; if (typ === 'absnl1') parts = parts.slice(1);
    Object.assign(q, { l: 'ab', sk: 'O.5 Understanding absolute value', p: `This number line shows a point at ${sgn(n)}.`, visNL: nlcfg(mn, mx, st, 'all', [n], '#16b26f'), parts, hint: 'Count the jumps from the point to 0.',
      ex: [`From 0 to ${sgn(n)} the distance is ${Math.abs(n)} units.`, `Absolute value means distance from 0, so |${sgn(n)}| = <b>${Math.abs(n)}</b>.`] }); }
  else if (typ === 'absch') { const [mn, mx, st] = a.slice(0, 3).map(Number), pts = a[3].split(',').map(Number), which = a[4];
    const ans = pts.reduce((b, p) => which === 'larger' ? (Math.abs(p) > Math.abs(b) ? p : b) : (Math.abs(p) < Math.abs(b) ? p : b));
    Object.assign(q, { t: 'choice', l: 'ab', sk: 'O.5 Understanding absolute value', p: `Look at the points on the number line.<br>Which number has a <b>${which} absolute value</b>?`, visNL: nlcfg(mn, mx, st, 'all', pts),
      opts: pts.map(p => ({ h: sgn(p), v: String(p) })), a: String(ans), hint: which === 'larger' ? 'Absolute value is the distance from 0. Which point is farther from 0?' : 'Absolute value is the distance from 0. Which point is closer to 0?',
      ex: [pts.map(p => `|${sgn(p)}| = ${Math.abs(p)}`).join(' and '), `${sgn(ans)} is ${which === 'larger' ? 'farther from' : 'closer to'} 0, so <b>${sgn(ans)}</b> has the ${which} absolute value.`] }); }
  else if (typ === 'absof' || typ === 'absbar') { const n = +a[0];
    Object.assign(q, { l: 'ab', sk: 'O.6 Absolute value', p: typ === 'absof' ? `What is the absolute value of ${sgn(n)}?` : `What is |${sgn(n)}|?`, parts: [{ a: Math.abs(n) }], hint: `How far is ${sgn(n)} from 0?`,
      ex: ['Absolute value is the distance from 0, and distance is never negative.', `${sgn(n)} is ${Math.abs(n)} units from 0, so |${sgn(n)}| = <b>${Math.abs(n)}</b>.`] }); }
  else if (typ === 'absw') { const [text, heads, r1, r2, question, opts, which] = a; const [h1, h2] = heads.split(';'); let [n1, d1, v1] = r1.split(';'); let [n2, d2, v2] = r2.split(';'); const [o1, o2] = opts.split(';'); v1 = +v1; v2 = +v2;
    const pick1 = which === 'max' ? Math.abs(v1) > Math.abs(v2) : Math.abs(v1) < Math.abs(v2), chosen = pick1 ? o1 : o2;
    Object.assign(q, { t: 'choice', l: 'ab', sk: 'O.10 Absolute value and integers: word problems', p: text,
      visHTML: `<table class="t"><tr><th>${h1}</th><th>${h2}</th></tr><tr><td>${n1}</td><td>${d1}</td></tr><tr><td>${n2}</td><td>${d2}</td></tr></table><div class="prompt" style="font-size:20px">${question}</div>`,
      opts: [{ h: o1, v: 'a' }, { h: o2, v: 'b' }], a: pick1 ? 'a' : 'b', hint: 'Compare the absolute values (distance from 0). The sign only tells the direction.',
      ex: ['The size of each amount (its distance from zero) is its absolute value.', `${n1}: |${sgn(v1)}| = ${Math.abs(v1)}. ${n2}: |${sgn(v2)}| = ${Math.abs(v2)}.`,
        `${which === 'max' ? Math.max(Math.abs(v1), Math.abs(v2)) : Math.min(Math.abs(v1), Math.abs(v2))} is the ${which === 'max' ? 'greater' : 'smaller'} absolute value, so the answer is <b>${chosen}</b>.`] }); }
  else if (typ === 'sign' || typ === 'sign2') { const [L, Rr] = a;
    const val = s => { const m = s.match(/^abs\((.+)\)$/); return m ? parseF(m[1]).abs() : parseF(s); }, disp = s => { const m = s.match(/^abs\((.+)\)$/); return m ? `|${H(m[1])}|` : H(s); };
    const vl = val(L), vr = val(Rr), c = vl.cmp(vr), isint = s => /^-?\d+$/.test(s), hasabs = L.includes('abs') || Rr.includes('abs'); let ans, sk, prompt;
    if (typ === 'sign2') { ans = c === 0 ? '=' : '≠'; sk = 'Q.2 Rational numbers: equal or not equal'; prompt = 'Which sign makes the statement true?'; }
    else { ans = c > 0 ? '>' : c < 0 ? '<' : '='; sk = hasabs ? 'O.9 Integer inequalities with absolute values' : (isint(L) && isint(Rr) ? 'O.7 Compare integers' : 'Q.4 Compare rational numbers'); prompt = sk.startsWith('O.7') ? 'Compare the numbers. Pick the correct sign.' : 'Which sign makes the statement true?'; }
    const ex = [];
    for (const [s, v] of [[L, vl], [Rr, vr]]) { if (s.includes('abs')) ex.push(`${disp(s)} = ${FH(v)} (absolute value is distance from 0)`); else if (s.includes('/')) ex.push(`${disp(s)} = ${sgn(fmtR(v))} as a decimal`); }
    if (typ === 'sign2') ex.push(ans === '=' ? `Zeros at the end of a decimal do not change its value, so ${disp(L)} = ${disp(Rr)}.` : `Line up the place values: ${disp(L)} and ${disp(Rr)} have different digits, so ${disp(L)} ≠ ${disp(Rr)}.`);
    else { let A = L.includes('abs') || L.includes('/') ? FH(vl) : disp(L), B = Rr.includes('abs') || Rr.includes('/') ? FH(vr) : disp(Rr);
      if (L.includes('/') || Rr.includes('/')) { if (L.includes('/')) A = sgn(fmtR(vl)); if (Rr.includes('/')) B = sgn(fmtR(vr)); }
      const [big, small] = c > 0 ? [A, B] : [B, A];
      if (c === 0) ex.push('Both sides have the same value, so they are equal.');
      else if ((vl.n >= 0) !== (vr.n >= 0) || vl.n === 0 || vr.n === 0) ex.push((vl.n === 0 || vr.n === 0) ? `${big} is to the right of ${small} on the number line, so it is greater.` : `A positive number (or zero) is always greater than a negative number, so ${big} is greater than ${small}.`);
      else if (vl.n < 0 && vr.n < 0) ex.push(`Both numbers are negative. ${small} is farther from 0 on the left, so it is smaller; ${big} is greater.`);
      else ex.push(`${big} is greater than ${small}.`);
      ex.push(`So <b>${disp(L)} ${{ '>': '&gt;', '<': '&lt;', '=': '=' }[ans]} ${disp(Rr)}</b>`); }
    Object.assign(q, { t: 'sign', l: 'co', sk, p: prompt, L: disp(L), R: disp(Rr), a: ans, hint: typ === 'sign2' ? 'Equal means the same value, even if written differently (like extra zeros at the end).' : 'Find the value of each side first. On a number line, the number farther right is greater.', ex });
    if (typ === 'sign2') q.signs = ['=', '≠']; }
  else if (typ === 'order' || typ === 'ordernl') { const dir = a[0], items = a[1].split(',').map(Number), srt = items.slice().sort((x, y) => dir === 'down' ? y - x : x - y), names = items.map(sgn);
    const lst = names.slice(0, -1).join(', ') + (names.length > 2 ? ', and ' : ' and ') + names[names.length - 1];
    Object.assign(q, { t: 'order', l: 'co', sk: 'O.8 Put integers in order', p: `Put ${lst} in order from <b>least</b> to <b>greatest</b>.` + (typ === 'ordernl' ? ' You can use the number line to help.' : ''), dir, tiles: items.map(i => ({ h: sgn(i), v: i })),
      hint: 'Numbers farther left on the number line are smaller. The most negative number is the least.', ex: [`On the number line, from left to right: ${srt.map(sgn).join(', ')}`, `Order: <b>${srt.map(sgn).join(', ')}</b>`], exvNL: nlcfg(-10, 10, 1, 'even', srt) });
    if (typ === 'ordernl') q.visNL = nlcfg(-10, 10, 1, 'even'); }
  else if (typ === 'graph' || typ === 'vgraph') { const [mn, mx, st] = a.slice(0, 3).map(Number), labs = a[3].split(',').map(Number), pts = a[4].split(',').map(Number), names = pts.map(sgn);
    const line = nlcfg(mn, mx, st, labs); if (typ === 'vgraph') line.vertical = true; const ls = labs.slice().sort((x, y) => x - y);
    const ex = [`Find how much each tick mark is worth: from ${sgn(ls[0])} to ${sgn(ls[1])} is ${ls[1] - ls[0]} with ${Math.floor((ls[1] - ls[0]) / st)} jumps, so each tick is worth <b>${st}</b>.`];
    const ref = mn <= 0 && 0 <= mx ? 0 : labs[0];
    for (const p of pts) { const k = Math.floor((p - ref) / st); const dirw = typ === 'vgraph' ? (k > 0 ? 'above' : 'below') : (k > 0 ? 'to the right of' : 'to the left of');
      ex.push(k ? `${sgn(p)} is ${Math.abs(k)} tick${Math.abs(k) !== 1 ? 's' : ''} ${dirw} ${sgn(ref)}` : `${sgn(p)} is at ${sgn(ref)}`); }
    Object.assign(q, { t: 'graph', l: 'nl', sk: 'O.3 Graph integers on horizontal and vertical number lines', p: `Graph ${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]} on the number line.`, line, a: pts, hint: `Figure out what each tick mark is worth first (hint: it is ${st}).`, ex }); }
  else if (typ === 'gopp') { const [n, mn, mx, st] = a.map(Number);
    Object.assign(q, { t: 'graph', l: 'ab', sk: 'O.4 Understanding opposite integers', p: `Graph ${sgn(n)} on the number line.`, line: nlcfg(mn, mx, st, 'all'), a: [n], parts: [{ lab: `What number is the opposite of ${sgn(n)}?`, a: -n }],
      hint: 'Find the point first. Its opposite is the same distance from 0 on the other side.', ex: [`${sgn(n)} is ${Math.abs(n)} units to the ${n < 0 ? 'left' : 'right'} of 0, so place the point there.`, `The opposite is ${Math.abs(n)} units on the other side: <b>${sgn(-n)}</b>.`] }); }
  else if (typ === 'nlpick') { const s = a[0], opts = a[1].split(',').map(Number), fr = parseF(s), v = fr.f(); const best = opts.reduce((b, o) => Math.abs(o - v) < Math.abs(b - v) ? o : b);
    const lo = Math.floor(v), hi = Math.ceil(v), ex = [];
    if (s.includes('/')) ex.push([2, 4, 5, 8, 10].includes(fr.d) ? `${H(s)} = ${sgn(fmtR(fr))} as a decimal.` : `${H(s)} = ${sgn(String(Math.round(v * 1000) / 1000))} as a decimal (about).`);
    ex.push(`${H(s)} is ${v > 0 ? 'positive, so it is to the right of 0' : 'negative, so it is to the left of 0'}.`);
    if (lo !== hi) ex.push(`It lies between ${sgn(lo)} and ${sgn(hi)}, ${Math.abs((v - lo) - (hi - v)) > 1e-9 ? 'closer to ' + sgn(v - lo < hi - v ? lo : hi) : 'right in the middle'}.`);
    Object.assign(q, { t: 'nlpick', l: 'nl', sk: 'Q.1 Rational numbers on number lines', p: `Which shows ${H(s)} graphed on the number line?`, pts: opts, a: best,
      c: { A: '#f26a1b', B: '#4caf1a', C: '#f25c8f', D: '#a066e8', E: '#2f8cff', F: '#1aa3e8' }[code[0]] || '#2f8cff', hint: 'Is it positive or negative? Which two whole numbers is it between?', ex }); }
  else if (typ === 'nlmiss') { const [mn, mx, st] = a.slice(0, 3).map(Number), blanks = a[3].split(',').map(Number), seq = []; for (let v = mn; v <= mx; v += st) seq.push(v);
    Object.assign(q, { t: 'nlmiss', l: 'nl', sk: 'O.2 Integers on number lines', p: 'Type the missing numbers.', line: { min: mn, max: mx, step: st }, blanks, hint: 'Look at two labels next to each other to find the jump between tick marks.',
      ex: [`Neighbouring labels differ by ${st}, so each tick mark is ${st} more than the one to its left.`, `Counting by ${st}s: ` + seq.map(v => blanks.includes(v) ? `<b>${sgn(v)}</b>` : sgn(v)).join(', ')] }); }
  else if (typ === 'cmpword') { const [text, question, p1, p2, which] = a, [n1, s1] = p1.split(';'), [n2, s2] = p2.split(';'), v1 = parseF(s1), v2 = parseF(s2);
    const ans = (v1.cmp(v2) > 0) === (which === 'max') ? 'a' : 'b';
    Object.assign(q, { t: 'choice', l: 'co', sk: 'Q.6 Compare and order rational numbers: word problems', p: text.replace(/(\d+) (\d+)\/(\d+)/g, (m, w, n, d) => M(w, n, d)) + `<div class="prompt" style="font-size:20px">${question}</div>`,
      opts: [{ h: n1, v: 'a' }, { h: n2, v: 'b' }], a: ans, hint: 'Write both numbers as decimals, then compare.',
      ex: [`${n1}: ${H(s1)} = ${fmtR(v1)}`, `${n2}: ${H(s2)} = ${fmtR(v2)}`, `${v1.cmp(v2) >= 0 ? fmtR(v1) : fmtR(v2)} is greater, so <b>${ans === 'a' ? n1 : n2}</b> held the handstand longer.`] }); }
  else if (typ === 'intchoice') { const [text, question, vs] = a, v = +vs, ans = v > 0 ? 'above' : v < 0 ? 'below' : 'at';
    Object.assign(q, { t: 'choice', l: 'nl', sk: 'O.1 Understanding integers', p: text + `<div class="prompt" style="font-size:20px">${question}</div>`,
      opts: [{ h: 'below sea level', v: 'below' }, { h: 'at sea level', v: 'at' }, { h: 'above sea level', v: 'above' }], a: ans, hint: 'Sea level is 0. Positive elevations are above it, negative ones below it.',
      ex: ['Sea level has elevation 0.', `${comma(v)} feet is a positive number (greater than 0).`, 'So Mount Hood is <b>above sea level</b>.'] }); }
  else if (typ === 'mul' || typ === 'mulv' || typ === 'mulch') { const x = +a[0], y = +a[1], r = x * y;
    const tz = n => { let k = 0; while (n % 10 === 0 && n) { n /= 10; k++; } return [n, k]; }; const [cx, kx] = tz(x), [cy, ky] = tz(y), K = kx + ky, ex = [];
    if (K) ex.push(`Set aside the zeros at the end: ${comma(x)} × ${comma(y)} → ${comma(cx)} × ${comma(cy)}, with ${K} zero${K > 1 ? 's' : ''} to put back.`);
    const [bx, by] = (cy >= 10 || cx < 10) ? [cx, cy] : [cy, cx], core = cx * cy;
    if (by >= 10) { const digs = String(by).split('').reverse().map((dg, i) => +dg * 10 ** i).filter(v => v).reverse();
      ex.push(`Break ${comma(by)} into place values: ` + digs.map(comma).join(' + '));
      ex.push(digs.map(dg => `${comma(bx)} × ${comma(dg)}`).join(' + ') + ' = ' + digs.map(dg => comma(bx * dg)).join(' + ') + ` = ${comma(core)}`); }
    else ex.push(`${comma(cx)} × ${comma(cy)} = ${comma(core)}`);
    ex.push(K ? `Put back the ${K} zero${K > 1 ? 's' : ''}: <b>${comma(r)}</b>` : `So ${comma(x)} × ${comma(y)} = <b>${comma(r)}</b>`);
    const sk = K ? 'B.3 Multiply numbers ending in zeros' : 'B.1 Multiply whole numbers', hint = K ? 'Multiply the non-zero parts first, then put the zeros back on the end.' : 'Break the second number into tens and ones, multiply each part, then add.';
    if (typ === 'mulch') Object.assign(q, { t: 'choice', l: 'mw', sk, p: 'Multiply:', visHTML: `<div class="vmul"><div>${comma(x)}</div><div>× ${comma(y)}</div><div class="vq">?</div></div>`, opts: a[2].split(',').map(o => ({ h: comma(+o), v: o })), a: String(r), hint, ex });
    else if (typ === 'mulv') Object.assign(q, { l: 'mw', sk, p: 'Multiply:', visHTML: `<div class="vmul"><div>${comma(x)}</div><div>× ${comma(y)}</div></div>`, parts: [{ a: r, show: comma(r) }], hint, ex });
    else Object.assign(q, { l: 'mw', sk, p: 'Multiply:', parts: [{ pre: `<span class="eq">${comma(x)} × ${comma(y)} =</span>`, a: r, show: comma(r) }], hint, ex }); }
  else throw new Error('unknown type ' + typ);
  return q;
}

window.buildQuestions = function (dsl) {
  const out = [];
  dsl.split('\n').forEach(line => { line = line.trim(); if (!line || line[0] === '#') return;
    const f = line.split('|'), code = f[0], q = gen(code, f[1], f.slice(2)), s = SRC[code[0]];
    q.src = s[0]; q.n = +code.slice(1); q.of = s[1]; q.id = code; out.push(q); });
  return out;
};
})();
