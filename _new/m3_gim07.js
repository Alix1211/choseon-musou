/* 7판 조비: 조용한 길의 복병과 출발 구역 퇴로 봉쇄. */
WEI_RULES[7]={
 init(m){const p=weiPoints(m,1)[0],st=m.D.start;const rx=Math.ceil(m.L.st.rx+2),ry=Math.ceil(m.L.st.ry+2),cells=[];
 for(let y=st.cy-ry;y<=st.cy+ry;y++)for(let x=st.cx-rx;x<=st.cx+rx;x++){if(Math.abs(x-st.cx)!==rx&&Math.abs(y-st.cy)!==ry)continue;if(m.D.g[y]&&m.D.g[y][x]===1)cells.push([x,y,m.tk[y*m.W+x]]);}
 const cols=m.colonies.filter(c=>!c.hold);for(const c of cols)c.hold=true;m.wei={point:p,cols,cells,phase:'quiet',blocked:false};},
 tick(){const w=M.wei;if(w.phase==='quiet'&&weiNear(P,w.point,210)){w.phase='ambush';w.blocked=true;for(const [x,y]of w.cells)M.D.g[y][x]=0;M.flow=null;for(const c of w.cols){c.hold=false;wakeColony(c);}showBanner('복병! 퇴로가 막혔다',2.4);}
 if(w.phase==='ambush'&&w.cols.every(c=>c.mobs.every(q=>q.dead))){this.restore();weiExit('복병 격파 · 퇴로와 성문 개방');}},
 restore(){const w=M.wei;for(const [x,y]of w.cells)M.D.g[y][x]=1;w.blocked=false;M.flow=null;},
 death(){this.restore();},
 text(){return M.wei.phase==='quiet'?'조용한 길을 조사하라':'복병을 모두 격파하라 · 퇴로 봉쇄';},
 target(){const w=M.wei;if(w.phase==='quiet')return w.point;return mobs.find(q=>!q.dead&&w.cols.includes(q.col))||null;},
 draw(){const w=M.wei;if(w.phase==='quiet')return;for(const [x,y]of w.cells)if(w.blocked){cx.fillStyle='#6b372c';cx.fillRect(x*TS,y*TS,TS,TS);cx.strokeStyle='#d39756';cx.lineWidth=3;cx.strokeRect(x*TS+3,y*TS+3,TS-6,TS-6);}}
};
