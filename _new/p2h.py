# 오나라 확장. 기존 위나라 파일의 연결부만 재사용하고 각 판 코드는 분리한다.
rep("10:'wei10'};","10:'wei10',11:'wu11',12:'wu12',13:'wu13',14:'wu14',15:'wu15',16:'wu16',17:'wu17',18:'wu18',19:'wu19'};")
rep('function gimInit(m){',rd('m3_wu.js')+rd('m3_gim11.js')+rd('m3_gim12.js')+rd('m3_gim13.js')+rd('m3_gim14.js')+rd('m3_gim15.js')+rd('m3_gim16.js')+rd('m3_gim17.js')+rd('m3_gim18.js')+rd('m3_gim19.js')+'\nfunction gimInit(m){')
rep('  cx.globalAlpha=1;\n  cx.restore();\n  // 화면 효과','  cx.globalAlpha=1;\n  wuOverlay();\n  cx.restore();\n  // 화면 효과')

rep('function drawMob(m){','function drawMob(m){\n  if(m.wuHidden)return;')
rep('if(weiMob(m,dt))return;','if(m.wuHidden||weiMob(m,dt))return;')
rep('function hitMob(m,base,w,kb,ang,tag){','function hitMob(m,base,w,kb,ang,tag){\n  if(m.wuHidden||!wuCanHit(m))return;')
