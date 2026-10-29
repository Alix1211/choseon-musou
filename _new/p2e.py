# ── 5. NPC 거점병장(오오라 없음) · 벽에 걸린 적/동료가 돌아가게 하는 길찾기 ──
# 5-1. 오오라는 없앴다 : 거점병장 · 군락 대장 모두 (그림 · 부하 강화 효과 · 쓰러질 때 '사기 꺾임' 문구)
rep("function drawLeaderAuras(x0,y0,vw,vh){","function drawLeaderAuras(x0,y0,vw,vh){return;")
rep("function auraOf(m){","function auraOf(m){return 0;")
# 대장 몸 주변의 색 번짐(오오라)도 그리지 않는다. 머리 위 ▼ 표시는 그대로 둔다.
rep("if(m.leader){const p=.5+.5*Math.sin(time*3+m.seed),h=mobH(m);cx.save();","if(m.leader){}else if(false){const p=.5+.5*Math.sin(time*3+m.seed),h=mobH(m);cx.save();")
rep("if(m.leader){const c=AUC[m.set];fx.push({k:'shock',x:m.x,y:m.y,R:m.aur*.7,t:0,life:.5,small:true});pops.push({x:m.x,y:m.y-mobH(m)*1.15,t:0,txt:'군락 사기 꺾임',col:'rgb('+c.join(',')+')',size:20,vy:-30});}\n","")

# 5-2. 길찾기 : 초선 위치에서 퍼져 나가는 거리장(타일 단위)을 0.5초마다 또는 초선이 타일을 옮길 때 새로 만든다.
#      시야가 트여 있으면 곧장, 벽에 가로막히면 거리장이 낮아지는 쪽으로 돌아간다.
DEFS=r"""/* ───────── 벽에 걸리지 않기 : 시야가 막히면 길을 따라 돌아간다 ───────── */
const FLOWNB=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function losOpen(x0,y0,x1,y1,r){
  const dx=x1-x0,dy=y1-y0,n=Math.ceil(Math.hypot(dx,dy)/20);
  for(let i=1;i<n;i++){const k=i/n;if(blockedAt(x0+dx*k,y0+dy*k,r))return false;}
  return true;
}
function flowUpdate(){
  const g=M.D.g,H=g.length,W=g[0].length;
  let f=M.flow;
  if(!f||f.W!==W||f.H!==H)f=M.flow={W,H,d:new Int16Array(W*H),q:new Int32Array(W*H),px:-9,py:-9,t:-9};
  const px=Math.floor(P.x/TS),py=Math.floor(P.y/TS);
  if(px===f.px&&py===f.py&&time-f.t<.5&&time>=f.t)return f;
  f.px=px;f.py=py;f.t=time;
  const dd=f.d,q=f.q;dd.fill(-1);
  if(px<0||py<0||px>=W||py>=H)return f;
  let h=0,tl=0;dd[py*W+px]=0;q[tl++]=py*W+px;
  while(h<tl){
    const c=q[h++],ax=c%W,ay=(c/W)|0,nv=dd[c]+1;
    for(let k=0;k<8;k++){
      const ox=FLOWNB[k][0],oy=FLOWNB[k][1],nx=ax+ox,ny=ay+oy;
      if(nx<0||ny<0||nx>=W||ny>=H)continue;
      const ni=ny*W+nx;if(dd[ni]>=0||g[ny][nx]!==1)continue;
      if(ox&&oy&&(g[ay][nx]!==1||g[ny][ax]!==1))continue;
      dd[ni]=nv;q[tl++]=ni;
    }
  }
  return f;
}
function chaseMove(m,tg,s,dt){
  const dx=tg.x-m.x,dy=tg.y-m.y,d=Math.hypot(dx,dy)||1;
  if(d<TS*1.4){moveEnt(m,dx/d*s,dy/d*s,16);return;}
  m.losT=(m.losT||0)-dt;
  if(m.losT<=0){m.losT=.18+Math.random()*.12;m.los=losOpen(m.x,m.y,tg.x,tg.y,15);}
  if(m.los!==false){moveEnt(m,dx/d*s,dy/d*s,16);return;}
  const f=flowUpdate(),W=f.W,H=f.H,g=M.D.g,tx=Math.floor(m.x/TS),ty=Math.floor(m.y/TS);
  const here=(tx>=0&&ty>=0&&tx<W&&ty<H)?f.d[ty*W+tx]:-1;
  if(here<0){moveEnt(m,dx/d*s,dy/d*s,16);return;}
  let best=here,bx=-1,by=-1;
  for(let k=0;k<8;k++){
    const ox=FLOWNB[k][0],oy=FLOWNB[k][1],nx=tx+ox,ny=ty+oy;
    if(nx<0||ny<0||nx>=W||ny>=H)continue;
    const v=f.d[ny*W+nx];if(v<0||v>=best)continue;
    if(ox&&oy&&(g[ty][nx]!==1||g[ny][tx]!==1))continue;
    best=v;bx=nx;by=ny;
  }
  if(bx<0){moveEnt(m,dx/d*s,dy/d*s,16);return;}
  const ex=(bx+.5)*TS-m.x,ey=(by+.5)*TS-m.y,el=Math.hypot(ex,ey)||1;
  moveEnt(m,ex/el*s,ey/el*s,16);
}
function updateMob(m,dt){"""
rep("function updateMob(m,dt){",DEFS)
rep("if(want){const s=msp*dt*want;moveEnt(m,dx/d*s,dy/d*s,16);m.moving=true;}","if(want){const s=msp*dt*want;if(want>0)chaseMove(m,tg,s,dt);else moveEnt(m,dx/d*s,dy/d*s,16);m.moving=true;}")
rep("if(d>t.reach*.9){const s=msp*dt;moveEnt(m,dx/d*s,dy/d*s,16);m.moving=true;}","if(d>t.reach*.9){const s=msp*dt;chaseMove(m,tg,s,dt);m.moving=true;}")
# 동료도 초선을 따라갈 때 벽에 걸리지 않게 (초선 근처로 향할 때만)
rep("const s=sp*(a.spm||1)*(d>260?1.35:1)*dt;moveEnt(a,dx/d*s,dy/d*s,16);a.moving=true;","const s=sp*(a.spm||1)*(d>260?1.35:1)*dt;if(Math.hypot(tx-P.x,ty-P.y)<90)chaseMove(a,{x:tx,y:ty},s,dt);else moveEnt(a,dx/d*s,dy/d*s,16);a.moving=true;")
