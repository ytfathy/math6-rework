"""End-to-end tests for the IEE Malek module inside the Math Adventure pilot.
Run: python3 tests/test_pilot.py  (serves ./pilot on localhost and drives Chrome headless)."""
import json, os, subprocess, sys, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), '..', 'pilot')
SHOTS = os.path.join(os.path.dirname(__file__), 'shots')
os.makedirs(SHOTS, exist_ok=True)
PORT = 8765

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def serve():
    handler = functools.partial(Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd

RESULTS = []
def check(name, ok, detail=''):
    RESULTS.append({'check': name, 'ok': bool(ok), 'detail': detail})
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + detail) if detail else ''))

OVERLAP_JS = """() => {
  const buddy = document.querySelector('.iee-m-buddy');
  if (!buddy) return {err: 'no buddy'};
  const parts = [...buddy.querySelectorAll('.iee-m-body:not([hidden]) .iee-m-figure, .iee-m-avatar:not([hidden]), .iee-m-body:not([hidden]) .iee-m-tools')].filter(n => n.offsetParent !== null || getComputedStyle(n).position==='fixed');
  const rects = parts.map(n => n.getBoundingClientRect()).filter(r => r.width && r.height);
  const imp = [...document.querySelectorAll('#app .opt, #app button, #app h1, #app .visual, #app .feedback:not([hidden]), #app .hintbox:not([hidden]), #app .lesson-card, #app .results .score')];
  const hits = [];
  for (const n of imp) { const b = n.getBoundingClientRect(); if (!b.width || !b.height) continue;
    if (b.bottom < 0 || b.top > innerHeight) continue;
    for (const r of rects) { if (b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom) hits.push((n.id||n.className||n.tagName) + ' ' + (n.textContent||'').trim().slice(0,20)); } }
  return {hits, compact: buddy.classList.contains('iee-m-compact'), n: rects.length};
}"""

def wait_start(page, timeout=25000):
    page.wait_for_selector('.iee-m-start:not([hidden])', timeout=timeout)

def buddy_state(page):
    return page.evaluate("""() => { const b=document.querySelector('.iee-m-buddy'); const f=b.querySelector('.iee-m-figure'); const bub=b.querySelector('.iee-m-bubble');
      return {pose: f.getAttribute('src').split('/').pop(), bubble: bub.hidden ? '' : bub.textContent, dir: b.getAttribute('dir'), lang: b.getAttribute('lang'),
              compact: b.classList.contains('iee-m-compact'), avatarHidden: b.querySelector('.iee-m-avatar').hidden, bodyHidden: b.querySelector('.iee-m-body').hidden}; }""")

def lines(page, cat, lang):
    return page.evaluate("([c,l]) => IEEMalek.LINES[c][l]", [cat, lang])

def answer(page, correct):
    q = page.evaluate("() => { const s=__pilot.state; return __pilot.Q[s.index]; }")
    target = q['answer'] if correct else [o for o in q['options'] if o != q['answer']][0]
    page.click(f'.opt[data-opt="{target}"]')

def run(viewport, name, pw, full=True, lang='en'):
    browser = pw.chromium.launch(channel='chrome', headless=True, args=['--autoplay-policy=no-user-gesture-required'])
    ctx = browser.new_context(viewport=viewport, device_scale_factor=1, has_touch=viewport['width'] < 700)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'fonts.g' not in m.text and 'ERR_' not in m.text else None)
    page.add_init_script(f"localStorage.setItem('iee-pilot-fractions:lang', JSON.stringify('{lang}'))")
    page.goto(f'http://127.0.0.1:{PORT}/index.html')
    tag = f'[{name}]'

    # 1. Welcome first, app locked
    page.wait_for_selector('.iee-m-welcome')
    inert = page.evaluate("() => document.getElementById('app').hasAttribute('inert')")
    check(f'{tag} welcome appears before the app; app is inert until START', inert)
    voices = page.evaluate("() => (window.speechSynthesis ? speechSynthesis.getVoices().map(v=>v.lang) : null)")
    page.screenshot(path=f'{SHOTS}/{name}-01-welcome-start.png')
    # 2. Message mentions the real app + subject in the active language
    txt = page.inner_text('.iee-m-w-line')
    exp = {'en': ('Math Adventure', 'fractions'), 'ar': ('مغامرة الرياضيات', 'الكسور'), 'de': ('Mathe-Abenteuer', 'Brüche')}[lang]
    check(f'{tag} welcome names the app and subject ({lang})', exp[0] in txt and exp[1] in txt, txt[:90])
    # 3. START appears only after the welcome line has played
    hidden_early = page.evaluate("() => document.querySelector('.iee-m-start').hidden")
    t0 = time.time(); wait_start(page); dur = time.time() - t0
    check(f'{tag} START hidden during welcome, shown after it ({dur:.1f}s)', hidden_early and dur < 20)
    page.screenshot(path=f'{SHOTS}/{name}-02-welcome-done.png')
    # 4. Replay restarts subtitles
    page.click('.iee-m-welcome .iee-m-btn:has-text("' + {'en': 'Replay', 'ar': 'إعادة', 'de': 'Nochmal'}[lang] + '")')
    page.wait_for_timeout(300)
    on = page.evaluate("() => document.querySelectorAll('.iee-m-word.iee-m-on').length")
    start_hidden = page.evaluate("() => document.querySelector('.iee-m-start').hidden")
    check(f'{tag} replay restarts the welcome', on < 3 and start_hidden, f'words lit={on}')
    wait_start(page)
    # 5. Mute toggles and persists
    mute_btn = page.locator('.iee-m-welcome .iee-m-mute')
    before = mute_btn.get_attribute('aria-pressed'); mute_btn.click()
    after = mute_btn.get_attribute('aria-pressed')
    stored = page.evaluate("() => localStorage.getItem('iee-malek:math-adventure-fractions:muted')")
    check(f'{tag} mute button toggles and is remembered', before == 'false' and after == 'true' and stored == 'true')
    mute_btn.click(); wait_start(page)
    # 6. START enters the app
    page.click('.iee-m-start')
    page.wait_for_selector('.iee-m-buddy')
    gone = page.evaluate("() => !document.querySelector('.iee-m-welcome') && !document.getElementById('app').hasAttribute('inert')")
    check(f'{tag} START closes welcome and opens the app', gone)
    page.wait_for_timeout(700)
    st = buddy_state(page)
    check(f'{tag} Malek docked bottom-right after START', page.evaluate("() => { const r=document.querySelector('.iee-m-buddy').getBoundingClientRect(); return r.right > innerWidth-40 && r.bottom > innerHeight-40; }"), json.dumps(st))
    ov = page.evaluate(OVERLAP_JS)
    check(f'{tag} home: Malek covers no content', not ov['hits'], json.dumps(ov))
    page.screenshot(path=f'{SHOTS}/{name}-03-home.png')

    # 7. Quiz + real reactions
    page.click('#startLesson'); page.wait_for_selector('.opt')
    ov = page.evaluate(OVERLAP_JS); check(f'{tag} question screen: no overlap', not ov['hits'], json.dumps(ov))
    page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)"); page.wait_for_timeout(200)
    ov = page.evaluate(OVERLAP_JS); check(f'{tag} question screen scrolled to bottom: no overlap', not ov['hits'], json.dumps(ov))
    page.evaluate("() => window.scrollTo(0, 0)")
    answer(page, False); page.wait_for_timeout(900)
    st = buddy_state(page)
    check(f'{tag} wrong answer -> supportive pose + encouraging line', st['pose'] == 'supportive.png' and st['bubble'] in lines(page, 'incorrect', lang), json.dumps(st, ensure_ascii=False))
    page.screenshot(path=f'{SHOTS}/{name}-04-incorrect.png')
    ov = page.evaluate(OVERLAP_JS); check(f'{tag} after wrong answer (bubble shown): figure covers no content', not ov['hits'], json.dumps(ov))
    answer(page, True); page.wait_for_timeout(900)
    st = buddy_state(page)
    check(f'{tag} correct answer -> happy pose + praise line', st['pose'] == 'happy.png' and st['bubble'] in lines(page, 'correct', lang), json.dumps(st, ensure_ascii=False))
    score = page.evaluate("() => __pilot.state.firstTry")
    check(f'{tag} existing scoring untouched (wrong-then-right is not first-try)', score == 0)
    page.screenshot(path=f'{SHOTS}/{name}-05-correct.png')
    ov = page.evaluate(OVERLAP_JS); check(f'{tag} after correct answer: no overlap', not ov['hits'], json.dumps(ov))

    # Q2, Q3 correct -> streak celebrate on 3rd? (streak counts consecutive corrects: q1(after wrong)=1, q2=2, q3=3)
    page.click('#nextBtn'); answer(page, True); page.wait_for_timeout(200)
    page.click('#nextBtn'); answer(page, True); page.wait_for_timeout(250)
    st = buddy_state(page)
    check(f'{tag} 3 correct in a row -> celebration pose + streak line', st['pose'] == 'celebrate.png' and any(s.split('{n}')[-1].strip() in st['bubble'] for s in lines(page, 'streak', lang)), json.dumps(st, ensure_ascii=False))
    page.wait_for_timeout(2600)
    st = buddy_state(page)
    check(f'{tag} halfway milestone -> proud pose + milestone line', st['pose'] == 'proud.png' and st['bubble'] in lines(page, 'milestone', lang), json.dumps(st, ensure_ascii=False))

    # 8. Language switch mid-lesson updates Malek immediately
    if full:
        page.click('#langGroup button[data-lang="ar"]'); page.wait_for_timeout(200)
        st = buddy_state(page)
        check(f'{tag} switching to Arabic updates Malek (RTL, Arabic bubble)', st['dir'] == 'rtl' and st['lang'] == 'ar' and (st['bubble'] == '' or any('؀' <= ch <= 'ۿ' for ch in st['bubble'])), json.dumps(st, ensure_ascii=False))
        page.screenshot(path=f'{SHOTS}/{name}-06-arabic.png')
        ov = page.evaluate(OVERLAP_JS); check(f'{tag} Arabic RTL layout: no overlap', not ov['hits'], json.dumps(ov))
        page.click('#langGroup button[data-lang="de"]'); page.wait_for_timeout(200)
        page.click('#nextBtn'); answer(page, False); page.wait_for_timeout(200)
        st = buddy_state(page)
        check(f'{tag} German: wrong answer line is German', st['bubble'] in lines(page, 'incorrect', 'de') and st['lang'] == 'de', json.dumps(st, ensure_ascii=False))
        page.click('#langGroup button[data-lang="en"]'); page.wait_for_timeout(200)
        answer(page, True)
    else:
        page.click('#nextBtn'); answer(page, True)

    # 9. Minimise / restore
    page.wait_for_timeout(300)
    if page.locator('.iee-m-body:not([hidden]) .iee-m-icon').count():
        page.locator('.iee-m-body .iee-m-icon').first.click()
    else:
        page.click('.iee-m-avatar')  # compact: avatar toggles hide
    st = buddy_state(page)
    mini = page.evaluate("() => localStorage.getItem('iee-malek:math-adventure-fractions:minimized')")
    check(f'{tag} minimise works and is remembered', st['bodyHidden'] and not st['avatarHidden'] and mini == 'true', json.dumps(st))
    page.click('.iee-m-avatar'); page.wait_for_timeout(150)
    st = buddy_state(page)
    expect_full = not st['compact']
    check(f'{tag} restore brings Malek back', page.evaluate("() => localStorage.getItem('iee-malek:math-adventure-fractions:minimized')") == 'false', json.dumps(st))

    # 10. Finish lesson -> celebration
    for _ in range(6):
        page.click('#nextBtn'); page.wait_for_timeout(150)
        if page.locator('.results').count(): break
        answer(page, True); page.wait_for_timeout(150)
    page.wait_for_selector('.results'); page.wait_for_timeout(300)
    st = buddy_state(page)
    conf = page.evaluate("() => !!document.querySelector('.iee-m-confetti')")
    check(f'{tag} lesson complete -> achievement pose (trophy), line and confetti', st['pose'] == 'achievement.png' and st['bubble'] in lines(page, 'lessonComplete', lang) and conf, json.dumps(st, ensure_ascii=False))
    page.screenshot(path=f'{SHOTS}/{name}-07-results.png')
    ov = page.evaluate(OVERLAP_JS); check(f'{tag} results screen: no overlap', not ov['hits'], json.dumps(ov))
    page.click('#home'); page.wait_for_selector('.lesson-card'); page.wait_for_timeout(250)
    st = buddy_state(page)
    check(f'{tag} leaving the finished lesson -> goodbye pose + goodbye line', st['pose'] == 'goodbye.png' and st['bubble'] in lines(page, 'goodbye', lang), json.dumps(st, ensure_ascii=False))
    ov = page.evaluate(OVERLAP_JS); check(f'{tag} goodbye pose (wider, with props): no overlap', not ov['hits'], json.dumps(ov))
    page.screenshot(path=f'{SHOTS}/{name}-08-goodbye.png')
    check(f'{tag} Malek stays on every screen (home again, no welcome replay)', page.locator('.iee-m-buddy').count() == 1 and page.locator('.iee-m-welcome').count() == 0)

    check(f'{tag} no JavaScript errors', not errors, '; '.join(errors[:3]))
    ctx.close(); browser.close()
    return voices

def run_inactivity(pw):
    browser = pw.chromium.launch(channel='chrome', headless=True)
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = ctx.new_page()
    page.goto(f'http://127.0.0.1:{PORT}/index.html')
    wait_start(page); page.click('.iee-m-start'); page.click('#startLesson'); page.wait_for_selector('.opt')
    page.mouse.move(5, 5)
    page.wait_for_timeout(13000)
    st = buddy_state(page)
    check('[inactivity] 12 s on a question -> thinking reaction (thought-bubble pose)', st['pose'] == 'thinking.png' and st['bubble'] in lines(page, 'think', 'en'), json.dumps(st))
    page.wait_for_timeout(21500)
    log = page.evaluate("() => __pilot.malek.log.filter(e => e.type === 'say').map(e => e.cat)")
    check('[inactivity] 30 s with no activity -> "I\'m here to help you!" style offer', 'help' in log, json.dumps(log))
    page.click('#hintBtn'); page.wait_for_timeout(200)
    st = buddy_state(page)
    check('[help] Hint button -> help line', st['bubble'] in lines(page, 'help', 'en') and page.is_visible('#hintBox'), json.dumps(st))
    ctx.close(); browser.close()

def run_reduced(pw):
    browser = pw.chromium.launch(channel='chrome', headless=True)
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800}, reduced_motion='reduce')
    page = ctx.new_page(); page.goto(f'http://127.0.0.1:{PORT}/index.html')
    page.wait_for_selector('.iee-m-welcome'); page.wait_for_timeout(400)
    vis = page.evaluate("() => !document.querySelector('.iee-m-start').hidden")
    anim = page.evaluate("() => getComputedStyle(document.querySelector('.iee-m-w-figure')).animationName")
    check('[reduced motion] full text + START immediately, no animation', vis and anim == 'none', f'animation={anim}')
    ctx.close(); browser.close()

def run_returning(pw):
    browser = pw.chromium.launch(channel='chrome', headless=True)
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = ctx.new_page(); page.goto(f'http://127.0.0.1:{PORT}/index.html')
    wait_start(page); page.click('.iee-m-start'); page.reload()
    page.wait_for_selector('.iee-m-welcome')
    txt = page.inner_text('.iee-m-w-line')
    full_btn = page.is_visible('.iee-m-linkbtn')
    check('[returning visit] shorter welcome + option to play the full one; still requires START', 'Welcome back' in txt and full_btn and page.evaluate("() => document.getElementById('app').hasAttribute('inert')"), txt)
    ctx.close(); browser.close()

if __name__ == '__main__':
    httpd = serve()
    with sync_playwright() as pw:
        voices = run({'width': 1440, 'height': 900}, 'desktop', pw, full=True, lang='en')
        run({'width': 820, 'height': 1180}, 'tablet', pw, full=False, lang='ar')
        run({'width': 390, 'height': 844}, 'mobile', pw, full=False, lang='de')
        run({'width': 1024, 'height': 640}, 'laptop-short', pw, full=False, lang='en')
        run_reduced(pw); run_returning(pw); run_inactivity(pw)
    httpd.shutdown()
    print('\nspeechSynthesis voices in headless Chrome:', voices)
    passed = sum(r['ok'] for r in RESULTS)
    print(f'\n{passed}/{len(RESULTS)} checks passed')
    json.dump({'results': RESULTS, 'voices': voices}, open(os.path.join(os.path.dirname(__file__), 'results.json'), 'w'), ensure_ascii=False, indent=1)
