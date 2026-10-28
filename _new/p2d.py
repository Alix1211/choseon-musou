# ── 4. 전투 버튼을 스킬 아이콘으로 : 동료 명령 1개(구출 겸용) · 기본 공격 · 스킬 2 · 회전 부채 ──
# 아이콘 : a/ui/sk/*.webp (_new/build_skillicons.py 가 _new/skill_sheet.png 에서 잘라 낸다)
WK={'sword':('atk_sword','sword1','sword2','sword_spin'),'whip':('atk_whip','whip1','whip2','whip_spin'),'fan':('atk_fan','fan1','fan2','fan_spin')}
css="/* 전투 버튼 아이콘 */\n"
css+="body #cmd,body #spin,body #atk,body .skb{background-color:transparent!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;border:0!important;box-shadow:none!important;border-radius:50%;padding:0;color:#fff;text-shadow:0 0 5px #000,0 1px 3px #000;font-weight:900;font-size:18px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.65));transition:filter .12s,transform .08s;-webkit-tap-highlight-color:transparent}\n"
css+="body #cmd{width:72px;height:72px;background-image:url(a/ui/sk/cmd.webp)!important}\n"
css+="body #spin{font-size:20px}body #atk{font-size:22px}\n"
css+="body #atk{background-image:url(a/ui/sk/atk_sword.webp)!important}body #spin{background-image:url(a/ui/sk/sword_spin.webp)!important}body #sk1{background-image:url(a/ui/sk/sword1.webp)!important}body #sk2{background-image:url(a/ui/sk/sword2.webp)!important}\n"
for w,(a_,s1,s2,sp_) in WK.items():
    p='body[data-w='+w+'] '
    css+=p+'#atk{background-image:url(a/ui/sk/'+a_+'.webp)!important}'+p+'#sk1{background-image:url(a/ui/sk/'+s1+'.webp)!important}'+p+'#sk2{background-image:url(a/ui/sk/'+s2+'.webp)!important}'+p+'#spin{background-image:url(a/ui/sk/'+sp_+'.webp)!important}\n'
css+="body #cmd:disabled,body #spin:disabled,body #atk:disabled,body .skb:disabled{filter:grayscale(1) brightness(.5) drop-shadow(0 2px 6px rgba(0,0,0,.5))!important;color:#fff}\n"
css+="body #atk.hold{filter:brightness(1.2) drop-shadow(0 0 10px rgba(255,180,100,.8))}\n"
css+="body #cmd.res{animation:resp 1s ease-in-out infinite}\n"
css+="@keyframes resp{0%,100%{filter:drop-shadow(0 0 4px rgba(255,220,120,.6))}50%{filter:drop-shadow(0 0 16px rgba(255,220,100,1)) brightness(1.15)}}\n"
rep("#dbf{font-size:12px;",css+"#dbf{font-size:12px;")
# 구하기 버튼은 없앤다 — 동료 명령 버튼이 겸한다
rep('<button id="cmd" disabled>명령</button><button id="act" disabled>구하기</button>','<button id="cmd" disabled title="동료 명령"></button>')
rep('<button id="spin" disabled>회전<br>부채</button>','<button id="spin" disabled title="회전 부채"></button>')
rep("  $('cmd').disabled=!has;\n","  const rt=rescueTarget();$('cmd').disabled=!(has||rt);$('cmd').classList.toggle('res',!!rt);\n")
rep("  $('act').disabled=!rescueTarget();\n","")
rep("$('cmd').addEventListener('click',()=>{const m=$('cmdm');m.hidden=!m.hidden;if(!m.hidden)buildCmdMenu();});",
    "$('cmd').addEventListener('click',()=>{const h=rescueTarget();if(h){$('cmdm').hidden=true;joinHero(h);return;}const m=$('cmdm');m.hidden=!m.hidden;if(!m.hidden)buildCmdMenu();});")
rep("  $('act').addEventListener('click',doAct);\n","")
# 버튼 글자 대신 아이콘 — 재사용 대기 중에는 회색 + 남은 초만 표시
rep("lab='공격<small>'+WN[ST.wt]+'</small>';",
    "lab='';if(document.body.dataset.w!==ST.wt)document.body.dataset.w=ST.wt;if(!refreshUI._pl){refreshUI._pl=1;for(const n of ['cmd','atk_sword','atk_whip','atk_fan','fan1','fan2','fan_spin','whip1','whip2','whip_spin','sword1','sword2','sword_spin'])new Image().src='a/ui/sk/'+n+'.webp';}")
rep("sp.innerHTML=!ready?Math.ceil(P.spinCd)+'초':'회전<br>부채';","sp.innerHTML=!ready?Math.ceil(P.spinCd)+'초':'';")
rep("b.innerHTML=cd>0?Math.ceil(cd)+'초':SK[ST.wt][i].n.replace(' ','<br>');","b.innerHTML=cd>0?Math.ceil(cd)+'초':'';b.title=SK[ST.wt][i].n;")
