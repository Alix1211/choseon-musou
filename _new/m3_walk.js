/* 일반 병사 이동: 정면 0 / 오른쪽 측면 1 / 후면 2, 방향별 4프레임·6fps.
   실제 전투 수치·충돌·이동은 그대로 두고 그림만 교체한다. */
function soldierWalkFrame(m,dir){
  const key=m.set+':'+m.type,wk=SOLDIER_WALK[key];
  if(!wk||!A.soldierWalk||!A.soldierWalk[key]||!m.moving||m.dead||m.down||m.wind>0||m.lunge>0||m.stun>0)return null;
  const row=dir==='front'?0:dir==='side'?1:2,col=Math.floor((time+m.seed)*6)%4;
  return {key,row,col,anchor:wk.rows[row]};
}
function drawSoldierWalk(m,dir,r,alpha){
  const f=soldierWalkFrame(m,dir);if(!f)return false;
  const im=A.soldierWalk[f.key],a=f.anchor,s=r.h/a.h,x=-a.ax*s,y=-a.ay*s,size=362*s;
  // drawMob이 적용하는 방향 반전·개체 크기·투명도를 그대로 재사용.
  cx.drawImage(im,f.col*362,f.row*362,362,362,x,y,size,size);
  if(m.hurt>0){
    const key='sw:'+f.key+':'+f.row+':'+f.col;let c=white.get(key);
    if(!c){c=newCanvas(362,362);const g=c.getContext('2d');g.drawImage(im,f.col*362,f.row*362,362,362,0,0,362,362);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,362,362);white.set(key,c);}
    cx.globalAlpha=alpha*.75*(m.hurt/.14);cx.drawImage(c,x,y,size,size);
  }
  return true;
}
