#!/usr/bin/env node
// Checks the Standard 1 LSQ question bank without a browser:  node scripts/check_std1.js [--seeds N] [--show lessonId]
//  - every lesson's generator, on many seeds: maths parses in KaTeX, no NaN / undefined / "+ -" / "1x", marks are 1-3,
//    and the question's own chk() (an independent recomputation) passes where it supplies one
//  - every lesson gives a reasonable variety of different questions
//  - sheet codes round-trip and cannot be mistaken for an Advanced LSQ code
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),gen=path.join(root,'generators');
const katex=require(path.join(root,'assets/vendor/katex.min.js'));
const SEEDS=+(process.argv.includes('--seeds')?process.argv[process.argv.indexOf('--seeds')+1]:300);
const SHOW=process.argv.includes('--show')?process.argv[process.argv.indexOf('--show')+1]:null;

// engine.js and std1-bank.js share the global scope on the page, so run them as one script
const src=['engine.js','std1-bank.js'].map(f=>fs.readFileSync(path.join(gen,f),'utf8')).join('\n');
const api=vm.runInNewContext(src+'\n({S1,makeRng})',{});
const {S1,makeRng}=api;

let bad=0;const fail=(where,msg)=>{bad++;if(bad<=40)console.log('FAIL',where,'-',msg)};
const BAD=/NaN|undefined|Infinity|\+ -|- -|\+ \+|(^|[^\d.\w])1x|\(\)|\\left\(\\right\)|,\s*,|\.\./;
// split a string the way KaTeX auto-render does ($$…$$ and $…$, a backslash skips the next character, so \$ inside maths is a dollar sign)
function scan(s){const maths=[];let text='',i=0;
 while(i<s.length){
  if(s[i]==='$'){const disp=s[i+1]==='$',open=disp?2:1;let j=i+open,found=-1;
   while(j<s.length){if(s[j]==='\\'){j+=2;continue}
    if(disp?(s[j]==='$'&&s[j+1]==='$'):s[j]==='$'){found=j;break}j++}
   if(found<0){text+=s.slice(i);break}
   maths.push(s.slice(i+open,found));i=found+open;text+=' ';continue}
  text+=s[i];i++}
 return{maths,text}}
function checkText(where,Q){const parts=[Q.q,...(Q.sol||[]),Q.ans];
 parts.forEach((s,i)=>{if(typeof s!=='string'||!s.trim())return fail(where,'empty text '+i);
  if(BAD.test(s))fail(where,'pattern in: '+s.slice(0,200));
  const {maths,text}=scan(s);
  // a $ left over outside maths would start a stray maths block
  if(/\$/.test(text))fail(where,'stray $ outside maths: '+s.slice(0,160));
  if(maths.some(m=>!m.trim()))fail(where,'empty maths in: '+s.slice(0,160));
  maths.forEach(m=>{try{katex.renderToString(m,{throwOnError:true,output:'mathml'})}catch(e){fail(where,'KaTeX: '+e.message.slice(0,100)+' in '+m.slice(0,100))}})})}

let total=0;
for(const L of Object.values(S1.LESSONS)){
 const seen=new Set();
 for(let s=0;s<SEEDS;s++){
  let Q;try{Q=L.gen(makeRng(L.id+s))}catch(e){fail('lesson '+L.id,'seed '+s+' threw '+e.message);break}
  const w=`${L.id} seed ${s}`;total++;
  if(!(Q.marks>=1&&Q.marks<=3))fail(w,'marks '+Q.marks);
  if(!Array.isArray(Q.sol)||!Q.sol.length)fail(w,'no solution lines');
  checkText(w,Q);
  if(Q.chk&&!Q.chk())fail(w,'its own check failed: '+Q.q.slice(0,160));
  seen.add(Q.q);
  if(SHOW===L.id&&s<(+process.env.N||8))console.log('\n'+Q.q+'\n  '+Q.sol.join('\n  ')+'\n  => '+Q.ans+'   ['+Q.marks+']')}
 const variety=seen.size/SEEDS;
 if(seen.size<Math.min(SEEDS,40)*0.5)fail('lesson '+L.id,`only ${seen.size} different questions in ${SEEDS} seeds`);
 if(!SHOW)console.log(`${L.id.padEnd(14)} ${String(seen.size).padStart(4)} different in ${SEEDS}`)}
console.log(`\n${Object.keys(S1.LESSONS).length} lessons, ${total} questions checked`);

// ---- sheet codes ----
const all=S1.DESK_ORDER;
if(all.some(id=>!S1.CODE_ORDER.includes(id)))fail('codes','a lesson is missing from CODE_ORDER');
if(new Set(S1.CODE_ORDER).size!==S1.CODE_ORDER.length)fail('codes','CODE_ORDER lists a lesson twice');
if(S1.CODE_ORDER.some(id=>!S1.LESSONS[id]))fail('codes','CODE_ORDER names a lesson that does not exist');
for(const pick of [all,[all[0]],[all[5],all[12],all[28]],all.filter((_,i)=>i%3===0)]){
 const code=S1.lsqCode('abc12',20,18,pick),back=S1.readLsqCode(code);
 if(!back||back.seed!=='abc12'||back.mins!==20||back.marks!==18||back.ids.join()!==pick.join())fail('codes','round trip '+code)}
if(S1.readLsqCode('abc.20.20.3.1f'))fail('codes','an Advanced-style code was accepted');
if(S1.readLsqCode('abc.20.20.s1.0'))fail('codes','an empty lesson list was accepted');

console.log(bad?`\n${bad} problem${bad>1?'s':''}`:'\nAll checks passed');process.exit(bad?1:0);
