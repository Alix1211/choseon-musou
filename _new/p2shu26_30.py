# 기존 촉나라 21~25판 다음에 26~30판 규칙과 NPC 최종 보스를 연결한다.
rep("25:'shu25'};",
    "25:'shu25',26:'shu26',27:'shu27',28:'shu28',29:'shu29',30:'shu30'};")
rep("function gimInit(m){",rd('m3_shu26_30.js')+"\nfunction gimInit(m){")
rep("if(!m.sp.last||m.n<1||m.n>25)return;",
    "if(!m.sp.last||m.n<1||m.n>30)return;")
rep("npcBossType:n<=25&&d?d.type:null",
    "npcBossType:n<=30&&d?d.type:null")
rep("const fog=weiActive()&&M.n===15,mm=$('mm');",
    "const fog=weiActive()&&(M.n===15||M.n===29),mm=$('mm');")
