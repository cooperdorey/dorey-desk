#!/usr/bin/env python3
"""Build a PDF of every lesson (and every version), with and without worked solutions.

    python3 scripts/build_pdfs.py _site [--cache DIR] [--only TEXT]

Runs after build_manifest.py, on the collected site folder. Opens each lesson in headless
Chromium exactly as the site shows it and prints it as a vector PDF (text, maths and diagrams
stay sharp at any zoom): A4 landscape in shape, the two columns kept at full size, rows
packed onto pages and never split, unless a row is taller than a page, when it breaks
between cards (never through one):

    _site/pdf/<lesson id>.pdf           the lesson (solutions hidden), for writing on
    _site/pdf/<lesson id>-answers.pdf   the same cards with worked solutions shown

--cache keeps finished PDFs between runs; a lesson is only rebuilt when its file, the
site's styles/script or this script change. --only builds just the lessons whose id
contains TEXT (for testing). Needs: pip install playwright, a Chromium
(python -m playwright install chromium, or set CHROME_PATH) and a Palatino-style font
(apt install fonts-urw-base35) so the cards match the site.
"""
import argparse, functools, hashlib, http.server, json, os, shutil, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('site')
ap.add_argument('--cache')
ap.add_argument('--only', default='')
args = ap.parse_args()
SITE = os.path.abspath(args.site)
OUT = os.path.join(SITE, 'pdf')
HERE = os.path.dirname(os.path.abspath(__file__))

def sha(*paths):
    h = hashlib.sha256()
    for p in paths:
        with open(p, 'rb') as fh:
            h.update(fh.read())
    return h.hexdigest()[:16]

SHARED = sha(os.path.join(SITE, 'assets', 'app.css'), os.path.join(SITE, 'assets', 'app.js'),
             os.path.join(SITE, 'index.html'), os.path.abspath(__file__))

# Every lesson, and every version of a lesson with versions
with open(os.path.join(SITE, 'manifest.json'), encoding='utf-8') as fh:
    M = json.load(fh)
todo = []
for y in M['years']:
    for c in y['courses']:
        for t in c['topics']:
            for l in t['lessons']:
                for v in (l.get('versions') or [l]):
                    if args.only in v['id']:
                        todo.append((v['id'], v['path']))

cache_dir = os.path.abspath(args.cache) if args.cache else None
index = {}
if cache_dir:
    os.makedirs(cache_dir, exist_ok=True)
    try:
        with open(os.path.join(cache_dir, 'index.json')) as fh:
            index = json.load(fh)
    except (OSError, ValueError):
        index = {}

def key_for(path):
    return sha(os.path.join(SITE, path)) + SHARED

def place(lid, suffix, data=None, src=None):
    dest = os.path.join(OUT, lid + suffix + '.pdf')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if src:
        shutil.copyfile(src, dest)
    else:
        with open(dest, 'wb') as fh:
            fh.write(data)
        if cache_dir:
            c = os.path.join(cache_dir, lid + suffix + '.pdf')
            os.makedirs(os.path.dirname(c), exist_ok=True)
            with open(c, 'wb') as fh:
                fh.write(data)

# Reuse cached PDFs where nothing changed
build = []
for lid, path in todo:
    k = key_for(path)
    cached = [os.path.join(cache_dir, lid + s + '.pdf') for s in ('', '-answers')] if cache_dir else []
    if cache_dir and index.get(lid) == k and all(os.path.exists(c) for c in cached):
        place(lid, '', src=cached[0]); place(lid, '-answers', src=cached[1])
    else:
        build.append((lid, path, k))
print(f'PDFs: {len(todo) - len(build)} reused, {len(build)} to build')

# Serve the site locally
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SITE))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

# Pages are A4 landscape in shape (297:210) but sized to the cards' natural width, so nothing
# is scaled (Chromium's print scaling and CSS zoom both upset page breaks). Printing on A4
# just fits the page to the paper. MARGIN is in CSS px.
SHEET_W, MARGIN = 1560, 24
PAGE_W = SHEET_W + 2 * MARGIN
PAGE_H = round(PAGE_W * 210 / 297)
PRINT_CSS = """
  :root{--card:"Palatino Linotype",Palatino,"Book Antiqua","URW Palladio L",P052,Georgia,serif}
  @page{size:%dpx %dpx;margin:%dpx}
  @media print{
    body>*:not(#printwrap){display:none!important}
    html,body{background:#fff!important;margin:0}
    #printwrap .copy{display:none!important}
    #printwrap:not(.sol) .ws{display:none}
    #printwrap .row{break-inside:avoid}
    #printwrap .row.tall{break-inside:auto}
    #printwrap .c{break-inside:avoid}
  }
""" % (PAGE_W, PAGE_H, MARGIN)
# Copy the rendered cards into a clean wrapper (with the course colours), scale it to the
# page width, and mark rows too tall for one page so they may break between cards.
BUILD_PRINT = """([pw, ph, answers]) => {
  document.getElementById('printwrap')?.remove();
  const L = document.getElementById('lesson'), cs = getComputedStyle(L);
  const w = document.createElement('div'); w.id = 'printwrap'; if (answers) w.className = 'sol';
  ['--card-head','--card-ink','--card-sub','--card-title'].forEach(v => w.style.setProperty(v, cs.getPropertyValue(v)));
  const s = document.getElementById('sheet').cloneNode(true);
  s.removeAttribute('id'); s.style.zoom = ''; s.classList.remove('one');
  w.append(s); document.body.append(w);
  s.querySelectorAll('.row').forEach(r => { if (r.getBoundingClientRect().height > ph) r.classList.add('tall') });
}"""
failed = []
if build:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
        page = browser.new_page(viewport={'width': 2200, 'height': 1400})
        page.goto(f'http://127.0.0.1:{port}/index.html#lessons')
        page.wait_for_selector('#home:not([hidden]), #home', timeout=15000)
        page.add_style_tag(content=PRINT_CSS)
        for answers in (False, True):
            if answers:
                page.evaluate("()=>{ if(!showSol) document.getElementById('ansBtn').click() }")
            for lid, path, k in build:
                try:
                    page.evaluate(f"()=>{{ location.hash = {json.dumps(lid)} }}")
                    page.wait_for_function(
                        "id => current && current.id===id && document.querySelector('#sheet .c')", arg=lid, timeout=20000)
                    page.evaluate("()=>document.fonts.ready")
                    # Chromium draws a prime set as a superscript (f') tiny and too high; the prime
                    # glyph is already raised, so set it inline instead (Safari, on the iPad, is fine).
                    page.evaluate("""()=>document.querySelectorAll('#sheet msup').forEach(s=>{
                        const k=s.children;
                        if (k.length===2 && /^[\\u2032\\u2033\\u2034']+$/.test(k[1].textContent.trim())){
                          const r=document.createElementNS('http://www.w3.org/1998/Math/MathML','mrow');
                          r.append(k[0],k[1]); s.replaceWith(r);
                        }})""")
                    page.evaluate(BUILD_PRINT, [SHEET_W, PAGE_H - 2 * MARGIN, answers])
                    pdf = page.pdf(prefer_css_page_size=True, print_background=True)
                    place(lid, '-answers' if answers else '', data=pdf)
                    if answers:
                        index[lid] = k
                except Exception as e:
                    failed.append(f'{lid} ({"answers" if answers else "lesson"}): {e}')
        browser.close()
srv.shutdown()

if cache_dir:
    with open(os.path.join(cache_dir, 'index.json'), 'w') as fh:
        json.dump(index, fh)
if failed:
    print('Could not build:\n  ' + '\n  '.join(failed))
    sys.exit(1)
print(f'PDFs: all {len(todo)} lessons done ({len(todo) * 2} files) in {os.path.relpath(OUT, SITE)}/')
