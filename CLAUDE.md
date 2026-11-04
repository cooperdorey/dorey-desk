# Notes for Claude

This repo is the Dorey Desk site (cards for OneNote). Lesson content rules (atomisation, card order,
We Do levels) live in the Lesson Creator project; this file covers the repo format.

- One file per lesson: `lessons/<year>/<course>/<NN-topic>/<code>-<slug>.html`.
- Front matter `code:` and `title:` (title may contain `$…$` maths).
- Cards use the existing `.c` / `.h` / `.b` markup with `$…$` maths (rendered at runtime
  by KaTeX as MathML). Do not paste pre-rendered MathML.
- Worked solutions go inline as `<div class="ws">…</div>` under each question, including
  on model cards. The app hides them in lesson view.
- No exercise card. Labels with "We Do" / "your turn" go right; nothing else may use those words.
- New topic: create the folder and a `_meta.json` with `{"name": "…"}`.
- A topic's Dorey's Resource Book goes in the topic folder as `drb.pdf` (other editions as
  `drb-<label>.pdf`). The LaTeX source lives in the Lesson Creator project, not here; commit the
  compiled PDF. Choosing a topic shows Lessons / DRB; `#…/<topic>/drb` is the DRB page.
- Course `_meta.json` also has `short`, `colour` and `order` (colours chosen by Coop:
  11 ADV blue, 11 STD light green, 12 STD 1 light teal, 12 STD 2 dark purple, 12 ADV navy).
- Brackets: use plain `( )`; use `\left( … \right)` only around fractions. Don't use `\big`.
  (The app draws non-fraction `\left…\right` pairs at normal size so pairs always match.)
- Before committing, run `python3 scripts/build_manifest.py`; it must report no problems.
- Classroom tools: one self-contained page per tool in `classroom/`, registered in
  `classroom/classroom.json`. The seating chart is an SVG room plan (29 desks) where an uploaded .xlsx/.csv class list is placed onto desks and
  exported as an A4 PDF; uploaded files are read locally, and saved plans live in the browser's `localStorage` only (listed in a left side panel), never sent anywhere. Never put student names, rosters or exported seating files in this public repo, and
  never test with real names.
  New top-level site folders must also be added to the `cp -r` line in `.github/workflows/pages.yml`.
- Generators: one page per generator in `generators/`, registered in
  `generators/generators.json`. The question bank (`gen` functions, topics, lessons and each
  lesson's `marks`) lives in `generators/engine.js`, shared by the question generator, the
  LSQ generator (`lsq.html`, 2-page A4 quiz, PDF via the vendored jsPDF + html-to-image) and the
  homework generator (`homework.html`, two-page (double-sided) HSC-style Question 1 with parts (a), (b)… sorted
  by marks, at most two 1-mark parts, same PDF approach). A lesson's `marks` decides where its
  questions sit on the homework sheet, so set it to the HSC value. New lessons must also be APPENDED to the end of `CODE_ORDER`
  in engine.js (never reorder): the faint sheet code printed on LSQ and homework pages records the ticked
  lessons as bits in that order, and the build fails if a lesson is missing. The All / Yr 11 / Yr 12 / Clear buttons above each topic list come from
  `generators/picker.js` (load it after the page's own script); a topic's year is read from its `course`. They use the site's vendored KaTeX (MathML output), no CDNs.
  `generators/hsc-bank.js` (past HSC questions tagged to lessons; each entry has the paper wording and an
  optional `gen(R)` with new numbers) and `generators/week.js` (HSC draw modes, homework set builder, linked LSQ,
  sheet codes) load after engine.js on both pages. Run `node scripts/check_generators.js --all` before committing.
  Sheet codes: the homework code also records the lessons that ended up on the sheet; a linked LSQ's code is
  `homeworkCode~…`. Codes are read back in the on-screen lesson order, so keep engine.js lesson order stable.
  Question text from HSC papers is cited by year and question number; omit questions that need a diagram.
  In the question generator, test every generator function on many seeds before committing
  (all maths must parse in KaTeX; no `NaN`, `undefined`, `+ -` or `1x`).
