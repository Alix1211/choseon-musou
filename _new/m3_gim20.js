/* 20판 손권: 뒤에서부터 무너지는 다리를 제한 시간 안에 건넌다. */
function wu20Restore(){const w=M.wei;if(!w.saved.size)return;for(const [k,tk]of w.saved){M.D.g[k/M.W|0][k%M.W]=1;M.tk[k]=tk;}w.saved.clear();M.chunks.clear();M.flow=null;}
WEI_RULES[20]={
 persistent:true,
 init(m){const end=weiPoints(m,1)[0],a=[m.D.start.cx,m.D.start.cy],b=[Math.floor(end.x/TS),Math.floor(end.y/TS)],r=wuPath(m.D.g,a,b,false),path=r.path(b[1]*m.W+b[0]);if(path.length<12)throw new Error('20판 다리 경로 부족');const limit=Math.max(35,Math.ceil(path.length*TS/100*1.7)+10),indices=new Map();path.forEach((p,i)=>indices.set(Math.floor(p.y/TS)*m.W+Math.floor(p.x/TS),i));
 m.wei={path,indices,checkpoints:[path[Math.floor(path.length/3)],path[Math.floor(path.length*2/3)],path[path.length-1]],index:0,limit,left:limit,phase:'waiting',collapsed:0,saved:new Map(),failed:false};
 for(const p of path){const x=Math.floor(p.x/TS),y=Math.floor(p.y/TS);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(m.D.g[y+dy]&&m.D.g[y+dy][x+dx]===0)m.tk[(y+dy)*m.W+x+dx]=5;}m.props=m.props.filter(p=>m.tk[Math.floor(p.y/TS)*m.W+Math.floor(p.x/TS)]!==5);m.theme='summer';m.chunks.clear();},
 tick(dt){const w=M.wei;if(w.phase==='waiting'){if(!weiNear(P,w.path[0],160))return;w.phase='race';showBanner('다리가 무너진다 · 앞으로 달려라!',2.3);}if(w.phase!=='race')return;w.left=Math.max(0,w.left-dt);if(!w.left){wu20Restore();wuFail('다리 탈출 시간 초과');return;}
 if(weiNear(P,w.checkpoints[w.index],85)){w.index++;if(w.index===3){wu20Restore();w.phase='complete';weiExit('다리 돌파 · 손권에게 가라');return;}}
 const n=Math.max(0,Math.floor(w.path.length*((1-w.left/w.limit-.3)/.7))),before=w.collapsed;while(w.collapsed<n&&w.collapsed<w.path.length){const i=w.collapsed++,p=w.path[i],x=Math.floor(p.x/TS),y=Math.floor(p.y/TS);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,k=yy*M.W+xx;if(!M.D.g[yy]||M.D.g[yy][xx]!==1||(w.indices.has(k)&&w.indices.get(k)>i))continue;if(!w.saved.has(k))w.saved.set(k,M.tk[k]);M.D.g[yy][xx]=0;M.tk[k]=5;}}
 if(w.collapsed>before){M.chunks.clear();M.flow=null;if(blockedAt(P.x,P.y,18)){wu20Restore();wuFail('다리가 무너져 추락했다');}}},
 death(){wu20Restore();const w=M.wei;w.phase='waiting';w.left=w.limit;w.index=w.collapsed=0;},
 text(){const w=M.wei;return '다리 탈출 · '+Math.ceil(w.left)+'초 · 경유지 '+w.index+'/3';},
 target(){const w=M.wei;return w.phase==='waiting'?w.path[0]:w.checkpoints[w.index]||w.path[w.path.length-1];},
 draw(){const w=M.wei;cx.save();for(let i=0;i<w.path.length;i++){const p=w.path[i];if(M.D.g[Math.floor(p.y/TS)][Math.floor(p.x/TS)]!==1)continue;cx.fillStyle=i<w.collapsed?'#615849':'#81552f';cx.fillRect(p.x-TS*.7,p.y-TS*.55,TS*1.4,TS*1.1);cx.strokeStyle='#cca274';cx.lineWidth=3;for(let j=-1;j<=1;j++){cx.beginPath();cx.moveTo(p.x-TS*.65,p.y+j*14);cx.lineTo(p.x+TS*.65,p.y+j*14);cx.stroke();}}cx.restore();for(let i=0;i<3;i++)weiMark(w.checkpoints[i],i===2?'다리 출구':'경유지 '+(i+1),i<w.index?'#80dfb3':'#ffd36b',70);}
};
