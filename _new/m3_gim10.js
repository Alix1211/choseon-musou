/* 10판 조조: 모든 칸에서 복병 세 차례를 돌파한 뒤 내성 구출로 이어진다. */
WEI_RULES[10]={
 init(m){const cols=m.colonies.filter(c=>!c.hold).sort((a,b)=>Math.hypot(a.cx-P.x,a.cy-P.y)-Math.hypot(b.cx-P.x,b.cy-P.y));if(cols.length<3)throw new Error('10판 복병 구역 부족');const groups=[[],[],[]];cols.forEach((c,i)=>{c.hold=true;c.weiHidden=true;groups[Math.min(2,Math.floor(i*3/cols.length))].push(c);});m.wei={groups,index:0,phase:'approach'};},
 tick(){const w=M.wei,cs=w.groups[w.index];if(!cs)return;
 if(w.phase==='approach'&&weiNear(P,{x:cs[0].cx,y:cs[0].cy},230)){w.phase='fight';for(const c of cs){c.hold=false;c.weiHidden=false;wakeColony(c);}showBanner('복병 '+(w.index+1)+'/3 출현!',2);}
 if(w.phase==='fight'&&cs.every(c=>c.mobs.every(q=>q.dead))){w.index++;w.phase='approach';if(w.index<3){showBanner('복병 격파 · 다음 길로',1.8);return;}if(M.sp.last){M.mis='guard';if(M.captain.dead)onCaptainDead(M.captain);showBanner('연속 복병 돌파 · 내성으로',2.4);}else weiExit('연속 복병 돌파 · 다음 구역으로');}},
 text(){const w=M.wei,cs=w.groups[w.index]||[];return '연속 복병 '+Math.min(3,w.index+1)+'/3 · '+(w.phase==='approach'?'길을 따라 전진하라':cs.reduce((n,c)=>n+c.mobs.filter(q=>!q.dead).length,0)+'명 남음');},
 target(){const w=M.wei,cs=w.groups[w.index];if(!cs)return null;if(w.phase==='approach')return {x:cs[0].cx,y:cs[0].cy};return mobs.find(q=>!q.dead&&cs.includes(q.col))||null;},
 draw(){const w=M.wei;if(w.phase==='approach'){const p=this.target();if(p)weiMark(p,'진격로 '+(w.index+1),'#ffaf75');}}
};
