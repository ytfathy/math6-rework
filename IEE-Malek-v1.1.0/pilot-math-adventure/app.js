/* Pilot: Math Adventure · Fractions (International Education Egypt).
   A real mini lesson: questions are checked, scored and tracked here; Malek only listens to these real events. */
(function () {
  'use strict';

  var T = {
    en: { app: 'Math Adventure', subject: 'fractions', subjectLabel: 'Fractions · Grade 4', lessons: 'Your lessons', lessonName: 'Fractions: parts of a whole',
      lessonMeta: '{n} questions', startLesson: 'Start lesson', continueLesson: 'Continue lesson', questionOf: 'Question {i} of {n}', hint: 'Hint',
      correct: 'Correct!', wrong: 'Not quite. Try again.', next: 'Next question', finish: 'See my results', done: 'Lesson complete!',
      score: '{c} of {n} correct on the first try', retry: 'Try the lesson again', back: 'Back to lessons', stars: 'Stars: {n}', langLabel: 'Language', equal: 'They are equal' },
    ar: { app: 'مغامرة الرياضيات', subject: 'الكسور', subjectLabel: 'الكسور · الصف الرابع', lessons: 'دروسك', lessonName: 'الكسور: أجزاء من الكل',
      lessonMeta: '{n} أسئلة', startLesson: 'ابدأ الدرس', continueLesson: 'تابع الدرس', questionOf: 'السؤال {i} من {n}', hint: 'تلميح',
      correct: 'إجابة صحيحة!', wrong: 'ليست صحيحة. حاول مرة أخرى.', next: 'السؤال التالي', finish: 'اعرض نتيجتي', done: 'أكملت الدرس!',
      score: '{c} من {n} صحيحة من المحاولة الأولى', retry: 'أعد الدرس', back: 'العودة إلى الدروس', stars: 'النجوم: {n}', langLabel: 'اللغة', equal: 'متساويان' },
    de: { app: 'Mathe-Abenteuer', subject: 'Brüche', subjectLabel: 'Brüche · Klasse 4', lessons: 'Deine Lektionen', lessonName: 'Brüche: Teile eines Ganzen',
      lessonMeta: '{n} Fragen', startLesson: 'Lektion starten', continueLesson: 'Lektion fortsetzen', questionOf: 'Frage {i} von {n}', hint: 'Tipp',
      correct: 'Richtig!', wrong: 'Nicht ganz. Versuch es nochmal.', next: 'Nächste Frage', finish: 'Ergebnis ansehen', done: 'Lektion geschafft!',
      score: '{c} von {n} beim ersten Versuch richtig', retry: 'Lektion wiederholen', back: 'Zurück zu den Lektionen', stars: 'Sterne: {n}', langLabel: 'Sprache', equal: 'Sie sind gleich' }
  };

  /* Questions. Fractions inside text are wrapped as [[...]] so they always read left-to-right, also in Arabic. */
  var Q = [
    { id: 'q1', visual: ['pie', 8, 3], answer: '3/8', options: ['5/8', '3/8', '3/5', '8/3'],
      prompt: { en: 'What fraction of the pizza is shaded?', ar: 'ما الكسر الذي يمثّل الجزء المظلّل من البيتزا؟', de: 'Welcher Bruchteil der Pizza ist gefärbt?' },
      hint: { en: 'Count the shaded slices, then count all the slices.', ar: 'عُدّ الشرائح المظلّلة، ثم عُدّ جميع الشرائح.', de: 'Zähle die gefärbten Stücke, dann alle Stücke.' } },
    { id: 'q2', visual: ['bar', 4, 1], answer: '1/4', options: ['1/3', '3/4', '1/4', '4/1'],
      prompt: { en: 'What fraction of the bar is shaded?', ar: 'ما الكسر الذي يمثّل الجزء المظلّل من الشريط؟', de: 'Welcher Bruchteil des Streifens ist gefärbt?' },
      hint: { en: 'How many equal parts are there? How many are shaded?', ar: 'كم عدد الأجزاء المتساوية؟ وكم منها مظلّل؟', de: 'Wie viele gleiche Teile gibt es? Wie viele sind gefärbt?' } },
    { id: 'q3', visual: ['compare'], answer: '1/2', options: ['1/2', '1/3', '=equal'],
      prompt: { en: 'Which fraction is bigger?', ar: 'أيّ الكسرين أكبر؟', de: 'Welcher Bruch ist größer?' },
      hint: { en: 'Look at the two bars: which shaded part is longer?', ar: 'انظر إلى الشريطين: أيّ الجزأين المظلّلين أطول؟', de: 'Schau dir beide Streifen an: Welcher gefärbte Teil ist länger?' } },
    { id: 'q4', visual: ['bar', 4, 2], answer: '1/2', options: ['1/4', '1/2', '4/2', '2/8'],
      prompt: { en: 'Which fraction is equal to [[2/4]]?', ar: 'أيّ كسر يساوي [[2/4]]؟', de: 'Welcher Bruch ist gleich [[2/4]]?' },
      hint: { en: 'Look at the bar: half of it is shaded.', ar: 'انظر إلى الشريط: نصفه مظلّل.', de: 'Schau auf den Streifen: Die Hälfte ist gefärbt.' } },
    { id: 'q5', visual: ['pie', 6, 5], answer: '5/6', options: ['1/6', '6/5', '5/6', '5/11'],
      prompt: { en: 'What fraction of the pizza is shaded?', ar: 'ما الكسر الذي يمثّل الجزء المظلّل من البيتزا؟', de: 'Welcher Bruchteil der Pizza ist gefärbt?' },
      hint: { en: 'Count the shaded slices, then count all the slices.', ar: 'عُدّ الشرائح المظلّلة، ثم عُدّ جميع الشرائح.', de: 'Zähle die gefärbten Stücke, dann alle Stücke.' } },
    { id: 'q6', visual: ['add'], answer: '2/3', options: ['2/6', '2/3', '1/9', '1/6'],
      prompt: { en: 'What is [[1/3 + 1/3]]?', ar: 'ما ناتج [[1/3 + 1/3]]؟', de: 'Was ist [[1/3 + 1/3]]?' },
      hint: { en: 'Add the top numbers. The bottom number stays the same.', ar: 'اجمع البسطين، ويبقى المقام كما هو.', de: 'Addiere die Zähler. Der Nenner bleibt gleich.' } }
  ];

  var STORE = 'iee-pilot-fractions:';
  function load(k, d) { try { var v = localStorage.getItem(STORE + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(STORE + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }

  var state = {
    lang: load('lang', 'en'), screen: 'home', index: 0, firstTry: 0, attemptsOnQ: 0, answered: false,
    stars: load('stars', 0), best: load('best', null), hintShown: false
  };
  var screen = document.getElementById('screen');
  var thinkTimer = null;

  function t(k, p) { var s = (T[state.lang] || T.en)[k] || ''; return s.replace(/\{(\w+)\}/g, function (_, x) { return p && p[x] != null ? p[x] : ''; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rich(s) { return esc(s).replace(/\[\[(.+?)\]\]/g, '<bdi class="math" dir="ltr">$1</bdi>'); }
  function frac(s) { return '<bdi class="math" dir="ltr">' + esc(s) + '</bdi>'; }
  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.6 7 .7-5.3 4.7 1.6 7L12 17.3 5.7 21l1.6-7L2 9.3l7-.7z"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var RETRY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';

  /* ---- Visuals (drawn from data, so they always match the question) ---- */
  function pie(n, k) {
    var s = '<svg viewBox="0 0 240 240" role="img" aria-label="' + n + ' / ' + k + '">', cx = 120, cy = 120, r = 100;
    for (var i = 0; i < n; i++) {
      var a0 = (-90 + i * 360 / n) * Math.PI / 180, a1 = (-90 + (i + 1) * 360 / n) * Math.PI / 180;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      s += '<path d="M' + cx + ' ' + cy + ' L' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ' A' + r + ' ' + r + ' 0 0 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' Z" fill="' + (i < k ? '#F5B90F' : '#FFF4DF') + '" stroke="#B37F00" stroke-width="3"/>';
    }
    return s + '</svg>';
  }
  function barRow(n, k, y, w, x) {
    var s = '', pw = w / n;
    for (var i = 0; i < n; i++) s += '<rect x="' + (x + i * pw).toFixed(1) + '" y="' + y + '" width="' + pw.toFixed(1) + '" height="56" fill="' + (i < k ? '#F5B90F' : '#FFF4DF') + '" stroke="#B37F00" stroke-width="3"/>';
    return s;
  }
  function visual(v) {
    if (v[0] === 'pie') return pie(v[1], v[2]);
    if (v[0] === 'bar') return '<svg viewBox="0 0 260 120" role="img" aria-label="bar">' + barRow(v[1], v[2], 32, 240, 10) + '</svg>';
    if (v[0] === 'compare') return '<svg viewBox="0 0 260 200" role="img" aria-label="1/2 and 1/3">' +
      '<text x="10" y="24" font-family="Readex Pro, sans-serif" font-size="20" font-weight="600" fill="#0E1A4F" direction="ltr">1/2</text>' + barRow(2, 1, 32, 240, 10) +
      '<text x="10" y="124" font-family="Readex Pro, sans-serif" font-size="20" font-weight="600" fill="#0E1A4F" direction="ltr">1/3</text>' + barRow(3, 1, 132, 240, 10) + '</svg>';
    if (v[0] === 'add') return '<svg viewBox="0 0 260 200" role="img" aria-label="1/3 + 1/3">' + barRow(3, 1, 20, 240, 10) +
      '<text x="130" y="108" text-anchor="middle" font-family="Readex Pro, sans-serif" font-size="28" font-weight="700" fill="#0E1A4F">+</text>' +
      '<rect x="10" y="124" width="80" height="56" fill="#FFF4DF" stroke="#B37F00" stroke-width="3"/><rect x="90" y="124" width="80" height="56" fill="#F5B90F" stroke="#B37F00" stroke-width="3"/><rect x="170" y="124" width="80" height="56" fill="#FFF4DF" stroke="#B37F00" stroke-width="3"/></svg>';
    return '';
  }

  /* ---- Chrome ---- */
  function applyLang() {
    var rtl = state.lang === 'ar';
    document.documentElement.lang = state.lang; document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.title = t('app') + ' · ' + t('subjectLabel') + ' | International Education Egypt';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (n) { n.textContent = t(n.getAttribute('data-t')); });
    var g = document.getElementById('langGroup'); g.setAttribute('aria-label', t('langLabel'));
    Array.prototype.forEach.call(g.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === state.lang ? 'true' : 'false'); });
    renderStars();
  }
  function renderStars() { var el = document.getElementById('stars'); el.innerHTML = STAR + '<span aria-hidden="true">' + state.stars + '</span><span class="iee-m-sr">' + esc(t('stars', { n: state.stars })) + '</span>'; }
  function setLang(lang, fromMalek) {
    if (!T[lang]) return;
    state.lang = lang; save('lang', lang); applyLang(); render();
    if (!fromMalek && malek) malek.setLanguage(lang);
  }
  document.getElementById('langGroup').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-lang]'); if (b) setLang(b.getAttribute('data-lang'));
  });

  /* ---- Screens ---- */
  function render() {
    clearTimeout(thinkTimer);
    if (state.screen === 'home') renderHome();
    else if (state.screen === 'quiz') renderQuiz();
    else renderResults();
  }
  function renderHome() {
    if (malek) malek.questionClosed();
    var progress = state.index > 0 && state.index < Q.length ? state.index / Q.length : 0;
    screen.innerHTML =
      '<p class="eyebrow">' + esc(t('subjectLabel')) + '</p><h1>' + esc(t('lessons')) + '</h1>' +
      '<section class="lesson-card"><div class="pie">' + pie(8, 3) + '</div><div><h2>' + esc(t('lessonName')) + '</h2><p>' + esc(t('lessonMeta', { n: Q.length })) + '</p>' +
      '<div class="progress" aria-hidden="true"><i style="width:' + Math.round(progress * 100) + '%"></i></div></div>' +
      '<button type="button" class="btn gold" id="startLesson">' + esc(progress ? t('continueLesson') : t('startLesson')) + '</button></section>';
    document.getElementById('startLesson').addEventListener('click', function () {
      if (!(state.index > 0 && state.index < Q.length)) { state.index = 0; state.firstTry = 0; }
      state.screen = 'quiz'; state.attemptsOnQ = 0; state.answered = false; state.hintShown = false; render(); screen.focus();
    });
  }
  function renderQuiz() {
    var q = Q[state.index], n = Q.length;
    screen.innerHTML =
      '<div class="qhead"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + state.index + '"><i style="width:' + Math.round(state.index / n * 100) + '%"></i></div>' +
      '<span>' + esc(t('questionOf', { i: state.index + 1, n: n })) + '</span></div>' +
      '<h1 id="qtext">' + rich(q.prompt[state.lang]) + '</h1>' +
      '<div class="qbody"><div class="visual">' + visual(q.visual) + '</div><div class="options" role="group" aria-labelledby="qtext">' +
      q.options.map(function (o) {
        var label = o === '=equal' ? esc(t('equal')) : frac(o);
        return '<button type="button" class="opt' + (o === '=equal' ? ' word' : '') + '" data-opt="' + esc(o) + '">' + label + '</button>';
      }).join('') + '</div></div>' +
      '<div class="feedback" id="feedback" role="status" aria-live="polite" hidden></div>' +
      '<div class="qtools"><button type="button" class="btn ghost" id="hintBtn">' + esc(t('hint')) + '</button>' +
      '<p class="hintbox" id="hintBox" ' + (state.hintShown ? '' : 'hidden') + '>' + rich(q.hint[state.lang]) + '</p></div>';

    Array.prototype.forEach.call(screen.querySelectorAll('.opt'), function (b) { b.addEventListener('click', function () { choose(b); }); });
    document.getElementById('hintBtn').addEventListener('click', function () {
      state.hintShown = true; document.getElementById('hintBox').hidden = false;
      if (malek) malek.help(); // real event: the student asked for help
    });
    if (malek) malek.questionShown(q.id + ':' + state.attemptsOnQ);
    // Real event: student has been working on the question for 12 s without answering -> thinking reaction.
    thinkTimer = setTimeout(function () { if (state.screen === 'quiz' && !state.answered && malek) malek.think(); }, 12000);
    if (state.answered) markAnswered();
  }
  function choose(btn) {
    if (state.answered) return;
    var q = Q[state.index], val = btn.getAttribute('data-opt'), ok = val === q.answer;
    state.attemptsOnQ++;
    clearTimeout(thinkTimer);
    var fb = document.getElementById('feedback');
    Array.prototype.forEach.call(screen.querySelectorAll('.opt'), function (b) { b.classList.remove('wrong'); b.innerHTML = b.innerHTML.replace(/<svg[\s\S]*<\/svg>/, ''); });
    if (ok) {
      state.answered = true;
      if (state.attemptsOnQ === 1) { state.firstTry++; state.stars += 3; } else { state.stars += 1; }
      save('stars', state.stars); renderStars();
      markAnswered();
      if (malek) malek.correct(); // real event
      // Real milestone: the student has now finished half of the lesson.
      if (state.index + 1 === Math.ceil(Q.length / 2) && malek) setTimeout(function () { malek.milestone('half'); }, 2200);
    } else {
      btn.classList.add('wrong'); btn.innerHTML += RETRY; btn.disabled = false;
      fb.hidden = false; fb.className = 'feedback no'; fb.innerHTML = '<p>' + esc(t('wrong')) + '</p>';
      if (malek) malek.incorrect(); // real event
      thinkTimer = setTimeout(function () { if (state.screen === 'quiz' && !state.answered && malek) malek.think(); }, 12000);
    }
  }
  function markAnswered() {
    var q = Q[state.index], fb = document.getElementById('feedback'), last = state.index === Q.length - 1;
    Array.prototype.forEach.call(screen.querySelectorAll('.opt'), function (b) {
      b.disabled = true;
      if (b.getAttribute('data-opt') === q.answer) { b.classList.add('right'); if (!/svg/.test(b.innerHTML)) b.innerHTML += CHECK; b.setAttribute('aria-pressed', 'true'); }
    });
    fb.hidden = false; fb.className = 'feedback ok';
    fb.innerHTML = '<p>' + esc(t('correct')) + '</p><button type="button" class="btn" id="nextBtn">' + esc(last ? t('finish') : t('next')) + '</button>';
    document.getElementById('nextBtn').addEventListener('click', next);
    try { document.getElementById('nextBtn').focus(); } catch (e) { /* ignore */ }
  }
  function next() {
    if (state.index < Q.length - 1) {
      state.index++; state.attemptsOnQ = 0; state.answered = false; state.hintShown = false; render(); screen.focus();
      window.scrollTo(0, 0);
    } else {
      state.index = Q.length; state.screen = 'results';
      state.best = Math.max(state.best || 0, state.firstTry); save('best', state.best);
      render(); window.scrollTo(0, 0);
      if (malek) malek.lessonComplete(); // real event
    }
  }
  function renderResults() {
    if (malek) malek.questionClosed();
    var n = Q.length, c = state.firstTry, earned = c === n ? 3 : c >= n / 2 ? 2 : 1;
    var stars = ''; for (var i = 0; i < 3; i++) stars += '<span style="color:' + (i < earned ? '#F5B90F' : '#D8CCBD') + '">' + STAR + '</span>';
    screen.innerHTML = '<section class="results"><p class="eyebrow">' + esc(t('lessonName')) + '</p><h1>' + esc(t('done')) + '</h1>' +
      '<div class="big-stars" role="img" aria-label="' + earned + ' / 3">' + stars + '</div>' +
      '<div class="score"><bdi class="math" dir="ltr">' + c + ' / ' + n + '</bdi></div><p>' + esc(t('score', { c: c, n: n })) + '</p>' +
      '<div class="actions"><button type="button" class="btn gold" id="retry">' + esc(t('retry')) + '</button><button type="button" class="btn ghost" id="home">' + esc(t('back')) + '</button></div></section>';
    document.getElementById('retry').addEventListener('click', function () { state.index = 0; state.firstTry = 0; state.attemptsOnQ = 0; state.answered = false; state.hintShown = false; state.screen = 'quiz'; render(); screen.focus(); });
    document.getElementById('home').addEventListener('click', function () { if (malek) malek.goodbye(); /* real event: student leaves the finished lesson */ state.index = 0; state.firstTry = 0; state.screen = 'home'; render(); screen.focus(); });
  }

  /* ---- Malek: welcome first, then the always-on buddy ---- */
  var malek = null;
  applyLang();
  render();
  malek = window.IEEMalek ? window.IEEMalek.init({
    appId: 'math-adventure-fractions',
    appName: { en: T.en.app, ar: T.ar.app, de: T.de.app },
    subject: { en: T.en.subject, ar: T.ar.subject, de: T.de.subject },
    subjectLabel: { en: T.en.subjectLabel, ar: T.ar.subjectLabel, de: T.de.subjectLabel },
    lang: state.lang,
    assetsBase: 'iee-malek/assets/',
    appRoot: '#app',
    showLanguageSwitch: true,
    inactivityMs: 30000,
    onLanguageChange: function (lang) { setLang(lang, true); },
    onStart: function () { screen.focus(); }
  }) : null;
  window.__pilot = { state: state, Q: Q, malek: malek };
})();
