// Shared by the homework and LSQ generators. Loaded after engine.js and hsc-bank.js.
// - wires the HSC bank onto the lessons and draws a question in one of four modes
// - builds a homework sheet (the LSQ rebuilds the same sheet from its code to make its linked quiz)
// - builds a linked LSQ: one "twin" of each homework part (same skill, new numbers) plus review questions
// - reads and writes the sheet codes printed on the pages

// ================= HSC bank =================
HSC_BANK.forEach(e=>{const L=LESSONS[e.lesson];if(!L)throw new Error('HSC bank: unknown lesson '+e.lesson);(L.hsc=L.hsc||[]).push(e)});
const HSC_MODES=[['mix','HSC questions: as written and new numbers'],['as','HSC questions as written'],['new','HSC questions with new numbers'],['off','Generated questions only']];
const HSC_CODE={off:0,as:1,new:2,mix:3},HSC_FROM=['off','as','new','mix'];
const PART=i=>'('+String.fromCharCode(97+i)+')';

// One question for lesson L. When the lesson has HSC questions and mode is not 'off' an HSC question is used
// (as written, or the same question with new numbers); otherwise the lesson's own generator.
// `seen` holds question texts already on the sheet; `exclude` holds HSC ids not to reuse as written.
function drawQuestion(L,R,mode,seen,exclude){
 const pool=mode==='off'?[]:(L.hsc||[]);
 if(pool.length){
  const style=mode==='mix'?(R.next()<0.5?'as':'new'):mode;
  const free=pool.filter(e=>!seen.has(e.q)&&!(exclude&&exclude.has(e.id)));
  if(style==='as'&&free.length){const e=R.pick(free);return{q:e.q,sol:e.sol,ans:e.ans,marks:e.marks,hsc:{id:e.id,src:e.src,style:'as'}}}
  const withGen=pool.filter(e=>e.gen);
  if(withGen.length){const e=R.pick(withGen);let Q,t=0;do{Q=e.gen(R);t++}while((seen.has(Q.q)||Q.q===e.q)&&t<20);   // a 'new numbers' question is never the original
   if(!seen.has(Q.q)&&Q.q!==e.q)return{...Q,marks:e.marks,hsc:{id:e.id,src:e.src,style:'new'}}}
 }
 return L.gen(R)}
const hscLabel=Q=>Q.hsc?(Q.hsc.style==='as'?Q.hsc.src+' (as set)':'Adapted from '+Q.hsc.src+' (new numbers)'):'';

// ================= Homework sheet =================
const HW_MAX_ONE_MARK=2;   // HSC questions are mostly 2 and 3 mark parts; keep 1-mark parts as warm-ups
// Lessons are dealt round-robin across topics so the sheet spreads over everything ticked, and each part is kept
// only if it fits the marks still to fill. Parts are then ordered easier to harder (by marks).
function buildHomeworkSet(ids,target,seed,mode){const R=makeRng('hw|'+seed+'|'+ids.join(','));
 const byTopic=new Map();R.sample(ids,ids.length).forEach(id=>{const t=LESSONS[id].topic.id;if(!byTopic.has(t))byTopic.set(t,[]);byTopic.get(t).push(id)});
 byTopic.forEach(L=>L.sort((a,b)=>(LESSONS[b].marks>1)-(LESSONS[a].marks>1)));   // bigger lessons first, random order otherwise
 const deck=[];const lists=R.sample([...byTopic.values()],byTopic.size);let more=true;
 for(let i=0;more;i++){more=false;lists.forEach(L=>{if(i<L.length){deck.push(L[i]);more=true}})}
 const out=[],seen=new Set();let total=0,ones=0,misses=0,pos=0;
 const onlyOnes=deck.every(id=>(LESSONS[id].marks||2)===1);
 while(total<target&&misses<deck.length*4){const id=deck[pos%deck.length];pos++;const L=LESSONS[id];
  let Q,tries=0;do{Q=drawQuestion(L,R,mode,seen);tries++}while(seen.has(Q.q)&&tries<30);
  const mk=Q.marks||L.marks||2;
  if(seen.has(Q.q)||total+mk>target||(mk===1&&!onlyOnes&&ones>=HW_MAX_ONE_MARK)){misses++;continue}
  seen.add(Q.q);out.push({...Q,marks:mk,lesson:L,order:out.length});total+=mk;if(mk===1)ones++;misses=0}
 return out.sort((a,b)=>a.marks-b.marks||a.order-b.order)}

// ================= Linked LSQ =================
// hwParts: the parts of the homework sheet (in sheet order). Each gets a twin: a different question on the same
// skill. reviewIds: lessons from earlier weeks; nRev review questions are drawn from them after the twins.
// target > 0 trims the smallest twins until twins + review fit; target 0 keeps everything.
function buildLinkedQuiz(hwParts,reviewIds,nRev,target,seed,mode){
 const R=makeRng('lsq|link|'+seed+'|'+hwParts.map(p=>p.lesson.id).join(',')+'|'+reviewIds.join(','));
 const seen=new Set(hwParts.map(p=>p.q));                                   // a twin never repeats its homework part
 const exclude=new Set(hwParts.filter(p=>p.hsc).map(p=>p.hsc.id));          // nor reuses its HSC question as written
 const make=(L,extra)=>{let Q,t=0;do{Q=drawQuestion(L,R,mode,seen,exclude);t++}while(seen.has(Q.q)&&t<30);seen.add(Q.q);
  return{...Q,marks:Q.marks||L.marks||2,lesson:L,...extra}};
 const twins=hwParts.map((p,i)=>make(p.lesson,{kind:'twin',part:i}));
 const review=[];const pool=R.sample(reviewIds,reviewIds.length);
 for(let i=0;i<nRev&&pool.length;i++)review.push(make(LESSONS[pool[i%pool.length]],{kind:'review'}));
 const sum=a=>a.reduce((s,Q)=>s+Q.marks,0);
 if(target>0)while(sum(twins)+sum(review)>target&&twins.length>1){const lo=Math.min(...twins.map(Q=>Q.marks));let k=-1;twins.forEach((Q,i)=>{if(Q.marks===lo)k=i});twins.splice(k,1)}
 return[...twins,...review]}

// ================= Sheet codes =================
// Homework: seed.marks.hscMode.ticked.used   (older sheets: seed.marks.ticked)
//   ticked = lessons ticked when the sheet was made; used = lessons that ended up on it.
// LSQ: seed.minutes.marks.hscMode.ticked     (older: seed.minutes.marks.ticked)
// Linked LSQ: homeworkCode~seed.minutes.marks.hscMode.reviewCount.reviewLessons   (marks 0 = as many as the twins need)
const cleanSeed=s=>String(s).replace(/[.~]/g,'-');
// A sheet depends on the order its lessons are given in. The pages list them in the order they appear on screen
// (engine.js order), so codes are always read back in that order.
const DESK_ORDER=Object.keys(LESSONS),deskOrder=ids=>DESK_ORDER.filter(id=>ids.includes(id));
function hwCode(seed,marks,mode,ticked,used){return[seed,marks,HSC_CODE[mode],encodeLessons(ticked),encodeLessons(used)].join('.')}
function readHwCode(code){const p=String(code).trim().split('.');
 if(p.length===5){const marks=+p[1],mode=HSC_FROM[+p[2]],ids=deskOrder(decodeLessons(p[3])),used=deskOrder(decodeLessons(p[4]));
  if(!ids.length||isNaN(marks)||!mode)return null;return{seed:p[0],marks,mode,ids,used:used.length?used:ids}}
 if(p.length===3){const c=readSheetCode(code,1);return c&&{seed:c.seed,marks:c.nums[0],mode:'off',ids:deskOrder(c.ids),used:deskOrder(c.ids)}}
 return null}
function lsqCode(seed,mins,marks,mode,ticked){return[seed,mins,marks,HSC_CODE[mode],encodeLessons(ticked)].join('.')}
function linkedLsqCode(hw,seed,mins,marks,mode,nrev,review){return hw+'~'+[seed,mins,marks,HSC_CODE[mode],nrev,encodeLessons(review)].join('.')}
function readLsqCode(code){const t=String(code).trim(),i=t.indexOf('~'),hw=i<0?null:t.slice(0,i),rest=i<0?t:t.slice(i+1),p=rest.split('.');
 if(hw!==null){if(p.length!==6||!readHwCode(hw))return null;const mins=+p[1],marks=+p[2],mode=HSC_FROM[+p[3]],nrev=+p[4],ids=deskOrder(decodeLessons(p[5]));
  return[mins,marks,nrev].some(isNaN)||!mode?null:{hw,seed:p[0],mins,marks,mode,nrev,ids}}
 if(p.length===4){const c=readSheetCode(rest,2);return c&&{hw:null,seed:c.seed,mins:c.nums[0],marks:c.nums[1],mode:'off',nrev:0,ids:deskOrder(c.ids)}}
 if(p.length===5){const mins=+p[1],marks=+p[2],mode=HSC_FROM[+p[3]],ids=deskOrder(decodeLessons(p[4]));
  return!ids.length||[mins,marks].some(isNaN)||!mode?null:{hw:null,seed:p[0],mins,marks,mode,nrev:0,ids}}
 return null}
