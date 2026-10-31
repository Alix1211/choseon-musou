/* 견희(33) · 관은병(37) 필수 직접 출전.
 * 임시 편성만 전투 생성/교체 과정에서 사용하고, 저장된 동료 편성은 그대로 둔다. */
const LORD_FORCED_HERO={33:'zhenji',37:'yinping'};
const lordStageStartBase=startStage;
startStage=function(n,d){
  const id=LORD_FORCED_HERO[n];
  if(!id)return lordStageStartBase(n,d);
  if(!S.roster.includes(id)){
    showBanner((HN[id]||id)+'를 먼저 합류시켜야 출전할 수 있습니다',3);
    return false;
  }
  const old=S.party.slice();
  S.party=[id,...old.filter(x=>x!==id)].slice(0,2);
  try{return lordStageStartBase(n,d);}
  finally{S.party=old;save();}
};
const lordSwitchBase=switchPlayable;
switchPlayable=function(id){
  const force=M&&LORD_FORCED_HERO[M.n];
  if(force&&id!==force)return false;
  if(!force||S.party.includes(force))return lordSwitchBase(id);
  const old=S.party.slice();S.party=[force,...old.filter(x=>x!==force)].slice(0,2);
  try{return lordSwitchBase(id);}
  finally{S.party=old;save();}
};
const lordNextBase=nextPlayable;
nextPlayable=function(){return M&&LORD_FORCED_HERO[M.n]?null:lordNextBase();};
const lordUpdateBase=updatePlayer;
updatePlayer=function(dt){
  lordUpdateBase(dt);
  const force=M&&LORD_FORCED_HERO[M.n];
  if(force&&PLAY.active!==force&&UI.mode==='battle'&&!UI.paused&&!M.trans&&P.mode==='manual'&&P.hp>0){
    if(switchPlayable(force))showBanner((HN[force]||force)+' 필수 출전!',2);
  }
};
