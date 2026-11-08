/* Grade 6 Math Quest — International Education Egypt
   Screens: welcome → hub (units) → unit (lessons) → quiz → results; plus student report. */
(function () {
'use strict';

/* ================= UNITS (app grouping) → LESSONS (skill codes printed on the source sheets) ================= */
const UNITS = [
  { id: 'mw', name: 'Multiplying Whole Numbers', icon: '✖️', color: '#8e24aa' },
  { id: 'fm', name: 'Factors & Multiples', icon: '🧩', color: '#e53935' },
  { id: 'de', name: 'Decimals: Add & Subtract', icon: '🔢', color: '#43a047' },
  { id: 'fo', name: 'Fraction Operations & Conversions', icon: '🍕', color: '#fb8c00' },
  { id: 'rd', name: 'Reciprocals & Dividing Fractions', icon: '🔄', color: '#00acc1' },
  { id: 'nl', name: 'Integers & Number Lines', icon: '📏', color: '#1e88e5' },
  { id: 'ab', name: 'Opposites & Absolute Value', icon: '🪞', color: '#3949ab' },
  { id: 'co', name: 'Compare & Order Numbers', icon: '⚖️', color: '#d81b60' },
];
const unitOf = id => UNITS.find(u => u.id === id);

/* ================= LOAD + VALIDATE QUESTION DATA ================= */
const SRC_FILE = { 'Final Revision 6': 'Final_Revision_6.docx' };
const raw = [];
(window.Q_FR6 || []).forEach(q => { q.id = 'R' + q.n; q.src = 'Final Revision 6'; q.of = 50; raw.push(q); });
try { raw.push(...window.buildQuestions(window.DSL)); } catch (e) { console.error('Question generator failed', e); }
const VALID_T = ['input', 'choice', 'sign', 'order', 'nlpick', 'graph', 'nlmiss'];
function validate(q) {
  const errs = [];
  if (!q.id) errs.push('missing id');
  if (!unitOf(q.l)) errs.push('unknown unit ' + q.l);
  if (!q.sk || !/^[A-Z]\.\d+ /.test(q.sk)) errs.push('missing skill code');
  if (!VALID_T.includes(q.t)) errs.push('bad type ' + q.t);
  if (!q.p) errs.push('missing prompt');
  if (!Array.isArray(q.ex) || !q.ex.length) errs.push('missing explanation');
  if (q.t === 'input' && !(q.parts && q.parts.length && q.parts.every(p => typeof p.a === 'number' && isFinite(p.a)))) errs.push('bad answer parts');
  if (q.t === 'choice' && !(q.opts && q.opts.some(o => o.v === q.a))) errs.push('answer not among options');
  if (q.t === 'nlpick' && !(q.pts && q.pts.includes(q.a))) errs.push('answer not among number lines');
  if (q.t === 'sign' && !(q.signs || ['>', '<', '=']).includes(q.a)) errs.push('bad sign answer');
  if (q.t === 'order' && !(q.tiles && q.tiles.length > 1 && ['up', 'down'].includes(q.dir))) errs.push('bad tiles');
  if (q.t === 'graph' && !(q.line && q.a && q.a.length && q.a.every(v => v >= q.line.min && v <= q.line.max && Number.isInteger(Math.round((v - q.line.min) / q.line.step * 1e6) / 1e6)))) errs.push('graph point off the line');
  if (q.t === 'nlmiss' && !(q.line && q.blanks && q.blanks.length)) errs.push('bad blanks');
  return errs;
}
const INVALID = [];
const Q = raw.filter(q => { const e = validate(q); if (e.length) { INVALID.push({ id: q.id, errs: e }); return false; } return true; });
const TR = window.TRACE || {};
Q.forEach(q => {
  const t = TR[q.id] || {};
  q.file = t.file || SRC_FILE[q.src] || q.src; q.page = t.page; q.pages = t.pages;
  q.code = q.sk.split(' ')[0]; q.skName = q.sk.slice(q.code.length + 1);
});
const byId = Object.fromEntries(Q.map(q => [q.id, q]));
const skillSort = (a, b) => { const [la, na] = a.split('.'), [lb, nb] = b.split('.'); return la === lb ? +na - +nb : la < lb ? -1 : 1; };
function lessonsOf(uid) {
  const m = new Map();
  Q.filter(q => q.l === uid).forEach(q => { if (!m.has(q.sk)) m.set(q.sk, []); m.get(q.sk).push(q); });
  return [...m.entries()].sort((a, b) => skillSort(a[0].split(' ')[0], b[0].split(' ')[0])).map(([sk, qs]) => ({ sk, code: sk.split(' ')[0], name: sk.slice(sk.indexOf(' ') + 1), qs }));
}
window.__APP__ = { Q, INVALID, UNITS, lessonsOf };

/* ================= PERSISTENCE (this device only) ================= */
const KEY = 'iee-g6-mathquest-v2';
let canSave = true;
function blank() { return { name: '', xp: 0, rec: {}, sessions: [], badges: {}, best: {}, created: Date.now() }; }
let ST = blank();
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') ST = Object.assign(blank(), s); } catch (e) { canSave = false; }
function save() { if (!canSave) return; try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) { canSave = false; } }

/* ================= STATS ================= */
const pct = (a, b) => b ? Math.round(a / b * 100) : null;
function statsFor(qs) {
  let attempted = 0, correctLast = 0, tries = 0, rightTries = 0;
  qs.forEach(q => { const r = ST.rec[q.id]; if (r) { attempted++; tries += r.a; rightTries += r.c; if (r.last) correctLast++; } });
  const completion = pct(attempted, qs.length), accuracy = pct(rightTries, tries);
  const stars = attempted === qs.length && accuracy !== null ? (accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0) : 0;
  return { total: qs.length, attempted, correctLast, tries, rightTries, completion, accuracy, stars, mistakes: qs.filter(q => ST.rec[q.id] && !ST.rec[q.id].last).length };
}
const accTxt = a => a === null ? 'Not attempted' : a + '%';
function starStr(k) { return [1, 2, 3].map(i => `<span class="${i <= k ? 'on' : 'off'}" aria-hidden="true">★</span>`).join('') + `<span class="sr">${k} of 3 stars</span>`; }
function ring(p, color, size = 56) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, v = p || 0;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="#e8ecf8" stroke-width="7" fill="none"/><circle class="ringv" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v / 100)}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size / 4.2}" font-weight="800" fill="#0b1f6b">${v}%</text></svg>`;
}

/* ================= BADGES ================= */
const BADGES = [
  { id: 'first', icon: '🌱', name: 'First Step', d: 'Answer your first question' },
  { id: 'streak5', icon: '🔥', name: 'On Fire', d: '5 correct answers in a row' },
  { id: 'streak10', icon: '☄️', name: 'Unstoppable', d: '10 correct answers in a row' },
  { id: 'q50', icon: '📘', name: 'Half Century', d: 'Answer 50 different questions' },
  { id: 'q150', icon: '📚', name: 'Bookworm', d: 'Answer 150 different questions' },
  { id: 'qall', icon: '🏅', name: 'Completionist', d: 'Answer every question in the app' },
  { id: 'perfect', icon: '💯', name: 'Perfect Round', d: 'Finish a round of 10+ questions with 100%' },
  { id: 'explorer', icon: '🧭', name: 'Explorer', d: 'Try at least one question in every unit' },
  { id: 'unit', icon: '🏆', name: 'Unit Champion', d: 'Answer every question in a unit' },
  { id: 'comeback', icon: '💪', name: 'Comeback', d: 'Fix a question you got wrong before' },
];
function award(id) {
  if (ST.badges[id]) return false;
  ST.badges[id] = Date.now(); save();
  const b = BADGES.find(x => x.id === id); toast(`${b.icon} Badge unlocked: <b>${b.name}</b>`); beep('win');
  if (S) S.newBadges.push(id);
  return true;
}
function checkBadges() {
  const n = Object.keys(ST.rec).length;
  if (n >= 1) award('first'); if (n >= 50) award('q50'); if (n >= 150) award('q150'); if (n >= Q.length) award('qall');
  if (UNITS.every(u => Q.some(q => q.l === u.id && ST.rec[q.id]))) award('explorer');
  if (UNITS.some(u => { const s = statsFor(Q.filter(q => q.l === u.id)); return s.attempted === s.total; })) award('unit');
}

/* ================= AUDIO / FX ================= */
let sound = true, actx;
const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function beep(kind) {
  if (!sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime, seq = { ok: [523, 659, 784, 1047], bad: [330, 247], tap: [660], win: [523, 659, 784, 659, 784, 1047] }[kind];
    seq.forEach((f, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = kind === 'bad' ? 'square' : 'triangle'; o.frequency.value = f;
      const st = t + i * (kind === 'tap' ? 0 : .09); g.gain.setValueAtTime(.0001, st); g.gain.exponentialRampToValueAtTime(kind === 'bad' ? .05 : .12, st + .02); g.gain.exponentialRampToValueAtTime(.0001, st + (kind === 'tap' ? .08 : .28));
      o.connect(g).connect(actx.destination); o.start(st); o.stop(st + .3); });
  } catch (e) {}
}
const cv = $('#fx'), cx = cv.getContext('2d'); let parts = [], raf = 0;
function resize() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }
addEventListener('resize', resize); resize();
function confetti(x, y, n = 60, spread = 1) {
  if (reduce()) return;
  const cols = ['#0b1f6b', '#f5b400', '#e53935', '#43a047', '#1e88e5', '#8e24aa', '#fb8c00', '#00acc1'];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = (3 + Math.random() * 7) * spread;
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, r: 4 + Math.random() * 5, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 90 + Math.random() * 40 }); }
  if (!raf) loop();
}
function loop() {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life-- > 0 && p.y < innerHeight + 40);
  parts.forEach(p => { p.vy += .28; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c; cx.globalAlpha = Math.min(1, p.life / 30); cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); cx.restore(); });
  raf = parts.length ? requestAnimationFrame(loop) : 0; if (!raf) cx.clearRect(0, 0, innerWidth, innerHeight);
}
/* Malek, the IEE learning buddy: welcome (voice + lip-sync) before the app, then docked and reacting to real answers. */
const M = window.IEEMalek ? IEEMalek.init({
  appId: 'g6-math-quest',
  appName: { en: 'G6 Math Quest', ar: 'رحلة الرياضيات · الصف السادس' },
  subject: { en: 'fractions, decimals and integers', ar: 'الكسور والأعداد العشرية والأعداد الصحيحة' },
  subjectLabel: { en: 'Math · Grade 6', ar: 'الرياضيات · الصف السادس' },
  lang: 'en',
  assetsBase: 'iee-malek/assets/',
  logoSrc: 'assets/logo.png',
  appRoot: '#app',
  showLanguageSwitch: false, // shortcut: the quest itself is English-only; turn on when the app gets Arabic text
  voiceClips: window.IEE_MALEK_CLIPS,
  welcomeVideos: { en: 'iee-malek/assets/voice/welcome-en.mp4' },
  inactivityMs: 30000
}) : null;
const pick = a => a[Math.floor(Math.random() * a.length)];
let toastT;
function toast(html) { const t = $('#toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3000); }
(function bg() { const sy = ['+', '−', '×', '÷', '½', '¾', '=', '%', '<', '>', '|x|', '7', '3', '0.5', 'π']; let h = '';
  for (let i = 0; i < 18; i++) h += `<span style="left:${Math.random() * 100}%;font-size:${22 + Math.random() * 36}px;animation-duration:${20 + Math.random() * 22}s;animation-delay:${-Math.random() * 40}s">${pick(sy)}</span>`; $('#bg').innerHTML = h; })();

/* ================= MODAL ================= */
function modal(html, onClick) {
  const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="box">${html}</div>`; document.body.appendChild(m);
  const close = () => { m.remove(); document.removeEventListener('keydown', esc); };
  const esc = e => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', esc);
  m.addEventListener('click', e => { if (e.target === m) return close(); const b = e.target.closest('button[data-act]'); if (b) { close(); onClick && onClick(b.dataset.act, b); } });
  setTimeout(() => { const f = m.querySelector('button'); f && f.focus(); }, 30);
  return m;
}

/* ================= LAYOUT ================= */
let S = null; // active session
function header(extra = '') {
  return `<header class="top">
    <button class="brand" onclick="APP.home()" aria-label="International Education Egypt — Home"><img class="logo" src="assets/logo.png" alt="International Education Egypt logo" width="56" height="56"><span class="bt"><b>Grade 6 Math Quest</b><small>International Education Egypt</small></span></button>
    <div class="sp"></div>${extra}
    <span class="pill xp" id="xpPill" title="Experience points">⚡ <b id="xpv">${ST.xp}</b> XP</span>
    ${S && !S.done ? `<span class="pill fire" id="firePill" title="Correct answers in a row">🔥 <b id="stv">${S.streak}</b></span>` : `<button class="pill linkish" onclick="APP.report()">📊 My report</button>`}
    <button class="iconbtn" aria-label="${sound ? 'Mute sounds' : 'Turn sounds on'}" aria-pressed="${!sound}" onclick="APP.toggleSound(this)">${sound ? '🔊' : '🔇'}</button></header>`;
}
function render(html) { M && M.questionClosed(); $('#app').innerHTML = html; window.scrollTo({ top: 0 }); const h = $('#app h1, #app h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }

/* ================= WELCOME ================= */
function welcome() {
  S = null;
  render(`<main class="welcome">
    <div class="wcard">
      <img class="wlogo" src="assets/logo.png" alt="International Education Egypt logo" width="200" height="200">
      <h1>Grade 6 Math Quest</h1>
      <p class="lead">${Q.length} questions from your revision sheets and classwork, in ${UNITS.length} units. Answer, learn from every mistake, earn stars and badges!</p>
      <form id="nameForm" class="nameform"><label for="nm">What's your name?</label>
        <div class="nrow"><input id="nm" class="ans" maxlength="40" autocomplete="off" placeholder="Type your name" value="${esc(ST.name)}"><button class="btn" type="submit">Start ▶</button></div></form>
      ${rulesHTML()}
      ${!canSave ? '<p class="warn">⚠️ This browser is blocking storage, so progress will only last until you close the page.</p>' : ''}
    </div></main>`);
  $('#nameForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#nm').value.trim(); if (!v) { $('#nm').classList.add('no'); $('#nm').focus(); toast('Please type your name first ✏️'); return; } ST.name = v; save(); beep('tap'); hub(); });
}
function rulesHTML() {
  return `<details class="rules"><summary>📏 How scoring works</summary><ul>
    <li><b>Every question counts.</b> You must check an answer before you can move on — no skipping.</li>
    <li><b>Correct answer:</b> +10 XP, plus a streak bonus of +2 for every extra correct answer in a row (up to +10).</li>
    <li><b>Wrong answer:</b> no XP. You see the correct answer and the steps to solve it.</li>
    <li><b>Accuracy</b> = correct answers ÷ answers checked × 100. <b>Completion</b> = questions answered ÷ questions in the round.</li>
    <li><b>Stars</b> (per lesson/unit, once every question is answered): ★★★ 90%+, ★★ 70%+, ★ 50%+.</li>
    <li>Progress is saved on this device only.</li></ul></details>`;
}

/* ================= HUB ================= */
function hub() {
  S = null; if (!ST.name) return welcome();
  const all = statsFor(Q), earned = Object.keys(ST.badges).length;
  let h = header();
  h += `<main><section class="hero"><div class="hl"><p class="hi">Welcome back,</p><h1>${esc(ST.name)} 👋</h1>
      <p>Pick a unit to practise, or take on the mixed challenge.</p>
      <div class="hstats"><span><b>${all.attempted}</b>/${all.total} answered</span><span>Accuracy <b>${accTxt(all.accuracy)}</b></span><span>🏅 <b>${earned}</b>/${BADGES.length} badges</span></div>
      <div class="hbar" role="progressbar" aria-valuenow="${all.completion || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="Overall completion"><i style="width:${all.completion || 0}%"></i></div></div>
      <img class="hlogo" src="assets/logo.png" alt="" width="150" height="150"></section>
    <h2 class="sec">Units</h2><div class="grid">`;
  UNITS.forEach((u, i) => {
    const qs = Q.filter(q => q.l === u.id), s = statsFor(qs), ls = lessonsOf(u.id);
    h += `<button class="ucard" style="--uc:${u.color};animation-delay:${i * .05}s" onclick="APP.unit('${u.id}')" aria-label="Unit ${i + 1}: ${u.name}. ${s.attempted} of ${s.total} answered.">
      <div class="uh"><span class="ui" aria-hidden="true">${u.icon}</span>${ring(s.completion, u.color)}</div>
      <span class="un">Unit ${i + 1}</span><h3>${u.name}</h3>
      <div class="ul">${ls.map(l => `<span>${l.code}</span>`).join('')}</div>
      <div class="meta"><span>${qs.length} questions · ${ls.length} lesson${ls.length > 1 ? 's' : ''}</span><span class="stars">${starStr(s.stars)}</span></div>
      <div class="meta2"><span>Accuracy: <b>${accTxt(s.accuracy)}</b></span>${s.mistakes ? `<span class="mk">${s.mistakes} to fix</span>` : ''}</div></button>`;
  });
  h += `<button class="ucard final" onclick="APP.pickMixed()" style="animation-delay:.45s"><div class="uh"><span class="ui">🏆</span></div><h3>Mixed Challenge</h3><p>Questions from every unit, shuffled. 20, 40 or all ${Q.length}.</p></button>
    <button class="ucard final alt" onclick="APP.report()" style="animation-delay:.5s"><div class="uh"><span class="ui">📊</span></div><h3>My Performance Report</h3><p>See accuracy by unit and lesson, what to practise next, and your badges.</p></button></div>
    <h2 class="sec">Badges</h2><div class="badges">${BADGES.map(b => `<div class="badge ${ST.badges[b.id] ? 'got' : ''}" title="${b.d}"><span>${b.icon}</span><b>${b.name}</b><small>${b.d}</small></div>`).join('')}</div>
    ${rulesHTML()}
    ${INVALID.length ? `<p class="warn">⚠️ ${INVALID.length} question(s) failed validation and are hidden: ${INVALID.map(x => x.id).join(', ')}</p>` : ''}
    <p class="foot">Not ${esc(ST.name)}? <button class="linkbtn" onclick="APP.changeName()">Change name</button></p></main>`;
  render(h);
}

/* ================= UNIT PAGE ================= */
function unitPage(uid) {
  S = null; const u = unitOf(uid), idx = UNITS.indexOf(u), ls = lessonsOf(uid), qs = Q.filter(q => q.l === uid), s = statsFor(qs);
  let h = header();
  h += `<main><button class="back" onclick="APP.home()">← All units</button>
    <section class="uhero" style="--uc:${u.color}"><span class="ui big" aria-hidden="true">${u.icon}</span><div><span class="un">Unit ${idx + 1}</span><h1>${u.name}</h1>
      <p>${qs.length} questions · ${ls.length} lesson${ls.length > 1 ? 's' : ''} · Completion <b>${s.completion}%</b> · Accuracy <b>${accTxt(s.accuracy)}</b></p>
      <div class="uacts"><button class="btn" onclick="APP.play('unit','${uid}')">▶ Play whole unit (${qs.length})</button>
      ${qs.length > 10 ? `<button class="btn ghost" onclick="APP.play('unit10','${uid}')">⚡ Quick 10</button>` : ''}
      ${s.mistakes ? `<button class="btn ghost warnb" onclick="APP.play('fixunit','${uid}')">🔁 Fix ${s.mistakes} mistake${s.mistakes > 1 ? 's' : ''}</button>` : ''}</div></div></section>
    <h2 class="sec">Lessons</h2><div class="lessons">`;
  ls.forEach((l, i) => {
    const ss = statsFor(l.qs);
    h += `<div class="lrow" style="--uc:${u.color}"><div class="lcode">${l.code}</div><div class="linfo"><h3>${l.name}</h3>
      <div class="lbar" role="progressbar" aria-label="${l.name} completion" aria-valuenow="${ss.completion}" aria-valuemin="0" aria-valuemax="100"><i style="width:${ss.completion}%"></i></div>
      <small>${ss.attempted}/${ss.total} answered · Accuracy ${accTxt(ss.accuracy)}${ss.mistakes ? ` · <span class="mk">${ss.mistakes} to fix</span>` : ''}</small></div>
      <span class="stars">${starStr(ss.stars)}</span><button class="btn sm" onclick="APP.play('lesson','${uid}',${i})" aria-label="Play lesson ${l.code} ${l.name}">Play ${l.qs.length}</button></div>`;
  });
  render(h + '</div></main>');
}

/* ================= SESSION ================= */
function play(kind, uid, li) {
  let qs, label, scope;
  if (kind === 'unit') { qs = Q.filter(q => q.l === uid); label = unitOf(uid).name; scope = 'u:' + uid; }
  else if (kind === 'unit10') { qs = shuffle(Q.filter(q => q.l === uid)).slice(0, 10); label = unitOf(uid).name + ' — Quick 10'; scope = 'u10:' + uid; }
  else if (kind === 'fixunit') { qs = Q.filter(q => q.l === uid && ST.rec[q.id] && !ST.rec[q.id].last); label = unitOf(uid).name + ' — Fix mistakes'; scope = 'fix:' + uid; }
  else if (kind === 'lesson') { const l = lessonsOf(uid)[li]; qs = l.qs.slice(); label = `${l.code} ${l.name}`; scope = 'l:' + l.code; }
  else if (kind === 'mixed') { qs = shuffle(Q).slice(0, uid || Q.length); label = uid ? `Mixed Challenge — ${uid}` : 'Mixed Challenge — Marathon'; scope = 'mix' + (uid || 'all'); }
  else if (kind === 'retry') { qs = shuffle(uid); label = 'Practise missed questions'; scope = 'retry'; }
  if (!qs || !qs.length) { toast('Nothing to practise here yet 🎉'); return; }
  S = { kind, uid, scope, label, qs, i: 0, results: [], streak: 0, bestStreak: 0, xp: 0, newBadges: [], t0: Date.now(), done: false };
  renderQ();
}
function sessionCounts() {
  const correct = S.results.filter(r => r.ok).length, wrong = S.results.length - correct, total = S.qs.length;
  return { correct, wrong, attempted: S.results.length, unanswered: total - S.results.length, total, accuracy: pct(correct, S.results.length), completion: pct(S.results.length, total) };
}
function accHTML() {
  const c = sessionCounts(), a = c.accuracy;
  const col = a === null ? ['#f1f3f9', '#5b6280'] : a >= 80 ? ['#e3f6ec', '#0b7a4b'] : a >= 50 ? ['#fff4d6', '#8a5a00'] : ['#fde8ea', '#b3261e'];
  return `<div class="row"><span class="lg">🎯 Accuracy</span><span class="legend"><span>✅ <b>${c.correct}</b> correct</span><span>❌ <b>${c.wrong}</b> incorrect</span><span>⏳ <b>${c.unanswered}</b> unanswered</span></span><span class="pct" style="background:${col[0]};color:${col[1]}">${accTxt(a)}</span></div>
  <div class="track" role="img" aria-label="${c.correct} correct, ${c.wrong} incorrect, ${c.unanswered} unanswered out of ${c.total}"><i class="g" style="width:${c.correct / c.total * 100}%"></i><i class="r" style="width:${c.wrong / c.total * 100}%"></i></div>`;
}
function srcChip(q) { return `📄 ${q.file}${q.page ? ` · page ${q.page}` : ''} · Q${q.n} of ${q.of}`; }
function renderQ() {
  const q = S.qs[S.i]; Object.assign(S, { answered: false, sel: null, order: null, graph: new Set(), hintShown: false });
  const u = unitOf(q.l), c = sessionCounts();
  let h = header();
  h += `<main class="quiz"><div class="qhead"><button class="back" onclick="APP.leave()">← Exit</button>
      <div class="qtitle"><b>${esc(S.label)}</b><span id="qnum">Question ${S.i + 1} of ${S.qs.length}</span></div></div>
    <div class="progwrap"><div class="prog" role="progressbar" aria-label="Completion" aria-valuenow="${c.completion}" aria-valuemin="0" aria-valuemax="100"><i id="pg" style="width:${c.completion}%"></i></div><span id="pgt">${c.completion}% complete</span></div>
    <div class="acc" id="acc">${accHTML()}</div>
    <article class="card enter" id="card" data-qid="${q.id}" style="--uc:${u.color}">
      <div class="chips"><span class="chip u">${u.icon} ${u.name}</span><span class="chip">${esc(q.sk)}</span><span class="chip src">${srcChip(q)}</span></div>
      <div class="prompt" id="prompt">${q.p}</div>${visOf(q) ? `<div class="visual">${visOf(q)}</div>` : ''}<div id="zone"></div>
      <div id="hintArea" aria-live="polite"></div><div class="actions" id="acts"></div><div id="fb" aria-live="polite"></div></article></main>`;
  render(h);
  setActs(q); M && M.questionShown(q.id);
  ({ input: rInput, choice: rChoice, sign: rSign, order: rOrder, nlpick: rNlpick, graph: rGraph, nlmiss: rNlmiss })[q.t](q);
}
function visOf(q) { return q.vis ? q.vis() : q.visHTML ? q.visHTML : q.visNL ? wrapNL(q.visNL) : ''; }
function exvOf(q) { return q.exv ? q.exv() : q.exvNL ? wrapNL(q.exvNL) : ''; }
function setActs(q) {
  const needCheck = ['input', 'order', 'graph', 'nlmiss'].includes(q.t);
  $('#acts').innerHTML = (needCheck ? `<button class="btn" id="checkBtn" onclick="APP.check()">Check ✓</button>` : '') +
    `<button class="btn ghost sm" id="hintBtn" onclick="APP.hint()">💡 Hint</button><span class="nextlock">Answer to unlock <b>Next</b> 🔒</span>`;
}
function hint() { if (S.answered || S.hintShown) return; S.hintShown = true; $('#hintArea').innerHTML = `<div class="hintbox">💡 ${S.qs[S.i].hint}</div>`; $('#hintBtn').disabled = true; beep('tap'); M && M.help(); }
const steps = arr => `<ol>${arr.map(x => `<li>${x}</li>`).join('')}</ol>`;

/* ---- renderers ---- */
function partsHTML(q) {
  return '<div class="parts">' + q.parts.map((p, k) => `<div class="part ${p.lab ? 'block' : ''}">${p.lab ? `<label class="lab" for="in${k}">${p.lab}</label>` : ''}<div class="irow">${p.pre || ''}<input class="ans" id="in${k}" autocomplete="off" inputmode="text" ${p.lab ? '' : `aria-label="Answer${q.parts.length > 1 ? ' ' + (k + 1) : ''}"`}>${p.post ? `<span class="post">${p.post}</span>` : ''}<span class="preview" id="pv${k}" aria-hidden="true"></span></div></div>`).join('') + '</div>';
}
function bindParts(q, focus) {
  q.parts.forEach((p, k) => { const el = $('#in' + k);
    el.addEventListener('input', () => { el.classList.remove('no'); const pv = $('#pv' + k); if (!pv) return; const pp = parseNum(el.value); pv.innerHTML = pp && pp.frac ? '= ' + prettyParsed(pp) : ''; });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (S.answered) next(); else if (k < q.parts.length - 1) $('#in' + (k + 1)).focus(); else check(); } }); });
  if (focus) setTimeout(() => $('#in0') && $('#in0').focus({ preventScroll: true }), 300);
}
function rInput(q) { $('#zone').innerHTML = partsHTML(q) + `<div class="tip">Type fractions like <b>3/4</b>, mixed numbers like <b>2 3/4</b> (with a space), and negatives with <b>-</b>.</div>`; bindParts(q, true); }
function rChoice(q) { $('#zone').innerHTML = `<div class="opts" role="group" aria-label="Answer choices">${q.opts.map(o => `<button class="opt" data-v="${esc(o.v)}" onclick="APP.pickChoice(this)">${o.h}</button>`).join('')}</div>`; }
function rSign(q) {
  $('#zone').innerHTML = `<div class="signbox"><span>${q.L}</span><span class="qm" id="qm" aria-hidden="true">?</span><span>${q.R}</span></div>
   <div class="opts" role="group" aria-label="Choose a sign">${(q.signs || ['>', '<', '=']).map(s => `<button class="opt" data-v="${s}" aria-label="${{ '>': 'greater than', '<': 'less than', '=': 'equal to', '≠': 'not equal to' }[s]}" onclick="APP.pickSign(this)">${s === '>' ? '&gt;' : s === '<' ? '&lt;' : s}</button>`).join('')}</div>`;
}
function rOrder(q) { S.order = { pool: shuffle(q.tiles.map((t, i) => i)), slots: Array(q.tiles.length).fill(null) }; drawOrder(q); }
function drawOrder(q, focusPool) {
  const o = S.order, lockd = S.answered;
  const tile = (i, where, k) => `<button class="tile" ${lockd ? 'disabled' : ''} data-i="${i}" aria-label="${stripTags(q.tiles[i].h)}${where === 'slot' ? `, in position ${k + 1}. Press to remove.` : '. Press to place.'}" onclick="APP.moveTile('${where}',${k})">${q.tiles[i].h}</button>`;
  $('#zone').innerHTML = `<div class="ozone"><div class="olabel">${q.dir === 'up' ? '⬆ Least → Greatest' : '⬇ Greatest → Least'} — tap numbers to place them</div>
    <div class="slots">${o.slots.map((s, k) => `<div class="slot"><span aria-hidden="true">${k + 1}</span>${s !== null ? tile(s, 'slot', k) : ''}</div>`).join('')}</div>
    <div class="olabel" style="margin-top:12px">Numbers</div>
    <div class="pool">${o.pool.map((s, k) => tile(s, 'pool', k)).join('') || '<span class="tip" style="align-self:center">All placed! Press Check ✓ (tap a number to take it back)</span>'}</div></div>`;
  const cb = $('#checkBtn'); if (cb && !S.answered) cb.disabled = o.slots.includes(null);
  if (focusPool) { const t = $('.pool .tile') || $('#checkBtn'); t && t.focus(); }
}
function moveTile(where, k) {
  if (S.answered) return; const o = S.order, q = S.qs[S.i]; beep('tap');
  if (where === 'pool') { const t = o.pool.splice(k, 1)[0]; o.slots[o.slots.indexOf(null)] = t; } else { o.pool.push(o.slots[k]); o.slots[k] = null; }
  drawOrder(q, true);
}
const NL5 = { min: -5, max: 5, step: 1, labels: 'all' };
function rNlpick(q) { $('#zone').innerHTML = `<div class="opts lines" role="group" aria-label="Number line choices">${shuffle(q.pts).map((v, i) => `<button class="opt" data-v="${v}" aria-label="Choice ${String.fromCharCode(65 + i)}" onclick="APP.pickChoice(this)"><span class="optl" aria-hidden="true">${String.fromCharCode(65 + i)}</span>${NL({ ...NL5, points: [{ v, c: q.c }] })}</button>`).join('')}</div>`; }
function rGraph(q) {
  $('#zone').innerHTML = `<div class="nlwrap" ${q.line.vertical ? 'style="max-width:200px"' : ''}>${NL({ ...q.line, interactive: true, id: 'gline' })}</div><div class="nlhelp">👆 Tap (or Tab + Enter) a tick mark to place a point. Tap it again to remove it. <b>${q.a.length} point${q.a.length > 1 ? 's' : ''}</b> needed · placed: <b id="gcount">0</b></div>` + (q.parts ? `<div class="gparts">${partsHTML(q)}</div>` : '');
  if (q.parts) bindParts(q, false);
  $$('#gline .hit').forEach(g => { const tog = () => { if (S.answered) return; const v = +g.dataset.v; S.graph.has(v) ? S.graph.delete(v) : S.graph.add(v); g.setAttribute('aria-pressed', S.graph.has(v)); beep('tap'); drawGraphPts(q); };
    g.setAttribute('aria-pressed', 'false'); g.addEventListener('click', tog); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } }); });
  drawGraphPts(q);
}
function drawGraphPts(q, marks) {
  let s = [...S.graph].map(v => { const col = marks ? (q.a.includes(v) ? '#16a34a' : '#dc2626') : '#1d4fd8', P = nlPos(q.line, v); return `<circle class="pt" cx="${P.x}" cy="${P.y}" r="9" fill="${col}"/>`; }).join('');
  if (marks) q.a.filter(v => !S.graph.has(v)).forEach(v => { const P = nlPos(q.line, v); s += `<circle cx="${P.x}" cy="${P.y}" r="9" fill="none" stroke="#16a34a" stroke-width="3" stroke-dasharray="4 3"/>`; });
  $('#gline .pts').innerHTML = s; const gc = $('#gcount'); if (gc) gc.textContent = S.graph.size;
  const cb = $('#checkBtn'); if (cb && !S.answered) cb.disabled = S.graph.size === 0;
}
function rNlmiss(q) {
  const L = q.line, w = 660, labs = []; for (let v = L.min; v <= L.max; v += L.step) if (!q.blanks.includes(v)) labs.push(v);
  let h = `<div class="nlwrap"><div class="nlm">${NL({ ...L, labels: labs })}`;
  q.blanks.forEach((v, k) => { h += `<input class="ans" id="in${k}" autocomplete="off" style="left:${nlX(L, v) / w * 100}%" aria-label="Missing number ${k + 1} of ${q.blanks.length}">`; });
  $('#zone').innerHTML = h + '</div></div><div class="nlhelp">Type the number that belongs in each box. Use - for negatives.</div>';
  q.parts = q.blanks.map(v => ({ a: v })); bindParts(q, true);
}

/* ---- checking ---- */
function nudge(msg) { $('#hintArea').innerHTML = `<div class="hintbox">✏️ ${msg}</div>`; }
function check() {
  if (!S || S.done) return; if (S.answered) return next();
  const q = S.qs[S.i];
  if (q.t === 'order' && S.order.slots.includes(null)) { nudge('Place every number first.'); return; }
  if (q.t === 'graph' && S.graph.size === 0) { nudge('Tap the number line to place your point' + (q.a.length > 1 ? 's' : '') + ' first.'); return; }
  if (q.t === 'input' || q.t === 'nlmiss' || (q.t === 'graph' && q.parts)) {
    const vals = q.parts.map((p, k) => $('#in' + k).value.trim()), empty = vals.findIndex(v => !v);
    if (empty >= 0) { nudge('Type an answer in every box first.'); $('#in' + empty).focus(); return; }
    const parsed = vals.map(parseNum), bad = parsed.findIndex(p => !p);
    if (bad >= 0) { nudge('Hmm, I can\'t read that. Use numbers like 12, -5, 3.75, 3/4 or 2 3/4.'); $('#in' + bad).focus(); return; }
    const needD = q.parts.findIndex((p, k) => p.dec && parsed[k].frac);
    if (needD >= 0) { nudge('Write your answer as a <b>decimal</b> number (like 0.3), not a fraction.'); $('#in' + needD).focus(); return; }
    const needF = q.parts.findIndex((p, k) => p.f && !parsed[k].frac && !Number.isInteger(p.a));
    if (needF >= 0 && Math.abs(parsed[needF].v - q.parts[needF].a) < 1e-9) { nudge('Correct value — now write it as a <b>fraction</b> (like 3/4) or mixed number!'); $('#in' + needF).focus(); return; }
  }
  grade();
}
function gradeParts(q) {
  const res = q.parts.map((p, k) => { const pp = parseNum($('#in' + k).value); return pp && Math.abs(pp.v - p.a) < 1e-9 ? pp : null; });
  q.parts.forEach((p, k) => { const el = $('#in' + k); el.classList.add(res[k] ? 'ok' : 'no'); el.disabled = true; el.setAttribute('aria-invalid', !res[k]); });
  return res;
}
function grade() {
  const q = S.qs[S.i]; let ok = false, note = '', given = '';
  if (q.t === 'input' || q.t === 'nlmiss') {
    const res = gradeParts(q); ok = res.every(Boolean); given = q.parts.map((p, k) => $('#in' + k).value).join(', ');
    if (ok && res.find(pp => pp && pp.frac && gcd(pp.n, pp.d) > 1)) note = `Tip: always simplify! Simplest form: ${q.parts.map(p => p.show || fmt(p.a)).join(', ')}`;
  } else if (q.t === 'choice' || q.t === 'sign' || q.t === 'nlpick') {
    ok = String(S.sel) === String(q.a); given = String(S.sel);
    $$('#zone .opt').forEach(b => { b.disabled = true; if (b.dataset.v === String(q.a)) b.classList.add('ok'); else if (b.dataset.v === String(S.sel)) b.classList.add('no'); });
    if (q.t === 'sign') $('#qm').classList.add(ok ? 'okf' : 'nof');
  } else if (q.t === 'order') {
    const vals = S.order.slots.map(i => q.tiles[i].v), want = q.tiles.map(t => t.v).sort((a, b) => q.dir === 'up' ? a - b : b - a);
    ok = vals.every((v, k) => v === want[k]); given = vals.join(', '); S.answered = true; drawOrder(q);
    $$('.slots .tile').forEach((b, k) => b.classList.add(vals[k] === want[k] ? 'ok' : 'no'));
  } else if (q.t === 'graph') {
    let partsOk = true; if (q.parts) partsOk = gradeParts(q).every(Boolean);
    ok = S.graph.size === q.a.length && q.a.every(v => S.graph.has(v)) && partsOk; given = [...S.graph].join(', ');
    S.answered = true; drawGraphPts(q, true);
  }
  S.answered = true; S.results.push({ id: q.id, ok, given });
  const r = ST.rec[q.id] || { a: 0, c: 0, last: null };
  const wasWrong = r.last === false;
  r.a++; if (ok) r.c++; r.last = ok; r.ts = Date.now(); ST.rec[q.id] = r;
  feedback(ok, q, note); save();
  if (ok && wasWrong) award('comeback');
  checkBadges();
}
function correctHTML(q) {
  if (q.t === 'input') return q.parts.map(p => (p.lab ? `<span class="cl">${p.lab}</span> ` : '') + `<b>${p.show || fmt(p.a)}</b>${p.post ? ' ' + p.post : ''}`).join('<br>');
  if (q.t === 'choice') return `<b>${q.opts.find(o => o.v === q.a).h}</b>`;
  if (q.t === 'sign') return `<span class="signbox inl">${q.L} <b style="color:var(--ok)">${q.a === '>' ? '&gt;' : q.a === '<' ? '&lt;' : q.a}</b> ${q.R}</span>`;
  if (q.t === 'nlmiss') return q.blanks.map(fmt).join(', ');
  if (q.t === 'order') return q.tiles.slice().sort((a, b) => q.dir === 'up' ? a.v - b.v : b.v - a.v).map(t => `<b>${t.h}</b>`).join(' , ');
  if (q.t === 'graph') return q.a.map(fmt).join(', ') + ' <span class="tip">(green circles)</span>' + (q.parts ? '<br>' + q.parts.map(p => `${p.lab} <b>${fmt(p.a)}</b>`).join('<br>') : '');
  if (q.t === 'nlpick') return `<div class="nlwrap" style="margin-top:6px">${NL({ ...NL5, points: [{ v: q.a, c: '#16a34a' }] })}</div>`;
}
function feedback(ok, q, note) {
  const card = $('#card'), cb = $('#checkBtn'); card.classList.remove('enter'); void card.offsetWidth;
  if (ok) {
    S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
    const gain = 10 + Math.min(10, (S.streak - 1) * 2); S.xp += gain; ST.xp += gain;
    card.classList.add('good'); const r = (cb || card).getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + 10, S.streak >= 3 ? 90 : 50); floatXP('+' + gain + ' XP', r.left + r.width / 2, r.top);
    beep('ok'); M && M.correct();
    if (S.streak >= 5) award('streak5'); if (S.streak >= 10) award('streak10');
  } else { S.streak = 0; card.classList.add('badc'); if (!reduce()) card.classList.add('shake'); beep('bad'); M && M.incorrect(); }
  bump('#xpPill', '#xpv', ST.xp); bump('#firePill', '#stv', S.streak);
  $('#acc').innerHTML = accHTML(); const c = sessionCounts(); if (M && c.total >= 4 && c.completion >= 50) M.milestone('half:' + S.scope); $('#pg').style.width = c.completion + '%'; $('#pgt').textContent = c.completion + '% complete'; $('.prog').setAttribute('aria-valuenow', c.completion);
  $('#hintArea').innerHTML = ''; const hb = $('#hintBtn'); hb && hb.remove();
  const exv = exvOf(q) ? `<div style="margin-top:10px">${exvOf(q)}</div>` : '';
  $('#fb').innerHTML = ok
    ? `<div class="fb good"><h4>✅ Correct!</h4>${note ? `<div class="note">${note}</div>` : ''}<details><summary>See why it works</summary>${steps(q.ex)}${exv}</details></div>`
    : `<div class="fb bad"><h4>❌ Not quite — here's the fix</h4><div class="ca">Correct answer: ${correctHTML(q)}</div><div class="how">How to solve it:</div>${steps(q.ex)}${exv}</div>`;
  const last = S.i === S.qs.length - 1;
  $('#acts').innerHTML = `<button class="btn ${ok ? 'green' : ''}" id="nextBtn" onclick="APP.next()">${last ? 'Finish & see results 🏁' : 'Next →'}</button>`;
  setTimeout(() => { const n = $('#nextBtn'); n && n.focus({ preventScroll: true }); const f = $('#fb'); f && f.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'nearest' }); }, 120);
}
function bump(pill, val, v) { const p = $(pill), x = $(val); if (!p || !x) return; x.textContent = v; p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
function floatXP(t, x, y) { if (reduce()) return; const d = document.createElement('div'); d.className = 'xpf'; d.textContent = t; d.style.left = (x - 40) + 'px'; d.style.top = (y - 10) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1200); }
function next() { if (!S || !S.answered) return; if (S.i >= S.qs.length - 1) return finish(); S.i++; renderQ(); }
function leave() {
  const c = sessionCounts();
  if (!c.attempted) return S.kind === 'lesson' || S.kind.startsWith('unit') || S.kind === 'fixunit' ? unitPage(S.uid) : hub();
  modal(`<h3>Leave this round?</h3><p>You've answered ${c.attempted} of ${c.total}. Your answers are already saved in your report, but this round's score will not be finished.</p>
    <div class="mrow"><button class="btn ghost" data-act="stay">Keep playing</button><button class="btn" data-act="go">Leave round</button></div>`, a => { if (a === 'go') { const k = S.kind, u = S.uid; S = null; (k === 'lesson' || k.startsWith('unit') || k === 'fixunit') ? unitPage(u) : hub(); } });
}

/* ================= RESULTS ================= */
function finish() {
  const c = sessionCounts(), secs = Math.round((Date.now() - S.t0) / 1000), st = c.accuracy >= 90 ? 3 : c.accuracy >= 70 ? 2 : c.accuracy >= 50 ? 1 : 0;
  S.done = true;
  ST.sessions.unshift({ d: Date.now(), label: S.label, total: c.total, correct: c.correct, secs }); ST.sessions = ST.sessions.slice(0, 30);
  const b = ST.best[S.scope]; if (!b || c.accuracy > b) ST.best[S.scope] = c.accuracy;
  save(); if (c.total >= 10 && c.correct === c.total) award('perfect');
  // lesson breakdown
  const groups = new Map(); S.qs.forEach((q, i) => { const k = q.sk; if (!groups.has(k)) groups.set(k, { c: 0, n: 0, u: q.l }); const g = groups.get(k); g.n++; if (S.results[i] && S.results[i].ok) g.c++; });
  const missed = S.qs.filter((q, i) => S.results[i] && !S.results[i].ok);
  S.lastMissed = missed;
  let h = header();
  h += `<main><article class="card endc"><img class="rlogo" src="assets/logo.png" alt="International Education Egypt logo" width="110" height="110">
    <div class="trophy" aria-hidden="true">${st === 3 ? '🏆' : st === 2 ? '🥈' : st === 1 ? '🥉' : '📘'}</div>
    <h1>${st === 3 ? 'Outstanding' : st >= 2 ? 'Great job' : st === 1 ? 'Good effort' : 'Keep practising'}, ${esc(ST.name)}!</h1><p class="sub">${esc(S.label)}</p>
    <div class="bigstars" aria-label="${st} of 3 stars">${[1, 2, 3].map(i => `<span style="color:${i <= st ? 'var(--gold)' : '#dfe3ef'}">★</span>`).join('')}</div>
    <div class="acc wide">${accHTML()}</div>
    <div class="endstats"><div><b>${c.correct}/${c.total}</b>Score</div><div><b>${accTxt(c.accuracy)}</b>Accuracy</div><div><b>${c.completion}%</b>Completion</div><div><b>+${S.xp}</b>XP</div><div><b>🔥 ${S.bestStreak}</b>Best streak</div><div><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b>Time</div></div>
    ${S.newBadges.length ? `<div class="newb">${S.newBadges.map(id => { const b = BADGES.find(x => x.id === id); return `<span>${b.icon} ${b.name}</span>`; }).join('')}</div>` : ''}
    <div class="actions center">${missed.length ? `<button class="btn" onclick="APP.retryMissed()">🔁 Practise ${missed.length} missed</button>` : ''}
      <button class="btn ghost" onclick="APP.again()">↻ Play again</button><button class="btn ghost" onclick="APP.report()">📊 My report</button><button class="btn green" onclick="APP.home()">🗺️ All units</button></div>
    <h2 class="sec">Lesson breakdown</h2><div class="tw"><table class="bt"><thead><tr><th>Lesson</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>
    ${[...groups.entries()].map(([k, g]) => `<tr><td>${unitOf(g.u).icon} ${esc(k)}</td><td>${g.c}/${g.n}</td><td><div class="minibar"><i style="width:${pct(g.c, g.n)}%;background:${pct(g.c, g.n) >= 70 ? 'var(--ok)' : pct(g.c, g.n) >= 50 ? 'var(--gold)' : 'var(--bad)'}"></i></div>${pct(g.c, g.n)}%</td></tr>`).join('')}</tbody></table></div>
    ${missed.length ? `<h2 class="sec">Review your mistakes</h2><div class="missed">${missed.map(q => `<details class="m"><summary><small>${srcChip(q)} · ${esc(q.sk)}</small><span>${stripTags(q.p).slice(0, 140)}</span></summary><div class="mbody"><div class="ca">Correct answer: ${correctHTML(q)}</div>${steps(q.ex)}</div></details>`).join('')}</div>` : ''}
  </article></main>`;
  render(h);
  if (st >= 1) { beep('win'); for (let k = 0; k < 4; k++) setTimeout(() => confetti(innerWidth * (.2 + .2 * k), innerHeight * .3, 70, 1.2), k * 250); }
  M && M.lessonComplete();
}
let lastPlay = null;

/* ================= REPORT ================= */
function report() {
  S = null; if (!ST.name) return welcome();
  const all = statsFor(Q);
  const unitRows = UNITS.map((u, i) => ({ u, i, s: statsFor(Q.filter(q => q.l === u.id)) }));
  const lessonRows = []; UNITS.forEach(u => lessonsOf(u.id).forEach(l => lessonRows.push({ u, l, s: statsFor(l.qs) })));
  const weak = lessonRows.filter(r => r.s.tries >= 3 && r.s.accuracy < 70).sort((a, b) => a.s.accuracy - b.s.accuracy);
  const notStarted = lessonRows.filter(r => !r.s.attempted);
  const bar = (v, col) => `<div class="minibar"><i style="width:${v || 0}%;background:${col}"></i></div>`;
  const accCol = a => a === null ? '#c7cbe0' : a >= 70 ? 'var(--ok)' : a >= 50 ? 'var(--gold)' : 'var(--bad)';
  let h = header();
  h += `<main><button class="back" onclick="APP.home()">← All units</button>
  <article class="card report" id="report">
    <div class="rhead"><img src="assets/logo.png" alt="International Education Egypt logo" width="84" height="84"><div><h1>Student Performance Report</h1>
      <p><b>${esc(ST.name)}</b> · Grade 6 Math Quest · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
    <div class="endstats"><div><b>${all.attempted}/${all.total}</b>Questions answered</div><div><b>${all.completion}%</b>Completion</div><div><b>${accTxt(all.accuracy)}</b>Accuracy (all tries)</div><div><b>${all.correctLast}</b>Correct now</div><div><b>${all.mistakes}</b>Still to fix</div><div><b>${ST.xp}</b>XP</div></div>
    <p class="formula">Accuracy = correct answers ÷ answers checked (every try counts). Completion = different questions answered ÷ ${Q.length}.</p>
    <h2 class="sec">By unit</h2><div class="tw"><table class="bt"><thead><tr><th>Unit</th><th>Completion</th><th>Accuracy</th><th>Stars</th></tr></thead><tbody>
    ${unitRows.map(r => `<tr><td>${r.u.icon} Unit ${r.i + 1}: ${r.u.name}</td><td>${bar(r.s.completion, r.u.color)}${r.s.attempted}/${r.s.total}</td><td>${bar(r.s.accuracy, accCol(r.s.accuracy))}${accTxt(r.s.accuracy)}</td><td class="stars">${starStr(r.s.stars)}</td></tr>`).join('')}</tbody></table></div>
    <h2 class="sec">🎯 What to practise next</h2>
    ${weak.length ? `<ul class="todo">${weak.slice(0, 8).map(r => `<li><b>${r.l.code}</b> ${r.l.name} — accuracy ${r.s.accuracy}% <button class="btn sm ghost" onclick="APP.playLesson('${r.u.id}','${r.l.code}')">Practise</button></li>`).join('')}</ul>` : `<p class="muted">${all.tries ? 'No weak lessons yet — great work! (A lesson appears here when its accuracy is below 70% after 3+ tries.)' : 'Answer some questions to see suggestions here.'}</p>`}
    ${notStarted.length ? `<p class="muted">Not started yet: ${notStarted.map(r => `<b>${r.l.code}</b>`).join(', ')}</p>` : ''}
    <h2 class="sec">By lesson</h2><div class="tw"><table class="bt"><thead><tr><th>Lesson</th><th>Answered</th><th>Accuracy</th><th>To fix</th></tr></thead><tbody>
    ${lessonRows.map(r => `<tr><td>${r.u.icon} <b>${r.l.code}</b> ${r.l.name}</td><td>${r.s.attempted}/${r.s.total}</td><td>${bar(r.s.accuracy, accCol(r.s.accuracy))}${accTxt(r.s.accuracy)}</td><td>${r.s.mistakes || '—'}</td></tr>`).join('')}</tbody></table></div>
    <h2 class="sec">Badges (${Object.keys(ST.badges).length}/${BADGES.length})</h2><div class="badges">${BADGES.map(b => `<div class="badge ${ST.badges[b.id] ? 'got' : ''}"><span>${b.icon}</span><b>${b.name}</b><small>${b.d}</small></div>`).join('')}</div>
    <h2 class="sec">Recent rounds</h2>${ST.sessions.length ? `<div class="tw"><table class="bt"><thead><tr><th>Date</th><th>Round</th><th>Score</th><th>Accuracy</th></tr></thead><tbody>${ST.sessions.slice(0, 10).map(s => `<tr><td>${new Date(s.d).toLocaleDateString('en-GB')}</td><td>${esc(s.label)}</td><td>${s.correct}/${s.total}</td><td>${pct(s.correct, s.total)}%</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No finished rounds yet.</p>'}
    <div class="actions center"><button class="btn" onclick="APP.copyReport()">📋 Copy report as text</button><button class="btn ghost warnb" onclick="APP.resetAll()">🗑️ Reset all progress</button></div>
    <p class="muted small">Saved on this device only${canSave ? '' : ' (storage is blocked in this browser — progress ends when the page closes)'}.</p>
  </article></main>`;
  render(h);
}
function reportText() {
  const all = statsFor(Q), L = [];
  L.push(`Grade 6 Math Quest — Student Performance Report (International Education Egypt)`, `Student: ${ST.name}`, `Date: ${new Date().toLocaleDateString('en-GB')}`,
    `Answered: ${all.attempted}/${all.total} (${all.completion}%) · Accuracy: ${accTxt(all.accuracy)} · Still to fix: ${all.mistakes} · XP: ${ST.xp}`, '', 'By unit:');
  UNITS.forEach((u, i) => { const s = statsFor(Q.filter(q => q.l === u.id)); L.push(`  Unit ${i + 1} ${u.name}: ${s.attempted}/${s.total} answered, accuracy ${accTxt(s.accuracy)}`); });
  L.push('', 'By lesson:'); UNITS.forEach(u => lessonsOf(u.id).forEach(l => { const s = statsFor(l.qs); L.push(`  ${l.sk}: ${s.attempted}/${s.total}, accuracy ${accTxt(s.accuracy)}${s.mistakes ? `, ${s.mistakes} to fix` : ''}`); }));
  L.push('', `Badges: ${BADGES.filter(b => ST.badges[b.id]).map(b => b.name).join(', ') || 'none yet'}`);
  return L.join('\n');
}
function copyReport() {
  const t = reportText();
  const done = () => toast('📋 Report copied — paste it into an email or document');
  try { navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t)); } catch (e) { fallbackCopy(t); }
}
function fallbackCopy(t) {
  modal(`<h3>Copy your report</h3><p>Select all the text below and copy it.</p><textarea class="copybox" readonly>${esc(t)}</textarea><div class="mrow"><button class="btn" data-act="ok">Done</button></div>`);
  setTimeout(() => { const ta = $('.copybox'); ta && ta.select(); }, 50);
}
function resetAll() {
  modal(`<h3>Reset all progress?</h3><p>This deletes ${esc(ST.name)}'s answers, XP, badges and report on this device. It can't be undone.</p><div class="mrow"><button class="btn ghost" data-act="no">Cancel</button><button class="btn danger" data-act="yes">Yes, reset</button></div>`,
    a => { if (a === 'yes') { const n = ST.name; ST = blank(); ST.name = n; save(); toast('Progress reset'); hub(); } });
}

/* ================= MIXED PICKER ================= */
function pickMixed() {
  modal(`<h3>🏆 Mixed Challenge</h3><p>Questions from all ${UNITS.length} units, shuffled.</p><div class="opts2">
    <button class="btn ghost" data-act="20">⚡ Quick round <small>20 questions</small></button><button class="btn ghost" data-act="40">🔥 Big round <small>40 questions</small></button>
    <button class="btn" data-act="0">📚 Marathon <small>all ${Q.length}</small></button><button class="btn ghost sm" data-act="x">Cancel</button></div>`,
    a => { if (a !== 'x') play('mixed', +a || 0); });
}

/* ================= PUBLIC API (used by onclick) ================= */
window.APP = {
  home: hub, unit: unitPage, report, pickMixed, check, hint, next, leave, moveTile, copyReport, resetAll,
  play: (k, u, i) => { lastPlay = [k, u, i]; play(k, u, i); },
  playLesson: (uid, code) => { const i = lessonsOf(uid).findIndex(l => l.code === code); lastPlay = ['lesson', uid, i]; play('lesson', uid, i); },
  again: () => lastPlay ? play(...lastPlay) : hub(),
  retryMissed: () => play('retry', S.lastMissed),
  pickChoice: b => { if (!S || S.answered) return; S.sel = b.dataset.v; grade(); },
  pickSign: b => { if (!S || S.answered) return; S.sel = b.dataset.v; const qm = $('#qm'); qm.textContent = b.textContent; qm.classList.add('filled'); grade(); },
  toggleSound: b => { sound = !sound; b.textContent = sound ? '🔊' : '🔇'; b.setAttribute('aria-label', sound ? 'Mute sounds' : 'Turn sounds on'); b.setAttribute('aria-pressed', !sound); },
  changeName: () => welcome(),
};
document.addEventListener('keydown', e => { if (e.key === 'Enter' && S && S.answered && !S.done && document.activeElement && !['BUTTON', 'INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) next(); });
ST.name ? hub() : welcome();
})();
