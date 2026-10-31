/* 40판 전용: 39명의 반란 NPC → 검은 원 도주 → 던전 칠장 → 절벽 거대 NPC27.
 * 원본 스테이지/대사, 1~39판 전투와 병과 정의는 수정하지 않는다. */
const F40_GROUPS=[[1,2,3,4,5,6,7],[8,9,10,11,12,13,14],[15,16,17,18,19,20,21],
  [22,23,24,25,26,27],[28,29,30,31,32,33],[34,35,36,37,38,39]];
const F40_DUNGEON=[
  {name:'NPC 화염수호장',type:'spear',color:[251,104,64],main:true,skills:['fire','charge','quake']},
  {name:'NPC 빙결수호장',type:'bow',color:[105,190,255],main:true,skills:['ice','burst','shield']},
  {name:'NPC 독무수호장',type:'bow',color:[187,109,236],main:true,skills:['poison','vortex','burst']},
  {name:'NPC 철벽수호장',type:'cav',color:[232,187,104],main:true,skills:['shield','quake','charge']},
  {name:'NPC 결박수호장',type:'spear',color:[107,225,209],main:true,skills:['bind','charge','fire']},
  {name:'NPC 폭풍수호장',type:'cav',color:[117,146,255],main:true,skills:['vortex','burst','charge']},
  {name:'NPC 심연수호장',type:'cav',color:[219,95,240],main:true,skills:['shield','vortex','quake','burst']}
];
const F40_NPC27={name:'NPC27',type:'spear',color:[73,126,255],main:true,skills:['charge','burst','quake']};
const F40_TAUNTS=[
  '문지기는 문을 열어주지 않는다!','망루에서 끝까지 지켜봤다!','이번 독기는 진짜다!',
  '군량을 갚아라!','말 달리는 소리 들리지?','감찰 보고서에 너를 썼다!',
  '설원에서 기다렸다!','숨은 문 따위 없다!','허창의 문은 우리가 지킨다!',
  '기마대 전원 돌격!','불배가 다시 온다!','일기토는 아직 끝나지 않았다!',
  '감시 대상이 돌아왔군!','횃불을 더 가져와!','독무를 뚫고 와 봐!',
  '기관은 아직 살아 있다!','쇠사슬을 다시 연결해!','이번엔 놓치지 않겠어!',
  '건업 감찰은 계속된다!','기마대가 마지막 다리를 지킨다!',
  '선착장은 봉쇄다!','장판교는 못 건넌다!','이 암굴은 우리 영역이야!',
  '정군산에서 내려다봤다!','황금 기마대, 다시 집결!','도주하는 전령을 따라잡아 봐!',
  '번성의 물이 기억나지?','계략은 두 번 통한다!','팔진은 아직 풀리지 않았다!',
  '마지막 불길을 봐라!','사수관의 창끝을 받아라!','하비의 원군이 왔다!',
  '우초의 불은 꺼지지 않는다!','황건의 주술을 보여주마!','낙양의 불길에 갇혀라!',
  '하비의 수문을 다시 연다!','호로관 충차를 부숴라!','낙양은 아직 타고 있다!',
  '미우성 마지막 문은 내가 지킨다!'
];

function final40Dialog(run){
  if(run.n!==40)return;
  for(let i=0;i<6;i++){
    const lines=F40_GROUPS[i].map(id=>({w:'npc',t:NPC_STAGE_BOSSES[id].name+' : '+F40_TAUNTS[id-1]}));
    if(i===0)run.dl.f40start=lines;
    else run.dl['kan'+i]=[...(run.dl['kan'+i]||[]),...lines];
  }
  for(let i=0;i<7;i++)run.dl['kan'+(i+6)]=[
    ...(run.dl['kan'+(i+6)]||[]),
    {w:'npc',t:F40_DUNGEON[i].name+' : 이 아래부터는 진짜 수호장이다!'}
  ];
  run.dl['kan13']=[...(run.dl.kan13||[]),{w:'npc',t:'도망은 여기까지다, 초선!'}];
  // 원래 script.md/stages.json 원고는 손대지 않고, 확정된 40판 엔딩만 실행 중 별도 연결.
  run.dl.end=[
    {w:'npc',t:'으으… 내가 졌다. 이제 난 어디로 가야 하지…?'},
    {w:'choseon',t:'기운 내. 다음에는 유비의 부인 역할을 맡겨줄게. 미부인이라고 알아?'},
    {w:'npc',t:'유비의 부인?! 내가 그렇게 높은 자리에?! 정말?!'},
    {w:'choseon',t:'그럼~ 장판파에서는 아주 중요한 역할이야.'},
    {w:'npc',t:'야호! 드디어 내가 주연이다! 유비의 부인이라니! 야호오!'},
    {w:'choseon',t:'…좋아하는 걸 보니 다행이네. 끝!'}
  ];
}

function final40Promote(q,d,id){
  if(!q||!d)return null;
  // 던전에서 요괴 대장을 재사용할 때도 사람 병사의 원본 아틀라스로 전환한다.
  if(!['0','1','2'].includes(q.set))q.set='1';
  q.type=d.type;q.npcBoss=true;q.npcBossDef=d;q.final40Id=id;
  q.npcShield=0;q.npcShieldUses=0;q.npcSkillCd=2.8;q.npcSkillIx=0;q.npcCast=null;q.npcBlockPop=0;
  q.hp=q.maxHp=Math.max(q.maxHp,q.hp/(3.4*2.4)*(d.main?10:6));
  q.atk*=d.main?2.15:1.7;q.scale=Math.max(q.scale,1.2);
  q.cd=Math.max(q.cd,.5);
  return q;
}
function final40ExtraBoss(m,d,id){
  const rooms=m.L.rooms.filter(r=>r!==m.L.st&&!r.keep&&!r.keepRoom);
  const r=rooms[(id*7+m.idx*3)%rooms.length]||m.L.exitRoom;
  const v=nearWalk(m.D.g,r.cx,r.cy);
  const c=mkCol(v[0]+.5,v[1]+.5,{n:2,leader:true,set:m.set,npcBossType:d.type,tag:'final40'});
  return final40Promote(c.lead,d,id);
}
function final40Init(m){
  if(m.n!==40)return;
  const idx=m.idx,st={idx,bosses:[],opening:false,escaped:false,portalT:0,portal:null,giant:false,skillT:3,skillIx:0,pose:0,poseT:0,hurtT:0};
  m.f40=st;m.npcWhirls=[];m.mis='final40';
  if(idx<6){
    const ids=F40_GROUPS[idx];
    const leaders=m.colonies.filter(c=>c.lead&&!c.hold&&c.tag!=='castle').map(c=>c.lead);
    // 이미 생성된 부대의 대장을 우선 재사용해 일반병 수와 기존 전투 흐름을 유지한다.
    for(const id of ids){const d=NPC_STAGE_BOSSES[id];const q=leaders.shift()||final40ExtraBoss(m,d,id);
      st.bosses.push(final40Promote(q,d,id));}
    showBanner('NPC 반란군 총력전 '+(idx+1)+'/6 · 간부 '+ids.length+'명',2.8);
  }else if(idx<13){
    const d=F40_DUNGEON[idx-6],q=m.guard||m.colonies.find(c=>c.lead)?.lead||final40ExtraBoss(m,d,100+idx);
    st.bosses=[final40Promote(q,d,100+idx)];
    st.bosses[0].hp=st.bosses[0].maxHp*=1.45;
    showBanner('심연 던전 '+(idx-5)+'/7 · '+d.name,2.8);
  }else final40GiantInit(m);
}
function final40EscapeSpawn(){
  const m=M,s=m.f40;if(s.escapeBoss)return;
  s.escapeBoss=final40ExtraBoss(m,F40_NPC27,27);
  s.escapeBoss.finalNpc27=true;
  s.escapeBoss.hp=s.escapeBoss.maxHp*=1.8;
  s.bosses=[s.escapeBoss];
  wakeColony(s.escapeBoss.col);
  showBanner('NPC27 등장 · 마지막 저항!',2.6);
}
function final40Escape(q){
  if(q.dead)return;
  q.dead=true;q.deadT=0;
  const s=M.f40;s.escaped=true;s.portal={x:q.x,y:q.y};s.portalT=0;
  shots.length=zones.length=0;
  showBanner('NPC27이 검은 원 속으로 사라졌다!',2.6);
  fxTeleport(q.x,q.y,true);
}
function final40GiantInit(m){
  const s=m.f40,b=m.captain;
  if(!b)throw new Error('40판 거대 NPC27 보스가 없습니다');
  s.giant=true;s.bosses=[b];
  b.final40Giant=true;b.finalNpc27=true;b.static=true;b.boss=false;
  b.npcBoss=false;b.guardL=false;b.captain=true;b.moving=false;
  b.hp=b.maxHp=Math.max(b.maxHp*3.8,stat.maxHp()*5.2);
  b.atk=Math.max(b.atk*2,stat.atk()*1.2);
  b.col.woken=true;
  // 절벽의 앞쪽 아래 부분만 이동 공간이다. 화면 위쪽 거대 보스는 별도 렌더링.
  const mx=Math.floor(m.W/2),my=Math.floor(m.H/2);
  const halfW=Math.max(4,Math.min(12,Math.floor((VW/Z)/TS/2)-2));
  const maxY=Math.max(5,Math.min(10,Math.floor((VH/Z)/TS/2)+3));
  for(let y=0;y<m.H;y++)for(let x=0;x<m.W;x++){
    const walk=x>=mx-halfW&&x<=mx+halfW&&y>=my+1&&y<=my+maxY;
    m.D.g[y][x]=walk?1:0;m.tk[y*m.W+x]=walk?1:0;
  }
  m.props=[];m.decors=[];m.blocks=[];m.gates=[];m.exit=null;
  mobs.length=0;mobs.push(b);m.colonies=[b.col];b.col.mobs=[b];
  b.x=(mx+.5)*TS;b.y=(my+1.5)*TS;
  P.x=(mx+.5)*TS;P.y=(my+Math.min(6,maxY-1)+.5)*TS;
  for(const a of allies){a.x=P.x+30;a.y=P.y+20;}
  cam.x=P.x;cam.y=(my+(maxY+1)/2)*TS;
  s.arena={x:(mx+.5)*TS,y:(my+(maxY+1)/2)*TS};
  M.flow=null;shots.length=zones.length=0;
  showBanner('거대 NPC27 · 최후의 절벽 결전!',3.2);
}
function final40EndGiant(q){
  if(q.dead)return;
  q.dead=true;q.deadT=0;S.kills++;
  const s=M.f40;s.pose=4;s.poseT=2;s.hurtT=2;
  shots.length=zones.length=0;M.npcWhirls.length=0;
  bossBurst(q);showBanner('거대 NPC27 격파!',3.2);
  M.mis='done';M.doneT=0;
}
function final40Tick(dt){
  if(!M||M.n!==40||!M.f40||M.ended||M.trans||UI.paused||UI.mode!=='battle')return;
  const s=M.f40;
  if(s.giant){
    s.hurtT=Math.max(0,s.hurtT-dt);s.poseT=Math.max(0,s.poseT-dt);
    if(M.mis==='done')return;
    if(!['manual','hunt'].includes(P.mode))return;
    s.skillT-=dt;
    if(s.skillT<=0){
      s.skillT=M.captain.hp<M.captain.maxHp*.5?2.9:4.2;
      s.skillIx++;s.pose=s.skillIx%3;s.poseT=.9;
      const b=M.captain;
      if(s.skillIx%3===1){
        addZone({k:'circle',x:P.x,y:P.y,r:125,life:.9,dmg:b.atk*1.25,kb:250,fx:'slam',pressureOwner:b});
        showBanner('거대 창 내려찍기!',1.4);
      }else if(s.skillIx%3===2){
        const a=Math.atan2(P.y-CH-b.y,P.x-b.x);
        for(let i=-2;i<=2;i++)shots.push({x:b.x,y:b.y-65,vx:Math.cos(a+i*.22)*420,vy:Math.sin(a+i*.22)*420,
          dmg:b.atk*.58,kind:'magic',npcColor:[92,150,255],r:16,t:0,life:2.3});
        showBanner('창기운 연속 발사!',1.4);
      }else{
        const a=Math.atan2((P.y-b.y)/YR,P.x-b.x);
        addZone({k:'cone',x:b.x,y:b.y,a,R:360,ha:1.0,life:.82,dmg:b.atk*1.2,kb:310,fx:'sweep',pressureOwner:b});
        showBanner('절벽 휩쓸기!',1.4);
      }
    }
    return;
  }
  if(s.escaped){s.portalT+=dt;if(s.portalT>=2.2&&!s.opening){s.opening=true;M.mis='exit';openExit();}return;}
  if(s.opening||M.mis==='exit')return;
  for(const b of s.bosses)if(!b.dead&&b.col&&!b.col.woken&&Math.hypot(P.x-b.x,P.y-b.y)<500)wakeColony(b.col);
  if(s.bosses.length&&s.bosses.every(b=>b.dead)){
    if(s.idx===5){final40EscapeSpawn();return;}
    s.opening=true;M.mis='exit';openExit();
    showBanner(s.idx<6?'NPC 간부 부대 격파 · 다음 전장으로':'던전 수호장 격파 · 더 깊은 곳으로',2.5);
  }
}
function final40Text(){
  const s=M.f40;if(!s)return '';
  if(s.giant)return '거대 NPC27 · '+Math.max(0,Math.ceil(100*M.captain.hp/M.captain.maxHp))+'%';
  if(s.escaped)return 'NPC27이 도주했다 · 검은 원을 지나 던전으로';
  if(s.escapeBoss)return 'NPC27을 쓰러뜨려라';
  const dead=s.bosses.filter(b=>b.dead).length;
  return s.idx<6?'NPC 반란군 '+(s.idx+1)+'/6 · 보스 '+dead+'/'+s.bosses.length:
    '심연 던전 '+(s.idx-5)+'/7 · '+s.bosses[0].npcBossDef.name;
}
function final40Target(){
  const s=M.f40;if(!s)return null;
  const b=s.bosses.find(b=>!b.dead);
  return b?{x:b.x,y:b.y,ent:b}:null;
}
function final40World(){
  if(!M||M.n!==40||!M.f40)return;
  const s=M.f40;
  if(s.portal){
    const p=s.portal,t=s.portalT,rad=Math.max(0,Math.sin(Math.min(1,t/2.2)*Math.PI))*75;
    cx.save();cx.translate(p.x,p.y);cx.scale(1,.44);
    cx.fillStyle='rgba(7,3,20,.92)';cx.beginPath();cx.arc(0,0,rad,0,7);cx.fill();
    cx.strokeStyle='rgba(114,83,221,.65)';cx.lineWidth=5;cx.stroke();cx.restore();
  }
  if(s.giant)final40DrawGiant();
}
const F40_RECTS=[[0,0,510,540],[500,0,530,540],[1010,0,526,540],
  [0,510,650,514],[650,510,650,514]];
const F40_POSE_CACHE=[];
function final40Pose(index){
  if(F40_POSE_CACHE[index])return F40_POSE_CACHE[index];
  const im=A.final40Giant;if(!im)return null;
  const [x,y,w,h]=F40_RECTS[index],cv=newCanvas(w,h),g=cv.getContext('2d');
  g.drawImage(im,x,y,w,h,0,0,w,h);
  // 그림 자체의 어두운 배경을 부드럽게 소멸시켜 절벽 배경 위에 결합한다.
  g.globalCompositeOperation='destination-in';
  const mask=g.createRadialGradient(w*.5,h*.53,w*.16,w*.5,h*.53,w*.67);
  mask.addColorStop(0,'rgba(0,0,0,1)');mask.addColorStop(.62,'rgba(0,0,0,.99)');
  mask.addColorStop(.85,'rgba(0,0,0,.45)');mask.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=mask;g.fillRect(0,0,w,h);
  return F40_POSE_CACHE[index]=cv;
}
function final40DrawCliff(x0,y0,vw,vh){
  const im=A.final40Cliff;
  if(im){cx.drawImage(im,x0,y0,vw,vh);return;}
  cx.fillStyle='#363052';cx.fillRect(x0,y0,vw,vh);
}
function final40DrawGiant(){
  const s=M.f40;if(!s||!s.giant)return;
  const i=s.hurtT>0?4:s.poseT>0?s.pose:0,im=final40Pose(i);
  if(!im)return;
  const vw=VW/Z,vh=VH/Z,xx=M.f40.arena.x-vw/2,yy=M.f40.arena.y-vh/2;
  cx.save();cx.globalAlpha=.94;
  cx.drawImage(im,xx+vw*.2,yy-vh*.02,vw*.60,vh*.67);
  const barW=vw*.51,barX=xx+(vw-barW)/2,barY=yy+vh*.11;
  const hp=Math.max(0,M.captain.hp/M.captain.maxHp);
  cx.globalAlpha=.88;cx.fillStyle='rgba(18,8,31,.8)';cx.fillRect(barX-4,barY-4,barW+8,18);
  cx.fillStyle='#1d274f';cx.fillRect(barX,barY,barW,10);
  const fill=cx.createLinearGradient(barX,0,barX+barW,0);
  fill.addColorStop(0,'#5f80f2');fill.addColorStop(1,'#c6aeff');
  cx.fillStyle=fill;cx.fillRect(barX,barY,barW*hp,10);
  cx.globalAlpha=1;cx.textAlign='center';cx.font='800 17px system-ui,sans-serif';
  cx.lineWidth=3;cx.strokeStyle='#16101f';cx.fillStyle='#fff0d0';
  cx.strokeText('NPC27',xx+vw*.5,barY-13);cx.fillText('NPC27',xx+vw*.5,barY-13);
  cx.restore();
}
function final40DrawNpc27(q){
  const im=A.final40Walk;if(!im)return false;
  const r=Math.floor((time+q.seed)*5)%4,dir=dirKey(q.face)[0];
  const row=dir==='front'?0:dir==='side'?1:2;
  const h=mobH(q)*q.scale,w=h*1.15;
  drawShadow(q.x,q.y,w*.27,7*q.scale,.28);
  cx.save();cx.globalAlpha=q.dead?Math.max(0,1-q.deadT/.8):1;
  cx.drawImage(im,r*362,row*362,362,362,q.x-w/2,q.y-h,w,h);
  cx.restore();
  if(q.npcBoss&&!q.dead)npcBossDrawLabel(q);
  return true;
}
