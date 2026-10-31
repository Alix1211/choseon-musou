# Apply after the approved runtime overlay; do not edit generated index.html.
rep("const CB={pending:null,", "const COMBO_TIMING={light:.54,heavy:.75,linkAt:.82,chainGap:1850,bufferMs:1250};\nconst CB={pending:null,")
rep("/* 타격 판정 이후 동작의 끝 28%는 다음 입력으로 연결한다.",
    "/* 타격 판정 이후 동작의 끝 18%는 다음 입력으로 연결한다.")
rep("P.atkT/e.frames>=.72;", "P.atkT/e.frames>=COMBO_TIMING.linkAt;")
rep("CB.pending={kind,at:comboNow()};CB.accepted++;", """const now=comboNow(),key=dirKey(P.face)[0],anim=P.atk&&A.man[P.atk]&&A.man[P.atk][key];
  const remaining=anim&&P.cbAction?Math.max(0,1-P.atkT/anim.frames)*comboAttackDuration()/(P.slowT>0?.65:1)*1000:0;
  CB.pending={kind,at:now,until:now+Math.max(COMBO_TIMING.bufferMs,remaining+250)};CB.accepted++;""")
rep("now-CB.last>1550", "now-CB.last>COMBO_TIMING.chainGap")
rep("if(comboNow()-p.at>950)", "if(comboNow()>(p.until||p.at+COMBO_TIMING.bufferMs))")
rep("const base=P.cbMove==='spin'?2.24:P.cbMove==='pierce'?.84:P.cbMove==='dashLight'?.76:P.cbMove==='rocks'?.96:P.cbAction==='light'?.45:.62;",
    "const base=P.cbMove==='spin'?2.24:P.cbMove==='pierce'?1.00:P.cbMove==='dashLight'?.90:P.cbMove==='rocks'?1.12:P.cbAction==='light'?COMBO_TIMING.light:COMBO_TIMING.heavy;")
