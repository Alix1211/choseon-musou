# 1~20판 NPC 반란군 보스: 기존 승인된 최종 게임 오버레이 뒤에 연결.
rep("function buildMusou(cfg){",rd('m3_npc_bosses_01_20.js')+"\nfunction buildMusou(cfg){")
rep("const lt=yk?pickWeighted([['jiangshi',1],['fox',1],['egg',1]]):pickWeighted([['spear',1],['cav',1]]);",
    "const lt=o.npcBossType||(yk?pickWeighted([['jiangshi',1],['fox',1],['egg',1]]):pickWeighted([['spear',1],['cav',1]]));")
# Dungeon/cave rooms can roll the yokai atlas ('y'), which contains no spear,
# bow or cavalry frames. A forced human NPC boss must use its country's atlas;
# the surrounding yokai soldiers retain their original spawn distribution.
rep("const L=createMob(lt,set,cx_,cy_,col,true);",
    "const leaderSet=o.npcBossType&&yk?(stageSet(m.n)||m.set||'1'):set;\n    const L=createMob(lt,leaderSet,cx_,cy_,col,true);")
rep("if(sp.last){const c0=mkCol(w[0]+.5,w[1]+.5,{n:7,leader:true,captain:true,set:setFor()});m.captain=c0.lead;}",
    "if(sp.last){const d=NPC_STAGE_BOSSES[n];const c0=mkCol(w[0]+.5,w[1]+.5,{n:7,leader:true,captain:true,set:setFor(),npcBossType:n<=20&&d?d.type:null});m.captain=c0.lead;}")
rep("    warmGround(m,P.x,P.y);","    npcStageInit(m);\n    warmGround(m,P.x,P.y);")
rep("function onCaptainDead(m){","function onCaptainDead(m){\n  if(m.npcBoss)npcStageBossDefeated(m);")
rep("    openGate('inner');M.mis='inner';","    openGate('inner');M.mis='inner';\n    if(m.npcBoss)npcStageHeroesAppear();")
rep("function updateMob(m,dt){","function updateMob(m,dt){\n  if(m.npcBoss&&npcBossTick(m,dt))return;")
rep("function hitMob(m,base,w,kb,ang,tag){","function hitMob(m,base,w,kb,ang,tag){\n  if(m.npcBoss&&m.npcShield>0){npcShieldHit(m);return;}")
rep("function missionTick(dt){","function missionTick(dt){\n  npcBossFieldTick(dt);")
rep("  if(!M||!M.heroes||!P||P.mode!=='manual')return null;",
    "  if(!M||!M.heroes||!P||P.mode!=='manual'||(M.npcBoss&&!M.npcBossCleared))return null;")
rep("guard:M.sp.last?'적 부장을 쓰러뜨려라':'수문장을 쓰러뜨려라',",
    "guard:M.sp.last?(M.npcBoss?M.npcBoss.npcBossDef.name:'적 부장')+'를 쓰러뜨려라':'수문장을 쓰러뜨려라',")
rep("function drawVents(){","function drawVents(){\n  npcBossDrawField();")
rep("function drawMob(m){","function drawMob(m){\n  if(m.npcBoss&&!m.wuHidden&&!(m.col&&m.col.weiHidden))npcBossDrawAura(m);")
rep("  if(!m.dead&&!m.boss&&!m.ally&&(m.elite||m.hp<m.maxHp)){",
    "  if(m.npcBoss&&!m.dead)npcBossDrawLabel(m);\n  if(!m.dead&&!m.boss&&!m.ally&&!m.npcBoss&&(m.elite||m.hp<m.maxHp)){")
rep("  for(const s of shots){\n    if(s.kind==='ghost'){",
    "  for(const s of shots){\n    if(s.npcColor){const c=s.npcColor.join(',');cx.save();cx.globalCompositeOperation='lighter';glow(s.x,s.y,29,'rgba('+c+',.93)','rgba('+c+',0)');glow(s.x,s.y,10,'rgba(255,255,255,.96)','rgba('+c+',0)');cx.restore();}\n    else if(s.kind==='ghost'){")
