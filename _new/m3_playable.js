/* All 9 existing female generals share the approved playable controller.
   Existing monster models, WALK frames and portraits; NO new attack sheets. */
const PLAY={active:'choseon',bagPause:false,bagWasPaused:false};
/* Combat families are fixed by the existing character models; equipment
   inventory, upgrades, buffs and item attack values remain shared via ST. */
const PLAYABLE_HEROES=Object.freeze({
  zhenji:  {weapon:'fan',  model:'zhenji',  portrait:'zhenji'},   // 견희: 마법
  wenji:   {weapon:'fan',  model:'wenji',   portrait:'wenji'},    // 채문희: 마법
  wangyi:  {weapon:'sword',model:'wangyi',  portrait:'wangyi'},   // 왕이: 검
  xiaoqiao:{weapon:'fan',  model:'xiaoqiao',portrait:'xiaoqiao'}, // 소교: 마법
  daqiao:  {weapon:'fan',  model:'daqiao',  portrait:'daqiao'},   // 대교: 마법
  shangxiang:{weapon:'whip',model:'shangxiang',portrait:'shangxiang'}, // 손상향: 채찍 계열
  yinping: {weapon:'sword',model:'yinping', portrait:'yinping'},  // 관은병: 검 계열
  xingcai: {weapon:'sword',model:'xingcai', portrait:'xingcai'}, // 성채: 검 계열
  yueying: {weapon:'sword',model:'yueying', portrait:'yueying'}   // 월영: 언월도/검 계열
});
function combatWeapon(){return PLAYABLE_HEROES[PLAY.active]?.weapon||ST.wt;}
function playableOrder(){
  return ['choseon',...S.party.filter(id=>PLAYABLE_HEROES[id]&&S.roster.includes(id))];
}
function nextPlayable(){
  const list=playableOrder(),at=list.indexOf(PLAY.active);
  for(let k=1;k<list.length;k++){
    const id=list[(Math.max(0,at)+k)%list.length];
    if(allies.some(a=>a.type===id&&!a.down&&!a.dead&&a.hp>0))return id;
  }
  return null;
}
function playableLevel(id=PLAY.active){return id==='choseon'?S.lv:heroLv(id);}
function playableStats(id=PLAY.active){
  if(id==='choseon'||!PLAYABLE_HEROES[id])return ST;
  const lv=heroLv(id),p=HPERS[id]||[1,1,1];
  return {...ST,wt:PLAYABLE_HEROES[id].weapon,
    atk:ST.atk*lvm(lv,.03)/lvm(S.lv,.03)*p[1],
    maxHp:ST.maxHp*lvm(lv,.04)/lvm(S.lv,.04)*p[0],
    def:ST.def*lvm(lv,.02)/lvm(S.lv,.02)};
}
stat.atk=()=>playableStats().atk*(BUF.atk>0?1.3:1);
stat.maxHp=()=>playableStats().maxHp;
stat.def=()=>playableStats().def*(BUF.def>0?1.4:1);
const playableRecalcBase=recalc;
recalc=function(){
  const ratio=P&&ST?P.hp/stat.maxHp():null;
  playableRecalcBase();
  if(P&&ratio!==null)P.hp=Math.max(0,Math.min(stat.maxHp(),ratio*stat.maxHp()));
};
const playableAllyStatBase=allyStatOf;
allyStatOf=function(id){return id==='choseon'?{hp:ST.maxHp,atk:ST.atk,sp:1}:playableAllyStatBase(id);};
const playableStartBase=startStage;
startStage=function(n,d){
  PLAY.active='choseon';PLAY.bagPause=false;closeBag();
  MT.choseon={vh:152,H:318,name:'초선',hp:1,atk:1,sp:128,wind:.4};
  return playableStartBase(n,d);
};
const playableExpBase=gainExp;
gainExp=function(v){
  if(PLAYABLE_HEROES[PLAY.active]&&M&&M.musou)heroExp(PLAY.active,v*(M.replay?.25:.5));
  return playableExpBase(v);
};
function switchPlayable(id){
  if(!id||id===PLAY.active||!M||UI.mode!=='battle'||UI.paused||M.trans||
    ULT.active||P.mode!=='manual'||P.hp<=0||P.atk||P.sk||P.skHit)return false;
  if(id!=='choseon'&&(!PLAYABLE_HEROES[id]||!S.roster.includes(id)||!S.party.includes(id)))return false;
  const index=allies.findIndex(a=>a.type===id&&!a.down&&!a.dead&&a.hp>0);
  if(index<0)return false;
  const target=allies[index],old=PLAY.active;
  // Both health and cooldown belong to the character, not the shared gear.
  // Keep ratios because AI ally and player have different maximum HP values.
  const oldRatio=Math.max(0,Math.min(1,P.hp/stat.maxHp()));
  const targetRatio=Math.max(0,Math.min(1,target.hp/target.maxHp));
  const oldCooldown={skCd:P.skCd.slice(),spinCd:P.spinCd,slowT:P.slowT};
  const targetCooldown=target.playCooldown||{skCd:[0,0],spinCd:3,slowT:0};
  const targetSkCd=targetCooldown.skCd.slice(),targetSpinCd=targetCooldown.spinCd,
    targetSlowT=targetCooldown.slowT;
  const x=target.x,y=target.y;
  allies.splice(index,1);
  const outgoing=addAlly(old,x,y);
  outgoing.hp=outgoing.maxHp*oldRatio;
  outgoing.playCooldown=oldCooldown;
  PLAY.active=id;
  P.hp=stat.maxHp()*targetRatio;
  P.skCd=targetSkCd;P.spinCd=targetSpinCd;P.slowT=targetSlowT;
  stopInput();P.atk=null;P.sk=null;P.skHit=null;P.mAim=null;P.state='idle';P.kx=P.ky=0;P.target=null;
  CM_AUDIO.stopVoice();refreshUI();save();return true;
}
const playableAlliesBase=updateAllies;
updateAllies=function(dt){
  for(const a of allies)if(a.playCooldown){const c=a.playCooldown;c.skCd=c.skCd.map(v=>Math.max(0,v-dt));c.spinCd=Math.max(0,c.spinCd-dt);c.slowT=Math.max(0,c.slowT-dt);}
  playableAlliesBase(dt);
};
function drawBenchedChoseon(a){
  const [dir,flip]=dirKey(a.face),anim=a.act?ST.wt:'move',e=A.man[anim][dir],im=A.sheets[anim+'_'+dir];
  let frame=a.act?Math.min(e.frames-1,Math.floor(a.act.t/a.act.dur*e.frames)):a.moving?Math.floor(time*e.fps)%e.frames:e.idle||0;
  const col=frame%e.cols,row=Math.floor(frame/e.cols);
  drawShadow(a.x,a.y,40,12,.28);cx.save();cx.translate(a.x,a.y);cx.globalAlpha=a.down?.5:1;cx.scale((flip?-1:1)*PS,PS);
  cx.drawImage(im,col*e.tw,row*e.th,e.tw,e.th,-e.ax,-e.ay,e.tw,e.th);cx.restore();drawAllyTag(a);
}
const playableDrawBase=drawPlayer;
drawPlayer=function(){
  if(PLAY.active==='choseon')return playableDrawBase();
  // Reuse the selected hero's existing model, 4-frame WALK and casting pose.
  const progress=P.atk?Math.min(1,P.atkT/A.man[P.atk][P.atk==='spinfan'?'front':dirKey(P.face)[0]].frames):0;
  drawMob({type:PLAYABLE_HEROES[PLAY.active].model,set:'h',x:P.x,y:P.y,face:P.face,scale:1.16,seed:0,
    moving:!P.atk&&P.state==='move',wind:P.atk&&progress<.5?.4*(1-progress*2):0,
    lunge:P.atk&&progress>=.5?Math.max(0,1-(progress-.5)*2):0,
    hurt:hurtFlash>0?.14:0,stun:0,dead:P.mode==='dead',deadT:P.mode==='dead'?P.tt:0,
    down:false,ally:false,hp:P.hp,maxHp:stat.maxHp(),au:0});
};
const playableOpenBagBase=openBag,playableCloseBagBase=closeBag;
openBag=function(){
  if(UI.settingsOpen||settingsSyncBlocked())return;
  if(UI.mode==='battle'&&!bagOpen){PLAY.bagWasPaused=UI.paused;PLAY.bagPause=true;UI.paused=true;releaseSettingsInput();CM_AUDIO.pause();}
  playableOpenBagBase();
};
closeBag=function(){
  if(PLAY.bagPause&&settingsSyncBlocked())return;
  playableCloseBagBase();
  if(PLAY.bagPause){PLAY.bagPause=false;UI.paused=PLAY.bagWasPaused;releaseSettingsInput();CM_AUDIO.sync();}
};
const playableRenderBagBase=renderBag;
renderBag=function(){
  playableRenderBagBase();
  if(UI.mode==='battle'){
    const a=playableStats();$('bstat').innerHTML=[['레벨',playableLevel()],['공격력',fmt1(a.atk)],['체력',fmt(a.maxHp)],['방어력',fmt1(a.def)],['치명타',Math.round(a.crit)+'%'],['스킬 재사용 단축',Math.round(a.cdr)+'%']].map(r=>'<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');
  }
};
const playableOpenSettingsBase=openSettings;
openSettings=function(){if(bagOpen)return false;return playableOpenSettingsBase();};
const playableUIBase=refreshUI;
refreshUI=function(){
  playableUIBase();if(UI.mode!=='battle'||!P||!M)return;
  const id=PLAY.active,other=nextPlayable(),portrait=$('playerPortrait'),swap=$('allySwap');
  portrait.querySelector('img').src='a/ui/pt/'+id+'.webp';portrait.title=(HN[id]||'초선')+' · 장비';
  portrait.setAttribute('aria-label',portrait.title);portrait.disabled=UI.paused&&!PLAY.bagPause;
  $('stage').textContent=(HN[id]||'초선')+' Lv '+playableLevel()+' · Stage '+(M.n||S.stage);
  const xp=id==='choseon'?S.xp:S.hx[id]||0;$('xpb').style.width=Math.min(100,xp/expNeed(playableLevel())*100)+'%';
  swap.hidden=!other;if(other)swap.querySelector('img').src='a/ui/pt/'+other+'.webp';
  const unit=allies.find(a=>a.type===other&&!a.down&&!a.dead&&a.hp>0);
  swap.disabled=!other||!unit||UI.paused||ULT.active||!!P.atk||!!P.sk||!!P.skHit||P.hp<=0||P.mode!=='manual'||!!M.trans;
  swap.title=(HN[other]||'초선')+' 교체';swap.setAttribute('aria-label',swap.title);
};
$('playerPortrait').addEventListener('click',()=>openBag());
$('allySwap').addEventListener('click',()=>{const other=nextPlayable();if(other)switchPlayable(other);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bagOpen){e.preventDefault();e.stopImmediatePropagation();closeBag();}},true);
