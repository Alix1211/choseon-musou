/* 위나라 추가 규칙. 나라·능력치·기존 맵·원고는 그대로 사용한다. */
const WEI_RULES={};
function weiActive(){return M&&M.wei&&M.mis==='wei'+M.n;}
function weiInit(m){const r=WEI_RULES[m.n];if(!r||!m.gim||!m.gim.startsWith('wei'))return false;m.wei={};m.mis='wei'+m.n;r.init(m);return true;}
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

function weiMob(q,dt){if(!weiActive())return false;const r=WEI_RULES[M.n];return r.mob?r.mob(q,dt):false;}
