/* ───────── 미션 · 출구 · 칸 옮기기 · 상자/항아리/음식 ───────── */
const EXG={gate:'성문으로',door:'문으로',down:'지하로 내려가는 계단으로',up:'위층 계단으로',cave:'동굴 입구로'};
const EXOPEN={gate:'성문이',door:'문이',down:'지하 계단이',up:'위층 계단이',cave:'동굴 입구가'};
function heroNames(){return M.heroes.map(h=>MT[h.type].name).join(' · ');}
function kanTag(){const t=M.run.specs.length;return t>1?'['+(M.idx+1)+'/'+t+'칸] ':'';}
function misText(){
  const nm=M.heroes.length?heroNames():'',e=M.exit;
  const t={
    cmd:(M.openHour||11)+'시 방향 거점 병장을 쓰러뜨려라',
    guard:M.sp.last?'적 부장을 쓰러뜨려라':'수문장을 쓰러뜨려라',
    exit:e?'열린 '+EXG[e.art]+' 나아가라':'',
    inner:'내성문이 열렸다. 안으로 들어가라',
    hero:'내성의 적장을 제압하라 ('+nm+')',
    rescue:'갇힌 '+nm+'에게 다가가 손을 내밀어라',
    done:'시나리오 완료'}[M.mis];
  return t?kanTag()+t:'';
}
function nearestHero(){let b=null,bd=1e9;for(const h of M.heroes){const d=Math.hypot(h.x-P.x,h.y-P.y);if(d<bd){bd=d;b=h;}}return b;}
function misTarget(){
  switch(M.mis){
    case 'cmd':return M.beacon&&!M.beacon.dead?{x:M.beacon.x,y:M.beacon.y,ent:M.beacon}:null;
    case 'guard':{const g=M.sp.last?M.captain:M.guard;return g&&!g.dead?{x:g.x,y:g.y,ent:g}:null;}
    case 'exit':return M.exit?{x:M.exit.x1*TS,y:(M.exit.y+.5)*TS}:null;
    case 'inner':{const gt=M.gates[0];return gt?{x:(gt.x0+gt.x1+1)/2*TS,y:(gt.y0+gt.y1+1)/2*TS}:(M.L.keep?{x:M.L.keep.cx*TS,y:M.L.keep.cy*TS}:null);}
    case 'hero':return M.hero?{x:M.hero.x,y:M.hero.y,ent:M.hero}:null;
    case 'rescue':{const h=nearestHero();return h?{x:h.x,y:h.y,ent:h}:null;}
  }
  return null;
}
function openGate(id){
  const gt=M.gates.find(q=>q.id===id);if(!gt||gt.open)return;
  gt.open=true;gt.t=0;
  for(const [x,y] of gt.cells)M.D.g[y][x]=1;
  const gx=(gt.x0+gt.x1+1)/2*TS,gy=(gt.y0+gt.y1+1)/2*TS;
  M.focus={x:gx,y:gy,t:2.0};shake=Math.max(shake,10);debris(gx,gy,80,14);fx.push({k:'shock',x:gx,y:gy,R:160,t:0,life:.5});
  showBanner(gt.name+'이 열렸다',2.2);
}
function openExit(){
  const e=M.exit;if(!e||e.open)return;
  e.open=true;e.t=0;
  for(let x=e.x0;x<=e.x1;x++)M.D.g[e.y][x]=1;
  const gx=(e.x0+e.x1+1)/2*TS,gy=(e.y+1)*TS;
  M.focus={x:gx,y:gy-30,t:1.8};shake=Math.max(shake,8);debris(gx,gy,60,12);fx.push({k:'shock',x:gx,y:gy,R:150,t:0,life:.5});
  showBanner(EXOPEN[e.art]+' 열렸다',2.2);
}
function bossBurst(m){
  fx.push({k:'shock',x:m.x,y:m.y,R:150,t:0,life:.5});debris(m.x,m.y,60,12);shake=Math.max(shake,8);
  for(let i=0;i<10;i++)fx.push({k:'sp2',x:m.x+rnd(-20,20),y:m.y-60,vx:rnd(-60,60),vy:rnd(-260,-90),t:0,life:.7,red:true});
}
function onBeaconDead(m){   // 1스테이지 거점 병장
  bossBurst(m);if(M.mis==='cmd'){M.mis='exit';openExit();}
}
function onGuardDead(m){
  bossBurst(m);if(M.mis==='guard'&&!M.sp.last){M.mis='exit';openExit();}
}
function onCaptainDead(m){
  if(M.mis==='guard'&&M.sp.last){
    openGate('inner');M.mis='inner';
    for(const c of M.colonies)if(c.tag==='castle')c.hold=false;
  }
}
function heroDown(h){
  h.down=true;h.hp=1;h.hurt=.2;h.bs.s='down';h.cast=0;h.wind=0;h.moving=false;
  zones.length=0;shots.length=0;hstop=Math.max(hstop,.35);shake=Math.max(shake,12);
  fx.push({k:'shock',x:h.x,y:h.y,R:200,t:0,life:.5});
  gainExp(20*(1+.1*(S.stage-1)));
  showBanner(MT[h.type].name+' 제압',2.2);M.mis='rescue';
  if(M.cfgKind==='capture')queueDlg('mid',1.3);
}
function rescueTarget(){
  if(!M||!M.heroes||!P||P.mode!=='manual')return null;
  let b=null,bd=150;
  for(const h of M.heroes){if(!h.down||h.dead)continue;const d=Math.hypot(h.x-P.x,h.y-P.y);if(d<=bd){bd=d;b=h;}}
  return b;
}
function doAct(){const h=rescueTarget();if(h)joinHero(h);}
function joinHero(h){
  const id=h.type,fem=FEM.has(id);
  h.dead=true;const k=mobs.indexOf(h);if(k>=0)mobs.splice(k,1);
  const j=M.heroes.indexOf(h);if(j>=0)M.heroes.splice(j,1);
  if(M.hero===h)M.hero=null;
  if(fem){   // 여성 장수만 합류해 따라다닌다. 레벨은 낮게 시작하고 초선 레벨까지 키울 수 있다
    if(!S.roster.includes(id)){S.roster.push(id);S.hl[id]=Math.max(1,Math.floor(S.lv*.35));S.hx[id]=0;}
    M.joined.push(id);
    if(S.party.length<2&&!S.party.includes(id))S.party.push(id);
    if(S.party.includes(id)){const a=addAlly(id,h.x,h.y);fxTeleport(a.x,a.y);}else fxTeleport(h.x,h.y);
    showBanner(MT[id].name+' 합류',2.6);
  }else{      // 남성 장수는 구하면 끝: 합류도 병영 등록도 없다
    M.saved.push(id);fxTeleport(h.x,h.y);
    showBanner(MT[id].name+' 구출',2.6);
  }
  if(M.cfgKind==='rescue')queueDlg('mid',.8);
  if(!M.heroes.length){M.mis='done';M.doneT=0;}
  save();
}
/* 맵 안 대사 */
function queueDlg(k,delay){if(!M||!M.dl||!M.dl[k]||!M.dl[k].length||M.dlgDone[k])return;M.dlgQ.push({k,t:delay||0});}
function stopInput(){for(const q in keys)keys[q]=0;joy.id=null;joy.on=false;joy.x=joy.y=0;atkHeld=false;atkTap=0;}
function backToBattle(){UI.mode='battle';UI.paused=false;$('s_dlg').hidden=true;document.documentElement.classList.remove('nb');}
function runDlgQ(dt){
  if(!M.dlgQ.length||UI.mode!=='battle'||UI.paused)return;
  const q=M.dlgQ[0];q.t-=dt;if(q.t>0)return;
  M.dlgQ.shift();if(M.dlgDone[q.k])return;M.dlgDone[q.k]=1;
  const lines=M.dl[q.k];if(!lines||!lines.length)return;
  stopInput();playDlg(lines,backToBattle);
}
/* 칸 사이 대사를 미리 만든다 (같은 스테이지는 늘 같은 대사) */
function buildKanTalk(run){
  const n=run.n,tot=run.specs.length,sp=KAN_SPECIAL[n]||{},comp=(S.party.find(id=>S.roster.includes(id)&&MT[id]))||'npc';
  const conv=l=>({w:l[0]==='comp'?comp:l[0],t:l[1]});
  for(let i=1;i<tot;i++){
    let lines=sp[i];
    if(!lines){
      const pool=KAN_TALK[run.specs[i].t]||KAN_TALK.F,pk=pool[(n*7+i*3)%pool.length];
      lines=[pk];
      if(comp!=='npc'&&(n+i)%3===0)lines.push(['comp',KAN_COMP[(n+i)%KAN_COMP.length]]);
    }
    run.dl['kan'+i]=lines.map(conv);
  }
}
/* ───────── 칸 옮기기 ───────── */
function goNext(){
  const m=M;if(m.trans)return;m.trans=true;
  stopInput();UI.paused=true;
  const fd=$('kfade');fd.classList.add('on');
  setTimeout(()=>{
    try{
      const run=m.run;run.idx++;
      buildKan(run,run.idx,{clock:m.clock,k0:m.k0,replay:m.replay});
    }catch(e){console.error(e);}
    UI.paused=false;
    setTimeout(()=>fd.classList.remove('on'),120);
  },560);
}
function missionTick(dt){
  const m=M;
  if(m.exit&&m.exit.open){
    if(m.exit.t<1)m.exit.t=Math.min(1,m.exit.t+dt/.7);
    if(m.mis==='exit'&&!m.trans&&(P.mode==='manual'||P.mode==='hunt')){
      const e=m.exit;
      if(P.y<(e.y+.62)*TS&&P.x>e.x0*TS-8&&P.x<(e.x1+1)*TS+8)goNext();
    }
  }
  if(m.mis==='inner'&&m.L.keep&&P.mode!=='dead'){
    const kp=m.L.keep,tx=Math.floor(P.x/TS),ty=Math.floor(P.y/TS);
    if(m.L.inRoom(kp,tx,ty)){
      if(M.hero){M.mis='hero';const c=M.hero.col;c.hold=false;wakeColony(c);showBanner(MT[M.hero.type].name,1.8);queueDlg('enc',.6);}
      else if(M.heroes.length){M.mis='rescue';M.heroes[0].col.hold=false;showBanner(heroNames(),1.8);queueDlg('enc',.6);}
      else{M.mis='done';M.doneT=0;showBanner('시나리오 완료',2.4);}
    }
  }
  if(m.mis==='done')m.doneT+=dt;
  updateItems(dt);
  tickBuffs(dt);
  tickRevive(dt);
}
/* ───────── 출구 문 그리기 ───────── */
function drawExit(e){
  const x0=e.x0*TS,w=(e.x1-e.x0+1)*TS,yb=(e.y+1)*TS,h=TS*2.3,k=e.open?easeOut(e.t):0,cxm=x0+w/2,art=e.art;
  const pul=.5+.5*Math.sin(time*5);
  cx.save();
  const rock=M.sty==='cave'||art==='cave';
  if(M.sty==='out'||M.sty==='cave'){   // 야외 · 동굴 출구는 성벽 / 암벽에 박힌 문
    const wx0=x0-TS*1.15,ww=w+TS*2.3,wh=h+16;
    cx.fillStyle='rgba(0,0,0,.3)';cx.fillRect(wx0-4,yb-6,ww+8,10);
    if(!rock){
      const g=cx.createLinearGradient(0,yb-wh,0,yb);g.addColorStop(0,'#8a8696');g.addColorStop(1,'#514e5c');cx.fillStyle=g;cx.fillRect(wx0,yb-wh,ww,wh);
      cx.strokeStyle='rgba(30,26,40,.45)';cx.lineWidth=1.5;
      for(let r=0;r<6;r++){const yy=yb-wh+r*wh/6;cx.beginPath();cx.moveTo(wx0,yy);cx.lineTo(wx0+ww,yy);cx.stroke();for(let xx=wx0+(r%2?9:0);xx<wx0+ww;xx+=18){cx.beginPath();cx.moveTo(xx,yy);cx.lineTo(xx,yy+wh/6);cx.stroke();}}
      cx.fillStyle='#8a8696';for(let xx=wx0;xx<wx0+ww-8;xx+=20)cx.fillRect(xx,yb-wh-10,12,11);
      cx.fillStyle='rgba(0,0,0,.25)';cx.fillRect(wx0,yb-wh,ww,5);
    }else{
      cx.fillStyle='#3d3a46';cx.beginPath();cx.moveTo(wx0,yb);cx.lineTo(wx0+4,yb-wh+12);
      for(let xx=wx0+4;xx<=wx0+ww-4;xx+=14)cx.lineTo(xx,yb-wh-2+((xx*7|0)%11));
      cx.lineTo(wx0+ww-4,yb-wh+12);cx.lineTo(wx0+ww,yb);cx.closePath();cx.fill();
      cx.strokeStyle='rgba(10,8,16,.5)';cx.lineWidth=2;for(let i=0;i<5;i++){cx.beginPath();cx.moveTo(wx0+10+i*ww/5.2,yb-wh+14);cx.lineTo(wx0+4+i*ww/5.2,yb-8);cx.stroke();}
    }
  }
  // 돌 문틀
  cx.fillStyle='rgba(0,0,0,.3)';cx.fillRect(x0-6,yb-4,w+12,8);
  cx.fillStyle='#4a4650';cx.fillRect(x0-10,yb-h-6,w+20,h+6);
  cx.fillStyle='#625d6c';cx.fillRect(x0-10,yb-h-6,w+20,10);
  cx.fillStyle='#3a3640';cx.fillRect(x0-10,yb-h-6,8,h+6);cx.fillRect(x0+w+2,yb-h-6,8,h+6);
  const ix=x0+2,iw=w-4,iy=yb-h+8,ih=h-8;
  // 문 안쪽
  const dark=art==='cave'?'#0b0a10':art==='down'?'#07060a':art==='up'?'#3b3548':'#15121a';
  cx.fillStyle=dark;cx.beginPath();cx.moveTo(ix,yb);cx.lineTo(ix,iy+ih*.22);cx.quadraticCurveTo(cxm,iy-ih*.12,ix+iw,iy+ih*.22);cx.lineTo(ix+iw,yb);cx.closePath();cx.fill();
  if(k>0||!e.open){
    if(art==='down'||art==='up'){
      for(let i=0;i<5;i++){const yy=yb-6-i*(ih*.17),c=art==='down'?(12+i*5):(64+i*16);cx.fillStyle='rgb('+c+','+(c-2)+','+(c+10)+')';cx.fillRect(ix+2+(art==='up'?i*3:0),yy,iw-4-(art==='up'?i*6:0),ih*.1);}
      if(art==='up'){const g=cx.createLinearGradient(0,iy,0,iy+ih*.5);g.addColorStop(0,'rgba(255,230,160,.45)');g.addColorStop(1,'rgba(255,230,160,0)');cx.fillStyle=g;cx.fillRect(ix,iy,iw,ih*.5);}
    }else if(art==='cave'){
      cx.fillStyle='#1b1722';for(let i=0;i<4;i++){cx.beginPath();cx.arc(ix+4+i*iw/3.4,yb-4,10+i%2*6,Math.PI,0);cx.fill();}
    }
  }
  // 닫힌 문짝 / 철창
  if(!e.open){
    if(art==='gate'||art==='door'){
      const wood=art==='gate'?'#7a4e2a':'#8c5d36';
      cx.fillStyle=wood;cx.fillRect(ix,iy+ih*.2,iw/2-1,ih*.8);cx.fillRect(ix+iw/2+1,iy+ih*.2,iw/2-1,ih*.8);
      cx.strokeStyle='#2f1c0e';cx.lineWidth=2;for(let i=1;i<5;i++){const yy=iy+ih*.2+ih*.8*i/5;cx.beginPath();cx.moveTo(ix,yy);cx.lineTo(ix+iw,yy);cx.stroke();}
      cx.fillStyle='#9aa6b8';cx.fillRect(ix,iy+ih*.45,iw,4);cx.fillRect(ix,iy+ih*.78,iw,4);
      cx.fillStyle='#c9a24a';cx.beginPath();cx.arc(cxm-6,iy+ih*.62,3,0,7);cx.arc(cxm+6,iy+ih*.62,3,0,7);cx.fill();
    }else{
      cx.strokeStyle='#8e98a8';cx.lineWidth=3;for(let i=0;i<=5;i++){const xx=ix+3+i*(iw-6)/5;cx.beginPath();cx.moveTo(xx,iy+ih*.16);cx.lineTo(xx,yb-2);cx.stroke();}
      cx.beginPath();cx.moveTo(ix+2,iy+ih*.55);cx.lineTo(ix+iw-2,iy+ih*.55);cx.stroke();
    }
    cx.globalCompositeOperation='lighter';
    const g=cx.createRadialGradient(cxm,yb-ih*.45,4,cxm,yb-ih*.45,70);g.addColorStop(0,'rgba(255,70,60,'+(.18+.14*pul)+')');g.addColorStop(1,'rgba(255,60,50,0)');cx.fillStyle=g;cx.fillRect(cxm-70,yb-ih*.45-70,140,140);
  }else{
    // 열린 문짝은 양옆으로 접힌다
    if(k<1&&(art==='gate'||art==='door')){
      const wood=art==='gate'?'#7a4e2a':'#8c5d36',ww=iw/2*(1-k);
      cx.fillStyle=wood;cx.fillRect(ix,iy+ih*.2,ww,ih*.8);cx.fillRect(ix+iw-ww,iy+ih*.2,ww,ih*.8);
    }else if(k<1){cx.fillStyle='rgba(142,152,168,'+(1-k)+')';cx.fillRect(ix,iy+ih*.16,iw,ih*.84*(1-k));}
    cx.globalCompositeOperation='lighter';
    const g=cx.createRadialGradient(cxm,yb-14,4,cxm,yb-14,84);g.addColorStop(0,'rgba(255,225,130,'+(.28+.2*pul)+')');g.addColorStop(1,'rgba(255,200,80,0)');cx.fillStyle=g;cx.fillRect(cxm-90,yb-100,180,110);
  }
  cx.restore();
}
/* ───────── 맹독 분출구 (3스테이지) : 연기만 피어오른다 ───────── */
function updateVents(dt){
  if(!M.vents.length)return;
  const ka=Math.pow(1.12,S.stage-1)*(DIFF[S.diff]||DIFF[1]).atk,dmg=4*ka*1.3;
  for(const v of M.vents){
    v.t+=dt;const ph=v.t%VP;
    if(ph>=4.2){const k=Math.floor((ph-4.2)/.4);if(k!==v.k){v.k=k;ventHit(v,dmg);}}
    else v.k=-1;
  }
}
function ventHit(v,dmg){
  const r=v.r;
  if(Math.hypot(P.x-v.x,(P.y-v.y)/YR)<=r&&(P.mode==='manual'||P.mode==='hunt')){
    hurtPlayer(dmg,0,0,0);P.slowT=Math.max(P.slowT,1.6);
    pops.push({x:P.x,y:P.y-CH*2.2,t:0,txt:'중독',col:'#f0b0ff',size:17,vy:-36});
  }
  for(const a of allies)if(!a.down&&Math.hypot(a.x-v.x,(a.y-v.y)/YR)<=r)hurtAlly(a,dmg,0,0,0);
  for(const q of mobs){
    if(q.dead||q.down||q.boss||q.static||!q.col.woken)continue;
    if(Math.hypot(q.x-v.x,(q.y-v.y)/YR)>r)continue;
    q.hp-=dmg;q.hurt=.14;pops.push({x:q.x,y:q.y-80*q.scale,t:0,txt:fmt(dmg),col:'#f0b0ff',size:14,vy:-40});
    if(q.hp<=0)killMob(q);
  }
}
function drawVents(){
  if(!M.vents||!M.vents.length)return;
  const vw=VW/Z,vh=VH/Z,x0=cam.x-vw/2-140,x1=cam.x+vw/2+140,y0=cam.y-vh/2-160,y1=cam.y+vh/2+180;
  for(const v of M.vents){
    if(v.x<x0||v.x>x1||v.y<y0||v.y>y1)continue;
    const ph=v.t%VP,burst=ph>=4.2,u=burst?(ph-4.2)/1.2:0,build=ph>=3&&!burst?(ph-3)/1.2:0;
    cx.save();
    cx.fillStyle='rgba(18,8,26,.5)';cx.beginPath();cx.ellipse(v.x,v.y,16,9,0,0,7);cx.fill();
    const n=burst?11:build>0?7:4,fadeEnd=burst?Math.min(1,(1.12-u)*3):1;
    for(let i=0;i<n;i++){
      const w=((time*(burst?.85:.4)+i/n+v.t*.13)%1);
      const sx=v.x+Math.sin(i*2.7+v.t*1.3)*(7+w*(burst?34:15)),sy=v.y-w*(burst?115:64);
      const r=(burst?14:7)+w*(burst?26:12)+build*5;
      const a=(burst?.46:.2+.2*build)*(1-w)*fadeEnd;
      cx.fillStyle='rgba(200,130,245,'+a+')';cx.beginPath();cx.arc(sx,sy,r,0,7);cx.fill();
      if(burst){cx.fillStyle='rgba(240,200,255,'+a*.45+')';cx.beginPath();cx.arc(sx-r*.15,sy-r*.2,r*.55,0,7);cx.fill();}
    }
    cx.restore();
  }
}
/* ───────── 상자 · 항아리 · 음식 · 버프 ───────── */
const FOOD={
  manto:{n:'만두',heal:.22},mantobox:{n:'만두 찜통',heal:.5},chicken:{n:'닭고기',heal:.4},
  jerky:{n:'육포',buff:'atk'},pear:{n:'배',buff:'spd'},cheese:{n:'치즈',buff:'def'},wine:{n:'술',buff:'all'}
};
const BUFN={atk:['공격','#ffb27a',.3],def:['방어','#8fc8ff',.4],spd:['속도','#a8ffb0',.25]};
const BUF={atk:0,def:0,spd:0};
function resetBuffs(){BUF.atk=BUF.def=BUF.spd=0;}
function tickBuffs(dt){for(const k in BUF)BUF[k]=Math.max(0,BUF[k]-dt);}
const pks=[];
function dropFood(x,y,k){pks.push({x,y,k,t:0,vx:rnd(-70,70),vy:rnd(-190,-120),z:0,land:y,life:60});}
function foodRoll(chestMode){
  return pickWeighted(chestMode?[['manto',34],['mantobox',16],['chicken',14],['jerky',12],['pear',10],['cheese',10],['wine',4]]:[['manto',52],['chicken',8],['jerky',12],['pear',12],['cheese',12],['wine',4]]);
}
function eatFood(k){
  const f=FOOD[k];
  if(f.heal){
    P.hp=Math.min(stat.maxHp(),P.hp+stat.maxHp()*f.heal);
    pops.push({x:P.x,y:P.y-CH*2.1,t:0,txt:f.n+' 회복 +'+Math.round(f.heal*100)+'%',col:'#9ff09a',size:16,vy:-38});
    for(const a of allies)if(!a.down)a.hp=Math.min(a.maxHp,a.hp+a.maxHp*f.heal);
  }else{
    const ks=f.buff==='all'?['atk','def','spd']:[f.buff],dur=f.buff==='all'?30:45;
    for(const b of ks)BUF[b]=Math.max(BUF[b],dur);
    pops.push({x:P.x,y:P.y-CH*2.1,t:0,txt:f.n+' '+(f.buff==='all'?'전 능력 상승':BUFN[f.buff][0]+' +'+Math.round(BUFN[f.buff][2]*100)+'%'),col:f.buff==='all'?'#ffe27a':BUFN[f.buff][1],size:16,vy:-38});
  }
  fxTeleport(P.x,P.y);
}
function breakJars(rad){
  rad=rad||120;if(!M||!M.jarList)return;
  for(const p of M.jarList){
    if(p.dead)continue;
    if(Math.hypot(p.x-P.x,(p.y-P.y)/YR)>rad)continue;
    p.dead=true;debris(p.x,p.y-12,24,8);shake=Math.max(shake,2);
    const r=Math.random();
    if(r<.4)dropFood(p.x,p.y-14,foodRoll(false));
    else if(r<.46)pops.push({x:p.x,y:p.y-40,t:0,txt:'텅 비어 있다',col:'#cfcfcf',size:13,vy:-28});
  }
}
function openChest(p){
  p.opened=true;p.chest=0;
  const ok=(M.sty==='cave'?'c_chest_open':'d_chest_open'),r=A.pj[ok];
  if(r){p.k=ok;p.gw=r.gw;p.gh=r.gh;}
  fx.push({k:'shock',x:p.x,y:p.y-10,R:110,t:0,life:.4,small:true});debris(p.x,p.y-20,34,10);shake=Math.max(shake,4);
  for(let i=0;i<10;i++)fx.push({k:'sp2',x:p.x+rnd(-20,20),y:p.y-24,vx:rnd(-50,50),vy:rnd(-240,-100),t:0,life:.7});
  addDrop(makeItem(S.stage,{elite:true,min:0}),{x:p.x,y:p.y-24,scale:1});
  const nf=Math.random()<.5?2:1;
  for(let i=0;i<nf;i++)dropFood(p.x,p.y-10,foodRoll(true));
}
function updateItems(dt){
  if(P.mode==='manual'||P.mode==='hunt'){
    for(const p of M.chests)if(p.chest&&Math.hypot(p.x-P.x,(p.y-P.y)/YR)<70)openChest(p);
  }
  for(let i=pks.length-1;i>=0;i--){
    const q=pks[i];q.t+=dt;q.life-=dt;
    if(q.t<.55){q.x+=q.vx*dt;q.z+=q.vy*dt;q.vy+=620*dt;if(q.z>0){q.z=0;q.vy=0;q.vx=0;}}
    else{q.z=0;}
    if(q.life<=0){pks.splice(i,1);continue;}
    if(q.t>.4&&(P.mode==='manual'||P.mode==='hunt')&&Math.hypot(q.x-P.x,(q.y-P.y)/YR)<54){eatFood(q.k);pks.splice(i,1);}
  }
}
function drawPickups(){
  if(!pks.length||!A.food)return;
  for(const q of pks){
    const b=q.t>.55?Math.sin(time*4+q.x)*3:0,s=40,pos=A.fj.pos[q.k];
    cx.fillStyle='rgba(0,0,0,.28)';cx.beginPath();cx.ellipse(q.x,q.y+4,13,5,0,0,7);cx.fill();
    cx.save();cx.globalCompositeOperation='lighter';const g=cx.createRadialGradient(q.x,q.y-16+q.z,2,q.x,q.y-16+q.z,26);g.addColorStop(0,'rgba(255,240,170,.35)');g.addColorStop(1,'rgba(255,220,120,0)');cx.fillStyle=g;cx.fillRect(q.x-28,q.y-44+q.z,56,56);cx.restore();
    if(q.life<6&&((time*6|0)%2))continue;
    cx.drawImage(A.food,pos,0,A.fj.S,A.fj.S,q.x-s/2,q.y-s+q.z+b-2,s,s);
  }
}
/* ───────── 동료 : 쓰러지면 대사를 남기고 물러나 1분 뒤 칸 시작 지점에서 복귀 ───────── */
function allyDefeatLine(a){
  const ls=LOSS[a.type]||['물러납니다…'];
  pops.push({x:a.x,y:a.y-mobH(a)*1.55,t:0,txt:ls[rint(0,ls.length-1)],col:'#ffd9e8',size:17,vy:-12,life:2.8});
}
function allyLeave(a){
  const i=allies.indexOf(a);if(i>=0)allies.splice(i,1);
  fxTeleport(a.x,a.y,true);
  if(M&&M.run)M.run.revq.push({id:a.type,t:60,cmd:a.cmd});
}
function tickRevive(dt){
  const q=M.run.revq;
  for(let i=q.length-1;i>=0;i--){
    q[i].t-=dt;
    if(q[i].t>0)continue;
    const r=q.splice(i,1)[0];
    if(!S.party.includes(r.id)||allies.some(a=>a.type===r.id))continue;
    const s=M.D.start,a=addAlly(r.id,(s.cx+.5)*TS+rnd(-30,30),(s.cy+.5)*TS+rnd(10,40));
    a.cmd=r.cmd||'auto';fxTeleport(a.x,a.y);
    pops.push({x:a.x,y:a.y-mobH(a)*1.3,t:0,txt:'복귀!',col:'#9ff09a',size:18,vy:-30});
  }
}
function updateHudExtra(){
  const b=$('buffs'),r=$('revq');if(!b||!M||!M.run)return;
  let h='';for(const k in BUF)if(BUF[k]>0)h+='<span style="--c:'+BUFN[k][1]+'">'+BUFN[k][0]+'↑ '+Math.ceil(BUF[k])+'초</span>';
  if(b._h!==h){b._h=h;b.innerHTML=h;}
  let h2='';for(const q of M.run.revq)h2+='<span>'+(HN[q.id]||q.id)+' 복귀 '+Math.ceil(q.t)+'초</span>';
  if(r._h!==h2){r._h=h2;r.innerHTML=h2;}
}
