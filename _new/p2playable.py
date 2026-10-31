# Common player control for the 9 approved existing female heroes.
# The seven recovered attack atlases change only visuals, not hit timing/gear.
rep("A.sheets={};A.walk={};\n  const jobs=[];",
    "A.sheets={};A.walk={};A.heroAttack={};\n  const jobs=[];\n  for(const id in HERO_ATTACK)jobs.push(loadImg(HERO_ATTACK[id]).then(im=>A.heroAttack[id]=im));\n  ")
rep('<!-- CHOSEON_LIVE_UPDATE: 2026-10-30-baseT-sync-v1 -->','<!-- CHOSEON_LIVE_UPDATE: 2026-10-30-baseT-sync-v1 -->\n<!-- CHOSEON_GAME_REVISION: 20261031-hero-attack-v1 -->')
rep('<div id="tl">','<div id="tl"><button id="playerPortrait" title="초선 · 장비" aria-label="초선 · 장비"><img src="a/ui/pt/choseon.webp" alt=""><i></i></button>')
rep('<button id="sk1" class="skb" disabled></button>', '<button id="allySwap" hidden disabled aria-label="동료 교체"><img src="a/ui/pt/zhenji.webp" alt=""><i></i></button>\n<button id="sk1" class="skb" disabled></button>')
# Preserve the existing combat engine; the active hero's class comes from PLAYABLE_HEROES.
rep('const w=ST.wt;', 'const w=combatWeapon();',cnt=2)
rep('const w=ST.wt,rdy=', 'const w=combatWeapon(),rdy=')
rep('SK[ST.wt][i]', 'SK[combatWeapon()][i]',cnt=2)
rep('IDEAL[ST.wt]', 'IDEAL[combatWeapon()]')
rep('const w=ST.wt,letter=', 'const w=combatWeapon(),letter=')
rep('P.cbWeapon||ST.wt', 'P.cbWeapon||combatWeapon()',cnt=2)
rep('document.body.dataset.w!==ST.wt)document.body.dataset.w=ST.wt;', 'document.body.dataset.w!==combatWeapon())document.body.dataset.w=combatWeapon();')
rep('function drawMob(m){',"function drawMob(m){\n  if(m.type==='choseon'){drawBenchedChoseon(m);return;}")
rep("if(!S.party.includes(r.id)||allies.some(a=>a.type===r.id))continue;", "if((r.id!=='choseon'&&!S.party.includes(r.id))||r.id===PLAY.active||allies.some(a=>a.type===r.id))continue;")
rep('recalc();P.hp=ST.maxHp;', 'recalc();P.hp=stat.maxHp();')
rep('P.hp/ST.maxHp):1,stars=', 'P.hp/stat.maxHp()):1,stars=')
rep("if(P.hp>0&&P.mode!=='dead')P.hp=Math.min(ST.maxHp,P.hp+ST.maxHp*CAMPAIGN_BALANCE.levelHeal);", "if(P.hp>0&&P.mode!=='dead')P.hp=Math.min(stat.maxHp(),P.hp+stat.maxHp()*CAMPAIGN_BALANCE.levelHeal);")
rep('let last=performance.now();\nfunction loop(now){',rd('m3_playable.js')+'\nlet last=performance.now();\nfunction loop(now){')
rep('playDlg,showResult,genKan,','playDlg,showResult,switchPlayable,playableStats,combatWeapon,PLAY,genKan,')
rep('</style>',rd('playable.css')+'\n</style>')
