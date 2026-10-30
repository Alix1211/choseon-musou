# 원본/대사/능력치를 바꾸지 않고 성공한 전투 동작에만 소리를 연결한다.
rep('function startAttack(w,target){',rd('m3_audio.js')+'\nfunction startAttack(w,target){\n  CM_AUDIO.play(w===\'spinfan\'?\'spin\':w===\'fan\'?\'staff\':\'swing\');')
rep('  P.skCd[i]=skCdv(i);',"  P.skCd[i]=skCdv(i);\n  CM_AUDIO.play(w==='sword'?(i===0?'thrust':'slash'):w==='whip'?'spin':'staff');")
rep('  m.hp-=v;m.hurt=.14;',"  CM_AUDIO.play('hit');\n  m.hp-=v;m.hurt=.14;")
rep('  P.hp-=v;hurtFlash=.25;',"  CM_AUDIO.play('punch');\n  P.hp-=v;hurtFlash=.25;")
rep('  m.dead=true;m.deadT=0;S.kills++;',"  CM_AUDIO.play(m.boss?'explosion':'punch');\n  m.dead=true;m.deadT=0;S.kills++;")
rep('function joinHero(h){',"function joinHero(h){\n  CM_AUDIO.play('heal');")
rep('function heroDown(h){',"function heroDown(h){\n  CM_AUDIO.play('explosion');")
rep('get paint(){return cx}};','get paint(){return cx},CM_AUDIO};')
