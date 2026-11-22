#!/usr/bin/env python3
"""Build a week's homework and LSQ as vector PDFs, from a settings file.

    python3 scripts/build_assessment_pdfs.py settings.json [--out DIR] [--only homework|lsq]

Opens generators/homework.html and generators/lsq.html in headless Chromium, fills them in
exactly as a person would (lessons ticked, marks, HSC mode, seed, class, week, dates), reads
the faint sheet code off the homework page, builds the linked LSQ from that code, and prints
each sheet as a vector PDF (text and maths stay sharp). Output, named from the class and week:

    <class>_<week>_homework.pdf          two A4 sides, double-sided
    <class>_<week>_homework-answers.pdf
    <class>_<week>_lsq.pdf               two A4 sides
    <class>_<week>_lsq-answers.pdf
    <class>_<week>_codes.txt             the two sheet codes, so either sheet can be rebuilt

settings.json (made-up example; lesson ids are the ids in generators/engine.js):

    {
      "class": "12ADV",
      "week": "T4 W9",
      "homework": {
        "lessons": ["id1", "id2", "id3"],
        "marks": 20, "hsc": "mix", "seed": "k4t9q",
        "due": "2026-12-07", "title": "Homework"
      },
      "lsq": {
        "review": ["id9", "id10"], "nrev": 2,
        "date": "2026-12-04", "title": "Low Stakes Quiz",
        "mins": 20, "marks": 0, "hsc": "mix", "seed": "p2m8x"
      }
    }

hsc is one of mix / as / new / off. A seed is required so a rerun gives the same sheets.
--only lsq still rebuilds the homework (same seed, same sheet) to read its code, but saves only the LSQ.
lsq.marks 0 (or missing) lets the quiz be as long as its twins need. lsq.review are lessons from
earlier weeks used for the review questions (they must not be on the homework sheet).
Either block may be left out. Needs: pip install playwright, a Chromium (CHROME_PATH or
python -m playwright install chromium) and a Palatino-style font (apt install fonts-urw-base35).
"""
import argparse, functools, http.server, json, os, re, socketserver, sys, threading
from urllib.parse import urlencode
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('settings')
ap.add_argument('--out')
ap.add_argument('--only', choices=['homework', 'lsq'])
args = ap.parse_args()

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)                       # the dorey-desk repo root
S = json.load(open(args.settings, encoding='utf-8'))
OUT = os.path.abspath(args.out or os.path.dirname(os.path.abspath(args.settings)))
os.makedirs(OUT, exist_ok=True)

def fail(msg):
    sys.exit('build_assessment_pdfs: ' + msg)

cls, week = S.get('class', ''), S.get('week', '')
base = re.sub(r'[^\w.-]+', '-', '_'.join(x for x in (cls, week) if x)) or 'week'
MODES = {'mix', 'as', 'new', 'off'}

def need_seed(block, name):
    if not block.get('seed'):
        fail(f'{name}.seed is required so that a rerun gives the same sheet')
    if block.get('hsc', 'mix') not in MODES:
        fail(f'{name}.hsc must be one of {sorted(MODES)}')

# A print-only layer: only the pages, at natural size, one A4 side per printed page
PRINT_CSS = """
@page{size:210mm 297mm;margin:0}
html,body{background:#fff!important}
header,.intro,aside,.tabs,.meta,.busy,.measure{display:none!important}
.wrap{display:block!important;padding:0!important;margin:0!important;max-width:none!important}
main{display:block!important}
.pages{display:block!important;gap:0!important}
.pagebox{width:794px!important;height:1123px!important;margin:0!important;break-after:page}
.pagebox:last-child{break-after:auto}
.page{box-shadow:none!important;transform:none!important}
"""
# Chromium draws a superscript prime tiny; the lesson PDFs fix it the same way
MATH_FIX = "math{font-size:1.08em}"

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SITE))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{port}/generators/'

def open_sheet(browser, page_name, params):
    pg = browser.new_page(viewport={'width': 1400, 'height': 1000})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL + page_name + '#' + urlencode(params))
    try:
        pg.wait_for_selector('#out .page', timeout=20000)
    except Exception:
        txt = pg.inner_text('#out')[:300]
        fail(f'{page_name} made no sheet: {txt or errs or "no output"}')
    pg.wait_for_function("()=>document.fonts.ready.then(()=>true)")
    meta = pg.inner_text('#meta')
    code = pg.evaluate("()=>{const c=document.querySelector('#out .pfoot .code');return c?c.textContent.trim():''}")
    if not code:
        fail(f'{page_name} showed no sheet code')
    if 'Generator error' in pg.inner_text('#out'):
        fail(f'{page_name}: ' + pg.inner_text('#out')[:300])
    return pg, code, meta

def save(pg, which, name):
    """which: 'q' for the sheet, 'a' for the answers."""
    pg.evaluate("w=>{document.getElementById('out').hidden=w!=='q';document.getElementById('ans').hidden=w!=='a'}", which)
    pg.add_style_tag(content=PRINT_CSS + MATH_FIX)
    sel = '#out .page' if which == 'q' else '#ans .page'
    n = pg.locator(sel).count()
    data = pg.pdf(prefer_css_page_size=True, print_background=True)
    path = os.path.join(OUT, name)
    open(path, 'wb').write(data)
    # a page count check: one PDF page per sheet page
    pages = len(re.findall(rb'/Type\s*/Page[^s]', data))
    if pages != n:
        fail(f'{name}: expected {n} pages, the PDF has {pages}')
    return path, n

codes, made = {}, []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)

    hw = S.get('homework')
    if hw and (args.only in (None, 'homework') or S.get('lsq')):
        need_seed(hw, 'homework')
        if not hw.get('lessons'):
            fail('homework.lessons is empty')
        par = {'seed': hw['seed'], 'm': hw.get('marks', 20), 'hs': hw.get('hsc', 'mix'), 'l': ','.join(hw['lessons'])}
        for k, v in (('c', cls), ('w', week), ('d', hw.get('due')), ('ti', hw.get('title'))):
            if v:
                par[k] = v
        pg, code, meta = open_sheet(browser, 'homework.html', par)
        codes['homework'] = code
        if args.only in (None, 'homework'):       # with --only lsq the homework is rebuilt only for its code
            for which, suf in (('q', 'homework'), ('a', 'homework-answers')):
                path, n = save(pg, which, f'{base}_{suf}.pdf')
                made.append((path, n))
            print('homework:', meta)
        pg.close()

    lq = S.get('lsq')
    if lq and args.only in (None, 'lsq'):
        need_seed(lq, 'lsq')
        hwcode = codes.get('homework') or S.get('homework_code')
        if not hwcode:
            fail('lsq needs the homework sheet code: build the homework in the same run, or give "homework_code"')
        par = {'seed': lq['seed'], 'hw': hwcode, 'nr': lq.get('nrev', 2), 'hs': lq.get('hsc', 'mix'),
               't': lq.get('mins', 20), 'l': ','.join(lq.get('review', []))}
        if lq.get('marks'):
            par['m'] = lq['marks']
        for k, v in (('c', cls), ('d', lq.get('date')), ('ti', lq.get('title'))):
            if v:
                par[k] = v
        pg, code, meta = open_sheet(browser, 'lsq.html', par)
        codes['lsq'] = code
        for which, suf in (('q', 'lsq'), ('a', 'lsq-answers')):
            path, n = save(pg, which, f'{base}_{suf}.pdf')
            made.append((path, n))
        print('lsq:', meta)
        pg.close()
    browser.close()

with open(os.path.join(OUT, f'{base}_codes.txt'), 'w') as fh:
    for k, v in codes.items():
        fh.write(f'{k}: {v}\n')
for path, n in made:
    print(f'{os.path.basename(path)}  ({n} page{"s" if n != 1 else ""})')
print('codes:', json.dumps(codes))
