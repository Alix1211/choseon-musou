/* ═════════ 화면 흐름 : 타이틀 → 병영 → 시나리오 → 난이도 → 전투 → 대사 → 결과 ═════════ */
const STG=/*STAGES*/[];
const CHP=[{k:'wei',n:'위',t:'위(魏)나라 탈환전',s:'중원의 은밀한 어장'},{k:'wu',n:'오',t:'오(吳)나라 진압전',s:'강동의 후끈한 밤'},{k:'shu',n:'촉',t:'촉(蜀)나라 정벌전',s:'깊은 산골의 신음'},{k:'etc',n:'군웅',t:'군웅 할거전',s:'어장 관리의 종착역'}];
const DIFF=[{n:'쉬움',hp:.7,atk:.7},{n:'보통',hp:1,atk:1},{n:'어려움',hp:1.6,atk:1.35},{n:'격난',hp:2.4,atk:1.8}];
const KINDN={rescue:'구출전',capture:'포획전',entry:'진입전',final:'최종전',other:'시나리오'};
const HN={xiahoudun:'하후돈',xiahouyuan:'하후연',zhenji:'견희',xuchu:'허저',zhangliao:'장료',wenji:'채문희',caopi:'조비',wangyi:'왕이',caocao:'조조',huanggai:'황개',taishici:'태사자',xiaoqiao:'소교',ganning:'감녕',luxun:'육손',daqiao:'대교',zhouyu:'주유',shangxiang:'손상향',sunquan:'손권',zhaoyun:'조운',zhangfei:'장비',yinping:'관은병',huangzhong:'황충',xingcai:'성채',machao:'마초',guanyu:'관우',yueying:'월영',zhugeliang:'제갈량',pangtong:'방통',liubei:'유비',huaxiong:'화웅',yuanshu:'원술',yuanshao:'원소',zhangjiao:'장각',dongzhuo:'동탁',lubu:'여포',weiyan:'위연',choseon:'초선',npc:'NPC 무쌍'};
const NAT={caocao:'wei',xiahoudun:'wei',xiahouyuan:'wei',zhangliao:'wei',xuchu:'wei',caopi:'wei',zhenji:'wei',wenji:'wei',wangyi:'wei',
  sunquan:'wu',zhouyu:'wu',ganning:'wu',luxun:'wu',taishici:'wu',huanggai:'wu',shangxiang:'wu',daqiao:'wu',xiaoqiao:'wu',
  liubei:'shu',guanyu:'shu',zhangfei:'shu',zhaoyun:'shu',machao:'shu',huangzhong:'shu',zhugeliang:'shu',pangtong:'shu',weiyan:'shu',yueying:'shu',xingcai:'shu',yinping:'shu',
  lubu:'etc',dongzhuo:'etc',zhangjiao:'etc',yuanshao:'etc',yuanshu:'etc',huaxiong:'etc',choseon:'cho',npc:'etc'};
const NATN={wei:'위',wu:'오',shu:'촉',etc:'군웅',cho:'주인공'};
const ATLAS_H=new Set(['yueying','xingcai','yinping','zhenji','wenji','wangyi','shangxiang','daqiao','xiaoqiao']);
const HERO_IDS=Object.keys(HN).filter(k=>k!=='choseon'&&k!=='npc'&&k!=='weiyan');
const UI={mode:'boot',paused:false,tab:0,sel:1,diff:1,cur:0,dlg:null,dfm:false,tcnt:0,tt:0,rs:null,resetAsk:false};
const BARK={combo:['어머, 약해.','조금 더 깊게 파고들어 볼까?','벌써 헐떡이는 거야?','그렇게 뻣뻣해서 어따 쓰니?'],
  charge:['여왕님의 터치야, 감사히 받아!','어딜 보는 거야, 이 변태들아!','좀 더 끈적하게 놀아보자구!'],
  ult:['아낌없이 쥐어짜 줄게! 한 방울도 남김없이 가버려라!']};

function initHeroMT(){
  for(const id of HERO_IDS){
    if(MT[id])continue;
    const at=ATLAS_H.has(id);
    MT[id]=Object.assign({hp:9,atk:2.0,sp:128,boss:true,hero:true,scale:1.2,gold:12,name:HN[id],wind:.4},at?{vh:130,H:300}:{vh:150,still:true});
  }
  MT.yueying.name=HN.yueying;
}
const cleared=n=>!!S.cl[n];
const unlocked=n=>n===1||cleared(n-1)||!!S.cheat;
const ptU=id=>"url('a/ui/pt/"+id+".webp')";
const fmtT=t=>{t=Math.round(t);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
const stgHero=n=>{const s=STG[n-1];return s.hero[0]||null;};
const heroStage=id=>{const s=STG.find(q=>q.hero.includes(id));return s?s.n:0;};

function fitUI(){
  const s=Math.min(innerWidth/1600,innerHeight/1000);
  document.querySelectorAll('.scr .stg').forEach(e=>{e.style.transform='translate(-50%,-50%) scale('+s+')';});
}
function showScreen(m){
  UI.mode=m;UI.paused=false;
  for(const id of ['title','bar','scn','dlg','res','pz'])$('s_'+id).hidden=!(id===m);
  document.documentElement.classList.toggle('nb',m!=='battle');
  if(m==='title')renderTitle();else if(m==='bar')renderBar();else if(m==='scn')renderScn();
  fitUI();
}
function pickFrame(id,o){
  o=o||{};
  const bg=o.img?'':ptU(id);
  const inner=o.img?`<i style="background-image:url(a/ui/${o.img}.webp);background-size:${o.sz||'58%'};background-position:center"></i>`:`<i style="background-image:${bg}"></i>`;
  return `<div class="fr ${o.gold?'gold':''} ${o.cls||''}" ${o.attr||''} style="${o.style||''}"><div class="pt">${inner}</div><div class="bg"></div>${o.lock?'<div class="lk"></div>':''}${o.tr?'<div class="tr"></div>':''}${o.no?`<div class="no">${o.no}</div>`:''}${o.name?`<div class="nl">${o.name}</div>`:''}</div>`;
}
function cardHTML(id,style,extra){
  const nat=NAT[id]||'etc';
  if(!id)return `<div class="cd empty shu" style="${style}"><div class="pt"><i></i></div><div class="bg"></div><div class="ph">빈 자리</div></div>`;
  const hs=heroStage(id);
  const sb=id==='choseon'?'주인공':NATN[nat]+' · '+(hs?'Stage '+hs+' 합류':'');
  return `<div class="cd ${nat}" style="${style}" ${extra||''}><div class="pt"><i style="background-image:${ptU(id)}"></i></div><div class="bg"></div><div class="tx"><div class="nm">${HN[id]}</div><div class="sb">${sb}</div></div>${id==='choseon'?'':'<div class="x">빼기</div>'}</div>`;
}

/* ── 타이틀 ── */
function hasProg(){return S.roster.length>0||Object.keys(S.cl).length>0||S.lv>1;}
function renderTitle(){
  $('g_title').innerHTML=`<div class="key"></div><div class="fade"></div>
   <button class="bt gold" data-a="go" style="left:600px;top:842px;width:400px;height:112px;padding:0 40px">출 정</button>
   ${hasProg()?`<button class="pl ${UI.resetAsk?'gold':''}" data-a="reset" style="left:1330px;top:900px;width:230px;height:74px;font-size:24px">${UI.resetAsk?'정말 지울까요?':'처음부터'}</button>`:''}`;
}

/* ── 병영 ── */
function renderBar(){
  const party=S.party.slice(0,2);
  let h=`<div class="hd" style="left:70px;top:36px">병 영</div><div class="hint" style="right:70px;top:62px">보유 영웅 ${S.roster.length}명</div>`;
  const menu=[['hero','영웅 편성','ic_hero',1,1],['equip','무기 장비','ic_sword',1],['armor','방어구','ic_armor',1],['train','훈련','ic_dummy',0],['tac','전법','ic_banner',0],['unit','부대 정보','ic_tent',0],['back','돌아가기','ic_back',1]];
  menu.forEach((m,i)=>{h+=`<button class="bt ${m[4]?'gold sel':''} ${m[3]?'':'off'}" ${m[3]?`data-a="bm" data-k="${m[0]}"`:'disabled'} style="left:50px;top:${150+i*106}px;width:370px;height:98px"><i class="ic" style="background-image:url(a/ui/${m[2]}.webp)"></i>${m[1]}</button>`;});
  let r='';
  if(!S.roster.length)r=`<div class="empt" style="left:0;right:0;top:230px">아직 합류한 영웅이 없습니다<br>시나리오에서 영웅을 구출하거나<br>제압하면 이곳에 모입니다</div>`;
  else r=`<div class="rost" id="rost">${S.roster.map(id=>pickFrame(id,{gold:party.includes(id),cls:'sm'+(party.includes(id)?' mk':''),attr:`data-a="rost" data-id="${id}"`,name:HN[id],style:'position:relative;width:120px;height:122px'})).join('')}</div>`;
  h+=`<div class="pn sm" style="left:440px;top:140px;width:660px;height:770px"><div class="in">${r}</div></div>`;
  h+=cardHTML('choseon','left:1120px;top:140px');
  for(let i=0;i<2;i++)h+=cardHTML(party[i]||null,`left:1120px;top:${140+(i+1)*(201+22)}px`,party[i]?`data-a="rost" data-id="${party[i]}"`:'');
  h+=`<button class="bt gold" data-a="toscn" style="left:1120px;top:826px;width:460px;height:104px;padding:0 40px 0 90px"><i class="ic" style="background-image:url(a/ui/ic_map.webp)"></i>시나리오 선택</button>`;
  $('g_bar').innerHTML=h;
}
function togParty(id){
  const k=S.party.indexOf(id);
  if(k>=0)S.party.splice(k,1);
  else if(S.party.length<2)S.party.push(id);
  else{S.party.shift();S.party.push(id);}
  save();renderBar();
}

/* ── 시나리오 선택 ── */
function renderScn(){
  const t=UI.tab,sel=STG[UI.sel-1],ok=unlocked(sel.n),done=cleared(sel.n),cl=S.cl[sel.n];
  let h=`<div class="hd" id="scnhd" data-a="cheat" style="left:60px;top:26px;font-size:46px">시나리오</div>`;
  CHP.forEach((c,i)=>{const cls=['','pk','gr','pur'][i];h+=`<button class="bt ${cls} ${i===t?'sel':'dn'}" data-a="tab" data-i="${i}" style="left:${560+i*250}px;top:20px;width:236px;height:84px;padding:0 26px 0 44px;font-size:36px">${c.n}</button>`;});
  h+=`<div class="hint" style="left:60px;top:106px;font-size:26px">${CHP[t].t} — ${CHP[t].s}</div>`;
  for(let i=0;i<10;i++){
    const n=t*10+i+1,s=STG[n-1],hid=s.hero[0],un=unlocked(n),dn=cleared(n);
    const o={gold:n===UI.sel,cls:(n===UI.sel?'pick ':'')+(un?'':'off'),no:n,attr:`data-a="stg" data-n="${n}"`,style:`left:${55+i*150}px;top:158px`,lock:!un,tr:dn};
    if(hid&&dn)h+=pickFrame(hid,o);
    else if(hid){h+=pickFrame(hid,Object.assign(o,{cls:o.cls+' sil'}));}
    else h+=pickFrame('',Object.assign(o,{img:s.kind==='final'?'ic_banner':'ic_map',sz:'60%'}));
  }
  // 상세 판
  let d='';
  const hid=sel.hero[0];
  if(hid&&done)d+=pickFrame(hid,{gold:1,cls:'big',style:'left:50px;top:-100px'});
  else if(hid)d+=pickFrame(hid,{gold:1,cls:'big sil',style:'left:50px;top:-100px'});
  else d+=pickFrame('',{gold:1,cls:'big',img:sel.kind==='final'?'ic_banner':'ic_map',sz:'46%',style:'left:50px;top:-100px'});
  if(ok){
    d+=`<div class="hint" style="left:450px;top:34px;font-size:26px">Stage ${sel.n} · ${CHP[Math.floor((sel.n-1)/10)].n} · ${KINDN[sel.kind]||''}</div>`;
    d+=`<div class="tt" style="left:450px;top:70px">${sel.t}</div><div class="su" style="left:452px;top:166px">${sel.sub}</div>`;
    d+=`<div class="ln" style="left:452px;top:236px;width:900px"><b>맵 기믹</b>${sel.gm}</div>`;
    d+=`<div class="ln" style="left:452px;top:326px"><b>난이도</b></div><div class="dm" style="left:600px;top:322px">${[0,1,2,3].map(i=>`<i class="${cl&&cl.d>=i?'on':''}"></i>`).join('')}</div>`;
    d+=`<div class="ln" style="left:452px;top:392px"><b>최고 기록</b>${cl?fmtT(cl.t)+' · '+DIFF[cl.d].n:'기록 없음'}</div>`;
  }else{
    d+=`<div class="tt" style="left:450px;top:110px">？？？</div><div class="su" style="left:452px;top:210px">앞선 시나리오를 완료하면 열립니다</div>`;
  }
  d+=`<button class="bt" data-a="scnback" style="left:830px;top:410px;width:260px;height:104px;padding:0 30px 0 80px"><i class="ic" style="background-image:url(a/ui/ic_back.webp)"></i>뒤로</button>`;
  d+=`<button class="bt gold ${ok?'':'off'}" ${ok?'data-a="sortie"':'disabled'} style="left:1110px;top:400px;width:340px;height:118px;padding:0 40px 0 90px;font-size:44px"><i class="ic" style="background-image:url(a/ui/ic_sword.webp)"></i>출 전</button>`;
  h+=`<div class="pn dt" style="left:60px;top:370px;width:1480px;height:590px"><div class="in">${d}</div></div>`;
  if(UI.dfm){
    let m=`<div class="pn" style="left:420px;top:230px;width:760px;height:560px"><div class="in"><div class="tt f1" style="left:0;right:0;text-align:center;top:46px;font-size:60px;font-family:var(--f1);position:absolute;color:#fff3cf">난이도</div>`;
    DIFF.forEach((q,i)=>{m+=`<button class="bt ${i===UI.diff?'gold sel':''}" data-a="diff" data-i="${i}" style="left:${80+(i%2)*310}px;top:${150+Math.floor(i/2)*110}px;width:290px;height:98px;padding:0 20px 0 60px;font-size:36px">${q.n}</button>`;});
    const q=DIFF[UI.diff];
    m+=`<div class="ln" style="position:absolute;left:0;right:0;text-align:center;top:372px;font:500 26px var(--f2);color:#d9d2c0">적 체력 ×${q.hp} · 적 공격 ×${q.atk}</div>`;
    m+=`<button class="bt" data-a="dcancel" style="left:90px;top:430px;width:270px;height:96px;padding:0 20px 0 60px;font-size:32px">취소</button><button class="bt gold" data-a="dgo" style="left:390px;top:424px;width:300px;height:108px;padding:0 30px 0 80px;font-size:38px">시 작</button></div></div>`;
    h+=`<div id="dfm"></div><div class="abs" style="left:0;top:0;width:1600px;height:1000px;z-index:6">${m}</div>`;
  }
  $('g_scn').innerHTML=h;
}

/* ── 대사 ── */
function npcOf(lines){for(const l of lines)if(l.w&&l.w!=='choseon')return l.w;return null;}
function playDlg(lines,done){
  const dl=UI.dlg={lines,i:-1,done,full:'',shown:0,typing:false,right:npcOf(lines)};
  UI.mode='dlg';
  for(const id of ['title','bar','scn','dlg','res','pz'])$('s_'+id).hidden=!(id==='dlg');
  document.documentElement.classList.add('nb');
  const rf=dl.right?pickFrame(dl.right,{cls:'big',style:'position:absolute;left:0;top:0'}):pickFrame('',{cls:'big',img:'ic_hero',sz:'50%',style:'position:absolute;left:0;top:0'});
  $('g_dlg').innerHTML=`<div class="dl dim" id="dlL" style="left:110px;top:130px">${pickFrame('choseon',{gold:1,cls:'big',style:'position:absolute;left:0;top:0'})}</div>
   <div class="dl dim" id="dlR" style="left:1130px;top:130px;width:360px;height:363px">${rf}</div>
   <div class="pn" style="left:200px;top:590px;width:1200px;height:360px"><div class="in"><div id="dtx"></div><div id="dnx">▼</div></div></div>
   <button class="bt" id="dnm" style="left:250px;top:530px;width:290px;height:90px;padding:0 20px 0 60px;font-size:36px;z-index:2"></button>
   <button class="pl" data-a="dskip" style="left:1370px;top:30px;width:210px;height:80px;font-size:28px">건너뛰기</button>`;
  fitUI();dlgNext();
}
function dlgNext(){
  const dl=UI.dlg;if(!dl)return;
  dl.i++;
  if(dl.i>=dl.lines.length){dlgEnd();return;}
  const L=dl.lines[dl.i],nr=!!L.n;
  const nm=$('dnm'),tx=$('dtx');
  $('dlL').className='dl '+((!nr&&L.w==='choseon')?'act':'dim');
  $('dlR').className='dl '+((!nr&&L.w!=='choseon')?'act':'dim');
  if(!nr&&L.w!=='choseon'&&L.w!==dl.right){ // 오른쪽 인물 교체
    dl.right=L.w;$('dlR').innerHTML=L.w==='npc'?pickFrame('',{cls:'big',img:'ic_hero',sz:'50%',style:'position:absolute;left:0;top:0'}):pickFrame(L.w,{cls:'big',style:'position:absolute;left:0;top:0'});
  }
  if(nr){nm.style.visibility='hidden';tx.className='nr';}
  else{
    nm.style.visibility='visible';tx.className='';
    const nat=NAT[L.w]||'etc';nm.className='bt '+(L.w==='choseon'?'pk':nat==='wu'?'pk':nat==='shu'?'gr':nat==='etc'?'pur':'');
    nm.textContent=HN[L.w]||L.w;
  }
  dl.full=(L.note?'<small>('+L.note+')</small>':'')+L.t.replace(/</g,'&lt;');dl.plain=L.t;dl.note=L.note?'<small>('+L.note+')</small>':'';
  dl.shown=0;dl.typing=true;$('dnx').style.visibility='hidden';
  dl.t0=performance.now();
  if(dl.raf)cancelAnimationFrame(dl.raf);
  const step=now=>{
    if(UI.dlg!==dl||!dl.typing)return;
    const n=Math.min(dl.plain.length,Math.floor((now-dl.t0)/28));
    if(n!==dl.shown){dl.shown=n;tx.innerHTML=dl.note+dl.plain.slice(0,n).replace(/</g,'&lt;');}
    if(n>=dl.plain.length){dl.typing=false;$('dnx').style.visibility='visible';return;}
    dl.raf=requestAnimationFrame(step);
  };
  dl.raf=requestAnimationFrame(step);
}
function dlgTap(){
  const dl=UI.dlg;if(!dl)return;
  if(dl.typing){dl.typing=false;dl.shown=dl.plain.length;$('dtx').innerHTML=dl.note+dl.plain.replace(/</g,'&lt;');$('dnx').style.visibility='visible';}
  else dlgNext();
}
function dlgEnd(){const dl=UI.dlg;UI.dlg=null;if(dl&&dl.raf)cancelAnimationFrame(dl.raf);if(dl&&dl.done)dl.done();}

/* ── 결과 ── */
function showResult(r){
  UI.rs=r;UI.mode='res';
  for(const id of ['title','bar','scn','dlg','res','pz'])$('s_'+id).hidden=!(id==='res');
  document.documentElement.classList.add('nb');
  const s=STG[r.n-1],nxt=r.n<40;
  let h=`<div class="pn" style="left:180px;top:110px;width:1240px;height:780px"><div class="in rs">
   <div class="ttl" style="top:50px">시나리오 완료</div>
   <div class="l1" style="left:0;right:0;text-align:center;top:190px;font-size:38px">Stage ${s.n} · ${s.t}</div>`;
  const j=r.joined;
  if(j.length){j.forEach((id,i)=>{h+=cardHTML(id,`left:${j.length>1?90+i*480:380}px;top:290px;transform:scale(.88);transform-origin:0 0`).replace('<div class="x">빼기</div>','');});
    h+=`<div class="l2" style="left:0;right:0;text-align:center;top:490px;color:#9ff09a;font-size:32px">${j.map(i=>HN[i]).join(' · ')} 합류</div>`;}
  else h+=`<div class="l2" style="left:0;right:0;text-align:center;top:320px;font-size:32px">${s.hero.length?'이미 합류한 영웅입니다':'새로 합류한 영웅이 없습니다'}</div>`;
  h+=`<div class="l2" style="left:0;right:0;text-align:center;top:560px">클리어 시간 ${fmtT(r.t)} · 난이도 ${DIFF[r.d].n}${r.rec?' · <b style="color:#ffd36b">최고 기록 갱신</b>':''}</div>
   <div class="l2" style="left:0;right:0;text-align:center;top:604px">레벨 ${S.lv}${S.lv>=LVCAP?' (최대)':''} · 처치 ${r.kills}</div>
   <button class="bt" data-a="rbar" style="left:60px;top:640px;width:340px;height:100px;padding:0 20px 0 80px;font-size:32px"><i class="ic" style="background-image:url(a/ui/ic_tent.webp)"></i>병영</button>
   <button class="bt" data-a="rscn" style="left:430px;top:640px;width:380px;height:100px;padding:0 20px 0 80px;font-size:32px"><i class="ic" style="background-image:url(a/ui/ic_map.webp)"></i>시나리오 선택</button>
   <button class="bt gold ${nxt?'':'off'}" ${nxt?'data-a="rnext"':'disabled'} style="left:840px;top:630px;width:340px;height:116px;padding:0 30px 0 90px;font-size:38px"><i class="ic" style="background-image:url(a/ui/ic_sword.webp)"></i>다음</button>
  </div></div>`;
  $('g_res').innerHTML=h;fitUI();
}

/* ── 전투 시작 · 끝 ── */
function startStage(n,d){
  UI.cur=n;UI.diff=d;S.diff=d;S.stage=n;S.speed=1;
  const replay=!!S.cl[n];
  showScreen('battle');
  buildMusou(STG[n-1]);
  recalc();P.hp=ST.maxHp;
  M.n=n;M.clock=0;M.ended=false;M.k0=S.kills;M.replay=replay;M.joined=[];
  $('pause').hidden=false;
  save();
}
function endStage(){
  if(!M||M.ended)return;M.ended=true;
  const n=M.n,st=STG[n-1],first=!S.cl[n];
  const t=M.clock,d=UI.diff,old=S.cl[n];
  let rec=false;
  if(!old)S.cl[n]={d,t};
  else if(d>old.d)S.cl[n]={d,t};
  else if(d===old.d&&t<old.t){S.cl[n]={d,t};rec=true;}
  gainExp(40*(1+.1*(n-1)));
  const joined=(M.joined||[]).slice();
  save();
  const r={n,t,d,kills:S.kills-M.k0,joined,rec};
  const fin=()=>showResult(r);
  if(st.lines&&st.lines.length)playDlg(st.lines,fin);else fin();
}
function pauseGame(on){
  if(UI.mode!=='battle')return;
  UI.paused=on;$('s_pz').hidden=!on;
  if(on){$('g_pz').innerHTML=`<div class="pn sm" style="left:520px;top:300px;width:560px;height:400px"><div class="in"><div class="f1" style="position:absolute;left:0;right:0;top:44px;text-align:center;font:400 54px var(--f1);color:#fff3cf">일시정지</div>
    <button class="bt gold" data-a="resume" style="left:100px;top:140px;width:360px;height:100px;font-size:36px">계 속</button>
    <button class="bt" data-a="retreat" style="left:100px;top:260px;width:360px;height:100px;font-size:36px">철 수</button></div></div>`;fitUI();}
}
function bark(kind){
  if(!P||UI.mode!=='battle')return;
  const now=performance.now();
  const gap=kind==='combo'?4200:kind==='charge'?900:0;
  if(bark.t&&now-bark.t<gap)return;
  if(kind==='combo'&&Math.random()<.5)return;
  bark.t=now;
  const a=BARK[kind],l=a[Math.floor(Math.random()*a.length)];
  pops.push({x:P.x,y:P.y-CH*3.1,t:0,txt:l,col:'#ffd0ee',size:kind==='ult'?24:19,vy:-18,life:1.9});
}

/* ── 동작 ── */
const ACT={
  go(){showScreen('bar');},
  reset(){if(!UI.resetAsk){UI.resetAsk=true;renderTitle();setTimeout(()=>{if(UI.resetAsk){UI.resetAsk=false;if(UI.mode==='title')renderTitle();}},3000);}else{try{localStorage.removeItem(SAVEKEY);}catch(e){}location.reload();}},
  bm(d){if(d.k==='back')showScreen('title');else if(d.k==='equip'){bagF='weapon';openBag();}else if(d.k==='armor'){bagF='armor';openBag();}},
  rost(d){togParty(d.id);},
  toscn(){
    if(!cleared(UI.sel)&&!unlocked(UI.sel))UI.sel=1;
    let n=1;for(let i=1;i<=40;i++)if(unlocked(i))n=i;
    if(!unlocked(UI.sel)||UI.sel<1)UI.sel=n;
    UI.tab=Math.floor((UI.sel-1)/10);showScreen('scn');
  },
  tab(d){UI.tab=+d.i;let n=UI.tab*10+1;for(let i=UI.tab*10+1;i<=UI.tab*10+10;i++)if(unlocked(i))n=i;UI.sel=n;renderScn();},
  stg(d){UI.sel=+d.n;renderScn();},
  scnback(){showScreen('bar');},
  sortie(){UI.dfm=true;renderScn();},
  diff(d){UI.diff=+d.i;renderScn();},
  dcancel(){UI.dfm=false;renderScn();},
  dgo(){UI.dfm=false;startStage(UI.sel,UI.diff);},
  dskip(){dlgEnd();},
  rbar(){showScreen('bar');},
  rscn(){UI.sel=Math.min(40,UI.rs.n);UI.tab=Math.floor((UI.sel-1)/10);showScreen('scn');},
  rnext(){const n=UI.rs.n+1;if(unlocked(n))UI.sel=n;else UI.sel=UI.rs.n;UI.tab=Math.floor((UI.sel-1)/10);showScreen('scn');},
  resume(){pauseGame(false);},
  retreat(){UI.paused=false;$('s_pz').hidden=true;$('pause').hidden=true;M=null;mobs.length=0;allies.length=0;showScreen('scn');},
  cheat(){
    const now=performance.now();if(now-UI.tt>3000)UI.tcnt=0;UI.tt=now;
    if(++UI.tcnt>=5){UI.tcnt=0;S.cheat=S.cheat?0:1;save();renderScn();}
  }
};
document.addEventListener('click',e=>{
  if(UI.mode==='dlg'&&!e.target.closest('[data-a]')){dlgTap();return;}
  const t=e.target.closest('[data-a]');if(!t||t.disabled)return;
  const f=ACT[t.dataset.a];if(f)f(t.dataset);
});
addEventListener('resize',fitUI);
addEventListener('keydown',e=>{
  if(UI.mode==='dlg'&&(e.key===' '||e.key==='Enter')){e.preventDefault();dlgTap();}
  if(e.key==='Escape'&&UI.mode==='battle')pauseGame(!UI.paused);
});
$('pause').addEventListener('click',()=>pauseGame(true));
