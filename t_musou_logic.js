// 게임 필살기 원본 코드를 VM에 넣어 충전, 1회 발동, 낙하 횟수와 동결을 검사한다.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const S={ultCharge:0},P={mode:'manual',hp:2000,state:'idle',atk:null,cbMove:null,cbAction:null},
 M={W:60,H:60},UI={mode:'battle',paused:false},hits=[],saved=[],sound=[];
const ctx={S,P,M,UI,ULT:undefined,CH:60,TS:70,VW:844,VH:390,Z:1,cam:{x:1500,y:1500},
  Image:class{constructor(){this.complete=true;this.naturalWidth=100;this.naturalHeight=120;}},
  save:()=>saved.push(S.ultCharge),comboReset:()=>{},
  liveMobs:()=>[{x:1500,y:1500,scale:1,dead:false,stun:0,boss:false}],
  rnd:(a,b)=>(a+b)/2,clamp:(x,a,b)=>Math.min(b,Math.max(a,x)),
  stat:{atk:()=>100},hitMob:(m,power)=>hits.push(power),pops:[],CM_AUDIO:{play:n=>sound.push(n)},shake:0,
  console,
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('_new/m3_musou.js','utf8')+'\nthis.ult={ULT,musouGainKill,musouStart,musouTick}',ctx);
const {ULT,musouGainKill,musouStart,musouTick}=ctx.ult;
for(let i=0;i<34;i++)musouGainKill({});
assert.ok(S.ultCharge>95&&S.ultCharge<100,'34 field kills under full');
assert.equal(musouStart(),false,'not charged: forbidden');
musouGainKill({});assert.equal(S.ultCharge,100,'35 field kills fill gauge');
assert.equal(musouStart(),true,'charged musou starts');
assert.equal(S.ultCharge,0,'meter consumed once');assert.equal(musouStart(),false,'no repeated activation');
assert.equal(ULT.phase,'portrait');assert.equal(ULT.meteors.length,15);
musouTick(.6);assert.equal(ULT.phase,'portrait','portrait freezes briefly');
assert.equal(hits.length,0,'no hits before portrait ends');
musouTick(.15);assert.equal(ULT.phase,'rain','portrait transitions to meteor shower');
for(let i=0;i<200&&ULT.active;i++)musouTick(.04);
assert.equal(ULT.active,false,'meteor animation finishes');
assert.ok(hits.length>0,'meteor impacts hit mobs');
assert.ok(sound.filter(x=>x==='explosion').length>=15,'15 staggered explosions');
assert.equal(musouGainKill({boss:true}),undefined);
assert.equal(S.ultCharge,15,'boss charging weight');
console.log('PASS 35 kill gauge / manual gate / single-use / cut-in / 15 impacts / damage');
