/*
   CERJ · BikeLab PSI Calculator 3.0.0 · ORCID 0009-0007-5631-7436 · 2026
        ___________
      /    · · ·    \      P = 600·L/W² + 0.75·W − 25        (road/gravel, Berto)
     |  ·  tire  ·   |     P_front = 0.93 · P_rear
      \_____________/      P_MTB = (A + B·kg + C·w + D·kg·w) · factors
   ____________▲_________  15 % drop · contact patch
*/
// psi_engine_road.js — road/gravel engine (Berto + corrections) — copied byte for byte from the live page
// https://www.bikelabstudio.com/articles/psi-calculator-en.html (2026-11-23)
// SHA-256 of the copied block: 800c5912d39f8a9c905ef579b054b995e7202fe5a8e4a770544e6259afc053d4
// Only the module footer below END was added, to run it outside a browser.
// ---- BEGIN verbatim ----
var KG2LB=2.20462, K_FRONT=0.93, TUBE=1.05;
var REAR_SHARE={racing:.60,endurance:.55,urbana:.65};
var CASING={estandar:0,supple:-.05,rigida:.05};
var SURFACE={liso:0,rugoso:-.05,gravel:-.125};
var DELTA={ruta:[7.9530,-0.2727],gravel:[1.5043,-0.0827]}; // BRR census n=321
var RIM_REF=18.0, SLOPE=0.4;
var SIG_KG=2.0, SIG_W_EST=1.5, SIG_W_MEAS=0.5, D_SHARE=0.03, N_MC=4000;

var $=function(id){return document.getElementById(id)};
var disc="ruta", unit="kg";

var NOMS={ruta:[23,24,25,26,27,28,29,30,31,32],gravel:[32,33,34,35,36,37,38,40,42,44,45,47,48,50]};
var RIMS=[15,16,17,18,19,20,21,22,23,24,25,26,28,30,32];

function fillSelects(){
  var n=$("inNominal"); n.innerHTML="";
  NOMS[disc].forEach(function(w){var o=document.createElement("option");o.value=w;o.textContent=w+" mm";n.appendChild(o)});
  n.value=disc==="ruta"?28:40;
  var r=$("inRim");
  if(!r.options.length){RIMS.forEach(function(w){var o=document.createElement("option");o.value=w;o.textContent=w+" mm";r.appendChild(o)})}
  r.value=disc==="ruta"?21:24;
  $("inSurface").value=disc==="ruta"?"liso":"gravel";
}

function deltaNom(nom){var c=nom<=30?DELTA.ruta:DELTA.gravel;return c[0]+c[1]*nom}
function realWidth(nom,rim){return nom+deltaNom(nom)+SLOPE*(rim-RIM_REF)}
function berto(loadLb,w){return 600*loadLb/(w*w)+0.75*w-25}

function pRear(kg,w,share,tube,casing,surface){
  var p=berto(kg*KG2LB*share,w);
  if(tube)p*=TUBE;
  p*=1+CASING[casing]; p*=1+SURFACE[surface];
  return p;
}
// ---- END verbatim ----

if (typeof module!=='undefined') module.exports={pRear,realWidth,deltaNom,berto,K_FRONT,REAR_SHARE,CASING,SURFACE,TUBE,KG2LB};
