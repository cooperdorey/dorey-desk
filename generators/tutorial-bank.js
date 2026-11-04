// Tutorial question bank for the tutorial generator. Loaded after engine.js.
// Hard and unfamiliar questions on Year 11 Advanced and Year 12 differential calculus: the sort a student
// can't answer by copying a worked example. Each template is one question TYPE with random numbers:
//   id      unique and stable (used in share links)
//   topic   a topic id from engine.js (TOPICS), so the year buttons and topic names come for free
//   name    shown in the sidebar
//   mins    realistic time for a strong class working in pairs
//   level   2 = Hard, 3 = Very hard
//   hint    one nudge the teacher can reveal without giving the method away
//   gen(R)  returns {q, sol:[...], ans, chk}.  chk() is only used by scripts/check_tutorial.js and must return
//           true when the printed answer agrees with an independent numeric check.
const TUT=[];
const tut=(id,topic,name,mins,level,hint,gen)=>TUT.push({id,topic,name,mins,level,hint,gen});
const LEVEL_NAME={2:'Hard',3:'Very hard'};

// ---------- small helpers ----------
const tPar=n=>n<0?`(${n})`:String(n);
const tDec=n=>String(n/100);                                   // hundredths as a decimal
const tKx=k=>k===1?'x':k===-1?'-x':k+'x';
const tParts=(intro,arr)=>`${intro}<div class="parts">${arr.map((p,i)=>`<div class="pt"><span>(${String.fromCharCode(97+i)})</span><div>${p}</div></div>`).join('')}</div>`;
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
  return{q:`The line $y=${line}$ is a tangent to the parabola $y=${para}$. Find the value of $k$ and the coordinates of the point of contact.`,
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
    [`Show that $k=${c}$.`,`Find the value of $b$.`,`Hence solve $f(x)=x$, giving exact answers.`]),
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
    [`Find the domain of $f(g(x))$.`,`Find $g(f(x))$, and state its domain and range.`,`Show that the equation $f(g(x))=g(f(x))$ has no real solutions.`]),
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
  return{q:tParts('',[`Solve $|${A}|+|${B}|=${c}$.`,`For what values of $k$ does $|${A}|+|${B}|=k$ have (i) no solutions, (ii) infinitely many solutions, (iii) exactly two solutions?`]),
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
    [`Show that the area of the sector is $A=${h}r-r^{2}$ square centimetres.`,`By completing the square, find the maximum area and the value of $r$ at which it occurs.`,`Find the angle at the centre when the area is a maximum.`]),
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
    [`Show that there are two possible triangles.`,`Find the two possible sizes of $\\angle C$, to the nearest tenth of a degree.`,`Find the two possible lengths of $AC$, to the nearest tenth of a centimetre.`]),
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
     `Hence solve $\\dfrac{${u}}{\\sin\\theta}+\\dfrac{\\sin\\theta}{${u}}=${o.c}$ for $0\\le\\theta\\le 2\\pi$.`]),
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
    [`Find the values of $a$, $b$ and $d$.`,`Hence find the exact values of $x$ for which $y=${v.tex()}$, where $0\\le x\\le ${piTex(F(2,b))}$.`]),
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
  return{q:`Solve $${L}x+${L}(x-${a})=${n}$.`,
   sol:[`Domain: $x>0$ and $x-${a}>0$, so $x>${a}$.`,
    `$$${L}\\,x(x-${a})=${n}\\;\\Rightarrow\\;x(x-${a})=${base}^{${n}}=${N}$$`,
    `$$x^{2}-${a}x-${N}=0\\;\\Rightarrow\\;(x-${r})(x+${o})=0$$`,
    `So $x=${r}$ or $x=-${o}$. The value $x=-${o}$ is not greater than ${a}, so it is rejected.`],
   ans:`$x=${r}$`,
   chk:()=>r*(r-a)===N&&r>a&&(-o)<=a&&tNear(Math.log(r)/Math.log(base)+Math.log(r-a)/Math.log(base),n)}});

tut('tt-reciplog','11adv-explog','Reciprocal logarithms',6,3,
 'Change of base gives log_x b = 1 / log_b x. Let u = log_b x and see what equation you get.',
 R=>{const b=R.pick([2,3,5]),k=R.pick([2,3,4]),rhs=F(k*k+1,k),X1=b**k,X2=rootTex(k,b),L=`\\log_{${b}}`;
  return{q:`Solve $\\log_{x}${b}+${L}x=${rhs.tex()}$.`,
   sol:[`By the change of base rule, $\\log_{x}${b}=\\dfrac{1}{${L}x}$. Let $u=${L}x$ (with $x>0$, $x\\ne 1$).`,
    `$$\\frac{1}{u}+u=${rhs.tex()}\\;\\Rightarrow\\;${k}u^{2}-${k*k+1}u+${k}=0\\;\\Rightarrow\\;(${k}u-1)(u-${k})=0$$`,
    `So $u=${k}$ or $u=\\dfrac{1}{${k}}$.`,
    `$$x=${b}^{${k}}=${X1}\\quad\\text{or}\\quad x=${b}^{\\frac{1}{${k}}}=${X2}$$`],
   ans:`$x=${X1}$ or $x=${X2}$`,
   chk:()=>[b**k,b**(1/k)].every(x=>tNear(Math.log(b)/Math.log(x)+Math.log(x)/Math.log(b),rhs.val()))}});

tut('tt-logsimul','11adv-explog','Simultaneous logarithmic equations',4,2,
 'Turn the log equation into an equation for xy. Then you have xy and x/y, which is enough to find x².',
 R=>{const m=R.int(2,6),n=R.int(1,m-1),s=m+n,r=2**(m-n);
  return{q:`Solve the simultaneous equations $\\log_{2}x+\\log_{2}y=${s}$ and $\\dfrac{x}{y}=${r}$, where $x>0$ and $y>0$.`,
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
  return{q:`Two tangents to the parabola $y=${curve}$ pass through the point $(${p},\\ ${q})$. Find the equation of each tangent.`,
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
    [`Find the equation of this tangent.`,`The tangent meets the curve again at another point. Find its coordinates.`,`Show that for any value of $t$, the tangent at $x=t$ meets the curve again where $x=${gen}$.`]),
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
    [`Find $P(A\\cap B)$.`,`Are $A$ and $B$ independent? Justify your answer.`,`Find $P(A\\mid B')$.`]),
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
    [`Show that the probability that the second marble is red equals the probability that the first marble is red.`,`Given that the second marble is red, find the probability that the first marble was also red.`]),
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
  return{q:`Let $y=${ya}$. Show that $y''${term(-2*a,"y'",false)}${term(k,'y',false)}=0$.`,
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
  return{q:tParts('',[`Show that $\\dfrac{d}{dx}\\left(\\dfrac{x}{${rt}}\\right)=\\dfrac{${a}}{(x^{2}+${a})^{\\frac{3}{2}}}$.`,`Hence find the gradient of the curve $y=\\dfrac{x}{${rt}}$ at $x=${x0}$.`]),
   sol:[`(a) Write $y=x(x^{2}+${a})^{-\\frac{1}{2}}$. By the product and chain rules: $$y'=(x^{2}+${a})^{-\\frac{1}{2}}+x\\cdot\\left(-\\tfrac{1}{2}\\right)(x^{2}+${a})^{-\\frac{3}{2}}\\cdot 2x$$`,
    `$$=(x^{2}+${a})^{-\\frac{3}{2}}\\left[(x^{2}+${a})-x^{2}\\right]=\\frac{${a}}{(x^{2}+${a})^{\\frac{3}{2}}}$$`,
    `(b) At $x=${x0}$: $x^{2}+${a}=${s*s}$, so $$y'=\\frac{${a}}{(${s*s})^{\\frac{3}{2}}}=\\frac{${a}}{${s}^{3}}=${g.tex()}$$`],
   ans:`(a) shown; (b) $${g.tex()}$`,
   chk:()=>{const f=x=>x/Math.sqrt(x*x+a);return x0*x0+a===s*s&&[0.4,1.3,2.2].every(x=>tNear(tFx(f,x),a/Math.pow(x*x+a,1.5)))&&tNear(tFx(f,x0),g.val())}}});

tut('tt-exp-origin','12adv-differentiation','Tangent to an exponential through the origin',6,3,
 'Let the point of contact have x-coordinate t. Write the tangent there, then substitute (0, 0).',
 R=>{const A=R.pick([1,2,3,4]),k=R.pick([-2,-1,1,2,3]),cA=coefTex(A),cAk=coefTex(A*k),kt=k===1?'t':k===-1?'-t':k+'t',E=lin(k,0),t=F(1,k);
  return{q:`The tangent to the curve $y=${cA}e^{${E}}$ at the point $P$ passes through the origin. Find the coordinates of $P$ and the equation of the tangent.`,
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
  return{q:`The tangent to the curve $y=${cA}\\ln x$ at the point $P$ passes through the origin. Find the coordinates of $P$ and the equation of the tangent.`,
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
  return{q:`The curves $y=e^{${E}}$ and $y=kx^{${n}}$, where $k>0$, touch at a point where $x>0$. Find the value of $k$ and the coordinates of the point of contact.`,
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
    [`Find $h'(${c})$.`,`Find the equation of the tangent to $y=h(x)$ at $x=${c}$.`]),
   sol:[`(a) By the product rule and the chain rule: $$h'(x)=f(x^{2}-${a})+x\\cdot f'(x^{2}-${a})\\cdot 2x$$`,
    `At $x=${c}$ the inside is $${c*c}-${a}=${p}$, so $$h'(${c})=f(${p})+${2*c*c}f'(${p})=${u}+${2*c*c}\\times ${tPar(v)}=${m}$$`,
    `(b) $h(${c})=${c}f(${p})=${c*u}$, so the tangent is $$y${term(-c*u,'',false)}=${coefTex(m)}(x-${c})\\;\\Rightarrow\\;y=${lin(m,c*u-m*c)}$$`],
   ans:`(a) $${m}$; (b) $y=${lin(m,c*u-m*c)}$`,
   chk:()=>{const f=x=>u+v*(x-p),h=x=>x*f(x*x-a);return tNear(tFx(h,c),m)&&tNear(h(c),c*u)}}});

tut('tt-ln-show','12adv-differentiation','Show that the derivative of a log is simple',6,3,
 'Differentiate the inside first, then put everything over a common denominator. Look for a factor that cancels with the denominator.',
 R=>{if(R.next()<0.5){const k=R.pick([1,2,3]),X=tKx(k),ck=coefTex(k);
   return{q:`Show that if $y=\\ln(\\sec ${X}+\\tan ${X})$ then $\\dfrac{dy}{dx}=${ck}\\sec ${X}$.`,
    sol:[`$$\\frac{d}{dx}(\\sec ${X}+\\tan ${X})=${ck}\\sec ${X}\\tan ${X}+${ck}\\sec^{2}${X}=${ck}\\sec ${X}(\\tan ${X}+\\sec ${X})$$`,
     `$$\\frac{dy}{dx}=\\frac{${ck}\\sec ${X}(\\tan ${X}+\\sec ${X})}{\\sec ${X}+\\tan ${X}}=${ck}\\sec ${X}$$`],
    ans:`$\\dfrac{dy}{dx}=${ck}\\sec ${X}$, as required.`,
    chk:()=>{const f=x=>Math.log(1/Math.cos(k*x)+Math.tan(k*x));return [0.1,0.2,0.3,0.4].every(x=>k*x<1.3&&tNear(tFx(f,x),k/Math.cos(k*x)))}}}
  const a=R.pick([1,2,3,4,5,7]),rt=`\\sqrt{x^{2}+${a}}`;
  return{q:`Show that if $y=\\ln\\left(x+${rt}\\right)$ then $\\dfrac{dy}{dx}=\\dfrac{1}{${rt}}$.`,
   sol:[`$$\\frac{d}{dx}${rt}=\\frac{2x}{2${rt}}=\\frac{x}{${rt}}$$`,
    `$$\\frac{dy}{dx}=\\frac{1+\\dfrac{x}{${rt}}}{x+${rt}}=\\frac{\\dfrac{${rt}+x}{${rt}}}{x+${rt}}=\\frac{1}{${rt}}$$`],
   ans:`$\\dfrac{dy}{dx}=\\dfrac{1}{${rt}}$, as required.`,
   chk:()=>{const f=x=>Math.log(x+Math.sqrt(x*x+a));return [0.3,1.1,2.4,-0.8].every(x=>tNear(tFx(f,x),1/Math.sqrt(x*x+a)))}}});

// ================= building a tutorial =================
const TUT_BY_ID={};TUT.forEach(t=>{TUT_BY_ID[t.id]=t;t.topicName=(TOPICS.find(x=>x.id===t.topic)||{name:t.topic}).name});

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
