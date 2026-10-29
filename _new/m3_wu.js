/* 오나라 규칙: 검증된 배치/미션 연결부를 재사용한다. */
function wuOverlay(){const fog=weiActive()&&M.n===15,mm=$('mm');if(mm&&mm.dataset.wuFog!==String(fog)){mm.dataset.wuFog=String(fog);mm.style.filter=fog?'blur(8px)':'';mm.style.opacity=fog?'.25':'';}if(weiActive()){const r=WEI_RULES[M.n];if(r.overlay)r.overlay();}}
function wuFlames(p,r){cx.save();cx.fillStyle='#ff8c39';for(let i=0;i<7;i++){const x=p.x+(i-3)*r/4,h=r*(.9+.3*Math.sin(time*9+i));cx.beginPath();cx.moveTo(x-13,p.y);cx.quadraticCurveTo(x+25,p.y-h*.5,x,p.y-h);cx.quadraticCurveTo(x-25,p.y-h*.5,x+17,p.y);cx.fill();}cx.restore();}
function wuPath(g,a,b,water){const W=g[0].length,H=g.length,s=a[1]*W+a[0],end=b?b[1]*W+b[0]:-1,prev=new Int32Array(W*H).fill(-1),q=[s];prev[s]=s;
 for(let i=0;i<q.length;i++){const v=q[i];if(v===end)break;const x=v%W,y=v/W|0;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<2||ny<2||nx>=W-2||ny>=H-2||(water?g[ny][nx]===1:g[ny][nx]!==1))continue;const k=ny*W+nx;if(prev[k]>=0)continue;prev[k]=v;q.push(k);}}
 return {W,prev,q,path(v){if(prev[v]<0)return [];const o=[];while(v!==s){o.push({x:(v%W+.5)*TS,y:((v/W|0)+.5)*TS});v=prev[v];}o.push({x:(s%W+.5)*TS,y:((s/W|0)+.5)*TS});return o.reverse();}};
}
function wuBoatRoute(m){const st=m.D.start,g=m.D.g,W=m.W;let best=null;
 for(let y=st.cy-7;y<=st.cy+7;y++)for(let x=st.cx-7;x<=st.cx+7;x++){if(!g[y]||g[y][x]!==1||!m.seen[y*W+x]||blockedAt((x+.5)*TS,(y+.5)*TS,18))continue;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const ax=x+dx,ay=y+dy;if(!g[ay]||ax<2||ay<2||ax>=W-2||ay>=m.H-2||g[ay][ax]===1)continue;const route=wuPath(g,[ax,ay],null,true);if(!best||route.q.length>best.route.q.length)best={launch:{x:(x+.5)*TS,y:(y+.5)*TS},route};}if(best&&best.route.q.length>200)break;}
 if(!best)throw new Error('11판 불배 진수 위치 없음');let dest=null,score=-1;
 for(const v of best.route.q){const x=v%W,y=v/W|0;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!g[ny]||g[ny][nx]!==1||!m.seen[ny*W+nx]||blockedAt((nx+.5)*TS,(ny+.5)*TS,18))continue;const p={x:(nx+.5)*TS,y:(ny+.5)*TS},d=Math.hypot(p.x-best.launch.x,p.y-best.launch.y);if(d>score){score=d;dest={v,camp:p};}}}
 if(!dest||score<400)throw new Error('11판 적진 물길 없음');const path=best.route.path(dest.v);
 for(const p of path){const x=Math.floor(p.x/TS),y=Math.floor(p.y/TS);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(g[y+dy]&&g[y+dy][x+dx]!==1)m.tk[(y+dy)*W+x+dx]=5;}
 m.props=m.props.filter(p=>m.tk[Math.floor(p.y/TS)*W+Math.floor(p.x/TS)]!==5);m.theme='summer';m.chunks.clear();return {launch:best.launch,camp:dest.camp,path};
}
function wuCanHit(q){if(!weiActive())return true;const r=WEI_RULES[M.n];return r.canHit?r.canHit(q):true;}
function wuFog(radius,shade){const g=cx.createRadialGradient(P.x,P.y,60,P.x,P.y,radius);g.addColorStop(0,'rgba('+shade+',0)');g.addColorStop(.6,'rgba('+shade+',.18)');g.addColorStop(1,'rgba('+shade+',.94)');cx.save();cx.fillStyle=g;cx.fillRect(0,0,M.W*TS,M.H*TS);cx.restore();}
function wuFail(msg){const w=M.wei;if(w.failed)return;w.failed=true;M.ended=true;stopInput();P.mode='dead';P.tt=0;P.atk=null;P.sk=null;P.state='idle';S.deaths++;shots.length=zones.length=wards.length=0;showBanner(msg+' · 다시 도전',2);}
