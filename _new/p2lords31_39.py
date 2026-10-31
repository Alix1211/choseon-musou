# 31~39 군웅편 9판, 필수 출전 2판, 7·8번째 기마 보스.
# 40 NPC27 최종전은 별도 회의 전까지 절대 변경하지 않는다.
rep("30:'shu30'};",
    "30:'shu30',31:'lord31',32:'lord32',33:'lord33',34:'lord34',35:'lord35',36:'lord36',37:'lord37',38:'lord38',39:'lord39'};")
rep("['wei','wu','shu'].some(k=>m.gim.startsWith(k))",
    "['wei','wu','shu','lord'].some(k=>m.gim.startsWith(k))")
rep("function gimInit(m){",rd('m3_lords31_35.js')+"\n"+rd('m3_lords36_39.js')+"\nfunction gimInit(m){")
rep("if(!m.sp.last||m.n<1||m.n>30)return;",
    "if(!m.sp.last||m.n<1||m.n>39)return;")
rep("npcBossType:n<=30&&d?d.type:null",
    "npcBossType:n<=39&&d?d.type:null")
rep("let last=performance.now();\nfunction loop(now){",
    rd('m3_lord_forced.js')+"\nlet last=performance.now();\nfunction loop(now){")
