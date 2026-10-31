/* 군웅 36~39: 여포 구출 → 호로관 충차 → 낙양 화재 → 미우성 연속 돌파. */
Object.assign(NPC_STAGE_BOSSES,{
  36:{name:'NPC 하비침수장',type:'spear',color:[106,187,248],skills:['ice','quake']},
  37:{name:'NPC 호로관충차장',type:'spear',color:[247,198,101],skills:['shield','charge']},
  38:{name:'NPC 낙양화공장',type:'bow',color:[248,104,65],skills:['fire','quake']},
  39:{name:'NPC26',type:'cav',color:[113,171,252],main:true,skills:['shield','charge','vortex']}
});

/* 36 하비: 범람 중 고립된 아군 둘을 직접 찾아 구조하고 마지막 물막이 레버를 끈다. */
WEI_RULES[36]={
  init(m){const points=weiPoints(m,3).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
    m.wei={rescues:points.slice(0,2).map((p,i)=>({...p,id:i+1,rescued:false,progress:0})),
      lever:{...points[2],progress:0,on:false},flood:0,elapsed:0,soak:0};
    showBanner('하비 수공 · 고립된 아군 둘을 구하라',2.4);},
  tick(dt){const w=M.wei;w.elapsed+=dt;w.flood=Math.min(3,Math.floor(w.elapsed/21));
    if(w.flood>=2&&!w.rescues.some(p=>weiNear(P,p,145))){P.slowT=Math.max(P.slowT,.15);w.soak+=dt;
      if(w.soak>=3){w.soak=0;hurtPlayer(5+w.flood,0,0,0);}}else w.soak=0;
    for(const p of w.rescues)if(!p.rescued){
      p.progress=weiNear(P,p,96)?p.progress+dt:0;
      if(p.progress>=1.25){p.rescued=true;showBanner('고립된 아군 '+p.id+' 구조',1.7);}
    }
    if(w.rescues.every(p=>p.rescued)){
      const q=w.lever;q.progress=weiNear(P,q,100)?q.progress+dt:0;
      if(q.progress>=1.4&&!q.on){q.on=true;w.flood=0;weiExit('하비 수문 봉쇄 · 여포 구출로 진격');}
    }
  },
  text(){const w=M.wei;return '하비 구조 '+w.rescues.filter(p=>p.rescued).length+'/2 · 침수 '+w.flood+'/3';},
  target(){const w=M.wei;return w.rescues.find(p=>!p.rescued)||w.lever;},
  draw(){const w=M.wei;cx.save();cx.fillStyle='rgba(90,158,235,'+(w.flood*.027)+')';cx.fillRect(P.x-1300,P.y-1300,2600,2600);cx.restore();
    for(const p of w.rescues){if(!p.rescued)propSprite('npc'+p.id,p.x,p.y,64,101);
      weiMark(p,'고립군 '+p.id+(p.rescued?' · 구조':''),p.rescued?'#90dbb3':'#a8d4fa',78);}
    const p=w.lever;weiMark(p,w.rescues.every(q=>q.rescued)?'마지막 수문':'구조 후 가동',w.rescues.every(q=>q.rescued)?'#a3e3ed':'#8a889b',79);
    propSprite(p.on?'lever_on':'lever_off',p.x,p.y,55,90);
  }
};

/* 37 호로관: 관은병 출전. 망루 2곳 점령 후 플레이어를 따라오는 충차로 정문 파쇄. */
WEI_RULES[37]={
  init(m){const points=weiPoints(m,3);const towers=points.slice(0,2).map((p,i)=>({...p,id:i+1,leader:p.col.lead,captured:false,progress:0}));
    const gate=points[2];m.wei={towers,gate,ram:{x:P.x,y:P.y,hp:150,losT:0},phase:'capture',ramT:0};
    showBanner('관은병 필수 출전 · 감시탑 2곳을 점령하라',2.5);},
  tick(dt){const w=M.wei;
    if(w.phase==='capture'){
      for(const p of w.towers)if(!p.captured){
        p.progress=(p.leader.dead||p.leader.down)&&weiNear(P,p,95)?p.progress+dt:0;
        if(p.progress>=1.3){p.captured=true;showBanner('호로관 감시탑 '+p.id+' 점령',1.8);}
      }
      if(w.towers.every(p=>p.captured)){w.phase='ram';showBanner('충차 출발 · 성문까지 호위하라!',2.3);}
      return;
    }
    const ram=w.ram,d=Math.hypot(P.x-ram.x,P.y-ram.y);
    if(d>65&&d<500)chaseMove(ram,P,Math.min(122*dt,d-65),dt);
    const attackers=mobs.filter(q=>!q.dead&&!q.down&&!q.ally&&q.col&&q.col.woken&&weiNear(q,ram,120));
    if(attackers.length)ram.hp=Math.max(0,ram.hp-Math.min(3,attackers.length)*2.4*dt);
    if(ram.hp===0){wuFail('충차 파괴 · 호로관 돌파 실패');return;}
    if(weiNear(P,w.gate,160)&&weiNear(ram,w.gate,135)){
      w.ramT+=dt;if(w.ramT>=2.3)weiExit('충차 성문 파쇄 · 호로관 진입');
    }else w.ramT=0;
  },
  text(){const w=M.wei;return w.phase==='capture'?'호로관 망루 '+w.towers.filter(p=>p.captured).length+'/2 점령':
    '충차 호위 · 내구 '+Math.ceil(w.ram.hp/150*100)+'%';},
  target(){const w=M.wei;return w.phase==='capture'?(w.towers.find(p=>!p.captured)||null):
    Math.hypot(P.x-w.ram.x,P.y-w.ram.y)>260?w.ram:w.gate;},
  draw(){const w=M.wei;for(const p of w.towers){weiMark(p,'감시탑 '+p.id+(p.captured?' · 점령':''),p.captured?'#88deae':'#ffd190',65);
      propSprite('tower',p.x,p.y,114,170);if(p.captured)propSprite('flag_blue',p.x+35,p.y-108,31,60);}
    weiMark(w.gate,w.phase==='ram'?'충차로 성문을 파괴':'호로관 정문','#f5c382',94);
    propSprite(w.phase==='ram'?'gate_closed':'door_closed',w.gate.x,w.gate.y,135,142);
    if(w.phase==='ram'){const r=w.ram;propSprite('barricade',r.x,r.y,112,73);
      cx.save();cx.fillStyle='#2c2429';cx.fillRect(r.x-38,r.y-95,76,8);cx.fillStyle='#9adeb6';cx.fillRect(r.x-36,r.y-93,72*r.hp/150,4);cx.restore();}
  }
};

/* 38 낙양: 두 화공 장치를 끄는 동안 화염 및 발사체를 함께 피한다. */
WEI_RULES[38]={
  init(m){m.wei={traps:weiPoints(m,2).map((p,i)=>({...p,id:i+1,hp:4,shot:1.5+i*.7})),burnT:0};
    showBanner('낙양 화재 · 화공 기관 둘을 파괴하라',2.3);},
  hit(rad){for(const p of M.wei.traps)if(p.hp>0&&weiNear(P,p,rad+40)){
    if(--p.hp===0)showBanner('화공 기관 '+p.id+' 정지',1.8);
  }},
  tick(dt){const w=M.wei;
    for(const p of w.traps)if(p.hp>0){
      p.shot-=dt;if(p.shot<=0){p.shot=3.5;
        if(Math.hypot(P.x-p.x,P.y-p.y)<740){const sx=p.x,sy=p.y-55,dx=P.x-sx,dy=P.y-CH-sy,d=Math.hypot(dx,dy)||1;
          shots.push({x:sx,y:sy,vx:dx/d*360,vy:dy/d*360,dmg:Math.max(9,stat.maxHp()*.045),kind:'magic',npcColor:[254,99,60],r:17,t:0,life:2.1});}
      }
    }
    if(w.traps.some(p=>p.hp>0&&weiNear(P,p,125))){w.burnT+=dt;
      if(w.burnT>=2.4){w.burnT=0;hurtPlayer(9,0,0,0);}}
    else w.burnT=0;
    if(w.traps.every(p=>p.hp===0))weiExit('낙양 화공 중단 · 안전 통로 확보');
  },
  text(){return '낙양 화공 기관 '+M.wei.traps.filter(p=>p.hp===0).length+'/2 정지';},
  target(){return M.wei.traps.find(p=>p.hp>0)||null;},
  draw(){for(const p of M.wei.traps){weiMark(p,'화공 기관 '+p.id,p.hp>0?'#ff9d71':'#91d8aa',82);
    propSprite(p.hp>0?'torch_on':'torch_off',p.x,p.y,85,112);
    if(p.hp>0)wuFlames(p,68);}}
};

/* 39 미우성: 전방 수비대 격파 → 안쪽 빗장 해제 → 최후 성문 파괴, 4칸 기마 NPC26 결전. */
WEI_RULES[39]={
  init(m){const ps=weiPoints(m,3);m.wei={posts:ps,phase:0,progress:0,doorHp:5};
    showBanner('미우성 · 삼중 관문을 차례로 돌파하라',2.4);},
  tick(dt){const w=M.wei,p=w.posts[w.phase];if(!p)return;
    if(w.phase===0){const defending=p.col.mobs.filter(q=>!q.dead&&!q.down);
      if(!defending.length){w.phase=1;showBanner('제1문 돌파 · 안쪽 빗장을 열어라',2);}
      else if(weiNear(P,p,250))wakeColony(p.col);
    }else if(w.phase===1){w.progress=weiNear(P,p,95)?w.progress+dt:0;
      if(w.progress>=1.3){w.phase=2;w.progress=0;showBanner('제2문 개방 · 최후 정문을 파괴하라',2);}}
  },
  hit(rad){const w=M.wei,p=w.posts[2];if(w.phase!==2||!weiNear(P,p,rad+65))return;
    if(--w.doorHp<=0){w.doorHp=0;weiExit('미우성 3관문 돌파 · 마지막 기마 간부와 결전');}
  },
  text(){const w=M.wei;return ['미우성 제1문 · 수비대 섬멸','미우성 제2문 · 빗장 해제','미우성 제3문 · 성문 파괴'][w.phase];},
  target(){const w=M.wei,p=w.posts[w.phase];return w.phase===0&&p?.col?.lead&&!p.col.lead.dead?
    {x:p.col.lead.x,y:p.col.lead.y,ent:p.col.lead}:p||null;},
  draw(){const w=M.wei;for(let i=0;i<3;i++){const p=w.posts[i],done=i<w.phase,active=i===w.phase;
    weiMark(p,'미우성 '+(i+1)+'관문',done?'#8bd6ae':active?'#ffd196':'#9c97a9',82);
    propSprite(i===0?'barricade':i===1?(done?'lever_on':'lever_off'):(w.doorHp?'gate_closed':'gate_open'),p.x,p.y,i===1?60:128,i===1?95:130);
  }}
};
