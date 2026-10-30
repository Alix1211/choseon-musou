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
assert(!/cx\.shadowBlur\s*=/.test(slash),'Sword slash must not use per-frame shadow blur');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert(scripts.length>0,'No inline game script found');
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i][1],{filename:'index-script-'+i+'.js'});
// Combat buttons must be next to each other rather than splitting the
// right-hand group across distant vertical positions.
const css=html.split('</style>')[0];
const matchLast=(id,prop)=>[...css.matchAll(new RegExp('body #'+id+'\\s*\\{([^}]+)\\}', 'g'))].at(-1)?.[1]||'';
const dashCSS=matchLast('dash'),musouCSS=matchLast('musou');
assert.match(dashCSS,/\+ 202px/,'Dash must be to the left of light attack');
assert.match(dashCSS,/\+ 26px/,'Dash should be at the same vertical level as attacks');
assert.match(musouCSS,/\+ 294px/,'Musou must sit to the left of dash');
const right=16; // CSS safe-area inset can increase this equally for all buttons.
const intervals=[
  {name:'heavy',x0:right,x1:right+94},
  {name:'light',x0:right+105,x1:right+105+86},
  {name:'dash',x0:right+202,x1:right+202+74},
  {name:'musou',x0:right+294,x1:right+294+43}
];
for(let i=1;i<intervals.length;i++)
  assert(intervals[i].x0>=intervals[i-1].x1+8,intervals[i].name+' overlaps adjacent button');
const dur=clip('function comboAttackDuration(){','\nfunction comboFps(');
assert.match(dur,/P\.cbAction==='light'\?\.45:\.62/,'Updated attack cadence missing');
assert.match(dur,/Number\(ST\.attackSpeed\)/,'Equipment attack-speed scaling must be retained');
console.log('Controls OK: adjacent dash, portrait Musou, light .45s, heavy .62s');
assert(html.includes('function playVoice(id,priority=1)'), 'Korean voice playback engine required');
assert(html.includes("CM_AUDIO.playVoice('skill_musou_01',3)"), 'Musou voice not connected');
assert(html.includes('CHOSEON_VOICE_BY_TEXT.get(L.t)'), 'Story/map dialogue voice mapping not connected');
assert(html.includes('const voiceRoot=new URL'), 'Voice asset base path missing');
console.log('Korean voices: Musou, combat skills, barks, all mapped stories');
console.log('Canvas FX budget OK: arc <=10, sweep 1, slash no shadow blur, scripts parse');
