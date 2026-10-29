/* 19판 건업 진입: 세 사람을 조사해 성안 내응자를 찾는다. */
WEI_RULES[19]={
 init(m){m.wei={people:weiPoints(m,3).map((p,i)=>({...p,id:i+1,ally:i===m.n%3,checked:false,progress:0}))};},
 tick(dt){for(const q of M.wei.people){if(q.checked)continue;q.progress=weiNear(P,q,90)?q.progress+dt:0;if(q.progress<1)continue;q.checked=true;if(q.ally){weiExit('내응자 발견 · 안에서 성문을 열었다');return;}showBanner('내응자가 아니다 · 다른 사람을 찾아라',2);}},
 text(){return '성안 내응자를 찾아 가까이 다가가라';},
 target(){return M.wei.people.filter(q=>!q.checked).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0]||null;},
 draw(){for(const q of M.wei.people){weiMark(q,q.checked?'확인 완료':'성안 사람 '+q.id,q.checked?'#89949d':'#9ae1c8');cx.save();cx.fillStyle='#497e81';cx.beginPath();cx.moveTo(q.x,q.y-60);cx.lineTo(q.x-25,q.y);cx.lineTo(q.x+25,q.y);cx.closePath();cx.fill();cx.fillStyle='#dfbb98';cx.beginPath();cx.arc(q.x,q.y-65,16,0,Math.PI*2);cx.fill();cx.fillStyle='#37485e';cx.fillRect(q.x-20,q.y-83,40,12);cx.restore();}}
};
