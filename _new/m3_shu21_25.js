/* 촉나라 21~25판. 기존 나라/영웅/맵/대사를 변경하지 않고 승인 미션만 추가. */
Object.assign(NPC_STAGE_BOSSES,{
  21:{name:'NPC 선착장봉쇄장',type:'spear',color:[114,189,255],skills:['bind','charge']},
  22:{name:'NPC 교량돌격장',type:'spear',color:[244,94,62],skills:['quake','charge']},
  23:{name:'NPC 암굴파수장',type:'spear',color:[177,106,239],skills:['poison','charge']},
  24:{name:'NPC 정군산궁장',type:'bow',color:[109,180,248],skills:['burst','ice']},
  25:{name:'NPC21',type:'cav',color:[246,197,85],main:true,skills:['shield','charge','burst']}
});

/* 21 장판파: 피난민 두 명을 이끌고 서로 다른 거점 3곳을 순서대로 돌파. */
WEI_RULES[21]={
  init(m){
    const ps=weiPoints(m,3),points=[];let at={x:P.x,y:P.y};
    while(ps.length){ps.sort((a,b)=>Math.hypot(a.x-at.x,a.y-at.y)-Math.hypot(b.x-at.x,b.y-at.y));const q=ps.shift();points.push(q);at=q;}
    m.wei={points,index:0,phase:'escort',civ:[
      {x:P.x,y:P.y,hp:100,id:'npc1'},
      {x:P.x,y:P.y,hp:100,id:'npc2'}
    ],dangerT:0};
    showBanner('장판파 · 피난민을 선착장까지 호위하라',2.4);
  },
  tick(dt){
    const w=M.wei,p=w.points[w.index];if(!p)return;
    for(const c of w.civ){
      const dist=Math.hypot(P.x-c.x,P.y-c.y);
      if(dist>68&&dist<420)chaseMove(c,P,Math.min(105*dt,dist-62),dt);
      const threats=mobs.filter(q=>!q.dead&&!q.down&&q.col&&q.col.woken&&!q.ally&&Math.hypot(q.x-c.x,q.y-c.y)<142).length;
      if(threats)c.hp=Math.max(0,c.hp-Math.min(2,threats)*2.3*dt);
      if(c.hp<=0){wuFail('피난민 호위 실패');return;}
    }
    if(w.civ.some(c=>!weiNear(c,p,110))||!weiNear(P,p,160))return;
    if(p.col.mobs.some(q=>!q.dead&&!q.down)){w.phase='fight';wakeColony(p.col);return;}
    w.phase='escort';w.index++;showBanner('피난민 경유지 '+w.index+'/3 통과',1.8);
    if(w.index===3)weiExit('피난민 선착장 도착 · 진격로 확보');
  },
  text(){const w=M.wei,p=w.points[w.index];return '피난민 호위 '+w.index+'/3 · '+(w.phase==='fight'&&p&&p.col.mobs.some(q=>!q.dead)?'길목 반란군을 격파하라':'피난민과 함께 전진하라');},
  target(){const w=M.wei,p=w.points[w.index];if(!p)return null;const c=w.civ[0];if(Math.hypot(P.x-c.x,P.y-c.y)>250)return c;return p.col.lead&&!p.col.lead.dead?{x:p.col.lead.x,y:p.col.lead.y,ent:p.col.lead}:p;},
  draw(){const w=M.wei;for(let i=0;i<w.points.length;i++){const p=w.points[i];if(i===w.index)weiMark(p,'호위 경유지 '+(i+1),'#90d8aa',80);}
    for(const c of w.civ){propSprite(c.id,c.x,c.y,60,95);cx.save();cx.fillStyle='#241d25';cx.fillRect(c.x-24,c.y-110,48,6);cx.fillStyle='#8ce2aa';cx.fillRect(c.x-23,c.y-109,46*c.hp/100,4);cx.restore();}}
};

/* 22 장판교: 방어 지점에서 3차 적 공세를 저지. 지점 밖에서도 싸울 수 있다. */
WEI_RULES[22]={
  init(m){const points=weiPoints(m,3);m.wei={point:points[0],spawn:points,wave:0,phase:'approach',enemies:[],rest:0,elapsed:0,bridgeHp:100};},
  tick(dt){const w=M.wei;
    if(w.phase==='approach'){if(weiNear(P,w.point,200)){w.phase='fight';this.spawnWave();showBanner('장판교 방어 · 1차 공세!',2.0);}return;}
    if(w.phase==='rest'){w.rest-=dt;if(w.rest<=0){w.phase='fight';this.spawnWave();}return;}
    w.elapsed+=dt;
    const invaders=w.enemies.filter(q=>!q.dead&&!q.down&&weiNear(q,w.point,175));
    if(invaders.length)w.bridgeHp=Math.max(0,w.bridgeHp-Math.min(3,invaders.length)*1.9*dt);
    if(!w.bridgeHp){wuFail('장판교 방어 실패');return;}
    const left=w.enemies.filter(q=>!q.dead&&!q.down);
    // 막힌 통로에 마지막 한 명이 남아 공세가 끝나지 않는 경우 제한적으로 후퇴 처리.
    if(left.length===0||(w.elapsed>65&&left.length===1&&Math.hypot(left[0].x-w.point.x,left[0].y-w.point.y)>750)){
      w.wave++;if(w.wave===3){weiExit('장판교 3차 방어 성공');return;}
      w.phase='rest';w.rest=3;showBanner(w.wave+'차 공세 격퇴 · 다음 공격 준비',2.0);
    }
  },
  spawnWave(){const w=M.wei,p=w.spawn[w.wave%w.spawn.length],v=nearWalk(M.D.g,Math.floor(p.x/TS)+2,Math.floor(p.y/TS));
    const c=mkCol(v[0]+.5,v[1]+.5,{n:4+w.wave,leader:true,set:M.set,tag:'shu22_wave'});
    w.enemies=c.mobs;w.elapsed=0;wakeColony(c);showBanner('반란군 '+(w.wave+1)+'/3차 공세!',2.0);
  },
  text(){const w=M.wei;return '장판교 '+w.wave+'/3차 방어 · 다리 '+Math.ceil(w.bridgeHp)+'%'+(w.phase==='approach'?' · 방어 지점으로':w.phase==='rest'?' · 적 접근 중':'');},
  target(){const w=M.wei;return w.phase==='approach'?w.point:w.enemies.find(q=>!q.dead&&!q.down)||w.point;},
  draw(){const w=M.wei,p=w.point;propSprite('bridge',p.x,p.y,235,115);weiMark(p,'장판교 수비','#ffce86',115);
    cx.save();cx.fillStyle='#292029';cx.fillRect(p.x-53,p.y-142,106,11);cx.fillStyle='#8edfc4';cx.fillRect(p.x-51,p.y-140,102*w.bridgeHp/100,7);cx.restore();}
};

/* 23 관은병: 막힌 정문을 피해 우회하여 서로 다른 두 개의 빗장을 해제. */
WEI_RULES[23]={
  init(m){
    let gate=null;try{gate=weiFindGate(m);}catch(e){if(!e.message.includes('우회 가능한 문 위치 없음'))throw e;}
    const pts=weiPoints(m,2),levers=pts.map((p,i)=>({...p,id:i+1,on:false,progress:0}));
    if(gate){levers[1].x=gate.far.x;levers[1].y=gate.far.y;weiGateSet(gate,false);}
    m.wei={gate,levers};
  },
  tick(dt){const w=M.wei;for(const p of w.levers)if(!p.on){p.progress=weiNear(P,p,95)?p.progress+dt:0;
    if(p.progress>=1.2){p.on=true;showBanner('우회로 빗장 '+p.id+' 해제',1.6);}}
    if(w.levers.every(q=>q.on)){if(w.gate)weiGateSet(w.gate,true);weiExit('우회로 확보 · 정문 개방');}
  },
  text(){return '막힌 정문 우회 · 빗장 '+M.wei.levers.filter(q=>q.on).length+'/2 해제';},
  target(){return M.wei.levers.filter(q=>!q.on).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0]||null;},
  draw(){const w=M.wei;if(w.gate)weiDrawGate(w.gate,'닫힌 정문');for(const q of w.levers){weiMark(q,'빗장 '+q.id+(q.on?' · 해제':''),q.on?'#7ee0bc':'#d6baff',75);propSprite(q.on?'lever_on':'lever_off',q.x,q.y,55,85);}}
};

/* 24 정군산: 두 감시탑의 지휘병을 제압·점령하면 지원 사격이 멎는다. */
WEI_RULES[24]={
  init(m){m.wei={towers:weiPoints(m,2).map((p,i)=>({...p,id:i+1,leader:p.col.lead,captured:false,progress:0,nextShot:2.2+i*.9}))};},
  tick(dt){const w=M.wei;
    for(const q of w.towers){if(q.captured)continue;
      q.nextShot-=dt;
      if(!q.leader.dead&&q.nextShot<=0&&Math.hypot(q.x-P.x,q.y-P.y)<650){
        q.nextShot=4.4;const sx=q.x,sy=q.y-90,dx=P.x-sx,dy=P.y-CH-sy,d=Math.hypot(dx,dy)||1;
        shots.push({x:sx,y:sy,vx:dx/d*450,vy:dy/d*450,dmg:q.leader.atk*.55,kind:'arrow',r:12,t:0,life:1.7});
      }
      q.progress=q.leader.dead&&weiNear(P,q,90)?q.progress+dt:0;
      if(q.progress>=1.3){q.captured=true;showBanner('정군산 감시탑 '+q.id+' 점령',1.8);}
    }
    if(w.towers.every(q=>q.captured))weiExit('감시탑 점령 · 지원 사격 중단');
  },
  text(){return '정군산 감시탑 '+M.wei.towers.filter(q=>q.captured).length+'/2 · 궁장 제압 후 점령';},
  target(){const q=M.wei.towers.find(q=>!q.captured);return q?(q.leader.dead?q:{x:q.leader.x,y:q.leader.y,ent:q.leader}):null;},
  draw(){for(const q of M.wei.towers){weiMark(q,'감시탑 '+q.id+(q.captured?' · 점령':''),q.captured?'#80deb1':'#ffcf76',65);
    propSprite('tower',q.x,q.y,117,177);if(q.captured)propSprite('flag_blue',q.x+40,q.y-102,32,61);
    if(q.progress){cx.fillStyle='#29202c';cx.fillRect(q.x-35,q.y+10,70,7);cx.fillStyle='#86dbb5';cx.fillRect(q.x-34,q.y+11,68*q.progress/1.3,5);}}}
};

/* 25 성채: 서로 다른 방의 세 발판을 순서 상관없이 작동. 마지막 칸 기마보스는 별도. */
WEI_RULES[25]={
  init(m){m.wei={switches:weiPoints(m,3).map((p,i)=>({...p,id:i+1,on:false,progress:0}))};},
  tick(dt){const w=M.wei;for(const p of w.switches)if(!p.on){p.progress=weiNear(P,p,85)?p.progress+dt:0;
    if(p.progress>=1){p.on=true;showBanner('성채 발판 '+p.id+' 작동',1.5);}}
    if(w.switches.every(q=>q.on))weiExit('발판 3개 작동 · 성문 개방');
  },
  text(){return '성채 발판 '+M.wei.switches.filter(q=>q.on).length+'/3 작동';},
  target(){return M.wei.switches.filter(q=>!q.on).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0]||null;},
  draw(){for(const q of M.wei.switches){weiMark(q,'발판 '+q.id+(q.on?' · 작동':''),q.on?'#8adeb5':'#b5bfff',78);propSprite(q.on?'plate_on':'plate_off',q.x,q.y,88,40);}}
};
