// HSC question bank for the generators (homework and LSQ). Loaded after engine.js, before week.js.
// Each entry is one part of an HSC question, tagged to the lesson it practises:
//   id      paper year + question number, unique
//   lesson  a lesson id from engine.js (TOPICS)
//   src     the citation printed on the answer key, e.g. 'HSC 2021 Q13'
//   marks   the marks the question carried in the paper
//   q, sol, ans   the question as set (HTML with $…$ maths), worked solution lines, final answer
//   gen(R)  optional: the same question with new numbers, returns {q, sol, ans}
//   chk(Q)  optional, used only by scripts/check_generators.js: Q.chk holds numbers to test the answer against
// Only questions that read without a diagram are included. Where a diagram was dropped, src says so.
// The question text is the NESA wording; the worked solutions are ours.
const HSC_BANK=[];
const hsc=(id,lesson,src,marks,q,sol,ans,gen)=>HSC_BANK.push({id,lesson,src,marks,q,sol,ans,gen});
const shown='As required (shown above).';
const sh=(v,c)=>c===0?v:`${v}${term(-c,'',false)}`;   // v - c, written as v + |c| when c is negative

// ---------- Year 12 differential calculus ----------

// 2020 Q18(a): product rule with e^(kx)
hsc('2020-q18a','dd-prodexp','HSC 2020 Q18(a)',2,
 `Differentiate $e^{2x}(2x + 1)$.`,
 [`Product rule: $u = e^{2x}$, $u' = 2e^{2x}$; $\\;v = 2x + 1$, $v' = 2$.`,
  `$$\\frac{d}{dx}\\left[e^{2x}(2x + 1)\\right] = 2e^{2x}(2x + 1) + 2e^{2x}$$`,
  `$$= e^{2x}(4x + 4)$$`],
 `$4(x + 1)e^{2x}$`,
 R=>{const a=R.nz(-3,3),b=R.nz(-4,4),c=R.nz(-6,6),E=ex(lin(a,0)),inner=lin(b,c),out=lin(a*b,a*c+b);
  return{q:`Differentiate $${E}(${inner})$.`,
   sol:[`Product rule: $u = ${E}$, $u' = ${coefTex(a)}${E}$; $\\;v = ${inner}$, $v' = ${b}$.`,
    `$$\\frac{d}{dx}\\left[${E}(${inner})\\right] = ${coefTex(a)}${E}(${inner})${term(b,E,false)}$$`,
    `$$= ${E}(${out})$$`],ans:`$${E}(${out})$`,
   chk:{f:x=>Math.exp(a*x)*(b*x+c),df:x=>Math.exp(a*x)*(a*b*x+a*c+b)}}});

// 2021 Q13: exact gradient of the tangent to y = x tan x
hsc('2021-q13','dd-trigexact','HSC 2021 Q13',3,
 `Find the exact gradient of the tangent to the curve $y = x\\tan x$ at the point where $x = \\dfrac{\\pi}{3}$.`,
 [`Product rule: $u = x$, $u' = 1$; $\\;v = \\tan x$, $v' = \\sec^{2}x$.`,
  `$$\\frac{dy}{dx} = \\tan x + x\\sec^{2}x$$`,
  `At $x = \\dfrac{\\pi}{3}$: $\\tan\\dfrac{\\pi}{3} = \\sqrt{3}$ and $\\sec^{2}\\dfrac{\\pi}{3} = \\dfrac{1}{\\cos^{2}\\frac{\\pi}{3}} = 4$.`,
  `$$m = \\sqrt{3} + \\frac{\\pi}{3}\\times 4 = \\sqrt{3} + \\frac{4\\pi}{3}$$`],
 `$\\sqrt{3} + \\dfrac{4\\pi}{3}$`,
 R=>{const k=R.pick([1,1,2,3]),th=R.pick(['1/6','1/4','1/3','2/3','3/4','5/6']),[n,d]=th.split('/').map(Number),theta=F(n,d),
   [tc,tm]=TRIG[th].tan,[sc]=TRIG[th].sec2,tv=surdVal(tc,tm),A=surdVal(F(k).mul(tc),tm),B=piTex(F(k).mul(theta).mul(sc)),
   ans=A+(B.startsWith('-')?' - '+B.slice(1):' + '+B),pre=coefTex(k),W=s=>s.startsWith('-')?`(${s})`:s.includes('frac')?`\\left(${s}\\right)`:s;
  return{q:`Find the exact gradient of the tangent to the curve $y = ${pre}x\\tan x$ at the point where $x = ${piTex(theta)}$.`,
   sol:[`Product rule: $u = ${pre}x$, $u' = ${k}$; $\\;v = \\tan x$, $v' = \\sec^{2}x$.`,
    `$$\\frac{dy}{dx} = ${pre}\\tan x + ${pre}x\\sec^{2}x$$`,
    `At $x = ${piTex(theta)}$: $\\tan ${piTex(theta)} = ${tv}$ and $\\sec^{2}${piTex(theta)} = ${sc.tex()}$.`,
    `$$m = ${k===1?'':k+'\\times '}${W(tv)} + ${pre}\\left(${piTex(theta)}\\right)\\times ${sc.tex()}$$`,`$$= ${ans}$$`],ans:`$${ans}$`,
   chk:{f:x=>k*x*Math.tan(x),df:x=>k*Math.tan(x)+k*x/Math.cos(x)**2,x0:theta.val()*Math.PI,val:k*Math.tan(theta.val()*Math.PI)+k*theta.val()*Math.PI/Math.cos(theta.val()*Math.PI)**2}}});

// 2024 Q27(a): derivative of x^2 tan x
hsc('2024-q27a','dd-trigprod','HSC 2024 Q27(a)',2,
 `Find the derivative of $x^{2}\\tan x$.`,
 [`Product rule: $u = x^{2}$, $u' = 2x$; $\\;v = \\tan x$, $v' = \\sec^{2}x$.`,
  `$$\\frac{d}{dx}\\left(x^{2}\\tan x\\right) = 2x\\tan x + x^{2}\\sec^{2}x$$`],
 `$2x\\tan x + x^{2}\\sec^{2}x$`,
 R=>{const n=R.pick([2,2,3,4]),k=R.pick([1,1,2,3]),fn=R.pick(['tan','sin','cos']),kx=lin(k,0),xn=xp(n),
   u1=n===2?'2x':`${n}${xp(n-1)}`,v1=fn==='tan'?`${coefTex(k)}${fnTex('sec',kx,2)}`:fn==='sin'?`${coefTex(k)}${fnTex('cos',kx)}`:`${coefTex(-k)}${fnTex('sin',kx)}`,
   part2=fn==='cos'?` - ${coefTex(k)}${xn}${fnTex('sin',kx)}`:` + ${coefTex(k)}${xn}${fn==='tan'?fnTex('sec',kx,2):fnTex('cos',kx)}`,out=`${u1}${fnTex(fn,kx)}${part2}`;
  return{q:`Find the derivative of $${xn}${fnTex(fn,kx)}$.`,
   sol:[`Product rule: $u = ${xn}$, $u' = ${u1}$; $\\;v = ${fnTex(fn,kx)}$, $v' = ${v1}$.`,
    `$$\\frac{d}{dx}\\left(${xn}${fnTex(fn,kx)}\\right) = ${out}$$`],ans:`$${out}$`,
   chk:{f:x=>x**n*(fn==='tan'?Math.tan(k*x):fn==='sin'?Math.sin(k*x):Math.cos(k*x)),
    df:x=>n*x**(n-1)*(fn==='tan'?Math.tan(k*x):fn==='sin'?Math.sin(k*x):Math.cos(k*x))+x**n*(fn==='tan'?k/Math.cos(k*x)**2:fn==='sin'?k*Math.cos(k*x):-k*Math.sin(k*x))}}});

// 2025 Q25(a): show a derivative
hsc('2025-q25a','dd-trigprod','HSC 2025 Q25(a)',2,
 `Show that $\\dfrac{d}{dx}(\\sin x - x\\cos x) = x\\sin x$.`,
 [`Differentiate $x\\cos x$ with the product rule: $\\dfrac{d}{dx}(x\\cos x) = \\cos x - x\\sin x$.`,
  `$$\\frac{d}{dx}(\\sin x - x\\cos x) = \\cos x - (\\cos x - x\\sin x)$$`,
  `$$= x\\sin x$$`],shown,
 R=>{const k=R.pick([2,3,4]),v=R.int(0,1),kx=lin(k,0);
  if(v===0)return{q:`Show that $\\dfrac{d}{dx}\\left(\\sin ${kx} - ${kx}\\cos ${kx}\\right) = ${k*k}x\\sin ${kx}$.`,
   sol:[`Differentiate $${kx}\\cos ${kx}$ with the product rule: $\\dfrac{d}{dx}(${kx}\\cos ${kx}) = ${k}\\cos ${kx} - ${k*k}x\\sin ${kx}$.`,
    `$$\\frac{d}{dx}\\left(\\sin ${kx} - ${kx}\\cos ${kx}\\right) = ${k}\\cos ${kx} - \\left(${k}\\cos ${kx} - ${k*k}x\\sin ${kx}\\right)$$`,
    `$$= ${k*k}x\\sin ${kx}$$`],ans:shown,chk:{f:x=>Math.sin(k*x)-k*x*Math.cos(k*x),df:x=>k*k*x*Math.sin(k*x)}};
  return{q:`Show that $\\dfrac{d}{dx}\\left(\\cos ${kx} + ${kx}\\sin ${kx}\\right) = ${k*k}x\\cos ${kx}$.`,
   sol:[`Differentiate $${kx}\\sin ${kx}$ with the product rule: $\\dfrac{d}{dx}(${kx}\\sin ${kx}) = ${k}\\sin ${kx} + ${k*k}x\\cos ${kx}$.`,
    `$$\\frac{d}{dx}\\left(\\cos ${kx} + ${kx}\\sin ${kx}\\right) = -${k}\\sin ${kx} + ${k}\\sin ${kx} + ${k*k}x\\cos ${kx}$$`,
    `$$= ${k*k}x\\cos ${kx}$$`],ans:shown,chk:{f:x=>Math.cos(k*x)+k*x*Math.sin(k*x),df:x=>k*k*x*Math.cos(k*x)}}});

// 2026 Q15: derivative of a^(f(x))
hsc('2026-q15','dd-ax','HSC 2026 Q15',2,
 `Find $\\dfrac{dy}{dx}$ if $y = 4^{x^{2} + 3}$.`,
 [`$\\dfrac{d}{dx}a^{f(x)} = f'(x)\\,a^{f(x)}\\ln a$, with $f(x) = x^{2} + 3$ and $f'(x) = 2x$.`,
  `$$\\frac{dy}{dx} = 2x\\times 4^{x^{2} + 3}\\ln 4$$`],
 `$2x\\cdot 4^{x^{2} + 3}\\ln 4$`,
 R=>{const a=R.pick([2,3,5,7]),m=R.pick([1,1,2,3,-1]),c=R.nz(-6,6),f=poly([[m,'x^{2}'],[c,'']]),df=`${2*m}x`;
  return{q:`Find $\\dfrac{dy}{dx}$ if $y = ${a}^{${f}}$.`,
   sol:[`$\\dfrac{d}{dx}a^{f(x)} = f'(x)\\,a^{f(x)}\\ln a$, with $f(x) = ${f}$ and $f'(x) = ${df}$.`,
    `$$\\frac{dy}{dx} = ${df}\\times ${a}^{${f}}\\ln ${a}$$`],ans:`$${df}\\cdot ${a}^{${f}}\\ln ${a}$`,
   chk:{f:x=>a**(m*x*x+c),df:x=>2*m*x*a**(m*x*x+c)*Math.log(a)}}});

// 2026 Q21(a): quotient rule with ln x
hsc('2026-q21a','dd-ln','HSC 2026 Q21(a)',2,
 `Show that the first derivative of $g(x) = \\dfrac{x}{\\ln x}$ is $g'(x) = \\dfrac{\\ln x - 1}{(\\ln x)^{2}}$.`,
 [`Quotient rule: $u = x$, $u' = 1$; $\\;v = \\ln x$, $v' = \\dfrac{1}{x}$.`,
  `$$g'(x) = \\frac{1\\times \\ln x - x\\times \\frac{1}{x}}{(\\ln x)^{2}}$$`,
  `$$= \\frac{\\ln x - 1}{(\\ln x)^{2}}$$`],shown,
 R=>{const n=R.pick([2,3,4]),v=R.int(0,1),xn=xp(n),xm=xp(n-1);
  if(v===0)return{q:`Show that the first derivative of $g(x) = \\dfrac{${xn}}{\\ln x}$ is $g'(x) = \\dfrac{${xm}(${n}\\ln x - 1)}{(\\ln x)^{2}}$.`,
   sol:[`Quotient rule: $u = ${xn}$, $u' = ${n}${xm}$; $\\;v = \\ln x$, $v' = \\dfrac{1}{x}$.`,
    `$$g'(x) = \\frac{${n}${xm}\\ln x - ${xn}\\times \\frac{1}{x}}{(\\ln x)^{2}}$$`,
    `$$= \\frac{${n}${xm}\\ln x - ${xm}}{(\\ln x)^{2}} = \\frac{${xm}(${n}\\ln x - 1)}{(\\ln x)^{2}}$$`],ans:shown,
   chk:{f:x=>x**n/Math.log(x),df:x=>x**(n-1)*(n*Math.log(x)-1)/Math.log(x)**2,pos:true}};
  return{q:`Show that the first derivative of $g(x) = \\dfrac{\\ln x}{${xn}}$ is $g'(x) = \\dfrac{1 - ${n}\\ln x}{x^{${n+1}}}$.`,
   sol:[`Quotient rule: $u = \\ln x$, $u' = \\dfrac{1}{x}$; $\\;v = ${xn}$, $v' = ${n}${xm}$.`,
    `$$g'(x) = \\frac{\\frac{1}{x}\\times ${xn} - ${n}${xm}\\ln x}{x^{${2*n}}}$$`,
    `$$= \\frac{${xm} - ${n}${xm}\\ln x}{x^{${2*n}}} = \\frac{${xm}(1 - ${n}\\ln x)}{x^{${2*n}}} = \\frac{1 - ${n}\\ln x}{x^{${n+1}}}$$`],ans:shown,
   chk:{f:x=>Math.log(x)/x**n,df:x=>(1-n*Math.log(x))/x**(n+1),pos:true}}});

// 2020 Q29(a): tangent to y = c ln x (diagram omitted)
hsc('2020-q29a','dd-ln','HSC 2020 Q29(a), diagram omitted',2,
 `Consider the curve $y = c\\ln x$, where $c > 0$. Show that the equation of the tangent to $y = c\\ln x$ at $x = p$, where $p > 0$, is $y = \\dfrac{c}{p}x - c + c\\ln p$.`,
 [`$\\dfrac{dy}{dx} = \\dfrac{c}{x}$, so the gradient at $x = p$ is $\\dfrac{c}{p}$. The point of tangency is $(p,\\ c\\ln p)$.`,
  `$$y - c\\ln p = \\frac{c}{p}(x - p)$$`,
  `$$y = \\frac{c}{p}x - c + c\\ln p$$`],shown,
 R=>{const c=R.pick([2,3,4,5,6]),p=R.pick([2,3,4,5,6]),m=F(c,p),mx=m.isInt()?coefTex(m.n):m.tex();
  return{q:`Show that the equation of the tangent to $y = ${c}\\ln x$ at $x = ${p}$ is $y = ${mx}x - ${c} + ${c}\\ln ${p}$.`,
   sol:[`$\\dfrac{dy}{dx} = \\dfrac{${c}}{x}$, so the gradient at $x = ${p}$ is $${m.tex()}$. The point of tangency is $(${p},\\ ${c}\\ln ${p})$.`,
    `$$y - ${c}\\ln ${p} = ${m.tex()}(x - ${p})$$`,
    `$$y = ${mx}x - ${c} + ${c}\\ln ${p}$$`],ans:shown,
   chk:{f:x=>c*Math.log(x),df:x=>c/x}}});

// ---------- Year 11 differentiation (chain rule, tangents), met again in Year 12 ----------

// 2022 Q18(a): chain rule
hsc('2022-q18a','dc-chain','HSC 2022 Q18(a)',2,
 `Differentiate $y = (x^{2} + 1)^{4}$.`,
 [`Chain rule with $u = x^{2} + 1$: $\\dfrac{du}{dx} = 2x$ and $y = u^{4}$, so $\\dfrac{dy}{du} = 4u^{3}$.`,
  `$$\\frac{dy}{dx} = 4(x^{2} + 1)^{3}\\times 2x = 8x(x^{2} + 1)^{3}$$`],
 `$8x(x^{2} + 1)^{3}$`,
 R=>{const a=R.pick([1,1,2,3]),b=R.nz(-6,6),n=R.int(3,6),u=pTex([b,0,a]),du=`${2*a}x`,k=2*a*n;
  return{q:`Differentiate $y = (${u})^{${n}}$.`,
   sol:[`Chain rule with $u = ${u}$: $\\dfrac{du}{dx} = ${du}$ and $y = u^{${n}}$, so $\\dfrac{dy}{du} = ${n}u^{${n-1}}$.`,
    `$$\\frac{dy}{dx} = ${n}(${u})^{${n-1}}\\times ${du} = ${k}x(${u})^{${n-1}}$$`],ans:`$${k}x(${u})^{${n-1}}$`,
   chk:{f:x=>(a*x*x+b)**n,df:x=>k*x*(a*x*x+b)**(n-1)}}});

// 2023 Q14: tangent to a power of a linear function
hsc('2023-q14','dc-tangent','HSC 2023 Q14',3,
 `Find the equation of the tangent to the curve $y = (2x + 1)^{3}$ at the point $(0, 1)$.`,
 [`$\\dfrac{dy}{dx} = 3(2x + 1)^{2}\\times 2 = 6(2x + 1)^{2}$`,
  `At $x = 0$: $m = 6(1)^{2} = 6$.`,
  `$$y - 1 = 6(x - 0)$$`,`$$y = 6x + 1$$`],`$y = 6x + 1$`,
 R=>{const n=R.pick([3,3,4]),a=R.pick([2,3,-1,-2]),w=R.pick([1,-1,2]),p=R.pick([0,1,-1,2]),b=w-a*p,y0=w**n,m=n*a*w**(n-1),c=y0-m*p,inner=lin(a,b);
  return{q:`Find the equation of the tangent to the curve $y = (${inner})^{${n}}$ at the point $(${p}, ${y0})$.`,
   sol:[`$\\dfrac{dy}{dx} = ${n}(${inner})^{${n-1}}\\times ${a<0?`(${a})`:a} = ${n*a}(${inner})^{${n-1}}$`,
    `At $x = ${p}$: $${inner} = ${w}$, so $m = ${n*a}(${w})^{${n-1}} = ${m}$.`,
    `$$${sh('y',y0)} = ${m}(${sh('x',p)})$$`,`$$y = ${lin(m,c)}$$`],ans:`$y = ${lin(m,c)}$`,
   chk:{y0,m,c}}});

// 2025 Q12: tangent to a curve with a negative index
hsc('2025-q12','dc-tangent','HSC 2025 Q12',3,
 `Find the equation of the tangent to $y = 5x^{3} - \\dfrac{2}{x^{2}} - 9$ at the point $(1, -6)$.`,
 [`Write $y = 5x^{3} - 2x^{-2} - 9$, so $\\dfrac{dy}{dx} = 15x^{2} + 4x^{-3} = 15x^{2} + \\dfrac{4}{x^{3}}$.`,
  `At $x = 1$: $m = 15 + 4 = 19$.`,
  `$$y + 6 = 19(x - 1)$$`,`$$y = 19x - 25$$`],`$y = 19x - 25$`,
 R=>{const a=R.int(2,6),b=R.int(1,4),c=R.nz(-9,9),p=R.pick([1,1,-1]),y0=a*p-b+c,m=3*a+2*b*p,k=y0-m*p,rhs=lin(m,k),
   f=`${a}x^{3} - \\dfrac{${b}}{x^{2}}${term(c,'',false)}`,fi=`${a}x^{3} - ${b===1?'':b}x^{-2}${term(c,'',false)}`,
   pw=p===1?'':'(-1)';
  return{q:`Find the equation of the tangent to $y = ${f}$ at the point $(${p}, ${y0})$.`,
   sol:[`Write $y = ${fi}$, so $\\dfrac{dy}{dx} = ${3*a}x^{2} + ${2*b}x^{-3} = ${3*a}x^{2} + \\dfrac{${2*b}}{x^{3}}$.`,
    `At $x = ${p}$: $m = ${3*a}${p===1?'':'(-1)^{2}'} + \\dfrac{${2*b}}{${p===1?'1':'(-1)^{3}'}} = ${m}$.`,
    `$$${sh('y',y0)} = ${m}(${sh('x',p)})$$`,`$$y = ${rhs}$$`],ans:`$y = ${rhs}$`,
   chk:{y0,m,c:k,f:x=>a*x**3-b/x**2+c,df:x=>3*a*x*x+2*b/x**3,p}}});

// 2026 Q11: gradient of a tangent
hsc('2026-q11','dc-tangent','HSC 2026 Q11',2,
 `Find the gradient of the tangent to $y = x^{3} + 3x$ at $x = -1$.`,
 [`$\\dfrac{dy}{dx} = 3x^{2} + 3$`,`At $x = -1$: $m = 3(-1)^{2} + 3 = 6$.`],`$6$`,
 R=>{const a=R.pick([1,1,2,3,-1]),b=R.int(-4,4),c=R.nz(-6,6),p=R.nz(-3,3),cs=[F(0),F(c),F(b),F(a)],d=pDer(cs),m=pEval(d,p);
  return{q:`Find the gradient of the tangent to $y = ${pTex(cs)}$ at $x = ${p}$.`,
   sol:[`$\\dfrac{dy}{dx} = ${pTex(d)}$`,`At $x = ${p}$: $m = ${subTex(d,p)} = ${m.tex()}$.`],ans:`$${m.tex()}$`,
   chk:{f:x=>a*x**3+b*x*x+c*x,df:x=>3*a*x*x+2*b*x+c,x0:p,val:m.val()}}});

// 2022 Q5 (multiple choice, options removed): quotient rule from values
hsc('2022-q5','dc-quotient','HSC 2022 Q5, options removed',2,
 `Let $h(x) = \\dfrac{f(x)}{g(x)}$, where $f(1) = 2$, $f'(1) = 4$, $g(1) = 8$ and $g'(1) = 12$. What is the gradient of the tangent to the graph of $y = h(x)$ at $x = 1$?`,
 [`Quotient rule: $h'(x) = \\dfrac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^{2}}$.`,
  `$$h'(1) = \\frac{4\\times 8 - 2\\times 12}{8^{2}} = \\frac{8}{64} = \\frac{1}{8}$$`],`$\\dfrac{1}{8}$`,
 R=>{let f,fp,g,gp,num;do{f=R.nz(-6,9);fp=R.nz(-9,9);g=R.pick([2,3,4,5,6,8,-2,-3,-4]);gp=R.nz(-9,9);num=fp*g-f*gp}while(num===0);
  const m=F(num,g*g),x0=R.pick([1,1,2,-1,3]);
  return{q:`Let $h(x) = \\dfrac{f(x)}{g(x)}$, where $f(${x0}) = ${f}$, $f'(${x0}) = ${fp}$, $g(${x0}) = ${g}$ and $g'(${x0}) = ${gp}$. What is the gradient of the tangent to the graph of $y = h(x)$ at $x = ${x0}$?`,
   sol:[`Quotient rule: $h'(x) = \\dfrac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^{2}}$.`,
    `$$h'(${x0}) = \\frac{${fp}\\times ${F(g).btex()} - ${F(f).btex()}\\times ${F(gp).btex()}}{${F(g).btex()}^{2}} = \\frac{${num}}{${g*g}}${m.n===num&&m.d===g*g?'':` = ${m.tex()}`}$$`],ans:`$${m.tex()}$`,
   chk:{val:m.val(),f,fp,g,gp}}});

// 2021 Q31: tangents from an external point
hsc('2021-q31','dc-tangent','HSC 2021 Q31',4,
 `By considering the equation of the tangent to $y = x^{2} - 1$ at the point $(a, a^{2} - 1)$, find the equations of the two tangents to $y = x^{2} - 1$ which pass through $(3, -8)$.`,
 [`$\\dfrac{dy}{dx} = 2x$, so the tangent at $(a, a^{2} - 1)$ has gradient $2a$:`,
  `$$y - (a^{2} - 1) = 2a(x - a), \\quad\\text{so}\\quad y = 2ax - a^{2} - 1$$`,
  `It passes through $(3, -8)$: $-8 = 6a - a^{2} - 1$, so $a^{2} - 6a - 7 = 0$ and $(a - 7)(a + 1) = 0$.`,
  `$a = 7$ gives $y = 14x - 50$; $\\;a = -1$ gives $y = -2x - 2$.`],`$y = 14x - 50$ and $y = -2x - 2$`,
 R=>{let a1,a2;do{a1=R.int(-5,5);a2=R.int(-5,6)}while(a1>=a2||(a2-a1)%2!==0||a2-a1>8||a1+a2===0);
  const p=(a1+a2)/2,c=R.nz(-4,4),q=c+a1*a2,curve=poly([[1,'x^{2}'],[c,'']]),at=`a^{2}${term(c,'',false)}`,
   line=a=>lin(2*a,c-a*a),quad=pTex([a1*a2,-(a1+a2),1]).replace(/x/g,'a').replace(/a\^\{2\}/,'a^{2}');
  return{q:`By considering the equation of the tangent to $y = ${curve}$ at the point $(a, ${at})$, find the equations of the two tangents to $y = ${curve}$ which pass through $(${p}, ${q})$.`,
   sol:[`$\\dfrac{dy}{dx} = 2x$, so the tangent at $(a, ${at})$ has gradient $2a$:`,
    `$$y - (${at}) = 2a(x - a), \\quad\\text{so}\\quad y = 2ax - a^{2}${term(c,'',false)}$$`,
    `It passes through $(${p}, ${q})$: $${q} = ${lin(2*p,0).replace('x','a')} - a^{2}${term(c,'',false)}$, so $${quad} = 0$ and $${factored(1,a1,a2).replace(/x/g,'a')} = 0$.`,
    `$a = ${a1}$ gives $y = ${line(a1)}$; $\\;a = ${a2}$ gives $y = ${line(a2)}$.`],ans:`$y = ${line(a1)}$ and $y = ${line(a2)}$`,
   chk:{c,p,q,a1,a2,m1:2*a1,k1:c-a1*a1,m2:2*a2,k2:c-a2*a2}}});
