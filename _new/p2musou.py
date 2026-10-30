"""최종 후처리: 충전형 운석 무쌍/정확한 버튼 배치/타격 이펙트 페더."""
# 수동 콤보 엔진보다 뒤에 선언. 클릭/게임 로직/기존 이벤트 순서는 보존한다.
rep('/* ───────── 수동 조작 입력 ───────── */',rd('m3_musou.js')+'\n/* ───────── 수동 조작 입력 ───────── */')
rep('  if(CB.pending)return false;', '  if(ULT.active||CB.pending)return false;')
rep('const REACH={sword:146,whip:306,fan:600};','const REACH={sword:146,whip:170,fan:600};')
rep('const IDEAL={sword:80,whip:190,fan:330};','const IDEAL={sword:80,whip:142,fan:330};')
rep('m:.85*mm','m:.75*mm')
rep('  m.dead=true;m.deadT=0;S.kills++;if(P)P.nk=0;',
    '  m.dead=true;m.deadT=0;S.kills++;if(P)P.nk=0;\n'
    '  musouGainKill(m);')
rep('function save(){if(window.__noSave)return;try{localStorage.setItem(SAVEKEY,JSON.stringify(S));}catch(e){}}',
    'S.ultCharge=clamp(Number(S.ultCharge)||0,0,100);\nfunction save(){if(window.__noSave)return;try{localStorage.setItem(SAVEKEY,JSON.stringify(S));}catch(e){}}')
rep('function step(dt){\n  time+=dt;', 'function step(dt){\n  if(ULT.active){musouTick(dt);return;}\n  time+=dt;')
rep('  drawFx();drawDebris();', '  drawFx();drawDebris();musouDrawWorld();')
rep('  if(fade>.01){cx.fillStyle=\'rgba(8,5,14,\'+Math.min(1,fade)+\')\';cx.fillRect(0,0,VW,VH);}',
    '  if(fade>.01){cx.fillStyle=\'rgba(8,5,14,\'+Math.min(1,fade)+\')\';cx.fillRect(0,0,VW,VH);}\n  musouDrawPortrait();')
rep('<button id="dash" disabled title="대시" aria-label="대시"></button>',
    '<button id="dash" disabled title="대시" aria-label="대시"></button>\n<button id="musou" disabled title="무쌍 필살기" aria-label="무쌍 필살기">★</button>')
rep("  $('dash').addEventListener('pointerdown',e=>{e.preventDefault();comboPress('dash');});",
    "  $('dash').addEventListener('pointerdown',e=>{e.preventDefault();comboPress('dash');});\n  $('musou').addEventListener('pointerdown',e=>{e.preventDefault();musouStart();});")
rep("  if(e.key==='Shift'){if(!e.repeat)comboPress('dash');e.preventDefault();}",
    "  if(e.key==='Shift'){if(!e.repeat)comboPress('dash');e.preventDefault();}\n  if(e.key==='u'||e.key==='U'){if(!e.repeat)musouStart();e.preventDefault();}")
rep("$('dash').disabled=!can;", "$('dash').disabled=!can;$('musou').disabled=!can||(S.ultCharge||0)<100||ULT.active;")
rep("$('spb').style.width=(P.spinCd<=0?100:(1-P.spinCd/SPIN_CD)*100)+'%';",
    "$('spb').style.width=Math.min(100,S.ultCharge||0)+'%';$('spw').title='무쌍 게이지 '+Math.floor(S.ultCharge||0)+'%';")

# 기존 단색 섹터/원형 경계를 그라데이션으로 페더 처리.
feather=r"""
function featherSweep(f,u){
  const N=32,r=f.R,ha=f.ha,outer=f.col||'190,120,255';
  cx.save();cx.translate(f.x,f.y);cx.scale(1,YR);
  const g=cx.createRadialGradient(0,0,r*.14,0,0,r);
  g.addColorStop(0,'rgba('+outer+',.15)');g.addColorStop(.50,'rgba('+outer+',.36)');
  g.addColorStop(.77,'rgba('+outer+',.19)');g.addColorStop(1,'rgba('+outer+',0)');
  for(let i=0;i<N;i++){
    const v=(i+.5)/N,soft=Math.pow(Math.sin(Math.PI*v),.8)*(1-u);
    cx.globalAlpha=soft;cx.fillStyle=g;cx.beginPath();cx.moveTo(0,0);
    cx.arc(0,0,r,f.a-ha+ha*2*i/N-.002,f.a-ha+ha*2*(i+1)/N+.002);cx.closePath();cx.fill();
  }cx.restore();
}
function featherRing(f,u){
  const r=f.R*easeOut(u),col=f.col||'255,160,235';
  cx.save();cx.translate(f.x,f.y+34);cx.scale(1,.55);cx.globalCompositeOperation='lighter';
  for(let i=9;i>=0;i--){
    const of=(i-4.5)*3.7,fall=Math.exp(-Math.pow(of/13,2));
    cx.strokeStyle='rgba('+col+','+(fall*.08*(1-u))+')';cx.lineWidth=3.5;
    cx.beginPath();cx.arc(0,0,Math.max(0,r+of),0,Math.PI*2);cx.stroke();
  }cx.restore();
}
"""
rep('function drawFx(){',feather+'\nfunction drawFx(){')
rep("    }else if(f.k==='ring'){\n      const e=easeOut(u);cx.strokeStyle='rgba(255,170,220,'+(1-u)*.9+')';cx.lineWidth=10*(1-u)+2;cx.beginPath();cx.ellipse(f.x,f.y+34,f.R*e,f.R*e*.55,0,0,7);cx.stroke();\n      cx.strokeStyle='rgba(255,255,255,'+(1-u)*.8+')';cx.lineWidth=3;cx.beginPath();cx.ellipse(f.x,f.y+34,f.R*e*.92,f.R*e*.5,0,0,7);cx.stroke();",
    "    }else if(f.k==='ring'){\n      featherRing(f,u);")
rep("    }else if(f.k==='sweep'){\n      cx.save();cx.translate(f.x,f.y);cx.scale(1,YR);\n      cx.fillStyle='rgba('+(f.col||'190,120,255')+','+.55*(1-u)+')';cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,f.R,f.a-f.ha,f.a+f.ha);cx.closePath();cx.fill();\n      cx.strokeStyle='rgba('+(f.col2||'235,210,255')+','+(1-u)+')';cx.lineWidth=6;cx.beginPath();cx.arc(0,0,f.R,f.a-f.ha,f.a+f.ha);cx.stroke();cx.restore();",
    "    }else if(f.k==='sweep'){\n      featherSweep(f,u);")
rep("    }else if(f.k==='slash'){\n      const sweep=", "    }else if(f.k==='slash'){\n      cx.save();cx.shadowBlur=17;cx.shadowColor='rgba(255,216,251,.65)';cx.globalAlpha=.72;\n      const sweep=")
rep("      arcBand(f.x,f.y,a0,a1,f.R-4,f.R*(f.small?.12:.16),easeOut(sweep),.95*fadeA,2.2);",
    "      arcBand(f.x,f.y,a0,a1,f.R-4,f.R*(f.small?.12:.16),easeOut(sweep),.77*fadeA,2.2);cx.restore();")
rep("    }else if(f.k==='shock'){\n      const e=easeOut(u),col=f.red?'255,90,70':'255,225,170';\n      cx.fillStyle='rgba('+col+','+.2*(1-u)+')';cx.beginPath();cx.ellipse(f.x,f.y,f.R*e,f.R*e*YR,0,0,7);cx.fill();\n      cx.strokeStyle='rgba('+col+','+(1-u)*.9+')';cx.lineWidth=(f.small?5:12)*(1-u)+2;cx.beginPath();cx.ellipse(f.x,f.y,f.R*e,f.R*e*YR,0,0,7);cx.stroke();",
    "    }else if(f.k==='shock'){\n      const e=easeOut(u),col=f.red?'255,90,70':'255,225,170',r=f.R*e;\n      cx.save();cx.translate(f.x,f.y);cx.scale(1,YR);\n      const g=cx.createRadialGradient(0,0,r*.25,0,0,Math.max(r,1));\n      g.addColorStop(0,'rgba('+col+','+(.22*(1-u))+')');g.addColorStop(.60,'rgba('+col+','+(.14*(1-u))+')');g.addColorStop(1,'rgba('+col+',0)');\n      cx.fillStyle=g;cx.beginPath();cx.arc(0,0,r,0,Math.PI*2);cx.fill();cx.restore();")
rep("    }else if(f.k==='whip'){\n      const ext=",
    "    }else if(f.k==='whip'){\n      cx.save();cx.shadowBlur=12;cx.shadowColor='rgba(255,145,218,.7)';\n      const ext=")
rep("      const tp=pts[20];glow(tp[0],tp[1],26*fadeA+4,'rgba(255,255,255,'+.9*fadeA+')','rgba(255,90,170,0)');",
    "      const tp=pts[20];glow(tp[0],tp[1],26*fadeA+4,'rgba(255,255,255,'+.7*fadeA+')','rgba(255,90,170,0)');cx.restore();")
rep("      const al=1-u;cx.save();cx.lineCap='round';",
    "      const al=1-u;cx.save();cx.lineCap='round';cx.shadowBlur=13;cx.shadowColor='rgba(95,193,255,.74)';")

css=r"""
/* 이번 패치: 강/약공격 좌우 변경, 작은 무쌍, 동료 버튼 분리. */
body #atk{right:calc(max(16px,env(safe-area-inset-right,0px)) + 105px)!important;width:86px!important;height:86px!important}
body #spin{right:max(16px,env(safe-area-inset-right,0px))!important;width:94px!important;height:94px!important}
/* 보라색 대형 버튼 제거. 대시 옆 작은 무쌍 트리거만 남긴다. */
body #musou{position:fixed;right:calc(max(16px,env(safe-area-inset-right,0px)) + 285px);bottom:calc(var(--barh,64px) + 130px + env(safe-area-inset-bottom,0px));width:43px;height:43px;z-index:4;border:1.5px solid #f4d88e;border-radius:50%;background:radial-gradient(circle at 38% 30%,#574b38,#1b1a1e);font:800 23px system-ui,sans-serif;color:#ffe5a3;text-shadow:0 1px 2px #000;box-shadow:0 0 12px rgba(255,210,110,.55);touch-action:none;padding:0}
body #musou:disabled{filter:grayscale(1)!important;opacity:.42;box-shadow:none!important;border-color:#aaa;color:#b7b7b7}
body #musou:not(:disabled):active{transform:scale(.92);filter:brightness(1.3)}
body #cmd{left:calc(max(16px,env(safe-area-inset-left,0px)) + 12px)!important;top:43%!important;bottom:auto!important;width:54px!important;height:54px!important}
body #cmdm{left:calc(max(16px,env(safe-area-inset-left,0px)) + 70px)!important;top:33%!important;bottom:auto!important}
.nb #musou{display:none!important}
.mu #spw{display:block!important}
/* 오디오 설정 버튼은 설정 패널로 옮기기 전까지 화면에 띄우지 않는다. */
#soundControls{display:none!important}
@media(max-width:700px){body #musou{right:calc(max(16px,env(safe-area-inset-right,0px)) + 216px);bottom:calc(var(--barh,64px) + 201px + env(safe-area-inset-bottom,0px));width:40px;height:40px}}
"""
rep('#dbf{font-size:12px;',css+'\n#dbf{font-size:12px;')
