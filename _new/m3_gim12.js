/* 12판 태사자: 동료/잡병이 끼어들지 않는 일기토. */
WEI_RULES[12]={
 init(m){const g=m.guard;if(!g)throw new Error('12판 결투 상대 없음');const cols=m.colonies.filter(c=>!c.hold),others=mobs.filter(q=>q!==g&&!q.col.hold);for(const c of cols)c.hold=true;for(const q of others)q.wuHidden=true;m.wei={lead:g,point:{x:g.hx,y:g.hy},cols,others,allies:allies.splice(0),phase:'approach'};},
 tick(){const w=M.wei;if(w.phase==='approach'&&weiNear(P,w.point,240)){w.phase='duel';w.lead.col.hold=false;wakeColony(w.lead.col);showBanner('일기토 · 1대1 승부!',2.4);}if(w.phase==='duel'&&w.lead.dead){for(const c of w.cols)c.hold=false;for(const q of w.others)q.wuHidden=false;for(const a of w.allies){a.x=P.x;a.y=P.y+70;allies.push(a);}w.allies=[];weiExit('일기토 승리 · 문이 열렸다');}},
 canHit(q){return q!==M.wei.lead||M.wei.phase==='duel';},
 text(){return M.wei.phase==='approach'?'결투장에 들어가라':'일기토 · NPC 결투장을 제압하라';},
 target(){return M.wei.lead;},
 draw(){weiMark(M.wei.point,'일기토','#ffd36b',240);weiMark(M.wei.lead,'NPC 결투장','#ff9b70');}
};
