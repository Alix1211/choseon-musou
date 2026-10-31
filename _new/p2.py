import re,sys,os
B=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
src=open(B+'index.v1.html',encoding='utf-8').read()
def rd(n):return open(B+'_new/'+n,encoding='utf-8').read()
def rep(old,new,cnt=1):
    global src
    c=src.count(old)
    assert c==cnt,('count',c,old[:80])
    src=src.replace(old,new)

# ── 1. 여성 장수 / 개별 레벨 / 성향 ──
rep("const SAVEKEY='choseon_musou_v2';",r"""/* 여성 장수만 합류한다. 남성 장수는 구하면 끝 */
const FEM=new Set(['zhenji','wenji','wangyi','xiaoqiao','daqiao','shangxiang','yinping','xingcai','yueying']);
/* 장수별 성향 [체력, 공격, 속도] — 초안 */
const HPERS={zhenji:[.9,1.1,1],wenji:[.8,1.2,1],wangyi:[1,1.15,1.05],xiaoqiao:[.8,1,1.25],daqiao:[1.25,.85,.95],shangxiang:[1,1.1,1.15],yinping:[1.1,1.2,1],xingcai:[1.2,1,.95],yueying:[.95,1.15,1.1]};
const SAVEKEY='choseon_musou_v2';""")
rep("cheat:0,actv:1};","cheat:0,actv:1,hl:{},hx:{},cs:{}};")
rep("S.xp=+s.xp||0;}}catch(e){}","S.xp=+s.xp||0;}}catch(e){}\nS.hl=S.hl||{};S.hx=S.hx||{};S.cs=S.cs||{};S.roster=S.roster.filter(id=>FEM.has(id));S.party=S.party.filter(id=>FEM.has(id));")
rep("function recalc(){const old=ST?ST.maxHp:0;ST=calc(S.eq,S.enh);if(P&&old>0)P.hp=Math.min(ST.maxHp,P.hp*ST.maxHp/old);refreshUps();for(const a of allies){const r=a.hp/a.maxHp;a.maxHp=Math.max(120,ST.maxHp*.85);a.hp=a.maxHp*r;a.atk=ST.atk*.85;}}",
"""const heroLv=id=>Math.min(S.lv,Math.max(1,S.hl[id]||1));
const lvm=(lv,k)=>1+k*(lv-1);
function allyStatOf(id){
  const l=heroLv(id),pf=HPERS[id]||[1,1,1];
  return {hp:Math.max(120,ST.maxHp*.85*(lvm(l,.04)/lvm(S.lv,.04))*pf[0]),atk:ST.atk*.85*(lvm(l,.03)/lvm(S.lv,.03))*pf[1],sp:pf[2]};
}
function heroExp(id,v){
  if(!FEM.has(id))return;
  const lv=heroLv(id);if(lv>=S.lv){S.hl[id]=lv;S.hx[id]=0;return;}
  S.hx[id]=(S.hx[id]||0)+v;let l=lv,up=0;
  while(l<S.lv&&S.hx[id]>=expNeed(l)){S.hx[id]-=expNeed(l);l++;up++;}
  S.hl[id]=l;if(l>=S.lv)S.hx[id]=0;
  if(up){recalc();const a=allies.find(q=>q.type===id);if(a)pops.push({x:a.x,y:a.y-mobH(a)*1.3,t:0,txt:'Lv '+l,col:'#9ff09a',size:18,vy:-30,life:1.4});}
}
function recalc(){const old=ST?ST.maxHp:0;ST=calc(S.eq,S.enh);if(P&&old>0)P.hp=Math.min(ST.maxHp,P.hp*ST.maxHp/old);refreshUps();for(const a of allies){const r=a.hp/a.maxHp,as=allyStatOf(a.type);a.maxHp=as.hp;a.hp=a.maxHp*r;a.atk=as.atk;a.spm=as.sp;}}""")
rep("function gainExp(v){\n  if(M&&M.replay)v*=.5;\n","function gainExp(v){\n  if(M&&M.replay)v*=.5;\n  if(M&&M.musou)for(const a of allies.slice())heroExp(a.type,v*.5);\n")
rep("const t=MT[id],hp=Math.max(120,stat.maxHp()*.85);","const t=MT[id],as=allyStatOf(id),hp=as.hp;")
rep("hp,maxHp:hp,atk:stat.atk()*.85,","hp,maxHp:hp,atk:as.atk,spm:as.sp,")
rep("const s=sp*(d>260?1.35:1)*dt;","const s=sp*(a.spm||1)*(d>260?1.35:1)*dt;")

# ── 2. 겹침 계산 가볍게 ──
rep("for(let i=0;i<mobs.length;i++){const a=mobs[i];if(a.dead)continue;\n    for(let j=i+1;j<mobs.length;j++){const b=mobs[j];if(b.dead)continue;",
    "for(let i=0;i<mobs.length;i++){const a=mobs[i];if(a.dead||(!a.col.woken&&!a.static&&!a.boss))continue;\n    for(let j=i+1;j<mobs.length;j++){const b=mobs[j];if(b.dead||(!b.col.woken&&!b.static&&!b.boss))continue;")
# 거점 병장
rep("  if(m.captain)onCaptainDead(m);\n","  if(m.captain)onCaptainDead(m);\n  if(m.opener)onBeaconDead(m);\n")
rep("if(o.captain){L.captain=true;L.hp*=2.4;L.maxHp=L.hp;L.gold*=3;L.scale*=1.18;}",
    "if(o.captain){L.captain=true;L.hp*=2.4;L.maxHp=L.hp;L.gold*=3;L.scale*=1.18;}\n    if(o.commander){L.opener=true;L.commander=true;L.hp*=3.2;L.maxHp=L.hp;L.gold*=3;L.scale*=1.22;L.auk=0;}")
rep("  if(m.ally&&!m.dead)drawAllyTag(m);\n","  if(m.ally&&!m.dead)drawAllyTag(m);\n  if(m.commander&&!m.dead){cx.font='800 15px system-ui,sans-serif';cx.textAlign='center';cx.lineJoin='round';cx.lineWidth=4;cx.strokeStyle='rgba(20,8,30,.9)';const ty=m.y-mobH(m)*m.scale*1.02-38;cx.strokeText('NPC 거점병장',m.x,ty);cx.fillStyle='#ffd36b';cx.fillText('NPC 거점병장',m.x,ty);}\n")

# ── 3. 칸 시스템 : 지형 · 임무 · 미니맵 교체 ──
a=src.index('function buildMusou(cfg){');b=src.index('/* ───────── 미션 ───────── */')
src=src[:a]+rd('m3_lay.js')+'\n'+rd('m3_data.js')+'\n'+rd('m3_dlg.js')+'\n'+rd('m3_gen.js')+'\n'+src[b:]
a=src.index('/* ───────── 미션 ───────── */');b=src.index('/* ───────── 동료 ───────── */')
src=src[:a]+rd('m3_mis.js')+src[b:]
a=src.index('function drawMinimap(){');b=src.index('function buildCmdMenu(){')
src=src[:a]+rd('m3_mm.js')+src[b:]
rep("  missionTick(dt);\n  M.clock+=dt;","  missionTick(dt);updateVents(dt);runDlgQ(dt);\n  M.clock+=dt;")
# 바닥 그리기
i=src.index("  cx.drawImage(M.ground,Math.max(0,x0)*r");j=src.index('\n',i)
src=src[:i]+"  if(M.chunks)drawGround(x0,y0,vw,vh);else "+src[i:j].lstrip()+src[j:]
rep("drawZones();drawWards();drawLeaderAuras(x0,y0,vw,vh);","drawZones();drawVents();drawWards();drawLeaderAuras(x0,y0,vw,vh);")
# 디버그 핸들
rep("playDlg,showResult};","playDlg,showResult,genKan,kanSpecs,buildKan,goNext,queueDlg,allyStatOf,heroLv,heroExp,THEME_OF,hurtAlly,BUF,pks,FOOD,eatFood,dropFood,breakJars,openChest,openExit,KAN_PLAN};")
exec(open(B+'_new/p2c.py',encoding='utf-8').read())
exec(open(B+'_new/p2b.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2d.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2e.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2g.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2h.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2w.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2audio.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2props.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2decor.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2combo.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2musou.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2ui_v04.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2whip.py',encoding='utf-8').read())
if not os.environ.get('NOD'):exec(open(B+'_new/p2sync.py',encoding='utf-8').read())
open(B+'index.html','w',encoding='utf-8').write(src)
# Preserve previously approved HUD, performance, voice, and Drive changes.
# This source-controlled overlay applies after the legacy generator's stages.
# A mismatch FAILS the build instead of silently reverting those features.
if not os.environ.get('NOD'):
    import subprocess
    r=subprocess.run(['patch','--batch','--forward','--reject-file=-','-p1',
                      '-d', B, '-i', B+'_new/approved_runtime_overrides.patch'],
                     capture_output=True,text=True)
    assert r.returncode==0, ('approved runtime overlay failed',r.stdout,r.stderr)
    src=open(B+'index.html',encoding='utf-8').read()
    # Apply balance after the approved overlay, which anchors older runtime text.
    exec(open(B+'_new/p2balance.py',encoding='utf-8').read())
    exec(open(B+'_new/p2combat_timing.py',encoding='utf-8').read())
    exec(open(B+'_new/p2settings.py',encoding='utf-8').read())
    exec(open(B+'_new/p2playable.py',encoding='utf-8').read())
    exec(open(B+'_new/p2enemy_pressure.py',encoding='utf-8').read())
    exec(open(B+'_new/p2hero_weapons.py',encoding='utf-8').read())
    exec(open(B+'_new/p2npc_bosses_01_20.py',encoding='utf-8').read())
    exec(open(B+'_new/p2shu21_25.py',encoding='utf-8').read())
    exec(open(B+'_new/p2shu26_30.py',encoding='utf-8').read())
    exec(open(B+'_new/p2lords31_39.py',encoding='utf-8').read())
    open(B+'index.html','w',encoding='utf-8').write(src)

print('ok',len(src))
