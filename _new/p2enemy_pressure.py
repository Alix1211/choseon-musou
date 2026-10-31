# Enemy-only combat overhaul, after all approved runtime/player overlays.
a=src.index('function updateMob(m,dt){');b=src.index('/* ───────── 보스 :',a)
src=src[:a]+rd('m3_enemy_pressure.js')+'\n'+src[b:]
# Keep enemy HP unchanged; weapon hits must matter against stage-appropriate gear.
rep('atk:4*t.atk*ka*(elite?1.5:1)', 'atk:7*t.atk*ka*(elite?1.5:1)')
# Remove free healing in both combat modes; retain the equipment regen option.
rep('P.hp=Math.min(stat.maxHp(),P.hp+stat.maxHp()*.01*dt);',
    'P.hp=Math.min(stat.maxHp(),P.hp+stat.maxHp()*(ST.regen/100)*dt);')
rep('stat.maxHp()*(.004+ST.regen/100)*dt','stat.maxHp()*(ST.regen/100)*dt')
# A ground footprint supplies thickness independently of the hidden preview.
a=src.index('function inZone(z,px,py){');b=src.index('function debris(',a)
src=src[:a]+"function inZone(z,px,py){return enemyContains(z,px,py);}\n"+src[b:]
rep('const z=zones[i];z.t+=dt;',
    'const z=zones[i];if(z.pressureOwner&&(z.pressureOwner.dead||z.pressureOwner.down)){zones.splice(i,1);continue;}z.t+=dt;')
rep("      zoneBurst(z);", "      for(const a of allies)if(!a.down&&!a.dead&&enemyCanHit(z,a)){const dx=a.x-z.x,dy=a.y-z.y,d=Math.hypot(dx,dy)||1;hurtAlly(a,z.dmg,dx/d,dy/d,z.kb||0);}\n      zoneBurst(z);")
# Wall occlusion applies to ground attacks as it does to normal ranged attacks.
rep('if(inZone(z,P.x,P.y)){', 'if(enemyCanHit(z,P)){')
rep('m.hp-=v;m.hurt=.14;if(!m.boss)m.stun=Math.max(m.stun,.12);',
    'm.hp-=v;m.hurt=.14;if(!m.boss&&!enemyArmored(m))m.stun=Math.max(m.stun,.12);')
rep('if(kb&&!m.boss){m.kx+=Math.cos(ang)*kb;m.ky+=Math.sin(ang)*kb;}',
    'if(kb&&!m.boss){const resist=enemyArmored(m)?.15:1;m.kx+=Math.cos(ang)*kb*resist;m.ky+=Math.sin(ang)*kb*resist;}')
rep('if(!m.dead&&!m.boss&&stun)m.stun=Math.max(m.stun,stun);',
    'if(!m.dead&&!m.boss&&stun&&!enemyArmored(m))m.stun=Math.max(m.stun,stun);')
# Faster boss decisions and closing speed, without shortening attack telegraphs.
rep('b.cd-=dt;b.cdA-=dt;b.cdB-=dt;b.cdR-=dt;b.t+=dt;',
    'b.cd-=dt*1.35;b.cdA-=dt*1.35;b.cdB-=dt*1.35;b.cdR-=dt*1.35;b.t+=dt;')
rep('function bossMove(m,vx,vy,sp,dt){const l=Math.hypot(vx,vy)||1;moveEnt(m,vx/l*sp*dt,vy/l*sp*dt,18);m.moving=true;}',
    'function bossMove(m,vx,vy,sp,dt){const l=Math.hypot(vx,vy)||1,speed=Math.max(sp,S.diff===0?145:195);chaseMove(m,{x:m.x+vx/l*200,y:m.y+vy/l*200},speed*dt,dt);m.moving=true;}')
# Hide every enemy ground preview (melee, ranged magic and boss areas).
# Keep zones/updateZones, projectiles and actual impact effects unchanged.
a=src.index('function drawZones(){');b=src.index('function drawWards(){',a)
src=src[:a]+'function drawZones(){}\n'+src[b:]
rep('switchPlayable,playableStats,combatWeapon,PLAY,genKan,',
    'switchPlayable,playableStats,combatWeapon,PLAY,ENEMY_PROFILES,ENEMY_PRESSURE,enemyContains,enemyStart,enemyArmored,updateMob,updateZones,updateShots,updateAllies,enemyHit,enemyChargeTick,createMob,hitMob,updatePlayer,comboPress,shots,zones,genKan,')
