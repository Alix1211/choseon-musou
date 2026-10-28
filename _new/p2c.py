# ── 칸 시스템 : 동료 · 아이템 · 버프 · 칸 이동 ──
rep("M.n=n;M.clock=0;M.ended=false;M.k0=S.kills;M.replay=replay;M.joined=[];","M.n=n;M.clock=0;M.ended=false;M.k0=S.kills;M.replay=replay;")
rep("cmd:'follow',slot:allies.length","cmd:'auto',slot:allies.length")
rep("if(a.hp<=0){a.hp=0;a.down=true;a.downT=0;a.act=null;a.wind=0;fxTeleport(a.x,a.y,true);}","if(a.hp<=0){a.hp=0;a.down=true;a.downT=0;a.act=null;a.wind=0;fxTeleport(a.x,a.y,true);allyDefeatLine(a);}")
rep("if(a.down){a.downT+=dt;if(a.downT>=8){a.down=false;a.hp=a.maxHp*.5;fxTeleport(a.x,a.y);}continue;}","if(a.down){a.downT+=dt;if(a.downT>=1.2){allyLeave(a);i--;}continue;}")
rep("    if(a.cmd!=='hold'&&Math.hypot(P.x-a.x,P.y-a.y)>640)allyWarp(a);\n    if(a.act){allyAct(a,dt);continue;}",
"""    const dP=Math.hypot(P.x-a.x,P.y-a.y);
    if(a.cmd!=='hold'&&dP>640)allyWarp(a);
    if(a.cmd==='auto'){if(dP>480)a.ret=true;else if(dP<250)a.ret=false;}else a.ret=false;
    if(a.ret){a.act=null;allyGo(a,P.x+(i%2?64:-64),P.y+54,300,dt,40);continue;}
    if(a.act){allyAct(a,dt);continue;}""")
rep("  if(m.opener)onBeaconDead(m);\n","  if(m.opener)onBeaconDead(m);\n  if(m.guardL)onGuardDead(m);\n")
# 항아리 깨기
rep("function doHit(w,mm){\n  mm=mm||1;","function doHit(w,mm){\n  mm=mm||1;if(M&&M.jarList)breakJars(125);")
rep("function spinTick(){\n","function spinTick(){\n  if(M&&M.jarList)breakJars(175);\n")
# 버프
rep("const stat={atk:()=>ST.atk,maxHp:()=>ST.maxHp,def:()=>ST.def};","const stat={atk:()=>ST.atk*(BUF.atk>0?1.3:1),maxHp:()=>ST.maxHp,def:()=>ST.def*(BUF.def>0?1.4:1)};")
rep("const l=Math.hypot(vx,vy)||1,sm=P.slowT>0?.5:1;","const l=Math.hypot(vx,vy)||1,sm=(P.slowT>0?.5:1)*(BUF.spd>0?1.25:1);")
# 그리기
rep("for(const p of M.props){if(p.x<x0-200","for(const p of M.props){if(p.dead||p.x<x0-200")
rep("if(M.musou){for(const gt of M.gates)draws.push(","if(M.musou){if(M.exit)draws.push({y:(M.exit.y+1)*TS-30,f:()=>drawExit(M.exit)});drawPickups();for(const gt of M.gates)draws.push(")
# 먹을거리 그림 불러오기
rep("const [man,mj,tj,pj,ij]=await Promise.all([J('a/choseon.json'),J('a/mobs.json'),J('a/tiles.json'),J('a/props.json'),J('a/items.json')]);\n  A.man=man;",
    "const [man,mj,tj,pj,ij,fj]=await Promise.all([J('a/choseon.json'),J('a/mobs.json'),J('a/tiles.json'),J('a/props.json'),J('a/items.json'),J('a/food.json')]);\n  A.fj=fj;A.man=man;")
rep("loadImg('a/items.webp').then(im=>A.itemsImg=im));","loadImg('a/items.webp').then(im=>A.itemsImg=im),loadImg('a/food.webp').then(im=>A.food=im));")
# 화면 전환 막 · 버프/복귀 표시
rep('<div id="dbf"></div><canvas id="mm" width="150" height="110"></canvas>','<div id="dbf"></div><div id="buffs"></div><div id="revq"></div><canvas id="mm" width="150" height="110"></canvas>')
rep("#dbf{font-size:12px;","""#kfade{position:fixed;inset:0;background:#07050c;opacity:0;pointer-events:none;transition:opacity .5s ease;z-index:60}
#kfade.on{opacity:1;pointer-events:auto}
#buffs,#revq{display:flex;flex-wrap:wrap;gap:4px;min-height:0}
#buffs span{font-size:11px;font-weight:800;padding:1px 7px;border-radius:9px;background:rgba(0,0,0,.55);color:var(--c);border:1px solid var(--c);text-shadow:0 1px 2px #000}
#revq span{font-size:11px;font-weight:700;color:#ffd9e8;text-shadow:0 1px 3px #000;background:rgba(0,0,0,.45);padding:1px 7px;border-radius:9px}
#dbf{font-size:12px;""")
rep('<div id="banner"></div>','<div id="banner"></div><div id="kfade"></div>')
rep("  drawMinimap();\n  const has=allies.length>0,cm=$('cmdm');","  drawMinimap();updateHudExtra();\n  const has=allies.length>0,cm=$('cmdm');")
rep("const NATN=","HN.npc='동료';\nconst NATN=")

rep("const AUC={0:[90,160,255],1:[80,220,130],2:[255,105,85]};","const AUC={0:[90,160,255],1:[80,220,130],2:[255,105,85],y:[190,110,255]};")
rep("if(M.type!=='field'){const g=cx.createRadialGradient","if(M.type!=='field'||(M.sty&&M.sty!=='out')){const g=cx.createRadialGradient")

# ── 새로 시작 : 지운 직후 자동저장이 되살리지 못하게 막는다 ──
rep("function save(){try{localStorage.setItem(SAVEKEY,JSON.stringify(S));}catch(e){}}","function save(){if(window.__noSave)return;try{localStorage.setItem(SAVEKEY,JSON.stringify(S));}catch(e){}}")
rep("}else{try{localStorage.removeItem(SAVEKEY);}catch(e){}location.reload();}},","}else{window.__noSave=1;try{localStorage.removeItem(SAVEKEY);}catch(e){}try{localStorage.clear();}catch(e){}location.reload();}},")
rep("if(UI.mode==='title')renderTitle();}},3000);}","if(UI.mode==='title')renderTitle();}},6000);}")
