/* 군웅 31~35: 첫 칸 특수 전투. 맵·대사·구출·후속 칸은 그대로 둔다. */
Object.assign(NPC_STAGE_BOSSES,{
  31:{name:'NPC 사수관결투장',type:'spear',color:[239,92,67],skills:['charge','quake']},
  32:{name:'NPC 하비전령총관',type:'bow',color:[101,188,247],skills:['burst','ice']},
  33:{name:'NPC 우초방화장',type:'bow',color:[238,111,62],skills:['fire','burst']},
  34:{name:'NPC 황건제사장',type:'bow',color:[173,101,239],skills:['shield','poison']},
  35:{name:'NPC25',type:'cav',color:[251,103,67],main:true,skills:['charge','fire','vortex']}
});

/* 31 사수관: 외곽의 군량고 2개를 먼저 파괴하고 출구 지휘병에게 도전. */
WEI_RULES[31]={
  init(m){m.wei={stock:weiPoints(m,2).map((p,i)=>({...p,id:i+1,hp:3})),ambush:false};
    showBanner('사수관 · 외곽 군량고를 파괴하라',2.2);},
  hit(rad){for(const p of M.wei.stock)if(p.hp>0&&weiNear(P,p,rad+50)){
    p.hp--;if(p.hp===0)showBanner('군량고 '+p.id+' 파괴!',1.6);
  }},
  tick(){const w=M.wei;if(!w.ambush&&w.stock.some(p=>p.hp===0)){
    w.ambush=true;const p=w.stock.find(p=>p.hp===0),c=p.col;wakeColony(c);
    showBanner('군량을 잃은 수비군의 역습!',2);
  }if(w.stock.every(p=>p.hp===0))weiExit('보급 차단 · 사수관 일기토 진입');},
  text(){return '사수관 보급창고 '+M.wei.stock.filter(p=>p.hp===0).length+'/2 파괴';},
  target(){return M.wei.stock.find(p=>p.hp>0)||null;},
  draw(){for(const p of M.wei.stock){weiMark(p,'군량고 '+p.id,p.hp>0?'#f4b36b':'#81d6a9',76);
    propSprite(p.hp>0?'supply':'supply_burnt',p.x,p.y,113,86);}}
};

/* 32 하비: 전령이 도주하는 동안 추격. 도주를 허용하면 원군이 추가되지만 진행은 가능. */
WEI_RULES[32]={
  init(m){const points=weiPoints(m,3).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
    const runner=points[0].col.lead;runner.sp*=1.16;runner.weiCourier=true;runner.guardL=false;
    m.wei={points,runner,route:1,elapsed:0,escaped:false,reinforced:false};
    wakeColony(runner.col);showBanner('하비 · 원군 전령을 추격하라!',2.2);},
  tick(dt){const w=M.wei;w.elapsed+=dt;
    if(w.runner.dead||w.runner.down){weiExit('전령 격파 · 원군 요청 저지');return;}
    if(w.elapsed>55&&!w.reinforced){w.escaped=w.reinforced=true;
      const p=w.points[2],v=nearWalk(M.D.g,Math.floor(p.x/TS)+2,Math.floor(p.y/TS));
      const c=mkCol(v[0]+.5,v[1]+.5,{n:6,leader:true,set:M.set,tag:'lord32_reinforce'});wakeColony(c);
      showBanner('전령이 원군을 불렀다! 격파하고 전진!',2.3);
    }},
  mob(q,dt){const w=M.wei;if(q!==w.runner||q.dead||q.down||w.escaped)return false;
    q.hurt=Math.max(0,q.hurt-dt);q.stun=Math.max(0,q.stun-dt);q.moving=false;
    const p=w.points[w.route];if(p&&Math.hypot(q.x-p.x,q.y-p.y)>75){chaseMove(q,p,q.sp*dt,dt);q.moving=true;}
    else w.route=Math.min(2,w.route+1);return true;},
  text(){return '전령 추격 · '+Math.max(0,Math.ceil(55-M.wei.elapsed))+'초'+(M.wei.escaped?' · 적 원군 도착':'');},
  target(){const q=M.wei.runner;return {x:q.x,y:q.y,ent:q};},
  draw(){const w=M.wei;if(!w.runner.dead)weiMark(w.runner,'원군 전령','#ffab85',70);
    for(let i=1;i<w.points.length;i++){const p=w.points[i];weiMark(p,'전령 경유지','#aecdfc',55);}}
};

/* 33 관도 우초: 견희 출전. 적의 3차 방화 공격에서 군량창고 최소 한 곳을 지킨다. */
WEI_RULES[33]={
  init(m){const depots=weiPoints(m,2).map((p,i)=>({...p,id:i+1,hp:100}));
    const spawn=weiPoints(m,3);m.wei={depots,spawn,wave:0,phase:'approach',enemies:[],rest:0,elapsed:0};
    showBanner('견희 필수 출전 · 우초 군량고 두 곳을 지켜라',2.5);},
  tick(dt){const w=M.wei;if(w.phase==='approach'){
    if(w.depots.some(p=>weiNear(P,p,190))){w.phase='fight';this.spawnWave();}return;
  }if(w.phase==='rest'){w.rest-=dt;if(w.rest<=0){w.phase='fight';this.spawnWave();}return;}
    w.elapsed+=dt;
    for(const p of w.depots){if(p.hp<=0)continue;
      const count=w.enemies.filter(q=>!q.dead&&!q.down&&weiNear(q,p,195)).length;
      p.hp=Math.max(0,p.hp-Math.min(4,count)*3.1*dt);
    }
    if(w.depots.every(p=>p.hp===0)){wuFail('우초 군량고 전소');return;}
    const left=w.enemies.filter(q=>!q.dead&&!q.down);
    if(!left.length||(w.elapsed>72&&left.length===1&&Math.hypot(left[0].x-P.x,left[0].y-P.y)>800)){
      w.wave++;if(w.wave===3){weiExit('우초 군량고 방어 성공');return;}
      w.phase='rest';w.rest=3;showBanner('방화군 '+w.wave+'차 격퇴',1.8);
    }
  },
  spawnWave(){const w=M.wei,p=w.spawn[w.wave%w.spawn.length];
    const v=nearWalk(M.D.g,Math.floor(p.x/TS)+2,Math.floor(p.y/TS));
    const c=mkCol(v[0]+.5,v[1]+.5,{n:5+w.wave*2,leader:true,set:M.set,tag:'lord33_fire'});
    w.enemies=c.mobs;w.elapsed=0;wakeColony(c);showBanner('우초 '+(w.wave+1)+'차 방화군 습격!',2);},
  text(){const w=M.wei;return '우초 '+w.wave+'/3차 방어 · 창고 '+w.depots.map(p=>Math.ceil(p.hp)+'%').join(' / ');},
  target(){const w=M.wei;return w.enemies.find(q=>!q.dead&&!q.down)||w.depots.find(p=>p.hp>0);},
  draw(){for(const p of M.wei.depots){propSprite(p.hp>0?'supply':'supply_burnt',p.x,p.y,122,97);
    weiMark(p,'우초 창고 '+p.id,p.hp?'#f6c075':'#ff6659',98);
    cx.save();cx.fillStyle='#261c25';cx.fillRect(p.x-43,p.y-108,86,8);
    cx.fillStyle=p.hp>40?'#9be7ab':'#fa7869';cx.fillRect(p.x-41,p.y-106,p.hp*.82,4);cx.restore();}}
};

/* 34 황건: 요괴 제단 세 곳을 파괴해야 지휘병의 보호 주술이 풀린다. */
WEI_RULES[34]={
  init(m){m.wei={altars:weiPoints(m,3).map((p,i)=>({...p,id:i+1,hp:4})),cleared:false};
    showBanner('황건 요술 · 제단 3개를 파괴하라',2.3);},
  hit(rad){for(const p of M.wei.altars)if(p.hp>0&&weiNear(P,p,rad+42)){
    if(--p.hp===0){showBanner('제단 '+p.id+' 파괴 · 보호 주술 약화',1.7);wakeColony(p.col);}
  }},
  canHit(q){return !(q.col&&q.col.lead===q&&M.wei.altars.some(p=>p.hp>0));},
  tick(){const w=M.wei;if(!w.cleared&&w.altars.every(p=>p.hp===0)){
    w.cleared=true;weiExit('황건 주술 해제 · 제사장에게 진격');}},
  text(){return '황건 제단 '+M.wei.altars.filter(p=>!p.hp).length+'/3 파괴 · 주술 해제';},
  target(){return M.wei.altars.find(p=>p.hp>0)||null;},
  draw(){for(const p of M.wei.altars){propSprite(p.hp>0?'stone_on':'stone_off',p.x,p.y,75,107);
    weiMark(p,'황건 제단 '+p.id,p.hp>0?'#c39aff':'#83dcb7',76);}}
};

/* 35 낙양: 빠르게 번지는 불씨를 피해 안전 지점 세 곳의 소화 설비 가동. */
WEI_RULES[35]={
  init(m){const points=weiPoints(m,3).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
    m.wei={points,index:0,progress:0,fire:[],next:7,hurtT:0,elapsed:0};
    showBanner('낙양 화계 · 화염을 뚫고 소화 수문을 잠가라',2.4);},
  tick(dt){const w=M.wei;w.elapsed+=dt;w.next-=dt;
    if(w.next<=0){w.next=6.3;w.fire.push({x:P.x,y:P.y,life:18});
      if(w.fire.length>6)w.fire.shift();showBanner('화공 · 방금 지나간 길에 불길!',1.3);}
    for(const q of w.fire)q.life-=dt;w.fire=w.fire.filter(q=>q.life>0);
    if(w.fire.some(q=>weiNear(P,q,100))){w.hurtT+=dt;P.slowT=Math.max(P.slowT,.12);
      if(w.hurtT>=2){w.hurtT=0;hurtPlayer(8,0,0,0);}}
    else w.hurtT=0;
    const p=w.points[w.index];w.progress=weiNear(P,p,93)?w.progress+dt:0;
    if(w.progress>=1.25){w.index++;w.progress=0;showBanner('소화 수문 '+w.index+'/3 가동',1.7);
      if(w.index===3)weiExit('낙양 화공 제압 · 기마 간부와 결전');}
  },
  text(){return '낙양 화공 · 소화 수문 '+M.wei.index+'/3';},
  target(){return M.wei.points[M.wei.index]||null;},
  draw(){const w=M.wei;for(const f of w.fire){cx.save();cx.globalAlpha=Math.min(.65,f.life/3);wuFlames(f,92);cx.restore();}
    for(let i=0;i<w.points.length;i++){const p=w.points[i];weiMark(p,'소화 수문 '+(i+1),i<w.index?'#8cdbb4':'#a8e0ef',78);
      propSprite(i<w.index?'lever_on':'lever_off',p.x,p.y,53,88);}
  }
};
