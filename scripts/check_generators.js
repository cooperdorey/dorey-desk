#!/usr/bin/env node
// Checks the generators without a browser:  node scripts/check_generators.js [--all] [--seeds N]
//  - every HSC bank entry (as set, and its new-number version on many seeds): maths parses in KaTeX,
//    no NaN / undefined / "+ -" / "1x", and the answer agrees with a numeric check where the entry supplies one
//  - homework sets and linked LSQs build for many seeds in all four HSC modes; sheet codes round-trip
//  - --all also runs every lesson's own generator through the same text checks
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),gen=path.join(root,'generators');
const katex=require(path.join(root,'assets/vendor/katex.min.js'));
const SEEDS=+(process.argv.includes('--seeds')?process.argv[process.argv.indexOf('--seeds')+1]:300);
const ALL=process.argv.includes('--all');

// engine.js, hsc-bank.js and week.js share top-level names, so run them as one script
const src=['engine.js','hsc-bank.js','week.js'].map(f=>fs.readFileSync(path.join(gen,f),'utf8')).join('\n');
const api=vm.runInNewContext(src+'\n({TOPICS,LESSONS,DESK_ORDER,HSC_BANK,makeRng,drawQuestion,buildHomeworkSet,buildLinkedQuiz,hwCode,readHwCode,lsqCode,linkedLsqCode,readLsqCode,readSheetCode,sheetCode,CODE_ORDER,HSC_FROM,hscLabel})',{});
const {TOPICS,LESSONS,DESK_ORDER,HSC_BANK,makeRng,drawQuestion,buildHomeworkSet,buildLinkedQuiz,hwCode,readHwCode,lsqCode,linkedLsqCode,readLsqCode,hscLabel}=api;

let bad=0;const fail=(where,msg)=>{bad++;if(bad<=40)console.log('FAIL',where,'-',msg)};
const BAD=/NaN|undefined|Infinity|\+ -|- -|\+ \+|(^|[^\d.\w])1x|\(\)|\\left\(\\right\)/;
function mathOf(s){const out=[];String(s).replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g,(m,a,b)=>{out.push(a||b)});return out}
function checkText(where,Q){const parts=[Q.q,...(Q.sol||[]),Q.ans];
 parts.forEach((s,i)=>{if(typeof s!=='string'||!s.trim())return fail(where,'empty text '+i);
  if(BAD.test(s))fail(where,'pattern in: '+s.slice(0,160));
  mathOf(s).forEach(m=>{try{katex.renderToString(m,{throwOnError:true,output:'mathml'})}catch(e){fail(where,'KaTeX: '+e.message.slice(0,100)+' in '+m.slice(0,100))}})})}
const close=(a,b)=>Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(a),Math.abs(b));
function checkNumbers(where,c){if(!c)return;
 if(c.f&&c.df){let n=0;for(let i=0;i<24;i++){const x=0.3+i*0.043,h=1e-6,num=(c.f(x+h)-c.f(x-h))/(2*h),ex=c.df(x);
   if(!isFinite(num)||!isFinite(ex)||Math.abs(c.f(x))>1e12||Math.abs(ex)>1e12)continue;n++;
   if(Math.abs(num-ex)>1e-4*Math.max(1,Math.abs(ex),Math.abs(num)))return fail(where,`derivative differs at x=${x.toFixed(3)}: ${num} vs ${ex}`)}
  if(n<4)fail(where,'too few points to check the derivative')}
 const x0=c.x0!==undefined?c.x0:c.p;
 if(x0!==undefined&&c.f&&c.df){if(c.val!==undefined&&!close(c.df(x0),c.val))fail(where,`value at x0: ${c.df(x0)} vs ${c.val}`);
  if(c.m!==undefined&&!close(c.df(x0),c.m))fail(where,`gradient: ${c.df(x0)} vs ${c.m}`);
  if(c.y0!==undefined&&!close(c.f(x0),c.y0))fail(where,`y0: ${c.f(x0)} vs ${c.y0}`);
  if(c.c!==undefined&&!close(c.y0-c.m*x0,c.c))fail(where,'intercept')}
 if(c.q!==undefined&&c.a1!==undefined){[[c.m1,c.k1],[c.m2,c.k2]].forEach(([m,k])=>{if(!close(m*c.p+k,c.q))fail(where,'tangent does not pass through the point')})}
 if(c.fp!==undefined&&!close((c.fp*c.g-c.f*c.gp)/(c.g*c.g),c.val))fail(where,'quotient value')}

// ---- HSC bank ----
const ids=new Set();
HSC_BANK.forEach(e=>{const w='bank '+e.id;
 if(ids.has(e.id))fail(w,'duplicate id');ids.add(e.id);
 if(!LESSONS[e.lesson])fail(w,'unknown lesson '+e.lesson);
 if(!/^HSC 20\d\d Q\d+/.test(e.src))fail(w,'src should start "HSC 20xx Qn": '+e.src);
 if(!(e.marks>=1&&e.marks<=6))fail(w,'marks');
 checkText(w+' (as set)',e);
 if(!e.gen){console.log('note:',e.id,'has no new-number version');return}
 for(let s=0;s<SEEDS;s++){const R=makeRng(w+s),Q=e.gen(R);checkText(`${w} seed ${s}`,Q);checkNumbers(`${w} seed ${s}`,Q.chk);
  if(Q.q===e.q&&s>20)break}})
console.log(`HSC bank: ${HSC_BANK.length} entries, ${HSC_BANK.filter(e=>e.gen).length} with new-number versions`);

// ---- every lesson's own generator (optional) ----
if(ALL){let n=0;Object.values(LESSONS).forEach(L=>{for(let s=0;s<SEEDS;s++){let Q;try{Q=L.gen(makeRng(L.id+s))}catch(e){fail('lesson '+L.id,'threw '+e.message);break}checkText(`lesson ${L.id} seed ${s}`,Q);n++}});console.log('lesson generators checked:',n)}

// ---- sets and codes ----
const dd=TOPICS.find(t=>t.id==='12adv-differentiation').lessons.map(l=>l.id),dc=TOPICS.find(t=>/differentiation|rates/i.test(t.id)&&t.id!=='12adv-differentiation');
const reviewPool=TOPICS.find(t=>t.lessons.some(l=>l.id==='dc-chain')).lessons.map(l=>l.id);
['mix','as','new','off'].forEach(mode=>{let hscSeen=0;
 for(let s=0;s<Math.min(SEEDS,120);s++){const seed='s'+s,ticked=DESK_ORDER.filter(id=>[...dd,'dc-tangent','dc-chain'].includes(id)),set=buildHomeworkSet(ticked,20,seed,mode),w=`homework ${mode} ${seed}`;
  const total=set.reduce((a,Q)=>a+Q.marks,0);if(total>20||total<14)fail(w,'marks '+total);
  if(new Set(set.map(Q=>Q.q)).size!==set.length)fail(w,'duplicate question');
  if(mode==='off'&&set.some(Q=>Q.hsc))fail(w,'HSC question in off mode');
  set.forEach((Q,i)=>{checkText(`${w} part ${i}`,Q);if(Q.hsc)hscSeen++});
  const used=[...new Set(set.map(Q=>Q.lesson.id))],code=hwCode(seed,20,mode,ticked,used),back=readHwCode(code);
  if(!back||back.seed!==seed||back.marks!==20||back.mode!==mode||back.ids.join()!==ticked.join()||back.used.join()!==DESK_ORDER.filter(i=>used.includes(i)).join())fail(w,'homework code round trip '+code);
  const rebuilt=buildHomeworkSet(back.ids,back.marks,back.seed,back.mode);if(rebuilt.map(Q=>Q.q).join('|')!==set.map(Q=>Q.q).join('|'))fail(w,'rebuild differs');
  const quiz=buildLinkedQuiz(rebuilt,reviewPool.slice(0,3),2,0,'q'+s,mode),wq=`linked LSQ ${mode} ${seed}`;
  if(quiz.length!==rebuilt.length+2)fail(wq,'twin count');
  quiz.forEach((Q,i)=>{checkText(`${wq} q${i}`,Q);if(Q.kind==='twin'){if(Q.lesson.id!==rebuilt[Q.part].lesson.id)fail(wq,'twin lesson');if(Q.q===rebuilt[Q.part].q)fail(wq,'twin repeats homework part');
    if(Q.hsc&&Q.hsc.style==='as'&&rebuilt.some(p=>p.hsc&&p.hsc.id===Q.hsc.id))fail(wq,'twin reuses the homework HSC question')}});
  const lc=linkedLsqCode(code,'q'+s,20,0,mode,2,reviewPool.slice(0,3)),lb=readLsqCode(lc);
  if(!lb||lb.hw!==code||lb.seed!=='q'+s||lb.nrev!==2||lb.mode!==mode||lb.ids.length!==3)fail(wq,'linked code round trip '+lc);
  const trimmed=buildLinkedQuiz(rebuilt,[],0,10,'q'+s,mode);if(trimmed.reduce((a,Q)=>a+Q.marks,0)>10&&trimmed.length>1)fail(wq,'trim to 10 marks')}
 console.log(`mode ${mode}: sets and linked quizzes checked${mode==='off'?'':', HSC parts drawn: '+hscSeen}`)});
// older codes still open
const old=api.sheetCode('abc',[20],[ 'dd-exp','dd-ln']),o=readHwCode(old);if(!o||o.mode!=='off'||o.ids.length!==2)fail('old homework code','not read');
const oldq=api.sheetCode('abc',[20,20],['dd-exp']),oq=readLsqCode(oldq);if(!oq||oq.hw!==null||oq.mode!=='off')fail('old LSQ code','not read');
const nl=lsqCode('abc',20,20,'mix',['dd-exp']),nlr=readLsqCode(nl);if(!nlr||nlr.mode!=='mix')fail('new LSQ code','not read');

console.log(bad?`\n${bad} problem${bad>1?'s':''}`:'\nAll checks passed');process.exit(bad?1:0);
