/* 5판 장료: 성문 앞 60초 방어 후 역습. 기존 부대·문·길찾기를 재사용. */
function gim05Init(m){
  const g=m.guard;if(!g||!m.exit)throw new Error('5판 방어 위치 없음');
  const x=g.hx,y=g.hy;
  const spots=m.colonies.filter(c=>!c.hold&&Math.hypot(c.cx-x,c.cy-y)>320)
    .sort((a,b)=>Math.hypot(a.cx-x,a.cy-y)-Math.hypot(b.cx-x,b.cy-y)).slice(0,2)
    .map(c=>({x:c.cx,y:c.cy}));
  if(!spots.length)throw new Error('5판 증원 위치 없음');
  m.defense05={x,y,r:260,left:60,wave:15,spots,oldGuard:g};
  // 방어 전의 수문장을 먼저 잡아도 문이 열리지 않는다.
  g.guardL=false;m.mis='defend05';
}
function gim05Text(){
  const d=M.defense05;
  return '성문 방어 · '+Math.ceil(d.left)+'초'+(Math.hypot(P.x-d.x,P.y-d.y)>d.r?' · 금빛 원으로':'');
}
function gim05Tick(dt){
  const m=M,d=m.defense05;
  if(!d||m.mis!=='defend05'||m.ended||m.trans||UI.mode!=='battle'||UI.paused)return;
  if(P.mode==='dead'){d.left=60;d.wave=15;return;}
  if(P.mode!=='manual'&&P.mode!=='hunt')return;
  // 금빛 원을 떠나면 진행만 멈춘다. 방어 전에 이동한 시간은 포함하지 않는다.
  if(Math.hypot(P.x-d.x,P.y-d.y)>d.r)return;
  d.left=Math.max(0,d.left-dt);
  const elapsed=60-d.left;
  while(d.wave<=45&&elapsed>=d.wave){
    const p=d.spots[(d.wave/15-1)%d.spots.length];
    const c=mkCol(p.x/TS,p.y/TS,{n:4,leader:false,set:m.set,tag:'gpt05_wave'});
    wakeColony(c);d.wave+=15;
    showBanner('적 증원!',1.2);
  }
  if(d.left>0)return;
  const c=mkCol(d.x/TS,d.y/TS,{n:4,leader:true,guard:true,set:m.set,tag:'gpt05_counter'});
  m.guard=c.lead;wakeColony(c);m.mis='guard';
  showBanner('방어 성공 · 수문장을 제압하라',2.4);
}
function drawGim05(){
  const d=M.defense05;if(!d||M.mis!=='defend05')return;
  cx.save();cx.strokeStyle='#ffd36b';cx.lineWidth=4;cx.setLineDash([16,12]);
  cx.beginPath();cx.arc(d.x,d.y,d.r,0,Math.PI*2);cx.stroke();cx.setLineDash([]);
  cx.strokeStyle='#98734b';cx.lineWidth=5;cx.beginPath();cx.moveTo(d.x,d.y);cx.lineTo(d.x,d.y-110);cx.stroke();
  cx.fillStyle='#ffd36b';cx.beginPath();cx.moveTo(d.x+2,d.y-110);cx.lineTo(d.x+66,d.y-94);cx.lineTo(d.x+2,d.y-74);cx.closePath();cx.fill();
  cx.font='800 18px system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='#24172b';
  cx.strokeText('성문 방어',d.x,d.y-130);cx.fillText('성문 방어',d.x,d.y-130);cx.restore();
}
