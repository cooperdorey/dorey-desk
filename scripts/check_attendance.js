#!/usr/bin/env node
/* Checks the attendance tracker's logic (admin/attendance-core.js) on made-up data.
   Run before committing changes to it:  node scripts/check_attendance.js
   Every name below is invented. Never put real names or SRNs in this file. */
'use strict';
const C = require('../admin/attendance-core.js');
let fails = 0, passes = 0;
function ok(cond, msg) { if (cond) passes++; else { fails++; console.error('FAIL: ' + msg) } }
function eq(a, b, msg) { ok(JSON.stringify(a) === JSON.stringify(b), msg + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')') }

const MAIN_HEAD = ['Student Name', 'Enrolled Days', 'Attendance Rate', 'Whole Days Absent', 'Whole Attendance Rate', 'Whole Leave', 'Whole Sick', 'Whole Suspended', 'Whole Unjustified', 'Whole Unexplained', 'Partial Absence Count', 'Partial Duration (Mins)', 'Partial Equivalent Days Lost', 'Partial Leave (Mins)', 'Partial Sick (Mins)', 'Partial Unjustified (Mins)', 'Partial Unexplained (Mins)'];
const SHORT_HEAD = ['Student Name', 'Enrolled Days', 'Attendance Rate', 'Whole Days Absent', 'Partial Absence Count', '<=120min Absence Count', '<=120min Absence Duration(mins)', '<=120min Equivalent Days Lost', '<=120min Leave(mins)', '<=120min Sick(mins)', '<=120min Unjustified(mins)', '<=120min Unexplained(min)'];
const srn = n => String(100000000 + n);
const nm = n => 'Testsurname' + n + ', Testgiven' + n + ' - ' + srn(n);
// s: {n, enr, wh, unex, pc}  ->  a main-export row
const mainRow = s => [nm(s.n), s.enr, 0, s.wh, 0, 0, s.wh - (s.unex || 0), 0, 0, s.unex || 0, s.pc || 0, (s.pc || 0) * 200, (s.pc || 0) / 2, 0, 0, 0, 0];
const shortRow = s => [nm(s.n), s.enr, 0, s.wh, 0, 0, s.smins || 0, 0, 0, 0, 0, s.smins || 0];
function mainRows(list, total) {
  const rows = [MAIN_HEAD].concat(list.map(mainRow));
  if (total !== false) rows.push(['Total', list.reduce((a, s) => a + s.enr, 0), 0, list.reduce((a, s) => a + s.wh, 0), 0, 0, 0, 0, 0, 0, list.reduce((a, s) => a + (s.pc || 0), 0), 0, 0, 0, 0, 0, 0]);
  return rows;
}
const shortRows = list => [SHORT_HEAD].concat(list.map(shortRow));
const rec = (enr, wh, pc, unex) => ({ enr, wh, pe2: pc || 0, pc: pc || 0, unex: unex || 0 });

/* ---- names ---- */
eq(C.splitStudent('Smith, John - 123456789'), { name: 'Smith, John', srn: '123456789' }, 'plain name');
eq(C.splitStudent("O'Brien-Smith, Mary-Jane - 123456789").srn, '123456789', 'hyphens and apostrophes');
eq(C.splitStudent('Smith, John-123456789').srn, '123456789', 'no spaces round the dash');
ok(C.splitStudent('Smith, John') === null, 'no SRN');
ok(C.splitStudent('Smith, John - 12') === null, 'SRN too short');
ok(C.splitStudent('') === null && C.splitStudent(null) === null, 'blank name');

/* ---- reading an export ---- */
{
  const list = [{ n: 1, enr: 50, wh: 2 }, { n: 2, enr: 50, wh: 0, pc: 2 }];
  const rows = mainRows(list).concat([['', 50, 0, 1]]);                 // a row with no name or SRN
  rows.push([nm(1), 5, 0, 1]);                                          // the same SRN repeated
  const ing = C.ingestRows(rows);
  eq(ing.kind, 'main', 'main export detected'); eq(ing.students.size, 2, 'two students'); ok(ing.total && ing.total.enr === 100, 'total row kept apart');
  eq(ing.bad, 1, 'a row with no name or SRN is counted and skipped'); eq(ing.dup, 1, 'repeated SRN merged');
  eq(ing.students.get(srn(1)).enr, 55, 'repeated SRN added'); eq(ing.students.get(srn(2)).pe2, 2, 'two partials = 2 half days');
  eq(C.ingestRows(shortRows([{ n: 1, enr: 50, wh: 0, smins: 90 }])).kind, 'short', 'short export detected');
  eq(C.ingestRows([['Student Name', '.', 'Improving Attendance'], ['x', 1, 2]]).kind, 'other', 'rolling export ignored');
  const noSrn = C.ingestRows([MAIN_HEAD, ['Smith, John', 49, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);
  eq(noSrn.bad, 1, 'row without SRN counted'); eq(noSrn.students.size, 0, 'and skipped');
  ok(C.checkTotals({ kind: 'main', students: ing.students, total: { enr: 999, wh: 2, pc: 2 } }).length >= 1, 'total mismatch found');
  eq(C.checkTotals({ kind: 'main', students: C.ingestRows(mainRows(list)).students, total: C.ingestRows(mainRows(list)).total }), [], 'total matches');
}

/* ---- bands and tiers sit exactly on their boundaries ---- */
{
  const t = (enr, wh, pc) => C.tierOf(rec(enr, wh, pc));
  eq(t(50, 5), 0, '90% exactly is a regular attender'); eq(t(50, 5, 1), 1, '89% is tier 1');
  eq(t(100, 20), 1, '80% exactly is tier 1'); eq(t(100, 20, 1), 2, '79.5% is tier 2');
  eq(t(100, 50), 2, '50% exactly is tier 2'); eq(t(100, 50, 1), 3, '49.5% is tier 3');
  eq(t(100, 0), 0, 'perfect'); eq(t(0, 0), null, 'no enrolled days');
  ok(C.geRate(rec(100, 5), 95), '95% exactly counts as 95%'); ok(!C.geRate(rec(100, 5, 1), 95), '94.5% does not');
  ok(C.isPerfect(rec(40, 0)) && !C.isPerfect(rec(40, 0, 1)), 'only zero days lost is 100%');
  eq(C.pctText(rec(2000, 200, 1)), '89.9%', '89.975% shows as 89.9%, never 90.0%'); ok(!C.geRate(rec(2000, 200, 1), 90), '89.975% is not 90%');
  eq(C.pctText(rec(49, 10, 0)), '79.5%', 'one decimal');
  eq(C.pctText(rec(7, 0, 0)), '100.0%', '100%');
}

/* ---- summary counts are nested ---- */
{
  const s = C.summarise([rec(100, 0), rec(100, 4), rec(100, 5), rec(100, 15), rec(100, 30), rec(100, 60)]);
  eq([s.n, s.g90, s.g95, s.p100, s.t1, s.t2, s.t3], [6, 3, 3, 1, 1, 1, 1], 'bands and tiers (rates 100, 96, 95, 85, 70, 40)');
  ok(s.g90 >= s.g95 && s.g95 >= s.p100, '90 >= 95 >= 100');
  eq(s.g90 + s.t1 + s.t2 + s.t3, s.n, 'every student is in exactly one of regular or tiers 1 to 3');
}

/* ---- terms are added by days, not by averaging rates ---- */
{
  const st = C.newStore();
  C.addSnapshot(st, 'main', 1, 10, C.ingestRows(mainRows([{ n: 1, enr: 50, wh: 5 }, { n: 2, enr: 50, wh: 0 }])), 'T1W10.xlsx');
  C.addSnapshot(st, 'main', 2, 10, C.ingestRows(mainRows([{ n: 1, enr: 10, wh: 0 }])), 'T2W10.xlsx');   // student 2 left
  C.addSnapshot(st, 'main', 2, 5, C.ingestRows(mainRows([{ n: 1, enr: 5, wh: 5 }])), 'T2W05.xlsx');        // an earlier week is ignored
  const sc = C.scopeRecs(st, 2), a = sc.get(srn(1)).rec;
  eq([a.enr, a.wh], [60, 5], 'days added across terms'); eq(C.pctText(a), '91.6%', 'combined rate is not the average of 90% and 100%');
  eq(sc.get(srn(2)).rec.enr, 50, 'a student who left keeps their earlier term');
  eq(C.scopeRecs(st, 1).get(srn(1)).rec.enr, 50, 'through term 1 stops at term 1');
  eq(C.finalSnap(st, 'main', 2).week, 10, 'the highest week is the term’s final file');
}

/* ---- CWU: unexplained days, two blocks ---- */
{
  ok(C.cwuHit(rec(100, 30, 0, 30), 30), '30 unexplained days is flagged'); ok(!C.cwuHit(rec(100, 30, 0, 29), 30), '29 is not');
  ok(!C.cwuHit(rec(190, 60, 0, 57), 60), 'a straight count: enrolled days do not scale it'); ok(C.cwuHit(rec(40, 40, 0, 30), 30), 'a short enrolment still counts 30 days');
  const st = C.newStore(), add = (t, list) => C.addSnapshot(st, 'main', t, 10, C.ingestRows(mainRows(list)), 't' + t);
  add(1, [{ n: 1, enr: 50, wh: 20, unex: 20 }, { n: 2, enr: 50, wh: 5, unex: 5 }, { n: 3, enr: 50, wh: 30, unex: 30 }]);
  let bl = C.cwuBlocks(st);
  eq(bl.map(b => b.missing), [[2], [3, 4]], 'a block with a term missing says which');
  ok(bl[0].students.size === 0 && bl[1].students.size === 0, 'no students until the block is complete');
  add(2, [{ n: 1, enr: 48, wh: 15, unex: 12 }, { n: 2, enr: 48, wh: 2, unex: 2 }, { n: 3, enr: 48, wh: 20, unex: 1 }]);
  bl = C.cwuBlocks(st);
  const b1 = new Map(Array.from(bl[0].students, ([k, e]) => [k, e.rec]));
  eq([b1.get(srn(1)).unex, b1.get(srn(1)).enr], [32, 98], 'Terms 1 and 2 are added together');
  eq(Array.from(bl[0].students.values()).filter(e => C.cwuHit(e.rec, 30)).map(e => e.srn).sort(), [srn(1), srn(3)], 'flagged in block 1: 32 and 31 days, not 7');
  eq(bl[1].missing, [3, 4], 'block 2 still waits for Terms 3 and 4');
  add(3, [{ n: 1, enr: 50, wh: 10, unex: 10 }, { n: 3, enr: 50, wh: 25, unex: 25 }, { n: 4, enr: 50, wh: 12, unex: 12 }]);
  add(4, [{ n: 1, enr: 47, wh: 8, unex: 8 }, { n: 3, enr: 47, wh: 6, unex: 6 }, { n: 4, enr: 47, wh: 20, unex: 20 }]);
  bl = C.cwuBlocks(st);
  eq(Array.from(bl[1].students.values()).filter(e => C.cwuHit(e.rec, 30)).map(e => e.srn).sort(), [srn(3), srn(4)], 'block 2 is its own 100 days, not added to block 1');
  eq(bl[1].students.has(srn(2)), false, 'a student absent from Terms 3 and 4 is not in block 2');
}

/* ---- recoverable days ---- */
{
  eq(C.recoverDays(rec(100, 15), 90), 5, '15 lost in 100 needs 5 back to reach 90%');
  eq(C.recoverDays(rec(100, 10), 90), 0, 'exactly 90% needs nothing'); eq(C.recoverDays(rec(100, 4), 90), 0, 'above target needs nothing');
  ok(Math.abs(C.recoverDays(rec(48, 6), 90) - 1.2) < 1e-9, 'enrolled days scale the allowance: 4.8 may be lost'); eq(C.recoverDays(rec(0, 0), 90), 0, 'no days, nothing to recover');
  eq(C.recoverDays(rec(100, 14, 2), 90), 5, 'a partial over 120 minutes costs half a day (14 + 1 lost)');
  eq(C.recoverDays(rec(100, 6), 95), 1, 'the target can be 95%');
  const recs = [rec(100, 2), rec(100, 15), rec(100, 12), rec(100, 30), rec(100, 60), rec(0, 0)];
  const im = C.impact(recs, 90, 5);
  eq(im.tiers.map(r => r.n), [1, 2, 1, 1], 'students per tier; a student with no days is left out'); eq(im.n, 5, 'five students counted');
  eq(im.tiers.map(r => r.need), [0, 7, 20, 50], 'days to target per tier (5 + 2, 20, 50)');
  eq(im.tiers.map(r => r.within), [0, 2, 0, 0], 'two students are within 5 days of target');
  eq([im.lost, im.need, im.enr], [119, 77, 500], 'totals'); ok(Math.abs(im.rate - 0.762) < 1e-9 && Math.abs(im.gain - 0.154) < 1e-9, 'rate and gain on the school rate');
  const im95 = C.impact(recs, 95, 5); eq(im95.tiers[0].need, 0, '95% target: the 98% student needs nothing');
  eq(C.impact([rec(100, 8)], 95, 5).tiers[0].need, 3, 'a 92% student has days to win back at a 95% target');
}

/* ---- early warning ---- */
{
  // Cumulative term-to-date files, weeks 1 to 5 (5 school days a week). Each student: days lost so far by week.
  const plan = {
    1: { lost: [0, 0, 0, 0, 0], tag: 'steady perfect' },
    2: { lost: [0, 0, 0, 3, 5], tag: 'sudden drop' },
    3: { lost: [0, 1, 2, 3, 4], tag: 'slow and steady, no drop' },
    4: { lost: [0, 0, 0, 0, 0], unex: [0, 0, 0, 0, 2], tag: 'unexplained cluster' },
    5: { lost: [0, 0, 0, 0, 0], smins: [0, 0, 0, 0, 400], tag: 'short partial spike' },
    6: { lost: [0, 0, 0, 0, 0], tag: 'joins in week 5', from: 5 }
  };
  const st = C.newStore();
  for (let w = 1; w <= 5; w++) {
    const list = [], sl = [];
    for (const k of Object.keys(plan)) {
      const p = plan[k]; if (p.from && w < p.from) continue;
      const enr = p.from ? (w - p.from + 1) * 5 : w * 5, s = { n: +k, enr, wh: p.lost[w - 1], unex: p.unex ? p.unex[w - 1] : 0, smins: p.smins ? p.smins[w - 1] : 0 };
      list.push(s); sl.push(s);
    }
    C.addSnapshot(st, 'main', 4, w, C.ingestRows(mainRows(list)), 'T4W0' + w + '.xlsx');
    C.addSnapshot(st, 'short', 4, w, C.ingestRows(shortRows(sl)), 'T4W0' + w + '_short.xlsx');
  }
  const ev = C.earlyWarning(st, 4, 5, {});
  const by = n => ev.flagged.find(r => r.srn === srn(n));
  ok(!by(1), 'a steady perfect student is not flagged');
  ok(by(2) && by(2).flags.includes('drop'), 'sudden drop flagged'); ok(by(2) && by(2).flags.includes('band'), 'and fell out of the regular band');
  eq(ev.baseWeek, 3, 'week 5 is compared with week 3'); ok(by(2) && Math.abs(by(2).baseline - 1) < 1e-9, 'baseline is the earlier term-to-date rate');
  ok(by(2) && Math.abs(by(2).lostW - 5) < 1e-9 && by(2).enrW === 10, 'window is the last 10 days, 5 lost');
  ok(!by(3), 'a slow, steady student is not flagged (2 lost in the fortnight, rate barely moved)');
  ok(!!by(4), 'unexplained cluster flagged'); eq(by(4).flags, ['unex'], 'unexplained cluster only');
  ok(by(5) && by(5).flags.includes('short') && by(5).shortW === 400, 'short-partial spike flagged');
  ok(!by(6), 'a student who only joined this fortnight has no baseline, so no drop');
  ok(ev.rows.find(r => r.srn === srn(6)).baseline === null, 'new student has a null baseline');
  // the same student flagged on the Friday before as well? week 4 vs week 2: lost 3 of 10 days vs 0 earlier -> drop of 30 pts
  const ev4 = C.earlyWarning(st, 4, 4, {}); ok(ev4.flagged.some(r => r.srn === srn(2)), 'also flagged the Friday before');
  eq(C.earlyWarning(st, 4, 5, {}).flagged.find(r => r.srn === srn(2)).streak, 2, 'two weeks in a row counted');
  // thresholds are adjustable
  ok(!C.earlyWarning(st, 4, 5, { drop: 90 }).flagged.some(r => r.srn === srn(2) && r.flags.includes('drop')), 'a higher drop threshold removes the flag');
  // first weeks of a term compare with the start of term
  const w1 = C.evaluateWeek(st, 4, 1, {}); ok(w1.fromTermStart, 'week 1 has no earlier file');
  // missing short file switches that signal off
  delete st.short[4][5]; ok(!C.earlyWarning(st, 4, 5, {}).shortOK, 'no short file, signal off');
  // back-dated edits can make a count go down; it is clamped, never negative
  const st2 = C.newStore();
  C.addSnapshot(st2, 'main', 4, 1, C.ingestRows(mainRows([{ n: 1, enr: 5, wh: 2, unex: 2 }])), 'a');
  C.addSnapshot(st2, 'main', 4, 3, C.ingestRows(mainRows([{ n: 1, enr: 15, wh: 1, unex: 0 }])), 'b');
  const e2 = C.evaluateWeek(st2, 4, 3, {}); ok(e2.rows.every(r => r.lostW >= 0 && r.unexW >= 0 && r.winRate <= 1), 'negative differences are clamped to zero');
  // previous term is the baseline at the start of a term
  const st3 = C.newStore();
  C.addSnapshot(st3, 'main', 3, 10, C.ingestRows(mainRows([{ n: 1, enr: 50, wh: 0 }])), 't3');
  C.addSnapshot(st3, 'main', 4, 1, C.ingestRows(mainRows([{ n: 1, enr: 5, wh: 4 }])), 't4');
  const e3 = C.earlyWarning(st3, 4, 1, {}); ok(e3.prevTermBaseline && e3.flagged.length === 1 && e3.flagged[0].baseline === 1, 'week 1 is compared with last term');
}

/* ---- rosters ---- */
{
  const csv = 'Student Name,Removed\r\n"Smith, John - 123456789",\r\n"Brown, Ann - 123456780",Y\r\n"No Srn",\r\n';
  const r = C.parseRosterRows(C.readCsv(csv));
  eq(r.list.length, 2, 'two valid roster rows'); eq(r.skipped, 1, 'one without an SRN skipped'); ok(r.list[1].removed && !r.list[0].removed, 'Removed flag read');
  eq(C.parseRosterRows(C.readCsv('"Smith, John - 123456789"\n"Brown, Ann - 123456780"\n')).list.length, 2, 'a file with no header still reads');
  eq(C.parseRosterRows(C.readCsv('Student Name\r\n"Smith, John - 123456789"\r\n')).list.length, 1, 'a name-only roster reads');
  const back = C.parseRosterRows(C.readCsv(C.rosterCSV(r.list)));
  eq(back.list.map(x => [x.srn, x.removed]), r.list.map(x => [x.srn, x.removed]), 'saving and reading again keeps everything');
  const idx = C.rosterIndex([{ raw: 'a', name: 'a', srn: '1', removed: false }, { raw: 'b', name: 'b', srn: '2', removed: false }], [{ raw: 'b', name: 'b', srn: '2', removed: false }, { raw: 'c', name: 'c', srn: '3', removed: true }]);
  eq(idx.get('1').year, '11', 'year 11'); ok(idx.get('2').conflict && idx.get('2').year === null, 'on both lists is a conflict'); ok(idx.get('3').removed && idx.get('3').year === '12', 'removed keeps its year');
  ok(!idx.has('4'), 'unknown SRN is unassigned');
}

/* ---- students who most likely left ---- */
{
  const roster = n => ({ srn: srn(n), name: 'Name' + n, year: '12', removed: false });
  // (1) not in the latest term's export at all
  const st = C.newStore();
  C.addSnapshot(st, 'main', 2, 10, C.ingestRows(mainRows([{ n: 1, enr: 50, wh: 0 }, { n: 2, enr: 50, wh: 0 }, { n: 3, enr: 50, wh: 0 }])), 'T2W10.xlsx');
  C.addSnapshot(st, 'main', 3, 10, C.ingestRows(mainRows([{ n: 1, enr: 50, wh: 0 }, { n: 3, enr: 50, wh: 0 }])), 'T3W10.xlsx');   // student 2 is gone
  const rs = [1, 2, 3, 4].map(roster).concat([Object.assign(roster(5), { removed: true })]);
  const left = C.possiblyLeft(st, rs);
  eq(left.map(r => [r.srn, r.last, r.why]), [[srn(2), 2, 'absent'], [srn(4), null, 'absent']], 'in term 2 but not term 3, and in no export at all');
  ok(!left.some(r => r.srn === srn(5)), 'already removed students are not suggested again');
  eq(C.possiblyLeft(C.newStore(), rs), [], 'nothing loaded, nothing suggested');
  // (2) still named, but enrolled days stopped going up (weekly files, 5 days a week)
  const wk = C.newStore();
  C.addSnapshot(wk, 'main', 2, 10, C.ingestRows(mainRows([1, 2, 3, 4].map(n => ({ n, enr: 50, wh: 0 })))), 'T2W10.xlsx');
  const enr = { 1: [5, 10, 15, 20], 2: [5, 10, 10, 10], 3: [5, 10, 15, 20], 4: [0, 0, 5, 10] };       // 2 stopped after week 2, 4 joined in week 3
  for (let w = 1; w <= 4; w++) C.addSnapshot(wk, 'main', 3, w, C.ingestRows(mainRows([1, 2, 3, 4].filter(n => enr[n][w - 1] > 0).map(n => ({ n, enr: enr[n][w - 1], wh: 0 })))), 'T3W0' + w + '.xlsx');
  const l2 = C.possiblyLeft(wk, [1, 2, 3, 4].map(roster));
  eq(l2.map(r => [r.srn, r.why, r.enr, r.since]), [[srn(2), 'stalled', 10, 2]], 'enrolled days stopped at 10 since week 2; a late joiner is not flagged');
  // one file for the term: fewer days than the rest only counts if they were already here last term
  const one = C.newStore();
  C.addSnapshot(one, 'main', 2, 10, C.ingestRows(mainRows([{ n: 1, enr: 50, wh: 0 }, { n: 2, enr: 50, wh: 0 }])), 'T2W10.xlsx');
  C.addSnapshot(one, 'main', 3, 10, C.ingestRows(mainRows([{ n: 1, enr: 50, wh: 0 }, { n: 2, enr: 38, wh: 0 }, { n: 3, enr: 38, wh: 0 }])), 'T3W10.xlsx');
  eq(C.possiblyLeft(one, [1, 2, 3].map(roster)).map(r => [r.srn, r.why]), [[srn(2), 'stalled']], 'left during the term (was here last term); a new student with fewer days is not flagged');
  // everybody the same: nobody flagged
  const same = C.newStore();
  for (let w = 1; w <= 3; w++) C.addSnapshot(same, 'main', 3, w, C.ingestRows(mainRows([1, 2].map(n => ({ n, enr: w * 5, wh: 0 })))), 'x' + w);
  eq(C.possiblyLeft(same, [1, 2].map(roster)), [], 'nobody flagged when everyone is still enrolled');
}

/* ---- days to spare above 90% ---- */
eq(C.spareDays(rec(50, 4)), 1, '50 days: 5 may be missed, 4 lost, 1 spare'); ok(C.spareDays(rec(50, 6)) < 0, 'below 90% is negative');

console.log(passes + ' checks passed' + (fails ? ', ' + fails + ' FAILED' : ''));
process.exit(fails ? 1 : 0);
