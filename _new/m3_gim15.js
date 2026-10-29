/* 15판 육손: 안개 속 돌 미로에서 팔진석을 순서대로 찾는다. */
WEI_RULES[15]={
 init(m){const gates=[];for(let i=0;i<2;i++){let g;try{g=weiFindGate(m);}catch(e){if(!e.message.includes('우회 가능한 문 위치 없음'))throw e;break;}weiGateSet(g,false);gates.push(g);}const stones=weiPoints(m,3).sort((a,b)=>weiRoute(m.D.g,P,a)-weiRoute(m.D.g,P,b));m.wei={gates,stones,index:0,progress:0};},
 tick(dt){const w=M.wei,p=w.stones[w.index];w.progress=weiNear(P,p,90)?w.progress+dt:0;if(w.progress>=1){w.index++;w.progress=0;showBanner('팔진석 '+w.index+'/3 확인',1.6);if(w.index===3){for(const g of w.gates)weiGateSet(g,true);weiExit('팔진 돌파 · 안개가 걷혔다');}}},
 text(){return '안개 미로 · 팔진석 '+Math.min(3,M.wei.index+1)+'번을 찾아라 ('+M.wei.index+'/3)';},
 target(){return M.wei.stones[M.wei.index]||null;},
 draw(){const w=M.wei;for(const g of w.gates)weiDrawGate(g,'돌벽');for(let i=0;i<w.stones.length;i++){const p=w.stones[i];weiMark(p,'팔진석 '+(i+1),i<w.index?'#81dfc1':'#b7c6ff');cx.fillStyle='#727d98';cx.fillRect(p.x-25,p.y-70,50,65);cx.strokeStyle='#b7c6ff';cx.lineWidth=4;cx.strokeRect(p.x-25,p.y-70,50,65);}},
 overlay(){wuFog(280,'75,86,108');}
};
