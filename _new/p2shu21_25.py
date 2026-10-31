# 촉나라 21~25판 승인 기믹 및 NPC 보스 연결.
# 1~20판 완성 흐름을 유지하고 최종 runtime overlay 뒤에서 적용한다.
rep("20:'wu20'};",
    "20:'wu20',21:'shu21',22:'shu22',23:'shu23',24:'shu24',25:'shu25'};")
rep("!['wei','wu'].some(k=>m.gim.startsWith(k))",
    "!['wei','wu','shu'].some(k=>m.gim.startsWith(k))")
rep("function gimInit(m){",rd('m3_shu21_25.js')+"\nfunction gimInit(m){")
rep("if(!m.sp.last||m.n<1||m.n>20)return;",
    "if(!m.sp.last||m.n<1||m.n>25)return;")
rep("npcBossType:n<=20&&d?d.type:null",
    "npcBossType:n<=25&&d?d.type:null")
