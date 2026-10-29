/* 14판 감녕: 어둠 속 횃불을 부수어 적을 혼란시킨다. */
WEI_RULES[14]={
 init(m){m.wei={torches:weiPoints(m,3).map(p=>({...p,broken:false})),confused:0};},
 hit(rad){const w=M.wei;for(const t of w.torches)if(!t.broken&&weiNear(P,t,rad)){t.broken=true;w.confused=4;shots.length=0;debris(t.x,t.y,30,8);showBanner('횃불 파괴 · 적 혼란!',2);}},
 tick(dt){const w=M.wei;w.confused=Math.max(0,w.confused-dt);if(w.torches.every(t=>t.broken))weiExit('야습 성공 · 길이 열렸다');},
 mob(q,dt){if(M.wei.confused<=0||q.dead||q.boss)return false;q.wind=0;q.moving=false;q.hurt=Math.max(0,q.hurt-dt);return true;},
 text(){return '야습 · 횃불 파괴 '+M.wei.torches.filter(t=>t.broken).length+'/3'+(M.wei.confused>0?' · 적 혼란':'');},
 target(){return M.wei.torches.filter(t=>!t.broken).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0]||null;},
 draw(){for(const t of M.wei.torches){weiMark(t,t.broken?'꺼진 횃불':'적 횃불',t.broken?'#808896':'#ffb56b');cx.strokeStyle='#8d6348';cx.lineWidth=8;cx.beginPath();cx.moveTo(t.x,t.y);cx.lineTo(t.x,t.y-70);cx.stroke();if(!t.broken)wuFlames({x:t.x,y:t.y-60},35);}},
 overlay(){wuFog(300+M.wei.torches.filter(t=>t.broken).length*75,'2,5,16');}
};
