/* Enemy attacks use ground-space geometry; portraits/sprites and player moves stay unchanged. */
const ENEMY_PROFILES={
  sword:{kind:'sweep',speed:205,reach:185,half:.95,wind:.46,cd:1.30},
  spear:{kind:'thrust',speed:195,reach:230,width:88,wind:.54,cd:1.45},
  cav:{kind:'charge',speed:245,reach:345,width:104,wind:.72,cd:2.55},
  egg:{kind:'sweep',speed:190,reach:180,half:1.05,wind:.50,cd:1.40},
  jiangshi:{kind:'thrust',speed:200,reach:175,width:94,wind:.48,cd:1.30},
  slime:{kind:'sweep',speed:205,reach:145,half:1.2,wind:.42,cd:1.15},
  bow:{kind:'arrow',speed:165,reach:700,keep:390,wind:.56,cd:1.65,shot:560},
  magic:{kind:'magic',speed:155,reach:650,keep:400,wind:.78,cd:2.4,shot:350},
  fox:{kind:'magic',speed:170,reach:650,keep:410,wind:.74,cd:2.3,shot:370}
};
const ENEMY_PRESSURE={started:0,hits:0};
for(const [id,p] of Object.entries(ENEMY_PROFILES))if(MT[id])MT[id].wind=p.wind;
function enemyProfile(m){return ENEMY_PROFILES[m.type]||ENEMY_PROFILES.sword;}
function enemyArmored(m){return !!(!m.dead&&!m.down&&(m.charge||(m.intent&&(m.elite||m.type==='cav')&&m.intent.left<m.intent.duration*.8)));}
function enemyContains(z,px,py,pad=18){
  const dx=px-z.x,dy=(py-z.y)/YR;
  if(z.k==='circle')return Math.hypot(dx,dy)<=z.r+pad;
  const ca=Math.cos(z.a||0),sa=Math.sin(z.a||0),along=dx*ca+dy*sa,across=-dx*sa+dy*ca;
  if(z.k==='rect')return along>=-pad&&along<=z.L+pad&&Math.abs(across)<=z.w/2+pad;
  if(z.k==='cone'){
    const d=Math.hypot(dx,dy);if(d<=pad)return true;if(d>z.R+pad)return false;
    let angle=Math.atan2(dy,dx)-(z.a||0);while(angle>Math.PI)angle-=2*Math.PI;while(angle<-Math.PI)angle+=2*Math.PI;
    return Math.abs(angle)<=z.ha+Math.asin(Math.min(1,pad/d));
  }
  return false;
}
function enemyTarget(m){
  // Most enemies pressure the controlled hero. A smaller group can engage allies.
  if((Math.floor(m.seed*997)%4)!==0&&Math.hypot(P.x-m.x,P.y-m.y)<760)return P;
  return allies.length?tgtOf(m):P;
}
function enemyVelocity(t){
  if(t!==P)return {x:0,y:0};
  const input=readInput(),n=Math.hypot(input.x,input.y)||1;
  return {x:input.x/n*270,y:input.y/n*270};
}
function enemyAim(m,t,lead){
  const v=enemyVelocity(t);
  return {x:t.x+clamp(v.x*lead,-130,130),y:t.y+clamp(v.y*lead,-100,100)};
}
function enemyCanHit(z,t){return enemyContains(z,t.x,t.y)&&hasLOS(z.x,z.y,t.x,t.y);}
function enemyHit(z,damage,kb,hitSet){
  for(const t of [P,...allies]){
    if(t===P?!['manual','hunt'].includes(P.mode):t.down||t.dead)continue;
    if(hitSet&&hitSet.has(t))continue;if(!enemyCanHit(z,t))continue;
    if(hitSet)hitSet.add(t);
    const dx=t.x-z.x,dy=t.y-z.y,d=Math.hypot(dx,dy)||1;
    if(t===P){hurtPlayer(damage,dx/d,dy/d,kb||0);ENEMY_PRESSURE.hits++;}
    else hurtAlly(t,damage,dx/d,dy/d,kb||0);
  }
}
function enemyAttackAvailable(m){
  const cap=S.stage<4?2:S.stage<20?3:4;
  let n=0;for(const q of mobs)if(q!==m&&!q.dead&&(q.intent||q.charge)&&Math.hypot(q.x-P.x,q.y-P.y)<760)n++;
  return n<cap+(S.diff>=2?1:0);
}
function enemyStart(m,p,target){
  if(!enemyAttackAvailable(m)){m.cd=.16+rnd(0,.20);return;}
  if(!hasLOS(m.x,m.y,target.x,target.y)){m.cd=.2;return;}
  const aim=enemyAim(m,target,p.kind==='arrow'?.20:.12);
  m.intent={kind:p.kind,target,a:Math.atan2((aim.y-m.y)/YR,aim.x-m.x),x:m.x,y:m.y,
    left:p.wind,duration:p.wind,reach:p.reach,width:p.width,half:p.half,aim,profile:p};
  m.wind=p.wind;ENEMY_PRESSURE.started++;
}
function enemyArea(m,a){
  if(a.kind==='thrust'||a.kind==='charge')return {k:'rect',x:m.x,y:m.y,a:a.a,L:a.reach,w:a.width};
  return {k:'cone',x:m.x,y:m.y,a:a.a,R:a.reach,ha:a.half||.14};
}
function enemyFire(m,a){
  const p=a.profile;
  if(a.kind==='charge'){
    m.charge={a:a.a,left:a.reach,hit:new Set(),speed:560};return;
  }
  if(a.kind==='arrow'||a.kind==='magic'){
    const originY=m.y-48*m.scale;
    const aim=a.aim,aa=Math.atan2(aim.y-CH*.97-originY,aim.x-m.x);
    const count=a.kind==='magic'||(m.elite&&S.stage>=5)?3:1;
    for(let i=0;i<count;i++){
      const angle=aa+(i-(count-1)/2)*.18;
      shots.push({x:m.x,y:originY,vx:Math.cos(angle)*p.shot,vy:Math.sin(angle)*p.shot,
        dmg:m.atk*(count===3?.8:1),kind:m.type,t:0,r:a.kind==='magic'?17:10,life:2.4});
    }
    if(a.kind==='magic')addZone({k:'circle',x:aim.x,y:aim.y,r:100,life:.85,dmg:m.atk*.9,kb:130,fx:'rock',pressureOwner:m});
  }else{
    const area=enemyArea(m,a);enemyHit(area,m.atk,a.kind==='thrust'?120:160);
    fx.push({k:'sweep',x:m.x,y:m.y,a:a.a,R:a.reach,ha:a.half||.22,t:0,life:.22,col:'255,100,85',small:true});
    m.lunge=1;
  }
}
function enemyChargeTick(m,dt){
  const c=m.charge,step=Math.min(c.left,c.speed*dt),x=m.x,y=m.y;
  moveEnt(m,Math.cos(c.a)*step,Math.sin(c.a)*YR*step,18);
  const moved=Math.hypot(m.x-x,(m.y-y)/YR);
  enemyHit({k:'rect',x,y,a:c.a,L:moved+80,w:104},m.atk*1.35,260,c.hit);
  c.left-=moved;m.moving=true;m.lunge=1;m.face=faceTo(Math.cos(c.a),Math.sin(c.a)*YR);
  if(c.left<=0||moved<step*.3){m.charge=null;m.cd=Math.max(m.cd,.7);}
}
function enemyBossPressure(m,dt,d){
  m.pressureCd=(m.pressureCd==null?2.5:m.pressureCd)-dt;
  if(m.pressureCd>0||d<285||d>700||!['golem','dueok'].includes(m.type)||!hasLOS(m.x,m.y,P.x,P.y))return;
  const a=enemyAim(m,P,.22);
  addZone({k:'circle',x:a.x,y:a.y,r:100,life:.95,dmg:m.atk*.95,kb:170,fx:'rock',pressureOwner:m});
  m.pressureCd=m.hp<m.maxHp*.5?3.2:4.1;
}
function updateMob(m,dt){
  if(m.wuHidden||weiMob(m,dt))return;
  if(m.dead){m.intent=null;m.charge=null;m.deadT+=dt;return;}
  m.hurt=Math.max(0,m.hurt-dt);m.stun=Math.max(0,m.stun-dt);m.lunge=Math.max(0,m.lunge-dt*3);
  if(m.static){m.au=0;return;}
  if(m.kx||m.ky){moveEnt(m,m.kx*dt,m.ky*dt,16);const f=Math.pow(.02,dt);m.kx*=f;m.ky*=f;if(Math.abs(m.kx)+Math.abs(m.ky)<8)m.kx=m.ky=0;}
  m.moving=false;m.au=0;
  if(!m.col.woken||m.down||!['manual','hunt'].includes(P.mode))return;
  const dx=P.x-m.x,dy=P.y-m.y,d=Math.hypot(dx,dy)||1;
  if(m.stun>0&&(!enemyArmored(m)||m.stun>.6)){
    m.intent=null;m.charge=null;m.wind=0;m.cd=Math.max(m.cd,.35);return;
  }
  if(m.boss){enemyBossPressure(m,dt,d);updateBoss(m,dt,dx,dy,d);return;}
  m.cd-=dt;m.slowT=Math.max(0,(m.slowT||0)-dt);
  if(m.charge){enemyChargeTick(m,dt);return;}
  if(m.intent){
    const a=m.intent;a.left-=dt;m.wind=Math.max(0,a.left);
    if(a.left>a.duration*.4){
      const aim=enemyAim(m,a.target,a.kind==='arrow'?.2:.12),want=Math.atan2((aim.y-m.y)/YR,aim.x-m.x);
      let delta=want-a.a;while(delta>Math.PI)delta-=2*Math.PI;while(delta<-Math.PI)delta+=2*Math.PI;
      a.a+=clamp(delta,-2.2*dt,2.2*dt);a.aim=aim;
    }
    m.face=faceTo(Math.cos(a.a),Math.sin(a.a)*YR);
    if(a.left<=0){
      if(hasLOS(m.x,m.y,a.aim.x,a.aim.y))enemyFire(m,a);
      m.intent=null;m.wind=0;
      const df=DIFF[S.diff]||DIFF[1];m.cd=a.profile.cd*rnd(.88,1.12)*(a.kind==='arrow'||a.kind==='magic'?df.rangedCd:df.meleeCd);
    }
    return;
  }
  const p=enemyProfile(m),target=enemyTarget(m),tx=target.x-m.x,ty=target.y-m.y,dist=Math.hypot(tx,ty)||1;
  m.face=faceTo(tx,ty);m.lunTo=target;
  const speed=p.speed*(S.diff===0?.86:1)*(m.elite?1.05:1)*(m.slowT>0?.5:1);
  const ranged=p.kind==='arrow'||p.kind==='magic';
  const trigger=ranged?p.reach:p.kind==='charge'?420:p.reach*.86;
  if(m.cd<=0&&dist<=trigger&&hasLOS(m.x,m.y,target.x,target.y)){enemyStart(m,p,target);return;}
  if(ranged&&dist<p.keep-65){moveEnt(m,-tx/dist*speed*dt,-ty/dist*speed*dt,16);m.moving=true;}
  else if(!ranged||dist>p.keep+35){
    const side=(Math.floor(m.seed*53)%2?1:-1),flank=!ranged&&dist>p.reach*1.2&&dist<460;
    const offset=flank?(p.kind==='charge'?130:75)*side:0;
    chaseMove(m,{x:target.x-ty/dist*offset,y:target.y+tx/dist*offset},speed*dt,dt);m.moving=true;
  }
}
function drawEnemyIntents(){
  for(const m of mobs){
    if(!m.intent||m.dead||m.down||m.wuHidden||m.col?.weiHidden)continue;
    if(Math.abs(m.x-cam.x)>VW/Z*.6+450||Math.abs(m.y-cam.y)>VH/Z*.6+450)continue;
    const a=m.intent,z=enemyArea(m,a),u=1-a.left/a.duration;
    cx.save();cx.translate(z.x,z.y);cx.scale(1,YR);cx.rotate(z.a);cx.beginPath();
    if(z.k==='rect')cx.rect(0,-z.w/2,z.L,z.w);
    else{cx.moveTo(0,0);cx.arc(0,0,z.R,-z.ha,z.ha);cx.closePath();}
    cx.fillStyle='rgba(255,65,45,'+(.10+.14*u)+')';cx.strokeStyle=enemyArmored(m)?'#ffce75':'rgba(255,120,95,.85)';cx.lineWidth=enemyArmored(m)?3:2;cx.fill();cx.stroke();cx.restore();
  }
}
