# 오나라 확장. 기존 위나라 파일의 연결부만 재사용하고 각 판 코드는 분리한다.
rep("10:'wei10'};","10:'wei10',11:'wu11'};")
rep('function gimInit(m){',rd('m3_wu.js')+rd('m3_gim11.js')+'\nfunction gimInit(m){')
rep('  cx.globalAlpha=1;\n  cx.restore();\n  // 화면 효과','  cx.globalAlpha=1;\n  wuOverlay();\n  cx.restore();\n  // 화면 효과')
