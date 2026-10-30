/* Choseon: ARPG-standard Drive SAF sync; always compare baseT, never timestamps. */
(function(){
  'use strict';
  const KEY='choseon_musou_v2', AUDIO='choseon_audio';
  const bridge=window.ChoseonNative;
  const app=!!(bridge&&typeof bridge.webReady==='function'&&typeof bridge.syncBackup==='function');
  let busy=false,pendingSave=null,guardTimer=null,syncPausedGame=false;
  const flag=(k,v)=>{window[k]=v;};
  flag('CHOSEON_SYNC_DIRTY',false);
  const existingGate=!!(bridge&&bridge.hasBackupFile&&bridge.hasBackupFile());
  flag('CHOSEON_SYNC_CHECKING',existingGate&&app);
  flag('CHOSEON_SYNC_CONFLICT',false);
  flag('CHOSEON_BACKUP_RESTORING',false);
  let syncBox=null;
  function note(message){
    let out=document.getElementById('cloudStatus');
    if(!out){
      out=document.createElement('div');out.id='cloudStatus';
      out.style.cssText='position:fixed;left:50%;bottom:20%;transform:translateX(-50%);max-width:90%;z-index:100001;padding:12px 23px;border:1px solid #f3d48b;border-radius:12px;background:#21182c;color:#fff4d5;font:bold 18px system-ui;text-align:center;pointer-events:none';
      document.body.appendChild(out);
    }
    out.textContent=String(message);out.hidden=false;
    clearTimeout(note.timer);note.timer=setTimeout(()=>{out.hidden=true;},4300);
  }
  function overlay(text){
    let box=document.getElementById('cloudSyncCover');
    if(!box){
      box=document.createElement('div');box.id='cloudSyncCover';
      box.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(10,7,20,.72);color:#fff6dd;font:700 23px system-ui;text-align:center;pointer-events:auto';
      document.body.appendChild(box);
    }
    box.textContent=text;box.hidden=false;return box;
  }
  const hideOverlay=()=>{const box=document.getElementById('cloudSyncCover');if(box)box.hidden=true;};
  async function defaultCut(){
    if(typeof cutDB!=='function')return null;
    const db=await cutDB();
    const obj=await new Promise((ok,fail)=>{
      const req=db.transaction('k','readonly').objectStore('k').get('def');
      req.onsuccess=()=>ok(req.result||null);req.onerror=()=>fail(req.error);
    });
    if(!(obj instanceof Blob))return null;
    if(obj.size>8*1024*1024)throw Error('기본 일러스트가 8MB를 초과합니다');
    return await new Promise((ok,fail)=>{
      const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=()=>fail(reader.error);
      reader.readAsDataURL(obj);
    });
  }
  function validDoc(text){
    const obj=typeof text==='string'?JSON.parse(text):text;
    if(!obj||obj.format!=='choseon-musou-drive-backup'||obj.schema!==1||typeof obj.game!=='string')
      throw Error('초선무쌍 저장 파일이 아닙니다');
    const s=JSON.parse(obj.game);
    if(!s||!s.eq||!s.cl||!Number.isInteger(s.lv)||s.lv<1||s.lv>70||
       !Number.isInteger(s.stage)||s.stage<1||(s.t!==undefined&&(!Number.isSafeInteger(s.t)||s.t<0)))
      throw Error('진행 데이터가 손상됐습니다');
    if(obj.defaultCut!==null&&obj.defaultCut!==undefined&&
       (typeof obj.defaultCut!=='string'||!obj.defaultCut.startsWith('data:image/')||obj.defaultCut.length>13*1024*1024))
      throw Error('기본 일러스트 데이터가 유효하지 않습니다');
    return obj;
  }
  async function snapshot(){
    // Do not call save(): snapshots must not advance the stored save timestamp.
    const game=localStorage.getItem(KEY);
    if(!game)return null;
    const obj={format:'choseon-musou-drive-backup',schema:1,
      createdAt:new Date().toISOString(),game,
      audio:localStorage.getItem(AUDIO)||null,defaultCut:await defaultCut()};
    validDoc(obj);
    const text=JSON.stringify(obj);
    if(text.length>12*1024*1024)throw Error('저장 파일이 너무 큽니다');
    return text;
  }
  function onSyncStart(){
    if(window.CHOSEON_SYNC_CONFLICT||window.CHOSEON_BACKUP_RESTORING)return;
    flag('CHOSEON_SYNC_CHECKING',true);busy=true;
    overlay('Google Drive 진행을 확인하고 있습니다…');
    // Freeze running battles during reconciliation to keep a coherent snapshot.
    try{
      if(typeof UI!=='undefined'&&UI.mode==='battle'&&!UI.paused){
        UI.paused=true;syncPausedGame=true;
      }
    }catch(e){}
    clearTimeout(guardTimer);
    // ARPG: display gate 20s, longer than the native 15s read wait.
    guardTimer=setTimeout(()=>onSyncDone(),20000);
  }
  function onSyncDone(){
    if(window.CHOSEON_SYNC_CONFLICT||window.CHOSEON_BACKUP_RESTORING)return;
    clearTimeout(guardTimer);busy=false;
    flag('CHOSEON_SYNC_CHECKING',false);hideOverlay();
    if(syncPausedGame){syncPausedGame=false;try{if(typeof UI!=='undefined')UI.paused=false;}catch(e){}}
    if(window.CHOSEON_SYNC_DIRTY){
      flag('CHOSEON_SYNC_DIRTY',false);
      // Persist changes that happened during sync once; never lose them.
      try{if(typeof save==='function')save();}catch(e){note('저장 재시도 필요');}
    }
  }
  function info(text){
    try{
      const s=JSON.parse(validDoc(text).game);
      const v=['레벨 '+s.lv,'스테이지 '+s.stage,'금화 '+Number(s.gold||0).toLocaleString('ko-KR')];
      if(s.t)v.push(new Date(s.t).toLocaleString('ko-KR'));
      return v.join(' · ');
    }catch(e){return '알 수 없음';}
  }
  function onConflict(remote,local){
    clearTimeout(guardTimer);busy=true;
    flag('CHOSEON_SYNC_CHECKING',true);
    flag('CHOSEON_SYNC_CONFLICT',true);
    hideOverlay();
    let box=document.getElementById('cloudSyncConflict');
    if(!box){
      box=document.createElement('div');box.id='cloudSyncConflict';
      box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
      box.style.cssText='position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(15,10,22,.86);color:#fff4dd;font:18px/1.5 system-ui';
      document.body.appendChild(box);
    }
    box.innerHTML='<div style="background:#282033;border:2px solid #d2af6b;border-radius:14px;padding:24px;max-width:min(94vw,740px);width:92%;box-shadow:0 8px 30px #000">'+
      '<div style="font-weight:900;font-size:25px;margin-bottom:10px">두 기기에서 진행이 변경됐습니다</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">'+
      '<div style="border:1px solid #8a719e;padding:10px;border-radius:8px">Drive 파일<br><b id="csFile"></b></div>'+
      '<div style="border:1px solid #8a719e;padding:10px;border-radius:8px">이 기기<br><b id="csLocal"></b></div></div>'+
      '<div style="font-size:14px;margin-bottom:16px">고르지 않은 쪽 진행은 사라집니다. 고르기 전에는 게임 저장과 파일 쓰기가 중단됩니다.</div>'+
      '<div style="display:flex;gap:12px;flex-wrap:wrap"><button id="csUseFile" type="button" style="flex:1;min-height:64px;background:#d7b771;color:#231826;border:0;border-radius:8px;font:700 17px system-ui">드라이브 진행으로 이어서 하기</button>'+
      '<button id="csUseLocal" type="button" style="flex:1;min-height:64px;background:#c69ec9;color:#231826;border:0;border-radius:8px;font:700 17px system-ui">이 기기 진행으로 파일 덮어쓰기</button></div></div>';
    box.querySelector('#csFile').textContent=info(remote);
    box.querySelector('#csLocal').textContent=info(local);
    box.hidden=false;
    const choose=useFile=>{
      const msg=useFile?'Drive 파일의 진행으로 바꿉니다. 이 기기의 현재 진행은 사라집니다. 계속할까요?':
                      '이 기기의 진행으로 Drive 파일을 덮어씁니다. 파일에 있던 진행은 사라집니다. 계속할까요?';
      if(!window.confirm(msg))return; // Cancel means no action, leave gate in place.
      const buttons=box.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);
      if(app)try{bridge.resolveConflict(useFile);}catch(e){buttons.forEach(b=>b.disabled=false);}
    };
    box.querySelector('#csUseFile').onclick=()=>choose(true);
    box.querySelector('#csUseLocal').onclick=()=>choose(false);
  }
  async function onApplied(text){
    flag('CHOSEON_BACKUP_RESTORING',true);
    flag('CHOSEON_SYNC_CHECKING',true);
    const box=document.getElementById('cloudSyncConflict');if(box)box.remove();
    overlay('Drive 진행을 기기에 적용하고 있습니다…');
    window.__noSave=1;
    try{
      const obj=validDoc(text);
      // Apply original JSON string without touching its game.t timestamp.
      if(obj.defaultCut){
        if(typeof cutDB!=='function')throw Error('기본 일러스트 저장소를 사용할 수 없습니다');
        const blob=await (await fetch(obj.defaultCut)).blob();
        const db=await cutDB();
        await new Promise((ok,fail)=>{
          const tx=db.transaction('k','readwrite');tx.objectStore('k').put(blob,'def');
          tx.oncomplete=ok;tx.onerror=()=>fail(tx.error);
        });
      }
      const old=localStorage.getItem(KEY);
      if(old)localStorage.setItem('choseon_backup_before_drive_restore',old);
      localStorage.setItem(KEY,obj.game);
      if(typeof obj.audio==='string')localStorage.setItem(AUDIO,obj.audio);
      location.reload();
    }catch(e){
      window.__noSave=0;
      flag('CHOSEON_BACKUP_RESTORING',false);
      note('동기화 적용 실패: '+e.message+' · 기존 진행은 유지됩니다');
      if(app&&bridge.cancelApply)bridge.cancelApply();
    }
  }
  function onNativeStatus(message){if(message)note(message);}
  async function sendLocal(kind){
    if(!app)return;
    try{
      const local=await snapshot();
      if(kind==='ready')bridge.webReady(local||'');
      else if(kind==='sync')bridge.syncBackup(local||'');
      else if(local&&!window.CHOSEON_SYNC_CHECKING&&!window.CHOSEON_SYNC_CONFLICT&&!window.CHOSEON_BACKUP_RESTORING)
        bridge.saveLocal(local);
      else if(kind==='save')flag('CHOSEON_SYNC_DIRTY',true);
    }catch(e){
      note('기기 저장 확인 실패: '+e.message);
      // Existing local saves must NEVER be treated as missing when their
      // illustration/JSON snapshot fails: this would wrongly auto-apply Drive.
      if(kind==='ready'&&!localStorage.getItem(KEY))bridge.webReady('');
      else if(kind==='ready')overlay('기기 저장 확인에 실패했습니다. 기존 진행을 보호하고 있습니다.');
    }
  }
  function requestSync(gate){
    if(!app||window.CHOSEON_SYNC_CONFLICT||window.CHOSEON_BACKUP_RESTORING)return;
    if(!bridge.hasBackupFile())return;
    if(gate)onSyncStart();
    sendLocal('sync');
  }
  function onGameSaved(){
    if(!app||!bridge.hasBackupFile())return;
    if(window.CHOSEON_SYNC_CHECKING||window.CHOSEON_SYNC_CONFLICT||window.CHOSEON_BACKUP_RESTORING){
      flag('CHOSEON_SYNC_DIRTY',true);return;
    }
    clearTimeout(pendingSave);
    pendingSave=setTimeout(()=>sendLocal('save'),1500);
  }
  function flushSave(){
    if(window.CHOSEON_SYNC_CHECKING||window.CHOSEON_SYNC_CONFLICT||window.CHOSEON_BACKUP_RESTORING)return;
    try{if(typeof save==='function')save();}catch(e){}
    if(app){clearTimeout(pendingSave);sendLocal('save');}
  }
  async function backup(){
    if(app){bridge.pickBackup();return;}
    if(bridge){note('동기화 지원 APK가 필요합니다. 기존 앱을 삭제하지 말고 새 APK를 설치하세요.');return;}
    try{
      const data=await snapshot();if(!data)throw Error('아직 저장된 게임이 없습니다');
      const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download='Choseon-Musou-Save.json';a.click();
      setTimeout(()=>URL.revokeObjectURL(url),12000);
      note('저장 파일을 내려받았습니다.');
    }catch(e){note('내보내기 실패: '+e.message);}
  }
  function restore(){
    if(app){requestSync(true);return;}
    if(bridge){note('동기화 지원 APK를 설치해 주세요.');return;}
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
    input.onchange=()=>{
      if(!input.files||!input.files.length)return;
      input.files[0].text().then(text=>{
        const data=validDoc(text);
        if(!window.confirm('선택한 파일로 현재 진행을 교체하시겠습니까?'))return;
        onApplied(JSON.stringify(data));
      }).catch(e=>note('저장 파일 오류: '+e.message));
    };
    input.click();
  }
  window.ChoseonCloud={backup,restore,requestSync,flushSave,onGameSaved,onSyncStart,onSyncDone,
    onConflict,onApplied,onNativeStatus,validDoc,
    get mode(){return app?'Android SAF · baseT 동기화':'웹 파일 가져오기/내보내기';}};
  addEventListener('online',()=>{if(app)requestSync(true);});
  // ARPG: initial read (not blind write). A linked-file gate is active at boot.
  Promise.resolve().then(()=>sendLocal('ready'));
})();
