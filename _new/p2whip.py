# Generated-game safety patch: keep standard whip's visual and effective reach melee-only.
# Applied after all older generator overlays.
rep("L=(REACH.whip+34)*ST.rng;","L=REACH.whip*ST.rng;")
rep("      cx.save();cx.shadowBlur=12;cx.shadowColor='rgba(255,145,218,.7)';",
    "      cx.save(); // 근접 채찍: 실시간 shadowBlur 제거")
rep("      const ext=easeOut(Math.min(1,f.t/.09)),fadeA=f.t<.1?1:1-(f.t-.1)/(f.life-.1),L=f.L*ext;",
    "      const ext=easeOut(Math.min(1,f.t/.09)),fadeA=f.t<.1?1:1-(f.t-.1)/(f.life-.1),L=Math.min(f.L,REACH.whip*ST.rng)*ext;")
