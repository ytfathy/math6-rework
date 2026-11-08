# IEE Malek — integration guide (v1.1.0)

Malek is the official International Education Egypt learning buddy. This module adds him to any IEE educational app:

**WELCOME (animated, spoken, subtitled) → START button → MAIN APP → Malek docked bottom-right on every screen, reacting to real student actions.**

It has no dependencies and works in plain HTML, React, Vue, Svelte or Angular.

> Do not redraw, restyle or replace Malek. Only use the approved renders in `assets/`. New poses must be rendered from the approved master (Canva media `MAHaSFwA_Rw`) and dropped into `assets/` under the names listed below.

---

## 1. Add the files

Copy the whole `iee-malek/` folder into the app's public/static folder, then:

```html
<link rel="stylesheet" href="iee-malek/iee-malek.css">
<script src="iee-malek/iee-malek.js"></script>
```

Optional brand fonts (the module falls back to system fonts if they can't load):

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@600;700;800&family=Readex+Pro:wght@400;500;600&display=swap">
```

## 2. Start Malek once, when the app loads

```js
const malek = IEEMalek.init({
  appId: 'science-explorers-g5',             // unique per app (keeps settings separate)
  appName:  { en: 'Science Explorers', ar: 'مستكشفو العلوم', de: 'Wissenschafts-Entdecker' },
  subject:  { en: 'the water cycle', ar: 'دورة الماء', de: 'den Wasserkreislauf' },   // read inside the welcome sentence
  subjectLabel: { en: 'Science · Grade 5', ar: 'العلوم · الصف الخامس', de: 'Sachkunde · Klasse 5' },
  lang: 'en',                                 // the app's active language: 'en' | 'ar' | 'de'
  assetsBase: 'iee-malek/assets/',
  appRoot: '#app',                            // locked (inert) until the student presses START
  showLanguageSwitch: true,                   // EN / العربية / DE on the welcome screen
  inactivityMs: 30000,                        // offer help after 30 s without activity on a question
  onLanguageChange: (lang) => app.setLanguage(lang),  // welcome-screen language buttons → your app
  onStart: () => app.start()                  // called only when START is pressed
});
```

**Write `subject` so it fits the sentence in each language.** For example, German "wenn wir **den Wasserkreislauf** entdecken" and Arabic "ونحن نستكشف **دورة الماء**". Never put Math wording in a non-Math app.

## 3. Connect Malek to REAL events (never simulated)

Call these exactly where your app already decides the outcome:

| Student action (in your code) | Call | What Malek does |
|---|---|---|
| A new question is displayed | `malek.questionShown(id)` | Starts the help timer for this question |
| Answer checked: correct | `malek.correct()` | Happy pose + "Excellent! Keep going!" (praise lines have a 12 s cooldown). Every 3rd answer in a row: celebration + confetti |
| Answer checked: wrong | `malek.incorrect()` | Supportive pose + "Try again! Don't give up!" (varied lines) |
| Student presses Hint / Help | `malek.help()` | Curious pose + "I'm here to help you!" |
| Student is working on a hard item | `malek.think()` | Thinking pose (thought bubble) + "Take your time." (20 s cooldown) |
| Real progress milestone (e.g. half the questions done) | `malek.milestone('half')` | Proud pose (rosette, glowing compass) + "You're doing amazing!" (once per key) |
| Lesson finished | `malek.lessonComplete()` | Achievement pose (trophy) + confetti + "Fantastic! You did it!" |
| Level / mission finished | `malek.levelComplete()` | Big celebration (jump) + "You did it! Mission completed!" |
| Student leaves a finished lesson / ends the session | `malek.goodbye()` | Goodbye pose (wave) + "Great work today! See you soon!" |
| Leaving a question screen (results, menus) | `malek.questionClosed()` | Stops help offers off-question |
| App language changed | `malek.setLanguage('ar')` | Bubbles, labels, voice and RTL switch immediately |
| Lesson narration / video starts or stops | `malek.setNarrationActive(true / false)` | Malek stays silent so audio never overlaps |

You can dispatch DOM events instead of calling the API, which is handy in frameworks:

```js
document.dispatchEvent(new CustomEvent('iee:answer', { detail: { correct: isRight } }));
// also: iee:help, iee:milestone {key}, iee:lesson-complete, iee:level-complete, iee:goodbye,
//       iee:question {id}, iee:language {lang}, iee:narration {active}
```

### React example

```jsx
useEffect(() => {
  window.malek = IEEMalek.init({ /* options above */, onStart: () => setStarted(true) });
}, []);
// in your answer handler:
if (isRight) window.malek.correct(); else window.malek.incorrect();
```

## 4. What the student gets (built in)

- **Welcome:** waving Malek, a spoken message with word-by-word subtitles, then the START button. There are Replay, Mute and "Hear Malek" controls. On later visits the welcome is shorter ("Welcome back…") with a "Play the full welcome" link, and START is still required.
- **Always-on buddy:** docked bottom-right (also in Arabic apps).
  - Full figure on desktop and tablet; a round avatar on phones and short screens.
  - Never covers content. He switches to the compact avatar when space is tight, lifts above fixed bottom bars, and scrolls new feedback into view.
  - Minimise and restore are remembered per app.
- **Languages:** English, Modern Standard Arabic (RTL) and German. Each reaction has 2–4 natural variations and never repeats the same line twice in a row.
- **Voice:** the browser's built-in speech (Web Speech API). Malek only speaks with a voice that matches the language. If none exists, for example no Arabic voice on the device, he shows subtitles only and never uses the wrong accent. Mute is remembered.
- **Accessibility:** captions always shown; screen-reader live region; keyboard focus moves to START; all touch targets 44px or more; `prefers-reduced-motion` removes all animation.
- **Resilience:** if images, audio or animation fail, the app still works.

## 5. Approved assets (`assets/`)

| File | Pose | Used for |
|---|---|---|
| `welcome-hero.png` | Waving, waist-up | Welcome screen |
| `welcome.png` | Waving, full body | Spare welcome pose |
| `idle.png` | Relaxed standing (master) | Docked idle |
| `happy.png` | Fist pump | Correct answer |
| `celebrate.png` | Jumping | Streaks, level complete |
| `encouraging.png` | Thumbs-up | `malek.encourage()` |
| `supportive.png` | Hands on heart | Wrong answer |
| `curious.png` | Asking | Help offer |
| `thinking.png` | Curious render + thought bubble | `malek.think()` |
| `proud.png` | Hands-on-heart render + rosette, glowing compass | Milestones |
| `achievement.png` | Fist-pump render + trophy, rays, confetti | Lesson complete |
| `goodbye.png` | Waving render + wave lines | `malek.goodbye()` |
| `explaining.png` | Pointing | `malek.explain()` |
| `avatar.png` | Face close-up, round | Compact / minimised button |
| `iee-logo-official.png` | Official IEE logo, unmodified | Welcome screen header |

Thinking, Proud, Achievement and Goodbye are built from approved renders with code-drawn props only (Malek himself is untouched). If dedicated renders are made later, save them in `assets/` and point the entry in `POSES` (top of `iee-malek.js`) at the new file. Three-quarter and side views don't exist yet; they need new renders and aren't used by the module.

## 6. QA checklist for every new app (from the project rules)

1. Welcome appears before the app, and the app can't be used until START.
2. Welcome names the real app and subject in the active language.
3. START works, and nothing auto-advances.
4. Malek is present on every major screen and doesn't replay the welcome when the student changes screens.
5. Correct and incorrect reactions fire from the real answer check.
6. Switching language updates Malek immediately, including RTL for Arabic.
7. Malek covers nothing at 390 px (phone), 820 px (tablet), 1024×640 (short laptop) and 1440 px (desktop).
8. Replay, mute, minimise and restore work, and subtitles are always visible.
9. Malek looks identical to the approved character: only files from `assets/`.

The pilot's automated tests (`tests/test_pilot.py`, `tests/test_voice.py`) can be copied and adapted for each app.
