#!/usr/bin/env node
// Checks the tutorial generator without a browser:  node scripts/check_tutorial.js [--seeds N]
//  - every question template, on many seeds: maths parses in KaTeX, no NaN / undefined / "+ -" / "1x",
//    and the printed answer agrees with the template's own independent numeric check (chk)
//  - tutorials build for every length and difficulty: total time within 2 minutes of the target, no repeated question,
//    easiest first, and the same seed always gives the same tutorial
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),gen=path.join(root,'generators');
const katex=require(path.join(root,'assets/vendor/katex.min.js'));
const SEEDS=+(process.argv.includes('--seeds')?process.argv[process.argv.indexOf('--seeds')+1]:300);

const src=['engine.js','tutorial-bank.js'].map(f=>fs.readFileSync(path.join(gen,f),'utf8')).join('\n');
const {TUT,TOPICS,makeRng,buildTutorial}=vm.runInNewContext(src+'\n({TUT,TOPICS,makeRng,buildTutorial})',{});

let bad=0;const fail=(where,msg)=>{bad++;if(bad<=40)console.log('FAIL',where,'-',msg)};
const BAD=/NaN|undefined|Infinity|\+ -|- -|\+ \+|(^|[^\d.\w])1x|\(\)|\\left\(\\right\)|\\big|\\Big|\bnull\b/;
const mathOf=s=>{const out=[];String(s).replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g,(m,a,b)=>{out.push(a||b)});return out};
function checkText(where,Q){
 [Q.q,...(Q.sol||[]),Q.ans].forEach((s,i)=>{
  if(typeof s!=='string'||!s.trim())return fail(where,'empty text '+i);
  if(BAD.test(s))fail(where,'pattern in: '+s.slice(0,200));
  if((s.replace(/\$\$/g,'').match(/\$/g)||[]).length%2)fail(where,'odd number of $ in: '+s.slice(0,200));
  mathOf(s).forEach(m=>{try{katex.renderToString(m,{throwOnError:true,output:'mathml'})}catch(e){fail(where,'KaTeX: '+e.message.slice(0,100)+' in '+m.slice(0,100))}})})}

// ---- templates ----
const ids=new Set(),topicIds=new Set(TOPICS.map(t=>t.id));
TUT.forEach(t=>{const w='template '+t.id;
 if(ids.has(t.id))fail(w,'duplicate id');ids.add(t.id);
 if(!topicIds.has(t.topic))fail(w,'unknown topic '+t.topic);
 if(![2,3].includes(t.level))fail(w,'level');
 if(t.mins!==Math.round(t.marks*1.8))fail(w,"mins not 1.8 per mark");
 if(!t.hint)fail(w,'missing hint');
 if(!/^(Original question|(Similar to|Style of) HSC 20(2[0-6]) Q\d+(\([a-z]\))?)$/.test(t.src))fail(w,'bad source label: '+t.src);
 const seen=new Set();let made=0,nulls=0;
 for(let s=0;s<SEEDS;s++){const Q=t.gen(makeRng(w+s));
  if(!Q){nulls++;continue}
  made++;seen.add(Q.q);checkText(`${w} seed ${s}`,Q);
  if(typeof Q.chk!=='function')fail(`${w} seed ${s}`,'no chk');
  else{let ok;try{ok=Q.chk()}catch(e){ok=false}if(!ok)fail(`${w} seed ${s}`,'numeric check failed: '+Q.q.slice(0,160))}}
 if(made<SEEDS*0.5)fail(w,'too many redraws ('+nulls+')');
 if(seen.size<5)fail(w,'only '+seen.size+' different questions in '+SEEDS+' seeds');
 console.log(`${t.id.padEnd(26)} ${String(seen.size).padStart(4)} distinct of ${made}`)});
console.log(`\n${TUT.length} templates`);

// ---- building tutorials ----
const all=TUT.map(t=>t.id);
const subsets=[all,TUT.filter(t=>t.topic.startsWith('11')).map(t=>t.id),TUT.filter(t=>t.topic.startsWith('12')).map(t=>t.id),
 TUT.filter(t=>t.topic==='11adv-functions').map(t=>t.id),[TUT[0].id,TUT[1].id,TUT[2].id]];
let built=0;
subsets.forEach((ticked,si)=>[20,25,30].forEach(target=>[0,2,3].forEach(level=>{
 for(let s=0;s<60;s++){const seed='b'+s,w=`tutorial subset ${si} ${target}min level ${level} ${seed}`;
  const set=buildTutorial(ticked,target,level,seed);
  const pool=TUT.filter(t=>ticked.includes(t.id)&&(!level||t.level===level));
  if(!pool.length){if(set.length)fail(w,'questions from an empty pool');continue}
  built++;
  const total=set.reduce((a,Q)=>a+Q.mins,0),maxFit=pool.reduce((a,t)=>a+t.mins,0);
  if(!set.length)return fail(w,'empty tutorial');
  if(total>target+2)fail(w,`total ${total} over target`);
  if(total<target-2&&maxFit>=target-2&&pool.length>=4)fail(w,`total ${total} under target`);
  if(new Set(set.map(Q=>Q.q)).size!==set.length)fail(w,'repeated question');
  for(let i=1;i<set.length;i++)if(set[i].level<set[i-1].level)fail(w,'not easiest first');
  set.forEach((Q,i)=>{checkText(`${w} q${i}`,Q);let ok=false;try{ok=Q.chk()}catch(e){}if(!ok)fail(`${w} q${i}`,'numeric check failed')});
  if(s<5&&buildTutorial(ticked,target,level,seed).map(Q=>Q.q).join('|')!==set.map(Q=>Q.q).join('|'))fail(w,'not repeatable')}})));
console.log('tutorials built and checked:',built);
console.log(bad?`\n${bad} problem${bad>1?'s':''}`:'\nAll checks passed');process.exit(bad?1:0);
