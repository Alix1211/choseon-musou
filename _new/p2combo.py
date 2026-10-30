"""수동 액션 콤보: 기존 자동전투와 카드 스킬은 보존한다."""
# 모든 후처리가 끝난 뒤 입력/전투 부분만 좁게 교체한다.
rep('<title>삼국 초선 무쌍</title>',
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">\n<title>삼국 초선 무쌍</title>')
rep('/* ───────── 수동 조작 입력 ───────── */',rd('m3_combo.js')+'\n/* ───────── 수동 조작 입력 ───────── */')
rep('<button id="atk" disabled></button>', '<button id="atk" disabled title="약공격" aria-label="약공격"></button>') if '<button id="atk" disabled></button>' in src else None
rep('<button id="spin" disabled title="회전 부채"></button>', '<button id="spin" disabled title="강공격" aria-label="강공격"></button>\n<button id="dash" disabled title="대시" aria-label="대시"></button>')
rep("  $('spin').addEventListener('click',()=>{if(P)P.spinReq=true;});", "  $('spin').addEventListener('pointerdown',e=>{e.preventDefault();comboPress('heavy');});\n  $('dash').addEventListener('pointerdown',e=>{e.preventDefault();comboPress('dash');});")
rep("   const aDown=e=>{e.preventDefault();atkHeld=true;atkTap=.25;ab.classList.add('hold');try{ab.setPointerCapture(e.pointerId);}catch(_){}};\n   const aUp=()=>{atkHeld=false;ab.classList.remove('hold');};\n   ab.addEventListener('pointerdown',aDown);ab.addEventListener('pointerup',aUp);ab.addEventListener('pointercancel',aUp);ab.addEventListener('lostpointercapture',aUp);ab.addEventListener('contextmenu',e=>e.preventDefault());}",
    "   ab.addEventListener('pointerdown',e=>{e.preventDefault();comboPress('light');});\n   for(const b of [ab,$('spin'),$('dash')])b.addEventListener('contextmenu',e=>e.preventDefault());}")
rep("  if(e.key===' '||e.key==='j'||e.key==='J'){P&&(P.spinReq=true);e.preventDefault();}",
    "  if(e.key===' '||e.key==='j'||e.key==='J'){if(!e.repeat)comboPress('heavy');e.preventDefault();}\n  if(e.key==='Shift'){if(!e.repeat)comboPress('dash');e.preventDefault();}")
rep("  if(e.key==='k'||e.key==='K'||e.key==='z'||e.key==='Z'){keys.atk=1;atkTap=.25;e.preventDefault();}",
    "  if(e.key==='k'||e.key==='K'||e.key==='z'||e.key==='Z'){if(!e.repeat)comboPress('light');e.preventDefault();}")
rep("addEventListener('keyup',e=>{if(KM[e.key])keys[KM[e.key]]=0;if(e.key==='k'||e.key==='K'||e.key==='z'||e.key==='Z')keys.atk=0;});",
    "addEventListener('keyup',e=>{if(KM[e.key])keys[KM[e.key]]=0;});")
rep("  if(manual){\n    if(P.spinReq)","  if(manual){\n    comboTick(dt,n,inp);\n    if(P.spinReq)")
rep("const prev=Math.floor(P.atkT);P.atkT+=dt*fps;",
    "const prev=Math.floor(P.atkT);P.atkT+=dt*(manual&&P.cbAction?comboFps(e):fps);\n    if(manual&&P.cbMove)comboMoveTick(dt,prev,P.atkT,e.frames);")
rep("if(k>P.spinTick&&k<=8){P.spinTick=k;spinTick();}",
    "if(k>P.spinTick&&k<=8){P.spinTick=k;if(manual&&P.cbMove==='spin')comboStrike('spin');else spinTick();}")
rep("else doHit(P.atk);}",
    "else if(manual&&P.cbMove){if(P.cbMove!=='pierce'&&P.cbMove!=='dashLight')comboStrike(P.cbMove);}else doHit(P.atk);}")
rep("      P.atk=null;P.state='idle';P.mAim=null;\n      if(P.skHit)",
    "      P.atk=null;P.state='idle';P.mAim=null;P.cbAction=null;P.cbMove=null;\n      if(P.skHit)")
rep("  if(manual){\n    if(wantAtk()){const w=ST.wt,aim=manualAim(n,inp,w);startAttack(w,aim.m);P.mAim=aim;return;}\n",
    "  if(manual){\n")
rep("atkHeld=false;atkTap=0;}","atkHeld=false;atkTap=0;comboReset();}")
rep("  S.auto=!S.auto;joy.id=null;", "  S.auto=!S.auto;comboReset();joy.id=null;")

# 기존 #spin 아이콘·쿨타임 비활성화는 제거, 버튼 배치와 시각만 교체.
rep("  {const ab=$('atk'),ok=(P.mode==='manual'||P.mode==='hunt'),lab='';",
    "  {const ab=$('atk'),ok=P.mode==='manual',lab='';")
rep("  {const ready=P.spinCd<=0,can=(P.mode==='manual'||P.mode==='hunt')&&ready&&P.atk!=='spinfan';\n    sp.disabled=!can;sp.innerHTML=!ready?Math.ceil(P.spinCd)+'초':'';",
    "  {const ready=P.spinCd<=0,can=P.mode==='manual';\n    sp.disabled=!can;sp.innerHTML='';$('dash').disabled=!can;")

css="""
/* 실제 생성한 세 버튼 에셋: 약공격, 강공격, 대시 */
body #atk,body[data-w=sword] #atk,body[data-w=whip] #atk,body[data-w=fan] #atk{background-image:url(a/ui/combo/light.png)!important}
body #spin,body[data-w=sword] #spin,body[data-w=whip] #spin,body[data-w=fan] #spin{background-image:url(a/ui/combo/heavy.png)!important}
body #dash{position:fixed;right:calc(max(16px,env(safe-area-inset-right,0px)) + 205px);bottom:calc(var(--barh,64px) + 114px + env(safe-area-inset-bottom,0px));width:74px;height:74px;border:0!important;border-radius:50%;background:transparent url(a/ui/combo/dash.png) center/contain no-repeat!important;z-index:3;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,.65))}
body #atk{width:94px;height:94px;touch-action:none}body #spin{width:86px;height:86px;right:calc(max(16px,env(safe-area-inset-right,0px)) + 105px);touch-action:none}
body #dash:disabled{filter:grayscale(1) brightness(.5) drop-shadow(0 2px 6px rgba(0,0,0,.5))!important}
body #dash:not(:disabled):active,body #spin:not(:disabled):active,body #atk:not(:disabled):active{transform:scale(.93);filter:brightness(1.2) drop-shadow(0 0 8px #ffdca5)}
.nb #dash{display:none!important}
@media (max-width:430px){body #dash{right:calc(max(16px,env(safe-area-inset-right,0px)) + 198px);width:68px;height:68px}}
"""
rep('#dbf{font-size:12px;',css+'\n#dbf{font-size:12px;')
# 근접 채찍 휘두르기: 번개 투사체 대신 초선 중심의 고정 반경 호(arc)를 그린다.
# shadowBlur 사용 금지: 태블릿 Canvas 렌더러에 무리를 주지 않는다.
whip_sweep="""if(f.k==='whipSweep'){
      const fade=Math.max(0,1-u),phase=easeOut(Math.min(1,f.t/.12));
      const half=f.radial?Math.PI:(f.ha||.85),a0=f.a-half,a1=a0+2*half*phase;
      cx.save();cx.lineCap='round';
      cx.beginPath();cx.arc(f.x,f.y,f.R*.83,a0,a1);cx.strokeStyle='rgba(245,126,177,'+(.72*fade)+')';cx.lineWidth=10;cx.stroke();
      cx.beginPath();cx.arc(f.x,f.y,f.R*.83,a0,a1);cx.strokeStyle='rgba(255,236,244,'+(.82*fade)+')';cx.lineWidth=3;cx.stroke();
      cx.restore();
    }else """
rep("    if(f.k==='slash'){",'    '+whip_sweep+"if(f.k==='slash'){")
rep("    }else if(f.k==='spark'||f.k==='sp2'){",
    "    }else if(f.k==='deb'){\n      cx.save();cx.translate(f.x,f.y);cx.rotate(f.t*6);cx.fillStyle='rgba(235,191,139,'+(1-u)+')';cx.strokeStyle='rgba(100,72,54,'+(1-u)+')';cx.lineWidth=2;cx.beginPath();cx.moveTo(-8,5);cx.lineTo(-6,-6);cx.lineTo(4,-9);cx.lineTo(9,0);cx.lineTo(2,8);cx.closePath();cx.fill();cx.stroke();cx.restore();\n    }else if(f.k==='spark'||f.k==='sp2'){")
