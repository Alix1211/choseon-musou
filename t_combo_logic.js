'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let now=5000;
const P={mode:'manual',hp:1000,face:'right',x:100,y:100,atk:null,sk:null,skHit:null,state:'idle'};
const ST={wt:'sword',rng:1,prc:0};
const c={
 performance:{now:()=>now},P,ST,UI:{mode:'battle',paused:false},CH:60,ULT:{active:false},
 A:{man:{sword:{right:{frames:10}},whip:{right:{frames:10}},fan:{right:{frames:10}},spinfan:{right:{frames:10}}}},
 fx:[],pops:[],orbs:[],shake:0,faceTo:()=> 'right',
 dirKey:()=>['right'],combatWeapon:()=>ST.wt,enemyArmored:()=>false,
 manualAim:()=>({m:{x:200,y:100},d:100}),
 startAttack:(w)=>{P.atk=w;P.atkT=0;P.hitDone=false;},
 moveEnt:()=>{},rnd:(a,b)=>(a+b)/2,liveMobs:()=>[],
 stat:{atk:()=>100},hitMob:()=>{},CM_AUDIO:{playVoice(){}},console
};
vm.createContext(c);
const html=fs.readFileSync('index.html','utf8');
const at=html.indexOf('const COMBO_TIMING='),end=html.indexOf('/* 무쌍',at);
assert(at>=0&&end>at,'generated combo timing markers must exist');
vm.runInContext(html.slice(at,end)+
 '\nglobalThis.testCombo={CB,comboPress,comboTick,comboReset,comboAttackDuration};',c);
const {CB,comboPress,comboTick,comboReset,comboAttackDuration}=c.testCombo;
const hitWindow=()=>{P.atkT=8.4;P.hitDone=true;c.testCombo.comboTick(.016,null,{x:0,y:0});};
function fast(seq,want){
 comboReset();CB.lastMove=null;P.atk=null;P.cbAction=null;P.cbMove=null;
 const before=CB.accepted;
 for(const k of seq){now+=65;assert.equal(comboPress(k==='L'?'light':'heavy'),true,seq+' input captured');}
 assert.equal(CB.accepted-before,seq.length,'every physical press must be counted');
 assert.equal(CB.queued.length,seq.length-1,'fast taps must wait in order');
 c.testCombo.comboTick(.016,null,{x:0,y:0});
 for(let i=1;i<seq.length;i++)hitWindow();
 assert.equal(CB.lastMove,want,seq+' must not confuse an extra light tap');
 assert.equal(CB.pending,null);
 assert.equal(CB.queued.length,0);
}
fast('LLLH','pierce');
fast('LLLLH','spin');
fast('LLH','arc');
fast('HHL','slam');
fast('HHHL','rocks');
// Taps made before the hit frame cannot skip ahead.
comboReset();P.atk='sword';P.cbAction='light';P.cbMove=null;P.atkT=7.9;P.hitDone=true;
assert.equal(comboPress('light'),true);assert.equal(comboPress('heavy'),true);
c.testCombo.comboTick(.016,null,{x:0,y:0});
assert.equal(P.cbAction,'light','no early cancel at 79%');
P.atkT=8.3;hitWindow();assert.equal(P.cbAction,'light','follow-up stays light');
hitWindow();assert.equal(P.cbAction,'heavy','next buffered tap stays ordered');
// A finite five-tap buffer prevents runaway auto attacks.
comboReset();P.atk='sword';P.cbAction='light';P.cbMove=null;P.atkT=0;P.hitDone=false;
for(let i=0;i<5;i++)assert.equal(comboPress('light'),true);
assert.equal(comboPress('heavy'),false,'sixth press exceeds bounded buffer');
assert.equal(CB.queued.length,4);
now+=3700;c.testCombo.comboTick(.016,null,{x:0,y:0});
assert.equal(CB.pending,null,'stale input expires');
assert.equal(CB.queued.length,0,'stale buffer clears together');
comboReset();assert.equal(CB.queued.length,0);
P.cbAction='light';ST.attackSpeed=undefined;
assert.equal(comboAttackDuration(),.54,'current light attack timing remains');
P.cbAction='heavy';assert.equal(comboAttackDuration(),.75,'current heavy attack timing remains');
console.log('PASS rapid LLH/LLLH/LLLLH/HHL/HHHL, ordered five-tap queue, 82% hit guard, expiry and unchanged attack duration');
