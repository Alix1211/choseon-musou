'use strict';
/* Exercising ACTUAL generated combat functions, not a reimplementation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
function codeBetween(from,to) {
  const a=html.indexOf(from),b=html.indexOf(to,a+from.length);
  assert(a>=0&&b>a,'Missing code anchor '+from);
  return html.slice(a,b);
}
const reachMatch=html.match(/const REACH=\{sword:(\d+),whip:(\d+),fan:(\d+)\}/);
assert(reachMatch,'weapon range table missing');
const reach=Number(reachMatch[2]);
assert.equal(reach,170,'the hard whip reach must be 170');
let scenarios=0;
function env(targetDist,statBonus=1) {
  const target={x:targetDist,y:0,scale:2,dead:false,down:false,boss:false,stun:0,kx:0,ky:0};
  const hits=[],effects=[];
  const ctx={
    P:{x:0,y:0,cbWeapon:'whip',cbAngle:0,cbDir:{x:1,y:0},cbRushHit:new Set()},
    CH:50,ST:{rng:statBonus,skd:1,wt:'whip'},REACH:{sword:146,whip:170,fan:600},M:null,
    fx:effects,orbs:[],shake:0,Math,Set,hitMob:(m,p)=>hits.push({m,p}),
    liveMobs:()=>[target],stat:{atk:()=>100},aimT:()=>({m:target}),ang:()=>0,
    gang:()=>0,breakJars:()=>{},nearest:()=>({m:target}),
    fwd:()=>({x:60,y:0}),hasLOS:()=>true,rnd:()=>1,wards:[],
    comboDamage:(m,p)=>hits.push({m,p})
  };
  return {ctx,target,effects,hits};
}
const normal=codeBetween('function doHit(w,mm){','function spinTick(){');
const skill=codeBetween('function skillHit(id){','function skillTick(dt){');
const combo=codeBetween('function comboStrike(move,part){','function comboMoveTick(dt,prev,frame,total){');
for(const bonus of [1,1.2,2,12]){
  for(const dist of [80,146,169,170,171,205,420]){
    const e=env(dist,bonus);vm.createContext(e.ctx);
    vm.runInContext(normal+'globalThis.hit=doHit;',e.ctx);
    e.ctx.hit('whip');
    assert.equal(e.hits.length>0,dist<=170,'basic '+dist+'px with rng='+bonus);
    assert.equal(e.effects[0]?.L,170,'basic visual '+dist+'px with rng='+bonus);
    scenarios++;
  }
}
for(const dist of [169,170,171,205,420]){
  const e=env(dist,10);vm.createContext(e.ctx);
  vm.runInContext(skill+'globalThis.hit=skillHit;',e.ctx);
  e.ctx.hit('pull');
  assert.equal(e.hits.length>0,dist<=170,'pull '+dist+'px');
  if(dist<=170)assert(e.effects.every(f=>f.L===170),'pull line > 170px');
  scenarios++;
}
for(const move of ['arc','spin','slam','rocks','dashLight','dashHeavy']){
  for(const dist of [169,170,171,205,340]){
    const e=env(dist,10);vm.createContext(e.ctx);
    vm.runInContext(combo+'globalThis.hit=comboStrike;',e.ctx);
    e.ctx.hit(move,0);
    assert.equal(e.hits.length>0,dist<=170,move+' combo '+dist+'px');
    const visual=e.effects.find(f=>f.k==='whipSweep');
    assert(visual&&visual.R===170,move+' visual radius '+visual?.R);
    scenarios++;
  }
}
assert(!html.includes('L=REACH.whip*ST.rng'),'gear stat extends basic whip');
assert(!html.includes('L=Math.min(f.L,REACH.whip*ST.rng)'),'gear stat extends visible whip');
assert(html.includes('L=Math.max(0,Math.min(f.L,REACH.whip)-6)*ext'),
  'tip centre must reserve half stroke width');
assert(html.includes('cx.arc(f.x,f.y,Math.max(0,f.R-5),a0,a1)'),
  'combo sweep outer stroke should stop at the same reach as hit collision');
console.log('PASS actual doHit/skillHit/comboStrike: '+scenarios+' reach/gear/visual tests');
