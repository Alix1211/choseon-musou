'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

// 실제 mkCol 코드로 예약 시 AI·임무·미니맵용 배열이 바뀌지 않는지 검증.
const src=fs.readFileSync('_new/m3_gen.js','utf8');
const a=src.indexOf('const SOLD='),b=src.indexOf('function nearWalk',a);
assert(a>=0&&b>a);
const m={W:200,H:200,seen:new Uint8Array(40000).fill(1),colonies:[]};
const mobs=[];
const c={M:m,mobs,TS:64,rnd:(min,max)=>(min+max)/2,
  blockedAt:()=>false,pickWeighted:weights=>weights[0][0],
  createMob:(type,set,x,y,col,elite)=>({type,set,x,y,col,elite}),Math};
vm.createContext(c);
vm.runInContext(src.slice(a,b)+'\nglobalThis.colTest={mkCol,activateReservedColony};',c);
const {mkCol,activateReservedColony}=c.colTest;
const reserve=mkCol(25,25,{n:6,leader:true,set:'0',reserve:true});
assert.equal(mobs.length,0,'reserved wave must not enter combat mob list');
assert.equal(m.colonies.length,0,'reserved wave must not affect mission colony list');
assert.equal(reserve.mobs.length,7,'six troops and leader must be retained');
const normal=mkCol(30,30,{n:4,leader:true,set:'0'});
assert.equal(mobs.length,5,'normal colony still registers on creation');
activateReservedColony(reserve);
assert.equal(mobs.length,12,'activation registers the complete reserved wave once');
assert.equal(m.colonies.length,2);
assert.equal(reserve.idx,1,'colony ID assigned on activation');
assert.equal(reserve.mobs[0].col,reserve,'reserved members keep their original colony');
activateReservedColony(reserve);
assert.equal(mobs.length,12,'double activation never duplicates troops');
assert.equal(normal.idx,0);

// 에셋 사전 제작은 프레임당 하나씩만 처리한다.
const prep=fs.readFileSync('_new/m3_perf_opt.js','utf8');
const ws={M:{musou:true,wei:null,defense05:null},P:{mode:'tele_in'},mobs:[{type:'spear',set:'0'}],
  A:{mj:{mobs:{'0':{spear:{front:{},side:{},back:{}}}}},soldierWalk:{},walk:{}},
  MT:{spear:{}},SOLDIER_WALK:{},WALK:{},white:new Map(),
  performance:{now:(()=>{let ms=0;return ()=>++ms;})()},
  whiteMob(set,type,dir){this.white?.set(set+type+dir,{});},
  whiteWalk(){},whiteCachePut(){},Math,window:{},console};
// The actual built-in function is a global; don't rely on `this` in VM callbacks.
ws.whiteMob=(set,type,dir)=>ws.white.set(set+type+dir,{});
vm.createContext(ws);
vm.runInContext(prep+'\nglobalThis.prepTest={cmPrepareFrame,CM_PREP};',ws);
ws.prepTest.cmPrepareFrame(0);
assert.equal(ws.white.size,1,'prewarm must generate at most one sprite per frame');
ws.prepTest.cmPrepareFrame(0);ws.prepTest.cmPrepareFrame(0);
assert.equal(ws.white.size,3,'prewarm spreads flash masks across frames');
console.log('PASS reserved reinforcement counts, deferred registration and per-frame hit-mask preparation');
