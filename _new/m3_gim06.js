/* 6판 채문희: 접근해 시선을 끈 뒤, 출발점의 포획진으로 유인한다. */
WEI_RULES[6]={
 init(m){const g=m.guard;if(!g)throw new Error('6판 유인 대상 없음');g.guardL=false;m.wei={lead:g,home:{x:g.x,y:g.y},trap:{x:P.x,y:P.y},phase:'approach',progress:0,caught:0};},
 tick(dt){const w=M.wei;if(w.lead.dead){const c=mkCol(w.home.x/TS,w.home.y/TS,{n:3,leader:true,guard:true,set:M.set,tag:'wei6_lure'});w.lead=c.lead;w.lead.guardL=false;w.phase='approach';w.progress=w.caught=0;showBanner('유인 실패 · 다시 접근하라',2);return;}
 if(w.phase==='approach'){if(weiNear(P,w.lead,170)&&losOpen(P.x,P.y,w.lead.x,w.lead.y,15))w.progress+=dt;else w.progress=0;if(w.progress>=2){w.phase='lured';wakeColony(w.lead.col);showBanner('유혹 성공 · 포획진으로 유인하라',2.5);}}
 else{w.caught=weiNear(w.lead,w.trap,120)?w.caught+dt:0;if(w.caught>=1.5){w.phase='caught';w.lead.down=true;if(w.lead.bs)w.lead.bs.s='down';w.lead.moving=false;weiExit('장수 포획 · 길이 열렸다');}}},
 mob(q,dt){const w=M.wei;if(q!==w.lead||q.dead)return false;q.moving=false;q.face=faceTo(P.x-q.x,P.y-q.y);q.hurt=Math.max(0,q.hurt-dt);if(w.phase==='lured'&&Math.hypot(P.x-q.x,P.y-q.y)>45){chaseMove(q,P,q.sp*dt,dt);q.moving=true;}return true;},
 text(){const w=M.wei;return w.phase==='approach'?'미인계 · 표적 가까이 2초 머물러라':'유혹 성공 · 장수를 분홍 포획진으로 유인하라';},
 target(){const w=M.wei;return w.phase==='approach'?{x:w.lead.x,y:w.lead.y,ent:w.lead}:w.trap;},
 draw(){const w=M.wei;weiMark(w.trap,'포획진','#ff8bcb',120);weiMark(w.lead,w.phase==='approach'?'유인 대상':'유혹 중','#ff8bcb');}
};
