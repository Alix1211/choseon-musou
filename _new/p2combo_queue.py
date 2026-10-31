"""Preserve rapid LLLH vs LLLLH taps in the generated, timing-adjusted runtime.

Run immediately after p2combat_timing.py, before hero weapon overlays.
The original one-slot input is intentionally left in m3_combo.js because the
approved runtime and timing patches still anchor its pre-overlay form.
"""
rep("const CB={pending:null,", "const CB={pending:null,queued:[],")
rep("function comboReset(){CB.pending=null;CB.seq='';",
    "function comboReset(){CB.pending=null;CB.queued.length=0;CB.seq='';")
rep("if(ULT.active||CB.pending)return false;                       // 대기 슬롯을 덮어쓰거나 누적하지 않는다",
    "if(ULT.active||(CB.pending&&CB.queued.length>=4))return false; // At most five physical taps pending")
rep("""  const now=comboNow(),key=dirKey(P.face)[0],anim=P.atk&&A.man[P.atk]&&A.man[P.atk][key];
  const remaining=anim&&P.cbAction?Math.max(0,1-P.atkT/anim.frames)*comboAttackDuration()/(P.slowT>0?.65:1)*1000:0;
  CB.pending={kind,at:now,until:now+Math.max(COMBO_TIMING.bufferMs,remaining+250)};CB.accepted++;""",
    """  const entry={kind,at:comboNow()};
  if(CB.pending)CB.queued.push(entry);else CB.pending=entry;
  CB.accepted++;""")
rep("if(w!==CB.weapon||now-CB.last>COMBO_TIMING.chainGap)CB.seq='';",
    "if(w!==CB.weapon||entry.at-CB.last>COMBO_TIMING.chainGap)CB.seq='';")
rep("CB.weapon=w;CB.last=now;", "CB.weapon=w;CB.last=entry.at;")
rep("if(move){\n    CB.lastMove=move;CB.activated++;",
    "if(move){\n    CB.queued.length=0;CB.pending=null;CB.lastMove=move;CB.activated++;")
rep("if(comboNow()>(p.until||p.at+COMBO_TIMING.bufferMs)){CB.pending=null;}",
    "if(comboNow()-p.at>3600){CB.pending=null;CB.queued.length=0;}")
rep("CB.pending=null;comboBegin(p,n,inp);",
    "CB.pending=CB.queued.shift()||null;comboBegin(p,n,inp);")
# A separate stop-input path resets the combo directly instead of calling comboReset.
rep("CB.pending=null;CB.seq='';CB.last=0;CB.dashUntil=0;CB.dash=null;",
    "CB.pending=null;CB.queued.length=0;CB.seq='';CB.last=0;CB.dashUntil=0;CB.dash=null;")
