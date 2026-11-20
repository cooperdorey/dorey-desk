#!/usr/bin/env python3
"""Build a PDF of every lesson (and every version), with and without worked solutions.

    python3 scripts/build_pdfs.py _site [--cache DIR] [--only TEXT]

Runs after build_manifest.py, on the collected site folder. Opens each lesson in headless
Chromium exactly as the site shows it, takes each row of cards as an image (2x, for sharp
print) and joins the rows into a PDF, one row per page, so nothing is ever cut in half:

    _site/pdf/<lesson id>.pdf           the lesson (solutions hidden), for writing on
    _site/pdf/<lesson id>-answers.pdf   the same cards with worked solutions shown

--cache keeps finished PDFs between runs; a lesson is only rebuilt when its file, the
site's styles/script or this script change. --only builds just the lessons whose id
contains TEXT (for testing). Needs: pip install playwright pillow, a Chromium
(python -m playwright install chromium, or set CHROME_PATH) and a Palatino-style font
(apt install fonts-urw-base35) so the cards match the site.
"""
import argparse, functools, hashlib, http.server, io, json, os, shutil, socketserver, sys, threading
from PIL import Image
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

PRINT_CSS = """
  .copy{display:none!important}
  :root{--card:"Palatino Linotype",Palatino,"Book Antiqua","URW Palladio L",P052,Georgia,serif}
  #deck,.sheet,body{background:#fff!important}
  #deck.sol-mode{outline:none!important}
"""

def to_pdf(images):
    pages = [Image.open(io.BytesIO(b)).convert('RGB') for b in images]
    buf = io.BytesIO()
    pages[0].save(buf, 'PDF', resolution=192.0, save_all=True, append_images=pages[1:])
    return buf.getvalue()

failed = []
if build:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
        page = browser.new_page(viewport={'width': 2200, 'height': 1400}, device_scale_factor=2)
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
                    page.evaluate("()=>{ const s=document.getElementById('sheet'); if(s){ s.style.zoom=''; s.classList.remove('one') } }")
                    page.wait_for_timeout(150)
                    rows = page.locator('#sheet .row')
                    shots = []
                    for i in range(rows.count()):
                        r = rows.nth(i)
                        # pad each row a little so card edges aren't flush with the page
                        box = r.bounding_box()
                        shots.append(page.screenshot(clip={'x': box['x'] - 30, 'y': box['y'] - 30,
                                                           'width': box['width'] + 60, 'height': box['height'] + 10},
                                                     full_page=True))
                    place(lid, '-answers' if answers else '', data=to_pdf(shots))
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
