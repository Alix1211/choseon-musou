/* ───────── 칸 하나의 지형 : 방을 흩뿌리고 복도로 잇는다 (골든퀘스트 방식) ───────── */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash2(x,y,s){let h=Math.imul((x*374761393+y*668265263+(s|0)*2246822519)|0,1274126177);h^=h>>>13;h=Math.imul(h,1597334677);return((h^h>>>16)>>>0)/4294967296;}
const THEME_OF=[null,'spring','summer','swamp','autumn','autumn','spring','ice','summer','autumn','spring','volcano','summer','spring','autumn','volcano','winter','ice','swamp','summer','autumn','spring','summer','volcano','autumn','spring','summer','spring','winter','summer','autumn','volcano','summer','spring','swamp','autumn','winter','volcano','volcano','swamp','volcano'];
const CHT=8,VP=5.4;
const GIM_OF={1:'commander',3:'vents'};
const SZ={s:{W:42,H:38,rn:9},m:{W:54,H:48,rn:12},l:{W:62,H:54,rn:14}};
/* tk : 0 막힘 · 1 바닥 · 3 카펫 · 4 진영 흙 · 5 못/용암(막힘) · 6 길 */
function genKan(n,sp){
  const R=mulberry(n*7919+sp.i*104729+sp.t.charCodeAt(0)*977+101),rr=(a,b)=>a+R()*(b-a),ri=(a,b)=>Math.floor(rr(a,b+1));
  const z=SZ[sp.sz]||SZ.m,W=z.W,H=z.H,round='FWSIVC'.includes(sp.t),out='FWSIV'.includes(sp.t);
  const rooms=[];
  let keep=null;
  if(sp.last){
    const w=ri(9,11),h=ri(7,9),x=(sp.i%2===0)?W-3-w:3,y=ri(5,H-h-5);
    keep={x,y,w,h,cx:x+w/2,cy:y+h/2,rx:w/2,ry:h/2,round:false,idx:0,keep:true};rooms.push(keep);
  }
  for(let tr=0;tr<2500&&rooms.length<z.rn;tr++){
    let r;
    if(round){const rx=rr(3.5,5.6),ry=rr(3.1,4.8);r={cx:rr(rx+3,W-rx-3),cy:rr(ry+3,H-ry-3),rx,ry,ph1:rr(0,6.28),ph2:rr(0,6.28)};}
    else{const w=ri(7,11),h=ri(6,9),x=ri(3,W-w-3),y=ri(4,H-h-3);r={x,y,w,h,cx:x+w/2,cy:y+h/2,rx:w/2,ry:h/2};}
    r.round=round;
    const mg=tr>1200?2.0:2.8;
    if(rooms.some(q=>Math.abs(q.cx-r.cx)<q.rx+r.rx+(q.keep?8:mg)&&Math.abs(q.cy-r.cy)<q.ry+r.ry+(q.keep?8:mg)))continue;
    r.idx=rooms.length;rooms.push(r);
  }
  // 시작 방 : 짝수 칸은 서쪽, 홀수 칸은 동쪽
  let st=rooms.find(q=>!q.keep);for(const q of rooms)if(!q.keep&&(sp.i%2===0?q.cx<st.cx:q.cx>st.cx))st=q;
  const dist=(a,b)=>Math.hypot(a.cx-b.cx,a.cy-b.cy);
  const E=[],inT=new Set([st.idx]);
  const nk=rooms.filter(q=>!q.keep).length;
  while(inT.size<nk){let best=null;for(const a of rooms)if(inT.has(a.idx))for(const b of rooms)if(!inT.has(b.idx)&&!b.keep){const d=dist(a,b);if(!best||d<best.d)best={a,b,d};}E.push([best.a.idx,best.b.idx]);inT.add(best.b.idx);}
  const adj=()=>{const A=rooms.map(()=>[]);for(const [a,b] of E){A[a].push(b);A[b].push(a);}return A;};
  const bfsR=(A,s)=>{const d=rooms.map(()=>-1);d[s]=0;const q=[s];for(let h=0;h<q.length;h++)for(const v of A[q[h]])if(d[v]<0){d[v]=d[q[h]]+1;q.push(v);}return d;};
  let A=adj(),dep=bfsR(A,st.idx);
  // 마지막 칸 : 내성(영웅) 방은 부장 방(가장 가까운 방)에만 이어진다
  let guard=null;
  if(sp.last){
    let bd=1e9;for(const q of rooms)if(!q.keep&&q!==st){const d=dist(q,keep);if(d<bd){bd=d;guard=q;}}
    E.push([guard.idx,keep.idx]);A=adj();dep=bfsR(A,st.idx);
  }
  // 고리 : 가까운 두 방을 더 이어 돌아가는 길을 만든다
  const has=(a,b)=>E.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));
  const cand=[];for(const a of rooms)for(const b of rooms)if(a.idx<b.idx&&!has(a.idx,b.idx)&&dist(a,b)<19&&a!==keep&&b!==keep)cand.push([dist(a,b),a.idx,b.idx]);
  cand.sort((p,q)=>p[0]-q[0]);
  const loops=Math.min(cand.length,ri(2,3)+(sp.sz==='l'?1:0));
  for(let k=0;k<loops;k++){const c=cand.splice(Math.floor(R()*Math.min(4,cand.length)),1)[0];if(c)E.push([c[1],c[2]]);}
  A=adj();
  // 출구 방 : 가장 먼 막다른 방(마지막 칸은 부장 방)
  const gd=bfsR(A,st.idx);
  let exitRoom=guard;
  if(!exitRoom){let bd=-1;for(const q of rooms)if(q!==st&&A[q.idx].length===1&&gd[q.idx]>bd){bd=gd[q.idx];exitRoom=q;}if(!exitRoom){for(const q of rooms)if(q!==st&&gd[q.idx]>bd){bd=gd[q.idx];exitRoom=q;}}}
  // ── 파내기 ──
  const g=Array.from({length:H},()=>new Uint8Array(W)),tk=new Uint8Array(W*H),fl=new Uint8Array(W*H);
  const inb=(x,y)=>x>1&&x<W-2&&y>2&&y<H-2;
  const disc=(px,py,rad,fn)=>{for(let y=Math.floor(py-rad);y<=Math.ceil(py+rad);y++)for(let x=Math.floor(px-rad);x<=Math.ceil(px+rad);x++)if(inb(x,y)&&(x+.5-px)*(x+.5-px)+(y+.5-py)*(y+.5-py)<=rad*rad)fn(x,y);};
  const inRoom=(r,x,y)=>{
    if(r.round){const dx=(x+.5-r.cx)/r.rx,dy=(y+.5-r.cy)/r.ry,a=Math.atan2(dy,dx),f=1+.14*Math.sin(3*a+r.ph1)+.08*Math.sin(5*a+r.ph2);return dx*dx+dy*dy<=f*f;}
    return x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;
  };
  for(const r of rooms){
    const bx0=Math.floor(r.cx-r.rx*1.3-2),bx1=Math.ceil(r.cx+r.rx*1.3+2),by0=Math.floor(r.cy-r.ry*1.3-2),by1=Math.ceil(r.cy+r.ry*1.3+2);
    for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){
      if(!inb(x,y)||!inRoom(r,x,y))continue;
      if(!r.round){ // 모서리 한 칸씩 깎아 네모가 덜 티 나게
        const cxn=(x===r.x||x===r.x+r.w-1),cyn=(y===r.y||y===r.y+r.h-1);
        if(cxn&&cyn&&hash2(x,y,n+sp.i)<.6)continue;
      }
      g[y][x]=1;
    }
  }
  const paths=new Map();
  const bez=(ax,ay,bx,by)=>{
    const mx=(ax+bx)/2+rr(-5,5),my=(ay+by)/2+rr(-5,5),N=Math.max(8,Math.ceil(Math.hypot(bx-ax,by-ay)*1.1/.8)),pts=[];
    for(let i=0;i<=N;i++){const t=i/N,u=1-t;pts.push([u*u*ax+2*u*t*mx+t*t*bx,u*u*ay+2*u*t*my+t*t*by]);}
    return pts;
  };
  const rad=sp.t==='C'?1.55:out?1.85:0;
  for(const [ai,bi] of E){
    const a=rooms[ai],b=rooms[bi],pts=[];
    const keepEdge=(a===keep||b===keep);
    if(round&&!keepEdge){const p=bez(a.cx,a.cy,b.cx,b.cy);for(const q of p){disc(q[0],q[1],rad,(x,y)=>{g[y][x]=1;});pts.push([Math.floor(q[0]),Math.floor(q[1])]);}}
    else{ // L자 복도, 폭 3칸
      const ax=Math.round(a.cx-.5),ay=Math.round(a.cy-.5),bx=Math.round(b.cx-.5),by=Math.round(b.cy-.5),hf=R()<.5;
      const seg=[];
      {let x=ax,y=ay;seg.push([x,y]);
        if(hf){while(x!==bx){x+=Math.sign(bx-x);seg.push([x,y]);}while(y!==by){y+=Math.sign(by-y);seg.push([x,y]);}}
        else{while(y!==by){y+=Math.sign(by-y);seg.push([x,y]);}while(x!==bx){x+=Math.sign(bx-x);seg.push([x,y]);}}}
      for(const [x,y] of seg){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inb(x+dx,y+dy))g[y+dy][x+dx]=1;pts.push([x,y]);}
    }
    paths.set(ai+'-'+bi,pts);
  }
  const cells=()=>{let c=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)c+=g[y][x];return c;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)tk[y*W+x]=g[y][x]?1:0;
  const reach=(sx,sy)=>{const seen=new Uint8Array(W*H),q=[sy*W+sx];seen[sy*W+sx]=1;for(let h=0;h<q.length;h++){const c=q[h],x=c%W,y=(c/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||!g[ny][nx])continue;const m=ny*W+nx;if(seen[m])continue;seen[m]=1;q.push(m);}}return seen;};
  const sx=Math.floor(st.cx),sy=Math.floor(st.cy);
  const allReach=()=>{const s=reach(sx,sy);return rooms.every(r=>s[Math.floor(r.cy)*W+Math.floor(r.cx)]||!g[Math.floor(r.cy)][Math.floor(r.cx)]);};
  // 너비 2칸 이상 통로로만 이어졌는지 (플레이어 반경이 있어 1칸 틈은 지나갈 수 없다)
  const blk=(x,y)=>x>=0&&y>=0&&x+1<W&&y+1<H&&g[y][x]===1&&g[y][x+1]===1&&g[y+1][x]===1&&g[y+1][x+1]===1;
  const wide=()=>{
    const seen=new Uint8Array(W*H),cov=new Uint8Array(W*H),q=[];
    for(let a=-5;a<=5;a++)for(let c=-5;c<=5;c++){const x=sx+a,y=sy+c;if(blk(x,y)&&!seen[y*W+x]){seen[y*W+x]=1;q.push(y*W+x);}}
    for(let h=0;h<q.length;h++){const c=q[h],x=c%W,y=(c/W)|0;cov[c]=cov[c+1]=cov[c+W]=cov[c+W+1]=1;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!blk(nx,ny)||seen[ny*W+nx])continue;seen[ny*W+nx]=1;q.push(ny*W+nx);}}
    return cov;
  };
  const wideRooms=()=>{const c=wide();return rooms.map(r=>{const x=Math.floor(r.cx),y=Math.floor(r.cy);return !g[y][x]||!!(c[y*W+x]||c[y*W+x-1]||c[y*W+x+1]||c[(y-1)*W+x]||c[(y+1)*W+x]);});};
  // 못·용암 : 방 안에 물웅덩이 (돌아가야 한다) — 막히면 되돌린다
  if(sp.t!=='H'&&sp.t!=='Y'&&sp.t!=='T'){
    const w0=wideRooms();
    for(const r of rooms){
      if(r===st||r===keep||r===exitRoom||R()>(out?.55:.4)||r.rx<3.6)continue;
      const px=r.cx+rr(-.4,.4)*r.rx,py=r.cy+rr(-.35,.35)*r.ry,pr=rr(1.5,2.4),old=[];
      disc(px,py,pr,(x,y)=>{if(g[y][x]===1&&Math.hypot(x+.5-r.cx,y+.5-r.cy)>1.2){old.push([x,y]);}});
      for(const [x,y] of old){g[y][x]=0;tk[y*W+x]=5;}
      if(!allReach()||wideRooms().some((v,i)=>w0[i]&&!v)){for(const [x,y] of old){g[y][x]=1;tk[y*W+x]=1;}}
    }
  }
  // 길(복도 중심) · 진영 흙
  if(out)for(const [,pts] of paths)for(const [x,y] of pts)disc(x+.5,y+.5,1.15,(xx,yy)=>{if(g[yy][xx]&&tk[yy*W+xx]===1)tk[yy*W+xx]=6;});
  if(sp.i===0&&out)for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(!g[y][x])continue;const dx=(x+.5-st.cx)/(st.rx*.9),dy=(y+.5-st.cy)/(st.ry*.9);
    if(dx*dx+dy*dy<=1+(hash2(x,y,5)-.5)*.35)tk[y*W+x]=4;
  }
  // 바닥 무늬(성 내부) · 카펫
  if(sp.t==='H'||sp.t==='T'){
    const fs=[0,1,2,3,4,5,6];
    for(const r of rooms){const f=fs[Math.floor(R()*fs.length)];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]&&inRoom(r,x,y))fl[y*W+x]=f;}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]&&!rooms.some(r=>inRoom(r,x,y)))fl[y*W+x]=4;
    for(const r of rooms){
      if(sp.t==='T'?r!==keep&&r!==guard:R()>.5)continue;
      const cy=Math.floor(r.cy),cx0=Math.floor(r.cx);
      if(R()<.5){for(let x=r.x;x<r.x+r.w;x++)for(let dy=0;dy<2;dy++)if(g[cy+dy-0][x]&&tk[(cy+dy)*W+x]===1)tk[(cy+dy)*W+x]=3;}
      else{for(let y=r.y;y<r.y+r.h;y++)for(let dx=0;dx<2;dx++)if(g[y][cx0+dx]&&tk[y*W+cx0+dx]===1)tk[y*W+cx0+dx]=3;}
    }
    if(keep)for(let y=keep.y;y<keep.y+keep.h;y++)for(let x=keep.x;x<keep.x+keep.w;x++)if(g[y][x]&&tk[y*W+x]===1&&(x-keep.x>=1&&x-keep.x<keep.w-1&&y-keep.y>=1&&y-keep.y<keep.h-1))tk[y*W+x]=3;
  }
  // ── 출구 문 (북쪽 벽에 2칸 폭) ──
  const notchOf=(r,lv)=>{
    let best=null;const up=lv===0?3:2,sd=lv===2?0:1,cov=wide();
    for(let y=Math.floor(r.cy-r.ry-1);y<=Math.ceil(r.cy+r.ry+1);y++)for(let x=Math.floor(r.cx-r.rx-1);x<=Math.ceil(r.cx+r.rx+1);x++){
      if(!inb(x,y)||!g[y][x]||!g[y][x+1]||!inRoom(r,x,y)||!inRoom(r,x+1,y)||!cov[y*W+x]||!cov[y*W+x+1])continue;
      let ok=true;
      for(let yy=y-up;yy<=y-1&&ok;yy++)for(let xx=x-sd;xx<=x+1+sd;xx++)if(!inb(xx,yy)||g[yy][xx]||tk[yy*W+xx]===5){ok=false;break;}
      if(!ok)continue;
      const sc=-y*1+Math.abs(x+1-r.cx)*.35+R()*.3;if(!best||sc>best.sc)best={x,y,sc};
    }
    return best;
  };
  let exit=null,exitR=null;
  if(!sp.last){
    const order=[exitRoom].concat(rooms.filter(q=>q!==st&&q!==exitRoom).sort((a,b)=>gd[b.idx]-gd[a.idx]));
    for(let lv=0;lv<3&&!exit;lv++)for(const r of order){const nt=notchOf(r,lv);if(nt){exit={x0:nt.x,x1:nt.x+1,y:nt.y-1,fy:nt.y,cx:nt.x+1,room:r};exitR=r;break;}}
    if(exit)exitRoom=exitR;
  }
  // ── 내성문 : 부장 방과 내성 사이 복도 ──
  let gate=null;
  if(keep){
    let key=null;for(const [k] of paths){const [a,b]=k.split('-').map(Number);if(rooms[a]===keep||rooms[b]===keep){key=k;break;}}
    const pts=paths.get(key).slice(),[a0]=key.split('-').map(Number);
    if(rooms[a0]===keep)pts.reverse();          // 부장 방 → 내성
    let i0=pts.length-1;while(i0>0&&inRoom(keep,pts[i0][0],pts[i0][1]))i0--;
    const kx=Math.floor(keep.cx),ky=Math.floor(keep.cy);
    for(let i=Math.max(1,i0-1);i>=1&&!gate;i--){
      const [px,py]=pts[i],[qx,qy]=pts[Math.min(pts.length-1,i+1)];
      const hor=Math.abs(qx-px)>=Math.abs(qy-py);
      const rc=hor?{x0:px,y0:py-2,x1:px+1,y1:py+1}:{x0:px-2,y0:py,x1:px+1,y1:py+1};
      const cl=[];for(let y=rc.y0;y<=rc.y1;y++)for(let x=rc.x0;x<=rc.x1;x++)if(g[y][x]&&inRoom(keep,x,y)===false)cl.push([x,y]);
      for(const [x,y] of cl)g[y][x]=0;
      const sealed=!reach(sx,sy)[ky*W+kx];
      for(const [x,y] of cl)g[y][x]=1;
      if(sealed)gate={x0:rc.x0,y0:rc.y0,x1:rc.x1,y1:rc.y1,iron:true,open:false,t:0,id:'inner',name:'내성문',hor,cells:cl};
    }
  }
  return {W,H,g,tk,fl,rooms,E,paths,st,exit,exitRoom,keep,guard,gate,round,out,dist:gd,adj:A,inRoom,reach,allReach,wide,wideRooms};
}
