/* GPT 스테이지 규칙 — 2판 감시탑. 지형·능력치·나라·대사는 바꾸지 않는다. */
function gimInit(m){
  if(m.gim!=='towers')return;
  const start={x:(m.D.start.cx+.5)*TS,y:(m.D.start.cy+.5)*TS};
  const cols=m.colonies.filter(c=>c.lead&&!c.hold&&c.lead!==m.guard&&c.lead!==m.captain);
  // 이미 도달성이 보장된 군락 중심 중, 시작점에서 먼 두 개의 서로 다른 방.
  cols.sort((a,b)=>Math.hypot(b.cx-start.x,b.cy-start.y)-Math.hypot(a.cx-start.x,a.cy-start.y));
  const picked=[];
  for(const c of cols){
    if(picked.some(q=>Math.hypot(q.cx-c.cx,q.cy-c.cy)<TS*4))continue;
    picked.push(c);if(picked.length===2)break;
  }
  if(picked.length!==2)throw new Error('2판 감시탑 배치 실패');
  m.towers={left:180,failed:false,list:picked.map((c,i)=>({id:i+1,x:c.cx,y:c.cy,lead:c.lead,captured:false,progress:0}))};
  m.mis='towers';
}
function gimText(){
  const t=M.towers,n=t.list.filter(q=>q.captured).length;
  return '감시탑 '+n+'/2 · '+Math.ceil(t.left)+'초';
}
function gimTarget(){
  const ts=M.towers.list.filter(q=>!q.captured);
  ts.sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
  const t=ts[0];if(!t)return null;
  return t.lead.dead?{x:t.x,y:t.y}:{x:t.lead.x,y:t.lead.y,ent:t.lead};
}
function gimTick(dt){
  const m=M,t=m.towers;
  if(!t)return false;
  if(t.failed)return true;
  if(m.mis!=='towers'||m.ended||m.trans||UI.mode!=='battle'||UI.paused)return false;
  // 등장 연출·대화·일시정지 중에는 시간을 깎지 않는다.
  if(P.mode!=='manual'&&P.mode!=='hunt')return false;
  t.left=Math.max(0,t.left-dt);
  // 마감 시각 이후 처치/접근으로 문이 열리지 않도록 먼저 실패 판정.
  if(t.left<=0){
    t.failed=true;m.ended=true;stopInput();P.mode='dead';P.tt=0;P.atk=null;P.sk=null;P.state='idle';
    S.deaths++;shots.length=0;orbs.length=0;zones.length=0;
    showBanner('감시탑 점령 실패 · 패배',2);return true;
  }
  for(const q of t.list){
    if(q.captured)continue;
    const near=Math.hypot(q.x-P.x,(q.y-P.y)/YR)<100;
    if(!q.lead.dead||!near){q.progress=0;continue;}
    q.progress=Math.min(1.5,q.progress+dt);
    if(q.progress>=1.5){q.captured=true;showBanner('감시탑 '+q.id+' 점령',1.5);}
  }
  if(t.list.every(q=>q.captured)){m.mis='exit';openExit();}
  return false;
}
function drawGimmicks(){
  if(!M.towers)return;
  for(const q of M.towers.list){
    const x=q.x,y=q.y,col=q.captured?'#67dca0':'#ffd36b';
    cx.save();
    // 바닥 표시와 목조 감시탑은 장식이며 통로를 막지 않는다.
    cx.strokeStyle=col;cx.lineWidth=3;cx.beginPath();cx.ellipse(x,y,52,29,0,0,7);cx.stroke();
    cx.fillStyle='#6b4630';cx.fillRect(x-25,y-105,7,90);cx.fillRect(x+18,y-105,7,90);
    cx.strokeStyle='#a27a50';cx.lineWidth=4;cx.beginPath();cx.moveTo(x-21,y-24);cx.lineTo(x+21,y-90);cx.moveTo(x+21,y-24);cx.lineTo(x-21,y-90);cx.stroke();
    cx.fillStyle='#9a7147';cx.fillRect(x-34,y-112,68,12);
    cx.fillStyle='#534634';cx.beginPath();cx.moveTo(x-42,y-115);cx.lineTo(x,y-146);cx.lineTo(x+42,y-115);cx.closePath();cx.fill();
    cx.strokeStyle='#d2b382';cx.lineWidth=3;cx.beginPath();cx.moveTo(x+30,y-115);cx.lineTo(x+30,y-176);cx.stroke();
    cx.fillStyle=col;cx.beginPath();cx.moveTo(x+31,y-176);cx.lineTo(x+64,y-166);cx.lineTo(x+31,y-154);cx.closePath();cx.fill();
    cx.font='800 17px system-ui,sans-serif';cx.textAlign='center';cx.lineJoin='round';cx.lineWidth=4;cx.strokeStyle='#201523';
    const label='감시탑 '+q.id+(q.captured?' · 점령':q.lead.dead?' · 접근':' · 지휘병');
    cx.strokeText(label,x,y-186);cx.fillStyle=col;cx.fillText(label,x,y-186);
    if(!q.captured&&q.progress>0){cx.fillStyle='#251d29';cx.fillRect(x-36,y+12,72,7);cx.fillStyle=col;cx.fillRect(x-36,y+12,72*q.progress/1.5,7);}
    cx.restore();
  }
}
