// Question bank for the Year 12 Mathematics Standard 1 LSQ generator (lsq-std1.html).
// Loads after engine.js and borrows only its makeRng, gcd, Fr and F. Everything else lives inside S1,
// so none of the Advanced names (TOPICS, LESSONS, CODE_ORDER …) are touched.
// Each lesson's gen(R) returns {q, sol:[…], ans, marks} (and sometimes chk(), a check the test script runs).
// Text only: no diagrams, so triangles are described in words. Money is always inside maths (\$) because a bare $ starts maths.
const S1=(()=>{
const COURSE='Year 12 Standard 1';

// ================= HELPERS =================
const thou=s=>s.replace(/\B(?=(\d{3})+(?!\d))/g,'\\,');
// a number for use inside maths: float noise removed, thin spaces in 5+ digit whole parts
const N=x=>{let s=String(Number(Number(x).toFixed(6)));const neg=s[0]==='-';if(neg)s=s.slice(1);let [i,f]=s.split('.');if(i.length>=5)i=thou(i);return(neg?'-':'')+i+(f?'.'+f:'')};
const D=(x,d)=>{const [i0,f]=Number(x).toFixed(d).split('.');const i=i0.length>=5?thou(i0):i0;return i+(f?'.'+f:'')};
const money=(x,force)=>{const c=Math.round(x*100),dol=Math.floor(c/100),ce=c%100;let i=String(dol);if(i.length>=5)i=thou(i);return'\\$'+i+((force||ce)?'.'+String(ce).padStart(2,'0'):'')};
const fr=(n,d)=>{const f=F(n,d);return f.d===1?String(f.n):`\\dfrac{${f.n}}{${f.d}}`};   // simplified
const fu=(n,d)=>`\\dfrac{${n}}{${d}}`;                                                     // as written
const eqf=(n,d)=>{const f=F(n,d);return f.n===n&&f.d===d?fu(n,d):`${fu(n,d)} = ${fr(n,d)}`};   // as written, then simplified only if it changes
const ts=(name,v,u)=>`$${name} = ${v}$ ${u}`;                                              // "DE = 7 cm" with the side name in maths
const hours=h=>`${N(h)} ${h===1?'hour':'hours'}`;
const hmTex=m=>{const h=Math.floor(m/60),mm=m%60;return(h?`$${h}$ ${h===1?'hour':'hours'}`:'')+(h&&mm?' ':'')+(mm?`$${mm}$ minutes`:'')};
const dpOK=(x,d)=>Math.abs(x*10**d-Math.round(x*10**d))<1e-7;                             // x has at most d decimal places
const tie=(x,d)=>{const y=x*10**d;return Math.abs(y-Math.floor(y)-0.5)<1e-3};             // too close to a rounding boundary
const G=g=>R=>{for(let i=0;i<400;i++){const q=g(R);if(q)return q}throw Error('no question made')};
const ang=d=>`${d}^{\\circ}`;
const rad=Math.PI/180,sin=d=>Math.sin(d*rad),cos=d=>Math.cos(d*rad),tan=d=>Math.tan(d*rad);
const asin=x=>Math.asin(x)/rad,acos=x=>Math.acos(x)/rad,atan=x=>Math.atan(x)/rad;
const dms=x=>{const t=Math.round(x*60),d=Math.floor(t/60),m=t%60;return `${d}^{\\circ}${String(m).padStart(2,'0')}'`};
const dmsTie=x=>{const t=x*60;return Math.abs(t-Math.floor(t)-0.5)<0.02};
const cop=(R,lo,hi,n=2)=>{for(let i=0;i<300;i++){const v=[...Array(n)].map(()=>R.int(lo,hi));if(new Set(v).size===n&&v.reduce((x,y)=>gcd(x,y))===1)return v}return[2,3,5].slice(0,n)};
const ratio=(...v)=>v.map(N).join(' : ');
const ucase=s=>s.charAt(0).toUpperCase()+s.slice(1);
const NAMES=[['Anna','Ben','Cara'],['Mia','Jack','Zoe'],['Sam','Ella','Noah'],['Liam','Ava','Eli'],['Ruby','Tom','Ivy'],['Max','Lily','Dan']];

// ================= TOPIC 1: RATIOS AND RATES =================
const CTX1=[['a choir','altos','sopranos'],['a fruit bowl','apples','oranges'],['a box of chocolates','milk chocolates','dark chocolates'],
 ['a bag of counters','red counters','green counters'],['a class','students who walk to school','students who catch the bus'],['a pencil case','pens','pencils']];
const g101=G(R=>{const [c,X,Y]=R.pick(CTX1),v=R.int(0,3);
 if(v===0){const [a,b]=cop(R,1,9);
  return{q:`In ${c}, the ratio of ${X} to ${Y} is $${ratio(a,b)}$. What fraction of the total is ${Y}?`,marks:1,
   sol:[`Total number of parts: $${a} + ${b} = ${a+b}$`,`$$\\text{fraction} = ${fu(b,a+b)}$$`],ans:`$${fr(b,a+b)}$`}}
 if(v===1){const q=R.int(4,12),p=R.int(1,q-1);if(gcd(p,q)!==1)return null;
  return{q:`In ${c}, $${fu(p,q)}$ of the total are ${X} and the rest are ${Y}. Write the ratio of ${X} to ${Y}.`,marks:1,
   sol:[`The rest are ${Y}: $1 - ${fu(p,q)} = ${fu(q-p,q)}$`,`Ratio $= ${fu(p,q)} : ${fu(q-p,q)}$. Multiply both by $${q}$.`],ans:`$${ratio(p,q-p)}$`}}
 if(v===2){const [a,b]=cop(R,1,8),k=R.int(2,12),n=(a+b)*k;
  return{q:`In ${c}, the ratio of ${X} to ${Y} is $${ratio(a,b)}$.<br>(a) What fraction of the total is ${X}?<br>(b) There are $${n}$ altogether. How many are ${X}?`,marks:2,
   sol:[`(a) Total parts: $${a} + ${b} = ${a+b}$, so the fraction is $${fu(a,a+b)}$.`,`(b) $${fu(a,a+b)} \\times ${n} = ${a*k}$`],ans:`(a) $${fr(a,a+b)}$ (b) $${a*k}$`}}
 const [a,b,d]=cop(R,1,7,3),tot=a+b+d,w=R.pick([['trail mix','nuts','raisins','chocolate pieces'],['fertiliser','nitrogen','phosphorus','potassium'],['concrete','cement','sand','gravel']]);
 return{q:`A ${w[0]} is made from ${w[1]}, ${w[2]} and ${w[3]} in the ratio $${ratio(a,b,d)}$. What fraction of the ${w[0]} is ${w[2]}?`,marks:1,
  sol:[`Total number of parts: $${a} + ${b} + ${d} = ${tot}$`,`$$\\text{fraction} = ${fu(b,tot)}$$`],ans:`$${fr(b,tot)}$`}});

const UNITS=[['cm','m',100,[0.5,0.8,1.2,1.5,2,2.5,3,4]],['g','kg',1000,[0.5,0.25,0.4,1.5,2,2.5,0.75]],['mL','L',1000,[0.5,0.25,0.4,1.5,2,0.75]],['minutes','hours',60,[0.5,1,1.5,2,2.5,3,4]]];
const g102=G(R=>{const v=R.int(0,3);
 if(v===0){const [a,b]=cop(R,1,9),k=R.int(2,12);
  return{q:`Simplify the ratio $${ratio(a*k,b*k)}$.`,marks:1,sol:[`Divide both numbers by $${k}$ (the highest common factor).`,`$${ratio(a*k,b*k)} = ${ratio(a,b)}$`],ans:`$${ratio(a,b)}$`}}
 if(v===1){const [a,b,c]=cop(R,1,9,3),k=R.int(2,9);
  return{q:`Simplify the ratio $${ratio(a*k,b*k,c*k)}$.`,marks:1,sol:[`Divide all three numbers by $${k}$.`,`$${ratio(a*k,b*k,c*k)} = ${ratio(a,b,c)}$`],ans:`$${ratio(a,b,c)}$`}}
 if(v===2){const [sm,lg,f,ys]=R.pick(UNITS),y=R.pick(ys),conv=Math.round(y*f),x=R.int(2,60)*(f===60?5:10),g=gcd(x,conv);if(g<2||x===conv)return null;
  return{q:`Write the ratio $${x}$ ${sm} to $${N(y)}$ ${lg} in simplest form.`,marks:2,
   sol:[`Write both in ${sm}: $${N(y)}$ ${lg} $= ${conv}$ ${sm}`,`Ratio $= ${ratio(x,conv)}$`,`Divide both by $${g}$: $${ratio(x/g,conv/g)}$`],ans:`$${ratio(x/g,conv/g)}$`}}
 const a=R.pick([2,4,5,10,20,25,50]),b=R.int(Math.ceil(60/a)*a,500),n=b/a;if(!dpOK(n,2)||n===Math.round(n)&&R.next()<0.5)return null;
 return{q:`Write the ratio $${ratio(a,b)}$ in the form $1 : n$.`,marks:1,sol:[`Divide both numbers by $${a}$ so the first becomes $1$.`,`$$${a} \\div ${a} = 1, \\qquad ${b} \\div ${a} = ${N(n)}$$`],ans:`$1 : ${N(n)}$`}});

const g103=G(R=>{const v=R.int(0,3),[p,q,r]=R.pick(NAMES),K=[5,8,10,12,15,20,25,30,40];
 if(v===0){const [a,b]=cop(R,1,9),k=R.pick(K),T=(a+b)*k;
  return{q:`${p} and ${q} share ${'$'+money(T)+'$'} in the ratio $${ratio(a,b)}$. How much does each person receive?`,marks:2,
   sol:[`Total parts: $${a} + ${b} = ${a+b}$`,`One part: $${money(T)} \\div ${a+b} = ${money(k)}$`,`${p}: $${a} \\times ${money(k)} = ${money(a*k)}$, ${q}: $${b} \\times ${money(k)} = ${money(b*k)}$`],ans:`${p} $${money(a*k)}$, ${q} $${money(b*k)}$`}}
 if(v===1){const [a,b,c]=cop(R,1,6,3),k=R.pick(K),T=(a+b+c)*k;
  return{q:`${p}, ${q} and ${r} share ${'$'+money(T)+'$'} in the ratio $${ratio(a,b,c)}$. How much does each person receive?`,marks:2,
   sol:[`Total parts: $${a} + ${b} + ${c} = ${a+b+c}$`,`One part: $${money(T)} \\div ${a+b+c} = ${money(k)}$`,`${p}: $${money(a*k)}$, ${q}: $${money(b*k)}$, ${r}: $${money(c*k)}$`],ans:`${p} $${money(a*k)}$, ${q} $${money(b*k)}$, ${r} $${money(c*k)}$`}}
 if(v===2){const [a,b]=cop(R,1,9),k=R.pick(K);
  return{q:`${p} and ${q} share some money in the ratio $${ratio(a,b)}$. ${p} receives ${'$'+money(a*k)+'$'}. How much does ${q} receive?`,marks:2,
   sol:[`$${a}$ parts $= ${money(a*k)}$, so one part $= ${money(a*k)} \\div ${a} = ${money(k)}$`,`${q}: $${b} \\times ${money(k)} = ${money(b*k)}$`],ans:`$${money(b*k)}$`}}
 const [a,b]=cop(R,1,9);if(a===b+1&&b===1&&0)return null;const k=R.pick(K),T=(a+b)*k;
 return{q:`${'$'+money(T)+'$'} is shared between ${p} and ${q} in the ratio $${ratio(a,b)}$. How much more does the person with the larger share receive?`,marks:2,
  sol:[`One part: $${money(T)} \\div ${a+b} = ${money(k)}$`,`Shares: $${money(a*k)}$ and $${money(b*k)}$`,`Difference: $${money(Math.abs(a-b)*k)}$`],ans:`$${money(Math.abs(a-b)*k)}$`}});

const SCALES=[1000,2000,5000,10000,20000,25000,50000,100000,250000];
const real=cm=>cm>=100000?[cm/100000,'km','100\\,000','kilometres']:[cm/100,'m','100','metres'];
const g104=G(R=>{const v=R.int(0,3),n=R.pick(SCALES);
 if(v===0){const d10=R.int(20,120),cm=d10*n/10,[x,u,dv,uw]=real(cm);if(!dpOK(x,2)||!Number.isInteger(cm))return null;
  return{q:`A map has a scale of $1 : ${N(n)}$. Two places are $${N(d10/10)}$ cm apart on the map. Find the actual distance between them in ${uw}.`,marks:2,
   sol:[`Actual distance in cm: $${N(d10/10)} \\times ${N(n)} = ${N(cm)}$ cm`,`Convert to ${uw}: $${N(cm)} \\div ${dv} = ${N(x)}$ ${u}`],ans:`$${N(x)}\\text{ ${u}}$`}}
 if(v===1){const d10=R.int(20,120),cm=d10*n/10,[x,u,dv]=real(cm);if(!dpOK(x,2)||!Number.isInteger(cm))return null;
  return{q:`A map has a scale of $1 : ${N(n)}$. A track is $${N(x)}$ ${u} long in real life. How long is the track on the map, in centimetres?`,marks:2,
   sol:[`Actual length in cm: $${N(x)} \\times ${dv} = ${N(cm)}$ cm`,`Length on map: $${N(cm)} \\div ${N(n)} = ${N(d10/10)}$ cm`],ans:`$${N(d10/10)}\\text{ cm}$`}}
 if(v===2){const m=R.pick([2,4,5,8,10]),cm=m*n,[x,u,dv]=real(cm);if(!dpOK(x,2))return null;
  return{q:`On a map, $${m}$ cm represents $${N(x)}$ ${u} in real life. Write the scale in the form $1 : n$.`,marks:2,
   sol:[`$${N(x)}$ ${u} $= ${N(cm)}$ cm, so $${m}$ cm : $${N(cm)}$ cm`,`Divide both by $${m}$: $1 : ${N(n)}$`],ans:`$1 : ${N(n)}$`}}
 const n2=R.pick([10000,20000,25000,50000]),a=R.int(2,16)/2,b=R.int(2,16)/2,cm=(a+b)*n2,[x,u,dv,uw]=real(cm);if(!dpOK(x,2))return null;
 return{q:`A walking track has two sections that measure $${N(a)}$ cm and $${N(b)}$ cm on a map with scale $1 : ${N(n2)}$. Find the total length of the track in ${uw}.`,marks:2,
  sol:[`Total on map: $${N(a)} + ${N(b)} = ${N(a+b)}$ cm`,`Actual: $${N(a+b)} \\times ${N(n2)} = ${N(cm)}$ cm $= ${N(x)}$ ${u}`],ans:`$${N(x)}\\text{ ${u}}$`}});

const g105=G(R=>{const v=R.int(0,3);
 if(v===0){const n=R.pick([50,100,200,250,500]),d10=R.int(20,150),m=d10/10*n/100;if(!dpOK(m,2))return null;
  return{q:`A scale drawing of a house uses a scale of $1 : ${n}$. A wall measures $${N(d10/10)}$ cm on the drawing. What is the actual length of the wall, in metres?`,marks:2,
   sol:[`Actual length in cm: $${N(d10/10)} \\times ${n} = ${N(d10/10*n)}$ cm`,`In metres: $${N(d10/10*n)} \\div 100 = ${N(m)}$ m`],ans:`$${N(m)}\\text{ m}$`}}
 if(v===1){const n=R.pick([50,100,200,250,500,1000]),L=R.pick([6,9,12,15,18,24,30,40,45]),cm=L*100/n;if(!dpOK(cm,1)||cm<1.5||cm>30)return null;
  return{q:`A bridge $${L}$ m long is to be drawn using a scale of $1 : ${n}$. How long should the line be on the drawing, in centimetres?`,marks:2,
   sol:[`Actual length in cm: $${L} \\times 100 = ${N(L*100)}$ cm`,`On the drawing: $${N(L*100)} \\div ${n} = ${N(cm)}$ cm`],ans:`$${N(cm)}\\text{ cm}$`}}
 if(v===2){const k=R.pick([2,5,10,20,25,50]),n=k*100,L=k*R.int(2,9),dr=L/k;
  return{q:`A plan uses a scale where $1$ cm represents $${k}$ m.<br>(a) Write the scale in the form $1 : n$.<br>(b) A ship is $${L}$ m long. How long is it on the plan, in centimetres?`,marks:2,
   sol:[`(a) $${k}$ m $= ${k*100}$ cm, so the scale is $1 : ${n}$.`,`(b) $${L} \\div ${k} = ${N(dr)}$ cm`],ans:`(a) $1 : ${n}$ (b) $${N(dr)}\\text{ cm}$`}}
 const [thing,lens]=R.pick([['car',[4.5,4.8]],['bus',[12]],['boat',[8,10,12]],['truck',[9,12]],['train carriage',[20]],['aeroplane',[36,40]]]),m=R.pick(lens),n=R.pick([20,25,40,50,100,200]),L=m*100/n;
 if(!dpOK(L,1)||L<3||L>60)return null;
 return{q:`A model ${thing} is $${N(L)}$ cm long. The real ${thing} is $${N(m)}$ m long. Find the scale of the model in the form $1 : n$.`,marks:2,
  sol:[`$${N(m)}$ m $= ${N(m*100)}$ cm`,`$${N(L)} : ${N(m*100)}$, then divide both by $${N(L)}$: $1 : ${n}$`],ans:`$1 : ${n}$`}});

const g106=G(R=>{const v=R.int(0,3);
 if(v===0){const n=R.pick([100,200]),l2=R.int(6,20),w2=R.int(5,l2-1),l=l2/2,w=w2/2,L=l*n/100,W=w*n/100,A=L*W;if(!dpOK(A,2))return null;
  return{q:`A floor plan has a scale of $1 : ${n}$. A room measures $${N(l)}$ cm by $${N(w)}$ cm on the plan.<br>(a) Find the actual length and width of the room, in metres.<br>(b) Find the actual floor area, in square metres.`,marks:3,
   sol:[`(a) Length: $${N(l)} \\times ${n} = ${N(l*n)}$ cm $= ${N(L)}$ m`,`Width: $${N(w)} \\times ${n} = ${N(w*n)}$ cm $= ${N(W)}$ m`,`(b) Area $= ${N(L)} \\times ${N(W)} = ${N(A)}$ m$^{2}$`],ans:`(a) $${N(L)}$ m by $${N(W)}$ m (b) $${N(A)}\\text{ m}^{2}$`}}
 if(v===1){const n=R.pick([50,100,200]),[ob,wd]=R.pick([['door',0.8],['door',0.9],['door',1.0],['window',1.2],['window',1.5],['window',1.8],['window',2.4],['garage door',2.4],['garage door',3.0],['garage door',3.6]]),cm=wd*100/n;if(!dpOK(cm,1))return null;
  return{q:`On a building plan with scale $1 : ${n}$, a ${ob} is drawn. The real ${ob} is $${N(wd)}$ m wide. How wide is it on the plan, in centimetres?`,marks:2,
   sol:[`$${N(wd)}$ m $= ${N(wd*100)}$ cm`,`On the plan: $${N(wd*100)} \\div ${n} = ${N(cm)}$ cm`],ans:`$${N(cm)}\\text{ cm}$`}}
 if(v===2){const n=R.pick([100,200]),l2=R.int(6,16),w2=R.int(5,l2-1),l=l2/2,w=w2/2,L=l*n/100,W=w*n/100,A=L*W,pr=R.pick([35,42,48,55,60,65,72,80]),cost=A*pr;if(!dpOK(A,2))return null;
  return{q:`A room measures $${N(l)}$ cm by $${N(w)}$ cm on a plan with scale $1 : ${n}$. Carpet costs ${'$'+money(pr)+'$'} per square metre. Find the cost of carpeting the room.`,marks:3,
   sol:[`Actual size: $${N(L)}$ m by $${N(W)}$ m`,`Area $= ${N(L)} \\times ${N(W)} = ${N(A)}$ m$^{2}$`,`Cost $= ${N(A)} \\times ${pr} = ${money(cost)}$`],ans:`$${money(cost)}$`}}
 const n=R.pick([50,100,200]),a2=R.int(4,16),b2=R.int(3,12),a=a2/2,b=b2/2,A=a*n/100*(b*n/100),P=2*(a+b)*n/100;if(!dpOK(P,2)||!dpOK(A,2))return null;
 return{q:`A rectangular courtyard is drawn on a plan with scale $1 : ${n}$. It measures $${N(a)}$ cm by $${N(b)}$ cm on the plan. Find the actual perimeter of the courtyard, in metres.`,marks:2,
  sol:[`Actual sides: $${N(a*n/100)}$ m and $${N(b*n/100)}$ m`,`Perimeter $= 2 \\times (${N(a*n/100)} + ${N(b*n/100)}) = ${N(P)}$ m`],ans:`$${N(P)}\\text{ m}$`}});

const g107=G(R=>{const v=R.int(0,3);
 if(v===0){const r2=R.int(36,90),r=r2/2,h=R.int(3,9),pay=r*h;
  return{q:`${R.pick(['Ella','Jack','Mia','Sam'])} works for $${h}$ hours and is paid ${'$'+money(pay,true)+'$'}. Find the hourly rate of pay.`,marks:1,
   sol:[`Rate $= ${money(pay,true)} \\div ${h} = ${money(r,true)}$ per hour`],ans:`$${money(r,true)}\\text{ per hour}$`}}
 if(v===1){const r=R.int(8,40),m=R.int(3,12),t=R.int(15,45);
  return{q:`A printer prints $${r*m}$ pages in $${m}$ minutes.<br>(a) Find the rate in pages per minute.<br>(b) At this rate, how many pages does it print in $${t}$ minutes?`,marks:2,
   sol:[`(a) $${r*m} \\div ${m} = ${r}$ pages per minute`,`(b) $${r} \\times ${t} = ${r*t}$ pages`],ans:`(a) $${r}$ pages per minute (b) $${r*t}$ pages`}}
 if(v===2){const [it,lo,hi]=R.pick([['apples',3,8],['tomatoes',4,9],['potatoes',2,6],['mangoes',3,8],['cheese',10,18]]),u=R.int(lo*2,hi*2)/2,kg=R.int(2,6),k2=R.int(2,9),tot=u*kg;if(!dpOK(tot,2))return null;
  return{q:`${ucase(it)} cost ${'$'+money(tot,true)+'$'} for $${kg}$ kg.<br>(a) Find the cost per kilogram.<br>(b) Find the cost of $${k2}$ kg at this rate.`,marks:2,
   sol:[`(a) $${money(tot,true)} \\div ${kg} = ${money(u,true)}$ per kg`,`(b) $${k2} \\times ${money(u,true)} = ${money(u*k2,true)}$`],ans:`(a) $${money(u,true)}$ per kg (b) $${money(u*k2,true)}$`}}
 const s=R.pick([10,15,20,30]),n=R.int(Math.ceil(50*s/60),Math.floor(120*s/60)),bpm=n*60/s;
 return{q:`A person's heart beats $${n}$ times in $${s}$ seconds. How many times does it beat per minute?`,marks:1,
  sol:[`There are $${60/s}$ lots of $${s}$ seconds in a minute.`,`$${n} \\times ${60/s} = ${bpm}$`],ans:`$${bpm}$ beats per minute`}});

const g108=G(R=>{const v=R.int(0,3);
 if(v===0){const k=R.int(1,8),S=18*k;
  return{q:`Convert $${S}$ km/h to metres per second.`,marks:2,sol:[`$1$ km $= 1000$ m and $1$ hour $= 3600$ s`,`$$${S} \\times \\frac{1000}{3600} = ${5*k}$$`],ans:`$${5*k}\\text{ m/s}$`}}
 if(v===1){const [who,lo,hi]=R.pick([['A runner',3,11],['A cyclist',4,14],['A car',12,35],['A train',20,45]]),m=R.int(lo,hi),kmh=m*3.6;
  return{q:`${who} travels at $${m}$ m/s. Convert this speed to kilometres per hour.`,marks:2,sol:[`$1$ m/s $= 3.6$ km/h`,`$${m} \\times 3.6 = ${N(kmh)}$`],ans:`$${N(kmh)}\\text{ km/h}$`}}
 if(v===2){const r=R.pick([3,6,9,12,15,18,21,24,30]);
  return{q:`A pump moves water at $${r}$ litres per minute. Convert this rate to millilitres per second.`,marks:2,
   sol:[`$${r}$ L $= ${r*1000}$ mL and $1$ minute $= 60$ s`,`$$${N(r*1000)} \\div 60 = ${N(r*1000/60)}$$`],ans:`$${N(r*1000/60)}\\text{ mL/s}$`}}
 const p=R.int(3,12)/2,c=p*100/10,it=R.pick(['Apples','Bananas','Potatoes','Carrots','Onions']);
 return{q:`${it} cost ${'$'+money(p,true)+'$'} per kilogram. Convert this to cents per $100$ g.`,marks:2,
  sol:[`${'$'+money(p,true)+'$'} $= ${N(p*100)}$ cents per kilogram`,`$1$ kg $= 1000$ g, which is $10$ lots of $100$ g`,`$${N(p*100)} \\div 10 = ${N(c)}$ cents per $100$ g`],ans:`$${N(c)}$ cents per $100$ g`}});

const PRODS=[['cereal','g',[50,90]],['pasta','g',[20,40]],['laundry liquid','mL',[20,44]],['orange juice','mL',[14,30]],['rice','g',[16,34]]];
const g109=G(R=>{const v=R.int(0,2);
 if(v===0){const [nm,u,[lo,hi]]=R.pick(PRODS),sizes=[200,250,400,500,750,1000],s1=R.pick(sizes),s2=R.pick(sizes);if(s1===s2)return null;
  const u1=2*R.int(lo/2,hi/2),d=R.pick([-8,-6,-4,-2,2,4,6,8]),u2=u1+d,p1=u1*s1/100,p2=u2*s2/100;if(!Number.isInteger(p1)||!Number.isInteger(p2))return null;
  const better=u1<u2?1:2,bs=better===1?s1:s2;
  return{q:`A shop sells ${nm} in two sizes: $${N(s1)}$ ${u} for ${'$'+money(p1/100,true)+'$'} and $${N(s2)}$ ${u} for ${'$'+money(p2/100,true)+'$'}. Which size is the better buy? Show your working.`,marks:2,
   sol:[`$${N(s1)}$ ${u} pack: $${N(p1)} \\text{ c} \\div ${N(s1/100)} = ${u1}$ c per $100$ ${u}`,`$${N(s2)}$ ${u} pack: $${N(p2)} \\text{ c} \\div ${N(s2/100)} = ${u2}$ c per $100$ ${u}`,`The lower unit price is the better buy.`],
   ans:`The $${N(bs)}$ ${u} pack ($${Math.min(u1,u2)}$ c per $100$ ${u})`,chk:()=>(better===1)===(p1*s2<p2*s1)}}
 if(v===1){const [x,y]=R.sample(NAMES.map(n=>n[0]),2),rA=R.int(24,48)*0.5+0,rB=rA+R.pick([-2,-1.5,-1,-0.5,0.5,1,1.5,2]),hA=R.int(3,9),hB=R.int(3,9),pA=rA*hA,pB=rB*hB;if(hA===hB||!dpOK(pA,2)||!dpOK(pB,2))return null;
  return{q:`${x} is paid ${'$'+money(pA,true)+'$'} for $${hA}$ hours of work. ${y} is paid ${'$'+money(pB,true)+'$'} for $${hB}$ hours of work. Who is paid the higher hourly rate, and by how much?`,marks:2,
   sol:[`${x}: $${money(pA,true)} \\div ${hA} = ${money(rA,true)}$ per hour`,`${y}: $${money(pB,true)} \\div ${hB} = ${money(rB,true)}$ per hour`,`Difference: $${money(Math.abs(rA-rB),true)}$ per hour`],ans:`${rA>rB?x:y} by $${money(Math.abs(rA-rB),true)}$ per hour`}}
 const it=R.pick(['cans of drink','muffins','bottles of water','pencils']),c1=R.pick([4,6,8,10,12]),c2=R.pick([12,18,20,24,30]),u1=R.int(70,140),d=R.pick([-12,-9,-6,-4,4,6,9,12]),u2=u1+d,P1=c1*u1,P2=c2*u2;if(c1===c2)return null;
 return{q:`A shop sells ${it} in a pack of $${c1}$ for ${'$'+money(P1/100,true)+'$'} and a pack of $${c2}$ for ${'$'+money(P2/100,true)+'$'}. Which pack is cheaper per item, and how much does it save on each one?`,marks:3,
  sol:[`Pack of $${c1}$: $${P1} \\div ${c1} = ${u1}$ cents each`,`Pack of $${c2}$: $${P2} \\div ${c2} = ${u2}$ cents each`,`The pack of $${u1<u2?c1:c2}$ is cheaper, saving $${Math.abs(d)}$ cents on each one.`],ans:`The pack of $${u1<u2?c1:c2}$, saving $${Math.abs(d)}$ cents each`}});

const g110=G(R=>{const v=R.int(0,3),veh=R.pick(['A car','A bus','A truck','A van']);
 if(v===0){const S=R.pick([45,50,60,70,75,80,90,100,110]),t10=R.pick([15,20,25,30,35,40,45,55]),t=t10/10,D=S*t;if(!dpOK(D,1))return null;
  return{q:`${veh} travels at an average speed of $${S}$ km/h for ${hours(t)}. How far does it travel?`,marks:1,sol:[`$D = S \\times T$`,`$D = ${S} \\times ${N(t)} = ${N(D)}$ km`],ans:`$${N(D)}\\text{ km}$`}}
 if(v===1){const S=R.pick([48,60,72,80,90,100]),tm=R.pick([75,90,105,120,135,150,165,180,195,210,225]),D=S*tm/60;if(!Number.isInteger(D)||D<60)return null;
  return{q:`${veh} travels $${D}$ km at an average speed of $${S}$ km/h. How long does the trip take? Give your answer in hours and minutes.`,marks:2,
   sol:[`$T = D \\div S = ${D} \\div ${S} = ${N(D/S)}$ hours`,`$${N(D/S)}$ hours $=$ ${hmTex(tm)}`],ans:hmTex(tm),chk:()=>Math.abs(D/S*60-tm)<1e-9}}
 if(v===2){const S=R.pick([24,36,48,60,72,80,90]),tm=R.pick([75,90,105,120,135,150,165,180,195,210]),D=S*tm/60;if(!Number.isInteger(D))return null;
  return{q:`${veh} travels $${D}$ km in ${hmTex(tm)}. Find its average speed in km/h.`,marks:2,
   sol:[`${hmTex(tm)} $= ${N(tm/60)}$ hours`,`$S = D \\div T = ${D} \\div ${N(tm/60)} = ${S}$ km/h`],ans:`$${S}\\text{ km/h}$`,chk:()=>Math.abs(D/(tm/60)-S)<1e-9}}
 const T=R.pick([3,4,5,6]),S=R.pick([10,12,14,16,18,20,24]),Dt=S*T,t1=R.int(1,T-2),rest=0.5,t2=T-t1-rest;if(t2<=0.4)return null;
 const d1=R.int(Math.ceil(Dt*0.25),Math.floor(Dt*0.6)),d2=Dt-d1;
 return{q:`A cyclist rides $${d1}$ km in ${hours(t1)}, rests for half an hour, then rides $${d2}$ km in ${hours(t2)}. Find the cyclist's average speed for the whole trip, including the rest.`,marks:3,
  sol:[`Total distance: $${d1} + ${d2} = ${Dt}$ km`,`Total time: $${N(t1)} + 0.5 + ${N(t2)} = ${T}$ hours`,`$S = ${Dt} \\div ${T} = ${N(Dt/T)}$ km/h`],ans:`$${N(Dt/T)}\\text{ km/h}$`}});

const g111=G(R=>{const v=R.int(0,3),c=R.int(11,24)/2;
 if(v===0){const d=R.pick([40,80,120,160,200,240,320,360,400,480,500]),L=c*d/100;if(!dpOK(L,2))return null;
  return{q:`A car uses $${N(c)}$ litres of petrol per $100$ km. How much petrol does it use on a trip of $${d}$ km?`,marks:2,
   sol:[`$${d} \\div 100 = ${N(d/100)}$ lots of $100$ km`,`$${N(d/100)} \\times ${N(c)} = ${N(L)}$ litres`],ans:`$${N(L)}\\text{ L}$`}}
 if(v===1){const d=R.pick([40,80,120,160,200,240,320,360,400,480]),L=c*d/100;if(!dpOK(L,2))return null;
  return{q:`A car uses $${N(L)}$ litres of petrol to travel $${d}$ km. Find its fuel consumption in litres per $100$ km.`,marks:2,
   sol:[`Consumption $= \\dfrac{${N(L)}}{${d}} \\times 100$`,`$= ${N(c)}$ litres per $100$ km`],ans:`$${N(c)}\\text{ L/100 km}$`}}
 if(v===2){const d=R.pick([100,150,200,250,300,350,400,450,500]),Lt=Math.round(c*d/10),pt=R.int(1750,2250),cents=Lt*pt/100;if((Lt*pt)%100===50)return null;
  const L=Lt/10,pr=pt/10,cost=Math.round(cents)/100;
  return{q:`A car uses $${N(c)}$ L/100 km. Petrol costs $${N(pr)}$ cents per litre. Find the cost of petrol for a trip of $${d}$ km, to the nearest cent.`,marks:3,
   sol:[`Petrol used: $${N(d/100)} \\times ${N(c)} = ${N(L)}$ L`,`Cost: $${N(L)} \\times ${N(pr)} = ${N(L*pr)}$ cents`,`$${Math.abs(cents-Math.round(cents))<1e-9?'=':'\\approx'} ${money(cost,true)}$`],ans:`$${money(cost,true)}$`}}
 const T=R.pick([40,45,50,55,60,70]),cc=R.pick([5,6,8,10,12.5,7.5]),dist=T*100/cc;if(!Number.isInteger(dist))return null;
 return{q:`A car has a $${T}$ litre fuel tank and uses $${N(cc)}$ litres per $100$ km. How far can it travel on a full tank?`,marks:2,
  sol:[`Lots of $100$ km: $${T} \\div ${N(cc)} = ${N(T/cc)}$`,`Distance: $${N(T/cc)} \\times 100 = ${N(dist)}$ km`],ans:`$${N(dist)}\\text{ km}$`}});

// ================= TOPIC 2: PROBABILITY =================
const isPrime=n=>n>1&&[...Array(n).keys()].slice(2).every(k=>n%k);
const pred=(R,top)=>{const k=R.int(2,5),m=R.int(3,Math.min(top-1,9)),opts=[['an even number',n=>n%2===0],['an odd number',n=>n%2===1],['a prime number',isPrime],
  [`a multiple of ${k}`,n=>n%k===0],[`a number less than ${m}`,n=>n<m],[`a number greater than ${top-m+1}`,n=>n>top-m+1],['a square number',n=>Number.isInteger(Math.sqrt(n))]];return R.pick(opts)};
const FRACS=[[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,8],[3,8],[5,8],[7,8],[1,10],[3,10],[7,10],[9,10],[1,20],[7,20],[3,25],[17,50],[9,40]];

const g201=G(R=>{const v=R.int(0,3);
 if(v===0){const good=R.sample(['0.4','\\dfrac{3}{5}','0.75','\\dfrac{1}{8}','85\\%','0','1','\\dfrac{7}{10}','0.05','12\\%'],3),bad=R.pick(['1.2','-0.3','\\dfrac{5}{4}','110\\%','-\\dfrac{1}{2}','\\dfrac{3}{2}','2.5','-5\\%']),pos=R.int(0,3),opts=good.slice();opts.splice(pos,0,bad);
  const why=/%/.test(bad)?(bad[0]==='-'?'it is negative':'it is more than $100\\%$'):bad[0]==='-'?'it is negative':'it is greater than $1$';
  return{q:`Which one of these values cannot be a probability? Give a reason.<br>${opts.map((o,i)=>`(${'ABCD'[i]}) $${o}$`).join('&emsp;')}`,marks:2,
   sol:[`A probability is between $0$ and $1$ inclusive (or $0\\%$ and $100\\%$).`,`(${'ABCD'[pos]}) $${bad}$ cannot be a probability because ${why}.`],ans:`(${'ABCD'[pos]}) $${bad}$: ${why}`}}
 if(v===1){const n=R.pick([6,8,10,12]),dev=n===6?'A fair six-sided die is rolled':`A spinner has $${n}$ equal sections numbered $1$ to $${n}$ and is spun`;
  return{q:`${dev}. Write down the probability of getting:<br>(a) a number greater than $${n}$<br>(b) a number less than $${n+1}$`,marks:2,
   sol:[`(a) No outcome is greater than $${n}$. This is impossible, so the probability is $0$.`,`(b) Every outcome is less than $${n+1}$. This is certain, so the probability is $1$.`],ans:`(a) $0$ (b) $1$`}}
 if(v===2){const [a,b]=R.pick(FRACS.filter(f=>[2,4,5,8,10,20,25,40,50].includes(f[1]))),x=a/b;
  return{q:`The probability of an event is $${fu(a,b)}$. Write this probability as a decimal and as a percentage.`,marks:2,
   sol:[`Decimal: $${a} \\div ${b} = ${N(x)}$`,`Percentage: $${N(x)} \\times 100 = ${N(x*100)}\\%$`],ans:`$${N(x)}$ and $${N(x*100)}\\%$`}}
 const p=R.pick([0,0.1,0.25,0.5,0.75,0.9,1]),w=p===0?'impossible':p===1?'certain':p<0.5?'unlikely':p===0.5?'an even chance':'likely';
 return{q:`The probability that an event happens is $${p}$. Choose the best description: impossible, unlikely, an even chance, likely or certain.`,marks:1,
  sol:[`$0$ is impossible, between $0$ and $0.5$ is unlikely, $0.5$ is an even chance, between $0.5$ and $1$ is likely, $1$ is certain.`],ans:ucase(w)}});

const WORDS=['MATHS','PRIME','ANGLE','TRIANGLE','CIRCLE','SQUARE','RHOMBUS','POINTS','GRAPH','LINES'];
const g202=G(R=>{const v=R.int(0,3);
 if(v===0){const w=R.pick(WORDS);
  return{q:`A card is chosen at random from cards showing the letters of the word ${w}. List the sample space.`,marks:1,sol:[`List every letter once: the word has $${w.length}$ different letters.`],ans:`$\\{${w.split('').join(', ')}\\}$`}}
 if(v===1){const sp=R.pick([['A','B','C'],['1','2','3'],['R','G','B']]),nm=sp.join(', ');
  return{q:`A coin is tossed and a spinner with sections ${sp.join(', ')} is spun. List the sample space.`,marks:2,
   sol:[`Pair each coin result with each spinner result: $2 \\times 3 = 6$ outcomes.`],ans:`$\\{${['H','T'].flatMap(c=>sp.map(s=>c+s)).join(', ')}\\}$`}}
 if(v===2){const a=R.int(2,5),b=R.int(2,5),c3=R.int(2,4),t=R.pick([['main meals','desserts','drinks','meal combinations'],['shirts','shorts','caps','outfits'],['colours','sizes','styles','different pairs of shoes']]);
  return{q:`A shop sells $${a}$ ${t[0]}, $${b}$ ${t[1]} and $${c3}$ ${t[2]}. How many ${t[3]} are possible if one of each is chosen?`,marks:1,
   sol:[`$${a} \\times ${b} \\times ${c3} = ${a*b*c3}$`],ans:`$${a*b*c3}$`}}
 const ev=R.pick([['A fair coin is tossed three times',8,'$2 \\times 2 \\times 2 = 8$'],['A die is rolled and a coin is tossed',12,'$6 \\times 2 = 12$'],['Two fair dice are rolled',36,'$6 \\times 6 = 36$'],['A coin is tossed and a four-sided spinner is spun',8,'$2 \\times 4 = 8$']]);
 return{q:`${ev[0]}. How many outcomes are in the sample space?`,marks:1,sol:[ev[2]],ans:`$${ev[1]}$`}});

const g203=G(R=>{const v=R.int(0,3);
 if(v===0){const n=R.pick([6,8,10,12,20,25,30]),[desc,f]=pred(R,n),cnt=[...Array(n)].map((_,i)=>i+1).filter(f),dev=n===6?'A fair six-sided die is rolled':`A number is chosen at random from the whole numbers $1$ to $${n}$`;
  if(cnt.length===0||cnt.length===n)return null;
  return{q:`${dev}. Find the probability of getting ${desc}.`,marks:1,sol:[`Favourable outcomes: $${cnt.join(', ')}$ ($${cnt.length}$ of them)`,`$$P = ${eqf(cnt.length,n)}$$`],ans:`$${fr(cnt.length,n)}$`}}
 if(v===1){const r=R.int(2,8),b=R.int(2,8),g=R.int(1,6),n=r+b+g,cs=[['red',r],['blue',b],['green',g]],[c1,k1]=R.pick(cs);
  return{q:`A bag contains $${r}$ red, $${b}$ blue and $${g}$ green counters. One counter is chosen at random. Find the probability that it is ${c1}.`,marks:1,
   sol:[`Total counters: $${r} + ${b} + ${g} = ${n}$`,`$$P(\\text{${c1}}) = ${eqf(k1,n)}$$`],ans:`$${fr(k1,n)}$`}}
 if(v===2){const r=R.int(2,8),b=R.int(2,8),g=R.int(2,6),n=r+b+g,pairs=[['red or blue',r+b],['blue or green',b+g],['red or green',r+g]],[d,k]=R.pick(pairs);
  return{q:`A bag contains $${r}$ red, $${b}$ blue and $${g}$ green counters. One counter is chosen at random. Find the probability that it is ${d}.`,marks:2,
   sol:[`Total counters: $${n}$`,`Counters that are ${d}: $${k}$`,`$$P = ${eqf(k,n)}$$`],ans:`$${fr(k,n)}$`}}
 const w=R.pick(['MATHEMATICS','PROBABILITY','STATISTICS','PARALLELOGRAM','CALCULATOR']),L=R.pick([...new Set(w.split(''))]),isV=R.next()<0.4,
  cnt=isV?w.split('').filter(c=>'AEIOU'.includes(c)).length:w.split('').filter(c=>c===L).length;
 return{q:`A letter is chosen at random from the word ${w}. Find the probability that it ${isV?'is a vowel':`is the letter ${L}`}.`,marks:2,
  sol:[`The word has $${w.length}$ letters.`,`${isV?`There ${cnt===1?'is':'are'} $${cnt}$ ${cnt===1?'vowel':'vowels'}.`:`The letter ${L} appears $${cnt}$ ${cnt===1?'time':'times'}.`}`,`$$P = ${eqf(cnt,w.length)}$$`],ans:`$${fr(cnt,w.length)}$`}});

const g204=G(R=>{const v=R.int(0,3);
 if(v===0){const [a,b]=R.pick(FRACS),form=R.int(0,2);
  if(form===0)return{q:`The probability that Jess wins a game is $${fu(a,b)}$. Find the probability that she does not win.`,marks:1,sol:[`$P(\\text{not win}) = 1 - ${fu(a,b)}$`],ans:`$${fr(b-a,b)}$`};
  if(form===1)return{q:`The probability that a train is late is $${N(a/b)}$. Find the probability that it is not late.`,marks:1,sol:[`$1 - ${N(a/b)} = ${N(1-a/b)}$`],ans:`$${N(1-a/b)}$`};
  return{q:`The chance of rain tomorrow is $${N(a/b*100)}\\%$. What is the chance that it does not rain?`,marks:1,sol:[`$100\\% - ${N(a/b*100)}\\% = ${N(100-a/b*100)}\\%$`],ans:`$${N(100-a/b*100)}\\%$`}}
 if(v===1){const r=R.int(2,8),b=R.int(2,8),g=R.int(1,6),n=r+b+g,[c1,k1]=R.pick([['red',r],['blue',b],['green',g]]);
  return{q:`A bag contains $${r}$ red, $${b}$ blue and $${g}$ green counters. One counter is chosen at random. Use complementary events to find the probability that it is not ${c1}.`,marks:2,
   sol:[`$P(\\text{${c1}}) = ${fu(k1,n)}$`,`$$P(\\text{not ${c1}}) = 1 - ${fu(k1,n)} = ${eqf(n-k1,n)}$$`],ans:`$${fr(n-k1,n)}$`}}
 if(v===2){const w=R.int(2,6)*5,dr=R.int(1,(90-w)/5)*5;if(w+dr>=100)return null;
  return{q:`In a game, the probability of a win is $${N(w/100)}$ and the probability of a draw is $${N(dr/100)}$. There are no other results except a loss. Find the probability of a loss.`,marks:2,
   sol:[`$P(\\text{win or draw}) = ${N(w/100)} + ${N(dr/100)} = ${N((w+dr)/100)}$`,`$P(\\text{loss}) = 1 - ${N((w+dr)/100)} = ${N(1-(w+dr)/100)}$`],ans:`$${N(1-(w+dr)/100)}$`}}
 const k=R.int(2,4),what=k===2?['A fair coin is tossed twice','',`1 - ${fu(1,4)}`,3,4]:k===3?['A fair coin is tossed three times','',`1 - ${fu(1,8)}`,7,8]:['A fair coin is tossed four times','',`1 - ${fu(1,16)}`,15,16];
 return{q:`${what[0]}. Find the probability of getting at least one head.`,marks:2,
  sol:[`The complement of "at least one head" is "no heads", that is all tails.`,`$P(\\text{all tails}) = ${fu(1,2**k)}$`,`$P(\\text{at least one head}) = ${what[2]} = ${fu(what[3],what[4])}$`],ans:`$${fu(what[3],what[4])}$`}});

const g205=G(R=>{const v=R.int(0,2),favTxt=(arr,max)=>arr.length<=max?`Favourable outcomes: ${arr.map(([x,y])=>`$(${x},${y})$`).join(', ')} ($${arr.length}$ of them).`:`Favourable outcomes: $${arr.length}$.`;
 if(v===0){const E=[['the sum is $'+R.int(5,9)+'$',null],['the sum is at least $'+R.int(8,11)+'$',null],['the two numbers are the same',(x,y)=>x===y],['the product is odd',(x,y)=>x*y%2===1],['the difference between the numbers is $'+R.int(1,3)+'$',null],['the sum is less than $'+R.int(4,6)+'$',null]],e=R.pick(E);
  const num=+(/\$(\d+)\$/.exec(e[0])||[])[1];let f=e[1];if(!f){if(/sum is \$/.test(e[0]))f=(x,y)=>x+y===num;else if(/at least/.test(e[0]))f=(x,y)=>x+y>=num;else if(/difference/.test(e[0]))f=(x,y)=>Math.abs(x-y)===num;else f=(x,y)=>x+y<num}
  const fav=[];for(let x=1;x<=6;x++)for(let y=1;y<=6;y++)if(f(x,y))fav.push([x,y]);if(!fav.length||fav.length>20)return null;
  return{q:`Two fair six-sided dice are rolled. Use an array to find the probability that ${e[0]}.`,marks:2,
   sol:[`The array has $6 \\times 6 = 36$ equally likely outcomes.`,favTxt(fav,12),`$$P = ${eqf(fav.length,36)}$$`],ans:`$${fr(fav.length,36)}$`}}
 if(v===1){const E=[['a head and an even number',(c,n)=>c==='H'&&n%2===0],['a tail and a number greater than $4$',(c,n)=>c==='T'&&n>4],['a head and a prime number',(c,n)=>c==='H'&&isPrime(n)],['a tail or a $6$',(c,n)=>c==='T'||n===6],['a head and a multiple of $3$',(c,n)=>c==='H'&&n%3===0]],e=R.pick(E),fav=[];
  ['H','T'].forEach(c=>[1,2,3,4,5,6].forEach(n=>{if(e[1](c,n))fav.push(c+n)}));
  return{q:`A fair coin is tossed and a fair six-sided die is rolled. Use an array to find the probability of getting ${e[0]}.`,marks:2,
   sol:[`The array has $2 \\times 6 = 12$ equally likely outcomes.`,`Favourable outcomes: ${fav.join(', ')} ($${fav.length}$ of them).`,`$$P = ${eqf(fav.length,12)}$$`],ans:`$${fr(fav.length,12)}$`}}
 const a=R.int(3,5),b=R.int(3,4),op=R.pick(['add','mult']),E=op==='add'?[[`the sum is greater than $${R.int(4,6)}$`,'g'],[`the sum is even`,'e']]:[[`the product is even`,'e'],[`the product is odd`,'o'],[`the product is greater than $${R.int(5,9)}$`,'g']],e=R.pick(E),val=+(/\$(\d+)\$/.exec(e[0])||[])[1],fav=[];
 for(let x=1;x<=a;x++)for(let y=1;y<=b;y++){const t=op==='add'?x+y:x*y,ok=e[1]==='g'?t>val:e[1]==='e'?t%2===0:t%2===1;if(ok)fav.push([x,y])}
 if(!fav.length||fav.length===a*b)return null;
 return{q:`Spinner A has equal sections numbered $1$ to $${a}$ and spinner B has equal sections numbered $1$ to $${b}$. Both are spun and the two numbers are ${op==='add'?'added':'multiplied'}. Use an array to find the probability that ${e[0]}.`,marks:2,
  sol:[`The array has $${a} \\times ${b} = ${a*b}$ equally likely outcomes.`,favTxt(fav,12),`$$P = ${eqf(fav.length,a*b)}$$`],ans:`$${fr(fav.length,a*b)}$`}});

const g206=G(R=>{const v=R.int(0,3);
 if(v===0){const sp=R.pick([[1,2,3],[1,2,3,4]]),E=[['a head and an odd number',(c,n)=>c==='H'&&n%2===1],['a tail and a number greater than $1$',(c,n)=>c==='T'&&n>1],['a head or a $2$',(c,n)=>c==='H'||n===2]],e=R.pick(E),fav=[];
  ['H','T'].forEach(c=>sp.forEach(n=>{if(e[1](c,n))fav.push(c+n)}));const tot=2*sp.length;if(!fav.length)return null;
  return{q:`A coin is tossed and then a spinner with equal sections numbered ${sp.join(', ')} is spun. Draw a tree diagram and find the probability of getting ${e[0]}.`,marks:2,
   sol:[`The tree has $2 \\times ${sp.length} = ${tot}$ paths, all equally likely.`,`Paths that fit: ${fav.join(', ')} ($${fav.length}$ of them).`,`$$P = ${eqf(fav.length,tot)}$$`],ans:`$${fr(fav.length,tot)}$`}}
 if(v===1){const r=R.int(2,5),b=R.int(2,5),n=r+b,den=n*(n-1),E=[['both counters are red',r*(r-1),`${fu(r,n)} \\times ${fu(r-1,n-1)}`],['the counters are different colours',2*r*b,`${fu(r,n)} \\times ${fu(b,n-1)} + ${fu(b,n)} \\times ${fu(r,n-1)}`],['at least one counter is red',den-b*(b-1),`1 - ${fu(b,n)} \\times ${fu(b-1,n-1)}`]],e=R.pick(E);if(e[1]===0)return null;
  return{q:`A bag contains $${r}$ red and $${b}$ blue counters. Two counters are drawn at random, one after the other, without replacement. Find the probability that ${e[0]}.`,marks:3,
   sol:[`After the first draw only $${n-1}$ counters are left, so the second-stage probabilities change.`,`$$P = ${e[2]}$$`,`$$P = ${eqf(e[1],den)}$$`],ans:`$${fr(e[1],den)}$`}}
 if(v===2){const r=R.int(2,5),b=R.int(2,5),n=r+b,E=[['both counters are red',r*r,`${fu(r,n)} \\times ${fu(r,n)}`],['the counters are the same colour',r*r+b*b,`${fu(r,n)} \\times ${fu(r,n)} + ${fu(b,n)} \\times ${fu(b,n)}`],['exactly one counter is red',2*r*b,`${fu(r,n)} \\times ${fu(b,n)} + ${fu(b,n)} \\times ${fu(r,n)}`]],e=R.pick(E);
  return{q:`A bag contains $${r}$ red and $${b}$ blue counters. A counter is drawn at random, its colour is noted and it is replaced. A second counter is then drawn. Find the probability that ${e[0]}.`,marks:3,
   sol:[`The counter is replaced, so both draws have $${n}$ counters.`,`$$P = ${e[2]}$$`,`$$P = ${eqf(e[1],n*n)}$$`],ans:`$${fr(e[1],n*n)}$`}}
 const p10=R.int(1,8),q10=R.int(1,8),p=p10/10,q=q10/10,both=p10*q10/100,one=(p10*(10-q10)+(10-p10)*q10)/100,E=R.int(0,1),
  ctx=R.pick([['Tom is late for school','Ava is late for school'],['it rains on Saturday','it rains on Sunday']]);
 return{q:`The probability that ${ctx[0]} is $${N(p)}$ and the probability that ${ctx[1]} is $${N(q)}$. The two events are independent. Find the probability that ${E===0?'both happen':'exactly one of them happens'}.`,marks:3,
  sol:E===0?[`$P(\\text{both}) = ${N(p)} \\times ${N(q)}$`,`$= ${N(both)}$`]:[`$P(\\text{first only}) = ${N(p)} \\times ${N(1-q)} = ${N(p*(1-q))}$`,`$P(\\text{second only}) = ${N(1-p)} \\times ${N(q)} = ${N((1-p)*q)}$`,`$P(\\text{exactly one}) = ${N(p*(1-q))} + ${N((1-p)*q)} = ${N(one)}$`],ans:`$${N(E===0?both:one)}$`}});

const g207=G(R=>{const v=R.int(0,3),NS=[20,25,40,50,80,100,125,200,250,400,500];
 if(v===0){const n=R.pick(NS),h=R.int(Math.ceil(n*0.3),Math.floor(n*0.7));
  return{q:`A coin is tossed $${n}$ times and lands heads $${h}$ times. Find the relative frequency of heads, as a decimal.`,marks:1,
   sol:[`$$\\text{relative frequency} = \\frac{\\text{number of heads}}{\\text{number of tosses}} = ${fu(h,n)} = ${N(h/n)}$$`],ans:`$${N(h/n)}$`}}
 if(v===1){const n=R.pick([40,50,80,100,200]),c1=R.int(Math.ceil(n*0.1),Math.floor(n*0.3)),c2=R.int(Math.ceil(n*0.15),Math.floor(n*0.3)),c3=R.int(Math.ceil(n*0.15),Math.floor(n*0.3)),c4=n-c1-c2-c3;if(c4<n*0.1)return null;
  const cs=['red','blue','green','yellow'],k=[c1,c2,c3,c4],i=R.int(0,3);
  return{q:`A spinner was spun $${n}$ times. The results were: red $${c1}$, blue $${c2}$, green $${c3}$, yellow $${c4}$. Find the relative frequency of ${cs[i]}, as a fraction in simplest form and as a percentage.`,marks:2,
   sol:[`$$\\text{relative frequency} = ${eqf(k[i],n)}$$`,`Percentage: $${N(k[i]/n*100)}\\%$`],ans:`$${fr(k[i],n)}$ or $${N(k[i]/n*100)}\\%$`}}
 if(v===2){const n=R.pick([200,250,400,500,1000]),d=R.int(Math.ceil(n*0.01),Math.floor(n*0.06)),it=R.pick(['phone chargers','light globes','tyres','USB cables']);
  return{q:`A factory tests $${n}$ ${it} and finds that $${d}$ are faulty. Use relative frequency to estimate the probability that an item chosen at random is not faulty.`,marks:2,
   sol:[`Not faulty: $${n} - ${d} = ${n-d}$`,`$$P(\\text{not faulty}) \\approx ${fu(n-d,n)} = ${N((n-d)/n)}$$`],ans:`$${N((n-d)/n)}$`}}
 const n=R.pick([60,120,180,240]),h=R.int(Math.ceil(n/6*0.6),Math.floor(n/6*1.4));if(h*6===n)return null;
 return{q:`A fair six-sided die is rolled $${n}$ times and a six comes up $${h}$ times.<br>(a) Find the relative frequency of a six.<br>(b) Write the theoretical probability of a six.<br>(c) Is the relative frequency greater than or less than the theoretical probability?`,marks:3,
  sol:[`(a) $${eqf(h,n)}$`,`(b) $${fu(1,6)}$`,`(c) As decimals, $${D(h/n,3)}$ is ${h*6>n?'greater':'less'} than $${D(1/6,3)}$ (to 3 decimal places).`],ans:`(a) $${fr(h,n)}$ (b) $${fu(1,6)}$ (c) ${h*6>n?'Greater':'Less'}`}});

const g208=G(R=>{const v=R.int(0,3);
 if(v===0){const n=R.pick([60,120,180,240,300,600]),[desc,f]=pred(R,6),cnt=[1,2,3,4,5,6].filter(f).length,E=n/6*cnt;if(!cnt||cnt===6)return null;
  return{q:`A fair six-sided die is rolled $${n}$ times. How many times would you expect to roll ${desc}?`,marks:2,
   sol:[`$P = ${eqf(cnt,6)}$`,`Expected number $= ${fr(cnt,6)} \\times ${n} = ${E}$`],ans:`$${E}$ times`}}
 if(v===1){const p=R.pick([1,2,4,5,8,10,15,20]),n=R.pick([200,250,400,500,800,1000,2000,2500]),E=n*p/100;if(!Number.isInteger(E))return null;
  return{q:`The probability that a part made by a machine is faulty is $${p}\\%$. In a batch of $${N(n)}$ parts, how many would you expect to be faulty?`,marks:2,
   sol:[`$${p}\\% = ${N(p/100)}$`,`Expected number $= ${N(p/100)} \\times ${N(n)} = ${N(E)}$`],ans:`$${N(E)}$ parts`}}
 if(v===2){const n=R.pick([50,100,200,250]),k=R.int(Math.ceil(n*0.15),Math.floor(n*0.6)),j=R.int(4,30),M=n*j,t=R.pick([['ride a bike to school','students'],['own a pet','people'],['prefer tea to coffee','adults']]);
  return{q:`In a survey of $${n}$ ${t[1]}, $${k}$ said they ${t[0]}. Use this to estimate how many of $${N(M)}$ ${t[1]} would ${t[0]}.`,marks:2,
   sol:[`Relative frequency: $${fu(k,n)} = ${fr(k,n)}$`,`Estimate: $${fr(k,n)} \\times ${N(M)} = ${N(k*j)}$`],ans:`$${N(k*j)}$ ${t[1]}`}}
 if(R.next()<0.5){const p=R.pick([10,20,30,40,50,60]),E=30*p/100;
  return{q:`The probability of rain on any day in a particular month is $${p}\\%$. How many rainy days would you expect in a month of $30$ days?`,marks:2,
   sol:[`Expected number of days $= ${N(p/100)} \\times 30 = ${N(E)}$`],ans:`$${N(E)}$ days`}}
 const k=R.pick([20,25,40,50,100]),M=k*R.int(4,60);
 return{q:`The chance that a car is stolen in a year is $1$ in $${k}$. In a town with $${N(M)}$ cars, how many cars would you expect to be stolen in a year?`,marks:2,
  sol:[`$P = ${fu(1,k)}$`,`Expected number $= ${fu(1,k)} \\times ${N(M)} = ${N(M/k)}$`],ans:`$${N(M/k)}$ cars`}});

// ================= TOPIC 3: RIGHT-ANGLED TRIANGLES =================
const TRIN=[['A','B','C'],['P','Q','R'],['X','Y','Z'],['D','E','F'],['K','L','M']];
const tri=R=>{const [a,b,c]=R.pick(TRIN);return{a,b,c,hyp:a+c,AB:a+b,BC:b+c,ra:`$\\angle ${a}${b}${c} = 90^{\\circ}$`,name:`${a}${b}${c}`}};
const sd=s=>`$${s}$`;
const TRIPLES=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[9,40,41]];
const UNIT=['cm','m','mm'];
const triOK=(th,o,a,h)=>Math.abs(o*o+a*a-h*h)<1e-6*h*h&&Math.abs(o/h-sin(th))<1e-9&&Math.abs(a/h-cos(th))<1e-9&&Math.abs(o/a-tan(th))<1e-9;

const g301=G(R=>{const v=R.int(0,2),T=tri(R),u=R.pick(UNIT);
 if(v===0){const l1=R.int(3,20),l2=R.int(3,20),s=l1*l1+l2*l2,c=Math.sqrt(s);if(tie(c,2))return null;const ex=Number.isInteger(c);
  return{q:`In triangle ${T.name}, ${T.ra}, ${ts(T.AB,l1,u)} and ${ts(T.BC,l2,u)}. Find the length of $${T.hyp}$${ex?'':', correct to 2 decimal places'}.`,marks:2,
   sol:[`$${T.hyp}^{2} = ${T.AB}^{2} + ${T.BC}^{2}$`,`$${T.hyp}^{2} = ${l1}^{2} + ${l2}^{2} = ${l1*l1} + ${l2*l2} = ${s}$`,ex?`$${T.hyp} = \\sqrt{${s}} = ${c}$ ${u}`:`$${T.hyp} = \\sqrt{${s}} \\approx ${D(c,2)}$ ${u}`],ans:`$${T.hyp}${ex?'=':'\\approx'} ${D(c,ex?0:2)}\\text{ ${u}}$`,chk:()=>Math.abs(c*c-l1*l1-l2*l2)<1e-9}}
 if(v===1){const h=R.int(8,30),l=R.int(3,h-2),s=h*h-l*l,x=Math.sqrt(s);if(tie(x,2))return null;const ex=Number.isInteger(x);
  return{q:`In triangle ${T.name}, ${T.ra}, ${ts(T.hyp,h,u)} and ${ts(T.AB,l,u)}. Find the length of $${T.BC}$${ex?'':', correct to 2 decimal places'}.`,marks:2,
   sol:[`$${T.BC}^{2} = ${T.hyp}^{2} - ${T.AB}^{2}$`,`$${T.BC}^{2} = ${h}^{2} - ${l}^{2} = ${h*h} - ${l*l} = ${s}$`,ex?`$${T.BC} = \\sqrt{${s}} = ${x}$ ${u}`:`$${T.BC} = \\sqrt{${s}} \\approx ${D(x,2)}$ ${u}`],ans:`$${T.BC}${ex?'=':'\\approx'} ${D(x,ex?0:2)}\\text{ ${u}}$`,chk:()=>Math.abs(x*x+l*l-h*h)<1e-9}}
 const [p,q,r]=R.pick(TRIPLES),k=R.pick([1,1,2]),right=R.next()<0.5;let a=p*k,b=q*k,c=r*k;if(!right){const w=R.pick([-2,-1,1,2]);c=c+w;if(c<=b)return null}
 const lhs=a*a+b*b,rhs=c*c;
 return{q:`A triangle has sides of $${a}$ ${u}, $${b}$ ${u} and $${c}$ ${u}. Is it a right-angled triangle? Show working.`,marks:2,
  sol:[`Test whether $${a}^{2} + ${b}^{2} = ${c}^{2}$.`,`$${a}^{2} + ${b}^{2} = ${a*a} + ${b*b} = ${lhs}$ and $${c}^{2} = ${rhs}$`,lhs===rhs?`They are equal, so the triangle is right-angled.`:`They are not equal, so the triangle is not right-angled.`],ans:lhs===rhs?'Yes, it is right-angled.':'No, it is not right-angled.',chk:()=>(lhs===rhs)===right}});

const g302=G(R=>{const v=R.int(0,3);
 if(v===0){const L=R.int(30,90)/10,d=R.int(10,Math.floor(L*10*0.55))/10,h=Math.sqrt(L*L-d*d);if(tie(h,1))return null;
  return{q:`A ladder $${N(L)}$ m long leans against a vertical wall. The foot of the ladder is $${N(d)}$ m from the base of the wall. How far up the wall does the ladder reach? Give your answer correct to 1 decimal place.`,marks:2,
   sol:[`$h^{2} = ${N(L)}^{2} - ${N(d)}^{2} = ${N(L*L)} - ${N(d*d)} = ${N(L*L-d*d)}$`,`$h = \\sqrt{${N(L*L-d*d)}} \\approx ${D(h,1)}$ m`],ans:`$${D(h,1)}\\text{ m}$`,chk:()=>Math.abs(h*h+d*d-L*L)<1e-9}}
 if(v===1){const k=R.int(4,9),W=16*k,H=9*k,dg=Math.sqrt(W*W+H*H);if(tie(dg,0))return null;
  return{q:`A television screen is $${W}$ cm wide and $${H}$ cm high. The size of a screen is the length of its diagonal. Find the size of this screen, to the nearest centimetre.`,marks:2,
   sol:[`$d^{2} = ${W}^{2} + ${H}^{2} = ${W*W} + ${H*H} = ${W*W+H*H}$`,`$d = \\sqrt{${W*W+H*H}} \\approx ${Math.round(dg)}$ cm`],ans:`$${Math.round(dg)}\\text{ cm}$`}}
 if(v===2){const a=R.int(30,120),b=R.int(20,a),dg=Math.sqrt(a*a+b*b),sv=a+b-dg;if(tie(sv,0))return null;
  return{q:`A rectangular paddock is $${a}$ m long and $${b}$ m wide. Sam walks along two sides from one corner to the opposite corner. Tia walks straight across along the diagonal. How much shorter is Tia's walk, to the nearest metre?`,marks:3,
   sol:[`Sam: $${a} + ${b} = ${a+b}$ m`,`Tia: $\\sqrt{${a}^{2} + ${b}^{2}} = \\sqrt{${a*a+b*b}} \\approx ${D(dg,2)}$ m`,`Difference: $${a+b} - ${D(dg,2)} \\approx ${Math.round(sv)}$ m`],ans:`$${Math.round(sv)}\\text{ m}$`}}
 const h=R.int(40,120)/10,d=R.int(20,70)/10,w=Math.sqrt(h*h+d*d);if(tie(w,2))return null;
 return{q:`A flagpole $${N(h)}$ m high is held upright by a wire from its top to a point on level ground $${N(d)}$ m from its base. Find the length of the wire, correct to 2 decimal places.`,marks:2,
  sol:[`$w^{2} = ${N(h)}^{2} + ${N(d)}^{2} = ${N(h*h)} + ${N(d*d)} = ${N(h*h+d*d)}$`,`$w = \\sqrt{${N(h*h+d*d)}} \\approx ${D(w,2)}$ m`],ans:`$${D(w,2)}\\text{ m}$`}});

const g303=G(R=>{const [p,q,r]=R.pick(TRIPLES),k=R.pick([1,1,2]),T=tri(R),lg1=p*k,lg2=q*k,hy=r*k,u=R.pick(UNIT);   // legs AB = lg1, BC = lg2
 const V=R.pick([T.a,T.c]),opp=V===T.a?T.BC:T.AB,adj=V===T.a?T.AB:T.BC,ov=V===T.a?lg2:lg1,av=V===T.a?lg1:lg2,v=R.int(0,1);
 const fns=R.sample([['sin',opp,ov,T.hyp,hy],['cos',adj,av,T.hyp,hy],['tan',opp,ov,adj,av]],2);
 const word={sin:'\\dfrac{\\text{opp}}{\\text{hyp}}',cos:'\\dfrac{\\text{adj}}{\\text{hyp}}',tan:'\\dfrac{\\text{opp}}{\\text{adj}}'};
 if(v===0)return{q:`In triangle ${T.name}, ${T.ra}, ${ts(T.AB,lg1,u)}, ${ts(T.BC,lg2,u)} and ${ts(T.hyp,hy,u)}. Write down $${fns.map(f=>`\\${f[0]}\\,${V}`).join('$ and $')}$ as fractions in simplest form.`,marks:2,
   sol:[`Angle $${V}$: the opposite side is $${opp}$, the adjacent side is $${adj}$ and the hypotenuse is $${T.hyp}$.`,...fns.map(f=>`$\\${f[0]}\\,${V} = ${word[f[0]]} = ${eqf(f[2],f[4])}$`)],ans:fns.map(f=>`$\\${f[0]}\\,${V} = ${fr(f[2],f[4])}$`).join(', ')};
 const f=fns[0];
 return{q:`In triangle ${T.name}, ${T.ra}, ${ts(T.AB,lg1,u)} and ${ts(T.BC,lg2,u)}. Find $${T.hyp}$ using Pythagoras' theorem, then write down $\\${f[0]}\\,${V}$ as a fraction in simplest form.`,marks:3,
  sol:[`$${T.hyp}^{2} = ${lg1}^{2} + ${lg2}^{2} = ${lg1*lg1} + ${lg2*lg2} = ${hy*hy}$, so ${ts(T.hyp,hy,u)}.`,`Angle $${V}$: opposite $${opp}$, adjacent $${adj}$, hypotenuse $${T.hyp}$.`,`$\\${f[0]}\\,${V} = ${word[f[0]]} = ${eqf(f[2],f[4])}$`],ans:`$${T.hyp} = ${hy}$ ${u}, $\\${f[0]}\\,${V} = ${fr(f[2],f[4])}$`}});

// the unknown side of a right-angled triangle from one side and one angle. mode 'top': x = k × ratio, 'bottom': x = k ÷ ratio
const trigSide=(R,mode)=>{const T=tri(R),fn=R.pick(['sin','cos','tan']),th=R.int(15,75),V=R.pick([T.a,T.c]),
  opp=V===T.a?T.BC:T.AB,adj=V===T.a?T.AB:T.BC,[num,den]=fn==='sin'?[opp,T.hyp]:fn==='cos'?[adj,T.hyp]:[opp,adj],
  known=mode==='top'?den:num,unk=mode==='top'?num:den,k=R.int(30,300)/10,f=fn==='sin'?sin(th):fn==='cos'?cos(th):tan(th),x=mode==='top'?k*f:k/f,u=R.pick(UNIT);
  if(tie(x,2)||x<0.8)return null;
  const eq=mode==='top'?`\\${fn}\\,${ang(th)} = \\dfrac{${unk}}{${N(k)}}`:`\\${fn}\\,${ang(th)} = \\dfrac{${N(k)}}{${unk}}`;
  const solve=mode==='top'?`${unk} = ${N(k)} \\times \\${fn}\\,${ang(th)}`:`${unk} = \\dfrac{${N(k)}}{\\${fn}\\,${ang(th)}}`;
  const side={[opp]:'opposite',[adj]:'adjacent',[T.hyp]:'hypotenuse'};
  return{q:`In triangle ${T.name}, ${T.ra}, $\\angle ${V} = ${ang(th)}$ and ${ts(known,N(k),u)}. Find the length of $${unk}$, correct to 2 decimal places.`,marks:2,
   sol:[`Relative to angle $${V}$, $${known}$ is the ${side[known]} and $${unk}$ is the ${side[unk]}, so use ${fn==='sin'?'sine':fn==='cos'?'cosine':'tangent'}.`,`$${eq}$`,`$${solve} \\approx ${D(x,2)}$ ${u}`],ans:`$${unk} \\approx ${D(x,2)}\\text{ ${u}}$`,
   chk:()=>{const vals={};vals[known]=k;vals[unk]=x;const third=[opp,adj,T.hyp].find(s=>s!==known&&s!==unk);let o=vals[opp],a=vals[adj],h=vals[T.hyp];
     if(third===T.hyp)h=Math.hypot(o,a);else if(third===opp)o=Math.sqrt(h*h-a*a);else a=Math.sqrt(h*h-o*o);return triOK(th,o,a,h)}}};
const g304=G(R=>{const v=R.int(0,2);
 if(v<2)return trigSide(R,'top');
 const ladder=R.next()<0.5,L=R.int(30,90)/10,th=ladder?R.int(55,80):R.int(4,20),x=ladder?L*sin(th):L*cos(th);if(tie(x,2))return null;
 return ladder?{q:`A ladder $${N(L)}$ m long makes an angle of $${ang(th)}$ with level ground. How far up a vertical wall does it reach? Give your answer correct to 2 decimal places.`,marks:2,
   sol:[`The height is opposite the angle, and the ladder is the hypotenuse, so use sine.`,`$\\sin\\,${ang(th)} = \\dfrac{h}{${N(L)}}$`,`$h = ${N(L)} \\times \\sin\\,${ang(th)} \\approx ${D(x,2)}$ m`],ans:`$${D(x,2)}\\text{ m}$`}
  :{q:`A ramp $${N(L)}$ m long makes an angle of $${ang(th)}$ with level ground. Find the horizontal distance the ramp covers, correct to 2 decimal places.`,marks:2,
   sol:[`The horizontal distance is adjacent to the angle, and the ramp is the hypotenuse, so use cosine.`,`$\\cos\\,${ang(th)} = \\dfrac{d}{${N(L)}}$`,`$d = ${N(L)} \\times \\cos\\,${ang(th)} \\approx ${D(x,2)}$ m`],ans:`$${D(x,2)}\\text{ m}$`}});
const g305=G(R=>{const v=R.int(0,2);
 if(v<2)return trigSide(R,'bottom');
 const h=R.int(3,15)/10,th=R.int(4,12),L=h/sin(th);if(tie(L,2))return null;
 return{q:`A wheelchair ramp rises $${N(h)}$ m and makes an angle of $${ang(th)}$ with level ground. Find the length of the ramp, correct to 2 decimal places.`,marks:2,
  sol:[`The rise is opposite the angle and the ramp is the hypotenuse, so use sine.`,`$\\sin\\,${ang(th)} = \\dfrac{${N(h)}}{L}$`,`$L = \\dfrac{${N(h)}}{\\sin\\,${ang(th)}} \\approx ${D(L,2)}$ m`],ans:`$${D(L,2)}\\text{ m}$`}});

const g306=G(R=>{const v=R.int(0,3);
 if(v===0){const d=R.int(10,80),f=R.int(1000,9999)/10000,x=d+f;if(dmsTie(x))return null;
  return{q:`Write $${D(x,4)}^{\\circ}$ in degrees and minutes, correct to the nearest minute.`,marks:1,
   sol:[`$0.${String(Math.round(f*10000)).padStart(4,'0')} \\times 60 = ${D(f*60,2)}$ minutes`,`Nearest minute: $${dms(x)}$`],ans:`$${dms(x)}$`}}
 if(v===1){const d=R.int(10,80),m=R.int(1,19)*3,x=d+m/60;
  return{q:`Convert $${d}^{\\circ}${String(m).padStart(2,'0')}'$ to degrees as a decimal.`,marks:1,
   sol:[`$${m} \\div 60 = ${N(m/60)}$`,`$${d}^{\\circ}${String(m).padStart(2,'0')}' = ${N(x)}^{\\circ}$`],ans:`$${N(x)}^{\\circ}$`}}
 if(v===2){const T=tri(R),d=R.int(15,70),m=R.int(1,19)*3,th=d+m/60,fn=R.pick(['sin','cos']),H=R.int(40,200)/R.pick([2,4]),f=fn==='sin'?sin(th):cos(th),x=H*f,V=T.a,opp=T.BC,adj=T.AB,u=R.pick(UNIT);if(tie(x,2)||!dpOK(H,2))return null;
  const want=fn==='sin'?opp:adj;
  return{q:`In triangle ${T.name}, ${T.ra}, $\\angle ${V} = ${d}^{\\circ}${String(m).padStart(2,'0')}'$ and ${T.hyp} $= ${N(H)}$ ${u}. Find the length of ${want}, correct to 2 decimal places.`,marks:2,
   sol:[`Use ${fn==='sin'?'sine (opposite and hypotenuse)':'cosine (adjacent and hypotenuse)'}.`,`$${want} = ${N(H)} \\times \\${fn}\\,${d}^{\\circ}${String(m).padStart(2,'0')}'$`,`$${want} \\approx ${D(x,2)}$ ${u}`],ans:`$${want} \\approx ${D(x,2)}\\text{ ${u}}$`,
   chk:()=>{const o=fn==='sin'?x:H*sin(th),a=fn==='sin'?H*cos(th):x;return triOK(th,o,a,H)}}}
 const d1=R.int(30,80),m1=R.int(10,55),d2=R.int(20,70),m2=R.int(10,55),tot=d1*60+m1+d2*60+m2,left=180*60-tot;if(left<60*10)return null;
 const sd1=d1+d2+Math.floor((m1+m2)/60),sm=(m1+m2)%60;
 return{q:`Two angles of a triangle are $${d1}^{\\circ}${String(m1).padStart(2,'0')}'$ and $${d2}^{\\circ}${String(m2).padStart(2,'0')}'$. Find the size of the third angle.`,marks:2,
  sol:[`Sum of the two angles: $${d1+d2}^{\\circ}${m1+m2}'${m1+m2>=60?` = ${sd1}^{\\circ}${String(sm).padStart(2,'0')}'`:''}$`,`Third angle: $180^{\\circ} - ${sd1}^{\\circ}${String(sm).padStart(2,'0')}' = ${Math.floor(left/60)}^{\\circ}${String(left%60).padStart(2,'0')}'$`],ans:`$${Math.floor(left/60)}^{\\circ}${String(left%60).padStart(2,'0')}'$`}});

const g307=G(R=>{const v=R.int(0,3),T=tri(R),u=R.pick(UNIT);
 if(v<2){const nm=v===1,fn=R.pick(['sin','cos','tan']),V=T.a,oppN=T.BC,adjN=T.AB;let x,y,th;   // x over y is the ratio
  if(fn==='tan'){x=R.int(3,30);y=R.int(3,30);if(x===y)return null;th=atan(x/y)}
  else{y=R.int(6,30);x=R.int(2,y-2);th=fn==='sin'?asin(x/y):acos(x/y)}
  if(nm?dmsTie(th):tie(th,0))return null;
  const nameX=fn==='cos'?adjN:oppN,nameY=fn==='tan'?adjN:T.hyp,out=nm?dms(th):ang(Math.round(th));
  const describe=fn==='sin'?'the opposite side and the hypotenuse':fn==='cos'?'the adjacent side and the hypotenuse':'the opposite side and the adjacent side';
  return{q:`In triangle ${T.name}, ${T.ra}, ${ts(nameX,x,u)} and ${ts(nameY,y,u)}. Find the size of $\\angle ${V}$, correct to the nearest ${nm?'minute':'degree'}.`,marks:2,
   sol:[`Relative to angle $${V}$, the given sides are ${describe}, so use ${fn==='sin'?'sine':fn==='cos'?'cosine':'tangent'}.`,`$\\${fn}\\,${V} = ${fu(x,y)}$`,`$${V} = \\${fn}^{-1}\\left(${fu(x,y)}\\right) \\approx ${out}$`],ans:`$\\angle ${V} \\approx ${out}$`,
   chk:()=>{const o=fn==='cos'?Math.sqrt(y*y-x*x):x,a=fn==='cos'?x:fn==='tan'?y:Math.sqrt(y*y-x*x),h=fn==='tan'?Math.hypot(x,y):y;return triOK(th,o,a,h)}}}
 if(v===2){const L=R.int(30,80)/10,d=R.int(Math.ceil(L*10*0.2),Math.floor(L*10*0.6))/10,th=acos(d/L);if(tie(th,0))return null;
  return{q:`A ladder $${N(L)}$ m long leans against a vertical wall. The foot of the ladder is $${N(d)}$ m from the base of the wall. Find the angle the ladder makes with the ground, correct to the nearest degree.`,marks:2,
   sol:[`The distance from the wall is adjacent to the angle and the ladder is the hypotenuse, so use cosine.`,`$\\cos\\,\\theta = \\dfrac{${N(d)}}{${N(L)}}$`,`$\\theta = \\cos^{-1}\\left(\\dfrac{${N(d)}}{${N(L)}}\\right) \\approx ${ang(Math.round(th))}$`],ans:`$${ang(Math.round(th))}$`,chk:()=>Math.abs(Math.cos(th*rad)-d/L)<1e-9}}
 const rise=R.int(2,30),run=R.int(rise*3,rise*12),th=atan(rise/run);if(tie(th,1))return null;
 return{q:`A road rises $${rise}$ m over a horizontal distance of $${run}$ m. Find the angle the road makes with the horizontal, correct to 1 decimal place.`,marks:2,
  sol:[`The rise is opposite the angle and the horizontal distance is adjacent, so use tangent.`,`$\\tan\\,\\theta = \\dfrac{${rise}}{${run}}$`,`$\\theta = \\tan^{-1}\\left(\\dfrac{${rise}}{${run}}\\right) \\approx ${D(th,1)}^{\\circ}$`],ans:`$${D(th,1)}^{\\circ}$`,chk:()=>Math.abs(Math.tan(th*rad)-rise/run)<1e-9}});

const g308=G(R=>{const v=R.int(0,4);
 if(v===0){const d=R.int(15,150),th=R.int(15,70),h=d*tan(th),ob=R.pick(['a tree','a building','a tower','a cliff']);if(tie(h,1))return null;
  return{q:`From a point on level ground $${d}$ m from the base of ${ob}, the angle of elevation of the top is $${ang(th)}$. Find the height of ${ob}, correct to 1 decimal place.`,marks:2,
   sol:[`The height is opposite the angle and the distance is adjacent, so use tangent.`,`$\\tan\\,${ang(th)} = \\dfrac{h}{${d}}$`,`$h = ${d} \\times \\tan\\,${ang(th)} \\approx ${D(h,1)}$ m`],ans:`$${D(h,1)}\\text{ m}$`}}
 if(v===1){const d=R.int(15,80),th=R.int(20,65),e=R.pick([1.4,1.5,1.6,1.7,1.8]),h=d*tan(th)+e;if(tie(h,1))return null;
  return{q:`Maya stands $${d}$ m from the base of a building. Her eyes are $${N(e)}$ m above the ground. The angle of elevation of the top of the building from her eyes is $${ang(th)}$. Find the height of the building, correct to 1 decimal place.`,marks:3,
   sol:[`Height above her eyes: $${d} \\times \\tan\\,${ang(th)} \\approx ${D(d*tan(th),2)}$ m`,`Add her eye height: $${D(d*tan(th),2)} + ${N(e)} = ${D(h,2)}$ m`,`Height of the building $\\approx ${D(h,1)}$ m`],ans:`$${D(h,1)}\\text{ m}$`}}
 if(v===2){const h=R.int(8,60),d=R.int(Math.ceil(h*0.6),h*4),th=atan(h/d);if(tie(th,0))return null;
  return{q:`The top of a flagpole is $${h}$ m above the eye level of an observer standing $${d}$ m from its base. Find the angle of elevation of the top of the flagpole from the observer, correct to the nearest degree.`,marks:2,
   sol:[`$\\tan\\,\\theta = \\dfrac{${h}}{${d}}$`,`$\\theta = \\tan^{-1}\\left(\\dfrac{${h}}{${d}}\\right) \\approx ${ang(Math.round(th))}$`],ans:`$${ang(Math.round(th))}$`}}
 if(v===3){const H=R.int(20,120),th=R.int(15,60),d=H/tan(th);if(tie(d,1))return null;
  return{q:`From the top of a cliff $${H}$ m high, the angle of depression of a boat is $${ang(th)}$. How far is the boat from the base of the cliff, correct to 1 decimal place?`,marks:2,
   sol:[`The angle of depression equals the angle of elevation from the boat (alternate angles).`,`$\\tan\\,${ang(th)} = \\dfrac{${H}}{d}$`,`$d = \\dfrac{${H}}{\\tan\\,${ang(th)}} \\approx ${D(d,1)}$ m`],ans:`$${D(d,1)}\\text{ m}$`}}
 const H=R.int(15,100),d=R.int(Math.ceil(H*0.5),H*3),th=atan(H/d);if(tie(th,0))return null;
 return{q:`A lookout is $${H}$ m above sea level. A boat is $${d}$ m horizontally from the base of the lookout. Find the angle of depression of the boat from the lookout, correct to the nearest degree.`,marks:2,
  sol:[`The angle of depression equals the angle of elevation from the boat: $\\tan\\,\\theta = \\dfrac{${H}}{${d}}$`,`$\\theta = \\tan^{-1}\\left(\\dfrac{${H}}{${d}}\\right) \\approx ${ang(Math.round(th))}$`],ans:`$${ang(Math.round(th))}$`}});

const bt=th=>`${String(th).padStart(3,'0')}^{\\circ}\\text{T}`;
const compass=th=>th<90?['N',th,'E']:th<180?['S',180-th,'E']:th<270?['S',th-180,'W']:['N',360-th,'W'];
const cb=([p,a,s])=>`\\text{${p}}${a}^{\\circ}\\text{${s}}`;
const fromCompass=([p,a,s])=>p==='N'?(s==='E'?a:360-a):(s==='E'?180-a:180+a);
const g309=G(R=>{const v=R.int(0,3);
 if(v===0){const th=R.int(1,71)*5;if(th%90===0)return null;const c=compass(th);
  return{q:`Write the true bearing $${bt(th)}$ as a compass bearing.`,marks:1,
   sol:[th<90?`$${th}^{\\circ}$ is between N and E, so it is N $${th}^{\\circ}$ E.`:th<180?`$${th}^{\\circ}$ is between E and S: $180^{\\circ} - ${th}^{\\circ} = ${c[1]}^{\\circ}$, so it is S $${c[1]}^{\\circ}$ E.`:th<270?`$${th}^{\\circ}$ is between S and W: $${th}^{\\circ} - 180^{\\circ} = ${c[1]}^{\\circ}$, so it is S $${c[1]}^{\\circ}$ W.`:`$${th}^{\\circ}$ is between W and N: $360^{\\circ} - ${th}^{\\circ} = ${c[1]}^{\\circ}$, so it is N $${c[1]}^{\\circ}$ W.`],ans:`$${cb(c)}$`,chk:()=>fromCompass(c)===th}}
 if(v===1){const p=R.pick(['N','S']),s=R.pick(['E','W']),a=R.int(2,17)*5,c=[p,a,s],th=fromCompass(c);
  return{q:`Write the compass bearing $${cb(c)}$ as a true bearing.`,marks:1,
   sol:[p==='N'?(s==='E'?`N $${a}^{\\circ}$ E is $${a}^{\\circ}$ clockwise from north.`:`N $${a}^{\\circ}$ W is $360^{\\circ} - ${a}^{\\circ} = ${th}^{\\circ}$ clockwise from north.`):(s==='E'?`S $${a}^{\\circ}$ E is $180^{\\circ} - ${a}^{\\circ} = ${th}^{\\circ}$ clockwise from north.`:`S $${a}^{\\circ}$ W is $180^{\\circ} + ${a}^{\\circ} = ${th}^{\\circ}$ clockwise from north.`)],ans:`$${bt(th)}$`,chk:()=>compass(th).join()===c.join()}}
 if(v===2){const th=R.int(1,71)*5;if(th%90===0)return null;const rv=(th+180)%360,[a,b]=R.pick([['A','B'],['P','Q'],['X','Y']]);
  return{q:`The true bearing of $${b}$ from $${a}$ is $${bt(th)}$. Find the true bearing of $${a}$ from $${b}$.`,marks:2,
   sol:[th<180?`Add $180^{\\circ}$ for the return bearing: $${th}^{\\circ} + 180^{\\circ} = ${rv}^{\\circ}$`:`Subtract $180^{\\circ}$ for the return bearing: $${th}^{\\circ} - 180^{\\circ} = ${rv}^{\\circ}$`],ans:`$${bt(rv)}$`,chk:()=>Math.abs(((rv-th)%360+360)%360-180)<1e-9}}
 const th=R.int(1,71)*5;if(th%90===0)return null;const c=compass(th),rv=(th+180)%360,c2=compass(rv);
 return{q:`The true bearing of $B$ from $A$ is $${bt(th)}$.<br>(a) Write this bearing as a compass bearing.<br>(b) Find the true bearing of $A$ from $B$.`,marks:2,
  sol:[`(a) $${bt(th)} = ${cb(c)}$`,`(b) ${th<180?`$${th}^{\\circ} + 180^{\\circ} = ${rv}^{\\circ}$`:`$${th}^{\\circ} - 180^{\\circ} = ${rv}^{\\circ}$`}`],ans:`(a) $${cb(c)}$ (b) $${bt(rv)}$`,chk:()=>fromCompass(c)===th&&fromCompass(c2)===rv}});

const g310=G(R=>{const v=R.int(0,3);
 if(v===0){const d=R.int(8,200),th=R.int(10,80),n=d*cos(th),e=d*sin(th);if(tie(n,1)||tie(e,1))return null;
  return{q:`A ship sails $${d}$ km on a bearing of $${bt(th)}$. How far north and how far east of its starting point is it? Give your answers correct to 1 decimal place.`,marks:3,
   sol:[`The bearing is $${th}^{\\circ}$ clockwise from north. North is the adjacent side and east is the opposite side.`,`North: $${d} \\times \\cos\\,${ang(th)} \\approx ${D(n,1)}$ km`,`East: $${d} \\times \\sin\\,${ang(th)} \\approx ${D(e,1)}$ km`],ans:`$${D(n,1)}$ km north and $${D(e,1)}$ km east`,
   chk:()=>Math.abs(Math.hypot(n,e)-d)<1e-9&&Math.abs(Math.atan2(e,n)/rad-th)<1e-9}}
 if(v===1){const d=R.int(8,200),th=R.int(100,170),a=180-th,s=d*cos(a),e=d*sin(a);if(tie(s,1)||tie(e,1))return null;
  return{q:`A plane flies $${d}$ km on a bearing of $${bt(th)}$. How far south and how far east of its starting point is it? Give your answers correct to 1 decimal place.`,marks:3,
   sol:[`$${bt(th)} = ${cb(compass(th))}$, so the angle from south is $180^{\\circ} - ${th}^{\\circ} = ${a}^{\\circ}$.`,`South: $${d} \\times \\cos\\,${ang(a)} \\approx ${D(s,1)}$ km`,`East: $${d} \\times \\sin\\,${ang(a)} \\approx ${D(e,1)}$ km`],ans:`$${D(s,1)}$ km south and $${D(e,1)}$ km east`,
   chk:()=>Math.abs(Math.hypot(s,e)-d)<1e-9&&Math.abs(90+Math.atan2(s,e)/rad-th)<1e-9}}
 if(v===2){const a=R.int(3,40),b=R.int(3,40),c=Math.hypot(a,b),th=atan(b/a);if(tie(c,1)||tie(th,0))return null;const t=Math.round(th);
  return{q:`A hiker walks $${a}$ km north and then $${b}$ km east.<br>(a) How far is the hiker from the starting point, correct to 1 decimal place?<br>(b) Find the true bearing of the hiker from the starting point, correct to the nearest degree.`,marks:3,
   sol:[`(a) $d^{2} = ${a}^{2} + ${b}^{2} = ${a*a+b*b}$, so $d \\approx ${D(c,1)}$ km`,`(b) $\\tan\\,\\theta = \\dfrac{${b}}{${a}}$ , so $\\theta = \\tan^{-1}\\left(\\dfrac{${b}}{${a}}\\right) \\approx ${t}^{\\circ}$`,`The bearing is measured clockwise from north: $${bt(t)}$.`],ans:`(a) $${D(c,1)}$ km (b) $${bt(t)}$`,chk:()=>Math.abs(Math.atan2(b,a)/rad-th)<1e-9}}
 const d=R.int(3,40),e=R.int(3,40),c=Math.hypot(d,e),ph=atan(e/d);if(tie(c,1)||tie(ph,0))return null;const t=90+Math.round(ph);
 return{q:`A boat is $${d}$ km due east and $${e}$ km due south of a lighthouse.<br>(a) How far is the boat from the lighthouse, correct to 1 decimal place?<br>(b) Find the true bearing of the boat from the lighthouse, correct to the nearest degree.`,marks:3,
  sol:[`(a) $x^{2} = ${d}^{2} + ${e}^{2} = ${d*d+e*e}$, so $x \\approx ${D(c,1)}$ km`,`(b) The angle south of east is $\\tan^{-1}\\left(\\dfrac{${e}}{${d}}\\right) \\approx ${Math.round(ph)}^{\\circ}$`,`Bearing $= 90^{\\circ} + ${Math.round(ph)}^{\\circ} = ${t}^{\\circ}$, that is $${bt(t)}$.`],ans:`(a) $${D(c,1)}$ km (b) $${bt(t)}$`,chk:()=>Math.abs(90+Math.atan2(e,d)/rad-(90+ph))<1e-9}});

// ================= TOPICS AND LESSONS =================
const TOPICS=[
 {id:'s1-ratios-rates',name:'Ratios and rates',course:COURSE,lessons:[
  {id:'rr-fractions',group:'Ratios',name:'1.01 Ratios and fractions',gen:g101,marks:1},
  {id:'rr-simplify',group:'Ratios',name:'1.02 Simplifying ratios',gen:g102,marks:1},
  {id:'rr-divide',group:'Ratios',name:'1.03 Dividing in a given ratio',gen:g103,marks:2},
  {id:'rr-mapscale',group:'Scale',name:'1.04 Map scales',gen:g104,marks:2},
  {id:'rr-ruler',group:'Scale',name:'1.05 Scale drawings with a ruler',gen:g105,marks:2},
  {id:'rr-plans',group:'Scale',name:'1.06 Scale drawings and building plans',gen:g106,marks:3},
  {id:'rr-unit',group:'Rates',name:'1.07 Rates and unit rates',gen:g107,marks:1},
  {id:'rr-convert',group:'Rates',name:'1.08 Converting rates',gen:g108,marks:2},
  {id:'rr-bestbuy',group:'Rates',name:'1.09 Comparing rates and best buys',gen:g109,marks:2},
  {id:'rr-speed',group:'Rates',name:'1.10 Speed, distance and time',gen:g110,marks:2},
  {id:'rr-fuel',group:'Rates',name:'1.11 Fuel consumption',gen:g111,marks:2}]},
 {id:'s1-probability',name:'Relative frequency and probability',course:COURSE,lessons:[
  {id:'pb-scale',group:'Theoretical probability',name:'2.01 The probability scale',gen:g201,marks:1},
  {id:'pb-sample',group:'Theoretical probability',name:'2.02 Sample spaces',gen:g202,marks:1},
  {id:'pb-equal',group:'Theoretical probability',name:'2.03 Equally likely outcomes',gen:g203,marks:1},
  {id:'pb-compl',group:'Theoretical probability',name:'2.04 Complementary events',gen:g204,marks:2},
  {id:'pb-array',group:'Two-stage events',name:'2.05 Two-stage events: arrays',gen:g205,marks:2},
  {id:'pb-tree',group:'Two-stage events',name:'2.06 Two-stage events: tree diagrams',gen:g206,marks:3},
  {id:'pb-relfreq',group:'Experiments and expectation',name:'2.07 Relative frequency',gen:g207,marks:2},
  {id:'pb-expect',group:'Experiments and expectation',name:'2.08 Expected frequency',gen:g208,marks:2}]},
 {id:'s1-right-triangles',name:'Right-angled triangles',course:COURSE,lessons:[
  {id:'rt-pyth',group:'Pythagoras',name:"3.01 Pythagoras' theorem",gen:g301,marks:2},
  {id:'rt-pythprac',group:'Pythagoras',name:'3.02 Pythagoras in practical problems',gen:g302,marks:2},
  {id:'rt-ratios',group:'Trigonometry',name:'3.03 The trigonometric ratios',gen:g303,marks:2},
  {id:'rt-sidetop',group:'Trigonometry',name:'3.04 Finding a side: unknown on top',gen:g304,marks:2},
  {id:'rt-sidebottom',group:'Trigonometry',name:'3.05 Finding a side: unknown on the bottom',gen:g305,marks:2},
  {id:'rt-dm',group:'Trigonometry',name:'3.06 Degrees and minutes',gen:g306,marks:2},
  {id:'rt-angle',group:'Trigonometry',name:'3.07 Finding an angle',gen:g307,marks:2},
  {id:'rt-elev',group:'Applications',name:'3.08 Angles of elevation and depression',gen:g308,marks:2},
  {id:'rt-bearings',group:'Applications',name:'3.09 True and compass bearings',gen:g309,marks:1},
  {id:'rt-bearprob',group:'Applications',name:'3.10 Bearing problems',gen:g310,marks:3}]}
];
const LESSONS={};TOPICS.forEach(t=>t.lessons.forEach(l=>{l.topic=t;LESSONS[l.id]=l}));

// ================= SHEET CODES =================
// Printed on each quiz page so a copy of the code opens the same quiz again: s1 seed.minutes.marks.s1.lessons
// APPEND new lesson ids to the END only; never reorder or remove, or old printed codes will point at the wrong lessons.
const CODE_ORDER=[
 "rr-fractions","rr-simplify","rr-divide","rr-mapscale","rr-ruler","rr-plans","rr-unit","rr-convert","rr-bestbuy","rr-speed","rr-fuel",
 "pb-scale","pb-sample","pb-equal","pb-compl","pb-array","pb-tree","pb-relfreq","pb-expect",
 "rt-pyth","rt-pythprac","rt-ratios","rt-sidetop","rt-sidebottom","rt-dm","rt-angle","rt-elev","rt-bearings","rt-bearprob",
];
const DESK_ORDER=TOPICS.flatMap(t=>t.lessons.map(l=>l.id));   // the order lessons are listed on screen
const encodeLessons=ids=>{const on=new Set(ids);let n=0n;CODE_ORDER.forEach((id,i)=>{if(on.has(id))n|=1n<<BigInt(i)});return n.toString(36)};
const decodeLessons=s=>{let n=0n;for(const ch of String(s).toLowerCase()){const d=parseInt(ch,36);if(isNaN(d))return[];n=n*36n+BigInt(d)}return CODE_ORDER.filter((id,i)=>(n>>BigInt(i))&1n).filter(id=>LESSONS[id])};
const cleanSeed=s=>String(s).replace(/[^\w-]/g,'').slice(0,16);
const lsqCode=(seed,mins,marks,ids)=>[seed,mins,marks,'s1',encodeLessons(ids)].join('.');
const readLsqCode=code=>{const p=String(code).trim().split('.');if(p.length!==5||p[3]!=='s1')return null;
 const mins=+p[1],marks=+p[2],ids=decodeLessons(p[4]).sort((a,b)=>DESK_ORDER.indexOf(a)-DESK_ORDER.indexOf(b));
 return!ids.length||isNaN(mins)||isNaN(marks)||!p[0]?null:{seed:p[0],mins,marks,ids}};
const drawQuestion=(L,R)=>L.gen(R);

return{COURSE,TOPICS,LESSONS,CODE_ORDER,DESK_ORDER,encodeLessons,decodeLessons,cleanSeed,lsqCode,readLsqCode,drawQuestion};
})();
