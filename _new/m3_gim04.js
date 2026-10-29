/* 4판 허저: 막다른 보급창 두 곳에 공격으로 불을 붙인다. */
WEI_RULES[4]={
 init(m){m.wei.depots=weiPoints(m,2).map(p=>({...p,burning:0,burnt:false}));},
 hit(rad){for(const d of M.wei.depots)if(!d.burnt&&!d.burning&&weiNear(P,d,rad)){d.burning=3;showBanner('보급창에 불이 붙었다',1.5);}},
 tick(dt){const ds=M.wei.depots;for(const d of ds)if(d.burning){d.burning=Math.max(0,d.burning-dt);if(!d.burning)d.burnt=true;}if(ds.every(d=>d.burnt))weiExit('보급창 소각 · 적 사기가 꺾였다');},
 text(){return '보급창 소각 '+M.wei.depots.filter(d=>d.burnt).length+'/2 · 창고를 공격하라';},
 target(){return M.wei.depots.find(d=>!d.burnt)||null;},
 draw(){for(const d of M.wei.depots){weiMark(d,d.burnt?'잿더미':d.burning?'불타는 보급창':'보급창',d.burnt?'#999':'#ffb268');cx.save();cx.fillStyle=d.burnt?'#453a38':'#916034';cx.fillRect(d.x-45,d.y-65,90,60);cx.strokeStyle='#d5ab69';cx.lineWidth=4;cx.strokeRect(d.x-45,d.y-65,90,60);if(d.burning){cx.fillStyle='#ff8e38';for(let i=0;i<5;i++){cx.beginPath();cx.moveTo(d.x-48+i*20,d.y-25);cx.lineTo(d.x-38+i*20,d.y-100-Math.sin(time*8+i)*20);cx.lineTo(d.x-22+i*20,d.y-25);cx.fill();}}cx.restore();}}
};
