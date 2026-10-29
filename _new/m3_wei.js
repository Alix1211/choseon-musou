/* 위나라 추가 규칙. 나라·능력치·기존 맵·원고는 그대로 사용한다. */
const WEI_RULES={};
function weiActive(){return M&&M.wei&&M.mis==='wei'+M.n;}
function weiInit(m){const r=WEI_RULES[m.n];if(!r||!m.gim||!['wei','wu'].some(k=>m.gim.startsWith(k)))return false;m.wei={};m.mis='wei'+m.n;r.init(m);return true;}
function weiTick(dt){if(!weiActive()||M.ended||M.trans||UI.mode!=='battle'||UI.paused)return false;const r=WEI_RULES[M.n];if(P.mode==='dead'){if(r.death)r.death();return false;}if(!['manual','hunt'].includes(P.mode))return false;r.tick(dt);return false;}
function weiHit(rad){if(weiActive()&&UI.mode==='battle'&&!UI.paused&&['manual','hunt'].includes(P.mode)){const r=WEI_RULES[M.n];if(r.hit)r.hit(rad||120);}}
function weiText(){return WEI_RULES[M.n].text();}
function weiTarget(){return WEI_RULES[M.n].target();}
function weiDraw(){if(weiActive())WEI_RULES[M.n].draw();}
function weiNear(a,b,r){return Math.hypot(a.x-b.x,(a.y-b.y)/YR)<=r;}
function weiExit(msg){M.mis='exit';openExit();showBanner(msg,2.4);}
function weiPoints(m,count){
 const st={x:P.x,y:P.y},rs=m.L.rooms.filter(r=>r!==m.L.st&&!r.keep&&r!==m.L.exitRoom);
 rs.sort((a,b)=>(m.L.adj[a.idx].length===1?-10000:0)-(m.L.adj[b.idx].length===1?-10000:0)+Math.hypot(b.cx*TS-st.x,b.cy*TS-st.y)-Math.hypot(a.cx*TS-st.x,a.cy*TS-st.y));
 const pts=[];for(const r of rs){const cs=m.colonies.filter(c=>!c.hold&&m.L.inRoom(r,c.cx/TS,c.cy/TS));for(const c of cs){if(blockedAt(c.cx,c.cy,18)||pts.some(p=>Math.hypot(p.x-c.cx,p.y-c.cy)<240))continue;pts.push({x:c.cx,y:c.cy,col:c});break;}if(pts.length===count)break;}
 if(pts.length!==count)throw new Error(m.n+'판 목표 배치 실패');return pts;
}
function weiMark(p,label,color,r){
 cx.save();cx.strokeStyle=color||'#ffd36b';cx.fillStyle=color||'#ffd36b';cx.lineWidth=3;cx.beginPath();cx.ellipse(p.x,p.y,r||65,(r||65)*YR,0,0,Math.PI*2);cx.stroke();cx.font='bold 18px system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=5;cx.strokeStyle='#201426';cx.strokeText(label,p.x,p.y-100);cx.fillText(label,p.x,p.y-100);cx.restore();
}

function weiMob(q,dt){if(q.col&&q.col.weiHidden)return true;if(!weiActive())return false;const r=WEI_RULES[M.n];return r.mob?r.mob(q,dt):false;}
/* 기존 고리 통로 한 곳만 닫는다. 우회로/방 도달성을 보존하는 후보만 사용. */
function weiRoute(g,a,b){const W=g[0].length,H=g.length,s=Math.floor(a.y/TS)*W+Math.floor(a.x/TS),end=Math.floor(b.y/TS)*W+Math.floor(b.x/TS),d=new Int16Array(W*H).fill(-1),q=[s];d[s]=0;for(let i=0;i<q.length;i++){const v=q[i];if(v===end)return d[v];const x=v%W,y=v/W|0;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||g[ny][nx]!==1)continue;const k=ny*W+nx;if(d[k]>=0)continue;d[k]=d[v]+1;q.push(k);}}return -1;}
function weiFindGate(m){
 const base=m.L.wideRooms();
 for(const pts of m.L.paths.values())for(let i=6;i<pts.length-6;i+=3){const [x,y]=pts[i];if(m.L.rooms.some(r=>Math.abs(x-r.cx)<r.rx+1&&Math.abs(y-r.cy)<r.ry+1))continue;
 const ends=[pts[Math.max(0,i-6)],pts[Math.min(pts.length-1,i+6)]].map(([a,b])=>({x:(a+.5)*TS,y:(b+.5)*TS}));if(ends.some(p=>blockedAt(p.x,p.y,18)))continue;
 const cells=[];for(let yy=y-2;yy<=y+2;yy++)for(let xx=x-2;xx<=x+2;xx++)if(m.D.g[yy]&&m.D.g[yy][xx]===1)cells.push([xx,yy,m.tk[yy*m.W+xx]]);
 if(!cells.length||mobs.some(q=>cells.some(([a,b])=>Math.abs(q.x-(a+.5)*TS)<TS*.8&&Math.abs(q.y-(b+.5)*TS)<TS*.8)))continue;
 const direct=weiRoute(m.D.g,...ends);for(const [a,b]of cells)m.D.g[b][a]=0;
 const around=weiRoute(m.D.g,...ends),wide=m.L.wideRooms();const ok=around>=direct+4&&base.every((v,k)=>!v||wide[k]);
 for(const [a,b]of cells)m.D.g[b][a]=1;if(!ok)continue;
 ends.sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));return {x:(x+.5)*TS,y:(y+.5)*TS,cells,near:ends[0],far:ends[1],direct,around,open:false};
 }
 throw new Error(m.n+'판 우회 가능한 문 위치 없음');
}
function weiGateSet(gate,open){gate.open=open;for(const [x,y,tk]of gate.cells){M.D.g[y][x]=open?1:0;M.tk[y*M.W+x]=open?tk:0;}M.chunks.clear();M.flow=null;}
function weiDrawGate(g,label){if(g.open)return;weiMark(g,label,'#b7b3c9',55);cx.save();cx.fillStyle='#645e70';cx.fillRect(g.x-55,g.y-100,110,95);cx.strokeStyle='#aaa0ad';cx.lineWidth=4;for(let i=0;i<4;i++)cx.strokeRect(g.x-55+(i%2?12:0),g.y-100+i*24,95,24);cx.restore();}
