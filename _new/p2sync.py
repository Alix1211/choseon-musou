"""Persist standard ARPG-style baseT Drive synchronization when regenerating index.html."""
head="<script>\n/* Gate local writes before game scripts load, same as ARPG save_sync.js. */\ntry{\n  window.CHOSEON_SYNC_CHECKING=!!(window.ChoseonNative&&\n    typeof ChoseonNative.webReady==='function'&&\n    ChoseonNative.hasBackupFile());\n}catch(e){window.CHOSEON_SYNC_CHECKING=false;}\nwindow.CHOSEON_SYNC_CONFLICT=false;\nwindow.CHOSEON_BACKUP_RESTORING=false;\nwindow.CHOSEON_SYNC_DIRTY=false;\n</script>\n"
if "window.CHOSEON_SYNC_CHECKING" not in src:
    rep("<title>삼국 초선 무쌍</title>","<title>삼국 초선 무쌍</title>\n"+head)
old="function save(){if(window.__noSave)return;try{localStorage.setItem(SAVEKEY,JSON.stringify(S));}catch(e){}}"
new="function save(){\n  if(window.__noSave||window.CHOSEON_SYNC_CHECKING||window.CHOSEON_SYNC_CONFLICT||window.CHOSEON_BACKUP_RESTORING){\n    window.CHOSEON_SYNC_DIRTY=true;return;\n  }\n  try{\n    const prevText=localStorage.getItem(SAVEKEY);\n    let previous=null;try{previous=prevText?JSON.parse(prevText):null;}catch(e){}\n    const comparable=v=>{const copy=Object.assign({},v||{});delete copy.t;return JSON.stringify(copy);};\n    if(comparable(S)!==comparable(previous)){\n      // This device's own save revision; never use it alone to defeat another device.\n      S.t=Math.max(Date.now(),(Number.isSafeInteger(S.t)?S.t:0)+1);\n    }\n    localStorage.setItem(SAVEKEY,JSON.stringify(S));\n    if(window.ChoseonCloud)window.ChoseonCloud.onGameSaved();\n  }catch(e){console.warn('게임 저장 실패',e);}\n}"
if old in src:rep(old,new)
# The generated image/mission layout may predate the live settings menu.
if "Drive에 백업" in src: src=src.replace("Drive에 백업","Drive 파일 연결")
if "Drive에서 복원" in src: src=src.replace("Drive에서 복원","지금 동기화")
if "Drive 백업은 파일 선택 창에서 저장 위치를 지정하세요." in src:
    src=src.replace("Drive 백업은 파일 선택 창에서 저장 위치를 지정하세요.","Drive 파일을 연결하면 앱 시작·복귀 때 비교 동기화합니다.")
if "window.ChoseonCloud={backup,restore,requestSync" not in src:
    src+="\n<script>\n"+rd('m3_sync.js')+"\n</script>\n"
