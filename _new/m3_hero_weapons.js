/* Character weapon identities. Shared equipment/save format and input sequences stay intact. */
const HERO_WEAPONS={
 zhenji:{rate:.90,hp:.85,def:.90,sp:1.00,reach:420,kb:55,half:.60,count:6,shot:205,kind:'orb',trail:'magic:2',impact:'magic:3'},
 wenji:{rate:.98,hp:.90,def:.95,sp:.96,reach:390,kb:95,half:.62,count:3,shot:310,kind:'sound',trail:'burst:2',impact:'burst:1'},
 wangyi:{rate:1.62,hp:.82,def:.85,sp:1.18,reach:112,kb:65,half:.72,trail:'melee:3',impact:'impact:3'},
 xiaoqiao:{rate:1.18,hp:.82,def:.85,sp:1.20,reach:410,kb:80,half:.62,count:2,shot:470,kind:'fire',trail:'magic:0',impact:'magic:1'},
 daqiao:{rate:1.06,hp:1.15,def:1.10,sp:.92,reach:183,kb:185,half:1.02,stun:.22,trail:'impact:2',impact:'impact:2'},
 shangxiang:{rate:1.30,hp:.88,def:.90,sp:1.16,reach:170,kb:80,half:1.30,trail:'impact:2',impact:'impact:3'},
 yinping:{rate:.68,hp:1.25,def:1.20,sp:.87,reach:162,kb:420,half:1.08,stun:.26,trail:'ground:0',impact:'impact:0'},
 xingcai:{rate:.92,hp:1.28,def:1.38,sp:.92,reach:148,kb:245,half:.95,stun:.12,trail:'melee:0',impact:'impact:1'},
 yueying:{rate:.78,hp:1.08,def:1.06,sp:.94,reach:235,kb:315,half:.88,trail:'melee:1',impact:'impact:0'}
};
for(const [id,p] of Object.entries(HERO_WEAPONS))HPERS[id]=[p.hp,1/p.rate,p.sp];
const heroWeapon=id=>HERO_WEAPONS[id||PLAY.active];
const weaponStatsBase=playableStats;
playableStats=function(id=PLAY.active){const s=weaponStatsBase(id),p=heroWeapon(id);return p?{...s,def:s.def*p.def}:s;};
const weaponAllyStatsBase=allyStatOf;
allyStatOf=function(id){const s=weaponAllyStatsBase(id),p=heroWeapon(id);return p?{...s,def:ST.def*p.def}:s;};
const weaponHurtAllyBase=hurtAlly;
hurtAlly=function(a,base,nx,ny,kb){const p=heroWeapon(a.type);return weaponHurtAllyBase(a,p?base*(100+stat.def())/(100+ST.def*p.def):base,nx,ny,kb);};
const weaponDurationBase=comboAttackDuration;
comboAttackDuration=function(){return weaponDurationBase()/(heroWeapon()?.rate||1);};
const heroProjectiles=[],heroEffects=[],heroGroundBursts=[];
let heroWorld=null;
const HERO_VFX_LAYOUT={melee:[3,4],magic:[3,4],impact:[3,4],ground:[4,3],motion:[4,3],burst:[4,3]};
const HERO_VFX={};
const HERO_VFX_REV='e0534fd7b646a2e6b3dce931c21626ca771d2c8b';
async function loadWeaponFx(key){
 const path='a/combat_vfx/'+key+'.webp';
 try{return await loadImg(path);}catch(e){}
 const url='https://raw.githubusercontent.com/Alix1211/choseon-musou/'+HERO_VFX_REV+'/'+path;
 let cache=null,r=null;
 try{cache=await caches.open('choseon-combat-vfx-v1');r=await cache.match(url);}catch(e){}
 try{
  if(!r){const c=new AbortController(),tm=setTimeout(()=>c.abort(),18000);try{r=await fetch(url,{signal:c.signal});}finally{clearTimeout(tm);}if(!r.ok)return null;if(cache)try{await cache.put(url,r.clone());}catch(e){}}
  const u=URL.createObjectURL(await r.blob());try{return await loadImg(u);}finally{URL.revokeObjectURL(u);}
 }catch(e){return null;}
}
const weaponLoadBase=loadAll;
loadAll=async function(){await weaponLoadBase();await Promise.all(Object.keys(HERO_VFX_LAYOUT).map(async k=>{const im=await loadWeaponFx(k);if(im)HERO_VFX[k]=im;}));};
function heroFx(key,x,y,size=140,a=0,ground=false,life=.32){
 if(heroEffects.length>=48)heroEffects.shift();
 heroEffects.push({key,x,y,size,a,ground,life,t:0});
}
/* Hand-drawn ground detail beneath the existing feathered ground.webp atlas.
   Only HHL (slam) and HHHL (rocks) use this; no hitboxes or damage change. */
function comboGroundBurst(move,x,y){
 if(move!=='slam'&&move!=='rocks')return false;
 const large=move==='rocks',cracks=[],stones=[];
 const count=large?5:3,range=large?116:70;
 for(let i=0;i<count;i++){
  const angle=i*Math.PI*2/count+(Math.random()-.5)*.42,points=[[0,0]];
  for(let step=1;step<=3;step++){
   const a=angle+(Math.random()-.5)*.24;
   const r=range*step/3*(.84+Math.random()*.26);
   points.push([Math.cos(a)*r,Math.sin(a)*r*.48]);
  }
  cracks.push(points);
 }
 const num=large?11:6;
 for(let i=0;i<num;i++){
  const a=i*Math.PI*2/num+(Math.random()-.5)*.65,speed=(large?125:95)+Math.random()*(large?125:80);
  stones.push({vx:Math.cos(a)*speed,vy:Math.sin(a)*speed*.42,
   vz:170+Math.random()*(large?75:50),size:(large?4:3)+Math.random()*(large?5:4),
   spin:(Math.random()-.5)*9,rot:Math.random()*Math.PI*2,tone:i%3});
 }
 if(heroGroundBursts.length>=3)heroGroundBursts.shift();
 heroGroundBursts.push({x,y,t:0,life:large?.55:.48,cracks,stones});
 return true;
}
function paintGroundCracks(b){
 const u=b.t/b.life,alpha=Math.min(1,u/.10)*Math.min(1,(1-u)/.46);
 if(alpha<=0)return;
 cx.save();cx.translate(b.x,b.y);cx.globalCompositeOperation='source-over';
 cx.globalAlpha=1;cx.lineCap='round';cx.lineJoin='round';
 for(const pts of b.cracks){
  cx.beginPath();for(let i=0;i<pts.length;i++)i?cx.lineTo(pts[i][0],pts[i][1]):cx.moveTo(pts[i][0],pts[i][1]);
  cx.lineWidth=2.5;cx.strokeStyle='rgba(48,36,34,'+(.60*alpha)+')';cx.stroke();
  cx.save();cx.translate(0,-1.5);cx.beginPath();
  for(let i=0;i<pts.length;i++)i?cx.lineTo(pts[i][0],pts[i][1]):cx.moveTo(pts[i][0],pts[i][1]);
  cx.lineWidth=.8;cx.strokeStyle='rgba(225,191,159,'+(.38*alpha)+')';cx.stroke();cx.restore();
 }
 cx.restore();
}
function paintGroundStones(b){
 const t=b.t,fade=Math.min(1,t/.065)*Math.min(1,(b.life-t)/.13);
 if(fade<=0)return;
 const colors=['#77665b','#a18a72','#605b60'];
 for(const s of b.stones){
  const z=Math.max(0,s.vz*t-425*t*t),x=b.x+s.vx*t,y=b.y+s.vy*t-z;
  cx.save();cx.translate(x,y);cx.rotate(s.rot+s.spin*t);
  cx.globalCompositeOperation='source-over';cx.globalAlpha=.90*fade;
  cx.fillStyle=colors[s.tone];cx.beginPath();
  cx.moveTo(-s.size*.88,-s.size*.38);cx.lineTo(-s.size*.24,-s.size);
  cx.lineTo(s.size*.92,-s.size*.43);cx.lineTo(s.size*.74,s.size*.62);
  cx.lineTo(-s.size*.43,s.size*.78);cx.closePath();cx.fill();
  cx.strokeStyle='rgba(234,208,176,.48)';cx.lineWidth=.75;cx.beginPath();
  cx.moveTo(-s.size*.24,-s.size);cx.lineTo(s.size*.92,-s.size*.43);cx.stroke();
  cx.restore();
 }
}
function paintHeroFx(key,x,y,size,phase,a=0,ground=false,opacity=1){
 const [sheet,rowText]=key.split(':'),im=HERO_VFX[sheet];if(!im)return;
 const [cols,rows]=HERO_VFX_LAYOUT[sheet],fw=im.width/cols,fh=im.height/rows;
 const col=Math.min(cols-1,Math.floor(Math.min(.999,phase)*cols)),row=Number(rowText),height=size*(1024/rows)/(1536/cols);
 const anchor=ground?(sheet==='ground'&&row===1?.52:.86):.5;
 cx.save();cx.translate(x,y);if(!ground)cx.rotate(a);
 cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.max(0,Math.min(.86,opacity));
 // Feather is baked into the atlas; no per-frame blur/software filter.
 cx.drawImage(im,col*fw,row*fh,fw,fh,-size/2,-height*anchor,size,height);
 cx.restore();
}
function heroAngle(ent,target){if(target)return Math.atan2(target.y-ent.y,target.x-ent.x);return {up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0}[ent.face]||0;}
function heroDamage(m,raw,p,a,kb){
 if(m.dead||m.down||m.wuHidden||m.col?.weiHidden)return;
 if(p.kind==='fire'){
  hitMob(m,raw*.75,'fan',kb,a);
  if(!m.dead){const b=m.heroBurn||{pool:0,left:0,rate:0,t:0};b.pool=Math.min(b.pool+raw*.25,raw*3);b.rate=Math.max(b.rate,raw*2);b.left=2;m.heroBurn=b;}
 }else{
  hitMob(m,raw,p.count?'fan':p===HERO_WEAPONS.shangxiang?'whip':'sword',kb,a);
  if(p.kind==='sound'&&!m.dead)m.slowT=Math.max(m.slowT||0,.30);
 }
 if(!m.dead&&!m.boss&&p.stun&&!enemyArmored(m))m.stun=Math.max(m.stun||0,p.stun);
 if(heroEffects.length<44)heroFx(p.impact,m.x,m.y-42*(m.scale||1),p===HERO_WEAPONS.yinping?145:85,0,true,.24);
}
function heroAttack(ent,id,raw,a,power=1,radial=false,rangeScale=1){
 const p=heroWeapon(id);if(!p)return;
 if(p.count&&!radial){
  const n=p.count,spread=p.kind==='orb'?.12:p.kind==='fire'?.10:.19;
  for(let i=0;i<n&&heroProjectiles.length<96;i++){
   const aa=a+(i-(n-1)/2)*spread;
   heroProjectiles.push({id,p,x:ent.x+Math.cos(aa)*28,y:ent.y-50+Math.sin(aa)*28,vx:Math.cos(aa)*p.shot,vy:Math.sin(aa)*p.shot,
    raw:raw*.90*power/n,hit:new Set(),left:Math.min(4,2+(ST.prc||0)),t:0,life:p.kind==='orb'?2.1:1.25,kb:p.kb});
  }
  heroFx(p.kind==='fire'?'burst:0':p.kind==='orb'?'burst:1':'burst:2',ent.x+Math.cos(a)*35,ent.y-50,100,a,false,.27);
 }else{
  const baseReach=p.count?Math.min(p.reach*.55,230):p.reach;
  const reach=(id==='shangxiang'?Math.min(170,baseReach*rangeScale):baseReach*rangeScale),half=radial?Math.PI:p.half;
  for(const m of liveMobs()){
   const dx=m.x-ent.x,dy=m.y-ent.y,d=Math.hypot(dx,dy),da=Math.atan2(dy,dx);
   const angle=Math.abs(Math.atan2(Math.sin(da-a),Math.cos(da-a)));
   if(d<=reach+(id==='shangxiang'?0:12)&&angle<=half&&hasLOS(ent.x,ent.y,m.x,m.y))heroDamage(m,raw*.90*power,p,da,p.kb);
  }
  heroFx(p.trail,ent.x+Math.cos(a)*reach*.35,ent.y-40+Math.sin(a)*reach*.28,Math.min(330,reach*1.5),a,p===HERO_WEAPONS.yinping,.29);
 }
}
const weaponDoHitBase=doHit;
doHit=function(w,mm){const p=heroWeapon();if(!p){const r=weaponDoHitBase(w,mm);heroFx(w==='whip'?'melee:2':w==='fan'?'burst:2':'melee:0',P.x,P.y-45,170,heroAngle(P),false);return r;}
 if(M?.jarList)breakJars(Math.min(p.reach,170));const target=P.mAim?.m||nearest(liveMobs())?.m;
 heroAttack(P,PLAY.active,stat.atk()*(mm||1),heroAngle(P,target));
};
const weaponComboDamageBase=comboDamage;
comboDamage=function(m,power,kb,a,stun){const p=heroWeapon();if(!p)return weaponComboDamageBase(m,power,kb,a,stun);heroDamage(m,stat.atk()*.90*power,p,a,kb*(p.kb/210));};
const weaponComboStrikeBase=comboStrike;
comboStrike=function(move,part){
 const p=heroWeapon(),a=P.cbAngle||heroAngle(P);
 // A finishing blow can pass through multiple hit frames; fracture once.
 if((move==='slam'||move==='rocks')&&P.cbGroundBurstToken!==CB.activated){
  P.cbGroundBurstToken=CB.activated;comboGroundBurst(move,P.x,P.y);
 }
 const radial=['spin','slam','rocks','dashHeavy'].includes(move);
 const key=move==='slam'||move==='dashHeavy'?'ground:0':move==='rocks'?'ground:1':move==='spin'?'motion:1':move==='pierce'||move==='dashLight'?'motion:0':'motion:2';
 heroFx(key,P.x,P.y,radial?Math.min(430,(p?.reach||170)*2):200,a,radial,.38);
 if(!p){
  // Choseon's legacy rocks move emits 19 plain debris sprites. The new
  // shaped fragments replace those only, leaving hitboxes and hits intact.
  const at=fx.length,r=weaponComboStrikeBase(move,part);
  if(move==='rocks')for(let i=fx.length-1;i>=at;i--)if(fx[i].k==='deb')fx.splice(i,1);
  return r;
 }
 const power=move==='spin'?.67:move==='rocks'?2.3:move==='slam'?1.7:move==='dashHeavy'?1.05:move==='dashLight'?.65:move==='arc'?1.7:1.8;
 heroAttack(P,PLAY.active,stat.atk(),a,power,radial,radial?(move==='rocks'?1.4:1.2):1.12);
 if(move==='slam'||move==='rocks'||move==='dashHeavy')heroFx('ground:2',P.x,P.y,Math.min(400,p.reach*1.7),0,true,.4);
 shake=Math.max(shake,move==='rocks'?7:move==='slam'?5:2);
};
const weaponSpinBase=spinTick;
spinTick=function(){if(!heroWeapon()){heroFx('motion:1',P.x,P.y-25,290,0,true,.28);return weaponSpinBase();}heroAttack(P,PLAY.active,stat.atk(),0,.60,true,1.25);heroFx('motion:1',P.x,P.y-25,Math.min(380,heroWeapon().reach*1.7),0,true,.3);};
const weaponSkillHitBase=skillHit;
skillHit=function(id){const p=heroWeapon();if(!p)return weaponSkillHitBase(id);
 if(id==='down'||id==='spray'){
  heroAttack(P,PLAY.active,stat.atk()*p.rate*ST.skd,heroAngle(P,nearest(liveMobs())?.m),id==='spray'?4:2.4,id==='down',1.3);
  heroFx(id==='down'?'ground:0':p.kind==='fire'?'burst:0':p.kind==='orb'?'burst:1':'burst:2',P.x,P.y-15,280,heroAngle(P),id==='down',.42);
 }else{heroFx(id==='ward'?'burst:2':'motion:1',P.x,P.y-20,240,0,true,.4);return weaponSkillHitBase(id);}
};
const weaponAllyActBase=allyAct;
allyAct=function(a,dt){const p=heroWeapon(a.type);if(!p)return weaponAllyActBase(a,dt);
 const k=a.act;k.t+=dt;
 if(!k.hit&&k.t>=k.hitAt){k.hit=true;const radial=k.k==='whirl';heroAttack(a,a.type,a.atk,k.ang||heroAngle(a),radial?1.25:1,radial,radial?1.15:1);a.lunge=1;}
 if(k.t>=k.dur)a.act=null;
};
const weaponShotsBase=updateShots;
updateShots=function(dt){
 weaponShotsBase(dt);
 if(heroWorld!==M){heroWorld=M;heroProjectiles.length=0;heroEffects.length=0;heroGroundBursts.length=0;return;}
 const targets=liveMobs();
 for(let i=heroProjectiles.length-1;i>=0;i--){
  const o=heroProjectiles[i];o.t+=dt;const oldX=o.x,oldY=o.y;o.x+=o.vx*dt;o.y+=o.vy*dt;
  if(o.t>o.life||blockedAt(o.x,o.y+50,2)){heroProjectiles.splice(i,1);continue;}
  for(const m of targets){
   if(o.hit.has(m))continue;
   const mx=m.x,my=m.y-40*(m.scale||1),dx=o.x-oldX,dy=o.y-oldY,len=dx*dx+dy*dy;
   const u=len?Math.max(0,Math.min(1,((mx-oldX)*dx+(my-oldY)*dy)/len)):0;
   if(Math.hypot(mx-oldX-u*dx,my-oldY-u*dy)>19+17*(m.scale||1)||!hasLOS(oldX,oldY+50,m.x,m.y))continue;
   o.hit.add(m);heroDamage(m,o.raw,o.p,Math.atan2(o.vy,o.vx),o.kb);
   if(--o.left<=0){heroProjectiles.splice(i,1);break;}
  }
 }
 for(const m of mobs){const b=m.heroBurn;if(!b)continue;
  if(m.dead||m.down||b.left<=0||b.pool<=0){delete m.heroBurn;continue;}
  b.left-=dt;b.t+=dt;
  if(b.t>=.25){const damage=Math.min(b.pool,b.rate*b.t),st=m.stun;b.pool-=damage;b.t=0;
   hitMob(m,damage,'fan',0,0);m.stun=st;heroFx('magic:1',m.x,m.y-25,50,0,true,.24);}
 }
 for(let i=heroEffects.length-1;i>=0;i--){heroEffects[i].t+=dt;if(heroEffects[i].t>=heroEffects[i].life)heroEffects.splice(i,1);}
 for(let i=heroGroundBursts.length-1;i>=0;i--){heroGroundBursts[i].t+=dt;if(heroGroundBursts[i].t>=heroGroundBursts[i].life)heroGroundBursts.splice(i,1);}
};
const weaponDrawFxBase=drawFx;
drawFx=function(){
 weaponDrawFxBase();
 // Ground cracks stay beneath the prepainted atlas; rocks rise over it.
 for(const b of heroGroundBursts)paintGroundCracks(b);
 for(const o of heroProjectiles){const size=o.p.kind==='orb'?34:o.p.kind==='fire'?70:52;paintHeroFx(o.p.trail,o.x,o.y,size,(o.t*5)%1,Math.atan2(o.vy,o.vx),false,.74);}
 for(const f of heroEffects){const u=f.t/f.life,alpha=Math.min(1,u/.09)*Math.pow(1-u, .75)*.85;paintHeroFx(f.key,f.x,f.y,f.size,u,f.a,f.ground,alpha);}
 for(const b of heroGroundBursts)paintGroundStones(b);
};
const weaponStartBase=startStage;
startStage=function(...args){heroProjectiles.length=0;heroEffects.length=0;heroGroundBursts.length=0;const r=weaponStartBase(...args);heroWorld=M;return r;};

const weaponComboMoveBase=comboMoveTick;
comboMoveTick=function(dt,prev,frame,total){return weaponComboMoveBase(dt*(heroWeapon()?.rate||1),prev,frame,total);};
