"""Late, exact-anchored rare magic-soldier overlay.

Run after the approved runtime and stage overlays; preserve stage bosses,
missions, timing, existing save/Drive code and vanilla unit distribution.
"""
rep("const MT={ // 종류별 능력",rd('m3_magic_troops.js')+"\nconst MT={ // 종류별 능력")
rep("  magic:{hp:.8,atk:1.35,sp:66,keep:240,range:340,wind:.60,cd:2.6,shot:250},",
    "  magic:{hp:.8,atk:1.35,sp:66,keep:240,range:340,wind:.60,cd:2.6,shot:250},\n"
    "  mage_wei:{vh:140,hp:1,atk:1.18,sp:74,wind:.72,name:'위 파계승'},\n"
    "  mage_shu:{vh:140,hp:.87,atk:1.12,sp:80,wind:.68,name:'촉 무녀'},\n"
    "  mage_wu:{vh:140,hp:.91,atk:1.2,sp:73,wind:.72,name:'오 주술사'},")
rep("  magic:{kind:'magic',speed:155,reach:650,keep:400,wind:.78,cd:2.4,shot:350},",
    "  magic:{kind:'magic',speed:155,reach:650,keep:400,wind:.78,cd:2.4,shot:350},\n"
    "  mage_wei:{kind:'magic',speed:150,reach:580,keep:360,wind:.78,cd:2.75,shot:340},\n"
    "  mage_shu:{kind:'magic',speed:160,reach:610,keep:370,wind:.70,cd:2.55,shot:360},\n"
    "  mage_wu:{kind:'magic',speed:150,reach:590,keep:370,wind:.76,cd:2.70,shot:345},")
rep("  const jobs=[];\n  loadStage40Image(","  const jobs=[];\n  magicQueueImages();\n  loadStage40Image(")
rep("  mobs.push(...col.mobs);m.colonies.push(col);return col;",
    "  magicRecruit(col);\n  mobs.push(...col.mobs);m.colonies.push(col);return col;")
rep("function drawMob(m){\n  if(m.final40Giant)return;",
    "function drawMob(m){\n  if(m.magicUnit){drawMagicMob(m);return;}\n  if(m.final40Giant)return;")
rep("    if(s.npcColor){const c=s.npcColor.join(',');",
    "    if(s.magicElement)drawMagicShot(s);\n    else if(s.npcColor){const c=s.npcColor.join(',');")
rep("    const count=a.kind==='magic'||(m.elite&&S.stage>=5)?3:1;",
    "    const count=m.magicUnit?(m.magicElement==='lightning'?2:1):(a.kind==='magic'||(m.elite&&S.stage>=5)?3:1);")
rep("        dmg:m.atk*(count===3?.8:1),kind:m.type,t:0,r:a.kind==='magic'?17:10,life:2.4});",
    "        dmg:m.atk*(count===3?.8:1),kind:m.type,t:0,r:a.kind==='magic'?17:10,life:2.4,"
    "magicElement:m.magicUnit?m.magicElement:null,slow:m.magicElement==='ice',hom:m.magicElement==='wind'?.42:0});")
rep("    if(a.kind==='magic')addZone({k:'circle',x:aim.x,y:aim.y,r:100,life:.85,dmg:m.atk*.9,kb:130,fx:'rock',pressureOwner:m});",
    "    if(a.kind==='magic'&&!m.magicUnit)addZone({k:'circle',x:aim.x,y:aim.y,r:100,life:.85,dmg:m.atk*.9,kb:130,fx:'rock',pressureOwner:m});")
