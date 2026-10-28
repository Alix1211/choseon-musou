import re,json,sys,shutil,os
BASE='/tmp/claude-0/-home-claude/8bc8db31-bb26-5aa2-b174-fd8760db3831/scratchpad/musou/'
src=open(BASE+'index.bak.html').read() if os.path.exists(BASE+'index.bak.html') else open(BASE+'index.html').read()
if not os.path.exists(BASE+'index.bak.html'):shutil.copy(BASE+'index.html',BASE+'index.bak.html')
s=src
def rep(old,new,n=1):
    global s
    c=s.count(old)
    assert c==n,('count',c,old[:80])
    s=s.replace(old,new)
def cut(a,b,new):
    global s
    i=s.index(a);j=s.index(b,i)
    s=s[:i]+new+s[j:]

# 1 폰트 · CSS
rep('<style>','<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">\n<style>')
css=open(BASE+'_new/ui.css').read()
rep('</style>',css+'\n</style>')

# 2 본문 HTML
rep('    <div id="pips"></div>\n','')
rep('    <div id="fr"><button id="chal" disabled>보스 도전</button><span id="st"></span></div>\n','')
rep('<div id="hpw"><div id="hpb"></div><div id="hpt"></div></div>','<div id="hpw"><div id="hpb"></div><div id="hpt"></div></div><div id="xpw"><div id="xpb"></div></div>')
rep('  <div id="tr"><div id="gold"></div><div class="row"><button id="mode">조작: 자동</button><button id="spd">속도 ×1</button></div></div>\n','')
cut('<div id="clr" hidden>','<button id="atk"','')
rep('<div class="hud" id="bar"></div>\n','')
rep('<div id="load">',open(BASE+'_new/ui.html').read()+'<div id="load">')
rep('<div class="sec">자동 판매</div>','<div class="sec">자동 정리</div>')
rep('>지금 판매</button>','>지금 정리</button>')

# 3 저장 · 상태
cut("const SAVEKEY='choseon_musou_v1';","/* ───────── 장비 ───────── */","""const SAVEKEY='choseon_musou_v2';
const EMPTY=()=>({weapon:null,ring:null,necklace:null,armor:null});
const S={gold:0,stage:1,kills:0,deaths:0,speed:1,auto:false,farm:null,fail:0,nid:1,inv:[],eq:EMPTY(),enh:{weapon:0,ring:0,necklace:0,armor:0},sell:{t:[1,0,0,0],weak:1},roster:[],party:[],lv:1,xp:0,cl:{},diff:1,cheat:0,actv:1};
try{const s=JSON.parse(localStorage.getItem(SAVEKEY)||'null');if(s&&s.eq){Object.assign(S,s);S.eq=Object.assign(EMPTY(),s.eq||{});S.enh=Object.assign({weapon:0,ring:0,necklace:0,armor:0},s.enh||{});S.sell=Object.assign({t:[1,0,0,0],weak:1},s.sell||{});S.inv=s.inv||[];S.roster=Array.isArray(s.roster)?s.roster:[];S.party=Array.isArray(s.party)?s.party.filter(i=>S.roster.includes(i)).slice(0,2):[];S.cl=s.cl||{};S.lv=Math.max(1,s.lv|0||1);S.xp=+s.xp||0;}}catch(e){}
S.auto=false;S.speed=1;
function save(){try{localStorage.setItem(SAVEKEY,JSON.stringify(S));}catch(e){}}

""")

# 4 장비 : 레벨 배수 · 골드 제거
rep("atk:wA*(1+(rA+o.atkp)/100),maxHp:(200+nH)*(1+o.hpp/100),def:(4+aD)*(1+o.defp/100)","atk:wA*(1+(rA+o.atkp)/100)*(1+.03*(S.lv-1)),maxHp:(200+nH)*(1+o.hpp/100)*(1+.04*(S.lv-1)),def:(4+aD)*(1+o.defp/100)*(1+.02*(S.lv-1))")
rep("function recalc(){const old=ST?ST.maxHp:0;ST=calc(S.eq,S.enh);if(P&&old>0)P.hp=Math.min(ST.maxHp,P.hp*ST.maxHp/old);refreshUps();}",
"""function recalc(){const old=ST?ST.maxHp:0;ST=calc(S.eq,S.enh);if(P&&old>0)P.hp=Math.min(ST.maxHp,P.hp*ST.maxHp/old);refreshUps();for(const a of allies){const r=a.hp/a.maxHp;a.maxHp=Math.max(120,ST.maxHp*.85);a.hp=a.maxHp*r;a.atk=ST.atk*.85;}}
const LVCAP=70,expNeed=lv=>Math.round(60+6.5*(lv-1));
function gainExp(v){
  if(M&&M.replay)v*=.5;
  if(S.lv>=LVCAP){S.xp=0;return;}
  S.xp+=v;let up=0;
  while(S.lv<LVCAP&&S.xp>=expNeed(S.lv)){S.xp-=expNeed(S.lv);S.lv++;up++;}
  if(S.lv>=LVCAP)S.xp=0;
  if(up){recalc();if(P){P.hp=ST.maxHp;pops.push({x:P.x,y:P.y-CH*2.6,t:0,txt:'레벨 업! Lv '+S.lv,col:'#ffe27a',size:22,vy:-28,life:1.6});fx.push({k:'shock',x:P.x,y:P.y,R:150,t:0,life:.5,small:true});}for(const a of allies)a.hp=a.maxHp;}
}""")
rep("function sellItem(id){const k=S.inv.findIndex(x=>x.id===id);if(k<0)return;S.gold+=sellValue(S.inv[k]);S.inv.splice(k,1)","function sellItem(id){const k=S.inv.findIndex(x=>x.id===id);if(k<0)return;S.inv.splice(k,1)")
rep("S.inv=S.inv.filter(it=>{if(sellable(it)){g+=sellValue(it);return false;}return true;});S.gold+=g;","S.inv=S.inv.filter(it=>{if(sellable(it)){g++;return false;}return true;});")
rep("if(sell){S.gold+=sellValue(it);return;}","if(sell)return;")
rep("const GEN=['atkp','hpp','defp','crit','critd','cdr','gold','regen','skd'];","const GEN=['atkp','hpp','defp','crit','critd','cdr','regen','skd'];")
rep("""if(!equipped)h+='<div class="ln"><small>판매가</small><small>● '+fmt(sellValue(it))+'</small></div>';\n""","")
rep("sl.textContent='판매';","sl.textContent='정리';")
rep("(sl==='weapon'&&it?WN[it.w]+' ':'')+'+'+S.enh[sl]","(sl==='weapon'&&it?WN[it.w]:'')")
rep("[['공격력',fmt1(ST.atk)],","[['레벨',S.lv+(S.lv>=LVCAP?' (최대)':'')],['공격력',fmt1(ST.atk)],")
rep(",['골드 획득','+'+Math.round((ST.gold-1)*100)+'%']","")
rep("if(lv>0)h+='<div class=\"ln\"><small>강화 +'+lv+' 적용</small></div>';","")

# 5 몹 스케일
rep("k=Math.pow(1.27,S.stage-1),ka=Math.pow(1.19,S.stage-1);","DF=DIFF[S.diff]||DIFF[1],k=Math.pow(1.13,S.stage-1)*DF.hp,ka=Math.pow(1.12,S.stage-1)*DF.atk;")
rep("else if(m.type==='yueying')aiYueying(m,b,dt,dx,dy,d,ph2);","else if(MT[m.type].hero)aiYueying(m,b,dt,dx,dy,d,ph2);")
rep("m.type==='yueying'?'130,255,190'","m.hero?'130,255,190'")

# 6 처치 · 경험치
rep("  m.dead=true;m.deadT=0;S.kills++;if(P)P.nk=0;\n","  m.dead=true;m.deadT=0;S.kills++;if(P)P.nk=0;\n  gainExp((m.beacon?5:m.boss?15:m.elite?5:1)*(1+.1*(S.stage-1)));\n")
rep("for(let i=0;i<26;i++)fx.push({k:'coin',x:m.x+rnd(-40,40),y:m.y-40,vx:rnd(-160,160),vy:rnd(-300,-110),t:0,life:.9});","")
rep("""  const gg=m.gold*ST.gold;S.gold+=gg;rollDrops(m);
  pops.push({x:m.x,y:m.y-60,t:0,txt:'+'+fmt(gg),col:'#ffd36b',size:13,vy:-34,delay:.1});
  for(let i=0;i<6;i++)fx.push({k:'coin',x:m.x,y:m.y-30,vx:rnd(-70,70),vy:rnd(-180,-90),t:0,life:.7});""","  rollDrops(m);")

# 7 대사 말풍선 수명
rep("if(p.t>.9)pops.splice(i,1);","if(p.t>(p.life||.9))pops.splice(i,1);")
rep("const a=1-Math.max(0,p.t-.55)/.35;cx.globalAlpha","const a=1-Math.max(0,p.t-((p.life||.9)-.35))/.35;cx.globalAlpha")

# 8 언월도 : 월영만
rep("function halFx(x,y,a0,a1,life,sc,sw,ent){fx.push({k:'hal',x,y,a0,a1,t:0,life,sw:sw||life*.6,sc:sc||.62,ent:ent||null});}","function halFx(x,y,a0,a1,life,sc,sw,ent,wp){fx.push({k:'hal',x,y,a0,a1,t:0,life,sw:sw||life*.6,sc:sc||.62,ent:ent||null,wp:!!wp});}")
rep("halFx(z.x,z.y-52,z.ang-1.2,z.ang+1.2,.36,.66);","halFx(z.x,z.y-52,z.ang-1.2,z.ang+1.2,.36,.66,null,null,z.own==='yueying');")
rep("halFx(z.x,z.y-52,0,Math.PI*3,.5,.62,.5);","halFx(z.x,z.y-52,0,Math.PI*3,.5,.62,.5,null,z.own==='yueying');")
rep("fx:'hwhirl'});}\n    else if(b.cdA","fx:'hwhirl',own:m.type});}\n    else if(b.cdA")
rep("fx:'hsweep',ang});}","fx:'hsweep',ang,own:m.type});}")
rep("life:.75,dmg:bd(m)*1.5,kb:380,fx:'hwhirl'});","life:.75,dmg:bd(m)*1.5,kb:380,fx:'hwhirl',own:m.type});")
rep("halFx(m.x,m.y,b.a,b.a,.55,.72,.05,m);","halFx(m.x,m.y,b.a,b.a,.55,.72,.05,m,m.type==='yueying');")
rep("halFx(m.x,y0,ang-.9,ang+.5,.3,.6);","halFx(m.x,y0,ang-.9,ang+.5,.3,.6,null,null,m.type==='yueying');")
rep("halFx(a.x,a.y-48*a.scale,ang-1.15,ang+1.15,.34,.55);","halFx(a.x,a.y-48*a.scale,ang-1.15,ang+1.15,.34,.55,null,null,a.type==='yueying');")
rep("halFx(a.x,a.y-48*a.scale,0,Math.PI*3,.5,.55,.5);","halFx(a.x,a.y-48*a.scale,0,Math.PI*3,.5,.55,.5,null,a.type==='yueying');")
rep("""      cx.save();cx.translate(hx,hy);cx.rotate(a-wj.wang);cx.scale(f.sc,f.sc);cx.globalAlpha=.9*al;
      cx.drawImage(A.mobs,wj.x,wj.y,wj.w,wj.h,-wj.wpx,-wj.wpy,wj.w,wj.h);cx.restore();""","""      if(f.wp){cx.save();cx.translate(hx,hy);cx.rotate(a-wj.wang);cx.scale(f.sc,f.sc);cx.globalAlpha=.9*al;
      cx.drawImage(A.mobs,wj.x,wj.y,wj.w,wj.h,-wj.wpx,-wj.wpy,wj.w,wj.h);cx.restore();}""")

# 9 정지 초상 영웅 그리기
rep("""  const dk=dirKey(m.face),dir=dk[0],flip=dk[1],r=A.mj.mobs[m.set][m.type][dir];
  const sc=mobH(m)/(MT[m.type].H||A.mj.h)*m.scale;""","""  const stl=!!MT[m.type].still;
  const dk=dirKey(m.face),dir=dk[0],flip=dk[1],r=stl?null:A.mj.mobs[m.set][m.type][dir];
  const sc=stl?1:mobH(m)/(MT[m.type].H||A.mj.h)*m.scale;""")
rep("drawShadow(m.x,m.y,Math.min(r.w,r.h*.85)*sc*.3,7*m.scale,.28*alpha);","drawShadow(m.x,m.y,stl?44*m.scale:Math.min(r.w,r.h*.85)*sc*.3,7*m.scale,.28*alpha);")
rep("""  cx.save();cx.translate(bx,by);cx.globalAlpha=alpha;cx.scale((flip?-1:1)*sc*sx,sc*sy);
  cx.drawImage(A.mobs,r.x,r.y,r.w,r.h,-r.ax,-r.ay,r.w,r.h);
  if(m.type==='spear'&&r.th!==undefined)drawSpearTip(m,dir,r);
  if(m.hurt>0){cx.globalAlpha=alpha*.75*(m.hurt/.14);cx.drawImage(whiteMob(m.set,m.type,dir),-r.ax,-r.ay);}
  cx.restore();cx.globalAlpha=1;""","""  if(stl)drawStill(m,bx,by,sx,sy,alpha);
  else{
  cx.save();cx.translate(bx,by);cx.globalAlpha=alpha;cx.scale((flip?-1:1)*sc*sx,sc*sy);
  cx.drawImage(A.mobs,r.x,r.y,r.w,r.h,-r.ax,-r.ay,r.w,r.h);
  if(m.type==='spear'&&r.th!==undefined)drawSpearTip(m,dir,r);
  if(m.hurt>0){cx.globalAlpha=alpha*.75*(m.hurt/.14);cx.drawImage(whiteMob(m.set,m.type,dir),-r.ax,-r.ay);}
  cx.restore();cx.globalAlpha=1;}""")
rep("function drawMob(m){\n  if(m.beacon){drawBeacon(m);return;}","""function drawStill(m,bx,by,sx,sy,alpha){
  const im=A.pt&&A.pt[m.type];if(!im)return;
  const h=mobH(m)*m.scale,w=h*im.width/im.height;
  cx.save();cx.translate(bx,by);cx.globalAlpha=alpha;cx.scale(sx,sy);
  cx.drawImage(im,-w/2,-h,w,h);
  if(m.hurt>0){cx.globalCompositeOperation='source-atop';cx.fillStyle='rgba(255,255,255,'+.55*(m.hurt/.14)+')';cx.fillRect(-w/2,-h,w,h);}
  cx.restore();cx.globalAlpha=1;
}
function drawMob(m){
  if(m.beacon){drawBeacon(m);return;}""")

# 10 buildMusou
cut("function buildMusou(){","/* ───────── 미션 ───────── */","""function buildMusou(cfg){
  cfg=cfg||{hero:[],kind:'other'};
  S.auto=false;
  const W=60,H=44,g=Array.from({length:H},()=>new Uint8Array(W));
  const carve=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(y>1&&y<H-1&&x>0&&x<W-1)g[y][x]=1;};
  carve(2,16,11,27);carve(10,20,16,22);                       // 아군 진영
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x+.5-18.5)/8.3,dy=(y+.5-21)/12.5;if(dx*dx+dy*dy<=1)g[y][x]=1;}   // 들판
  for(let y=0;y<H;y++)for(let x=27;x<=28;x++)g[y][x]=0;       // 성벽(서쪽 두 줄)
  carve(29,8,40,34);carve(43,8,52,34);                         // 안뜰 · 내성
  const camp={x:2,y:16,w:10,h:12,cx:6,cy:21};
  const D={g,rooms:[camp],start:camp,far:camp};
  const gates=[{id:'west',name:'서문',x0:27,y0:19,x1:28,y1:22,iron:false,open:false,t:0},{id:'inner',name:'내성문',x0:41,y0:19,x1:42,y1:22,iron:true,open:false,t:0}];
  const m={kind:['field','spring','성'],type:'field',theme:'spring',name:cfg.t||'성 공략',W,H,D,colonies:[],set:'0',musou:true,boss:null,bossType:null,gates,hero:null,heroes:[],beacon:null,captain:null,mis:'beacon',doneT:0,focus:null,clock:0,joined:[]};
  m.ground=paintField(D,W,H,'spring');paintCastle(m);
  const cs=CASTLE;
  m.props=fieldProps(D,W,H,'spring').filter(p=>!(p.x>=(cs.x0-1)*TS&&p.x<=(cs.x1+2)*TS&&p.y>=(cs.y0-1)*TS&&p.y<=(cs.y1+3)*TS)).concat(castleProps(m));
  m.props.sort((a,b)=>a.y-b.y);
  M=m;mobs.length=0;shots.length=0;fx.length=0;pops.length=0;orbs.length=0;zones.length=0;wards.length=0;allies.length=0;
  // 들판의 부대 · 봉화대
  mkColony(16,15,{n:6,leader:true});mkColony(16,28,{n:6,leader:true});
  mkColony(20.5,14.5,{n:5,leader:true});
  const bcol={idx:m.colonies.length,room:{x:19,y:9,w:6,h:6,cx:22.5,cy:11.5},cx:22.5*TS,cy:11.5*TS,mobs:[],woken:false,cleared:false,boss:false,hold:false,tag:'beacon'};
  const bc=createMob('beacon','0',22.5*TS,11.5*TS,bcol,false);bc.beacon=true;bc.static=true;
  bcol.mobs.push(bc);mobs.push(bc);m.colonies.push(bcol);m.beacon=bc;
  // 성 안
  mkColony(34.5,12.5,{n:6,leader:true,hold:true,tag:'castle'});
  mkColony(34.5,30.5,{n:6,leader:true,hold:true,tag:'castle'});
  const cc=mkColony(37,21.5,{n:7,leader:true,captain:true,hold:true,tag:'castle'});m.captain=cc.lead;
  // 내성의 영웅 : 구출전은 갇혀 있고, 포획전은 먼저 싸운다
  const hs=(cfg.hero||[]).filter(id=>!S.roster.includes(id)&&MT[id]);
  if(hs.length){
    const hc={idx:m.colonies.length,room:{x:44,y:18,w:8,h:7,cx:48,cy:21},cx:47.5*TS,cy:21.5*TS,mobs:[],woken:false,cleared:false,boss:false,hold:true,tag:'keep'};
    const spots=[[47.5,21.5],[48.6,19.4],[48.6,23.6]];
    hs.forEach((id,i)=>{
      const sp=spots[i]||spots[0];
      const h=createMob(id,'h',sp[0]*TS,sp[1]*TS,hc,false);h.face='left';
      if(cfg.kind==='capture'&&i===0)m.hero=h;
      else{h.down=true;h.hp=1;h.bs.s='down';h.captive=true;}
      hc.mobs.push(h);mobs.push(h);m.heroes.push(h);
    });
    m.colonies.push(hc);
  }
  P=newPlayer();P.x=(camp.cx+.5)*TS;P.y=(camp.cy+.5)*TS;
  cam.x=P.x;cam.y=P.y-50;P.mode='tele_in';P.tt=0;fxTeleport(P.x,P.y);
  S.party.slice(0,2).forEach(id=>{if(S.roster.includes(id)&&MT[id])addAlly(id,P.x+rnd(-50,50),P.y+60);});
  showBanner(cfg.t||'성 공략',1.8);
}

""")

# 11 미션
cut("function misText(){","function openGate(id){","""function heroNames(){return M.heroes.map(h=>MT[h.type].name).join(' · ');}
function misText(){
  const nm=M.heroes.length?heroNames():'';
  return {beacon:'적의 봉화대를 부숴 서문을 열어라',west:'열린 서문으로 성 안에 들어가라',captain:'성 안의 적 부장을 쓰러뜨려라',
    inner:'내성문이 열렸다. 안으로 들어가라',hero:'내성의 적장을 제압하라 ('+nm+')',rescue:'갇힌 '+nm+'에게 다가가 손을 내밀어라',done:'시나리오 완료'}[M.mis]||'';
}
function nearestHero(){let b=null,bd=1e9;for(const h of M.heroes){const d=Math.hypot(h.x-P.x,h.y-P.y);if(d<bd){bd=d;b=h;}}return b;}
function misTarget(){
  switch(M.mis){
    case 'beacon':return M.beacon&&!M.beacon.dead?{x:M.beacon.x,y:M.beacon.y,ent:M.beacon}:null;
    case 'west':return {x:30.5*TS,y:20.5*TS};
    case 'captain':return M.captain&&!M.captain.dead?{x:M.captain.x,y:M.captain.y,ent:M.captain}:null;
    case 'inner':return {x:44.5*TS,y:20.5*TS};
    case 'hero':return M.hero?{x:M.hero.x,y:M.hero.y,ent:M.hero}:null;
    case 'rescue':{const h=nearestHero();return h?{x:h.x,y:h.y,ent:h}:null;}
  }
  return null;
}
""")
cut("function heroDown(h){","function missionTick(dt){","""function heroDown(h){
  h.down=true;h.hp=1;h.hurt=.2;h.bs.s='down';h.cast=0;h.wind=0;h.moving=false;
  zones.length=0;shots.length=0;hstop=Math.max(hstop,.35);shake=Math.max(shake,12);
  fx.push({k:'shock',x:h.x,y:h.y,R:200,t:0,life:.5});
  gainExp(20*(1+.1*(S.stage-1)));
  showBanner(MT[h.type].name+' 제압',2.2);M.mis='rescue';
}
function rescueTarget(){
  if(!M||!M.heroes||!P||P.mode!=='manual')return null;
  let b=null,bd=150;
  for(const h of M.heroes){if(!h.down||h.dead)continue;const d=Math.hypot(h.x-P.x,h.y-P.y);if(d<=bd){bd=d;b=h;}}
  return b;
}
function doAct(){const h=rescueTarget();if(h)joinHero(h);}
function joinHero(h){
  h.dead=true;const k=mobs.indexOf(h);if(k>=0)mobs.splice(k,1);
  const j=M.heroes.indexOf(h);if(j>=0)M.heroes.splice(j,1);
  if(M.hero===h)M.hero=null;
  if(!S.roster.includes(h.type))S.roster.push(h.type);
  M.joined.push(h.type);
  if(S.party.length<2&&!S.party.includes(h.type))S.party.push(h.type);
  if(S.party.includes(h.type)){const a=addAlly(h.type,h.x,h.y);fxTeleport(a.x,a.y);}else fxTeleport(h.x,h.y);
  showBanner(MT[h.type].name+' 합류',2.6);
  if(!M.heroes.length){M.mis='done';M.doneT=0;}
  save();
}
""")
cut("function missionTick(dt){","/* ───────── 동료 ───────── */","""function missionTick(dt){
  if(M.mis==='west'&&P.x>=29.6*TS){M.mis='captain';showBanner('성 안의 부장을 찾아라',1.8);}
  else if(M.mis==='inner'&&P.x>=43.6*TS){
    if(M.hero){M.mis='hero';const c=M.hero.col;c.hold=false;wakeColony(c);showBanner(MT[M.hero.type].name,1.8);}
    else if(M.heroes.length){M.mis='rescue';M.heroes[0].col.hold=false;showBanner(heroNames(),1.8);}
    else{M.mis='done';M.doneT=0;showBanner('시나리오 완료',2.4);}
  }
  if(M.mis==='done')M.doneT+=dt;
}

""")

# 12 매 프레임
rep("  missionTick(dt);\n  M.pathT-=dt;if(M.pathT<=0){M.pathT=.45;M.path=findPath();}\n","  missionTick(dt);\n  M.clock+=dt;\n")
rep("drawPathLine();for(const gt of M.gates)","for(const gt of M.gates)")
rep("""  const show=M.mis==='done'&&M.doneT>1.8&&!M.clrDismiss,clr=$('clr');if(clr.hidden===show)clr.hidden=!show;""","""  if(M.mis==='done'&&M.doneT>1.6&&!M.ended&&UI.mode==='battle')endStage();""")

# 13 UI 재작성
cut("function buildUI(){","function showBanner(","""function buildUI(){
  $('spin').addEventListener('click',()=>{if(P)P.spinReq=true;});
  $('sk1').addEventListener('click',()=>{if(P)P.skReq[0]=.4;});
  $('sk2').addEventListener('click',()=>{if(P)P.skReq[1]=.4;});
  {const ab=$('atk');
   const aDown=e=>{e.preventDefault();atkHeld=true;atkTap=.25;ab.classList.add('hold');try{ab.setPointerCapture(e.pointerId);}catch(_){}};
   const aUp=()=>{atkHeld=false;ab.classList.remove('hold');};
   ab.addEventListener('pointerdown',aDown);ab.addEventListener('pointerup',aUp);ab.addEventListener('pointercancel',aUp);ab.addEventListener('lostpointercapture',aUp);ab.addEventListener('contextmenu',e=>e.preventDefault());}
  $('cmd').addEventListener('click',()=>{const m=$('cmdm');m.hidden=!m.hidden;if(!m.hidden)buildCmdMenu();});
  $('act').addEventListener('click',doAct);
  $('bclose').addEventListener('click',closeBag);
  $('sellnow').addEventListener('click',()=>{sellNow();renderBag();});
  document.querySelectorAll('#sellset input[data-t]').forEach(i=>i.addEventListener('change',()=>{S.sell.t[+i.dataset.t]=i.checked?1:0;save();renderBag();}));
  $('swk').addEventListener('change',e=>{S.sell.weak=e.target.checked?1:0;save();});
}
let uiT=0;
function refreshUI(){
  if(bagOpen&&bagDirty&&$('idet').hidden)renderBag();
  if(UI.mode!=='battle'||!M||!P)return;
  {const ab=$('atk'),ok=(P.mode==='manual'||P.mode==='hunt'),lab='공격<small>'+WN[ST.wt]+'</small>';
   if(ab.disabled!==!ok)ab.disabled=!ok;if(!ok)atkHeld=false;if(ab._l!==lab){ab._l=lab;ab.innerHTML=lab;}}
  const sp=$('spin');
  {const ready=P.spinCd<=0,can=(P.mode==='manual'||P.mode==='hunt')&&ready&&P.atk!=='spinfan';
    sp.disabled=!can;sp.innerHTML=!ready?Math.ceil(P.spinCd)+'초':'회전<br>부채';
    for(const k of [1,2]){const b=$('sk'+k),i=k-1,cd=P.skCd[i],ok=(P.mode==='manual'||P.mode==='hunt')&&cd<=0&&!P.sk;
      b.disabled=!ok;b.innerHTML=cd>0?Math.ceil(cd)+'초':SK[ST.wt][i].n.replace(' ','<br>');}}
  $('stage').textContent='Lv '+S.lv+' · Stage '+(M.n||S.stage);
  const pct=P.hp/stat.maxHp();$('hpb').style.width=Math.max(0,pct*100)+'%';$('hpt').textContent=fmt(P.hp)+' / '+fmt(stat.maxHp());
  $('xpb').style.width=(S.lv>=LVCAP?100:Math.min(100,S.xp/expNeed(S.lv)*100))+'%';
  $('spb').style.width=(P.spinCd<=0?100:(1-P.spinCd/SPIN_CD)*100)+'%';
  $('dbf').textContent=P.slowT>0?'둔화 '+P.slowT.toFixed(1)+'초':'';
  const bb=M.hero&&M.hero.col.woken&&!M.hero.dead&&!M.hero.down?M.hero:null;
  $('boss').hidden=!bb;
  musouUI();
  if(bb){$('bn').textContent=MT[bb.type].name;$('bb').style.width=Math.max(0,bb.hp/bb.maxHp*100)+'%';}
}
""")
rep("cv.width=VW*DPR;cv.height=VH*DPR;document.documentElement.style.setProperty('--barh',($('bar').offsetHeight||64)+'px');","cv.width=VW*DPR;cv.height=VH*DPR;")
rep("  if(e.key==='m'||e.key==='M')toggleMode();\n","")

# 14 루프 · 부팅
cut("function loop(now){","setInterval(save,5000);","""function loop(now){
  const dt=Math.min(.1,(now-last)/1000);last=now;
  if(UI.mode==='battle'&&!UI.paused&&M&&P){
    const total=dt*(hstop>0?.15:1),n=Math.max(1,Math.ceil(total/(1/60)));
    for(let i=0;i<n;i++)step(total/n);
    hstop=Math.max(0,hstop-dt);
    render();
  }
  uiT+=dt;if(uiT>.1){uiT=0;refreshUI();}
  requestAnimationFrame(loop);
}
""")
rep("document.documentElement.classList.add('mu');recalc();resize();buildUI();buildMusou();refreshUI();","""document.documentElement.classList.add('mu');
    initHeroMT();A.pt={};
    await Promise.all(HERO_IDS.filter(id=>!ATLAS_H.has(id)).map(id=>loadImg('a/ui/pt/'+id+'.webp').then(im=>A.pt[id]=im).catch(()=>{})));
    recalc();resize();buildUI();refreshUI();showScreen('title');""")
rep("get cam(){return cam}};","get cam(){return cam},UI,STG,DIFF,ACT,showScreen,startStage,endStage,gainExp,expNeed,pauseGame,playDlg,showResult};")

# 15 ui.js 삽입 (STG 인라인)
stg=json.load(open(BASE+'_new/stages.json'))
uijs=open(BASE+'_new/ui.js').read().replace('/*STAGES*/[]',json.dumps(stg,ensure_ascii=False,separators=(',',':')))
rep("function buildUI(){",uijs+"\nfunction buildUI(){")

# 16 전투 대사
rep("  P.mAim=null;P.atk=w;P.atkT=0;P.hitDone=false;P.state='attack';\n","  P.mAim=null;P.atk=w;P.atkT=0;P.hitDone=false;P.state='attack';\n  bark(w==='spinfan'?'charge':'combo');\n")
rep("  pops.push({x:P.x,y:P.y-CH*2.3,t:0,txt:SK[w][i].n,col:'#ffd0ec',size:16,vy:-34});\n","  pops.push({x:P.x,y:P.y-CH*2.3,t:0,txt:SK[w][i].n,col:'#ffd0ec',size:16,vy:-34});\n  bark(i===1?'ult':'charge');\n")

open(BASE+'index.html','w').write(s)
print('ok',len(s))
