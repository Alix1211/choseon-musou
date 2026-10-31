# Fresh level-1 campaign balance. Run AFTER approved runtime overlays.
# Source edits only until the user requests the next game/APK build.
rep("const LVCAP=70,expNeed=lv=>Math.round(60+6.5*(lv-1));", """const CAMPAIGN_BALANCE={killXp:.55,stageXp:.025,lateStageXp:.04,clearXp:60,levelHeal:.20};
const stageExpScale=n=>1+CAMPAIGN_BALANCE.stageXp*Math.max(0,n-1)+CAMPAIGN_BALANCE.lateStageXp*Math.max(0,n-20);
const LVCAP=70,expNeed=lv=>Math.round(120+6*(lv-1)+.025*(lv-1)*(lv-1));""")

# Keep enemy-role rewards and replay's existing 50% multiplier.
rep("gainExp((m.beacon?5:m.boss?15:m.elite?5:1)*(1+.1*(S.stage-1)));",
    "gainExp((m.beacon?5:m.boss?15:m.elite?5:1)*CAMPAIGN_BALANCE.killXp*stageExpScale(S.stage));")
rep("gainExp(20*(1+.1*(S.stage-1)));", "gainExp(20*stageExpScale(S.stage));")
rep("gainExp(40*(1+.1*(n-1)));", "gainExp(CAMPAIGN_BALANCE.clearXp*stageExpScale(n));")

# recalc preserves HP ratios. Add only 20% of the NEW maximum to a living
# Choseon; do not refill allies or resurrect anyone during an XP event.
rep("if(up){recalc();if(P){P.hp=ST.maxHp;pops.push(",
    "if(up){recalc();if(P){if(P.hp>0&&P.mode!=='dead')P.hp=Math.min(ST.maxHp,P.hp+ST.maxHp*CAMPAIGN_BALANCE.levelHeal);pops.push(")
rep("small:true});}for(const a of allies)a.hp=a.maxHp;}", "small:true});}}")

# Preserve Easy and attack telegraphs; increase damage/cadence rather than
# making ordinary enemies into HP sponges. Keep the difficulty order intact.
rep("const DIFF=[{n:'쉬움',hp:.7,atk:.7},{n:'보통',hp:1,atk:1},{n:'어려움',hp:1.6,atk:1.35},{n:'격난',hp:2.4,atk:1.8}];",
    """const DIFF=[{n:'쉬움',hp:.7,atk:.7,meleeCd:1,rangedCd:1},{n:'보통',hp:1.15,atk:1.6,meleeCd:.8,rangedCd:.9},{n:'어려움',hp:1.8,atk:2.1,meleeCd:.72,rangedCd:.82},{n:'격난',hp:2.6,atk:2.8,meleeCd:.65,rangedCd:.75}];""")
rep("m.cd=t.cd*rnd(.9,1.15)/(1+m.au);",
    "m.cd=t.cd*rnd(.9,1.15)/(1+m.au)*((DIFF[S.diff]||DIFF[1])[t.shot?'rangedCd':'meleeCd']||1);")
