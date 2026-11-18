// Tutorial question bank for the tutorial generator. Loaded after engine.js.
// Hard and unfamiliar questions on Year 11 Advanced and Year 12 differential and integral calculus: the sort a student
// can't answer by copying a worked example. Each template is one question TYPE with random numbers:
//   id      unique and stable (used in share links)
//   topic   a topic id from engine.js (TOPICS), so the year buttons and topic names come for free
//   name    shown in the sidebar
//   mins    ignored: worked out as 1.8 minutes per mark from TUT_MARKS
//   level   2 = Hard, 3 = Very hard
//   hint    one nudge the teacher can reveal without giving the method away
//   gen(R)  returns {q, sol:[...], ans, chk}.  chk() is only used by scripts/check_tutorial.js and must return
//           true when the printed answer agrees with an independent numeric check.
// Marks for each question (one number per part), taken from how the HSC marks similar parts:
//   "Show that ..." 2 (2020 Q29(a), 2022 Q27(a), 2025 Q25(a), 2026 Q21(a));  "Prove" an identity 2 (2020 Q19, 2025 Q22);
//   a short "find" 1 (2023 Q31(a)) to 2 (2020 Q29(b), 2022 Q27(b)); a multi-step "find / solve" 3 (2020 Q21(c), 2021 Q18,
//   2023 Q30(a), 2026 Q21(b)); a whole tangent question 4 (2020 Q29, 2021 Q31, 2025 Q24).
// Time is 1.8 minutes per mark, so a question's minutes are worked out from these.
const TUT_MARKS={
 'tt-tangent-k':[4],'tt-selfinv':[2,1,2],'tt-composite':[2,2,2],'tt-abssum':[3,3],'tt-sector-max':[2,2,1],
 'tt-ambiguous':[2,3,2],'tt-identity':[2,3],'tt-cosgraph':[3,2],'tt-logdomain':[3],'tt-reciplog':[3],'tt-logsimul':[3],
 'tt-tangents-from-point':[4],'tt-cubic-again':[2,3,2],'tt-prob-indep':[1,2,2],'tt-prob-marbles':[2,3],
 'tt-ode':[3],'tt-sqrt-quot':[2,1],'tt-exp-origin':[4],'tt-ln-origin':[4],'tt-touching':[4],'tt-chain-data':[2,2],'tt-ln-show':[2],
 'tt-int-findk':[3],'tt-int-oddeven':[3],'tt-int-accum':[2,2],'tt-int-hence':[2,2],'tt-int-cubic-area':[2,3],'tt-int-yaxis':[2,2],
 'tt-int-trap':[2,2,1],'tt-int-limits':[1,2,2]};
const TUT_MIN_PER_MARK=1.8;
const TUT=[];
const tut=(id,topic,name,mins,level,hint,gen)=>TUT.push({id,topic,name,mins,level,hint,gen});
const LEVEL_NAME={2:'Hard',3:'Very hard'};

// ---------- small helpers ----------
const tPar=n=>n<0?`(${n})`:String(n);
const tDec=n=>String(n/100);                                   // hundredths as a decimal
const tKx=k=>k===1?'x':k===-1?'-x':k+'x';
const tMk=n=>`<span class="pm">${n} mark${n>1?'s':''}</span>`;
const tParts=(intro,arr,marks)=>`${intro}<div class="parts">${arr.map((p,i)=>`<div class="pt"><span>(${String.fromCharCode(97+i)})</span><div>${p}</div>${tMk(marks[i])}</div>`).join('')}</div>`;
const tOne=(text,n)=>`<div class="pt one"><div>${text}</div>${tMk(n)}</div>`;
const tNear=(a,b)=>Math.abs(a-b)<=1e-7*Math.max(1,Math.abs(a),Math.abs(b));
const tFx=(f,x,h=1e-5)=>(f(x+h)-f(x-h))/(2*h);

// =====================================================================
// YEAR 11 · WORKING WITH FUNCTIONS
// =====================================================================

tut('tt-tangent-k','11adv-functions','Line tangent to a parabola',6,2,
 'Equate the two expressions to get a quadratic in x. What has to be true of its discriminant for the line to be a tangent?',
 R=>{const a=R.pick([1,2,3,-1,-2]),b=R.int(-4,4),c=R.int(-5,5);let m;do{m=R.int(-4,4)}while(m===b);
  const d=b-m,ck=F(d*d,4*a),k=F(c).sub(ck),x=F(-d,2*a),y=x.mul(m).add(k);
  const para=poly([[a,'x^{2}'],[b,'x'],[c,'']]),line=poly([[m,'x'],[1,'k']]),ckT=c===0?'-k':`${c}-k`;
  return{q:tOne(`The line $y=${line}$ is a tangent to the parabola $y=${para}$. Find the value of $k$ and the coordinates of the point of contact.`,TUT_MARKS['tt-tangent-k'][0]),
   sol:[`Equate the two expressions: $${para}=${line}$, so $$${poly([[a,'x^{2}'],[d,'x'],[c,'']])}-k=0.$$`,
    `A tangent meets the parabola at exactly one point, so the discriminant is zero: $$(${d})^{2}-4(${a})(${ckT})=0$$`,
    `$$${d*d}=${4*a}(${ckT})\\;\\Rightarrow\\;${ckT}=${ck.tex()}\\;\\Rightarrow\\;k=${k.tex()}$$`,
    `The repeated root is the point of contact: $$x=\\frac{-(${d})}{${2*a}}=${x.tex()}$$`,
    `$$y=${m}\\times ${x.btex()}+${k.btex()}=${y.tex()}$$`],
   ans:`$k=${k.tex()}$, point of contact $\\left(${x.tex()},\\ ${y.tex()}\\right)$`,
   chk:()=>tNear(d*d,4*a*(c-k.val()))&&tNear(a*x.val()**2+b*x.val()+c,m*x.val()+k.val())&&tNear(y.val(),m*x.val()+k.val())}});

tut('tt-selfinv','11adv-functions','Self-inverse function',7,3,
 'Find the inverse by swapping x and y. If f and its inverse are the same function, what must be true of their denominators?',
 R=>{const c=R.pick([2,3,4,5]),n=R.pick([-3,-2,-1,1,2].filter(v=>v<c)),b=-c*n,D=c*c-c*n,num=poly([[c,'x'],[b,'']]);
  return{q:tParts(`The function $f(x)=\\dfrac{kx+b}{x-${c}}$, $x\\ne ${c}$, is its own inverse, that is, $f^{-1}(x)=f(x)$. Also $f(0)=${n}$.`,
    [`Show that $k=${c}$.`,`Find the value of $b$.`,`Hence solve $f(x)=x$, giving exact answers.`],TUT_MARKS['tt-selfinv']),
   sol:[`(a) Let $y=\\dfrac{kx+b}{x-${c}}$ and swap $x$ and $y$: $$x(y-${c})=ky+b\\;\\Rightarrow\\;xy-ky=${c}x+b\\;\\Rightarrow\\;y(x-k)=${c}x+b$$`,
    `So $f^{-1}(x)=\\dfrac{${c}x+b}{x-k}$. For $f^{-1}(x)=f(x)$ the vertical asymptotes must agree, so $x-k=x-${c}$ and $k=${c}$. The numerators then agree as well.`,
    `(b) $f(0)=\\dfrac{b}{0-${c}}=${n}$, so $b=${b}$.`,
    `(c) $f(x)=x$ gives $${num}=x(x-${c})$, so $$${poly([[1,'x^{2}'],[-2*c,'x'],[-b,'']])}=0$$`,
    `$$x=\\frac{${2*c}\\pm\\sqrt{${tPar(-2*c)}^{2}-4(1)(${-b})}}{2}=\\frac{${2*c}\\pm\\sqrt{${4*D}}}{2}=${c}\\pm ${surdRoot(D)}$$`],
   ans:`(a) shown; (b) $b=${b}$; (c) $x=${c}\\pm ${surdRoot(D)}$`,
   chk:()=>{const f=x=>(c*x+b)/(x-c);return [0.37,1.9,-2.2,5.5].every(x=>tNear(f(f(x)),x))&&tNear(f(0),n)&&[1,-1].every(s=>{const r=c+s*Math.sqrt(D);return tNear(f(r),r)})}}});

tut('tt-composite','11adv-functions','Composite functions: an equation with no solution',6,3,
 'Each composite has its own domain. Before squaring, ask what sign the square root forces on the other side.',
 R=>{const a=R.int(1,3),b=R.int(1,3),s=a+b,root=surdRoot(s),h=F(s+1,2);
  return{q:tParts(`Let $f(x)=\\sqrt{x-${a}}$ and $g(x)=x^{2}-${b}$.`,
    [`Find the domain of $f(g(x))$.`,`Find $g(f(x))$, and state its domain and range.`,`Show that the equation $f(g(x))=g(f(x))$ has no real solutions.`],TUT_MARKS['tt-composite']),
   sol:[`(a) $f(g(x))=\\sqrt{x^{2}-${b}-${a}}=\\sqrt{x^{2}-${s}}$. We need $x^{2}-${s}\\ge 0$, so $$x\\le -${root}\\quad\\text{or}\\quad x\\ge ${root}.$$`,
    `(b) $g(f(x))=\\left(\\sqrt{x-${a}}\\right)^{2}-${b}=x-${s}$. The inner function needs $x\\ge ${a}$, so the domain is $x\\ge ${a}$.`,
    `On that domain $x-${s}\\ge ${a}-${s}=-${b}$, so the range is $y\\ge -${b}$.`,
    `(c) We need $\\sqrt{x^{2}-${s}}=x-${s}$. A square root is never negative, so any solution needs $x\\ge ${s}$.`,
    `Squaring: $x^{2}-${s}=x^{2}-${2*s}x+${s*s}$, so $${2*s}x=${s*s+s}$ and $x=${h.tex()}$.`,
    `But $${h.tex()}<${s}$, which breaks the condition $x\\ge ${s}$. So this root is extraneous and there are no real solutions.`],
   ans:`(a) $x\\le -${root}$ or $x\\ge ${root}$; (b) $g(f(x))=x-${s}$, domain $x\\ge ${a}$, range $y\\ge -${b}$; (c) the only candidate $x=${h.tex()}$ is extraneous`,
   chk:()=>{let min=1e9;for(let x=Math.sqrt(s)+1e-9;x<400;x+=0.01)min=Math.min(min,Math.sqrt(x*x-s)-(x-s));return min>1e-6&&h.val()<s}}});

tut('tt-abssum','11adv-functions','Sum of two absolute values',5,2,
 '|x − a| is the distance from x to a on the number line. What is the smallest the sum of two distances can be?',
 R=>{const a=R.int(-3,2),d=R.int(2,5),b=a+d,e=R.int(1,3),c=d+2*e,A=poly([[1,'x'],[-a,'']]),B=poly([[1,'x'],[-b,'']]);
  return{q:tParts('',[`Solve $|${A}|+|${B}|=${c}$.`,`For what values of $k$ does $|${A}|+|${B}|=k$ have (i) no solutions, (ii) infinitely many solutions, (iii) exactly two solutions?`],TUT_MARKS['tt-abssum']),
   sol:[`(a) The critical values are $x=${a}$ and $x=${b}$, giving three cases.`,
    `$x<${a}$: $-(${A})-(${B})=${c}$, so $${poly([[-2,'x'],[a+b,'']])}=${c}$ and $x=${a-e}$. This satisfies $x<${a}$, so it is a solution.`,
    `$${a}\\le x\\le ${b}$: $(${A})-(${B})=${d}$, which is never equal to ${c}. No solutions.`,
    `$x>${b}$: $(${A})+(${B})=${c}$, so $${poly([[2,'x'],[-(a+b),'']])}=${c}$ and $x=${b+e}$. This satisfies $x>${b}$, so it is a solution.`,
    `(b) $|x-${a}|+|x-${b}|$ is the sum of the distances from $x$ to $${a}$ and to $${b}$ on the number line. It is at least the distance between them, ${d}, and equals ${d} exactly when $x$ lies between them.`,
    `So (i) no solutions when $k<${d}$; (ii) infinitely many when $k=${d}$ (every $x$ from $${a}$ to $${b}$); (iii) exactly two when $k>${d}$.`],
   ans:`(a) $x=${a-e}$ or $x=${b+e}$; (b) (i) $k<${d}$, (ii) $k=${d}$, (iii) $k>${d}$`,
   chk:()=>[a-e,b+e].every(x=>tNear(Math.abs(x-a)+Math.abs(x-b),c))&&tNear((a-e)+(b+e),a+b)}});

// =====================================================================
// YEAR 11 · TRIGONOMETRY AND MEASURE OF ANGLES
// =====================================================================

tut('tt-sector-max','11adv-trigmeasure','Sector of fixed perimeter',6,2,
 'Write the perimeter using r and θ, solve for θ, then put that into the area formula. Maximising needs no calculus.',
 R=>{const P=R.pick([12,16,20,24,28,32,40,48]),h=P/2,r0=P/4,A0=r0*r0;
  return{q:tParts(`A sector of a circle of radius $r$ cm has a perimeter of ${P} cm. The angle at the centre is $\\theta$ radians.`,
    [`Show that the area of the sector is $A=${h}r-r^{2}$ square centimetres.`,`By completing the square, find the maximum area and the value of $r$ at which it occurs.`,`Find the angle at the centre when the area is a maximum.`],TUT_MARKS['tt-sector-max']),
   sol:[`(a) Perimeter: $2r+r\\theta=${P}$, so $\\theta=\\dfrac{${P}-2r}{r}$.`,
    `$$A=\\tfrac{1}{2}r^{2}\\theta=\\tfrac{1}{2}r(${P}-2r)=${h}r-r^{2}$$`,
    `(b) $$A=-(r^{2}-${h}r)=-(r-${r0})^{2}+${A0}$$`,
    `The maximum area is $${A0}\\text{ cm}^{2}$, when $r=${r0}$ cm.`,
    `(c) $$\\theta=\\frac{${P}-2(${r0})}{${r0}}=\\frac{${P-2*r0}}{${r0}}=2\\text{ radians}$$`],
   ans:`(a) shown; (b) $A_{\\max}=${A0}\\text{ cm}^{2}$ at $r=${r0}$ cm; (c) $\\theta=2$ radians`,
   chk:()=>{let best=-1,br=0;for(let r=0.01;r<h;r+=0.01){const A=h*r-r*r;if(A>best){best=A;br=r}}return tNear(best,A0)&&Math.abs(br-r0)<0.02&&tNear((P-2*r0)/r0,2)}}});

tut('tt-ambiguous','11adv-trigmeasure','Ambiguous case: both triangles',8,3,
 'The sine rule gives sin C. How many angles between 0° and 180° have that sine? Does each leave room for angle A?',
 R=>{const al=R.pick([30,35,40,45,50,60]),c=R.pick([10,12,14,15,16,18]),sA=Math.sin(al*Math.PI/180),h=c*sA;let a,t,g=0;
  do{t=R.pick([0.25,0.5,0.75]);a=Math.round((h+t*(c-h))*10)/10;g++}while((a<=h+0.15||a>=c-0.15)&&g<50);
  const sC=c*sA/a,C1=Math.asin(sC)*180/Math.PI,C2=180-C1,B1=180-al-C1,B2=180-al-C2,r=Math.PI/180,
   b1=a*Math.sin(B1*r)/sA,b2=a*Math.sin(B2*r)/sA,f1=v=>v.toFixed(1);
  return{q:tParts(`In triangle $ABC$, $\\angle A=${al}^{\\circ}$, $AB=${c}$ cm and $BC=${a}$ cm.`,
    [`Show that there are two possible triangles.`,`Find the two possible sizes of $\\angle C$, to the nearest tenth of a degree.`,`Find the two possible lengths of $AC$, to the nearest tenth of a centimetre.`],TUT_MARKS['tt-ambiguous']),
   sol:[`(a) Sine rule: $\\dfrac{\\sin C}{${c}}=\\dfrac{\\sin ${al}^{\\circ}}{${a}}$, so $\\sin C=\\dfrac{${c}\\sin ${al}^{\\circ}}{${a}}=${sC.toFixed(4)}$.`,
    `This is less than 1, so $C$ is either acute or obtuse. The obtuse value $${f1(C2)}^{\\circ}$ is possible because $${al}^{\\circ}+${f1(C2)}^{\\circ}<180^{\\circ}$ (equivalently, $BC<AB$ so $C>A$). Both values give a triangle.`,
    `(b) $C=${f1(C1)}^{\\circ}$ or $C=180^{\\circ}-${f1(C1)}^{\\circ}=${f1(C2)}^{\\circ}$.`,
    `(c) Then $B=${f1(B1)}^{\\circ}$ or $B=${f1(B2)}^{\\circ}$. By the sine rule, $AC=\\dfrac{${a}\\sin B}{\\sin ${al}^{\\circ}}$:`,
    `$$AC=\\frac{${a}\\sin ${f1(B1)}^{\\circ}}{\\sin ${al}^{\\circ}}=${f1(b1)}\\text{ cm}\\quad\\text{or}\\quad AC=\\frac{${a}\\sin ${f1(B2)}^{\\circ}}{\\sin ${al}^{\\circ}}=${f1(b2)}\\text{ cm}$$`],
   ans:`(b) $C=${f1(C1)}^{\\circ}$ or ${f1(C2)}^{\\circ}$; (c) $AC=${f1(b1)}$ cm or ${f1(b2)}$ cm`,
   chk:()=>h<a&&a<c&&B1>0&&B2>0&&[b1,b2].every(b=>Math.abs(a*a-(b*b+c*c-2*b*c*Math.cos(al*r)))<1e-6)&&tNear(b1+b2,2*c*Math.cos(al*r))}});

// =====================================================================
// YEAR 11 · TRIGONOMETRIC IDENTITIES AND EQUATIONS
// =====================================================================

tut('tt-identity','11adv-trigid','Prove an identity, then use it',6,2,
 'Combine the two fractions over a common denominator, then use sin²θ + cos²θ = 1 in the numerator.',
 R=>{const e=R.pick([1,-1]),sg=e===1?'+':'-',u=`1${sg}\\cos\\theta`,
  o=R.pick([{c:'4',s:'\\dfrac{1}{2}',a:[F(1,6),F(5,6)],v:4},{c:'2\\sqrt{2}',s:'\\dfrac{1}{\\sqrt{2}}',a:[F(1,4),F(3,4)],v:2*Math.SQRT2},{c:'\\dfrac{4}{\\sqrt{3}}',s:'\\dfrac{\\sqrt{3}}{2}',a:[F(1,3),F(2,3)],v:4/Math.sqrt(3)}]);
  return{q:tParts('',[`Prove that $\\dfrac{${u}}{\\sin\\theta}+\\dfrac{\\sin\\theta}{${u}}=\\dfrac{2}{\\sin\\theta}$.`,
     `Hence solve $\\dfrac{${u}}{\\sin\\theta}+\\dfrac{\\sin\\theta}{${u}}=${o.c}$ for $0\\le\\theta\\le 2\\pi$.`],TUT_MARKS['tt-identity']),
   sol:[`(a) $$\\text{LHS}=\\frac{(${u})^{2}+\\sin^{2}\\theta}{\\sin\\theta(${u})}=\\frac{1${sg}2\\cos\\theta+\\cos^{2}\\theta+\\sin^{2}\\theta}{\\sin\\theta(${u})}$$`,
    `$$=\\frac{2${sg}2\\cos\\theta}{\\sin\\theta(${u})}=\\frac{2(${u})}{\\sin\\theta(${u})}=\\frac{2}{\\sin\\theta}=\\text{RHS}$$`,
    `(b) By part (a) the equation is $\\dfrac{2}{\\sin\\theta}=${o.c}$, so $\\sin\\theta=${o.s}$.`,
    `$$\\theta=${piTex(o.a[0])}\\quad\\text{or}\\quad\\theta=${piTex(o.a[1])}$$`],
   ans:`(a) shown; (b) $\\theta=${piTex(o.a[0])}$ or $${piTex(o.a[1])}$`,
   chk:()=>o.a.every(f=>{const t=f.val()*Math.PI,s=Math.sin(t),cc=Math.cos(t),w=1+e*cc;return tNear(w/s+s/w,o.v)&&tNear(2/s,o.v)})}});

tut('tt-cosgraph','11adv-trigid','Find a cosine graph from its features',6,2,
 'The maximum and minimum fix the amplitude and the vertical shift. Where does a cosine graph first reach its minimum?',
 R=>{const a=R.pick([2,3,4,5]),d=R.int(-3,3),b=R.pick([2,3,4]),M=a+d,m=d-a,v=F(2*d+a,2),bx=b+'x',eq=poly([[a,`\\cos(${bx})`],[d,'']]),
   x1=F(1,3*b),x2=F(5,3*b);
  return{q:tParts(`The graph of $y=a\\cos(bx)+d$, where $a>0$ and $b>0$, has a maximum value of ${M} and its first minimum point is $\\left(${piTex(F(1,b))},\\ ${m}\\right)$.`,
    [`Find the values of $a$, $b$ and $d$.`,`Hence find the exact values of $x$ for which $y=${v.tex()}$, where $0\\le x\\le ${piTex(F(2,b))}$.`],TUT_MARKS['tt-cosgraph']),
   sol:[`(a) Maximum $=a+d=${M}$ and minimum $=-a+d=${m}$. Adding gives $2d=${M+m}$, so $d=${d}$, and then $a=${a}$.`,
    `The first minimum of a cosine graph occurs at half a period, so half the period is $${piTex(F(1,b))}$. The period is $${piTex(F(2,b))}=\\dfrac{2\\pi}{b}$, so $b=${b}$.`,
    `(b) $${eq}=${v.tex()}$ gives $\\cos(${bx})=${F(1,2).tex()}$.`,
    `For $0\\le x\\le ${piTex(F(2,b))}$ we have $0\\le ${bx}\\le 2\\pi$, so $${bx}=\\dfrac{\\pi}{3}$ or $\\dfrac{5\\pi}{3}$.`,
    `$$x=${piTex(x1)}\\quad\\text{or}\\quad x=${piTex(x2)}$$`],
   ans:`(a) $a=${a}$, $b=${b}$, $d=${d}$; (b) $x=${piTex(x1)}$ or $${piTex(x2)}$`,
   chk:()=>{const y=x=>a*Math.cos(b*x)+d;return tNear(y(0),M)&&tNear(y(Math.PI/b),m)&&[x1,x2].every(f=>tNear(y(f.val()*Math.PI),v.val()))}}});

// =====================================================================
// YEAR 11 · EXPONENTIAL AND LOGARITHMIC FUNCTIONS
// =====================================================================

tut('tt-logdomain','11adv-explog','Log equation with a rejected root',5,2,
 'Combine the logs first, but check the domain of each original log before you accept an answer.',
 R=>{const [base,r,a,n]=R.pick([[2,4,2,3],[2,8,6,4],[2,8,4,5],[2,16,12,6],[2,16,8,7],[2,32,24,8],[3,9,6,3],[3,27,18,5],[3,27,24,4]]),
   N=base**n,o=r-a,L=`\\log_{${base}}`;
  return{q:tOne(`Solve $${L}x+${L}(x-${a})=${n}$.`,TUT_MARKS['tt-logdomain'][0]),
   sol:[`Domain: $x>0$ and $x-${a}>0$, so $x>${a}$.`,
    `$$${L}\\,x(x-${a})=${n}\\;\\Rightarrow\\;x(x-${a})=${base}^{${n}}=${N}$$`,
    `$$x^{2}-${a}x-${N}=0\\;\\Rightarrow\\;(x-${r})(x+${o})=0$$`,
    `So $x=${r}$ or $x=-${o}$. The value $x=-${o}$ is not greater than ${a}, so it is rejected.`],
   ans:`$x=${r}$`,
   chk:()=>r*(r-a)===N&&r>a&&(-o)<=a&&tNear(Math.log(r)/Math.log(base)+Math.log(r-a)/Math.log(base),n)}});

tut('tt-reciplog','11adv-explog','Reciprocal logarithms',6,3,
 'Change of base gives log_x b = 1 / log_b x. Let u = log_b x and see what equation you get.',
 R=>{const b=R.pick([2,3,5]),k=R.pick([2,3,4]),rhs=F(k*k+1,k),X1=b**k,X2=rootTex(k,b),L=`\\log_{${b}}`;
  return{q:tOne(`Solve $\\log_{x}${b}+${L}x=${rhs.tex()}$.`,TUT_MARKS['tt-reciplog'][0]),
   sol:[`By the change of base rule, $\\log_{x}${b}=\\dfrac{1}{${L}x}$. Let $u=${L}x$ (with $x>0$, $x\\ne 1$).`,
    `$$\\frac{1}{u}+u=${rhs.tex()}\\;\\Rightarrow\\;${k}u^{2}-${k*k+1}u+${k}=0\\;\\Rightarrow\\;(${k}u-1)(u-${k})=0$$`,
    `So $u=${k}$ or $u=\\dfrac{1}{${k}}$.`,
    `$$x=${b}^{${k}}=${X1}\\quad\\text{or}\\quad x=${b}^{\\frac{1}{${k}}}=${X2}$$`],
   ans:`$x=${X1}$ or $x=${X2}$`,
   chk:()=>[b**k,b**(1/k)].every(x=>tNear(Math.log(b)/Math.log(x)+Math.log(x)/Math.log(b),rhs.val()))}});

tut('tt-logsimul','11adv-explog','Simultaneous logarithmic equations',4,2,
 'Turn the log equation into an equation for xy. Then you have xy and x/y, which is enough to find x².',
 R=>{const m=R.int(2,6),n=R.int(1,m-1),s=m+n,r=2**(m-n);
  return{q:tOne(`Solve the simultaneous equations $\\log_{2}x+\\log_{2}y=${s}$ and $\\dfrac{x}{y}=${r}$, where $x>0$ and $y>0$.`,TUT_MARKS['tt-logsimul'][0]),
   sol:[`$\\log_{2}x+\\log_{2}y=\\log_{2}(xy)=${s}$, so $xy=2^{${s}}=${2**s}$.`,
    `From $\\dfrac{x}{y}=${r}$ we have $y=\\dfrac{x}{${r}}$. Substitute: $\\dfrac{x^{2}}{${r}}=${2**s}$, so $x^{2}=${r*2**s}=2^{${2*m}}$.`,
    `Since $x>0$, $x=2^{${m}}=${2**m}$. Then $y=\\dfrac{${2**m}}{${r}}=${2**n}$.`],
   ans:`$x=${2**m}$, $y=${2**n}$`,
   chk:()=>tNear(Math.log2(2**m)+Math.log2(2**n),s)&&(2**m)/(2**n)===r}});

// =====================================================================
// YEAR 11 · INTRODUCTION TO DIFFERENTIATION
// =====================================================================

tut('tt-tangents-from-point','11adv-calculus','Tangents from an outside point',6,2,
 'Let the point of contact be (t, t² + c). Write the tangent there, then make it pass through the given point.',
 R=>{const c0=R.int(-3,3),p=R.int(-3,3),s=R.int(1,4),q=p*p-s*s+c0,t1=p+s,t2=p-s,curve=poly([[1,'x^{2}'],[c0,'']]),L1=lin(2*t1,c0-t1*t1),L2=lin(2*t2,c0-t2*t2);
  return{q:tOne(`Two tangents to the parabola $y=${curve}$ pass through the point $(${p},\\ ${q})$. Find the equation of each tangent.`,TUT_MARKS['tt-tangents-from-point'][0]),
   sol:[`Let the point of contact be $(t,\\ ${poly([[1,'t^{2}'],[c0,'']])})$. Since $\\dfrac{dy}{dx}=2x$, the gradient there is $2t$.`,
    `$$y-(${poly([[1,'t^{2}'],[c0,'']])})=2t(x-t)\\;\\Rightarrow\\;y=${poly([[2,'tx'],[-1,'t^{2}'],[c0,'']])}$$`,
    `This passes through $(${p},\\ ${q})$: $${q}=${poly([[2*p,'t'],[-1,'t^{2}'],[c0,'']])}$, so $$${poly([[1,'t^{2}'],[-2*p,'t'],[q-c0,'']])}=0\\;\\Rightarrow\\;(t-${tPar(p)})^{2}=${s*s}$$`,
    `So $t=${t1}$ or $t=${t2}$.`,
    `$$t=${t1}:\\;y=${L1}\\qquad t=${t2}:\\;y=${L2}$$`],
   ans:`$y=${L1}$ and $y=${L2}$`,
   chk:()=>[t1,t2].every(t=>tNear(2*t*p-t*t+c0,q))&&t1!==t2}});

tut('tt-cubic-again','11adv-calculus','Tangent that meets the cubic again',7,3,
 'The tangent touches at x = t, so x = t is a repeated root of (curve − tangent). Think about the sum of the roots.',
 R=>{const p=R.int(-3,3),q=R.int(-6,6),r=R.int(-5,5);let t;do{t=R.nz(-2,3)}while(3*t+p===0);
  const cs=[r,q,p,1],d=pDer(cs),m=pEval(d,t),y0=pEval(cs,t),c=y0.sub(m.mul(t)),x2=-2*t-p,y2=pEval(cs,x2),L=poly([[m,'x'],[c,'']]),curve=pTex(cs),gen=poly([[-2,'t'],[-p,'']]);
  return{q:tParts(`The curve $y=${curve}$ has a tangent at the point where $x=${t}$.`,
    [`Find the equation of this tangent.`,`The tangent meets the curve again at another point. Find its coordinates.`,`Show that for any value of $t$, the tangent at $x=t$ meets the curve again where $x=${gen}$.`],TUT_MARKS['tt-cubic-again']),
   sol:[`(a) $\\dfrac{dy}{dx}=${pTex(d)}$. At $x=${t}$: $m=${subTex(d,t)}=${m.tex()}$ and $y=${subTex(cs,t)}=${y0.tex()}$.`,
    `$$y-${y0.btex()}=${m.btex()}(${poly([[1,'x'],[-t,'']])})\\;\\Rightarrow\\;y=${L}$$`,
    `(b) Where the tangent meets the curve, $${curve}=${L}$. This is a cubic whose $x^{3}$ coefficient is 1 and whose $x^{2}$ coefficient is ${p}, so its three roots add to $${-p}$. The tangent touches at $x=${t}$, so that is a repeated root.`,
    `$$${t}+${tPar(t)}+x_{2}=${-p}\\;\\Rightarrow\\;x_{2}=${x2}$$`,
    `$$y=${subTex(cs,x2)}=${y2.tex()}$$`,
    `(c) For any $t$, the equation (curve) = (tangent) is a cubic with $x^{3}$ coefficient 1 and $x^{2}$ coefficient ${p} (the tangent line has no $x^{2}$ term). Its roots add to $${-p}$, and $t$ is a double root, so $t+t+x_{2}=${-p}$ and $x_{2}=${gen}$.`],
   ans:`(a) $y=${L}$; (b) $\\left(${x2},\\ ${y2.tex()}\\right)$; (c) shown`,
   chk:()=>{const f=x=>pEval(cs,x).val(),T=x=>m.val()*x+c.val();return tNear(f(t),T(t))&&tNear(tFx(f,t,1e-4),m.val())&&tNear(f(x2),T(x2))&&x2!==t&&tNear(y2.val(),T(x2))}}});

// =====================================================================
// YEAR 11 · PROBABILITY AND DATA
// =====================================================================

tut('tt-prob-indep','11adv-probability','Probability: independent or not?',6,2,
 'Find P(A ∩ B) from the addition rule. Independent means P(A ∩ B) = P(A) × P(B). For the last part, P(A ∩ B′) = P(A) − P(A ∩ B).',
 R=>{const ps=[20,25,30,40,50,60,75],indep=R.next()<0.5;let p,qq,I;
  if(indep){do{p=R.pick(ps);qq=R.pick(ps)}while((p*qq)%100!==0);I=p*qq/100}
  else{do{p=R.pick(ps);qq=R.pick(ps);const lo=Math.max(0,p+qq-100),hi=Math.min(p,qq);I=5*R.int(Math.ceil(lo/5),Math.floor(hi/5))}while(I*100===p*qq)}
  const r=p+qq-I,pa=F(p-I,100-qq),pq=String(p*qq/10000);
  return{q:tParts(`For events $A$ and $B$, $P(A)=${tDec(p)}$, $P(B)=${tDec(qq)}$ and $P(A\\cup B)=${tDec(r)}$.`,
    [`Find $P(A\\cap B)$.`,`Are $A$ and $B$ independent? Justify your answer.`,`Find $P(A\\mid B')$.`],TUT_MARKS['tt-prob-indep']),
   sol:[`(a) $P(A\\cap B)=P(A)+P(B)-P(A\\cup B)=${tDec(p)}+${tDec(qq)}-${tDec(r)}=${tDec(I)}$.`,
    `(b) $P(A)\\times P(B)=${tDec(p)}\\times ${tDec(qq)}=${pq}$. ${I*100===p*qq?`This equals $P(A\\cap B)=${tDec(I)}$, so $A$ and $B$ are independent.`:`This is not equal to $P(A\\cap B)=${tDec(I)}$, so $A$ and $B$ are not independent.`}`,
    `(c) $P(A\\cap B')=P(A)-P(A\\cap B)=${tDec(p)}-${tDec(I)}=${tDec(p-I)}$ and $P(B')=1-${tDec(qq)}=${tDec(100-qq)}$.`,
    `$$P(A\\mid B')=\\frac{P(A\\cap B')}{P(B')}=\\frac{${tDec(p-I)}}{${tDec(100-qq)}}=${pa.tex()}$$${I*100===p*qq?`This equals $P(A)$, as it must for independent events.`:''}`],
   ans:`(a) $${tDec(I)}$; (b) ${I*100===p*qq?'independent':'not independent'}; (c) $${pa.tex()}$`,
   chk:()=>I>=0&&I<=Math.min(p,qq)&&r<=100&&tNear(pa.val(),(p-I)/(100-qq))&&(I*100===p*qq)===(tNear(I/100,p/100*qq/100))}});

tut('tt-prob-marbles','11adv-probability','Without replacement: a surprising symmetry',6,3,
 'Split "second is red" into two cases by the colour of the first marble. Use a tree diagram if it helps.',
 R=>{const n=R.int(2,6),m=R.int(2,6),N=n+m,rr=F(n,N).mul(F(n-1,N-1)),br=F(m,N).mul(F(n,N-1)),r2=rr.add(br),cond=rr.div(r2);
  return{q:tParts(`A bag contains ${n} red and ${m} blue marbles. Two marbles are drawn at random, one after the other, without replacement.`,
    [`Show that the probability that the second marble is red equals the probability that the first marble is red.`,`Given that the second marble is red, find the probability that the first marble was also red.`],TUT_MARKS['tt-prob-marbles']),
   sol:[`(a) The first marble is red with probability $\\dfrac{${n}}{${N}}$.`,
    `The second is red if the first was red (RR) or blue (BR): $$P(R_{2})=\\frac{${n}}{${N}}\\times\\frac{${n-1}}{${N-1}}+\\frac{${m}}{${N}}\\times\\frac{${n}}{${N-1}}=\\frac{${n*(n-1)+m*n}}{${N*(N-1)}}=${r2.tex()}$$`,
    `This equals $P(R_{1})=\\dfrac{${n}}{${N}}$, as required.`,
    `(b) $$P(R_{1}\\mid R_{2})=\\frac{P(RR)}{P(R_{2})}=\\frac{${rr.tex()}}{${r2.tex()}}=${cond.tex()}$$`],
   ans:`(a) shown; (b) $${cond.tex()}$`,
   chk:()=>tNear(r2.val(),n/N)&&tNear(cond.val(),(n-1)/(N-1))}});

// =====================================================================
// YEAR 12 · DIFFERENTIAL CALCULUS
// =====================================================================

tut('tt-ode','12adv-differentiation','Show that a derivative identity holds',7,3,
 'Find y′ and y″ with the product rule, and keep e^(ax) as a common factor. Then collect the sin and cos terms separately.',
 R=>{const a=R.pick([-2,-1,1,2,3]),b=R.int(1,3),fn=R.pick(['sin','cos']),E=ex(lin(a,0)),bx=b===1?'x':b+'x',S=`\\sin ${bx}`,C=`\\cos ${bx}`,
   pr=fn==='sin'?[[1,0],[a,b],[a*a-b*b,2*a*b]]:[[0,1],[-b,a],[-2*a*b,a*a-b*b]],
   T=pr.map(([s,c])=>poly([[s,S],[c,C]])),k=a*a+b*b,ya=`${E}${fn==='sin'?S:C}`,
   sCoef=pr[2][0]-2*a*pr[1][0]+k*pr[0][0],cCoef=pr[2][1]-2*a*pr[1][1]+k*pr[0][1];
  return{q:tOne(`Let $y=${ya}$. Show that $y''${term(-2*a,"y'",false)}${term(k,'y',false)}=0$.`,TUT_MARKS['tt-ode'][0]),
   sol:[`Use the product rule, with the chain rule on each factor: $$y'=${E}(${T[1]})$$`,
    `Differentiate again: $$y''=${E}(${T[2]})$$`,
    `Substitute into $y''${term(-2*a,"y'",false)}${term(k,'y',false)}$ and collect terms:`,
    `$$${E}\\left[(${pr[2][0]}${term(-2*a,'',false)}\\cdot ${tPar(pr[1][0])}${term(k,'',false)}\\cdot ${tPar(pr[0][0])})${S}+(${pr[2][1]}${term(-2*a,'',false)}\\cdot ${tPar(pr[1][1])}${term(k,'',false)}\\cdot ${tPar(pr[0][1])})${C}\\right]$$`,
    `$$=${E}\\left[(${sCoef})${S}+(${cCoef})${C}\\right]=0$$`],
   ans:`$y''${term(-2*a,"y'",false)}${term(k,'y',false)}=0$, as required.`,
   chk:()=>{const y=x=>Math.exp(a*x)*(pr[0][0]*Math.sin(b*x)+pr[0][1]*Math.cos(b*x)),y1=x=>Math.exp(a*x)*(pr[1][0]*Math.sin(b*x)+pr[1][1]*Math.cos(b*x)),
     y2=x=>Math.exp(a*x)*(pr[2][0]*Math.sin(b*x)+pr[2][1]*Math.cos(b*x));
     return [0.2,0.55,0.9].every(x=>tNear(tFx(y,x),y1(x))&&Math.abs(tFx(y1,x)-y2(x))<1e-4*Math.max(1,Math.abs(y2(x))))&&sCoef===0&&cCoef===0}}});

tut('tt-sqrt-quot','12adv-differentiation','Simplify a derivative to a given form',5,2,
 'Write the function as x(x² + a)^(−1/2) and use the product rule with the chain rule. Factor out the lowest power of (x² + a).',
 R=>{const [a,x0,s]=R.pick([[3,1,2],[5,2,3],[8,1,3],[7,3,4],[9,4,5],[12,2,4],[16,3,5]]),g=F(a,s**3),rt=`\\sqrt{x^{2}+${a}}`;
  return{q:tParts('',[`Show that $\\dfrac{d}{dx}\\left(\\dfrac{x}{${rt}}\\right)=\\dfrac{${a}}{(x^{2}+${a})^{\\frac{3}{2}}}$.`,`Hence find the gradient of the curve $y=\\dfrac{x}{${rt}}$ at $x=${x0}$.`],TUT_MARKS['tt-sqrt-quot']),
   sol:[`(a) Write $y=x(x^{2}+${a})^{-\\frac{1}{2}}$. By the product and chain rules: $$y'=(x^{2}+${a})^{-\\frac{1}{2}}+x\\cdot\\left(-\\tfrac{1}{2}\\right)(x^{2}+${a})^{-\\frac{3}{2}}\\cdot 2x$$`,
    `$$=(x^{2}+${a})^{-\\frac{3}{2}}\\left[(x^{2}+${a})-x^{2}\\right]=\\frac{${a}}{(x^{2}+${a})^{\\frac{3}{2}}}$$`,
    `(b) At $x=${x0}$: $x^{2}+${a}=${s*s}$, so $$y'=\\frac{${a}}{(${s*s})^{\\frac{3}{2}}}=\\frac{${a}}{${s}^{3}}=${g.tex()}$$`],
   ans:`(a) shown; (b) $${g.tex()}$`,
   chk:()=>{const f=x=>x/Math.sqrt(x*x+a);return x0*x0+a===s*s&&[0.4,1.3,2.2].every(x=>tNear(tFx(f,x),a/Math.pow(x*x+a,1.5)))&&tNear(tFx(f,x0),g.val())}}});

tut('tt-exp-origin','12adv-differentiation','Tangent to an exponential through the origin',6,3,
 'Let the point of contact have x-coordinate t. Write the tangent there, then substitute (0, 0).',
 R=>{const A=R.pick([1,2,3,4]),k=R.pick([-2,-1,1,2,3]),cA=coefTex(A),cAk=coefTex(A*k),kt=k===1?'t':k===-1?'-t':k+'t',E=lin(k,0),t=F(1,k);
  return{q:tOne(`The tangent to the curve $y=${cA}e^{${E}}$ at the point $P$ passes through the origin. Find the coordinates of $P$ and the equation of the tangent.`,TUT_MARKS['tt-exp-origin'][0]),
   sol:[`$\\dfrac{dy}{dx}=${cAk}e^{${E}}$. Let $P=(t,\\ ${cA}e^{${kt}})$. The tangent at $P$ is $$y-${cA}e^{${kt}}=${cAk}e^{${kt}}(x-t)$$`,
    `It passes through $(0,0)$: $$-${cA}e^{${kt}}=${cAk}e^{${kt}}(-t)$$`,
    `Divide by $-e^{${kt}}$ (which is not zero): $${A}=${cAk===''?'':cAk}t$, so $t=${t.tex()}$.`,
    `Then $kt=1$, so $P=\\left(${t.tex()},\\ ${cA}e\\right)$ and the gradient is $${cAk}e$.`,
    `$$y=${cAk}e\\,x$$`],
   ans:`$P=\\left(${t.tex()},\\ ${cA}e\\right)$; tangent $y=${cAk}e\\,x$`,
   chk:()=>{const f=x=>A*Math.exp(k*x),tv=1/k;return tNear(f(tv),A*Math.E)&&tNear(tFx(f,tv),A*k*Math.E)&&tNear(f(tv)-tFx(f,tv)*tv,0)}}});

tut('tt-ln-origin','12adv-differentiation','Tangent to a logarithm through the origin',5,2,
 'Let the point of contact have x-coordinate t. Write the tangent there, then substitute (0, 0).',
 R=>{const A=R.pick([1,2,3,4,5]),cA=coefTex(A);
  return{q:tOne(`The tangent to the curve $y=${cA}\\ln x$ at the point $P$ passes through the origin. Find the coordinates of $P$ and the equation of the tangent.`,TUT_MARKS['tt-ln-origin'][0]),
   sol:[`$\\dfrac{dy}{dx}=\\dfrac{${A}}{x}$. Let $P=(t,\\ ${cA}\\ln t)$. The tangent at $P$ is $$y-${cA}\\ln t=\\frac{${A}}{t}(x-t)$$`,
    `It passes through $(0,0)$: $$-${cA}\\ln t=\\frac{${A}}{t}(-t)=-${A}$$`,
    `So $\\ln t=1$ and $t=e$. Then $y=${cA}\\ln e=${A}$, so $P=(e,\\ ${A})$, and the gradient is $\\dfrac{${A}}{e}$.`,
    `$$y=\\frac{${A}}{e}\\,x$$`],
   ans:`$P=(e,\\ ${A})$; tangent $y=\\dfrac{${A}}{e}x$`,
   chk:()=>{const f=x=>A*Math.log(x);return tNear(f(Math.E),A)&&tNear(tFx(f,Math.E),A/Math.E)&&tNear(f(Math.E)-tFx(f,Math.E)*Math.E,0)}}});

tut('tt-touching','12adv-differentiation','Two curves that touch',7,3,
 'Touching means the same y-value and the same gradient at the same x. Write both conditions, then divide one by the other.',
 R=>{const m=R.pick([1,2,3]),n=R.pick([2,3,4]),E=lin(m,0),xT=F(n,m),c=F(m**n,n**n),
   kT=c.isInt()&&c.n===1?`e^{${n}}`:c.isInt()?`${c.n}e^{${n}}`:`\\dfrac{${c.n}}{${c.d}}e^{${n}}`;
  return{q:tOne(`The curves $y=e^{${E}}$ and $y=kx^{${n}}$, where $k>0$, touch at a point where $x>0$. Find the value of $k$ and the coordinates of the point of contact.`,TUT_MARKS['tt-touching'][0]),
   sol:[`At a point of contact the curves have the same $y$-value and the same gradient.`,
    `$$e^{${E}}=kx^{${n}}\\quad(1)\\qquad\\qquad ${coefTex(m)}e^{${E}}=${n}k${xp(n-1)}\\quad(2)$$`,
    `Divide (2) by (1): $$${m}=\\frac{${n}}{x}\;\\Rightarrow\;x=${xT.tex()}$$`,
    `At this point the exponent is $${E}=${n}$, so (1) gives $e^{${n}}=k\\left(${xT.tex()}\\right)^{${n}}$, and $$k=${kT}$$`,
    `The point of contact is $\\left(${xT.tex()},\\ e^{${n}}\\right)$.`],
   ans:`$k=${kT}$; point of contact $\\left(${xT.tex()},\\ e^{${n}}\\right)$`,
   chk:()=>{const k=Math.pow(m/n,n)*Math.exp(n),f=x=>Math.exp(m*x),g=x=>k*Math.pow(x,n),x0=n/m;return tNear(f(x0),g(x0))&&tNear(tFx(f,x0),tFx(g,x0))&&tNear(k,c.val()*Math.exp(n))}}});

tut('tt-chain-data','12adv-differentiation','Derivatives from function values',5,2,
 'Differentiate h using the product rule, then the chain rule for f(x² − a). Substitute the value of x that makes the inside equal p.',
 R=>{const c=R.pick([2,3]),a=R.int(1,5),p=c*c-a,u=R.pick([-4,-3,-2,-1,1,2,3,4,5,6]),v=R.pick([-4,-3,-2,-1,1,2,3,4,5,6]),m=u+2*c*c*v;
  if(m===0)return null;
  return{q:tParts(`The function $f$ is differentiable with $f(${p})=${u}$ and $f'(${p})=${v}$. Let $h(x)=x\\,f(x^{2}-${a})$.`,
    [`Find $h'(${c})$.`,`Find the equation of the tangent to $y=h(x)$ at $x=${c}$.`],TUT_MARKS['tt-chain-data']),
   sol:[`(a) By the product rule and the chain rule: $$h'(x)=f(x^{2}-${a})+x\\cdot f'(x^{2}-${a})\\cdot 2x$$`,
    `At $x=${c}$ the inside is $${c*c}-${a}=${p}$, so $$h'(${c})=f(${p})+${2*c*c}f'(${p})=${u}+${2*c*c}\\times ${tPar(v)}=${m}$$`,
    `(b) $h(${c})=${c}f(${p})=${c*u}$, so the tangent is $$y${term(-c*u,'',false)}=${coefTex(m)}(x-${c})\\;\\Rightarrow\\;y=${lin(m,c*u-m*c)}$$`],
   ans:`(a) $${m}$; (b) $y=${lin(m,c*u-m*c)}$`,
   chk:()=>{const f=x=>u+v*(x-p),h=x=>x*f(x*x-a);return tNear(tFx(h,c),m)&&tNear(h(c),c*u)}}});

tut('tt-ln-show','12adv-differentiation','Show that the derivative of a log is simple',6,3,
 'Differentiate the inside first, then put everything over a common denominator. Look for a factor that cancels with the denominator.',
 R=>{if(R.next()<0.5){const k=R.pick([1,2,3]),X=tKx(k),ck=coefTex(k);
   return{q:tOne(`Show that if $y=\\ln(\\sec ${X}+\\tan ${X})$ then $\\dfrac{dy}{dx}=${ck}\\sec ${X}$.`,TUT_MARKS['tt-ln-show'][0]),
    sol:[`$$\\frac{d}{dx}(\\sec ${X}+\\tan ${X})=${ck}\\sec ${X}\\tan ${X}+${ck}\\sec^{2}${X}=${ck}\\sec ${X}(\\tan ${X}+\\sec ${X})$$`,
     `$$\\frac{dy}{dx}=\\frac{${ck}\\sec ${X}(\\tan ${X}+\\sec ${X})}{\\sec ${X}+\\tan ${X}}=${ck}\\sec ${X}$$`],
    ans:`$\\dfrac{dy}{dx}=${ck}\\sec ${X}$, as required.`,
    chk:()=>{const f=x=>Math.log(1/Math.cos(k*x)+Math.tan(k*x));return [0.1,0.2,0.3,0.4].every(x=>k*x<1.3&&tNear(tFx(f,x),k/Math.cos(k*x)))}}}
  const a=R.pick([1,2,3,4,5,7]),rt=`\\sqrt{x^{2}+${a}}`;
  return{q:tOne(`Show that if $y=\\ln\\left(x+${rt}\\right)$ then $\\dfrac{dy}{dx}=\\dfrac{1}{${rt}}$.`,TUT_MARKS['tt-ln-show'][0]),
   sol:[`$$\\frac{d}{dx}${rt}=\\frac{2x}{2${rt}}=\\frac{x}{${rt}}$$`,
    `$$\\frac{dy}{dx}=\\frac{1+\\dfrac{x}{${rt}}}{x+${rt}}=\\frac{\\dfrac{${rt}+x}{${rt}}}{x+${rt}}=\\frac{1}{${rt}}$$`],
   ans:`$\\dfrac{dy}{dx}=\\dfrac{1}{${rt}}$, as required.`,
   chk:()=>{const f=x=>Math.log(x+Math.sqrt(x*x+a));return [0.3,1.1,2.4,-0.8].every(x=>tNear(tFx(f,x),1/Math.sqrt(x*x+a)))}}});

// =====================================================================
// YEAR 12 · INTEGRAL CALCULUS
// (follows the 12ADV integration episode map: no area between two curves; ∫tan x and ∫ln x only through "hence")
// =====================================================================

const tInt=(f,a,b,n=2000)=>{const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);return s*h/3};
const tNum=v=>String(+(+v).toFixed(4));

tut('tt-int-findk','12adv-integration','Find the limit k from a definite integral',5,2,
 'Find a primitive and substitute the limits, which gives an equation in k. An exponential needs a log to undo it; logs need the log laws.',
 R=>{if(R.next()<0.5){const m=R.pick([2,3]),c=R.pick([1,2,3,4]),N=m*c+1;
   return{q:tOne(`Find the exact value of $k$ such that $\\int_{0}^{k}e^{${m}x}\\,dx=${c}$.`,TUT_MARKS['tt-int-findk'][0]),
    sol:[`$$\\int_{0}^{k}e^{${m}x}\\,dx=\\left[\\frac{1}{${m}}e^{${m}x}\\right]_{0}^{k}=\\frac{1}{${m}}(e^{${m}k}-1)$$`,
     `So $\\dfrac{1}{${m}}(e^{${m}k}-1)=${c}$, which gives $e^{${m}k}=${N}$.`,
     `$$${m}k=\\ln ${N}\;\\Rightarrow\;k=\\frac{1}{${m}}\\ln ${N}$$`],
    ans:`$k=\\dfrac{1}{${m}}\\ln ${N}$`,
    chk:()=>tNear(tInt(x=>Math.exp(m*x),0,Math.log(N)/m),c)}}
  const a=R.pick([1,2,3,5,6,7]),n=R.pick([2,3]),K=a*(n*n-1);
  return{q:tOne(`Find the exact value of $k>0$ such that $\\int_{0}^{k}\\frac{x}{x^{2}+${a}}\\,dx=\\ln ${n}$.`,TUT_MARKS['tt-int-findk'][0]),
   sol:[`The numerator is half the derivative of the denominator: $$\\int_{0}^{k}\\frac{x}{x^{2}+${a}}\\,dx=\\frac{1}{2}\\int_{0}^{k}\\frac{2x}{x^{2}+${a}}\\,dx=\\frac{1}{2}\\left[\\ln(x^{2}+${a})\\right]_{0}^{k}=\\frac{1}{2}\\ln\\frac{k^{2}+${a}}{${a}}$$`,
    `So $\\ln\\dfrac{k^{2}+${a}}{${a}}=2\\ln ${n}=\\ln ${n*n}$, which gives $k^{2}+${a}=${a*n*n}$ and $k^{2}=${K}$.`,
    `Since $k>0$, $k=${surdRoot(K)}$.`],
   ans:`$k=${surdRoot(K)}$`,
   chk:()=>tNear(tInt(x=>x/(x*x+a),0,Math.sqrt(K)),Math.log(n))}});

tut('tt-int-oddeven','12adv-integration','Odd and even functions in a definite integral',5,2,
 'Split the integrand into two parts. You cannot find a primitive for the first part, and you do not need one: what happens to it over a symmetric interval?',
 R=>{const o=R.pick([{t:'x^{3}\\cos x',f:x=>x**3*Math.cos(x),A:3},{t:'x\\,e^{x^{2}}',f:x=>x*Math.exp(x*x),A:2},{t:'\\sin^{3}x',f:x=>Math.sin(x)**3,A:3},{t:'x^{2}\\sin x',f:x=>x*x*Math.sin(x),A:3}]),
   a=R.int(1,o.A),p=R.pick([3,6,9,-3,-6]),q=R.nz(-5,5),ev=poly([[p,'x^{2}'],[q,'']]),P=poly([[p/3,'x^{3}'],[q,'x']]),half=p/3*a**3+q*a,v=2*half;
  return{q:tOne(`Evaluate $\\int_{-${a}}^{${a}}(${o.t}${term(p,'x^{2}',false)}${term(q,'',false)})\\,dx$.`,TUT_MARKS['tt-int-oddeven'][0]),
   sol:[`Let $g(x)=${o.t}$. Then $g(-x)=-g(x)$, so $g$ is odd. Over $-${a}\\le x\\le ${a}$ its signed areas cancel, so $\\int_{-${a}}^{${a}}g(x)\\,dx=0$.`,
    `$${ev}$ is even, so $$\\int_{-${a}}^{${a}}(${ev})\\,dx=2\\int_{0}^{${a}}(${ev})\\,dx=2\\left[${P}\\right]_{0}^{${a}}=2(${p/3*a**3}${term(q*a,'',false)})=${v}$$`,
    `So the integral is $0+${tPar(v)}=${v}$.`],
   ans:`$${v}$`,
   chk:()=>tNear(tInt(x=>o.f(x)+p*x*x+q,-a,a),v)}});

tut('tt-int-accum','12adv-integration','Differentiating an integral with a variable limit',7,3,
 'Let F be a primitive of the integrand and write g(x) using F. The chain rule does the rest. What is g(1)?',
 R=>{const n=R.pick([2,3]),k=R.pick([3,8,15,24]),s=Math.sqrt(1+k),g=`g(x)=\\int_{x^{${n}}}^{1}\\sqrt{t^{2}+${k}}\\,dt`,d=`-${n}${xp(n-1)}\\sqrt{x^{${2*n}}+${k}}`,L=lin(-n*s,n*s);
  return{q:tParts(`Let $${g}$.`,[`Find $g'(x)$.`,`Find the equation of the tangent to $y=g(x)$ at the point where $x=1$.`],TUT_MARKS['tt-int-accum']),
   sol:[`(a) Let $F$ be a primitive of $f(t)=\\sqrt{t^{2}+${k}}$, so $F'(t)=f(t)$. Then $$g(x)=F(1)-F(x^{${n}})$$`,
    `By the chain rule, $$g'(x)=0-F'(x^{${n}})\\times ${n}${xp(n-1)}=${d}$$`,
    `(b) At $x=1$ both limits are 1, so $g(1)=\\int_{1}^{1}\\sqrt{t^{2}+${k}}\\,dt=0$.`,
    `$g'(1)=-${n}\\sqrt{1+${k}}=-${n*s}$, so the tangent is $$y-0=-${n*s}(x-1)\;\\Rightarrow\;y=${L}$$`],
   ans:`(a) $g'(x)=${d}$; (b) $y=${L}$`,
   chk:()=>{const G=x=>tInt(t=>Math.sqrt(t*t+k),x**n,1),D=x=>-n*x**(n-1)*Math.sqrt(x**(2*n)+k);
    return [0.7,1,1.2].every(x=>Math.abs(tFx(G,x,1e-4)-D(x))<1e-5*Math.max(1,Math.abs(D(x))))&&tNear(G(1),0)&&tNear(D(1),-n*s)&&Number.isInteger(s)}}});

tut('tt-int-hence','12adv-integration','Differentiate, hence integrate',7,2,
 'Rearrange the derivative from part (a) so the integrand stands on its own, then integrate both sides between the limits.',
 R=>{const v=R.pick(['e','t','l']),M=TUT_MARKS['tt-int-hence'];
  if(v==='e'){const k=R.pick([2,3,4]),X=tKx(k),A=`\\frac{${coefTex(k-1)}e^{${k}}+1}{${k*k}}`;
   return{q:tParts('',[`Differentiate $xe^{${X}}$.`,`Hence find the exact value of $\\int_{0}^{1}xe^{${X}}\\,dx$.`],M),
    sol:[`(a) By the product rule, $$\\frac{d}{dx}(xe^{${X}})=e^{${X}}+${k}xe^{${X}}$$`,
     `(b) Rearrange: $${k}xe^{${X}}=\\dfrac{d}{dx}(xe^{${X}})-e^{${X}}$. Integrate from 0 to 1:`,
     `$$${k}\\int_{0}^{1}xe^{${X}}\\,dx=\\left[xe^{${X}}\\right]_{0}^{1}-\\left[\\frac{1}{${k}}e^{${X}}\\right]_{0}^{1}=e^{${k}}-\\frac{1}{${k}}(e^{${k}}-1)=\\frac{${coefTex(k-1)}e^{${k}}+1}{${k}}$$`,
     `$$\\int_{0}^{1}xe^{${X}}\\,dx=${A}$$`],
    ans:`(a) $e^{${X}}+${k}xe^{${X}}$; (b) $${A}$`,
    chk:()=>tNear(tInt(x=>x*Math.exp(k*x),0,1),((k-1)*Math.exp(k)+1)/(k*k))&&tNear(tFx(x=>x*Math.exp(k*x),0.3),Math.exp(0.3*k)*(1+0.3*k))}}
  if(v==='t'){const k=R.pick([1,2,3]),X=tKx(k),lim=piTex(F(1,2*k)),ck=coefTex(k),A=`\\frac{\\pi-2}{${2*k*k}}`,
    cosP=k===1?'-\\cos x':`-\\frac{1}{${k}}\\cos ${X}`,inv=k===1?'1':`\\frac{1}{${k}}`;
   return{q:tParts('',[`Differentiate $x\\sin ${X}$.`,`Hence find the exact value of $\\int_{0}^{${lim}}x\\cos ${X}\\,dx$.`],M),
    sol:[`(a) By the product rule, $$\\frac{d}{dx}(x\\sin ${X})=\\sin ${X}+${ck}x\\cos ${X}$$`,
     `(b) Rearrange: $${ck}x\\cos ${X}=\\dfrac{d}{dx}(x\\sin ${X})-\\sin ${X}$. Integrate from 0 to $${lim}$:`,
     `$$${ck}\\int_{0}^{${lim}}x\\cos ${X}\\,dx=\\left[x\\sin ${X}\\right]_{0}^{${lim}}-\\left[${cosP}\\right]_{0}^{${lim}}=${lim}\\sin\\frac{\\pi}{2}-${inv}=${lim}-${inv}$$`,
     `$$\\int_{0}^{${lim}}x\\cos ${X}\\,dx=${A}$$`],
    ans:`(a) $\\sin ${X}+${ck}x\\cos ${X}$; (b) $${A}$`,
    chk:()=>tNear(tInt(x=>x*Math.cos(k*x),0,Math.PI/(2*k)),(Math.PI-2)/(2*k*k))}}
  const n=R.pick([2,3,4]),A=`${coefTex(n-1)}e^{${n}}+1`;
  return{q:tParts('',[`Differentiate $x\\ln x$.`,`Hence find the exact value of $\\int_{1}^{e^{${n}}}\\ln x\\,dx$.`],M),
   sol:[`(a) By the product rule, $$\\frac{d}{dx}(x\\ln x)=\\ln x+x\\times\\frac{1}{x}=\\ln x+1$$`,
    `(b) Rearrange: $\\ln x=\\dfrac{d}{dx}(x\\ln x)-1$. Integrate from 1 to $e^{${n}}$:`,
    `$$\\int_{1}^{e^{${n}}}\\ln x\\,dx=\\left[x\\ln x-x\\right]_{1}^{e^{${n}}}=(${n}e^{${n}}-e^{${n}})-(0-1)=${A}$$`],
   ans:`(a) $\\ln x+1$; (b) $${A}$`,
   chk:()=>tNear(tInt(Math.log,1,Math.exp(n),20000),(n-1)*Math.exp(n)+1)}});

tut('tt-int-cubic-area','12adv-integration','Integral versus area for a cubic',9,2,
 'The integral counts area below the x-axis as negative. Factorise to find where the curve crosses the axis, then integrate each piece separately.',
 R=>{const a=R.int(1,3),b=a+R.int(1,3),cs=[0,a*b,-(a+b),1],f=pTex(cs),P=pInt(cs),I1=pEval(P,a),Ib=pEval(P,b),I2=Ib.sub(I1),A=I1.sub(I2);
  return{q:tParts(`Let $f(x)=${f}$.`,[`Evaluate $\\int_{0}^{${b}}f(x)\\,dx$.`,`Find the total area enclosed between the curve $y=f(x)$ and the $x$-axis.`],TUT_MARKS['tt-int-cubic-area']),
   sol:[`(a) $$\\int_{0}^{${b}}(${f})\\,dx=\\left[${pTex(P)}\\right]_{0}^{${b}}=${Ib.tex()}$$`,
    `(b) $f(x)=x(${poly([[1,'x^{2}'],[-(a+b),'x'],[a*b,'']])})=x(x-${a})(x-${b})$, so the curve cuts the $x$-axis at $x=0$, $${a}$ and $${b}$. It is above the axis for $0<x<${a}$ and below it for $${a}<x<${b}$.`,
    `$$\\int_{0}^{${a}}f(x)\\,dx=${I1.tex()}\\qquad\\int_{${a}}^{${b}}f(x)\\,dx=${I2.tex()}$$`,
    `$$\\text{Area}=${I1.tex()}+\\left|${I2.tex()}\\right|=${A.tex()}\\text{ square units}$$`,
    `The answer to (a) is smaller because the region below the axis counts as negative in the integral.`],
   ans:`(a) $${Ib.tex()}$; (b) $${A.tex()}$ square units`,
   chk:()=>{const g=x=>x*(x-a)*(x-b);return tNear(tInt(g,0,b),Ib.val())&&tNear(tInt(x=>Math.abs(g(x)),0,a)+tInt(x=>Math.abs(g(x)),a,b),A.val())}}});

tut('tt-int-yaxis','12adv-integration','Area to the y-axis, then to the x-axis',7,3,
 'Write the curve with x as the subject and integrate with respect to y. For the second region, look for a rectangle made of the two regions together.',
 R=>{const base=R.pick(['e',2,3]),n=R.int(1,3);let logT,inv,AT,prim,a1,a2,a1v,a2v,lnb,nAT;
  if(base==='e'){logT='\\ln x';inv='e^{y}';AT=n===1?'e':`e^{${n}}`;prim=`\\left[e^{y}\\right]_{0}^{${n}}`;a1=`${AT}-1`;nAT=`${coefTex(n)}${AT}`;
   a2=n===1?'1':`${coefTex(n-1)}${AT}+1`;lnb=1;a1v=Math.exp(n)-1;a2v=(n-1)*Math.exp(n)+1}
  else{const A=base**n;lnb=Math.log(base);logT=`\\log_{${base}}x`;inv=`${base}^{y}`;AT=String(A);prim=`\\left[\\frac{${base}^{y}}{\\ln ${base}}\\right]_{0}^{${n}}`;
   a1=`\\frac{${A-1}}{\\ln ${base}}`;nAT=String(n*A);a2=`${n*A}-\\frac{${A-1}}{\\ln ${base}}`;a1v=(A-1)/lnb;a2v=n*A-(A-1)/lnb}
  return{q:tParts(`Consider the curve $y=${logT}$.`,[`Find the exact area of the region bounded by the curve, the $y$-axis and the lines $y=0$ and $y=${n}$.`,`Hence find the exact area of the region bounded by the curve, the $x$-axis and the line $x=${AT}$.`],TUT_MARKS['tt-int-yaxis']),
   sol:[`(a) With $x$ as the subject, $x=${inv}$. The region lies between the curve and the $y$-axis, so $$\\text{Area}=\\int_{0}^{${n}}${inv}\\,dy=${prim}=${a1}$$`,
    `(b) The curve passes through $(1,\\ 0)$ and $(${AT},\\ ${n})$. The rectangle with corners $(0,\\ 0)$ and $(${AT},\\ ${n})$ has area $${n}\\times ${AT}=${nAT}$.`,
    `That rectangle is exactly the region in (a) together with the region in (b), so $$\\text{Area}=${nAT}-(${a1})=${a2}$$`],
   ans:`(a) $${a1}$; (b) $${a2}$`,
   chk:()=>{const B=base==='e'?Math.E:base;return tNear(tInt(y=>B**y,0,n),a1v)&&tNear(tInt(x=>Math.log(x)/lnb,1,B**n,20000),a2v)}}});

tut('tt-int-trap','12adv-integration','Trapezoidal rule: estimate, exact and error',9,2,
 'With n subintervals there are n + 1 function values. For the last part, think about whether the curve bends above or below the chords.',
 R=>{const v=R.pick(['inv','sqrt','exp']);let a,b,n,f,fT,prim,exT,exV,over,d2T,dom;
  if(v==='inv'){const c=R.pick([1,2,4,6]);b=R.pick([2,3,5]);a=1;n=4;f=x=>c/x;fT=`\\frac{${c}}{x}`;prim=`\\left[${coefTex(c)}\\ln x\\right]_{1}^{${b}}`;exT=`${coefTex(c)}\\ln ${b}`;exV=c*Math.log(b);over=true;d2T=`\\frac{${2*c}}{x^{3}}`;dom='for $x>0$'}
  else if(v==='sqrt'){const c=R.pick([1,3]),o=R.pick([[1,4,3],[1,9,4],[0,4,4]]);[a,b,n]=o;f=x=>c*Math.sqrt(x);fT=`${coefTex(c)}\\sqrt{x}`;const k=F(2*c,3),e=k.mul(F(b*Math.sqrt(b)-a*Math.sqrt(a)));
   prim=`\\left[${term(k,'x^{\\frac{3}{2}}',true)}\\right]_{${a}}^{${b}}`;exT=e.tex();exV=e.val();over=false;d2T=`-\\frac{${c}}{4x\\sqrt{x}}`;dom='for $x>0$'}
  else{b=R.pick([1,2]);a=0;n=4;f=Math.exp;fT='e^{x}';prim=`\\left[e^{x}\\right]_{0}^{${b}}`;exT=b===1?'e-1':`e^{${b}}-1`;exV=Math.exp(b)-1;over=true;d2T='e^{x}';dom='for all $x$'}
  const h=(b-a)/n,xs=[...Array(n+1)].map((_,i)=>tNum(a+i*h)),ys=xs.map(x=>f(+x)),est=h/2*(ys[0]+ys[n]+2*ys.slice(1,n).reduce((s,y)=>s+y,0)),
   mids=xs.slice(1,n).map(x=>`f(${x})`).join('+'),I=`\\int_{${a}}^{${b}}${fT}\\,dx`,word=over?'overestimate':'underestimate';
  return{q:tParts('',[`Use the trapezoidal rule with ${n} subintervals to estimate $${I}$, correct to 4 decimal places.`,`Find the exact value of $${I}$.`,`Is the estimate in (a) an overestimate or an underestimate? Justify your answer.`],TUT_MARKS['tt-int-trap']),
   sol:[`(a) $h=\\dfrac{${b}-${a}}{${n}}=${tNum(h)}$, and $$${xs.map((x,i)=>`f(${x})=${ys[i].toFixed(4)}`).join(',\\quad ')}$$`,
    `$$${I}\\approx\\frac{${tNum(h)}}{2}\\left[f(${xs[0]})+2(${mids})+f(${xs[n]})\\right]\\approx ${est.toFixed(4)}$$`,
    `(b) $$${I}=${prim}=${exT}\\approx ${exV.toFixed(4)}$$`,
    `(c) $f''(x)=${d2T}$, which is ${over?'positive':'negative'} ${dom}, so the curve is concave ${over?'up':'down'}. Each chord lies ${over?'above':'below'} the curve, so the trapezoidal rule gives an ${word}: $${est.toFixed(4)}${over?'>':'<'}${exV.toFixed(4)}$.`],
   ans:`(a) $${est.toFixed(4)}$; (b) $${exT}$; (c) an ${word}, since the curve is concave ${over?'up':'down'}`,
   chk:()=>tNear(tInt(f,a,b,20000),exV)&&(est>exV)===over&&Math.abs(est-exV)<0.2*Math.abs(exV)}});

tut('tt-int-limits','12adv-integration','Using the rules for definite integrals',5,2,
 'Draw a number line with the three limits on it. Integrals over touching intervals add, and swapping the limits changes the sign.',
 R=>{const a=R.int(0,2),b=a+R.int(1,3),c=b+R.int(1,3);let P,Q;do{P=R.nz(-9,12);Q=R.nz(-9,12)}while(P===Q);
  const D=P-Q,vb=F(-4*D+b*b-a*a,2),k=F(-P,c-a),Ix=(l,u,g)=>`\\int_{${l}}^{${u}}${g}\\,dx`;
  return{q:tParts(`The function $f$ is continuous, with $${Ix(a,c,'f(x)')}=${P}$ and $${Ix(b,c,'f(x)')}=${Q}$.`,
    [`Find $${Ix(a,b,'f(x)')}$.`,`Evaluate $${Ix(b,a,'(2f(x)-x)')}$.`,`Find the value of $k$ such that $${Ix(a,c,'(f(x)+k)')}=0$.`],TUT_MARKS['tt-int-limits']),
   sol:[`(a) $${Ix(a,c,'f(x)')}=${Ix(a,b,'f(x)')}+${Ix(b,c,'f(x)')}$, so $$${Ix(a,b,'f(x)')}=${P}-${tPar(Q)}=${D}$$`,
    `(b) Reversing the limits changes the sign: $$${Ix(b,a,'(2f(x)-x)')}=-2${Ix(a,b,'f(x)')}+${Ix(a,b,'x')}$$`,
    `$$=-2\\times ${tPar(D)}+\\left[\\frac{x^{2}}{2}\\right]_{${a}}^{${b}}=${-2*D}+\\frac{${b*b}-${a*a}}{2}=${vb.tex()}$$`,
    `(c) $$${Ix(a,c,'(f(x)+k)')}=${Ix(a,c,'f(x)')}+${Ix(a,c,'k')}=${P}+${coefTex(c-a)}k$$`,
    `Setting this equal to 0 gives $k=${k.tex()}$.`],
   ans:`(a) $${D}$; (b) $${vb.tex()}$; (c) $k=${k.tex()}$`,
   chk:()=>{const v1=D/(b-a),v2=Q/(c-b);return tNear(v1*(b-a)+v2*(c-b),P)&&tNear(-tInt(x=>2*v1-x,a,b),vb.val())&&tNear(tInt(()=>v1+k.val(),a,b)+tInt(()=>v2+k.val(),b,c),0)}}});

// ================= building a tutorial =================
// Where each question type comes from. "Similar to" means the same task adapted; "Style of" means the same kind of skill and wording.
// Only questions found in the 2020-2026 HSC Mathematics Advanced papers are cited; everything else is ours.
const TUT_SRC={
 'tt-tangents-from-point':'Similar to HSC 2021 Q31',
 'tt-ln-origin':'Similar to HSC 2020 Q29(b)',
 'tt-ambiguous':'Similar to HSC 2021 Q18',
 'tt-exp-origin':'Style of HSC 2020 Q29(b)',
 'tt-ode':'Style of HSC 2022 Q27(a)',
 'tt-ln-show':'Style of HSC 2026 Q21(a)',
 'tt-sqrt-quot':'Style of HSC 2025 Q25(a)',
 'tt-touching':'Style of HSC 2025 Q24',
 'tt-int-accum':'Similar to HSC 2026 Q32',
 'tt-int-trap':'Style of HSC 2025 Q27'};
const TUT_BY_ID={};TUT.forEach(t=>{TUT_BY_ID[t.id]=t;t.src=TUT_SRC[t.id]||'Original question';t.marks=TUT_MARKS[t.id].reduce((a,b)=>a+b,0);t.mins=Math.max(1,Math.round(t.marks*TUT_MIN_PER_MARK));t.topicName=(TOPICS.find(x=>x.id===t.topic)||{name:t.topic}).name});

// Picks questions whose estimated times add up to the target (within 2 minutes), spread over the ticked topics where possible,
// then returns them easiest first. The same seed, targets and ticks always give the same tutorial.
// A template that can return null (an unlucky draw) is redrawn.
function buildTutorial(ids,target,levelMode,seed){
 const pool=TUT.filter(t=>ids.includes(t.id)&&(!levelMode||t.level===levelMode));
 if(!pool.length)return [];
 const R=makeRng(`tutorial|${seed}|${target}|${levelMode}|${ids.join(',')}`),lo=target-2,hi=target+2;
 let best=null;
 for(let i=0;i<300;i++){const perm=R.sample(pool,pool.length);let chosen=[],total=0;
  for(const t of perm){if(total+t.mins<=hi){chosen.push(t);total+=t.mins}if(total>=lo)break}
  const spread=new Set(chosen.map(t=>t.topic)).size,score=Math.abs(total-target)*10-spread;
  if(!best||score<best.score)best={chosen,total,score}}
 let {chosen,total}=best,guard=0;
 while(total<lo&&guard++<20){const fit=pool.filter(t=>total+t.mins<=hi);if(!fit.length)break;const t=R.pick(fit);chosen.push(t);total+=t.mins}
 const seen=new Set(),out=[];
 chosen.forEach((t,i)=>{let Q=null,tries=0;
  do{Q=t.gen(makeRng(`${seed}|${t.id}|${i}|${tries}`));tries++}while((!Q||seen.has(Q.q))&&tries<40);
  seen.add(Q.q);out.push({...Q,t,mins:t.mins,level:t.level})});
 return out.sort((x,y)=>x.level-y.level||x.mins-y.mins);
}
