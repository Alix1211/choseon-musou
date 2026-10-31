/* 촉 26~30판: 기존 4칸 전장과 장수 대사/구출 순서를 보존하는 첫 칸 특수 전투. */
Object.assign(NPC_STAGE_BOSSES,{
  26:{name:'NPC 동관전령기장',type:'spear',color:[249,97,64],skills:['charge','burst']},
  27:{name:'NPC 번성수문장',type:'spear',color:[110,190,249],skills:['ice','quake']},
  28:{name:'NPC 계략집행관',type:'bow',color:[174,104,236],skills:['bind','poison']},
  29:{name:'NPC 팔진술사',type:'bow',color:[190,119,245],skills:['vortex','burst']},
  30:{name:'NPC24',type:'cav',color:[245,94,57],main:true,skills:['fire','charge','quake']}
});

/* 26 동관: 보행 전령을 쫓아가 두 경유지의 퇴로를 막고 전령을 제압한다. */
WEI_RULES[26]={
  init(m){
    const posts=weiPoints(m,3).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
    const runner=posts[0].col.lead;
    runner.weiCourier=true;runner.sp*=1.08;
    m.wei={posts,runner,route:1,blocked:[false,false],progress:[0,0],phase:'chase'};
    showBanner('동관 · 달아나는 전령의 퇴로를 끊어라',2.4);
  },
  tick(dt){
    const w=M.wei;
    for(let i=0;i<2;i++)if(!w.blocked[i]){
      w.progress[i]=weiNear(P,w.posts[i],100)?w.progress[i]+dt:0;
      if(w.progress[i]>=.9){w.blocked[i]=true;showBanner('퇴로 차단 '+(i+1)+'/2',1.6);}
    }
    if(w.blocked.every(Boolean)){
      if(w.phase!=='cornered'){w.phase='cornered';wakeColony(w.runner.col);showBanner('전령 포위 · 직접 격파하라',2.2);}
      if(w.runner.dead||w.runner.down)weiExit('전령 격파 · 동관 진입');
    }
  },
  mob(q,dt){
    const w=M.wei;
    if(q!==w.runner||q.dead||q.down||w.phase==='cornered')return false;
    q.hurt=Math.max(0,q.hurt-dt);q.stun=Math.max(0,q.stun-dt);q.moving=false;
    const p=w.posts[w.route];
    if(p&&Math.hypot(q.x-p.x,q.y-p.y)>85){chaseMove(q,p,Math.min(q.sp*dt,110),dt);q.moving=true;}
    else w.route=Math.min(w.route+1,2);
    return true;
  },
  text(){const w=M.wei;return '전령 추격 · 퇴로 '+w.blocked.filter(Boolean).length+'/2'+(w.phase==='cornered'?' · 전령 격파':' 차단');},
  target(){const w=M.wei;return w.blocked.some(v=>!v)?w.posts[w.blocked.findIndex(v=>!v)]:{x:w.runner.x,y:w.runner.y,ent:w.runner};},
  draw(){const w=M.wei;for(let i=0;i<2;i++){
    const p=w.posts[i];weiMark(p,'퇴로 '+(i+1)+(w.blocked[i]?' · 차단':''),w.blocked[i]?'#89dcb3':'#f3ba77',72);
    propSprite(w.blocked[i]?'lever_on':'lever_off',p.x,p.y,57,81);
  }
    if(!w.runner.dead)weiMark(w.runner,w.phase==='cornered'?'전령 제압':'달아나는 전령','#fb8c70',57);
  }
};

/* 27 번성: 시간이 흐르면 저지대가 잠기며, 고지 3곳의 수문 표식을 차례로 잠근다. */
WEI_RULES[27]={
  init(m){
    const heights=weiPoints(m,3).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
    m.wei={heights,index:0,elapsed:0,water:0,soakT:0,progress:0};
    showBanner('번성 수공 · 높은 지대로 이동해 수문을 잠가라',2.4);
  },
  tick(dt){
    const w=M.wei;w.elapsed+=dt;w.water=Math.min(3,Math.floor(w.elapsed/24));
    const safe=w.heights.some(p=>weiNear(P,p,150));
    if(w.water>=2&&!safe){
      P.slowT=Math.max(P.slowT,.16);w.soakT+=dt;
      if(w.soakT>=2.8){w.soakT=0;hurtPlayer(4+w.water*2,0,0,0);}
    }else w.soakT=0;
    const p=w.heights[w.index];
    w.progress=weiNear(P,p,93)?w.progress+dt:0;
    if(w.progress>=1.25){w.index++;w.progress=0;showBanner('고지 수문 '+w.index+'/3 봉쇄',1.9);
      if(w.index===3){w.water=0;weiExit('번성 수문 정지 · 물길 차단');}}
  },
  text(){const w=M.wei;return '번성 수공 · 수문 '+w.index+'/3 · 침수 '+w.water+'/3';},
  target(){return M.wei.heights[M.wei.index]||null;},
  draw(){const w=M.wei;cx.save();if(w.water>0){
    cx.fillStyle='rgba(64,134,211,'+(.035+w.water*.025)+')';
    cx.fillRect(P.x-1250,P.y-1250,2500,2500);
    cx.strokeStyle='rgba(137,206,249,'+(.13+w.water*.05)+')';cx.lineWidth=3;
    for(let i=0;i<4;i++){const r=65+i*95+(time*25)%80;cx.beginPath();cx.ellipse(P.x,P.y,r,r*YR,0,0,Math.PI*2);cx.stroke();}
  }cx.restore();
    for(let i=0;i<w.heights.length;i++){const p=w.heights[i];
      weiMark(p,'고지 수문 '+(i+1)+(i<w.index?' · 정지':''),i<w.index?'#7fdab0':'#8ed4fa',120);
      propSprite(i<w.index?'lever_on':'lever_off',p.x,p.y,60,88);
    }
  }
};

/* 28 월영: 기존 미인계의 접근/유인 구조로 포획 장치를 꺼 적진 문을 연다. */
WEI_RULES[28]={
  init(m){const g=m.guard;if(!g)throw new Error('28판 유인 대상 없음');
    g.guardL=false;m.wei={lead:g,home:{x:g.x,y:g.y},trap:{x:P.x,y:P.y},phase:'approach',progress:0,caught:0};},
  tick(dt){const w=M.wei;
    if(w.lead.dead){const c=mkCol(w.home.x/TS,w.home.y/TS,{n:3,leader:true,guard:true,set:M.set,tag:'shu28_lure'});
      w.lead=c.lead;w.lead.guardL=false;w.phase='approach';w.progress=w.caught=0;showBanner('장치 재가동 · 다시 유인하라',1.8);return;}
    if(w.phase==='approach'){
      w.progress=weiNear(P,w.lead,175)&&losOpen(P.x,P.y,w.lead.x,w.lead.y,15)?w.progress+dt:0;
      if(w.progress>=1.8){w.phase='lured';wakeColony(w.lead.col);showBanner('미인계 성공 · 포획진으로 유인하라',2.2);}
    }else{
      w.caught=weiNear(w.lead,w.trap,118)?w.caught+dt:0;
      if(w.caught>=1.3){w.lead.down=true;if(w.lead.bs)w.lead.bs.s='down';w.lead.moving=false;
        weiExit('포획 장치 무력화 · 계략집행관에게 진입');}
    }
  },
  mob(q,dt){const w=M.wei;if(q!==w.lead||q.dead||q.down)return false;
    q.moving=false;q.face=faceTo(P.x-q.x,P.y-q.y);q.hurt=Math.max(0,q.hurt-dt);
    if(w.phase==='lured'&&Math.hypot(P.x-q.x,P.y-q.y)>45){chaseMove(q,P,q.sp*dt,dt);q.moving=true;}return true;},
  text(){return M.wei.phase==='approach'?'미인계 · 대상의 시선을 끌어라':'유혹 성공 · 분홍 포획진으로 유인하라';},
  target(){const w=M.wei;return w.phase==='approach'?{x:w.lead.x,y:w.lead.y,ent:w.lead}:w.trap;},
  draw(){const w=M.wei;weiMark(w.trap,'포획 장치','#fc92c9',120);propSprite('plate_off',w.trap.x,w.trap.y,95,40);
    weiMark(w.lead,w.phase==='approach'?'유인 표적':'유혹 중','#ff9ad2',67);}
};

/* 29 팔진도: 시야를 가리는 안개 속 표식 3곳을 찾아 탈출. 마지막 칸의 두 장수는 별도로 구출. */
WEI_RULES[29]={
  init(m){let gate=null;try{gate=weiFindGate(m);}catch(e){if(!e.message.includes('우회 가능한 문 위치 없음'))throw e;}
    if(gate)weiGateSet(gate,false);
    const stones=weiPoints(m,3).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
    m.wei={gate,stones,index:0,progress:0};},
  tick(dt){const w=M.wei,p=w.stones[w.index];w.progress=weiNear(P,p,100)?w.progress+dt:0;
    if(w.progress>=1.15){w.index++;w.progress=0;showBanner('팔진 표식 '+w.index+'/3 발견',1.7);
      if(w.index===3){if(w.gate)weiGateSet(w.gate,true);weiExit('팔진도 돌파 · 두 장수에게 가라');}}
  },
  text(){return '안개 팔진도 · 표식 '+M.wei.index+'/3';},
  target(){return M.wei.stones[M.wei.index]||null;},
  draw(){const w=M.wei;if(w.gate)weiDrawGate(w.gate,'돌로 막힌 지름길');
    for(let i=0;i<w.stones.length;i++){const p=w.stones[i];
      weiMark(p,'팔진 표식 '+(i+1),i<w.index?'#8cdbb9':'#bed0ff',72);
      propSprite(i<w.index?'stone_on':'stone_off',p.x,p.y,68,91);
    }
  },
  overlay(){wuFog(285,'70,75,103');}
};

/* 30 이릉: 불길이 추격하는 퇴각로를 호위. 4칸 마지막 기마 NPC24전은 기존 보스 진행. */
WEI_RULES[30]={
  init(m){const points=weiPoints(m,3).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
    m.wei={points,index:0,companion:{x:P.x,y:P.y,hp:110},embers:[],burnT:0,phase:'retreat'};
    showBanner('이릉 · 부상병을 이끌고 불길을 빠져나가라',2.4);},
  tick(dt){const w=M.wei,c=w.companion,p=w.points[w.index];
    for(const e of w.embers)e.life-=dt;w.embers=w.embers.filter(e=>e.life>0);
    const dist=Math.hypot(P.x-c.x,P.y-c.y);
    if(dist>67&&dist<440)chaseMove(c,P,Math.min(115*dt,dist-60),dt);
    if(mobs.some(q=>!q.dead&&!q.down&&!q.ally&&q.col&&q.col.woken&&weiNear(q,c,120)))c.hp=Math.max(0,c.hp-2.3*dt);
    if(c.hp<=0){wuFail('이릉 호위 실패');return;}
    if(w.embers.some(e=>weiNear(P,e,95))){w.burnT+=dt;if(w.burnT>=2){w.burnT=0;hurtPlayer(7,0,0,0);}}
    else w.burnT=0;
    if(!weiNear(P,p,145)||!weiNear(c,p,110))return;
    if(p.col.mobs.some(q=>!q.dead&&!q.down)){wakeColony(p.col);return;}
    w.embers.push({x:p.x,y:p.y,life:13});w.index++;showBanner('퇴각 경유지 '+w.index+'/3 돌파',1.8);
    if(w.index===3)weiExit('화공 탈출 · 기마 추살대를 막아라');
  },
  text(){return '이릉 화공 후퇴 · 경유지 '+M.wei.index+'/3 · 호위 '+Math.ceil(M.wei.companion.hp/110*100)+'%';},
  target(){const w=M.wei,p=w.points[w.index];return Math.hypot(P.x-w.companion.x,P.y-w.companion.y)>260?w.companion:p||null;},
  draw(){const w=M.wei;for(const e of w.embers){cx.save();cx.globalAlpha=Math.min(.7,e.life/3);wuFlames(e,77);cx.restore();}
    const p=w.points[w.index];if(p)weiMark(p,'퇴각 경유지 '+(w.index+1),'#f6ae7c',80);
    const c=w.companion;propSprite('npc1',c.x,c.y,61,100);
    cx.save();cx.fillStyle='#30252d';cx.fillRect(c.x-24,c.y-114,48,6);cx.fillStyle='#95dfa9';cx.fillRect(c.x-23,c.y-113,46*c.hp/110,4);cx.restore();}
};
