# New weapon identity overlay follows approved player/enemy patches.
rep('let last=performance.now();\nfunction loop(now){',rd('m3_hero_weapons.js')+'\nlet last=performance.now();\nfunction loop(now){')
rep('const prev=Math.floor(P.atkT);P.atkT+=dt*(manual&&P.cbAction?comboFps(e):fps);',
    'const prev=Math.floor(P.atkT);P.atkT+=dt*(manual&&P.cbAction?comboFps(e):fps*(heroWeapon()?.rate||1));')
# AI companions keep their existing targeting/revival logic, with weapon-specific range and cadence.
rep('if(d<=128+tgt.scale*10){','if(d<=(heroWeapon(a.type)?.reach||128)+tgt.scale*10){')
rep("a.cd=1.1;a.wind=.28;a.act={k:'sweep',t:0,dur:.5,hitAt:.26,hit:false,ang:Math.atan2(dy,dx)};",
    "const rate=heroWeapon(a.type)?.rate||1;a.cd=1.1/rate;a.wind=.28/rate;a.act={k:'sweep',t:0,dur:.5/rate,hitAt:.26/rate,hit:false,ang:Math.atan2(dy,dx)};")
rep('switchPlayable,playableStats,combatWeapon,PLAY,ENEMY_PROFILES,','switchPlayable,playableStats,combatWeapon,PLAY,HERO_WEAPONS,heroWeapon,heroAttack,heroProjectiles,heroEffects,HERO_VFX,paintHeroFx,ENEMY_PROFILES,')

rep('const reachW=w=>REACH[w];','const reachW=w=>heroWeapon()?.reach||REACH[w];')
rep('d-IDEAL[combatWeapon()]','d-(heroWeapon()?.reach*.72||IDEAL[combatWeapon()])')
