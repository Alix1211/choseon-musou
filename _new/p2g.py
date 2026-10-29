# GPT 담당 규칙은 별도 파일에 넣고, 빌드 결과에만 연결한다.
rep("const GIM_OF={1:'commander',3:'vents'};", "const GIM_OF={1:'commander',2:'towers',3:'vents'};")
rep("function missionTick(dt){", rd('m3_gim.js')+"\nfunction missionTick(dt){\n  if(gimTick(dt))return;")
rep("    warmGround(m,P.x,P.y);", "    gimInit(m);\n    warmGround(m,P.x,P.y);")
rep("function misText(){", "function misText(){\n  if(M.mis==='towers')return kanTag()+gimText();")
rep("  switch(M.mis){\n    case 'cmd':", "  switch(M.mis){\n    case 'towers':return gimTarget();\n    case 'cmd':")
rep("function drawVents(){", "function drawVents(){\n  drawGimmicks();")
rep("  for(const a of allies)dot(a,2.6,a.down?'#8a8a8a':'#5fe39a');", "  if(M.towers)for(const t of M.towers.list)dot(t,3.6,t.captured?'#5fe39a':'#ffd36b');\n  for(const a of allies)dot(a,2.6,a.down?'#8a8a8a':'#5fe39a');")
# 시간 초과 패배는 자동 부활과 분리하고, 2판의 첫 칸부터 새로 시작한다.
rep("function updatePlayer(dt){", "function updatePlayer(dt){\n  if(M.towers&&M.towers.failed){P.tt+=dt;if(P.tt>=2){const n=M.n;startStage(n,UI.diff);}return;}")
rep("openExit,KAN_PLAN};", "openExit,KAN_PLAN,gimTick,gimTarget,gimText,killMob,blockedAt};")
