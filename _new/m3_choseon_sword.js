/* 전 무장 공통: 단일 짧은 입력 버퍼, 다중 예약 금지, 무기 속도별 연결 제한.
   초선 검의 3타 전용 모션·판정은 아래에서 별도로 유지한다. */
const CSWD={bufferMs:250,chainMs:820,linkAt:[0,.62,.67,.72],lightDur:[0,.40,.47,.62]};
const choseonSwordActive=()=>PLAY.active==='choseon'&&combatWeapon()==='sword';
const comboChainLimit=()=>Math.max(CSWD.chainMs,Math.ceil(CSWD.chainMs/Math.max(.5,heroWeapon()?.rate||1)));

const swordResetBase=comboReset;
comboReset=function(){swordResetBase();CB.swordStep=0;CB.swordLast=0;if(P){P.cbSwordPilot=false;P.cbSwordStage=0;}};

const swordPressBase=comboPress;
comboPress=function(kind){
  // 모든 무장에 동일 적용: 오래된 입력은 폐기, 연타는 한 번만 예약.
  if(CB.pending&&comboNow()-CB.pending.at>CSWD.bufferMs)CB.pending=null;
  if(P?.cbMove||CB.pending)return false;
  CB.queued.length=0;
  return swordPressBase(kind);
};

const swordCancelBase=comboCancelReady;
comboCancelReady=function(){
  if(!choseonSwordActive()||!P.cbSwordPilot||P.cbMove)return swordCancelBase();
  if(!P.atk||!P.cbAction||P.sk||P.skHit||!P.hitDone)return false;
  const key=dirKey(P.face)[0],e=A.man[P.atk]&&A.man[P.atk][key];
  return !!e&&P.atkT/e.frames>=(P.cbAction==='light'?CSWD.linkAt[P.cbSwordStage]||.67:.70);
};

const swordBeginBase=comboBegin;
comboBegin=function(entry,n,inp){
  if(!choseonSwordActive()){
    // 느린 무기는 공격 자체가 길다. 입력 예약은 짧게, 연계 기록만 공속에 맞춘다.
    if(entry.kind!=='dash'&&CB.last&&entry.at-CB.last>comboChainLimit())CB.seq='';
    return swordBeginBase(entry,n,inp);
  }
  if(entry.kind==='dash'){
    CB.swordStep=0;CB.swordLast=0;return swordBeginBase(entry,n,inp);
  }
  const chained=CB.swordStep>0&&entry.at-CB.swordLast<=CSWD.chainMs;
  const stage=entry.kind==='light'?(chained?CB.swordStep%3+1:1):0;
  const heavyFrom=entry.kind==='heavy'&&chained?CB.swordStep:0;
  // 기존 기술 구현·효과음은 유지. 실제 직전 약공격 단계에서만 강공격을 파생한다.
  CB.seq=({1:'LL',2:'LLL',3:'LLLL'})[heavyFrom]||'';
  CB.weapon='sword';CB.last=entry.at;
  const oldFace=P.face,d=comboDirection(inp),ok=swordBeginBase(entry,n,inp);
  if(!ok){CB.seq='';return false;}
  P.cbSwordPilot=true;P.cbSwordStage=stage;
  if(P.cbMove!=='spin'){
    // 가까운 적이 자동으로 공격 방향을 매번 돌려 버리는 현상을 차단한다.
    P.face=(inp.x||inp.y)?faceTo(d.x,d.y):oldFace;
    P.cbDir=d;P.cbAngle=Math.atan2(d.y,d.x);
    P.mAim={m:{x:P.x+d.x*220,y:P.y+d.y*220,scale:1},d:220,los:true};
  }
  if(entry.kind==='light'&&!P.cbMove){CB.swordStep=stage;CB.swordLast=entry.at;}
  else{CB.swordStep=0;CB.swordLast=0;}
  CB.seq='';
  return true;
};

const swordTickBase=comboTick;
comboTick=function(dt,n,inp){
  // 기존 5연타 예약 큐를 전 무장에서 사용하지 않는다.
  if(CB.queued.length)CB.queued.length=0;
  if(CB.dash){
    // 기존 대시 물리/이펙트만 유지한다. 입력 예약은 아래에서 독립 처리.
    const waiting=CB.pending;CB.pending=null;
    try{swordTickBase(dt,n,inp);}finally{CB.pending=waiting;}
  }
  const p=CB.pending;if(!p)return;
  if(comboNow()-p.at>CSWD.bufferMs){CB.pending=null;return;}
  if((!P.atk&&!P.sk&&!P.skHit)||comboCancelReady()){
    if(P.atk)comboReleaseAttack();
    CB.pending=null;comboBegin(p,n,inp);
  }
};

const swordDurationBase=comboAttackDuration;
comboAttackDuration=function(){
  if(!P.cbSwordPilot||P.cbWeapon!=='sword'||P.cbMove)return swordDurationBase();
  const base=P.cbAction==='light'?CSWD.lightDur[P.cbSwordStage]||.40:.68;
  return base/Math.max(.5,Math.min(2.5,Number(ST.attackSpeed)||1));
};

const swordHitBase=doHit;
doHit=function(w,mm){
  if(w!=='sword'||!P.cbSwordPilot||!choseonSwordActive())return swordHitBase(w,mm);
  if(M&&M.jarList)breakJars(125);
  const stage=P.cbAction==='light'?P.cbSwordStage:0;
  const a=P.cbAngle||0,reach=REACH.sword+(stage===3?25:stage===2?12:0);
  const power=(stage===1?.95:stage===2?1.05:stage===3?1.3:1.25)*(mm||1);
  const kb=stage===1?125:stage===2?170:stage===3?310:270;
  const half=stage===1?.85:stage===2?1.05:1.2;
  fx.push({k:stage>=2?'sweep':'slash',x:P.x,y:P.y-CH*.75,a,t:0,life:stage===3?.29:.21,R:reach+8,ha:half,col:'255,205,110',col2:'255,255,255'});
  for(const m of liveMobs()){
    const dx=m.x-P.x,dy=m.y-P.y,d=Math.hypot(dx,dy);
    if(d>reach+16+m.scale*14)continue;
    let da=Math.abs(Math.atan2(dy,dx)-a);if(da>Math.PI)da=2*Math.PI-da;
    if(da<half)hitMob(m,stat.atk()*power,'sword',kb,Math.atan2(dy,dx));
  }
  shake=Math.max(shake,stage===3?5:stage===2?3:2);
  if(stage===3)CM_AUDIO.haptic('combo');
};

const swordDrawBase=drawPlayer;
drawPlayer=function(){
  if(!choseonSwordActive()||!P.cbSwordPilot||P.atk!=='sword'||P.cbAction!=='light'||!P.cbSwordStage)
    return swordDrawBase();
  const key=dirKey(P.face)[0],e=A.man.sword&&A.man.sword[key];
  if(!e)return swordDrawBase();
  const original=P.atkT,p=Math.max(0,Math.min(1,original/e.frames));
  P.atkT=e.frames*((P.cbSwordStage-1+p)/3);
  try{return swordDrawBase();}finally{P.atkT=original;}
};
