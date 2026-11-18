#!/usr/bin/env python3
"""Pack the whole Dorey Desk site into one self-contained HTML file that runs from disk.

    python3 scripts/build_single.py [output.html]        (default: build/dorey-desk.html)

Run build_manifest.py first. Every site file is stored inside the page: text files as JSON
strings, PDFs and icons as base64. A loader in the top page:
  - answers fetch() for site paths from the bundle (manifest, lessons, json lists),
  - runs <script src> files from the bundle,
  - opens the generator pages in a full-window frame (Back closes it); the classroom and admin
    tools, which keep data in the browser or open a folder, take over the whole page instead. A framed page is
    written out in full when opened (its scripts and the site's json inlined) as a blob: page, because a page
    opened from disk can't share objects with its frames; its site links come back to the top page by postMessage,
  - swaps PDF links (DRBs) for blob: URLs so they view and download.
The site itself is unchanged; this is only an offline copy.
"""
import base64, json, mimetypes, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'build' / 'dorey-desk.html'
DIRS = ['assets', 'lessons', 'generators', 'classroom', 'admin']
TEXT = {'.html', '.js', '.json', '.css', '.svg', '.txt', '.csv'}
BIN = {'.pdf', '.png', '.ico'}

def rel(p): return p.relative_to(ROOT).as_posix()

def collect():
    text, binary = {}, {}
    files = [ROOT / 'manifest.json'] + [p for d in DIRS for p in sorted((ROOT / d).rglob('*')) if p.is_file()]
    for p in files:
        ext = p.suffix.lower()
        if ext in TEXT:
            text[rel(p)] = p.read_text(encoding='utf-8')
        elif ext in BIN:
            mime = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
            binary[rel(p)] = [mime, base64.b64encode(p.read_bytes()).decode('ascii')]
    return text, binary

def resolve(base_dir, url):
    parts = [x for x in (base_dir.split('/') if base_dir else []) if x]
    for seg in url.split('/'):
        if seg in ('', '.'): continue
        if seg == '..':
            if parts: parts.pop()
        else: parts.append(seg)
    return '/'.join(parts)

# The top page's loader: unpacks the bundle, serves fetch() from it and opens the tool pages in a frame.
TOP_LOADER = r"""
(function(){
 var data=JSON.parse(document.getElementById('dd-bundle').textContent);
 var DD=window.__DD={text:data.text,bin:data.bin,blobs:{},pages:{}};
 DD.blob=function(p){if(!DD.blobs[p]){var b=DD.bin[p],s=atob(b[1]),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);
  DD.blobs[p]=URL.createObjectURL(new Blob([a],{type:b[0]}))}return DD.blobs[p]};
 var external=/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
 function resolve(url,base){var m=/^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(url),parts=(base||'').split('/').filter(Boolean);
  m[1].split('/').forEach(function(s){if(!s||s==='.')return;if(s==='..')parts.pop();else parts.push(s)});
  var p=parts.join('/');try{p=decodeURIComponent(p)}catch(e){}return{path:p,hash:m[3]||''}}
 window.__inc=function(p){var s=document.createElement('script');s.text=DD.text[p]||'';document.currentScript.after(s)};
 // a framed page is built when opened: its scripts and the site's json files are written into it, so it needs nothing from here
 var json={};Object.keys(DD.text).forEach(function(p){if(/\.json$/.test(p))json[p]=DD.text[p]});
 var jsonTag=JSON.stringify(json).replace(/<\//g,'<\\/');
 function pageHTML(path,whole){return DD.text[path]
  .replace('<!--dd-frame-boot-->',function(){return '<script>window.__DD_PAGE='+JSON.stringify(path)+';window.__DD_WHOLE='+!!whole+';window.__DD_JSON='+jsonTag+'<\/script><script>'+DD.text['__frame_loader.js']+'<\/script>'})
  .replace(/<script data-dd-inc="([^"]+)"><\/script>/g,function(m,p){return '<script>'+(DD.text[p]||'').replace(/<\/(script)/gi,'<\\/$1')+'<\/script>'})}
 // Tools that keep data in the browser or open a folder (classroom, admin) can't do that in a frame, so they take over
 // the whole page: the page reloads, skips its own scripts and writes the tool in their place (same file, same storage).
 var WHOLE=/^(classroom|admin)\//,pending=null;try{pending=sessionStorage.getItem('dd-page')}catch(e){}
 if(pending&&DD.text[pending]){window.__inc=function(){};document.documentElement.style.visibility='hidden';
  window.addEventListener('load',function(){var h=pageHTML(pending,true);document.open();document.write(h);document.close()});return}
 var frame=null;
 DD.open=function(path,hash){
  if(WHOLE.test(path)){try{sessionStorage.setItem('dd-page',path)}catch(e){return}
   history.pushState(null,'',location.pathname+location.search+(hash||''));location.reload();return}
  DD.close(true);if(!DD.pages[path])DD.pages[path]=URL.createObjectURL(new Blob([pageHTML(path)],{type:'text/html'}));
  frame=document.createElement('iframe');frame.id='dd-frame';frame.allow='clipboard-write';
  frame.setAttribute('style','position:fixed;inset:0;width:100vw;height:100vh;border:0;z-index:2147483647;background:#fff');
  frame.src=DD.pages[path]+(hash||'');document.body.appendChild(frame);document.documentElement.style.overflow='hidden';
  if(!(history.state&&history.state.ddPage))history.pushState({ddPage:path},'',location.href)};
 DD.close=function(quiet){if(!frame)return;frame.remove();frame=null;document.documentElement.style.overflow='';document.title=DD.title||document.title;
  if(!quiet&&history.state&&history.state.ddPage)history.back()};
 DD.home=function(hash){var had=!!frame;DD.close(true);if(had&&history.state&&history.state.ddPage)history.replaceState(null,'',location.href);
  var h=(hash||'#').replace(/^#?/,'#');if(location.hash!==h&&!(h==='#'&&!location.hash))location.hash=h;else window.dispatchEvent(new HashChangeEvent('hashchange'))};
 window.addEventListener('popstate',function(e){if(frame&&!(e.state&&e.state.ddPage))DD.close(true)});
 window.addEventListener('message',function(e){if(!frame||e.source!==frame.contentWindow||!e.data||!e.data.dd)return;var d=e.data;
  if(d.dd==='title'){DD.title=DD.title||document.title;document.title=d.title}
  else if(d.dd==='home')DD.home(d.hash);
  else if(d.dd==='open'&&DD.text[d.path])DD.open(d.path,d.hash)});
 var realFetch=window.fetch;
 window.fetch=function(input,init){var url=typeof input==='string'?input:(input&&input.url)||String(input);
  if(external.test(url))return realFetch.apply(this,arguments);
  var r=resolve(url);
  if(r.path in DD.text)return Promise.resolve(new Response(DD.text[r.path],{status:200}));
  if(r.path in DD.bin)return realFetch(DD.blob(r.path));
  return Promise.resolve(new Response('Not in the offline bundle: '+r.path,{status:404}))};
 // PDFs (DRBs): point src/href at blob: URLs
 function fix(el){['src','href'].forEach(function(a){var v=el.getAttribute&&el.getAttribute(a);if(!v||external.test(v))return;
  var r=resolve(v);if(r.path in DD.bin)el.setAttribute(a,DD.blob(r.path)+r.hash)})}
 function scan(n){if(n.nodeType!==1)return;fix(n);n.querySelectorAll&&n.querySelectorAll('[src],[href]').forEach(fix)}
 new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='attributes')fix(m.target);else m.addedNodes.forEach(scan)})})
  .observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','href']});
 document.addEventListener('DOMContentLoaded',function(){scan(document.documentElement)});
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.hasAttribute('download'))return;
  var v=a.getAttribute('href');if(!v||external.test(v))return;var r=resolve(v);
  if(/\.html$/.test(r.path)&&r.path in DD.text){e.preventDefault();DD.open(r.path,r.hash)}},true);
})();
"""

# A framed page's loader: serves fetch() for the site's json files and sends site links to the top page.
FRAME_LOADER = r"""
(function(){
 var BASE=window.__DD_PAGE.replace(/[^\/]*$/,''),J=window.__DD_JSON,external=/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
 function resolve(url){var m=/^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(url),parts=BASE.split('/').filter(Boolean);
  m[1].split('/').forEach(function(s){if(!s||s==='.')return;if(s==='..')parts.pop();else parts.push(s)});
  var p=parts.join('/');try{p=decodeURIComponent(p)}catch(e){}return{path:p,hash:m[3]||''}}
 var realFetch=window.fetch;
 window.fetch=function(input,init){var url=typeof input==='string'?input:(input&&input.url)||String(input);
  if(external.test(url))return realFetch.apply(this,arguments);var r=resolve(url);
  if(r.path in J)return Promise.resolve(new Response(J[r.path],{status:200,headers:{'Content-Type':'application/json'}}));
  return Promise.resolve(new Response('Not in the offline bundle: '+r.path,{status:404}))};
 // in a frame, tell the top page; as the whole page, reload into the site (or another tool)
 var WHOLE=window.__DD_WHOLE;
 function go(kind,path,hash){if(!WHOLE){parent.postMessage({dd:kind,path:path,hash:hash},'*');return}
  try{if(kind==='home')sessionStorage.removeItem('dd-page');else sessionStorage.setItem('dd-page',path)}catch(e){}
  history.pushState(null,'',location.pathname+location.search+(hash||''));location.reload()}
 if(WHOLE)window.addEventListener('popstate',function(){try{sessionStorage.removeItem('dd-page')}catch(e){}location.reload()});
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.hasAttribute('download'))return;
  var v=a.getAttribute('href');if(!v||external.test(v))return;var r=resolve(v);e.preventDefault();
  if(r.path===''||r.path==='index.html')go('home','',r.hash);
  else if(/\.html$/.test(r.path))go('open',r.path,r.hash)},true);
 if(!WHOLE)window.addEventListener('load',function(){parent.postMessage({dd:'title',title:document.title},'*')});
})();
"""

def page(path, html, text, binary, top=False):
    base = path.rsplit('/', 1)[0] if '/' in path else ''
    def icon(m):
        p = resolve(base, m.group(2).split('?')[0])
        if p in binary:
            mime, b64 = binary[p]
            return f'{m.group(1)}data:{mime};base64,{b64}"'
        if p in text and p.endswith('.svg'):
            return m.group(1) + 'data:image/svg+xml;base64,' + base64.b64encode(text[p].encode()).decode() + '"'
        return m.group(0)
    # favicons: drop the large touch icons, inline the small ones
    html = re.sub(r'<link rel="apple-touch-icon"[^>]*>\s*', '', html)
    html = re.sub(r'<link rel="manifest"[^>]*>\s*', '', html)
    html = re.sub(r'(<link rel="icon" href=")([^"]+)"', icon, html)
    def css(m):
        p = resolve(base, m.group(1).split('?')[0])
        return f'<style>\n{text[p]}\n</style>' if p in text else m.group(0)
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
    def script(m):
        p = resolve(base, m.group(1).split('?')[0])
        if p not in text: raise SystemExit(f'{path}: script {m.group(1)} not found')
        return f'<script>__inc({json.dumps(p)})</script>' if top else f'<script data-dd-inc="{p}"></script>'
    html = re.sub(r'<script src="([^"]+)"></script>', script, html)
    boot = f'<script>{TOP_LOADER}</script>' if top else '<!--dd-frame-boot-->'
    head = re.search(r'<head[^>]*>', html)
    if not head: raise SystemExit(f'{path}: no <head>')
    return html[:head.end()] + '\n' + boot + html[head.end():]

def main():
    if not (ROOT / 'manifest.json').exists(): raise SystemExit('Run python3 scripts/build_manifest.py first.')
    text, binary = collect()
    # framed pages: every html page outside lessons/ and assets/
    for p in [p for p in text if p.endswith('.html') and p.split('/')[0] in ('generators', 'classroom', 'admin')]:
        text[p] = page(p, text[p], text, binary)
    text['__frame_loader.js'] = FRAME_LOADER
    # the large icons only serve the installed-app manifest
    for p in [p for p in binary if p.startswith('assets/icons/') and not p.endswith(('-16.png', '-32.png'))]:
        del binary[p]
    bundle = json.dumps({'text': text, 'bin': binary}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    index = (ROOT / 'index.html').read_text(encoding='utf-8')
    out = page('index.html', index, text, binary, top=True)
    head = re.search(r'<head[^>]*>', out)
    out = out[:head.end()] + f'\n<script type="application/json" id="dd-bundle">{bundle}</script>' + out[head.end():]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(out, encoding='utf-8')
    print(f'{rel(OUT) if OUT.is_relative_to(ROOT) else OUT}: {len(out.encode())/1e6:.1f} MB, {len(text)} text files, {len(binary)} binary files')

if __name__ == '__main__':
    main()
