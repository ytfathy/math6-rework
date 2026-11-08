/*!
 * IEE Malek v1.0.0: the official International Education Egypt learning buddy.
 * Reusable components: IEEWelcomeScreen (opening experience) and IEELearningBuddy (always-on companion).
 * No dependencies. Works in any page: plain HTML, React, Vue, Svelte (call from an effect / onMounted).
 * Character: Malek (approved design). Only the approved renders in ./assets are used; never redraw him.
 */
(function (global) {
  'use strict';

  var VERSION = '1.1.0';
  var LANGS = ['en', 'ar', 'de'];

  /* ------------------------------------------------------------------ */
  /* Approved pose library (renders of the approved Malek character).     */
  /* ------------------------------------------------------------------ */
  var POSES = {
    idle: 'idle.png',
    welcome: 'welcome.png',
    hero: 'welcome-hero.png',
    happy: 'happy.png',
    celebrate: 'celebrate.png',
    encourage: 'encouraging.png',
    support: 'supportive.png',
    curious: 'curious.png',
    explain: 'explaining.png',
    // Expression composites built from the approved renders (Malek himself is unchanged;
    // only code-drawn props are added): thought bubble, rosette + glowing compass, trophy, wave lines.
    think: 'thinking.png',
    proud: 'proud.png',
    achievement: 'achievement.png',
    goodbye: 'goodbye.png',
    avatar: 'avatar.png'
  };

  /* ------------------------------------------------------------------ */
  /* UI strings and spoken lines (EN, Modern Standard Arabic, DE).        */
  /* ------------------------------------------------------------------ */
  var UI = {
    en: { speaker: 'Malek', start: 'START YOUR ADVENTURE', replay: 'Replay', mute: 'Mute', unmute: 'Sound on', listen: 'Hear Malek',
      hint: 'Press start when you’re ready.', full: 'Play the full welcome', hide: 'Hide Malek', show: 'Show Malek',
      buddy: 'Malek, your learning buddy', muteBuddy: 'Mute Malek', unmuteBuddy: 'Unmute Malek', welcomeLabel: 'Welcome from Malek' },
    ar: { speaker: 'مالك', start: 'ابدأ المغامرة', replay: 'إعادة', mute: 'كتم الصوت', unmute: 'تشغيل الصوت', listen: 'استمع إلى مالك',
      hint: 'اضغط «ابدأ» عندما تكون مستعداً.', full: 'شاهد الترحيب كاملاً', hide: 'إخفاء مالك', show: 'إظهار مالك',
      buddy: 'مالك، رفيقك في التعلّم', muteBuddy: 'كتم صوت مالك', unmuteBuddy: 'تشغيل صوت مالك', welcomeLabel: 'ترحيب من مالك' },
    de: { speaker: 'Malek', start: 'ABENTEUER STARTEN', replay: 'Nochmal', mute: 'Ton aus', unmute: 'Ton an', listen: 'Malek anhören',
      hint: 'Drück auf Start, wenn du bereit bist.', full: 'Ganze Begrüßung abspielen', hide: 'Malek ausblenden', show: 'Malek einblenden',
      buddy: 'Malek, dein Lernbegleiter', muteBuddy: 'Malek stumm schalten', unmuteBuddy: 'Malek Ton an', welcomeLabel: 'Begrüßung von Malek' }
  };

  var LINES = {
    welcome: {
      en: ['Hello, superstar! Welcome to {app}! I’m Malek, your learning buddy, and I’ll be with you every step of the way as we explore {subject}. Are you ready to learn, play and become a champion?'],
      ar: ['مرحباً يا بطل! أهلاً بك في {app}! أنا مالك، رفيقك في رحلة التعلّم، وسأكون معك في كل خطوة ونحن نستكشف {subject}. هل أنت مستعد؟'],
      de: ['Hallo, Superstar! Willkommen bei „{app}“! Ich bin Malek, dein Lernbegleiter, und ich helfe dir bei jedem Schritt, wenn wir {subject} entdecken. Bist du bereit?']
    },
    welcomeBack: {
      en: ['Welcome back to {app}, superstar! Ready for more {subject}?'],
      ar: ['أهلاً بعودتك إلى {app} يا بطل! هل أنت مستعد لمزيد من {subject}؟'],
      de: ['Willkommen zurück bei „{app}“, Superstar! Bereit für mehr {subject}?']
    },
    correct: {
      en: ['Excellent! Keep going!', 'Brilliant! Keep going!', 'Yes! You got it!', 'Great thinking!'],
      ar: ['ممتاز! استمر!', 'رائع! واصل التقدّم!', 'أحسنت! إجابة صحيحة!', 'تفكير رائع!'],
      de: ['Ausgezeichnet! Weiter so!', 'Super! Mach weiter so!', 'Ja! Richtig!', 'Toll überlegt!']
    },
    streak: {
      en: ['{n} in a row! You’re on fire!', '{n} correct in a row! Amazing!'],
      ar: ['{n} إجابات صحيحة متتالية! أنت رائع!', '{n} إجابات صحيحة على التوالي! مذهل!'],
      de: ['{n} richtig hintereinander! Super!', '{n} Treffer am Stück! Klasse!']
    },
    incorrect: {
      en: ['Try again! Don’t give up!', 'Not quite. You can do it!', 'Almost! Have another go.'],
      ar: ['حاول مرة أخرى! لا تستسلم!', 'ليس تماماً، يمكنك فعلها!', 'اقتربت! جرّب مرة أخرى.'],
      de: ['Versuch es nochmal! Gib nicht auf!', 'Nicht ganz. Du schaffst das!', 'Fast! Probier es noch einmal.']
    },
    help: {
      en: ['I’m here to help you!', 'Need a little help? I’m here!'],
      ar: ['أنا هنا لمساعدتك!', 'هل تحتاج إلى مساعدة؟ أنا هنا!'],
      de: ['Ich bin da, um dir zu helfen!', 'Brauchst du Hilfe? Ich bin da!']
    },
    milestone: {
      en: ['You’re doing amazing!', 'You’re halfway there! Amazing work!'],
      ar: ['أداؤك مذهل!', 'وصلت إلى منتصف الطريق! عمل رائع!'],
      de: ['Du machst das großartig!', 'Schon die Hälfte geschafft! Super!']
    },
    think: {
      en: ['Take your time. Think it through.'],
      ar: ['خذ وقتك، وفكّر جيداً.'],
      de: ['Lass dir Zeit und denk in Ruhe nach.']
    },
    lessonComplete: {
      en: ['Fantastic! You did it!', 'Lesson complete! Amazing work!'],
      ar: ['رائع! لقد نجحت!', 'أكملت الدرس! عمل مذهل!'],
      de: ['Fantastisch! Du hast es geschafft!', 'Lektion geschafft! Super gemacht!']
    },
    levelComplete: {
      en: ['You did it! Mission completed!'],
      ar: ['لقد فعلتها! أكملت المهمة!'],
      de: ['Geschafft! Mission erfüllt!']
    },
    goodbye: {
      en: ['Great work today! See you soon!', 'Bye for now, superstar!'],
      ar: ['عمل رائع اليوم! أراك قريباً!', 'إلى اللقاء يا بطل!'],
      de: ['Toll gemacht heute! Bis bald!', 'Tschüss, Superstar!']
    }
  };

  var VOICE_LANG = { en: 'en-US', ar: 'ar-SA', de: 'de-DE' };

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                        */
  /* ------------------------------------------------------------------ */
  function store(appId) {
    var prefix = 'iee-malek:' + appId + ':';
    return {
      get: function (k, d) { try { var v = global.localStorage.getItem(prefix + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
      set: function (k, v) { try { global.localStorage.setItem(prefix + k, JSON.stringify(v)); } catch (e) { /* storage unavailable: keep defaults */ } }
    };
  }
  function prefersReducedMotion() {
    try { return global.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function fill(str, params) {
    return String(str).replace(/\{(\w+)\}/g, function (_, k) { return params && params[k] != null ? params[k] : ''; });
  }
  function localized(val, lang) {
    if (val && typeof val === 'object') return val[lang] || val.en || '';
    return val || '';
  }
  var ICONS = {
    replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>',
    muted: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6"/><path d="m17 9 6 6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>'
  };

  /* ------------------------------------------------------------------ */
  /* Voice: Web Speech API. Never overlaps, never speaks the wrong        */
  /* language, silently falls back to subtitles when unavailable.          */
  /* ------------------------------------------------------------------ */
  function Voice() {
    this.synth = global.speechSynthesis || null;
    this.voices = [];
    var self = this;
    if (this.synth) {
      var load = function () { try { self.voices = self.synth.getVoices() || []; } catch (e) { self.voices = []; } };
      load();
      try { this.synth.addEventListener('voiceschanged', load); } catch (e) { /* older browsers */ }
    }
  }
  Voice.prototype.voiceFor = function (lang) {
    var want = VOICE_LANG[lang] || lang, pre = want.slice(0, 2).toLowerCase();
    var list = this.voices.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(pre) === 0; });
    if (!list.length) return null;
    var exact = list.filter(function (v) { return (v.lang || '').toLowerCase() === want.toLowerCase(); });
    // Malek is a ~10-12 year old boy: prefer a male voice (browsers expose no gender, so match by name), pitched up in speak().
    var boy = /child|kid|boy|junior|shakir|hamed|naayf|guy|andrew|brian|christopher|eric|david|mark|ryan|thomas|daniel|alex|aaron|fred|\bmale\b/i;
    var pool = exact.length ? exact : list;
    return pool.filter(function (v) { return boy.test(v.name) && !/female/i.test(v.name); })[0] || pool[0];
  };
  Voice.prototype.canSpeak = function (lang, text) { return !!(this.clips ? (!text || this.clips[text]) : (this.synth && this.voiceFor(lang))); };
  Voice.prototype.cancel = function () {
    if (this.audio) { try { this.audio.pause(); } catch (e) { /* ignore */ } this.audio = null; }
    try { if (this.synth) this.synth.cancel(); } catch (e) { /* ignore */ }
  };
  /* Recorded clips (opts.voiceClips: exact line text -> mp3 URL) play Malek's real kid voice. */
  Voice.prototype.playClip = function (url, text, hooks) {
    this.cancel();
    var a = this.audio = new global.Audio(url), self = this;
    a.onplaying = function () { if (hooks.start) hooks.start(); };
    // No word events for audio: map playback progress onto the text for the subtitles.
    a.ontimeupdate = function () { if (hooks.boundary && a.duration) hooks.boundary(Math.floor(text.length * a.currentTime / a.duration)); };
    a.onended = function () { if (self.audio === a) self.audio = null; if (hooks.end) hooks.end(); };
    a.onerror = function () { if (hooks.error) hooks.error(); };
    var p = a.play(); if (p && p.catch) p.catch(function () { if (hooks.error) hooks.error(); });
    return true;
  };
  /* Returns false when the line cannot be spoken (no API or no voice for the language). */
  Voice.prototype.speak = function (text, lang, hooks) {
    hooks = hooks || {};
    if (this.clips) return this.clips[text] && global.Audio ? this.playClip(this.clips[text], text, hooks) : false; // clips set: never fall back to an adult TTS voice
    var v = this.voiceFor(lang);
    if (!this.synth || !v) return false;
    this.cancel();
    try {
      var u = new global.SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang; u.rate = lang === 'ar' ? 1.0 : 1.08; u.pitch = 1.55 + Math.random() * 0.15; u.volume = 1; // young, upbeat kid voice; small pitch wobble keeps it lively
      u.onstart = function () { if (hooks.start) hooks.start(); };
      u.onboundary = function (e) { if (hooks.boundary && e.name !== 'sentence') hooks.boundary(e.charIndex); };
      u.onend = function () { if (hooks.end) hooks.end(); };
      u.onerror = function () { if (hooks.error) hooks.error(); };
      this.synth.speak(u);
      return true;
    } catch (e) { return false; }
  };

  /* ------------------------------------------------------------------ */
  /* Core: shared state between the welcome screen and the buddy          */
  /* ------------------------------------------------------------------ */
  function Core(opts) {
    this.opts = opts;
    this.appId = opts.appId || 'iee-app';
    this.store = store(this.appId);
    this.lang = LANGS.indexOf(opts.lang) >= 0 ? opts.lang : 'en';
    this.muted = this.store.get('muted', false);
    this.narration = false;
    this.voice = new Voice();
    this.voice.clips = opts.voiceClips || null;
    this.base = (opts.assetsBase || './iee-malek/assets/').replace(/\/?$/, '/');
    this.bags = {};
    this.forcedReduced = !!opts.reducedMotion;
    this.listeners = {};
    this.events = [];
  }
  Core.prototype.t = function (key) { return (UI[this.lang] || UI.en)[key]; };
  Core.prototype.asset = function (pose) { return this.base + (POSES[pose] || POSES.idle); };
  Core.prototype.params = function () {
    return { app: localized(this.opts.appName, this.lang), subject: localized(this.opts.subject, this.lang) };
  };
  /* Varied lines without immediate repeats ("shuffle bag"). */
  Core.prototype.line = function (cat, extra) {
    var pool = (LINES[cat] && (LINES[cat][this.lang] || LINES[cat].en)) || [''];
    var key = cat + ':' + this.lang, bag = this.bags[key];
    if (!bag || !bag.length) {
      bag = pool.map(function (_, i) { return i; });
      for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
      if (this.bags['last:' + key] === bag[bag.length - 1] && bag.length > 1) bag.unshift(bag.pop());
      this.bags[key] = bag;
    }
    var idx = bag.pop();
    this.bags['last:' + key] = idx;
    var p = this.params(); if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return { text: fill(pool[idx], p), cat: cat, idx: idx, extra: extra };
  };
  /* Re-render an already chosen line in another language (same meaning). */
  Core.prototype.relocalize = function (ln) {
    if (!ln) return ln;
    var pool = (LINES[ln.cat] && (LINES[ln.cat][this.lang] || LINES[ln.cat].en)) || [''];
    var p = this.params(); if (ln.extra) Object.keys(ln.extra).forEach(function (k) { p[k] = ln.extra[k]; });
    return { text: fill(pool[Math.min(ln.idx, pool.length - 1)], p), cat: ln.cat, idx: ln.idx, extra: ln.extra };
  };
  Core.prototype.reduced = function () { return this.forcedReduced || prefersReducedMotion(); };
  Core.prototype.setMuted = function (m) {
    this.muted = !!m; this.store.set('muted', this.muted);
    if (this.muted) this.voice.cancel();
    this.emit('mute', this.muted);
  };
  /* Activity log: lets QA (and app analytics) see exactly what Malek did and why. */
  Core.prototype.log = function (type, data) {
    var e = { type: type, t: Date.now() }; if (data) Object.keys(data).forEach(function (k) { e[k] = data[k]; });
    this.events.push(e); if (this.events.length > 200) this.events.shift();
    this.emit('log', e);
  };
  Core.prototype.on = function (ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); };
  Core.prototype.emit = function (ev, data) { (this.listeners[ev] || []).forEach(function (fn) { try { fn(data); } catch (e) { /* keep app alive */ } }); };
  /* Speak only when allowed: not muted, no lesson narration playing, voice exists for the language. */
  Core.prototype.speak = function (text, hooks) {
    if (this.muted || this.narration) return false;
    return this.voice.speak(text, this.lang, hooks);
  };

  /* ------------------------------------------------------------------ */
  /* IEEWelcomeScreen                                                     */
  /* ------------------------------------------------------------------ */
  function IEEWelcomeScreen(core, onStart) {
    this.core = core; this.onStart = onStart; this.timer = null; this.revealed = 0; this.words = [];
    this.returning = !!core.store.get('welcomed', false) && core.opts.shortWelcomeOnReturn !== false;
    this.forceFull = false; this.closed = false;
    this.build();
  }
  IEEWelcomeScreen.prototype.build = function () {
    var c = this.core, self = this;
    this.logo = el('img', { class: 'iee-m-w-logo', src: c.opts.logoSrc || c.base + 'iee-logo-official.png', alt: 'International Education Egypt' });
    this.appName = el('strong'); this.subjectEl = el('span');
    this.btnReplay = el('button', { type: 'button', class: 'iee-m-btn', onclick: function () { self.forceFull = true; self.play(true); } });
    this.btnMute = el('button', { type: 'button', class: 'iee-m-btn iee-m-mute', onclick: function () { c.setMuted(!c.muted); if (!c.muted) self.play(true); } });
    this.btnListen = el('button', { type: 'button', class: 'iee-m-btn', hidden: 'hidden', onclick: function () { if (c.muted) c.setMuted(false); self.play(true); } });
    this.langGroup = el('div', { class: 'iee-m-w-controls', role: 'group' });
    if (c.opts.showLanguageSwitch) {
      LANGS.forEach(function (l) {
        var b = el('button', { type: 'button', class: 'iee-m-btn', 'data-lang': l, text: l === 'ar' ? 'العربية' : l.toUpperCase(), onclick: function () { if (c.controller) c.controller.setLanguage(l); } });
        self.langGroup.appendChild(b);
      });
    }
    this.figure = el('img', { class: 'iee-m-w-figure', src: c.asset('hero'), alt: '' });
    // Lip-synced welcome (opts.welcomeVideos: { en: url, ar: url }, transparent WebM). Muted: the voice clip carries the sound.
    this.video = el('video', { class: 'iee-m-w-figure iee-m-w-video', muted: '', playsinline: '', preload: 'auto', 'aria-hidden': 'true' });
    this.video.muted = true;
    this.video.addEventListener('playing', function () { self.root.classList.add('iee-m-lipsync'); });
    this.video.addEventListener('error', function () { self.root.classList.remove('iee-m-lipsync'); });
    this.speaker = el('span', { class: 'iee-m-w-speaker' });
    this.lineEl = el('p', { class: 'iee-m-w-line', 'aria-hidden': 'true' });
    this.srLine = el('p', { class: 'iee-m-sr', 'aria-live': 'polite' });
    this.btnStart = el('button', { type: 'button', class: 'iee-m-start', hidden: 'hidden', onclick: function () { self.start(); } });
    this.btnFull = el('button', { type: 'button', class: 'iee-m-linkbtn', hidden: 'hidden', onclick: function () { self.forceFull = true; self.play(true); } });
    this.hint = el('span', { class: 'iee-m-w-hint' });

    this.root = el('section', { class: 'iee-m-welcome', role: 'dialog', 'aria-modal': 'true' }, [
      el('div', { class: 'iee-m-w-top' }, [
        el('div', { class: 'iee-m-w-brand' }, [this.logo, el('div', { class: 'iee-m-w-app' }, [this.appName, this.subjectEl])]),
        el('div', { class: 'iee-m-w-controls' }, [this.langGroup, this.btnListen, this.btnReplay, this.btnMute])
      ]),
      el('div', { class: 'iee-m-w-stage' }, [
        el('div', { class: 'iee-m-w-hero' }, [el('div', { class: 'iee-m-w-arch' }, [this.figure, this.video])]),
        el('div', { class: 'iee-m-w-copy' }, [
          el('div', { class: 'iee-m-w-bubble' }, [this.speaker, this.lineEl, this.srLine]),
          el('div', { class: 'iee-m-w-actions' }, [this.btnStart, this.hint, this.btnFull])
        ])
      ])
    ]);
    c.on('mute', function () { self.labels(); });
  };
  IEEWelcomeScreen.prototype.labels = function () {
    var c = this.core, p = c.params();
    this.root.setAttribute('lang', c.lang); this.root.setAttribute('dir', c.lang === 'ar' ? 'rtl' : 'ltr');
    this.root.setAttribute('aria-label', c.t('welcomeLabel'));
    this.appName.textContent = p.app;
    this.subjectEl.textContent = localized(c.opts.subjectLabel, c.lang) || p.subject;
    this.speaker.textContent = c.t('speaker');
    this.btnReplay.innerHTML = ICONS.replay + '<span></span>'; this.btnReplay.lastChild.textContent = c.t('replay');
    this.btnMute.innerHTML = (c.muted ? ICONS.muted : ICONS.sound) + '<span></span>';
    this.btnMute.lastChild.textContent = c.muted ? c.t('unmute') : c.t('mute');
    this.btnMute.setAttribute('aria-pressed', c.muted ? 'true' : 'false');
    this.btnListen.innerHTML = ICONS.sound + '<span></span>'; this.btnListen.lastChild.textContent = c.t('listen');
    this.btnStart.innerHTML = '<span></span>' + ICONS.arrow; this.btnStart.firstChild.textContent = c.t('start');
    this.btnFull.textContent = c.t('full');
    this.hint.textContent = c.t('hint');
    this.langGroup.setAttribute('aria-label', 'Language');
    Array.prototype.forEach.call(this.langGroup.children, function (b) {
      var on = b.getAttribute('data-lang') === c.lang;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.style.background = on ? 'var(--iee-m-blue)' : ''; b.style.color = on ? '#FFFFFF' : '';
    });
  };
  IEEWelcomeScreen.prototype.open = function () {
    document.body.appendChild(this.root);
    this.previousFocus = document.activeElement;
    this.labels();
    this.play(false);
  };
  IEEWelcomeScreen.prototype.currentLine = function () {
    var cat = (this.returning && !this.forceFull) ? 'welcomeBack' : 'welcome';
    return this.core.line(cat);
  };
  IEEWelcomeScreen.prototype.play = function (userGesture) {
    var c = this.core, self = this;
    clearInterval(this.timer); c.voice.cancel();
    this.labels();
    var ln = this.currentLine();
    // Only the full welcome has a matching lip-sync video; any other line keeps the still render.
    var vid = ln.cat === 'welcome' && c.opts.welcomeVideos && c.opts.welcomeVideos[c.lang];
    this.lipsync(false);
    if (!vid) this.root.classList.remove('iee-m-lipsync');
    else if (this.video.getAttribute('src') !== vid) { this.root.classList.remove('iee-m-lipsync'); this.video.src = vid; this.video.load(); }
    this.words = ln.text.split(/\s+/);
    this.lineEl.innerHTML = '';
    this.words.forEach(function (w, i) {
      self.lineEl.appendChild(el('span', { class: 'iee-m-word', text: w }));
      if (i < self.words.length - 1) self.lineEl.appendChild(document.createTextNode(' '));
    });
    this.srLine.textContent = ln.text;
    this.revealed = 0;
    this.btnStart.hidden = true; this.btnStart.classList.remove('iee-m-show');
    this.btnFull.hidden = !(this.returning && !this.forceFull);
    this.root.classList.toggle('iee-m-reduced', c.reduced());
    this.root.classList.remove('iee-m-anim'); void this.root.offsetWidth; this.root.classList.add('iee-m-anim');

    if (c.reduced()) { this.reveal(this.words.length); this.finish(); }
    // Subtitle timing: about 2.6 words per second (EN/DE), 2.2 (AR); speech boundaries can only move it forward.
    var perWord = c.lang === 'ar' ? 450 : 380, startDelay = c.reduced() ? 0 : 650;
    var started = Date.now() + startDelay;
    var offsets = []; var acc = 0; this.words.forEach(function (w) { offsets.push(acc); acc += w.length + 1; });
    var spoke = false, voiceStarted = false;
    this.timer = setInterval(function () {
      var byTime = Math.floor((Date.now() - started) / perWord);
      if (byTime > self.revealed) self.reveal(byTime);
      if (self.revealed >= self.words.length && !voiceStarted) { clearInterval(self.timer); self.finish(); }
    }, 90);
    setTimeout(function () {
      spoke = c.speak(ln.text, {
        start: function () { voiceStarted = true; self.root.classList.add('iee-m-speaking'); self.btnListen.hidden = true; if (vid) self.lipsync(true); },
        boundary: function (ci) { var k = 0; while (k < offsets.length && offsets[k] <= ci) k++; if (k > self.revealed) self.reveal(k); },
        end: function () { voiceStarted = false; self.root.classList.remove('iee-m-speaking'); self.lipsync(false); self.reveal(self.words.length); clearInterval(self.timer); self.finish(); },
        error: function () { voiceStarted = false; self.root.classList.remove('iee-m-speaking'); self.lipsync(false); }
      });
      // Browsers block speech until the student has interacted: offer a "Hear Malek" button.
      if (spoke) setTimeout(function () { if (!voiceStarted) { c.voice.cancel(); self.lipsync(false); self.btnListen.hidden = false; } }, 1200);
      else self.btnListen.hidden = !(c.voice.canSpeak(c.lang, ln.text) && !c.muted && !userGesture) ;
    }, startDelay);
  };
  /* Start the talking video in step with the voice, or go back to the still render. */
  IEEWelcomeScreen.prototype.lipsync = function (on) {
    var v = this.video;
    // Stopping keeps the paused video frame on screen: its framing differs a little from the still, so swapping back would jump.
    if (!on) { try { v.pause(); } catch (e) { /* ignore */ } return; }
    try { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () { /* still render stays */ }); } catch (e) { /* ignore */ }
  };
  IEEWelcomeScreen.prototype.reveal = function (n) {
    var spans = this.lineEl.querySelectorAll('.iee-m-word');
    for (var i = this.revealed; i < Math.min(n, spans.length); i++) spans[i].classList.add('iee-m-on');
    this.revealed = Math.min(n, spans.length);
  };
  IEEWelcomeScreen.prototype.finish = function () {
    if (!this.btnStart.hidden) return;
    this.btnStart.hidden = false;
    if (!this.core.reduced()) this.btnStart.classList.add('iee-m-show');
    try { this.btnStart.focus({ preventScroll: true }); } catch (e) { this.btnStart.focus(); }
  };
  IEEWelcomeScreen.prototype.start = function () {
    if (this.closed) return;
    this.closed = true;
    clearInterval(this.timer); this.core.voice.cancel();
    this.core.store.set('welcomed', true);
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
    if (this.onStart) this.onStart();
  };
  IEEWelcomeScreen.prototype.relabel = function () { if (!this.closed) this.play(true); };

  /* ------------------------------------------------------------------ */
  /* IEELearningBuddy                                                     */
  /* ------------------------------------------------------------------ */
  var COOLDOWN = { goodbye: 0, correct: 12000, streak: 0, incorrect: 0, help: 0, milestone: 0, think: 20000, lessonComplete: 0, levelComplete: 0 };
  var AVOID = 'button, a[href], input, select, textarea, [role="button"], [role="radio"], [role="checkbox"], [role="tab"], label, h1, h2, h3, p, li, img, svg, table, [role="status"], [role="alert"], [data-iee-avoid], .iee-avoid';

  function IEELearningBuddy(core) {
    this.core = core; this.open = !core.store.get('minimized', false);
    this.compact = false; this.lastSaid = {}; this.lastLine = null; this.hideTimer = null; this.reactTimer = null;
    this.streak = 0; this.helpedFor = null; this.questionKey = null; this.lastActivity = Date.now();
    this.milestones = {}; this.pose = 'idle'; this.lift = 0;
    this.build();
  }
  IEELearningBuddy.prototype.build = function () {
    var c = this.core, self = this;
    this.bubble = el('div', { class: 'iee-m-bubble', role: 'status', 'aria-live': 'polite', hidden: 'hidden' });
    this.figure = el('img', { class: 'iee-m-figure', src: c.asset('idle'), alt: '' });
    this.btnMin = el('button', { type: 'button', class: 'iee-m-icon', html: ICONS.minus, onclick: function () { self.minimize(); } });
    this.btnMute = el('button', { type: 'button', class: 'iee-m-icon', onclick: function () { c.setMuted(!c.muted); } });
    this.body = el('div', { class: 'iee-m-body' }, [el('div', { class: 'iee-m-shadow', 'aria-hidden': 'true' }), this.figure,
      el('div', { class: 'iee-m-tools' }, [this.btnMin, this.btnMute])]);
    this.avatarImg = el('img', { src: c.asset('avatar'), alt: '' });
    this.avatar = el('button', { type: 'button', class: 'iee-m-avatar', onclick: function () { self.avatarClick(); } }, [this.avatarImg]);
    this.root = el('aside', { class: 'iee-m-buddy iee-m-idle' }, [this.bubble, this.body, this.avatar]);
    // Poses with props are wider than the idle figure: re-check overlap whenever a new pose loads.
    this.figure.addEventListener('load', function () { self.layout(); });
    Object.keys(POSES).forEach(function (k) { var i = new Image(); i.src = c.asset(k); }); // preload approved poses
    c.on('mute', function () { self.labels(); if (c.muted) c.voice.cancel(); });
  };
  IEELearningBuddy.prototype.labels = function () {
    var c = this.core;
    this.root.setAttribute('aria-label', c.t('buddy'));
    this.root.setAttribute('lang', c.lang); this.root.setAttribute('dir', c.lang === 'ar' ? 'rtl' : 'ltr');
    this.bubble.setAttribute('dir', c.lang === 'ar' ? 'rtl' : 'ltr');
    this.btnMin.setAttribute('aria-label', c.t('hide')); this.btnMin.title = c.t('hide');
    this.btnMute.innerHTML = c.muted ? ICONS.muted : ICONS.sound;
    this.btnMute.setAttribute('aria-label', c.muted ? c.t('unmuteBuddy') : c.t('muteBuddy'));
    this.btnMute.setAttribute('aria-pressed', c.muted ? 'true' : 'false'); this.btnMute.title = this.btnMute.getAttribute('aria-label');
    this.avatar.setAttribute('aria-label', this.open ? c.t('hide') : c.t('show'));
    this.avatar.title = this.avatar.getAttribute('aria-label');
    this.figure.alt = c.t('buddy');
    if (this.lastLine && !this.bubble.hidden) {
      this.lastLine = c.relocalize(this.lastLine);
      this.bubble.textContent = this.lastLine.text;
    }
  };
  IEELearningBuddy.prototype.mount = function () {
    var self = this;
    document.body.appendChild(this.root);
    document.body.classList.add('iee-m-reserve');
    this.labels(); this.applyOpen();
    if (!this.core.reduced()) { this.root.classList.add('iee-m-enter'); setTimeout(function () { self.root.classList.remove('iee-m-enter'); }, 700); }
    var raf = null, schedule = function () { if (raf) return; raf = global.requestAnimationFrame(function () { raf = null; self.layout(); }); };
    global.addEventListener('resize', function () { self.fixedCache = null; schedule(); });
    global.addEventListener('scroll', schedule, true);
    try {
      // Re-check when the APP changes screens; ignore the buddy's own updates (prevents feedback loops).
      this.mo = new global.MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
          var t = records[i].target;
          if (self.root.contains(t) || (t.classList && t.classList.contains('iee-m-confetti')) || (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('iee-m-confetti'))) continue;
          self.fixedCache = null; schedule();
          clearTimeout(self.clearTimer); self.clearTimer = setTimeout(function () { self.layout(); self.ensureClear(); }, 120);
          return;
        }
      });
      this.mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
    } catch (e) { /* no observer: resize/scroll still keep it right */ }
    ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(function (ev) { document.addEventListener(ev, function () { self.lastActivity = Date.now(); }, { passive: true, capture: true }); });
    this.idleTimer = setInterval(function () { self.checkInactivity(); }, 3000);
    this.layout();
  };
  /* Responsive sizing + never cover content. */
  IEELearningBuddy.prototype.layout = function () {
    if (!this.root.isConnected) return;
    var vw = global.innerWidth, vh = global.innerHeight, fig;
    if (vw >= 1100 && vh >= 680) fig = 210; else if (vw >= 700 && vh >= 560) fig = 160; else fig = 0;
    var compact = fig === 0;
    // Would the full figure cover an important element right now? Then go compact.
    if (!compact && this.open) {
      var ratio = (this.figure.naturalWidth && this.figure.naturalHeight) ? this.figure.naturalWidth / this.figure.naturalHeight : 0.42;
      var w = Math.max(fig * ratio, 60) + 52, h = fig + 10;
      var r = { left: vw - 14 - w, right: vw - 14, top: vh - 14 - this.lift - h, bottom: vh - 14 - this.lift };
      if (this.overlaps(r)) compact = true;
    }
    // Lift above fixed/sticky bars at the bottom of the screen (host navigation, answer bars).
    var size = compact || !this.open ? 68 : fig;
    var probe = { left: vw - 14 - 90, right: vw - 14, top: vh - 14 - size, bottom: vh - 14 };
    this.lift = this.fixedBarHeight(probe);
    this.root.style.bottom = 'calc(max(14px, env(safe-area-inset-bottom)) + ' + this.lift + 'px)';
    this.compact = compact;
    this.root.classList.toggle('iee-m-compact', compact || !this.open);
    this.root.style.setProperty('--iee-m-fig', (fig || 160) + 'px');
    this.applyOpen();
    var box = this.root.getBoundingClientRect();
    var reserve = Math.max((compact || !this.open ? 68 : fig) + 28 + this.lift, box.height ? Math.round(vh - box.top + 12) : 0);
    document.documentElement.style.setProperty('--iee-m-reserve', reserve + 'px');
  };
  /* When the APP shows something new (feedback, a Next button) and it lands behind Malek,
     scroll it into the clear. The page always has room for this (see --iee-m-reserve). */
  IEELearningBuddy.prototype.ensureClear = function () {
    if (!this.root.isConnected) return;
    var vw = global.innerWidth, vh = global.innerHeight, self = this;
    var parts = this.root.querySelectorAll('.iee-m-bubble:not([hidden]), .iee-m-body:not([hidden]) .iee-m-figure, .iee-m-avatar:not([hidden])');
    var top = vh, left = vw;
    Array.prototype.forEach.call(parts, function (n) { var r = n.getBoundingClientRect(); if (r.width && r.height) { top = Math.min(top, r.top); left = Math.min(left, r.left); } });
    if (top >= vh) return;
    var need = 0, nodes = document.querySelectorAll(this.core.opts.avoidSelector || AVOID);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; if (self.root.contains(n) || n.closest('.iee-m-welcome')) continue;
      var b = n.getBoundingClientRect();
      if (!b.width || !b.height || b.bottom <= 0 || b.top >= vh) continue;
      if (b.right > left && b.left < vw && b.bottom > top && b.top < vh) need = Math.max(need, b.bottom - top + 12);
    }
    if (!need) return;
    var se = document.scrollingElement || document.documentElement;
    var room = se.scrollHeight - vh - (global.pageYOffset || se.scrollTop);
    if (room <= 0) return;
    try { global.scrollBy({ top: Math.min(need, room), behavior: this.core.reduced() ? 'auto' : 'smooth' }); } catch (e) { global.scrollBy(0, Math.min(need, room)); }
  };
  IEELearningBuddy.prototype.overlaps = function (r) {
    var self = this, hit = false;
    var nodes = document.querySelectorAll(this.core.opts.avoidSelector || AVOID);
    for (var i = 0; i < nodes.length && !hit; i++) {
      var n = nodes[i];
      if (self.root.contains(n)) continue;
      var b = n.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      if (b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom) hit = true;
    }
    return hit;
  };
  IEELearningBuddy.prototype.fixedBarHeight = function (probe) {
    var lift = 0, vh = global.innerHeight, self = this;
    if (!this.fixedCache) {
      this.fixedCache = [];
      var all = document.body.querySelectorAll('*');
      for (var j = 0; j < all.length; j++) {
        var m = all[j];
        if (self.root.contains(m) || m.classList.contains('iee-m-confetti') || m.classList.contains('iee-m-welcome')) continue;
        var pos = global.getComputedStyle(m).position;
        if (pos === 'fixed' || pos === 'sticky') this.fixedCache.push(m);
      }
    }
    for (var i = 0; i < this.fixedCache.length; i++) {
      var n = this.fixedCache[i];
      if (!n.isConnected) continue;
      var b = n.getBoundingClientRect();
      if (!b.width || !b.height || b.bottom < vh - 2) continue;
      if (b.right > probe.left && b.left < probe.right && b.top < probe.bottom) lift = Math.max(lift, vh - b.top + 6);
    }
    return Math.min(lift, vh * 0.5);
  };
  IEELearningBuddy.prototype.applyOpen = function () {
    var showFull = this.open && !this.compact;
    this.body.hidden = !showFull;
    this.avatar.hidden = showFull;
    this.root.classList.toggle('iee-m-compact', !showFull);
    this.avatar.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    this.avatar.setAttribute('aria-label', this.open ? this.core.t('hide') : this.core.t('show'));
    if (!this.open) this.bubble.hidden = true;
  };
  IEELearningBuddy.prototype.avatarClick = function () {
    if (!this.open) this.restore();
    else this.minimize();
  };
  IEELearningBuddy.prototype.minimize = function () {
    this.open = false; this.core.store.set('minimized', true); this.core.voice.cancel();
    this.applyOpen(); this.layout(); this.labels();
    try { this.avatar.focus(); } catch (e) { /* ignore */ }
  };
  IEELearningBuddy.prototype.restore = function () {
    this.open = true; this.core.store.set('minimized', false);
    this.applyOpen(); this.layout(); this.labels();
  };
  /* Show a reaction pose; returns to idle afterwards. */
  IEELearningBuddy.prototype.react = function (pose, cls, holdMs) {
    var self = this, c = this.core;
    clearTimeout(this.reactTimer);
    this.figure.src = c.asset(pose); this.pose = pose;
    c.log('pose', { pose: pose });
    this.root.className = this.root.className.replace(/\biee-m-(idle|r-\w+)\b/g, '').trim();
    void this.root.offsetWidth;
    if (!c.reduced()) this.root.classList.add(cls);
    this.reactTimer = setTimeout(function () {
      self.figure.src = c.asset('idle'); self.pose = 'idle';
      self.root.className = self.root.className.replace(/\biee-m-r-\w+\b/g, '').trim();
      self.root.classList.add('iee-m-idle');
    }, holdMs || 2600);
  };
  /* Speech bubble + optional voice, with per-category cooldowns. */
  IEELearningBuddy.prototype.say = function (cat, extra, force) {
    var now = Date.now(), cd = COOLDOWN[cat] || 0, c = this.core, self = this;
    if (!force && this.lastSaid[cat] && now - this.lastSaid[cat] < cd) return false;
    this.lastSaid[cat] = now;
    var ln = c.line(cat, extra); this.lastLine = ln;
    if (!this.open) return true; // minimized: stay quiet, the student chose that
    this.bubble.textContent = ln.text; this.bubble.hidden = false;
    this.bubble.classList.remove('iee-m-in'); void this.bubble.offsetWidth; this.bubble.classList.add('iee-m-in');
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(function () { self.bubble.hidden = true; self.layout(); }, Math.max(3800, ln.text.length * 85));
    c.speak(ln.text);
    c.log('say', { cat: cat, text: ln.text });
    this.layout();
    clearTimeout(this.clearTimer); this.clearTimer = setTimeout(function () { self.layout(); self.ensureClear(); }, 60);
    return true;
  };
  /* ---- Real-event handlers (call these from the app) ---- */
  IEELearningBuddy.prototype.answer = function (isCorrect) {
    if (isCorrect) {
      this.streak++;
      if (this.streak >= 3 && this.streak % 3 === 0) { this.react('celebrate', 'iee-m-r-celebrate', 2400); this.confetti(18); this.say('streak', { n: this.streak }, true); }
      else { this.react('happy', 'iee-m-r-happy', 2000); this.say('correct'); }
    } else {
      this.streak = 0;
      this.react('support', 'iee-m-r-support', 3200); this.say('incorrect', null, true);
    }
    this.lastActivity = Date.now();
  };
  IEELearningBuddy.prototype.help = function () { this.react('curious', 'iee-m-r-help', 3000); this.say('help', null, true); this.helpedFor = this.questionKey; };
  IEELearningBuddy.prototype.explain = function () { this.react('explain', 'iee-m-r-help', 3500); };
  IEELearningBuddy.prototype.think = function () { this.react('think', 'iee-m-r-think', 3000); this.say('think'); };
  IEELearningBuddy.prototype.encourage = function () { this.react('encourage', 'iee-m-r-encourage', 2400); };
  IEELearningBuddy.prototype.milestone = function (key) {
    key = key || 'm';
    if (this.milestones[key]) return false;
    this.milestones[key] = true;
    this.react('proud', 'iee-m-r-encourage', 3000); this.say('milestone', null, true);
    return true;
  };
  IEELearningBuddy.prototype.lessonComplete = function () {
    if (!this.open) this.restore(); // a completed lesson is worth showing up for
    this.react('achievement', 'iee-m-r-celebrate', 4000); this.confetti(36); this.say('lessonComplete', null, true);
  };
  IEELearningBuddy.prototype.levelComplete = function () {
    if (!this.open) this.restore();
    this.react('celebrate', 'iee-m-r-celebrate', 3600); this.confetti(48); this.say('levelComplete', null, true);
  };
  IEELearningBuddy.prototype.goodbye = function () {
    this.react('goodbye', 'iee-m-r-wave', 3200); this.say('goodbye', null, true);
  };
  IEELearningBuddy.prototype.questionShown = function (key) {
    this.questionKey = key == null ? String(Date.now()) : String(key);
    this.lastActivity = Date.now();
  };
  IEELearningBuddy.prototype.checkInactivity = function () {
    var ms = this.core.opts.inactivityMs || 30000;
    if (this.questionKey == null || this.helpedFor === this.questionKey) return;
    if (document.hidden) { this.lastActivity = Date.now(); return; }
    if (Date.now() - this.lastActivity >= ms) this.help();
  };
  IEELearningBuddy.prototype.confetti = function (n) {
    if (this.core.reduced()) return;
    var box = el('div', { class: 'iee-m-confetti', 'aria-hidden': 'true' });
    var colors = ['#F5B90F', '#14A6A0', '#1F3FB0', '#FFFFFF', '#E2A200'];
    for (var i = 0; i < n; i++) {
      var p = el('i');
      p.style.left = (Math.random() * 100) + 'vw'; p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.5) + 's'; p.style.animationDuration = (1.4 + Math.random() * 1.2) + 's';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 3200);
  };

  /* ------------------------------------------------------------------ */
  /* Controller: WELCOME → START → APP → ALWAYS-ON BUDDY                   */
  /* ------------------------------------------------------------------ */
  function init(opts) {
    opts = opts || {};
    var core = new Core(opts);
    var buddy = new IEELearningBuddy(core);
    var appRoots = opts.appRoot ? (typeof opts.appRoot === 'string' ? document.querySelectorAll(opts.appRoot) : [opts.appRoot]) : [];
    function setInert(on) {
      Array.prototype.forEach.call(appRoots, function (r) {
        if (!r) return;
        if (on) { r.setAttribute('inert', ''); r.setAttribute('aria-hidden', 'true'); }
        else { r.removeAttribute('inert'); r.removeAttribute('aria-hidden'); }
      });
    }
    var started = false;
    var welcome = new IEEWelcomeScreen(core, function () {
      started = true; setInert(false);
      buddy.mount();
      if (typeof opts.onStart === 'function') { try { opts.onStart(); } catch (e) { if (global.console) console.error(e); } }
      core.emit('start');
    });

    var api = {
      version: VERSION,
      get language() { return core.lang; },
      get started() { return started; },
      get muted() { return core.muted; },
      setLanguage: function (lang) {
        if (LANGS.indexOf(lang) < 0) return;
        core.lang = lang; core.voice.cancel();
        welcome.relabel(); buddy.labels(); buddy.layout();
        if (typeof opts.onLanguageChange === 'function' && !api._fromApp) { try { opts.onLanguageChange(lang); } catch (e) { /* ignore */ } }
      },
      setMuted: function (m) { core.setMuted(m); },
      setNarrationActive: function (on) { core.narration = !!on; if (on) core.voice.cancel(); },
      answer: function (isCorrect) { if (started) buddy.answer(!!isCorrect); },
      correct: function () { api.answer(true); },
      incorrect: function () { api.answer(false); },
      help: function () { if (started) buddy.help(); },
      explain: function () { if (started) buddy.explain(); },
      think: function () { if (started) buddy.think(); },
      encourage: function () { if (started) buddy.encourage(); },
      milestone: function (key) { return started ? buddy.milestone(key) : false; },
      lessonComplete: function () { if (started) buddy.lessonComplete(); },
      levelComplete: function () { if (started) buddy.levelComplete(); },
      goodbye: function () { if (started) buddy.goodbye(); },
      questionShown: function (key) { if (started) buddy.questionShown(key); },
      questionClosed: function () { buddy.questionKey = null; },
      minimize: function () { buddy.minimize(); },
      restore: function () { buddy.restore(); },
      relayout: function () { buddy.layout(); },
      get log() { return core.events.slice(); },
      _core: core, _buddy: buddy, _welcome: welcome
    };
    core.controller = api;

    // Event bridge: apps can dispatch DOM events instead of calling the API.
    var map = {
      'iee:answer': function (e) { api.answer(e.detail && e.detail.correct); },
      'iee:correct': function () { api.correct(); },
      'iee:incorrect': function () { api.incorrect(); },
      'iee:help': function () { api.help(); },
      'iee:milestone': function (e) { api.milestone(e.detail && e.detail.key); },
      'iee:lesson-complete': function () { api.lessonComplete(); },
      'iee:level-complete': function () { api.levelComplete(); },
      'iee:goodbye': function () { api.goodbye(); },
      'iee:question': function (e) { api.questionShown(e.detail && e.detail.id); },
      'iee:language': function (e) { api._fromApp = true; api.setLanguage(e.detail && e.detail.lang); api._fromApp = false; },
      'iee:narration': function (e) { api.setNarrationActive(e.detail && e.detail.active); }
    };
    Object.keys(map).forEach(function (k) { document.addEventListener(k, map[k]); });

    setInert(true);
    var go = function () { welcome.open(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
    return api;
  }

  var IEEMalek = { init: init, IEEWelcomeScreen: IEEWelcomeScreen, IEELearningBuddy: IEELearningBuddy, POSES: POSES, LINES: LINES, UI: UI, version: VERSION };
  global.IEEMalek = IEEMalek;
  global.IEEWelcomeScreen = IEEWelcomeScreen;
  global.IEELearningBuddy = IEELearningBuddy;
})(typeof window !== 'undefined' ? window : this);
