/* Dorey Desk · Attendance tracker core.
   Pure logic for admin/attendance.html: reads the school-system attendance exports (.xlsx or .csv),
   keeps one snapshot per term and week, and works out bands, tiers, unexplained lists and early warnings.
   No student data lives in this file. The page holds everything in memory only. */
(function (root) {
'use strict';

/* ---------- reading spreadsheets (all in the browser) ---------- */
async function inflateRaw(u8) {
  const out = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(out).arrayBuffer());
}
function unzip(buf) {                                   // returns async name -> text (or null)
  const dv = new DataView(buf), u8 = new Uint8Array(buf);
  let e = buf.byteLength - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('not a zip');
  const count = dv.getUint16(e + 10, true), files = {}; let p = dv.getUint32(e + 16, true);
  for (let k = 0; k < count; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('bad zip');
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    files[new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl))] = { method: dv.getUint16(p + 10, true), size: dv.getUint32(p + 20, true), at: dv.getUint32(p + 42, true) };
    p += 46 + nl + xl + cl;
  }
  return async name => {
    const f = files[name]; if (!f) return null;
    const start = f.at + 30 + dv.getUint16(f.at + 26, true) + dv.getUint16(f.at + 28, true), data = u8.subarray(start, start + f.size);
    return new TextDecoder().decode(f.method === 0 ? data : await inflateRaw(data));
  };
}
const xml = s => new root.DOMParser().parseFromString(s, 'application/xml');
const all = (n, tag) => Array.from(n.getElementsByTagNameNS('*', tag));
const colIndex = ref => { let n = 0; for (const ch of ref.replace(/[^A-Za-z]/g, '').toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1 };
async function readXlsx(buf) {                          // first sheet as an array of rows of strings
  const read = await unzip(buf);
  const wb = xml(await read('xl/workbook.xml')), sheet = all(wb, 'sheet')[0];
  const rid = sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || sheet.getAttribute('r:id');
  const rel = all(xml(await read('xl/_rels/workbook.xml.rels')), 'Relationship').find(r => r.getAttribute('Id') === rid);
  const target = rel.getAttribute('Target'), path = target.startsWith('/') ? target.slice(1) : 'xl/' + target;
  const ss = await read('xl/sharedStrings.xml');
  const strings = ss ? all(xml(ss), 'si').map(si => all(si, 't').map(t => t.textContent).join('')) : [];
  const rows = [];
  for (const row of all(xml(await read(path)), 'row')) {
    const out = [];
    for (const c of all(row, 'c')) {
      const t = c.getAttribute('t'), v = all(c, 'v')[0], idx = colIndex(c.getAttribute('r') || '');
      out[idx < 0 ? out.length : idx] = t === 's' ? strings[+v.textContent] : t === 'inlineStr' ? all(c, 't').map(x => x.textContent).join('') : v ? v.textContent : '';
    }
    rows.push(Array.from(out, x => x == null ? '' : x));
  }
  return rows;
}
function readCsv(text) {
  text = String(text || '').replace(/^﻿/, '');
  const first = text.split(/\r?\n/)[0] || '', d = first.includes('\t') ? '\t' : first.includes(',') || !first.includes(';') ? ',' : ';';
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += ch }
    else if (ch === '"') q = true;
    else if (ch === d) { row.push(cur); cur = '' }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = '' }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  return rows;
}
function toCSV(cols, rows) {
  const cell = v => { v = String(v == null ? '' : v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v };
  return [cols.join(',')].concat(rows.map(r => cols.map(c => cell(r[c])).join(','))).join('\r\n') + '\r\n';
}

/* ---------- students ---------- */
const hkey = h => String(h == null ? '' : h).trim().toLowerCase().replace(/\s+/g, ' ');
const num = v => { const n = Number(String(v == null ? '' : v).replace(/,/g, '').trim()); return isFinite(n) ? n : 0 };
const nonblank = r => r.some(c => String(c == null ? '' : c).trim() !== '');

// "Last, First - SRN": the SRN is whatever follows the last dash, and it must be digits.
function splitStudent(raw) {
  const s = String(raw == null ? '' : raw).replace(/\s+/g, ' ').trim();
  const m = /^(.*?)\s*[-–]\s*(\d{6,12})$/.exec(s);
  return m ? { name: m[1].trim(), srn: m[2] } : null;
}

/* ---------- export files ---------- */
const MAIN = { enr: 'enrolled days', wh: 'whole days absent', leave: 'whole leave', sick: 'whole sick', susp: 'whole suspended',
  unj: 'whole unjustified', unex: 'whole unexplained', pc: 'partial absence count', pmins: 'partial duration (mins)',
  pe: 'partial equivalent days lost', pleave: 'partial leave (mins)', psick: 'partial sick (mins)',
  punj: 'partial unjustified (mins)', punex: 'partial unexplained (mins)' };
const SHORT = { enr: 'enrolled days', sc: '<=120min absence count', smins: '<=120min absence duration(mins)',
  sleave: '<=120min leave(mins)', ssick: '<=120min sick(mins)', sunj: '<=120min unjustified(mins)', sunex: '<=120min unexplained(min)' };
const MAIN_KEYS = Object.keys(MAIN).concat(['pe2']);
const SHORT_KEYS = Object.keys(SHORT);

// rows -> { kind: 'main' | 'short' | 'other', students: Map(srn -> rec), total, bad, dup }
function ingestRows(rows) {
  rows = rows.filter(nonblank);
  const empty = { kind: 'other', students: new Map(), total: null, bad: 0, dup: 0 };
  if (!rows.length) return empty;
  const head = rows[0].map(hkey);
  const kind = head.includes('whole unexplained') && head.includes('enrolled days') ? 'main'
    : head.includes('<=120min absence duration(mins)') && head.includes('enrolled days') ? 'short' : 'other';
  if (kind === 'other') return empty;
  const map = kind === 'main' ? MAIN : SHORT, keys = kind === 'main' ? MAIN_KEYS : SHORT_KEYS;
  const idx = {}; Object.keys(map).forEach(k => idx[k] = head.indexOf(map[k]));
  let nameCol = head.indexOf('student name'); if (nameCol < 0) nameCol = head.indexOf('name'); if (nameCol < 0) nameCol = 0;
  const students = new Map(); let total = null, bad = 0, dup = 0;
  for (const r of rows.slice(1)) {
    const raw = String(r[nameCol] == null ? '' : r[nameCol]).trim();
    const rec = {}; Object.keys(map).forEach(k => rec[k] = idx[k] < 0 ? 0 : num(r[idx[k]]));
    if (kind === 'main') rec.pe2 = Math.round(2 * rec.pe);                 // half days: a partial over 120 minutes costs 0.5
    if (/^total$/i.test(raw)) { total = rec; continue }
    const s = splitStudent(raw);
    if (!s) { bad++; continue }
    if (students.has(s.srn)) { const o = students.get(s.srn); keys.forEach(k => o[k] = (o[k] || 0) + (rec[k] || 0)); dup++; continue }
    rec.name = s.name; students.set(s.srn, rec);
  }
  return { kind, students, total, bad, dup };
}

/* ---------- snapshots: one per term and week ---------- */
function newStore() { return { main: {}, short: {} } }
function addSnapshot(store, kind, term, week, ing, file) {
  const bucket = store[kind]; (bucket[term] = bucket[term] || {});
  const replaced = !!bucket[term][week];
  bucket[term][week] = { term, week, kind, file: file || '', students: ing.students, total: ing.total, bad: ing.bad, dup: ing.dup };
  return replaced;
}
const weeksOf = (store, kind, term) => Object.keys((store[kind] || {})[term] || {}).map(Number).sort((a, b) => a - b);
const termsOf = (store, kind) => Object.keys(store[kind] || {}).map(Number).sort((a, b) => a - b);
function finalSnap(store, kind, term) {
  const w = weeksOf(store, kind, term); return w.length ? store[kind][term][w[w.length - 1]] : null;
}

/* ---------- maths on one record ---------- */
const lost2 = r => 2 * (r.wh || 0) + (r.pe2 || 0);              // days lost, in half days
const lostDays = r => lost2(r) / 2;
const rateOf = r => r.enr > 0 ? 1 - lost2(r) / (2 * r.enr) : null;
// integer-exact tests: attendance >= pct %
const geRate = (r, pct) => r.enr > 0 && (2 * r.enr - lost2(r)) * 100 >= pct * 2 * r.enr;
const isPerfect = r => r.enr > 0 && lost2(r) === 0;
function tierOf(r) {                                            // null no data, 0 regular (90%+), 1, 2, 3
  if (!(r.enr > 0)) return null;
  if (geRate(r, 90)) return 0; if (geRate(r, 80)) return 1; if (geRate(r, 50)) return 2; return 3;
}
// percentage shown to one decimal, truncated so 89.97% never reads as 90.0%
function pctText(r) {
  if (!(r.enr > 0)) return '';
  return (Math.floor((2 * r.enr - lost2(r)) * 1000 / (2 * r.enr)) / 10).toFixed(1) + '%';
}
function pctOf(x) { return x == null ? '' : (Math.floor(x * 1000 + 1e-9) / 10).toFixed(1) + '%' }
const unexGe = (r, pct) => r.enr > 0 && (r.unex || 0) * 100 >= pct * r.enr;

function zero() { const o = {}; MAIN_KEYS.concat(SHORT_KEYS).forEach(k => o[k] = 0); return o }
function addInto(acc, rec, keys) { keys.forEach(k => acc[k] = (acc[k] || 0) + (rec[k] || 0)) }
function diffRec(a, b) {
  const o = {}; MAIN_KEYS.forEach(k => o[k] = Math.max(0, (a[k] || 0) - (b ? (b[k] || 0) : 0))); return o;
}

/* ---------- scope: terms 1..N added together (days are summed, rates are never averaged) ---------- */
function scopeRecs(store, through) {
  const out = new Map();
  for (const t of termsOf(store, 'main')) {
    if (t > through) continue;
    const snap = finalSnap(store, 'main', t), sh = finalSnap(store, 'short', t);
    for (const [srn, rec] of snap.students) {
      let e = out.get(srn);
      if (!e) { e = { srn, name: rec.name, rec: zero(), byTerm: {}, hasShort: false }; out.set(srn, e) }
      e.name = rec.name; e.byTerm[t] = rec; addInto(e.rec, rec, MAIN_KEYS);
    }
    if (sh) for (const [srn, rec] of sh.students) {
      const e = out.get(srn); if (!e) continue;
      e.hasShort = true; addInto(e.rec, rec, ['sc', 'smins', 'sleave', 'ssick', 'sunj', 'sunex']);
    }
  }
  return out;
}

function summarise(recs) {
  const s = { n: 0, enr: 0, lost2: 0, g90: 0, g95: 0, p100: 0, t1: 0, t2: 0, t3: 0, nodata: 0,
    leave: 0, sick: 0, susp: 0, unj: 0, unex: 0, pc: 0, pleave: 0, psick: 0, punj: 0, punex: 0,
    sc: 0, sleave: 0, ssick: 0, sunj: 0, sunex: 0, smins: 0 };
  for (const r of recs) {
    const t = tierOf(r); if (t == null) { s.nodata++; continue }
    s.n++; s.enr += r.enr; s.lost2 += lost2(r);
    if (geRate(r, 90)) s.g90++; if (geRate(r, 95)) s.g95++; if (isPerfect(r)) s.p100++;
    if (t === 1) s.t1++; else if (t === 2) s.t2++; else if (t === 3) s.t3++;
    ['leave', 'sick', 'susp', 'unj', 'unex', 'pc', 'pleave', 'psick', 'punj', 'punex', 'sc', 'sleave', 'ssick', 'sunj', 'sunex', 'smins'].forEach(k => s[k] += r[k] || 0);
  }
  s.rate = s.enr > 0 ? 1 - s.lost2 / (2 * s.enr) : null;
  return s;
}

/* ---------- checks ---------- */
function checkTotals(snap) {                                    // does the Total row match the student rows?
  if (!snap.total) return [];
  const keys = snap.kind === 'main' ? ['enr', 'wh', 'pc'] : ['enr', 'sc', 'smins'];
  const sum = {}; keys.forEach(k => sum[k] = 0);
  for (const r of snap.students.values()) keys.forEach(k => sum[k] += r[k] || 0);
  return keys.filter(k => Math.abs(sum[k] - (snap.total[k] || 0)) > 1e-6).map(k => ({ key: k, rows: sum[k], total: snap.total[k] || 0 }));
}

/* ---------- early warning: this Friday's term-to-date file minus an earlier Friday's ---------- */
const DEFAULTS = { unexPct: 30, unexMinDays: 20, drop: 15, minLost: 3, unex: 2, shortMins: 300, minDays: 5 };

function evaluateWeek(store, term, week, P) {
  P = Object.assign({}, DEFAULTS, P || {});
  const cur = ((store.main || {})[term] || {})[week]; if (!cur) return null;
  const earlier = weeksOf(store, 'main', term).filter(w => w < week);
  let baseWeek = null;
  if (week - 2 >= 1) {
    for (let i = earlier.length - 1; i >= 0; i--) if (earlier[i] <= week - 2) { baseWeek = earlier[i]; break }
    if (baseWeek == null && earlier.length) baseWeek = earlier[earlier.length - 1];
  }
  const base = baseWeek == null ? null : store.main[term][baseWeek];
  const prev = !base ? (() => { for (let t = term - 1; t >= 1; t--) { const f = finalSnap(store, 'main', t); if (f) return f } return null })() : null;
  const curS = ((store.short || {})[term] || {})[week] || null;
  const baseS = base ? (((store.short || {})[term] || {})[baseWeek] || null) : null;
  const shortOK = !!curS && (base ? !!baseS : true);
  const rows = [];
  for (const [srn, rec] of cur.students) {
    const b = base ? base.students.get(srn) : null;
    const w = diffRec(rec, b);
    if (w.enr < P.minDays) continue;
    const baseline = base ? (b && b.enr > 0 ? rateOf(b) : null) : (prev && prev.students.get(srn) ? rateOf(prev.students.get(srn)) : null);
    const winRate = 1 - lost2(w) / (2 * w.enr), lostW = lost2(w) / 2;
    const flags = [];
    if (baseline != null && (baseline - winRate) * 100 >= P.drop - 1e-9 && lostW >= P.minLost) flags.push('drop');
    if (baseline != null && baseline >= 0.9 - 1e-9 && winRate <= 0.8 + 1e-9 && lostW >= 1) flags.push('band');
    if (w.unex >= P.unex) flags.push('unex');
    let sW = null;
    if (shortOK) {
      const sc = curS.students.get(srn), sb = baseS ? baseS.students.get(srn) : null;
      sW = Math.max(0, (sc ? sc.smins : 0) - (sb ? sb.smins : 0));
      if (sW >= P.shortMins) flags.push('short');
    }
    rows.push({ srn, name: rec.name, baseline, winRate, drop: baseline == null ? null : baseline - winRate,
      lostW, enrW: w.enr, unexW: w.unex, shortW: sW, flags });
  }
  return { term, week, baseWeek, fromTermStart: !base, prevTermBaseline: !base && !!prev, shortOK,
    windowDays: Math.max(0, ...rows.map(r => r.enrW)), rows };
}
// flagged rows for a week, each with how many Fridays in a row (up to 4) the student has been flagged
function earlyWarning(store, term, week, P) {
  const ev = evaluateWeek(store, term, week, P); if (!ev) return null;
  const streak = new Map();
  const sets = [];
  for (let k = 0; k < 4; k++) {
    const e = k === 0 ? ev : evaluateWeek(store, term, week - k, P);
    if (!e) break;
    sets.push(new Set(e.rows.filter(r => r.flags.length).map(r => r.srn)));
  }
  for (const r of ev.rows) {
    if (!r.flags.length) continue;
    let n = 0; for (const s of sets) { if (s.has(r.srn)) n++; else break }
    streak.set(r.srn, n);
  }
  ev.flagged = ev.rows.filter(r => r.flags.length).map(r => Object.assign({}, r, { streak: streak.get(r.srn) || 1 }))
    .sort((a, b) => b.streak - a.streak || (b.drop == null ? -1 : b.drop) - (a.drop == null ? -1 : a.drop) || b.lostW - a.lostW);
  return ev;
}
// regular attenders with the fewest days left before they fall under 90%
function spareDays(r) { return 0.1 * r.enr - lostDays(r) }

/* ---------- rosters ---------- */
// A roster file has a "Student Name" column ("Last, First - SRN") and an optional "Removed" column.
function parseRosterRows(rows) {
  rows = rows.filter(nonblank);
  const list = []; let skipped = 0;
  if (!rows.length) return { list, skipped };
  const head = rows[0].map(hkey);
  let nameCol = 0, remCol = -1, start = 0;
  if (head.includes('student name') || head.includes('name') || head.includes('removed') || !splitStudent(rows[0][0])) {
    start = 1; nameCol = Math.max(0, head.indexOf('student name') >= 0 ? head.indexOf('student name') : head.indexOf('name')); remCol = head.indexOf('removed');
  }
  const seen = new Set();
  for (const r of rows.slice(start)) {
    const raw = String(r[nameCol] == null ? '' : r[nameCol]).trim(); if (!raw) continue;
    const s = splitStudent(raw);
    if (!s) { skipped++; continue }
    if (seen.has(s.srn)) continue; seen.add(s.srn);
    list.push({ raw, name: s.name, srn: s.srn, removed: remCol >= 0 && /^(y|yes|1|true|x|removed)/i.test(String(r[remCol] == null ? '' : r[remCol]).trim()) });
  }
  return { list, skipped };
}
const rosterCSV = list => toCSV(['Student Name', 'Removed'], list.map(r => ({ 'Student Name': r.raw, Removed: r.removed ? 'Y' : '' })));
// srn -> { year: '11' | '12' | null, conflict, removed, name, raw }
function rosterIndex(y11, y12) {
  const idx = new Map();
  const put = (list, year) => list.forEach(r => {
    const e = idx.get(r.srn);
    if (!e) idx.set(r.srn, { year, conflict: false, removed: r.removed, name: r.name, raw: r.raw });
    else { e.conflict = true; e.year = null; e.removed = e.removed && r.removed }
  });
  put(y11, '11'); put(y12, '12');
  return idx;
}

const api = { readXlsx, readCsv, toCSV, splitStudent, ingestRows, newStore, addSnapshot, weeksOf, termsOf, finalSnap,
  lost2, lostDays, rateOf, geRate, isPerfect, tierOf, pctText, pctOf, unexGe, scopeRecs, summarise, checkTotals,
  DEFAULTS, evaluateWeek, earlyWarning, spareDays, parseRosterRows, rosterCSV, rosterIndex, zero };
root.AttCore = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
