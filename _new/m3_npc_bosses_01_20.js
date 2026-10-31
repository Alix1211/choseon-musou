/* NPC 반란군 1~20판: 기존 나라별 보행/기마 원본을 재사용하는 최종 수문장.
 * 기존 판별 기믹은 그대로 두고, 이 NPC를 이긴 뒤에만 장수가 등장한다. */
const NPC_STAGE_BOSSES={
  1:{name:'NPC 하비문지기',type:'spear',color:[245,88,65],skills:['quake']},
  2:{name:'NPC 망루감독관',type:'bow',color:[111,189,255],skills:['burst']},
  3:{name:'NPC 독연관리관',type:'bow',color:[175,101,235],skills:['poison']},
  4:{name:'NPC 군량집행관',type:'spear',color:[243,86,67],skills:['quake']},
  5:{name:'NPC3',type:'cav',color:[249,78,71],main:true,skills:['quake','charge']},
  6:{name:'NPC 포획감찰관',type:'spear',color:[172,100,237],skills:['bind']},
  7:{name:'NPC 설원매복장',type:'bow',color:[124,195,255],skills:['ice']},
  8:{name:'NPC 암문파수장',type:'spear',color:[128,195,252],skills:['shield']},
  9:{name:'NPC 허창성문장',type:'spear',color:[252,103,78],skills:['quake']},
  10:{name:'NPC8',type:'cav',color:[114,185,255],main:true,skills:['shield','ice']},
  11:{name:'NPC 화선감독관',type:'bow',color:[252,117,56],skills:['fire']},
  12:{name:'NPC 합비결투장',type:'spear',color:[131,199,255],skills:['vortex']},
  13:{name:'NPC 밀실감시관',type:'bow',color:[179,112,240],skills:['poison']},
  14:{name:'NPC 야습기장',type:'spear',color:[114,192,253],skills:['charge']},
  15:{name:'NPC12',type:'cav',color:[179,88,231],main:true,skills:['poison','vortex']},
  16:{name:'NPC 기관수비장',type:'spear',color:[112,178,245],skills:['shield']},
  17:{name:'NPC 철쇄선단장',type:'bow',color:[250,100,60],skills:['fire']},
  18:{name:'NPC 금망포획관',type:'spear',color:[181,107,239],skills:['bind']},
  19:{name:'NPC 건업감찰장',type:'bow',color:[111,193,252],skills:['burst']},
  20:{name:'NPC17',type:'cav',color:[64,214,206],main:true,skills:['vortex','burst']}
};

function npcStageInit(m){
  if(!m.sp.last||m.n<1||m.n>20)return;
  const d=NPC_STAGE_BOSSES[m.n],b=m.captain;
  if(!d||!b)throw new Error('NPC 보스 배치 실패: '+m.n+'판');
  b.npcBoss=true;b.npcBossDef=d;b.npcShield=0;b.npcShieldUses=0;b.npcSkillCd=3.1;
  b.npcSkillIx=0;b.npcCast=null;b.npcBlockPop=0;
  // createMob의 elite 3.4배와 mkCol의 captain 2.4배가 이미 적용된 상태.
  // 목표 수치는 이 곱셈을 먼저 되돌린 '같은 병과 일반병' 대비 배수다.
  b.hp=b.maxHp=b.hp/(3.4*2.4)*(d.main?8:5);
  b.atk=b.atk/1.5*2;
  b.scale=b.scale/1.18*1.2;
  m.npcBoss=b;m.npcBossCleared=false;m.npcWhirls=[];
  // 참조는 m.heroes에 유지하되 실제 전투/그림 목록에는 보스 격파 전까지 넣지 않는다.
  for(const h of m.heroes){const i=mobs.indexOf(h);if(i>=0)mobs.splice(i,1);h.npcWaiting=true;}
}
function npcStageBossDefeated(b){
  if(!M||!b.npcBoss||M.npcBossCleared)return;
  M.npcBossCleared=true;M.npcWhirls.length=0;
  bossBurst(b);
  showBanner(b.npcBossDef.name+' 격파',2.3);
}
function npcStageHeroesAppear(){
  if(!M||!M.npcBossCleared||M.npcHeroesShown)return;
  M.npcHeroesShown=true;
  for(const h of M.heroes){if(!h.npcWaiting)continue;h.npcWaiting=false;if(!mobs.includes(h))mobs.push(h);}
  if(M.heroes.length)showBanner('내성 장수 등장',2.1);
}
function npcShieldHit(m){
  if(time-(m.npcBlockPop||0)>.45){m.npcBlockPop=time;pops.push({x:m.x,y:m.y-mobH(m)*m.scale*.7,t:0,txt:'보호막!',col:'#b7eaff',size:16,vy:-25});}
}
function npcBossTick(m,dt){
  if(m.dead||m.down||!m.col.woken||!['manual','hunt'].includes(P.mode))return false;
  m.npcShield=Math.max(0,(m.npcShield||0)-dt);
  if(m.npcCast){
    m.hurt=Math.max(0,m.hurt-dt);m.stun=Math.max(0,m.stun-dt);
    m.npcCast.left-=dt;m.wind=Math.max(0,m.npcCast.left);m.moving=false;
    if(m.npcCast.left<=0){const k=m.npcCast.k;m.npcCast=null;npcBossUse(m,k);m.npcSkillCd=m.npcBossDef.main?6.6:9.3;m.cd=Math.max(m.cd,.8);}
    return true;
  }
  if(m.npcShield>0){m.hurt=Math.max(0,m.hurt-dt);m.stun=Math.max(0,m.stun-dt);m.moving=false;m.wind=0;return true;}
  m.npcSkillCd-=dt;
  const dist=Math.hypot(P.x-m.x,P.y-m.y);
  if(m.npcSkillCd<=0&&dist<610&&hasLOS(m.x,m.y,P.x,P.y)){
    const skills=m.npcBossDef.skills;
    let k=skills[m.npcSkillIx++%skills.length];
    if(k==='shield'&&m.npcShieldUses>=(m.npcBossDef.main?2:1)){k=skills.find(v=>v!=='shield')||'burst';}
    m.intent=null;m.charge=null;
    m.npcCast={k,left:k==='quake'?.68:.56};m.wind=m.npcCast.left;
    m.face=faceTo(P.x-m.x,P.y-m.y);
    m.hurt=Math.max(0,m.hurt-dt);m.stun=Math.max(0,m.stun-dt);
    return true;
  }
  // 다른 적의 공격 주기는 변경하지 않고, NPC 보스만 행동을 조금 더 자주 한다.
  if(m.cd>0)m.cd=Math.max(0,m.cd-dt*.2);
  return false;
}
function npcBossUse(m,k){
  if(!M||m.dead)return;
  const d=m.npcBossDef,dx=P.x-m.x,dy=(P.y-m.y)/YR,a=Math.atan2(dy,dx),col=d.color;
  if(k==='shield'){
    m.npcShield=1.4;m.npcShieldUses++;
    fx.push({k:'shock',x:m.x,y:m.y-48,R:100,t:0,life:.38,small:true});
  }else if(k==='quake'){
    addZone({k:'circle',x:m.x,y:m.y,r:d.main?210:155,life:.12,dmg:m.atk*1.05,kb:190,fx:'slam',pressureOwner:m});
  }else if(k==='vortex'){
    if(M.npcWhirls.length)M.npcWhirls.length=0;
    M.npcWhirls.push({x:m.x+Math.cos(a)*95,y:m.y+Math.sin(a)*YR*95,t:0,life:2.8,r:d.main?94:72,color:col,damage:m.atk*.52,nextHit:new Map(),owner:m});
  }else if(k==='charge'){
    m.charge={a,left:d.main?390:250,hit:new Set(),speed:d.main?670:560};
  }else{
    const count=k==='bind'?1:k==='burst'||k==='ice'||k==='poison'||k==='fire'?3:2;
    const sy=m.y-50*m.scale,sx=m.x;
    const aim=Math.atan2(P.y-CH*.97-sy,P.x-sx);
    for(let i=0;i<count;i++){
      const angle=aim+(i-(count-1)/2)*.20,sp=k==='bind'?300:370;
      shots.push({x:sx,y:sy,vx:Math.cos(angle)*sp,vy:Math.sin(angle)*sp,
        dmg:m.atk*(count>1?.58:.88),kind:'magic',npcColor:col,slow:k==='bind'||k==='ice',
        t:0,r:k==='bind'?18:15,life:2.5});
    }
  }
}
function npcBossFieldTick(dt){
  if(!M||!M.npcWhirls)return;
  for(let i=M.npcWhirls.length-1;i>=0;i--){
    const q=M.npcWhirls[i];q.t+=dt;
    if(q.t>q.life||q.owner.dead){M.npcWhirls.splice(i,1);continue;}
    const dx=P.x-q.x,dy=P.y-q.y,d=Math.hypot(dx,dy)||1;
    if(d>24){const step=Math.min(d,55*dt);q.x+=dx/d*step;q.y+=dy/d*step;}
    for(const t of [P,...allies]){
      if(t===P?!['manual','hunt'].includes(P.mode):t.down||t.dead)continue;
      if(Math.hypot(t.x-q.x,(t.y-q.y)/YR)>q.r)continue;
      if(q.t<(q.nextHit.get(t)||0))continue;
      q.nextHit.set(t,q.t+1.0);
      const tx=t.x-q.x,ty=t.y-q.y,L=Math.hypot(tx,ty)||1;
      if(!hasLOS(q.x,q.y,t.x,t.y))continue;
      if(t===P)hurtPlayer(q.damage,tx/L,ty/L,60);
      else hurtAlly(t,q.damage,tx/L,ty/L,60);
    }
  }
  if(M.npcBossCleared&&M.sp.last&&M.mis==='guard'&&M.captain&&M.captain.dead)onCaptainDead(M.captain);
}
function npcBossDrawField(){
  if(!M||!M.npcWhirls)return;
  for(const q of M.npcWhirls){
    const c=q.color.join(','),u=Math.min(1,q.t*3,(q.life-q.t)*2),spin=time*3.6;
    cx.save();cx.translate(q.x,q.y-37);cx.scale(1,YR);cx.globalCompositeOperation='lighter';
    for(let i=0;i<4;i++){
      const a=spin+i*Math.PI/2;cx.strokeStyle='rgba('+c+','+(.16*u)+')';cx.lineWidth=8+i*2;cx.beginPath();cx.ellipse(0,-i*13,q.r*(.64-i*.08),q.r*(.32-i*.04),a,0,Math.PI*1.65);cx.stroke();
    }
    cx.restore();
  }
}
function npcBossDrawAura(m){
  if(m.dead||m.npcWaiting)return;
  const c=m.npcBossDef.color.join(','),h=mobH(m)*m.scale;
  const flick=.5+.5*Math.sin(time*5+m.seed),extra=m.npcCast?.18:m.npcShield?.12:0;
  cx.save();cx.globalCompositeOperation='lighter';
  const g=cx.createRadialGradient(m.x,m.y-h*.4,8,m.x,m.y-h*.38,h*.83);
  g.addColorStop(0,'rgba('+c+','+(.10+.06*flick+extra)+')');
  g.addColorStop(.56,'rgba('+c+','+(.085+.035*flick+extra*.5)+')');
  g.addColorStop(1,'rgba('+c+',0)');
  cx.fillStyle=g;cx.beginPath();cx.ellipse(m.x,m.y-h*.4,h*.7,h*.82,0,0,7);cx.fill();
  if(m.npcShield>0){
    cx.strokeStyle='rgba(165,230,255,'+(.35+.11*flick)+')';cx.lineWidth=3;
    cx.beginPath();cx.ellipse(m.x,m.y-h*.48,h*.55,h*.63,0,0,7);cx.stroke();
  }
  cx.restore();
}
function npcBossDrawLabel(m){
  const y=m.y-mobH(m)*m.scale-29,w=118,hp=Math.max(0,m.hp/m.maxHp);
  cx.save();cx.textAlign='center';cx.font='800 15px system-ui,sans-serif';cx.lineWidth=4;cx.lineJoin='round';
  cx.strokeStyle='#140d18';cx.fillStyle='#fff1bc';cx.strokeText(m.npcBossDef.name,m.x,y-13);cx.fillText(m.npcBossDef.name,m.x,y-13);
  cx.fillStyle='rgba(4,4,13,.78)';cx.fillRect(m.x-w/2-2,y-6,w+4,11);
  cx.fillStyle=m.npcBossDef.main?'#f5a34e':'#e75d85';cx.fillRect(m.x-w/2,y-4,w*hp,7);
  cx.restore();
}
