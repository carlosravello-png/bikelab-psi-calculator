/*
   CERJ · BikeLab PSI Calculator 3.0.0 · ORCID 0009-0007-5631-7436 · 2026
        ___________
      /    · · ·    \      P = 600·L/W² + 0.75·W − 25        (road/gravel, Berto)
     |  ·  tire  ·   |     P_front = 0.93 · P_rear
      \_____________/      P_MTB = (A + B·kg + C·w + D·kg·w) · factors
   ____________▲_________  15 % drop · contact patch
*/
// psi_engine_mtb.js — MTB engine (fit to the SRAM/Zipp guide, 2026-07-02) — copied byte for byte from the live page
// https://www.bikelabstudio.com/articles/psi-calculator-en.html (2026-11-23)
// SHA-256 of the copied block: 017b247df5d0cf8a674477c1fbe9836fdc890ca56e739c1646ad05971b61b5c8
// Only the module footer below END was added, to run it outside a browser.
// ---- BEGIN verbatim ----
var A=1.925444,B=0.015156,C=-0.380833,D=-0.002667,RF=1.0631;
var RUEDA={"29":1,"27.5":1.1086,"26":1.1371};
var SIST={tubeless:1,camara:1.0229,inserto:1};
var CARC={estandar:1,reforzada:0.9486,dh:0.9029};
var DISC={xc:0.8571,trail:1,enduro:1,dh:1.0514};
var HOOKLESS=0.9257,CAP=5.0,INS=0.3447,B2P=14.5038;
var SIG_KG=2.0,SIG_W=0.06,N_MC=4000;
var KG2LB=2.20462;
var $=function(id){return document.getElementById(id)};
var unit="kg";

function mAro(r){r=Math.max(25,Math.min(35,r));return r<=30?1.0514+(1-1.0514)*(r-25)/5:1+(0.9543-1)*(r-30)/5}
function centroF(kg,w,rueda,sys,hookless,carc,rim,disc){
  return (A+B*kg+C*w+D*kg*w)*RUEDA[rueda]*SIST[sys]*(hookless?HOOKLESS:1)*CARC[carc]*mAro(rim)*DISC[disc];
}
/* Seeded PRNG (mulberry32): same input → same band, in all 3 languages */
var _s=0;function _rng(){_s=_s+0x6D2B79F5|0;var t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function randn(){var u=0,v=0;while(u===0)u=_rng();while(v===0)v=_rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}

/* GOLDEN VECTORS — must match psi_mtb_oracle.py to 1e-4 bar */
var GOLD=[
 [75,2.4,"29","tubeless",false,"estandar",30,"trail",1.6681,1.7733],
 [90,2.6,"29","tubeless",false,"reforzada",30,"enduro",1.5891,1.6894],
 [60,2.2,"29","tubeless",false,"estandar",28,"xc",1.4389,1.5296],
 [85,2.4,"27.5","camara",false,"estandar",30,"trail",1.9909,2.1165],
 [100,2.5,"27.5","tubeless",false,"dh",35,"dh",1.8301,1.9455],
 [70,2.3,"26","tubeless",false,"estandar",25,"trail",2.0098,2.1366],
 [85,2.4,"29","tubeless",true,"estandar",30,"trail",1.6252,1.7277],
 [55,2.6,"29","inserto",true,"reforzada",32,"enduro",1.1961,1.2716]
];
// ---- END verbatim ----

// selfTestCore: the page's selfTest() conditions without touching the DOM.
function selfTestCore(){var ok=0;for(var i=0;i<GOLD.length;i++){var g=GOLD[i];var f=centroF(g[0],g[1],g[2],g[3],g[4],g[5],g[6],g[7]),r=f*RF;if(Math.abs(f-g[8])<1e-4&&Math.abs(r-g[9])<1e-4)ok++;}
  var sg=centroF(95,2.4,"29","tubeless",false,"estandar",30,"trail")>centroF(85,2.4,"29","tubeless",false,"estandar",30,"trail")
    && centroF(85,2.6,"29","tubeless",false,"estandar",30,"trail")<centroF(85,2.4,"29","tubeless",false,"estandar",30,"trail")
    && centroF(85,2.4,"26","tubeless",false,"estandar",30,"trail")>centroF(85,2.4,"27.5","tubeless",false,"estandar",30,"trail");
  return {ok:ok,n:GOLD.length,signGuard:sg};}
if (typeof module!=='undefined') module.exports={centroF,mAro,RF,GOLD,selfTestCore};
