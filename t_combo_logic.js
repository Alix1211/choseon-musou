// Browser binary가 없는 환경에서도 실제 조합기 코드를 그대로 평가하는 테스트.
const vm=require('node:vm');const fs=require('node:fs');const assert=require('node:assert/strict');
let now=1000;
const P={mode:'manual',hp:1000,face:'right',x:100,y:100,atk:null,sk:null,skHit:null,state:'idle'};
const ST={wt:'sword',rng:1,prc:0};
const ctx={
  performance:{now:()=>now},P,ST,UI:{mode:'battle',paused:false},CH:60,ULT:{active:false},
  fx:[],pops:[],orbs:[],shake:0,CB:undefined,
  faceTo:()=> 'right',
  manualAim:()=>({m:{x:200,y:100},d:100}),
  startAttack:(w)=>{P.atk=w;P.atkT=0;P.hitDone=false;},
  moveEnt:()=>{},rnd:(a,b)=>(a+b)/2,comboCast:()=>{},
  liveMobs:()=>[],stat:{atk:()=>100},hitMob:()=>{},
  console,
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('_new/m3_combo.js','utf8')+'\nthis.combo={CB,comboPress,comboTick,comboReset};',ctx);
const {CB,comboPress,comboTick,comboReset}=ctx.combo;
const tick=()=>{comboTick(.016,null,{x:0,y:0});};
const tap=(letter)=>{now+=330;assert.equal(comboPress(({L:'light',H:'heavy',D:'dash'})[letter]),true);tick();P.atk=null;P.cbAction=null;P.cbMove=null;};
for(const [seq,want] of [['LLH','arc'],['LLLH','pierce'],['LLLLH','spin'],['HHL','slam'],['HHHL','rocks'],['DL','dashLight'],['DH','dashHeavy']]){
  comboReset();CB.lastMove=null;for(const k of seq)tap(k);
  assert.equal(CB.lastMove,want,seq);console.log('PASS',seq,want);
}
for(const w of ['sword','whip','fan']){
  comboReset();CB.lastMove=null;ST.wt=w;for(const k of 'LLH')tap(k);
  assert.equal(CB.lastMove,'arc');assert.equal(P.cbWeapon,w);
  console.log('PASS weapon',w);
}
comboReset();CB.lastMove=null;
const accepted=CB.accepted;tap('L');
for(let i=0;i<100;i++){now+=16;tick();}
assert.equal(CB.accepted,accepted+1,'no auto input added');
comboReset();P.atk='sword';
assert.equal(comboPress('light'),true);
assert.equal(comboPress('heavy'),false,'second pending input is rejected');
assert.equal(CB.pending.kind,'light','pending input never overwritten');
now+=1000;tick();assert.equal(CB.pending,null,'expired input removed');
assert.equal(P.cbMove,null,'expired input did not start a move');
console.log('PASS no repeat / one-slot buffer / expiry');
