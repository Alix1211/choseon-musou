/* 11판 황개: 물길의 불배 점화 → 적진 충돌 → 화공 성공. */
WEI_RULES[11]={
 init(m){const r=wuBoatRoute(m);m.wei={...r,boat:{...r.path[0]},index:1,phase:'launch',burn:0};},
 hit(rad){const w=M.wei;if(w.phase==='launch'&&weiNear(P,w.launch,rad)){w.phase='sail';showBanner('불배 출격!',2);}},
 tick(dt){const w=M.wei;if(w.phase==='sail'){let left=160*dt;while(left>0&&w.index<w.path.length){const p=w.path[w.index],dx=p.x-w.boat.x,dy=p.y-w.boat.y,d=Math.hypot(dx,dy);if(d<=left){w.boat.x=p.x;w.boat.y=p.y;left-=d;w.index++;}else{w.boat.x+=dx/d*left;w.boat.y+=dy/d*left;left=0;}}if(w.index===w.path.length){w.phase='burn';w.burn=4;showBanner('적진에 불이 붙었다!',2);}}else if(w.phase==='burn'){w.burn=Math.max(0,w.burn-dt);if(!w.burn)weiExit('화계 성공 · 적진 돌파');}},
 text(){const w=M.wei;return w.phase==='launch'?'물가의 불배를 공격해 점화하라':w.phase==='sail'?'불배가 적진으로 돌진 중':'적진 화공 중';},
 target(){const w=M.wei;return w.phase==='launch'?w.launch:w.camp;},
 draw(){const w=M.wei;weiMark(w.launch,'불배 진수장','#ffbf73');weiMark(w.camp,'적진','#ff866a');cx.save();cx.fillStyle='#83542f';cx.beginPath();cx.moveTo(w.boat.x,w.boat.y-50);cx.lineTo(w.boat.x+28,w.boat.y-20);cx.lineTo(w.boat.x+22,w.boat.y+40);cx.lineTo(w.boat.x-22,w.boat.y+40);cx.lineTo(w.boat.x-28,w.boat.y-20);cx.closePath();cx.fill();cx.strokeStyle='#d8ab65';cx.lineWidth=4;cx.stroke();cx.fillStyle='#e9c796';cx.fillRect(w.boat.x-3,w.boat.y-80,6,100);cx.beginPath();cx.moveTo(w.boat.x,w.boat.y-76);cx.lineTo(w.boat.x+42,w.boat.y-36);cx.lineTo(w.boat.x,w.boat.y-20);cx.fill();cx.restore();if(w.phase!=='launch')wuFlames(w.boat,70);if(w.phase==='burn')wuFlames(w.camp,130);}
};
