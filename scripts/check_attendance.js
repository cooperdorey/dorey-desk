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

/* ---- unexplained days ---- */
{
  ok(C.unexGe(rec(100, 30, 0, 30), 30), '30 in 100 is 30%'); ok(!C.unexGe(rec(100, 30, 0, 29), 30), '29 in 100 is not');
  ok(C.unexGe(rec(190, 60, 0, 57), 30), 'the same rule scales with enrolled days'); ok(!C.unexGe(rec(0, 0, 0, 0), 30), 'no days, no flag');
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

/* ---- days to spare above 90% ---- */
eq(C.spareDays(rec(50, 4)), 1, '50 days: 5 may be missed, 4 lost, 1 spare'); ok(C.spareDays(rec(50, 6)) < 0, 'below 90% is negative');

console.log(passes + ' checks passed' + (fails ? ', ' + fails + ' FAILED' : ''));
process.exit(fails ? 1 : 0);
