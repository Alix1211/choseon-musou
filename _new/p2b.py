# ── 화면 쪽: 별 · 서비스 컷 · 병영 · 시나리오 · 결과 ──
CSS=r'''
/* 별 · 서비스 컷 */
.st{width:100%;height:100%;display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))}
.srow{position:absolute;display:flex;justify-content:center;gap:10px}
.srow .sm{width:60px;height:60px}
.spn{position:absolute;width:320px;height:332px;box-sizing:border-box;padding:12px 22px;background:rgba(8,12,26,.55);border:3px solid rgba(214,180,110,.55);border-radius:16px}
.spn .sh{font:700 24px var(--f2);color:#ffd98a;height:34px}
.spn .sr1{display:flex;align-items:center;justify-content:space-between;height:66px;font:700 26px var(--f2);color:#efe4c4;border-top:1px solid rgba(214,180,110,.22)}
.spn .ss{display:flex;gap:4px}.spn .ss i{width:46px;height:46px;display:block}
#s_cut{z-index:22;background:#06040c}
#s_cut .cbg{position:absolute;inset:-4%;background-size:cover;background-position:center;filter:blur(30px) brightness(.45)}
#s_cut .cimg{position:absolute;inset:0;background-size:contain;background-position:center;background-repeat:no-repeat}
#s_cut .sh2{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.5),transparent 32%,transparent 70%,rgba(0,0,0,.55))}
#s_cut .cs{position:absolute;opacity:0}
#s_cut .cs .st{filter:drop-shadow(0 8px 12px rgba(0,0,0,.85)) drop-shadow(0 0 22px rgba(255,200,80,.55))}
#s_cut .cs.in{animation:starIn .38s cubic-bezier(.2,1.5,.4,1) forwards}
#s_cut .cs.off.in{animation:starOff .5s ease-out forwards}
@keyframes starIn{0%{opacity:0;transform:scale(3.4) rotate(-25deg)}65%{opacity:1;transform:scale(.88) rotate(4deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes starOff{from{opacity:0;transform:scale(1.4)}to{opacity:.8;transform:scale(1)}}
#s_cut .cstamp{position:absolute;right:130px;bottom:130px;width:300px;height:210px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;white-space:nowrap;border:12px double #e2483c;border-radius:26px;color:#e2483c;font:400 96px var(--f1);letter-spacing:.04em;text-shadow:0 0 14px rgba(226,72,60,.55);background:rgba(110,8,8,.22);opacity:0;transform:rotate(-10deg) scale(3)}
#s_cut .cstamp.in{animation:stampIn .32s cubic-bezier(.3,1.7,.5,1) forwards}
@keyframes stampIn{0%{opacity:0;transform:rotate(-10deg) scale(3)}70%{opacity:1;transform:rotate(-10deg) scale(.9)}100%{opacity:.95;transform:rotate(-10deg) scale(1)}}
#s_cut .chint{position:absolute;left:0;right:0;bottom:34px;text-align:center;font:700 30px var(--f2);color:#fff3d2;text-shadow:0 2px 6px #000;opacity:0}
#s_cut .chint.on{opacity:1;animation:bl 1.2s infinite}
#s_cut.shk .cimg,#s_cut.shk .cbg{animation:shk2 .24s}
@keyframes shk2{0%{transform:translate(0,0)}20%{transform:translate(-12px,8px)}40%{transform:translate(10px,-8px)}60%{transform:translate(-6px,5px)}80%{transform:translate(4px,-3px)}100%{transform:translate(0,0)}}
'''
rep("#idet{z-index:31}\n","#idet{z-index:31}\n"+CSS)
rep('<div id="load">불러오는 중… 0%</div>','''<div class="scr" id="s_cut" hidden data-a="cuttap"></div>
<input type="file" id="cutin" accept="image/*" multiple hidden><input type="file" id="cutdefin" accept="image/*" hidden><input type="file" id="cutdir" webkitdirectory multiple hidden>
<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="gStar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4b8"/><stop offset=".4" stop-color="#ffd24a"/><stop offset=".75" stop-color="#e29a1b"/><stop offset="1" stop-color="#b86f0d"/></linearGradient></defs></svg>
<div id="load">불러오는 중… 0%</div>''')
assert src.count("['title','bar','scn','dlg','res','pz']")==3
src=src.replace("['title','bar','scn','dlg','res','pz']","['title','bar','scn','dlg','res','pz','cut']")

# 별 · 서비스 컷 함수
JS=r'''
/* ── 별 · 서비스 컷 ── */
const starSVG=on=>`<svg viewBox="0 0 100 100" class="st"><polygon points="50,6 61.5,36.5 94,38 68.5,58.5 77.5,90.5 50,72.5 22.5,90.5 31.5,58.5 6,38 38.5,36.5" fill="${on?'url(#gStar)':'#2b2631'}" stroke="${on?'#6b3d06':'#4b4453'}" stroke-width="4" stroke-linejoin="round"/>${on?'<polygon points="50,6 61.5,36.5 94,38 68.5,58.5 77.5,90.5 50,72.5 22.5,90.5 31.5,58.5 6,38 38.5,36.5" transform="translate(50 52) scale(.8) translate(-50 -52)" fill="none" stroke="rgba(255,248,210,.6)" stroke-width="2.4" stroke-linejoin="round"/>':''}</svg>`;
const starsRow=(n,top)=>`<div class="srow" style="left:0;right:0;top:${top||236}px">${[0,1,2].map(i=>`<span class="sm">${starSVG(i<n)}</span>`).join('')}</div>`;
function starPanel(n){
  const a=S.cs[n]||[0,0,0,0];
  let h=`<div class="spn" style="left:1130px;top:30px"><div class="sh">클리어 별</div>`;
  DIFF.forEach((q,i)=>{h+=`<div class="sr1"><span>${q.n}</span><span class="ss">${[0,1,2].map(k=>`<i>${starSVG(k<(a[i]||0))}</i>`).join('')}</span></div>`;});
  return h+'</div>';
}
function calcStars(t,hpf){return 1+(t<=M.par?1:0)+(t<=M.par&&hpf>=.5?1:0);}
function clearCut(){for(const u of (UI.cutFiles||[])){try{URL.revokeObjectURL(u);}catch(e){}}UI.cutFiles=[];}
function pickCut(){const f=UI.cutFiles||[];return f.length?f[Math.floor(Math.random()*f.length)]:(UI.cutDef||'a/ui/cut_default.webp');}
/* 기본 그림 변경본은 브라우저에 저장해 둔다 (실패해도 기본 그림으로 동작) */
function cutDB(){return new Promise((ok,no)=>{try{const q=indexedDB.open('choseon_cut',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error);}catch(e){no(e);}});}
async function cutDefSave(f){try{const d=await cutDB();d.transaction('k','readwrite').objectStore('k').put(f,'def');}catch(e){}}
async function cutDefLoad(){try{const d=await cutDB();const r=await new Promise((ok,no)=>{const q=d.transaction('k').objectStore('k').get('def');q.onsuccess=()=>ok(q.result);q.onerror=()=>no();});if(r){UI.cutDef=URL.createObjectURL(r);}}catch(e){}}
async function cutDefReset(){try{const d=await cutDB();d.transaction('k','readwrite').objectStore('k').delete('def');}catch(e){}if(UI.cutDef){try{URL.revokeObjectURL(UI.cutDef);}catch(e){}}UI.cutDef=null;}
function cutThump(ms){const r=$('s_cut');r.classList.remove('shk');void r.offsetWidth;r.classList.add('shk');try{if(navigator.vibrate)navigator.vibrate(ms||180);}catch(e){}}
function showCut(r,done){
  UI.mode='cut';
  for(const id of ['title','bar','scn','dlg','res','pz','cut'])$('s_'+id).hidden=!(id==='cut');
  document.documentElement.classList.add('nb');
  const src=pickCut(),st=r.stars||1,root=$('s_cut');
  root.classList.remove('shk');
  root.innerHTML=`<div class="cbg" style="background-image:url('${src}')"></div><div class="cimg" style="background-image:url('${src}')"></div><div class="sh2"></div>
   <div class="stg" id="g_cut"><div class="cs" data-i="0" style="left:50px;top:70px;width:140px;height:140px">${starSVG(st>0)}</div><div class="cs" data-i="1" style="left:200px;top:24px;width:176px;height:176px">${starSVG(st>1)}</div><div class="cs" data-i="2" style="left:386px;top:70px;width:140px;height:140px">${starSVG(st>2)}</div>
   <div class="cstamp" id="cstamp">승리</div><div class="chint" id="chint">화면을 눌러 계속</div></div>`;
  fitUI();
  const T=[],at=(ms,f)=>T.push(setTimeout(f,ms));
  [0,1,2].forEach(i=>at(900+i*420,()=>{const e=root.querySelector('.cs[data-i="'+i+'"]');if(!e)return;if(i<st){e.classList.add('in');cutThump(190);}else e.classList.add('in','off');}));
  at(900+3*420+250,()=>{const e=$('cstamp');if(e){e.classList.add('in');cutThump(320);}});
  at(900+3*420+1100,()=>{const e=$('chint');if(e)e.classList.add('on');UI.cutReady=true;});
  UI.cutT=T;UI.cutDone=done;UI.cutReady=false;
}
function cutTap(){
  if(UI.mode!=='cut')return;
  if(!UI.cutReady){
    for(const t of UI.cutT||[])clearTimeout(t);
    const root=$('s_cut');root.querySelectorAll('.cs').forEach((e,i)=>e.classList.add('in',...(i<(UI.rs?UI.rs.stars:3)?[]:['off'])));
    const sp=$('cstamp'),h=$('chint');if(sp)sp.classList.add('in');if(h)h.classList.add('on');UI.cutReady=true;return;
  }
  for(const t of UI.cutT||[])clearTimeout(t);
  const d=UI.cutDone;UI.cutDone=null;if(d)d();
}
function cutModal(){
  const n=(UI.cutFiles||[]).length,cd=!!UI.cutDef,src=n?'':(UI.cutDef||'a/ui/cut_default.webp');
  const m=`<div class="pn" style="left:380px;top:150px;width:840px;height:700px"><div class="in"><div class="f1" style="position:absolute;left:0;right:0;top:40px;text-align:center;font:400 58px var(--f1);color:#fff3cf">서비스 컷</div>
   <div style="position:absolute;left:0;right:0;top:128px;text-align:center;font:700 28px var(--f2);color:#ffd98a">${n?'선택한 사진 '+n+'장에서 무작위':'기본 그림'+(cd?' (변경됨)':'')}</div>
   ${n?'':`<div style="position:absolute;left:310px;top:176px;width:240px;height:172px;background:url('${src}') center/cover;border:3px solid rgba(214,180,110,.7);border-radius:12px;box-shadow:0 4px 14px #000"></div>`}
   <button class="bt" data-a="cutdir" style="left:60px;top:376px;width:340px;height:92px;padding:0 20px 0 60px;font-size:32px">폴더 선택</button>
   <button class="bt" data-a="cutpic" style="left:430px;top:376px;width:340px;height:92px;padding:0 20px 0 60px;font-size:32px">사진 선택</button>
   <button class="bt" data-a="cutdefpick" style="left:60px;top:484px;width:340px;height:92px;padding:0 20px 0 60px;font-size:30px">기본 그림 변경</button>
   <button class="bt ${n||cd?'':'off'}" ${n||cd?'data-a="cutdef"':'disabled'} style="left:430px;top:484px;width:340px;height:92px;padding:0 20px 0 60px;font-size:30px">${n?'선택 해제':'원래 그림'}</button>
   <button class="bt gold" data-a="cutclose" style="left:250px;top:586px;width:340px;height:104px;padding:0 30px 0 70px;font-size:36px">닫 기</button></div></div>`;
  return `<div id="dfm"></div><div class="abs" style="left:0;top:0;width:1600px;height:1000px;z-index:6">${m}</div>`;
}
'''
rep("/* ── 대사 ── */\n","/* ── 대사 ── */\n"+JS.replace('\\','\\\\') if False else "/* ── 대사 ── */\n")
src=src.replace("/* ── 대사 ── */\n","/* ── 대사 ── */\n"+JS,1)

# 병영
rep("const menu=[['hero','영웅 편성','ic_hero',1,1],['equip','무기 장비','ic_sword',1],['armor','방어구','ic_armor',1],['train','훈련','ic_dummy',0],['tac','전법','ic_banner',0],['unit','부대 정보','ic_tent',0],['back','돌아가기','ic_back',1]];",
    "const menu=[['hero','영웅 편성','ic_hero',1,1],['equip','무기 장비','ic_sword',1],['armor','방어구','ic_armor',1],['train','훈련','ic_dummy',0],['tac','전법','ic_banner',0],['unit','부대 정보','ic_tent',0],['cut','서비스 컷','ic_scroll',1],['back','돌아가기','ic_back',1]];")
rep("style=\"left:50px;top:${150+i*106}px;width:370px;height:98px\"","style=\"left:50px;top:${150+i*96}px;width:370px;height:88px\"")
rep("아직 합류한 영웅이 없습니다<br>시나리오에서 영웅을 구출하거나<br>제압하면 이곳에 모입니다","아직 합류한 영웅이 없습니다<br>여성 영웅을 구출하거나 제압하면<br>이곳에 모입니다")
rep("  $('g_bar').innerHTML=h;\n}\nfunction togParty(id){","  if(UI.cutm)h+=cutModal();\n  $('g_bar').innerHTML=h;\n}\nfunction togParty(id){")
rep("const sb=id==='choseon'?'주인공':NATN[nat]+' · '+(hs?'Stage '+hs+' 합류':'');","const sb=id==='choseon'?'주인공 · Lv '+S.lv:NATN[nat]+' · Lv '+heroLv(id);")

# 시나리오
rep("""<div class="tt" style="left:450px;top:70px">${sel.t}</div>""","""<div class="tt" style="left:450px;top:70px;font-size:${sel.t.length>9?58:70}px">${sel.t}</div>""")
rep("""<div class="ln" style="left:452px;top:236px;width:900px"><b>맵 기믹</b>${sel.gm}</div>""","""<div class="ln" style="left:452px;top:236px;width:640px"><b>맵 기믹</b>${sel.gm}</div>""")
rep("""d+=`<div class="ln" style="left:452px;top:326px"><b>난이도</b></div><div class="dm" style="left:600px;top:322px">""","""d+=`<div class="ln" style="left:452px;top:346px"><b>난이도</b></div><div class="dm" style="left:600px;top:342px">""")
rep("""d+=`<div class="ln" style="left:452px;top:392px"><b>최고 기록</b>${cl?fmtT(cl.t)+' · '+DIFF[cl.d].n:'기록 없음'}</div>`;""","""d+=`<div class="ln" style="left:452px;top:410px"><b>최고 기록</b>${cl?fmtT(cl.t)+' · '+DIFF[cl.d].n:'기록 없음'}</div>`;\n    d+=starPanel(sel.n);""")

# 결과
rep("Stage ${s.n} · ${s.t}</div>`;","Stage ${s.n} · ${s.t}</div>${starsRow(r.stars||0)}`;")
rep("""  else h+=`<div class="l2" style="left:0;right:0;text-align:center;top:320px;font-size:32px">${s.hero.length?'이미 합류한 영웅입니다':'새로 합류한 영웅이 없습니다'}</div>`;""",
"""  else if(r.saved&&r.saved.length)h+=`<div class="l2" style="left:0;right:0;text-align:center;top:350px;color:#9ff09a;font-size:40px">${r.saved.map(i=>HN[i]).join(' · ')} 구출</div>`;
  else h+=`<div class="l2" style="left:0;right:0;text-align:center;top:340px;font-size:32px">${s.hero.length?'이미 합류한 영웅입니다':'새로 합류한 영웅이 없습니다'}</div>`;""")
rep("클리어 시간 ${fmtT(r.t)} · 난이도","클리어 시간 ${fmtT(r.t)} (목표 ${fmtT(r.par||0)}) · 난이도")

# 전투 끝
a=src.index('function endStage(){');b=src.index('function pauseGame(on){')
src=src[:a]+r'''function endStage(){
  if(!M||M.ended)return;M.ended=true;
  const n=M.n,t=M.clock,d=UI.diff,old=S.cl[n];
  let rec=false;
  if(!old)S.cl[n]={d,t};
  else if(d>old.d)S.cl[n]={d,t};
  else if(d===old.d&&t<old.t){S.cl[n]={d,t};rec=true;}
  const hpf=P&&ST?Math.max(0,P.hp/ST.maxHp):1,stars=calcStars(t,hpf);
  const a=S.cs[n]=S.cs[n]||[0,0,0,0];if(stars>(a[d]||0))a[d]=stars;
  gainExp(40*(1+.1*(n-1)));
  const joined=(M.joined||[]).slice(),saved=(M.saved||[]).slice();
  save();
  const r={n,t,d,kills:S.kills-M.k0,joined,saved,rec,stars,par:M.par,hpf};
  const fin=()=>showCut(r,()=>showResult(r));
  const lines=(M.dl&&M.dl.end)||[];
  UI.rs=r;
  if(lines.length)playDlg(lines,fin);else fin();
}
'''+src[b:]

# 동작
rep("bm(d){if(d.k==='back')showScreen('title');else if(d.k==='equip'){bagF='weapon';openBag();}else if(d.k==='armor'){bagF='armor';openBag();}},",
    "bm(d){if(d.k==='back')showScreen('title');else if(d.k==='equip'){bagF='weapon';openBag();}else if(d.k==='armor'){bagF='armor';openBag();}else if(d.k==='cut'){UI.cutm=true;renderBar();}},\n  cutdir(){$('cutdir').click();},cutpic(){$('cutin').click();},cutdef(){if(UI.cutFiles&&UI.cutFiles.length)clearCut();else cutDefReset();renderBar();},cutdefpick(){$('cutdefin').click();},cutclose(){UI.cutm=false;renderBar();},cuttap(){cutTap();},")
rep("recalc();resize();buildUI();refreshUI();showScreen('title');",
    "recalc();resize();buildUI();refreshUI();\n    for(const id of ['cutdir','cutin'])$(id).addEventListener('change',e=>{const fs=[...e.target.files].filter(f=>/^image\\//.test(f.type)||/\\.(webp|png|jpe?g|gif)$/i.test(f.name));if(fs.length){clearCut();UI.cutFiles=fs.map(f=>URL.createObjectURL(f));}e.target.value='';if(UI.mode==='bar')renderBar();});\n    $('cutdefin').addEventListener('change',e=>{const f=e.target.files[0];if(f&&(/^image\\//.test(f.type)||/\\.(webp|png|jpe?g|gif)$/i.test(f.name))){if(UI.cutDef){try{URL.revokeObjectURL(UI.cutDef);}catch(x){}}UI.cutDef=URL.createObjectURL(f);cutDefSave(f);}e.target.value='';if(UI.mode==='bar')renderBar();});\n    cutDefLoad();\n    showScreen('title');")
rep("heroLv,heroExp,THEME_OF,hurtAlly,BUF,","heroLv,heroExp,THEME_OF,showCut,calcStars,cutTap,hurtAlly,BUF,")

# ── 가방 · 장비 화면: 새 UI 톤 ──
BAGCSS=r'''
/* 가방 · 장비 (새 UI 톤) */
#bag{background:linear-gradient(rgba(6,5,14,.78),rgba(6,5,14,.9)),url(a/ui/bg_barracks.webp) center/cover;font-family:var(--f2);color:var(--ink2)}
#bag .bw{box-sizing:border-box;border:30px solid transparent;border-image:url(a/ui/panel_big.webp) 100 fill/30px stretch;padding:0 8px 4px;gap:6px}
#bag .bh b{font:400 26px var(--f1);color:#fff0c4;letter-spacing:.08em;text-shadow:0 2px 6px #000}
#bag .bh span{color:#d8c89a;font-weight:700}
#bag button{background:url(a/ui/pill_blue.webp) 0 0/100% 100% no-repeat;border:0;border-radius:0;color:#fff6dc;font:400 17px var(--f1);letter-spacing:.05em;text-shadow:0 2px 4px #000;padding:6px 20px;min-height:42px}
#bag button:not(:disabled):active{filter:brightness(1.25);background:url(a/ui/pill_blue.webp) 0 0/100% 100% no-repeat}
#bag button.on{background:url(a/ui/pill_gold.webp) 0 0/100% 100% no-repeat;border:0}
#bag button:disabled{background:url(a/ui/pill_blue.webp) 0 0/100% 100% no-repeat;border:0;filter:grayscale(1) brightness(.5);opacity:.75}
#bag #btabs button{min-height:38px;padding:4px 16px;font-size:16px}
#bag .sec{font:700 14px var(--f2);color:#ffd98a;letter-spacing:.04em}
.ec{background:url(a/ui/card_blue.webp) 0 0/100% 100% no-repeat;border:0;border-radius:0;padding:12px 8px 10px;gap:4px;color:#f4ecd8}
.ec.g{background-image:url(a/ui/card_gold.webp)}
.ec .nm{font-weight:700;font-size:12px}
.ec .lv{color:#ffd98a}
.ic{background-color:rgba(8,12,26,.75);border-width:2px}
#bgrid .ic{box-shadow:0 0 0 3px rgba(8,12,26,.9),0 0 0 4px rgba(214,180,110,.55)}
#bgrid{gap:9px;padding:4px 4px}
#bstat,#sellset{background:rgba(8,12,26,.55);border:2px solid rgba(214,180,110,.5);border-radius:12px;color:#efe4c4}
#bstat span,#sellset .note{color:#bfae82}
#idet{background:rgba(0,0,0,.66)}
#idet .card{box-sizing:border-box;background:none;border:34px solid transparent;border-image:url(a/ui/panel_big.webp) 100 fill/34px stretch;border-radius:0;padding:0 6px 4px;color:#f4ecd8;font-family:var(--f2)}
#idet .in{font-family:var(--f1);font-weight:400;font-size:20px}
#idet .btns button{background:url(a/ui/pill_blue.webp) 0 0/100% 100% no-repeat;border:0;border-radius:0;color:#fff6dc;font:400 17px var(--f1);letter-spacing:.05em;text-shadow:0 2px 4px #000}
#idet .btns button.pri{background:url(a/ui/pill_gold.webp) 0 0/100% 100% no-repeat;border:0}
#idet .btns button:disabled{filter:grayscale(1) brightness(.5);opacity:.75}
'''
rep("#idet{z-index:31}\n","#idet{z-index:31}\n"+BAGCSS)
rep("지금 낀 장비보다 좋아지는 장비는 자동으로 팔지 않습니다.","지금 낀 장비보다 좋아지는 장비는 자동으로 정리하지 않습니다.")
rep("const it=S.eq[sl],c=document.createElement('div');c.className='ec';","const it=S.eq[sl],c=document.createElement('div');c.className='ec'+(it&&it.t>=3?' g':'');")

rep("nm.textContent=it?itemName(it):SLOTN[sl]+' 비어 있음';","nm.textContent=it?itemName(it):SLOTN[sl];if(!it)nm.style.color='#8a8f9c';")

# ── 손상향 걷기 시트 ──
rep("const A={};   // 불러온 그림","const A={};   // 불러온 그림\n/* 걷기 시트가 있는 장수: 행 0 정면 · 1 후면 · 2 오른쪽 측면, 열 4컷(150ms) */\nconst WALK={shangxiang:{f:'a/walk_shangxiang.webp',fw:308,ax:154,ay:[308,308,299]},zhenji:{f:'a/walk_zhenji.webp',fw:308,ax:154,ay:[308,306,302]},wenji:{f:'a/walk_wenji.webp',fw:308,ax:154,ay:[308,308,301]},wangyi:{f:'a/walk_wangyi.webp',fw:308,ax:154,ay:[308,308,302]},xiaoqiao:{f:'a/walk_xiaoqiao.webp',fw:308,ax:154,ay:[308,304,299]},daqiao:{f:'a/walk_daqiao.webp',fw:308,ax:154,ay:[308,308,301]},yinping:{f:'a/walk_yinping.webp',fw:308,ax:154,ay:[304,282,288]},xingcai:{f:'a/walk_xingcai.webp',fw:308,ax:154,ay:[308,308,304]},yueying:{f:'a/walk_yueying.webp',fw:308,ax:154,ay:[308,308,299]}};")
rep("A.sheets={};\n  const jobs=[];","A.sheets={};A.walk={};\n  const jobs=[];\n  for(const id in WALK)jobs.push(loadImg(WALK[id].f).then(im=>A.walk[id]=im).catch(()=>{}));")
rep("  cx.drawImage(A.mobs,r.x,r.y,r.w,r.h,-r.ax,-r.ay,r.w,r.h);\n  if(m.type==='spear'&&r.th!==undefined)drawSpearTip(m,dir,r);\n  if(m.hurt>0){cx.globalAlpha=alpha*.75*(m.hurt/.14);cx.drawImage(whiteMob(m.set,m.type,dir),-r.ax,-r.ay);}",
"""  const WK=A.walk&&A.walk[m.type]&&WALK[m.type];
  if(WK){
    const row=dir==='front'?0:dir==='back'?1:2,col=m.moving&&!m.down?Math.floor((time+m.seed)*6.67)%4:1,fw=WK.fw;
    cx.drawImage(A.walk[m.type],col*fw,row*fw,fw,fw,-WK.ax,-WK.ay[row],fw,fw);
    if(m.hurt>0){cx.globalAlpha=alpha*.75*(m.hurt/.14);cx.drawImage(whiteWalk(m.type,row,col),-WK.ax,-WK.ay[row]);}
  }else{
  cx.drawImage(A.mobs,r.x,r.y,r.w,r.h,-r.ax,-r.ay,r.w,r.h);
  if(m.type==='spear'&&r.th!==undefined)drawSpearTip(m,dir,r);
  if(m.hurt>0){cx.globalAlpha=alpha*.75*(m.hurt/.14);cx.drawImage(whiteMob(m.set,m.type,dir),-r.ax,-r.ay);}
  }""")
rep("function drawShadow(x,y,rx,ry,a){","function whiteWalk(type,row,col){\n  const key='w'+type+row+col;let c=white.get(key);if(c)return c;\n  const fw=WALK[type].fw;c=newCanvas(fw,fw);const g=c.getContext('2d');\n  g.drawImage(A.walk[type],col*fw,row*fw,fw,fw,0,0,fw,fw);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,fw,fw);\n  white.set(key,c);return c;\n}\nfunction drawShadow(x,y,rx,ry,a){")

# ── 새 시작 화면 ──
rep("family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700&display=swap","family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@700;900&display=swap")
rep("#idet{z-index:31}\n","""#idet{z-index:31}
/* 시작 화면 */
#s_title .bgi{background-image:url(a/ui/t_bg.webp);filter:blur(22px) brightness(.5) saturate(1.2);transform:scale(1.08)}
#s_title .shade{display:none}
#g_title{width:1672px;height:941px;overflow:hidden;background:#0a0614}
#g_title .L{position:absolute;pointer-events:none}
#g_title .tbg{left:0;top:0;width:1672px;height:941px;background:url(a/ui/t_bg.webp) 0 0/100% 100% no-repeat}
#g_title .tgl{mix-blend-mode:screen;border-radius:50%;background:radial-gradient(circle,rgba(255,170,70,.55),rgba(255,140,40,0) 68%);animation:tfl 2.6s ease-in-out infinite}
@keyframes tfl{0%,100%{opacity:.45;transform:scale(.92)}50%{opacity:1;transform:scale(1.08)}}
#g_title .sub{filter:brightness(.8) saturate(.88);opacity:.92;animation:tflt 6s ease-in-out infinite}
@keyframes tflt{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
#g_title .tdw{left:700px;top:60px;width:1000px;height:860px;background:radial-gradient(ellipse at 52% 55%,rgba(255,110,190,.34),rgba(255,110,190,0) 62%);animation:tpul 4.6s ease-in-out infinite}
@keyframes tpul{0%,100%{opacity:.55}50%{opacity:1}}
#g_title .tdia{left:787px;top:18px;width:850px;height:906px;transform-origin:50% 96%;animation:tdfl 5.2s ease-in-out infinite}
#g_title .tdia i{display:block;width:100%;height:100%;background:url(a/ui/t_dia.webp) center/100% 100% no-repeat;transform-origin:50% 96%;animation:tdbr 3.4s ease-in-out infinite;filter:drop-shadow(0 12px 22px rgba(10,0,20,.6))}
@keyframes tdfl{0%,100%{transform:translateY(8px) rotate(-.55deg)}50%{transform:translateY(-14px) rotate(.55deg)}}
@keyframes tdbr{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,1.02)}}
#g_title .tlogo{left:116px;top:31px;width:468px;height:468px;background:url(a/ui/t_logo.webp) center/100% 100% no-repeat;filter:drop-shadow(0 8px 18px rgba(0,0,0,.65))}
#g_title .tshine{left:116px;top:31px;width:468px;height:468px;-webkit-mask:url(a/ui/t_logo.webp) center/100% 100% no-repeat;mask:url(a/ui/t_logo.webp) center/100% 100% no-repeat;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.75) 50%,transparent 62%) 160% 0/300% 100% no-repeat;animation:tshn 5.5s ease-in-out infinite}
@keyframes tshn{0%,30%{background-position:160% 0}80%,100%{background-position:-60% 0}}
#g_title .tb{position:absolute;border:0;background:transparent center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center;font:900 40px 'Noto Serif KR',var(--f2);letter-spacing:.14em;color:#e9edf8;text-shadow:0 2px 6px #000,0 0 14px rgba(120,140,220,.45);cursor:pointer;transition:transform .12s,filter .12s}
#g_title .tb:not(:disabled):hover{filter:brightness(1.22)}
#g_title .tb:not(:disabled):active{transform:scale(.97)}
#g_title .tb:disabled{filter:grayscale(.75) brightness(.55);opacity:.7;cursor:default}
#g_title .tb.go{font-size:46px;color:#ffe9b0;text-shadow:0 2px 6px #000,0 0 18px rgba(255,170,60,.9);padding-left:36px;animation:tbg 2.4s ease-in-out infinite}
@keyframes tbg{0%,100%{filter:brightness(1) drop-shadow(0 0 8px rgba(255,170,50,.4))}50%{filter:brightness(1.16) drop-shadow(0 0 20px rgba(255,190,70,.85))}}
#g_title .tb.go.ask{font-size:36px}
#g_title canvas{position:absolute;left:0;top:0;width:1672px;height:941px;pointer-events:none}
""")
rep('<div class="scr" id="s_title" hidden><div class="bgi" style="background-image:url(a/ui/title_key.webp)"></div><div class="shade"></div><div class="stg" id="g_title"></div></div>',
    '<div class="scr" id="s_title" hidden><div class="bgi"></div><div class="shade"></div><div class="stg" id="g_title"></div></div>')
# fitUI : 시작 화면은 1672x941 기준
rep("  document.querySelectorAll('.scr .stg').forEach(e=>{e.style.transform='translate(-50%,-50%) scale('+s+')';});",
    "  document.querySelectorAll('.scr .stg').forEach(e=>{e.style.transform='translate(-50%,-50%) scale('+(e.id==='g_title'?Math.min(innerWidth/1672,innerHeight/941):s)+')';});")
# 화면 만들기 (한 번만 만들고 글자·상태만 바꾼다)
a=src.index("function renderTitle(){");b=src.index("/* ── 병영 ── */")
src=src[:a]+r'''let titleBuilt=false;
function renderTitle(){
  const g=$('g_title');
  if(!titleBuilt){
    titleBuilt=true;
    const glows=[[18,420,120],[300,470,90],[790,452,110],[1010,440,100],[1330,520,100],[1545,520,110],[330,60,0]].filter(q=>q[2]);
    g.innerHTML=`<div class="L tbg"></div>`+
     glows.map((q,i)=>`<div class="L tgl" style="left:${q[0]}px;top:${q[1]}px;width:${q[2]*2}px;height:${q[2]*2}px;animation-delay:${i*-.55}s"></div>`).join('')+
     `<img class="L sub" src="a/ui/t_guan.webp" style="left:520px;top:245px;width:300px;animation-delay:-1s">
      <img class="L sub" src="a/ui/t_zhen.webp" style="left:706px;top:262px;width:237px;animation-delay:-3s">
      <img class="L sub" src="a/ui/t_sun.webp" style="left:1440px;top:240px;width:255px;animation-delay:-2s">
      <div class="L tdw"></div>
      <div class="L tdia"><i></i></div>
      <div class="L tlogo"></div><div class="L tshine"></div>
      <button class="tb go" id="tb_go" data-a="tgo" style="left:49px;top:468px;width:572px;height:126px;background-image:url(a/ui/t_btn_go.webp)"></button>
      <button class="tb" id="tb_1" data-a="tcont" style="left:53px;top:588px;width:574px;height:127px;background-image:url(a/ui/t_btn_1.webp)">이어하기</button>
      <button class="tb" id="tb_2" disabled style="left:53px;top:683px;width:574px;height:127px;background-image:url(a/ui/t_btn_2.webp)">설 정</button>
      <button class="tb" id="tb_3" disabled style="left:53px;top:778px;width:574px;height:127px;background-image:url(a/ui/t_btn_3.webp)">종 료</button>
      <canvas id="tpet" width="1672" height="941"></canvas>`;
    startPetals();
  }
  const hp=hasProg();
  $('tb_go').textContent=UI.resetAsk?'정말 처음부터?':'게임 시작';
  $('tb_go').classList.toggle('ask',!!UI.resetAsk);
  $('tb_1').disabled=!hp;
}
/* 벚꽃잎과 반짝임 (시작 화면이 보일 때만 그린다) */
function startPetals(){
  const c=$('tpet'),g=c.getContext('2d'),W=1672,H=941,P=[];
  const mk=(init)=>({x:Math.random()*W*1.1,y:init?Math.random()*H:-30,s:5+Math.random()*9,vy:30+Math.random()*50,vx:-20+Math.random()*30,ph:Math.random()*6.3,sp:1+Math.random()*2.2,rot:Math.random()*6.3,vr:-1.5+Math.random()*3,a:.55+Math.random()*.4,hue:Math.random()<.2?'255,220,230':'255,120,175'});
  for(let i=0;i<46;i++)P.push(mk(true));
  const S=[];for(let i=0;i<34;i++)S.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.4,ph:Math.random()*6.3,sp:.8+Math.random()*1.8});
  let last=performance.now();
  function f(t){
    requestAnimationFrame(f);
    if($('s_title').hidden)return;
    const dt=Math.min(.05,(t-last)/1000);last=t;
    g.clearRect(0,0,W,H);
    g.globalCompositeOperation='lighter';
    for(const s of S){const a=.5+.5*Math.sin(t/1000*s.sp+s.ph);g.fillStyle='rgba(255,226,150,'+(.55*a)+')';g.beginPath();g.arc(s.x,s.y,s.r*(.6+.5*a),0,7);g.fill();}
    g.globalCompositeOperation='source-over';
    for(const p of P){
      p.y+=p.vy*dt;p.x+=(p.vx+Math.sin(t/1000*p.sp+p.ph)*28)*dt;p.rot+=p.vr*dt;
      if(p.y>H+30||p.x<-40){Object.assign(p,mk(false));p.x=Math.random()*W*1.1;}
      g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.scale(1,.55+.45*Math.abs(Math.sin(p.rot*1.3)));
      g.fillStyle='rgba('+p.hue+','+p.a+')';g.beginPath();g.ellipse(0,0,p.s,p.s*.55,0,0,7);g.fill();
      g.restore();
    }
  }
  requestAnimationFrame(f);
}

'''+src[b:]
# 동작
rep("  go(){showScreen('bar');},","  go(){showScreen('bar');},\n  tgo(){if(!hasProg()){showScreen('bar');return;}ACT.reset();},tcont(){if(hasProg())showScreen('bar');},")
