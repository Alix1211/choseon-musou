/* 16판 대교: 세 발판에 1초씩 서서 문을 연다. 순서는 자유. */
WEI_RULES[16]={
 init(m){m.wei={switches:weiPoints(m,3).map((p,i)=>({...p,id:i+1,on:false,progress:0}))};},
 tick(dt){const ss=M.wei.switches;for(const s of ss)if(!s.on){s.progress=weiNear(P,s,80)?s.progress+dt:0;if(s.progress>=1){s.on=true;showBanner('발판 '+s.id+' 작동',1.5);}}if(ss.every(s=>s.on))weiExit('세 발판 작동 · 문이 열렸다');},
 text(){return '발판 작동 '+M.wei.switches.filter(s=>s.on).length+'/3 · 발판 위에 머물러라';},
 target(){return M.wei.switches.filter(s=>!s.on).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0]||null;},
 draw(){for(const s of M.wei.switches){weiMark(s,'발판 '+s.id+(s.on?' · 작동':''),s.on?'#74dfb8':'#a5b6ff',80);cx.save();cx.fillStyle=s.on?'#579b81':'#605c83';cx.fillRect(s.x-35,s.y-20,70,40);cx.strokeStyle=s.on?'#a8ffd7':'#d2c7ff';cx.lineWidth=4;cx.strokeRect(s.x-35,s.y-20,70,40);cx.restore();}}
};
