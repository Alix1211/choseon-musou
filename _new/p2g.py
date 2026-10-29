# GPT 담당 규칙은 별도 파일에 넣고, 빌드 결과에만 연결한다.
rep("const GIM_OF={1:'commander',3:'vents'};", "const GIM_OF={1:'commander',2:'towers',3:'vents',4:'wei04',5:'defend05',6:'wei06',7:'wei07',8:'wei08',9:'wei09',10:'wei10'};")
rep("function missionTick(dt){", rd('m3_gim.js')+"\nfunction missionTick(dt){\n  if(gimTick(dt))return;")
rep("    warmGround(m,P.x,P.y);", "    gimInit(m);\n    warmGround(m,P.x,P.y);")
rep("function misText(){", "function misText(){\n  if(M.mis==='towers')return kanTag()+gimText();")
rep("  switch(M.mis){\n    case 'cmd':", "  switch(M.mis){\n    case 'towers':return gimTarget();\n    case 'cmd':")
rep("function drawVents(){", "function drawVents(){\n  drawGimmicks();")
rep("  for(const a of allies)dot(a,2.6,a.down?'#8a8a8a':'#5fe39a');", "  if(M.towers)for(const t of M.towers.list)dot(t,3.6,t.captured?'#5fe39a':'#ffd36b');\n  for(const a of allies)dot(a,2.6,a.down?'#8a8a8a':'#5fe39a');")
# 시간 초과 패배는 자동 부활과 분리하고, 2판의 첫 칸부터 새로 시작한다.
rep("function updatePlayer(dt){", "function updatePlayer(dt){\n  if(M.towers&&M.towers.failed){P.tt+=dt;if(P.tt>=2){const n=M.n;startStage(n,UI.diff);}return;}")
rep("openExit,KAN_PLAN};", "openExit,KAN_PLAN,gimTick,gimTarget,gimText,killMob,blockedAt};")

# 5판은 독립 소스로 연결한다. 2판 및 기존 미션 흐름은 유지한다.
rep('function gimInit(m){',rd('m3_gim05.js')+"\nfunction gimInit(m){\n  if(m.gim==='defend05'){gim05Init(m);return;}")
rep('function gimTick(dt){','function gimTick(dt){\n  gim05Tick(dt);')
rep('function drawGimmicks(){','function drawGimmicks(){\n  drawGim05();')
rep('function misText(){',"function misText(){\n  if(M.mis==='defend05')return kanTag()+gim05Text();")
rep('  switch(M.mis){',"  switch(M.mis){\n    case 'defend05':return {x:M.defense05.x,y:M.defense05.y};")

# 위나라 규칙은 판별 파일과 공통 연결부로만 확장한다.
rep('function gimInit(m){',rd('m3_wei.js')+rd('m3_gim04.js')+rd('m3_gim06.js')+rd('m3_gim07.js')+rd('m3_gim08.js')+rd('m3_gim09.js')+rd('m3_gim10.js')+"\nfunction gimInit(m){\n  if(weiInit(m))return;")
rep('function gimTick(dt){','function gimTick(dt){\n  weiTick(dt);')
rep('function drawGimmicks(){','function drawGimmicks(){\n  weiDraw();')
rep('function misText(){','function misText(){\n  if(weiActive())return kanTag()+weiText();')
rep('function misTarget(){','function misTarget(){\n  if(weiActive())return weiTarget();')
rep('function breakJars(rad){','function breakJars(rad){\n  weiHit(rad);')
rep('openExit,KAN_PLAN,gimTick','openExit,KAN_PLAN,hitMob,weiTick,weiHit,weiTarget,gimTick')

rep('function updateMob(m,dt){','function updateMob(m,dt){\n  if(weiMob(m,dt))return;')

# 10판만 첫 칸 이후에도 연속 복병 규칙을 이어간다.
rep("(run.gim==='vents'?'vents':null)","(['vents','wei10'].includes(run.gim)?run.gim:null)")
# 원고는 보존하고, 새 규칙의 짧은 전투 안내만 현재 목표로 맞춘다.
rep(":run.cfg.gm;",":(m.wei||m.defense05?misText():run.cfg.gm);")

# 매복 전 병사는 화면과 피격 판정에서 숨긴다. 등장 시 원래 전투로 복귀.
rep('function drawMob(m){','function drawMob(m){\n  if(m.col&&m.col.weiHidden)return;')
rep('function hitMob(m,base,w,kb,ang,tag){','function hitMob(m,base,w,kb,ang,tag){\n  if(m.col&&m.col.weiHidden)return;')
