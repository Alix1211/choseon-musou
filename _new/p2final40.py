# 확정 스테이지 40 전용 오버레이. 1~39판 소스와 사용자가 작성한 원고는 그대로 보존.
rep("'Fm Ym Hm Hm Tm'];", "'Fl Fl Fl Fl Fl Fl Dm Dm Dm Dm Dm Dm Dm Tl'];")
rep('n===40?940:900','n===40?2200:900')
rep('function buildMusou(cfg){',rd('m3_final40.js')+'\nfunction buildMusou(cfg){')
rep('  buildKanTalk(run);','  buildKanTalk(run);\n  final40Dialog(run);')
rep('    npcStageInit(m);','    npcStageInit(m);\n    final40Init(m);')
rep('    kanIntro(m,run,sp,idx);','    kanIntro(m,run,sp,idx);\n    if(n===40&&idx===0)queueDlg(\'f40start\',1.25);')
rep('function missionTick(dt){','function missionTick(dt){\n  final40Tick(dt);')
rep('function misText(){','function misText(){\n  if(M.n===40&&M.f40&&M.mis===\'final40\')return kanTag()+final40Text();')
rep('function misTarget(){','function misTarget(){\n  if(M.n===40&&M.f40&&M.mis===\'final40\')return final40Target();')
rep('function killMob(m){','function killMob(m){\n  if(M&&M.n===40&&m.final40Giant){final40EndGiant(m);return;}\n  if(M&&M.n===40&&m.finalNpc27){final40Escape(m);return;}')
rep('function updateMob(m,dt){','function updateMob(m,dt){\n  if(m.final40Giant)return;')
rep('function hitMob(m,base,w,kb,ang,tag){','function hitMob(m,base,w,kb,ang,tag){\n  if(m.final40Giant&&M.f40){M.f40.hurtT=.3;M.f40.pose=4;}')
rep('  m.hp-=v;m.hurt=.14;',
    '  m.hp-=v;if(m.finalNpc27&&!m.final40Giant&&m.hp<=m.maxHp*.12){final40Escape(m);return;}m.hurt=.14;')
rep('function drawMob(m){','function drawMob(m){\n  if(m.final40Giant)return;\n  if(m.finalNpc27&&final40DrawNpc27(m))return;')
rep('  if(M.chunks)drawGround(x0,y0,vw,vh);else ',
    '  if(M.n===40&&M.f40&&M.f40.giant)final40DrawCliff(x0,y0,vw,vh);else if(M.chunks)drawGround(x0,y0,vw,vh);else ')
rep('  drawZones();drawVents();drawWards();drawLeaderAuras(x0,y0,vw,vh);',
    '  drawZones();drawVents();drawWards();drawLeaderAuras(x0,y0,vw,vh);final40World();')
rep('  const x0=camx-vw/2,y0=camy-vh/2;',
    '  if(M.n===40&&M.f40&&M.f40.giant){camx=M.f40.arena.x;camy=M.f40.arena.y;}\n  const x0=camx-vw/2,y0=camy-vh/2;')
rep('  const jobs=[];','  const jobs=[];\n  jobs.push(loadImg(\'a/stage40/npc27_walk.webp\').then(im=>A.final40Walk=im));\n  jobs.push(loadImg(\'a/stage40/npc27_giant.png\').then(im=>A.final40Giant=im));\n  jobs.push(loadImg(\'a/stage40/cliff.jpg\').then(im=>A.final40Cliff=im));')
rep('openExit,KAN_PLAN,','openExit,KAN_PLAN,final40Init,final40Tick,final40Target,final40Text,')
