"""Voice logic tests with a simulated speech engine (headless Chrome ships no voices).
Simulated voices: en-US and de-DE only, so Arabic must fall back to subtitles, never an English voice."""
import json, os, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), '..', 'pilot'); PORT = 8767
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

MOCK = """
(() => {
  const voices = [{name:'Sim EN', lang:'en-US'}, {name:'Sim DE', lang:'de-DE'}];
  window.__spoken = []; window.__cancels = 0; let active = null;
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
  const synth = {
    getVoices: () => voices, addEventListener() {}, speaking: false,
    cancel() { window.__cancels++; if (active) { active = null; } },
    speak(u) {
      if (active) window.__spoken.push({overlap: true});
      active = u; window.__spoken.push({text: u.text, lang: u.lang, voice: u.voice && u.voice.name});
      setTimeout(() => u.onstart && u.onstart(), 20);
      const words = u.text.split(/\\s+/); let ci = 0;
      words.forEach((w, i) => { const c = ci; setTimeout(() => { if (active === u && u.onboundary) u.onboundary({name:'word', charIndex:c}); }, 40 + i * 30); ci += w.length + 1; });
      setTimeout(() => { if (active === u) { active = null; u.onend && u.onend(); } }, 60 + words.length * 30);
    }
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth });
})();
"""
R = []
def check(n, ok, d=''):
    R.append((n, ok)); print(('PASS ' if ok else 'FAIL ') + n + (('  — ' + d) if d else ''))

with sync_playwright() as pw:
    b = pw.chromium.launch(channel='chrome')
    for lang in ['en', 'de', 'ar']:
        ctx = b.new_context(viewport={'width': 1280, 'height': 800}); p = ctx.new_page()
        p.add_init_script(MOCK)
        p.add_init_script(f"localStorage.setItem('iee-pilot-fractions:lang', JSON.stringify('{lang}'))")
        p.goto(f'http://127.0.0.1:{PORT}/index.html')
        p.wait_for_selector('.iee-m-start:not([hidden])', timeout=25000)
        spoken = p.evaluate('window.__spoken')
        if lang == 'ar':
            check('[voice ar] no Arabic voice -> nothing spoken in another language; subtitles still complete', spoken == [], json.dumps(spoken, ensure_ascii=False))
        else:
            want = {'en': 'Sim EN', 'de': 'Sim DE'}[lang]
            check(f'[voice {lang}] welcome spoken once with the {lang} voice, synced subtitles finish', len(spoken) == 1 and spoken[0]['voice'] == want, json.dumps(spoken, ensure_ascii=False)[:120])
        if lang == 'en':
            p.click('.iee-m-start'); p.click('#startLesson'); p.wait_for_selector('.opt')
            q = p.evaluate('() => __pilot.Q[0]')
            p.click(f'.opt[data-opt="{q["options"][0] if q["options"][0] != q["answer"] else q["options"][1]}"]'); p.wait_for_timeout(100)
            p.click(f'.opt[data-opt="{q["answer"]}"]'); p.wait_for_timeout(100)
            sp = p.evaluate('window.__spoken')
            check('[voice] reactions are spoken, never overlapping (previous line cancelled first)', len(sp) >= 3 and not any(s.get('overlap') for s in sp) and p.evaluate('window.__cancels') >= 2, json.dumps(sp)[:160])
            n = len(sp)
            p.locator('.iee-m-body .iee-m-icon').nth(1).click()  # buddy mute
            p.click('#nextBtn'); q = p.evaluate('() => __pilot.Q[1]')
            p.click(f'.opt[data-opt="{[o for o in q["options"] if o != q["answer"]][0]}"]'); p.wait_for_timeout(150)
            check('[voice] muted -> bubble still shows, nothing spoken', len(p.evaluate('window.__spoken')) == n and not p.locator('.iee-m-bubble').is_hidden())
            p.locator('.iee-m-body .iee-m-icon').nth(1).click()  # unmute
            p.evaluate("() => document.dispatchEvent(new CustomEvent('iee:narration', {detail: {active: true}}))")
            p.click(f'.opt[data-opt="{q["answer"]}"]'); p.wait_for_timeout(150)
            check('[voice] lesson narration active -> Malek stays silent (no overlapping audio)', len(p.evaluate('window.__spoken')) == n)
        ctx.close()
    b.close()
httpd.shutdown()
print(f"\n{sum(o for _, o in R)}/{len(R)} voice checks passed")
json.dump([{'check': n, 'ok': o} for n, o in R], open(os.path.join(os.path.dirname(__file__), 'voice_results.json'), 'w'), indent=1)
