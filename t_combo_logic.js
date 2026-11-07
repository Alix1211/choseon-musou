'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let now=5000,rate=1;
const P={mode:'manual',hp:1000,face:'right',x:100,y:100,atk:null,sk:null,skHit:null,state:'idle'};
const ST={wt:'sword',rng:1,prc:0};
const PLAY={active:'zhenji'};
const c={
 performance:{now:()=>now},P,ST,PLAY,UI:{mode:'battle',paused:false},CH:60,ULT:{active:false},
 A:{man:{sword:{right:{frames:10}},whip:{right:{frames:10}},fan:{right:{frames:10}},spinfan:{right:{frames:10}}}},
 fx:[],pops:[],orbs:[],shake:0,faceTo:()=> 'right',
 dirKey:()=>['right'],combatWeapon:()=>ST.wt,heroWeapon:()=>({rate}),enemyArmored:()=>false,
 manualAim:()=>({m:{x:200,y:100},d:100}),
 startAttack:(w)=>{P.atk=w;P.atkT=0;P.hitDone=false;},
 moveEnt:()=>{},rnd:(a,b)=>(a+b)/2,liveMobs:()=>[],
 stat:{atk:()=>100},hitMob:()=>{},CM_AUDIO:{playVoice(){},haptic(){}},console
};
vm.createContext(c);
const html=fs.readFileSync('index.html','utf8');
const at=html.indexOf('const COMBO_TIMING='),end=html.indexOf('/* 무쌍',at);
assert(at>=0&&end>at,'generated combo timing markers must exist');
const overlay=fs.readFileSync('_new/m3_choseon_sword.js','utf8');
const overlayEnd=overlay.indexOf('const swordDurationBase=');
assert(overlayEnd>0,'unified input wrappers must exist');
vm.runInContext(html.slice(at,end)+overlay.slice(0,overlayEnd)+
 '\nglobalThis.testCombo={CB,comboPress,comboTick,comboReset,comboAttackDuration};',c);
const {CB,comboPress,comboTick,comboReset,comboAttackDuration}=c.testCombo;
const tick=()=>comboTick(.016,null,{x:0,y:0});
const clear=()=>{comboReset();CB.lastMove=null;P.atk=null;P.cbAction=null;P.cbMove=null;P.sk=null;P.skHit=null;rate=1;};
const tap=kind=>{assert.equal(comboPress(kind==='L'?'light':'heavy'),true);tick();};
const follow=(kind,delay=220)=>{
 now+=delay;P.atkT=8.5;P.hitDone=true;
 assert.equal(comboPress(kind==='L'?'light':'heavy'),true);
 tick();
};
function sequence(seq,want,weapon='whip'){
 clear();PLAY.active='zhenji';ST.wt=weapon;
 tap(seq[0]);
 for(const k of seq.slice(1))follow(k);
 assert.equal(CB.lastMove,want,seq+' must require separate timed physical taps');
 assert.equal(CB.pending,null);
 assert.equal(CB.queued.length,0);
}
sequence('LLH','arc');
sequence('LLLH','pierce');
sequence('LLLLH','spin');
sequence('HHL','slam');
sequence('HHHL','rocks');
sequence('LLH','arc','fan');

// A burst of taps does not queue a forced combo. A single tap can be buffered briefly.
clear();ST.wt='whip';PLAY.active='zhenji';
assert.equal(comboPress('light'),true);
for(let i=0;i<5;i++)assert.equal(comboPress(i%2?'heavy':'light'),false);
assert.equal(CB.queued.length,0,'the old five-tap queue is disabled');
tick();assert.equal(P.cbAction,'light');
now+=50;P.atkT=2;P.hitDone=false;
assert.equal(comboPress('heavy'),true,'one short early tap is allowed');
assert.equal(comboPress('light'),false,'no second pending tap');
tick();assert.equal(P.cbAction,'light','early tap cannot cancel before hit');
now+=500;tick();assert.notEqual(CB.pending,null,'500ms render freeze cannot discard an unprocessed attack input');
for(let i=0;i<16;i++)tick();
assert.equal(CB.pending,null,'250ms of running combat time expires unused input');
P.atkT=8.5;P.hitDone=true;tick();
assert.equal(P.cbAction,'light','expired heavy never attacks automatically');

// Slow heroes get a longer combo-history window, not a longer input buffer.
clear();ST.wt='sword';PLAY.active='yinping';rate=.68;
tap('H');follow('H',1050);follow('L',1050);
assert.equal(CB.lastMove,'slam','slow hero retains a deliberate HHL combo');
clear();ST.wt='whip';PLAY.active='wangyi';rate=1.62;
tap('L');follow('L',1030);follow('H',180);
assert.notEqual(CB.lastMove,'arc','stale combo history resets for fast hero');

clear();P.cbAction='light';ST.attackSpeed=undefined;
assert.equal(comboAttackDuration(),.54);
P.cbAction='heavy';assert.equal(comboAttackDuration(),.75);
console.log('PASS all-weapon 250ms single input, no forced queued combos, deliberate LLH/LLLH/LLLLH/HHL/HHHL and speed-aware chain');
