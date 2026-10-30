'use strict';
// Regression guard for tablet-friendly Canvas effects.
// Counts rendering passes, without relying on a browser or GPU driver.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const clip=(a,b)=>{
  const i=html.indexOf(a),j=html.indexOf(b,i+a.length);
  assert(i>=0&&j>i,'Missing Canvas helper: '+a);
  return html.slice(i,j);
};
const arcSrc=clip('function arcBand(', '\nfunction featherSweep(');
const sweepSrc=clip('function featherSweep(', '\nfunction featherRing(');
let fills=0;
const noOp=()=>{};
const cx={
  save:noOp,restore:noOp,translate:noOp,scale:noOp,
  beginPath:noOp,arc:noOp,moveTo:noOp,closePath:noOp,
  fill:()=>{fills++;},
  createRadialGradient:()=>({addColorStop:noOp})
};
const sandbox={cx,YR:.58,lerp:(a,b,u)=>a+(b-a)*u,Math};
vm.createContext(sandbox);
vm.runInContext(arcSrc+sweepSrc+';globalThis.fxFns={arcBand,featherSweep};',sandbox);
fills=0;
sandbox.fxFns.arcBand(0,0,-1,1,154,55,1,.5,1.6);
assert(fills<=10&&fills>=1,'Sword arc exceeds mobile draw budget: '+fills);
fills=0;
sandbox.fxFns.featherSweep({x:0,y:0,R:240,ha:1.1,a:0},.2);
assert.equal(fills,1,'Combo cone must use a single gradient draw');
const slash=clip("}else if(f.k==='slash'){","}else if(f.k==='whip'){");
assert(!slash.includes('shadowBlur'),'Sword slash must not use per-frame shadow blur');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert(scripts.length>0,'No inline game script found');
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i][1],{filename:'index-script-'+i+'.js'});
console.log('Canvas FX budget OK: arc <=10, sweep 1, slash no shadow blur, scripts parse');
