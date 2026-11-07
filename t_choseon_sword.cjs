'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let clock=1000;
const hits=[],moves=[],frames=[];
const P={mode:'manual',hp:100,face:'left',x:10,y:20,atk:null,cbAction:null,cbMove:null,hitDone:false};
const CB={pending:null,queued:[],seq:'',last:0,weapon:null,dashUntil:0,dash:null,accepted:0};
const ST={wt:'sword',attackSpeed:1};
const PLAY={active:'choseon'};
const c={P,CB,ST,PLAY,performance:{now:()=>clock},UI:{mode:'battle',paused:false},ULT:{active:false},
  A:{man:{sword:{side:{frames:42}},spinfan:{front:{frames:72}}}},CH:80,REACH:{sword:146},M:{jarList:[]},
  fx:[],shake:0,CM_AUDIO:{haptic:()=>{}},stat:{atk:()=>100},Math,console,
  faceTo:()=> 'right',dirKey:()=> ['side'],combatWeapon:()=> ST.wt,heroWeapon:()=>({rate:PLAY.active==='yinping'?.68:1}),
  comboNow:()=>clock,comboDirection:()=>({x:-1,y:0}),
  comboReleaseAttack(){P.atk=null;P.cbAction=null;P.cbMove=null;},
  comboReset(){CB.pending=null;CB.queued.length=0;CB.seq='';CB.last=0;},
  comboPress(kind){if(CB.pending)CB.queued.push({kind,at:clock});else CB.pending={kind,at:clock};CB.accepted++;return true;},
  comboCancelReady(){return !!P.hitDone&&P.atkT/42>=.82;},
  comboBegin(entry){
    let move=null;
    if(entry.kind==='heavy')move=({LLH:'arc',LLLH:'pierce',LLLLH:'spin'})[CB.seq+'H']||null;
    moves.push({kind:entry.kind,combo:move,seq:CB.seq});
    P.atk=move==='spin'?'spinfan':'sword';P.atkT=0;P.cbAction=entry.kind;
    P.cbMove=move;P.cbWeapon='sword';P.hitDone=false;P.face='right';
    return true;
  },
  comboTick(){},comboAttackDuration(){return P.cbAction==='light'?.54:.75;},
  doHit(){hits.push('old');},drawPlayer(){frames.push(P.atkT);},
  liveMobs:()=>[{x:-90,y:20,scale:1}],hitMob:(...args)=>hits.push(args),
  breakJars:()=>{},shake:0,
};
vm.createContext(c);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'_new/m3_choseon_sword.js'),'utf8'),c);
const ctl=vm.runInContext('({comboPress,comboTick,comboReset,comboAttackDuration,comboCancelReady,comboBegin,doHit,drawPlayer})',c);
const tick=()=>ctl.comboTick(.016,null,{x:0,y:0});
const press=k=>ctl.comboPress(k);
const ready=()=>{P.atkT=42*.75;P.hitDone=true;tick();};

assert(press('light'));tick();assert.equal(P.cbSwordStage,1);
assert.equal(ctl.comboAttackDuration(),.40);
P.atkT=42*.5;ctl.drawPlayer();assert(frames.at(-1)<10,'1타는 검 시트 초반 구간 사용');
clock+=100;assert(press('light'));
assert.equal(press('light'),false,'입력 두 번을 장기 보관하지 않음');
ready();assert.equal(P.cbSwordStage,2);assert.equal(ctl.comboAttackDuration(),.47);
P.atkT=42*.5;ctl.drawPlayer();assert(frames.at(-1)>18&&frames.at(-1)<24,'2타는 중간 구간');
clock+=140;assert(press('light'));ready();assert.equal(P.cbSwordStage,3);
assert.equal(ctl.comboAttackDuration(),.62);
P.atkT=42*.5;ctl.drawPlayer();assert(frames.at(-1)>32,'3타는 마지막 구간');
assert.equal(P.face,'left','일반 검술 중 자동 타겟 방향 변경 없음');
clock+=130;assert(press('heavy'));ready();assert.equal(moves.at(-1).combo,'spin','3타 강공격만 회전 파생');

ctl.comboReset();P.atk=null;P.cbMove=null;P.face='left';clock+=1000;
assert(press('heavy'));tick();assert.equal(moves.at(-1).combo,null,'단독 강공격은 연속기가 아님');
P.atkT=42*.45;P.hitDone=true;ctl.doHit('sword',1);
assert.equal(hits.length,1);assert.equal(hits[0][3],270);

ctl.comboReset();P.atk='sword';P.cbAction='light';P.cbMove=null;P.hitDone=false;
clock+=10;assert(press('light'));clock+=500;tick();
assert.notEqual(CB.pending,null,'렌더링 멈춤만으로 공격 입력이 사라지면 안 됨');
for(let i=0;i<16;i++)tick();
assert.equal(CB.pending,null,'실제 게임 진행 250ms 후 예약 입력 소멸');
assert.equal(CB.queued.length,0,'예약 큐에 공격이 남지 않음');

PLAY.active='zhenji';ST.wt='fan';ctl.comboReset();P.atk=null;
assert(press('light'));assert.equal(press('heavy'),false,'다른 영웅도 입력 중복 예약을 거절');
assert.equal(CB.queued.length,0,'모든 무장에서 예약 큐 비활성화');
for(const id of ['wenji','wangyi','xiaoqiao','daqiao','shangxiang','yinping','xingcai','yueying']){
  PLAY.active=id;ST.wt=id==='wangyi'?'whip':'fan';ctl.comboReset();P.atk=null;P.cbMove=null;
  assert(press('light'),id+' first press');
  assert.equal(press('heavy'),false,id+' must not queue repeated taps');
  assert.equal(CB.queued.length,0,id+' no automatic combo queue');
}
console.log('PASS 초선 검 3타·파생 강공격·버퍼 소멸·방향 고정·9명 전원 단일 입력');
