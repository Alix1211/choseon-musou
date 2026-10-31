/* 수동 벨트액션 조합기. 실제 누름 한 번에 입력 하나, 대기 슬롯 하나만 허용. */
const CB={pending:null,seq:'',last:0,weapon:null,dashUntil:0,dash:null,accepted:0,lastMove:null,activated:0};
const COMBO_MOVES={LLH:'arc',LLLH:'pierce',LLLLH:'spin',HHL:'slam',HHHL:'rocks'};
const comboNow=()=>performance.now();
function comboReset(){CB.pending=null;CB.seq='';CB.last=0;CB.dashUntil=0;CB.dash=null;if(P){P.cbMove=null;P.cbAction=null;P.cbRushHit=null;}}
function comboPress(kind){
  if(!P||UI.mode!=='battle'||UI.paused||P.mode!=='manual'||P.hp<=0||P.sk||P.skHit)return false;
  if(CB.pending)return false;                       // 대기 슬롯을 덮어쓰거나 누적하지 않는다
  CB.pending={kind,at:comboNow()};CB.accepted++;
  return true;
}
function comboDirection(inp){
  if(inp&&(inp.x||inp.y)){const l=Math.hypot(inp.x,inp.y)||1;return {x:inp.x/l,y:inp.y/l};}
  const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.face]||[0,1];
  return {x:d[0],y:d[1]};
}
/* 타격 판정 이후 동작의 끝 28%는 다음 입력으로 연결한다.
   공격속도 장비가 추가되어도 애니메이션 진행률을 기준으로 판정한다. */
function comboCancelReady(){
  if(!P.atk||!P.cbAction||P.cbMove||P.sk||P.skHit||!P.hitDone)return false;
  const key=dirKey(P.face)[0],e=A.man[P.atk]&&A.man[P.atk][key];
  return !!e&&P.atkT/e.frames>=.72;
}
function comboReleaseAttack(){
  P.atk=null;P.state='idle';P.mAim=null;P.cbAction=null;P.cbMove=null;
}
function comboBegin(entry,n,inp){
  const now=comboNow(),kind=entry.kind;
  if(P.atk||P.sk||P.skHit)return false;
  if(kind==='dash'){
    const d=comboDirection(inp);CB.seq='';CB.last=0;CB.dash={...d,t:0};CB.dashUntil=now+420;
    P.face=faceTo(d.x,d.y);P.state='move';
    fx.push({k:'shock',x:P.x,y:P.y,R:65,t:0,life:.22,small:true});
    return true;
  }
  const w=ST.wt,letter=kind==='light'?'L':'H';
  let move=null;
  if(CB.dashUntil>now){move=kind==='light'?'dashLight':'dashHeavy';CB.dashUntil=0;CB.seq='';}
  else{
    if(w!==CB.weapon||now-CB.last>1550)CB.seq='';
    CB.seq+=letter;
    move=COMBO_MOVES[CB.seq]||null;
    if(move)CB.seq='';
    else if(!['L','LL','LLL','LLLL','H','HH','HHH'].includes(CB.seq))CB.seq=letter;
  }
  CB.weapon=w;CB.last=now;
  const aim=manualAim(n,inp,w),d=comboDirection(inp);
  if(move==='spin'){startAttack('spinfan',null);P.mAim=null;}
  else{startAttack(w,aim.m);P.mAim=aim;}
  P.cbAction=kind;P.cbMove=move;P.cbWeapon=w;P.cbDir=d;P.cbAngle=Math.atan2(aim.m.y-P.y,aim.m.x-P.x);
  P.cbRushHit=new Set();P.cbTriple=0;
  if(move){
    CB.lastMove=move;CB.activated++;
    const labels={
      sword:{arc:'부채꼴 검기',pierce:'일직선 돌파',spin:'폭풍 회전',slam:'대지 강타',rocks:'암석 폭발',dashLight:'질풍 삼연격',dashHeavy:'충격 착지'},
      whip:{arc:'부채꼴 전격',pierce:'번개 돌파',spin:'뇌전 폭풍',slam:'전기 충격',rocks:'낙뢰 확산',dashLight:'전광 삼연타',dashHeavy:'전격 착지'},
      fan:{arc:'부채꼴 마법탄',pierce:'마력 관통',spin:'마력 회오리',slam:'마법 충격파',rocks:'마력 파편 폭발',dashLight:'마법 삼연사',dashHeavy:'마력 착지'}
    };
    const name=(w==='whip'?'⚡ ':w==='fan'?'✦ ':'')+labels[w][move];
    pops.push({x:P.x,y:P.y-CH*2.15,t:0,txt:name,col:w==='whip'?'#91edff':w==='fan'?'#e2aeff':'#ffe29d',size:17,vy:-38});
  }
  return true;
}
function comboTick(dt,n,inp){
  if(CB.dash){
    const d=CB.dash;d.t+=dt;
    moveEnt(P,d.x*730*dt,d.y*730*dt,18);
    fx.push({k:'sp2',x:P.x+rnd(-12,12),y:P.y-22+rnd(-12,12),vx:-d.x*45,vy:-60,t:0,life:.2});
    if(d.t>=.18)CB.dash=null;
  }
  if(CB.pending){
    const p=CB.pending;
    if(comboNow()-p.at>950){CB.pending=null;}
    else if((!P.atk&&!P.sk&&!P.skHit)||comboCancelReady()){
      if(P.atk)comboReleaseAttack();
      CB.pending=null;comboBegin(p,n,inp);
    }
  }
}
function comboAttackDuration(){
  const base=P.cbMove==='spin'?2.24:P.cbMove==='pierce'?.84:P.cbMove==='dashLight'?.76:P.cbMove==='rocks'?.96:P.cbAction==='light'?.38:.54;
  /* 장비 공속 배율은 나중에 추가해도 콤보 입력 판정과 독립적이다. */
  const rate=Math.max(.5,Math.min(2.5,Number(ST.attackSpeed)||1));
  return base/rate;
}
function comboFps(e){
  if(!P.cbAction)return e.fps*SPD[P.atk]*(P.slowT>0?.6:1);
  return e.frames/comboAttackDuration()*(P.slowT>0?.65:1);
}
function comboDamage(m,power,kb,ang,stun){
  const w=P.cbWeapon||ST.wt;
  hitMob(m,stat.atk()*power*(w==='fan'?.78:w==='whip'?.85:1),w,kb,ang);
  if(!m.dead&&!m.boss&&stun)m.stun=Math.max(m.stun,stun);
}
/* 채찍은 원거리 전격 발사체가 아닌 초선 주변의 물리적인 휘두르기 궤적을 쓴다. */
function comboStrike(move,part){
  const w=P.cbWeapon||ST.wt,a=P.cbAngle||0,px=P.x,py=P.y,ct=Math.cos(a),st=Math.sin(a),list=liveMobs();
  const radial=move==='spin'||move==='slam'||move==='rocks'||move==='dashHeavy';
  const radius=w==='whip'?REACH.whip:move==='spin'?285:move==='rocks'?340:move==='slam'?218:move==='dashHeavy'?160:move==='dashLight'?165:w==='fan'?440:240;
  const power=move==='spin'?.67:move==='rocks'?2.3:move==='slam'?1.7:move==='dashHeavy'?1.05:move==='dashLight'?.65:move==='arc'?1.7:1.8;
  const kb=move==='dashHeavy'?470:move==='slam'||move==='rocks'?390:move==='spin'?240:move==='dashLight'?135:225;
  if(w==='whip')fx.push({k:'whipSweep',x:px,y:py,t:0,life:.30,R:radius,a,radial,ha:move==='arc'?1.18:.78});
  else fx.push({k:radial?'shock':'sweep',x:px,y:radial?py:py-CH*.3,t:0,life:.32,R:radius,a,ha:move==='arc'?1.18:.54,col:w==='fan'?'170,105,255':'255,205,110',col2:'255,255,255',small:move==='dashHeavy'});
  if(w==='fan'&&(move==='arc'||move==='dashLight')){
    const count=move==='arc'?5:3;
    for(let i=0;i<count;i++){
      const aa=a+(i-(count-1)/2)*.2;
      orbs.push({x:px+Math.cos(aa)*35,y:py-CH+Math.sin(aa)*35,vx:Math.cos(aa)*580,vy:Math.sin(aa)*580,t:0,hit:new Set(),left:2+ST.prc,m:.55});
    }
  }
  for(const m of list){
    const dx=m.x-px,dy=m.y-py,d=Math.hypot(dx,dy),da=Math.atan2(dy,dx),dot=dx*ct+dy*st;
    let delta=Math.abs(da-a);if(delta>Math.PI)delta=2*Math.PI-delta;
    const within=d<=(w==='whip'?radius:radius+m.scale*12);
    const fits=radial?within:move==='arc'?within&&delta<1.20:move==='dashLight'?within&&delta<.95:dot>0&&within&&delta<.58;
    if(!fits)continue;
    comboDamage(m,power,kb,da,move==='slam'?.9:move==='rocks'?1.2:move==='dashHeavy'?.4:w==='whip'?.45:0);
  }
  if(move==='rocks')for(let i=0;i<19;i++){
    const q=i*Math.PI*2/19;
    fx.push({k:'deb',x:px+Math.cos(q)*rnd(10,60),y:py-18,vx:Math.cos(q)*rnd(90,330),vy:-rnd(120,380),t:0,life:rnd(.38,.7)});
  }
  if(w==='fan')fx.push({k:'ring',x:px,y:py-25,t:0,life:.3,R:radius*.6});
  shake=Math.max(shake,move==='rocks'?10:move==='slam'?7:move==='dashHeavy'?5:3);
}
function comboMoveTick(dt,prev,frame,total){
  const move=P.cbMove;
  if(move==='pierce'){
    const d=P.cbDir,u=frame/total;
    if(u<.88){moveEnt(P,d.x*650*dt,d.y*650*dt,18);fx.push({k:'sp2',x:P.x,y:P.y-CH,vx:-d.x*60,vy:-90,t:0,life:.23});}
    for(const m of liveMobs()){
      if(P.cbRushHit.has(m)||Math.hypot(m.x-P.x,m.y-P.y)>(P.cbWeapon==='whip'?Math.min(REACH.whip,100+m.scale*15):100+m.scale*15))continue;
      P.cbRushHit.add(m);comboDamage(m,2.1,320,Math.atan2(m.y-P.y,m.x-P.x),P.cbWeapon==='whip'?.6:0);
    }
  }else if(move==='dashLight'){
    const thresholds=[.23,.47,.71];
    while(P.cbTriple<3&&frame/total>=thresholds[P.cbTriple]){
      comboStrike('dashLight',P.cbTriple);P.cbTriple++;
    }
  }
}
