/* 17판 주유: 동남풍까지 버티며 쇠사슬 연결을 끊는다. */
WEI_RULES[17]={
 init(m){m.wei={chains:weiPoints(m,3).map(p=>({...p,broken:false})),left:60,next:15,waves:0};},
 hit(rad){for(const c of M.wei.chains)if(!c.broken&&weiNear(P,c,rad)){c.broken=true;debris(c.x,c.y,35,10);showBanner('쇠사슬 절단!',1.8);}},
 tick(dt){const w=M.wei;w.left=Math.max(0,w.left-dt);const elapsed=60-w.left;while(w.waves<3&&elapsed>=w.next){const p=w.chains[w.waves],c=mkCol(p.x/TS,p.y/TS,{n:4,leader:false,set:M.set,tag:'wu17_wave'});wakeColony(c);w.waves++;w.next+=15;showBanner('적 증원 · 바람을 기다려라',1.6);}if(w.left===0&&w.chains.every(c=>c.broken))weiExit('동남풍 도착 · 쇠사슬 연결 저지 성공');},
 death(){const w=M.wei;w.left=60;w.next=15;for(const c of w.chains)c.broken=false;},
 text(){const w=M.wei;return (w.left>0?'동남풍까지 '+Math.ceil(w.left)+'초':'동남풍 도착')+' · 쇠사슬 '+w.chains.filter(c=>c.broken).length+'/3';},
 target(){return M.wei.chains.find(c=>!c.broken)||M.wei.chains[0];},
 draw(){for(const c of M.wei.chains){weiMark(c,c.broken?'끊어진 쇠사슬':'쇠사슬 연결부',c.broken?'#818c9c':'#b9c8e9');cx.save();cx.strokeStyle=c.broken?'#586272':'#aebad0';cx.lineWidth=7;for(let i=0;i<5;i++){if(c.broken&&i===2)continue;cx.beginPath();cx.ellipse(c.x+(i-2)*22,c.y-25,18,10,0,0,Math.PI*2);cx.stroke();}cx.restore();}const p=M.wei.chains[0];weiMark({x:p.x,y:p.y-150},M.wei.left?'동남풍 대기':'동남풍','#9be6cc');}
};
