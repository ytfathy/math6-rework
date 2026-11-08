# Malek pilot: testing report

**Pilot app:** Math Adventure · Fractions (6 real questions with real scoring), built for this pilot because the project contained no existing IEE application.
**Module:** IEE Malek v1.1.0 (`IEEWelcomeScreen` + `IEELearningBuddy`).
**Tested on:** Google Chrome (headless, automated with Playwright), 8 Nov 2026.
**Result:** 108/108 interface checks and 6/6 voice-logic checks pass.

## Results by run

| Run (viewport, language) | Passed |
|---|---|
| desktop | 28/28 |
| tablet | 25/25 |
| mobile | 25/25 |
| laptop-short | 25/25 |
| reduced motion | 1/1 |
| returning visit | 1/1 |
| inactivity | 2/2 |
| help | 1/1 |

Runs:
- desktop: 1440×900, English, with live switches to Arabic and German
- tablet: 820×1180, Arabic (RTL)
- mobile: 390×844, German
- laptop-short: 1024×640, English

## Project QA checklist (Part 7)

| # | Requirement | Status |
|---|---|---|
| 1 | Welcome appears before the main application | Pass: the app is locked (`inert`) until START |
| 2 | Welcome message names the subject and application | Pass in EN, AR and DE |
| 3 | START button works | Pass |
| 4 | Student enters only after pressing START | Pass: START appears only after the welcome line, and nothing auto-advances |
| 5 | Mascot on every major screen | Pass on home, question, feedback and results screens; the welcome does not replay |
| 6 | Correct and incorrect reactions | Pass: triggered by the app's real answer check; the scoring logic is untouched |
| 7 | Language follows the app | Pass: switching mid-lesson updates the bubble, labels, RTL and voice language |
| 8 | Never covers important content | Pass at all 4 sizes, including after feedback appears and when scrolled to the bottom |
| 9 | Voice, subtitles, replay and mute | Subtitles, replay and mute pass. Voice logic passes against a simulated speech engine; see the limits below |
| 10 | Visually identical to the approved character | Pass: only the approved Malek renders are used; nothing is redrawn |

Also verified:
- help offer after 30 s of inactivity, and on the Hint button
- thinking pose (thought bubble) after 12 s on a question
- halfway milestone with the proud pose
- goodbye pose when the student leaves the finished lesson
- 3-in-a-row celebration
- lesson-complete achievement pose (trophy) with confetti
- minimise and restore, remembered between visits
- reduced motion: no animation, full text and START shown at once
- shorter welcome on return visits, with the full one still available and START still required
- no JavaScript errors

## What was NOT verified, and the honest limits

- **Real audio playback** was not heard. Headless Chrome has no speech voices, so the voice code was tested against a simulated engine that checks:
  - the right voice is chosen for each language;
  - lines never overlap;
  - mute and lesson narration silence Malek;
  - Arabic falls back to subtitles when no Arabic voice exists.

  On real devices the voice depends on what the device has installed. Most Windows, macOS, Android and iOS devices have English and German voices, but many have no Arabic voice; those students see subtitles only. Chrome may also block speech until the student taps once; the welcome then shows a "Hear Malek" button.
- **Lip-sync and video:** Malek's welcome is a real animation (he rises in, waves, sways while talking, and subtitles appear word by word) built from the approved renders. It is not a video and has no lip-sync, because no approved video or mouth-shape renders exist yet.
- **New expressions (v1.1.0):** Thinking, Proud, Achievement and Goodbye are composites of approved renders plus code-drawn props (thought bubble, rosette and glowing compass, trophy, wave lines). Tests confirm each shows on its real event: thinking after 12 s on a question, proud at the halfway milestone, achievement on lesson complete, goodbye when the student leaves the finished lesson; the wider goodbye pose was checked for overlap on all four screen sizes. Three-quarter and side views were not made: they need new 3D renders.
- **Image sharpness:** the poses are previews about 330 px tall, which look soft when enlarged on large screens. Exporting the full-resolution renders from Canva and replacing the files in `assets/` fixes this with no code changes.
- **Fonts:** the test environment can't load Google Fonts, so the screenshots use fallback fonts. Real devices load the brand fonts.
- **Browsers:** only Chrome was automated. Safari and Firefox were not run.

## Checks in detail

- PASS: [desktop] welcome appears before the app; app is inert until START
- PASS: [desktop] welcome names the app and subject (en)
- PASS: [desktop] START hidden during welcome, shown after it (13.9s)
- PASS: [desktop] replay restarts the welcome
- PASS: [desktop] mute button toggles and is remembered
- PASS: [desktop] START closes welcome and opens the app
- PASS: [desktop] Malek docked bottom-right after START
- PASS: [desktop] home: Malek covers no content
- PASS: [desktop] question screen: no overlap
- PASS: [desktop] question screen scrolled to bottom: no overlap
- PASS: [desktop] wrong answer -> supportive pose + encouraging line
- PASS: [desktop] after wrong answer (bubble shown): figure covers no content
- PASS: [desktop] correct answer -> happy pose + praise line
- PASS: [desktop] existing scoring untouched (wrong-then-right is not first-try)
- PASS: [desktop] after correct answer: no overlap
- PASS: [desktop] 3 correct in a row -> celebration pose + streak line
- PASS: [desktop] halfway milestone -> proud pose + milestone line
- PASS: [desktop] switching to Arabic updates Malek (RTL, Arabic bubble)
- PASS: [desktop] Arabic RTL layout: no overlap
- PASS: [desktop] German: wrong answer line is German
- PASS: [desktop] minimise works and is remembered
- PASS: [desktop] restore brings Malek back
- PASS: [desktop] lesson complete -> achievement pose (trophy), line and confetti
- PASS: [desktop] results screen: no overlap
- PASS: [desktop] leaving the finished lesson -> goodbye pose + goodbye line
- PASS: [desktop] goodbye pose (wider, with props): no overlap
- PASS: [desktop] Malek stays on every screen (home again, no welcome replay)
- PASS: [desktop] no JavaScript errors
- PASS: [tablet] welcome appears before the app; app is inert until START
- PASS: [tablet] welcome names the app and subject (ar)
- PASS: [tablet] START hidden during welcome, shown after it (11.9s)
- PASS: [tablet] replay restarts the welcome
- PASS: [tablet] mute button toggles and is remembered
- PASS: [tablet] START closes welcome and opens the app
- PASS: [tablet] Malek docked bottom-right after START
- PASS: [tablet] home: Malek covers no content
- PASS: [tablet] question screen: no overlap
- PASS: [tablet] question screen scrolled to bottom: no overlap
- PASS: [tablet] wrong answer -> supportive pose + encouraging line
- PASS: [tablet] after wrong answer (bubble shown): figure covers no content
- PASS: [tablet] correct answer -> happy pose + praise line
- PASS: [tablet] existing scoring untouched (wrong-then-right is not first-try)
- PASS: [tablet] after correct answer: no overlap
- PASS: [tablet] 3 correct in a row -> celebration pose + streak line
- PASS: [tablet] halfway milestone -> proud pose + milestone line
- PASS: [tablet] minimise works and is remembered
- PASS: [tablet] restore brings Malek back
- PASS: [tablet] lesson complete -> achievement pose (trophy), line and confetti
- PASS: [tablet] results screen: no overlap
- PASS: [tablet] leaving the finished lesson -> goodbye pose + goodbye line
- PASS: [tablet] goodbye pose (wider, with props): no overlap
- PASS: [tablet] Malek stays on every screen (home again, no welcome replay)
- PASS: [tablet] no JavaScript errors
- PASS: [mobile] welcome appears before the app; app is inert until START
- PASS: [mobile] welcome names the app and subject (de)
- PASS: [mobile] START hidden during welcome, shown after it (9.8s)
- PASS: [mobile] replay restarts the welcome
- PASS: [mobile] mute button toggles and is remembered
- PASS: [mobile] START closes welcome and opens the app
- PASS: [mobile] Malek docked bottom-right after START
- PASS: [mobile] home: Malek covers no content
- PASS: [mobile] question screen: no overlap
- PASS: [mobile] question screen scrolled to bottom: no overlap
- PASS: [mobile] wrong answer -> supportive pose + encouraging line
- PASS: [mobile] after wrong answer (bubble shown): figure covers no content
- PASS: [mobile] correct answer -> happy pose + praise line
- PASS: [mobile] existing scoring untouched (wrong-then-right is not first-try)
- PASS: [mobile] after correct answer: no overlap
- PASS: [mobile] 3 correct in a row -> celebration pose + streak line
- PASS: [mobile] halfway milestone -> proud pose + milestone line
- PASS: [mobile] minimise works and is remembered
- PASS: [mobile] restore brings Malek back
- PASS: [mobile] lesson complete -> achievement pose (trophy), line and confetti
- PASS: [mobile] results screen: no overlap
- PASS: [mobile] leaving the finished lesson -> goodbye pose + goodbye line
- PASS: [mobile] goodbye pose (wider, with props): no overlap
- PASS: [mobile] Malek stays on every screen (home again, no welcome replay)
- PASS: [mobile] no JavaScript errors
- PASS: [laptop-short] welcome appears before the app; app is inert until START
- PASS: [laptop-short] welcome names the app and subject (en)
- PASS: [laptop-short] START hidden during welcome, shown after it (13.9s)
- PASS: [laptop-short] replay restarts the welcome
- PASS: [laptop-short] mute button toggles and is remembered
- PASS: [laptop-short] START closes welcome and opens the app
- PASS: [laptop-short] Malek docked bottom-right after START
- PASS: [laptop-short] home: Malek covers no content
- PASS: [laptop-short] question screen: no overlap
- PASS: [laptop-short] question screen scrolled to bottom: no overlap
- PASS: [laptop-short] wrong answer -> supportive pose + encouraging line
- PASS: [laptop-short] after wrong answer (bubble shown): figure covers no content
- PASS: [laptop-short] correct answer -> happy pose + praise line
- PASS: [laptop-short] existing scoring untouched (wrong-then-right is not first-try)
- PASS: [laptop-short] after correct answer: no overlap
- PASS: [laptop-short] 3 correct in a row -> celebration pose + streak line
- PASS: [laptop-short] halfway milestone -> proud pose + milestone line
- PASS: [laptop-short] minimise works and is remembered
- PASS: [laptop-short] restore brings Malek back
- PASS: [laptop-short] lesson complete -> achievement pose (trophy), line and confetti
- PASS: [laptop-short] results screen: no overlap
- PASS: [laptop-short] leaving the finished lesson -> goodbye pose + goodbye line
- PASS: [laptop-short] goodbye pose (wider, with props): no overlap
- PASS: [laptop-short] Malek stays on every screen (home again, no welcome replay)
- PASS: [laptop-short] no JavaScript errors
- PASS: [reduced motion] full text + START immediately, no animation
- PASS: [returning visit] shorter welcome + option to play the full one; still requires START
- PASS: [inactivity] 12 s on a question -> thinking reaction (thought-bubble pose)
- PASS: [inactivity] 30 s with no activity -> "I'm here to help you!" style offer
- PASS: [help] Hint button -> help line

### Voice logic (simulated speech engine)

- PASS: [voice en] welcome spoken once with the en voice, synced subtitles finish
- PASS: [voice] reactions are spoken, never overlapping (previous line cancelled first)
- PASS: [voice] muted -> bubble still shows, nothing spoken
- PASS: [voice] lesson narration active -> Malek stays silent (no overlapping audio)
- PASS: [voice de] welcome spoken once with the de voice, synced subtitles finish
- PASS: [voice ar] no Arabic voice -> nothing spoken in another language; subtitles still complete
