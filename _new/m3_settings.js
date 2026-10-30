/* Settings owns its pause; Drive synchronization may independently own another. */
function settingsSyncBlocked(){return !!(window.CHOSEON_SYNC_CHECKING||window.CHOSEON_SYNC_CONFLICT||window.CHOSEON_BACKUP_RESTORING);}
function releaseSettingsInput(){
  for(const key in keys)keys[key]=0;
  joy.id=null;joy.on=false;joy.x=joy.y=0;atkHeld=false;atkTap=0;
  CB.pending=null;CB.seq='';CB.last=0;CB.dashUntil=0;CB.dash=null;
  if(P){P.spinReq=false;P.skReq=[0,0];}
  // Preserve P.atk/atkT/cbAction/cbMove: resume the exact frozen animation.
  for(const id of ['atk','spin','dash'])$(id).classList.remove('hold');
  $('cmdm').hidden=true;
}
function renderSettings(){
  const battle=UI.mode==='battle';
  const sliders=[['sfx','효과음'],['bgm','배경음'],['voice','음성']].map(([key,label])=>{
    const v=Math.round(CM_AUDIO.getVolume(key)*100);
    return `<label class="settings-volume" for="volume_${key}"><span>${label}</span><output id="value_${key}" for="volume_${key}">${v}%</output><input id="volume_${key}" type="range" min="0" max="100" step="1" value="${v}" data-volume="${key}"></label>`;
  }).join('');
  $('g_pz').innerHTML=`<section class="settings-card" role="dialog" aria-modal="true" aria-labelledby="settings_heading">
    <h2 id="settings_heading">설정</h2>
    <div class="settings-volumes">${sliders}</div>
    <label class="settings-vibration"><span>진동</span><span class="settings-switch"><input id="settings_vibration" type="checkbox" role="switch" ${CM_AUDIO.vibration?'checked':''}><span id="vibration_value">${CM_AUDIO.vibration?'켜기':'끄기'}</span></span></label>
    <div class="settings-actions"><button id="settings_resume" class="settings-btn primary">${battle?'전투 재개':'닫기'}</button>${battle?'<button id="settings_exit" class="settings-btn">나가기</button>':''}</div>
    <details class="settings-storage"><summary>저장 관리</summary><div><button class="settings-btn" data-a="drivebackup">Drive 파일 연결</button><button class="settings-btn" data-a="driverestore">지금 동기화</button></div></details>
  </section>`;
  $('g_pz').querySelectorAll('[data-volume]').forEach(input=>{
    input.addEventListener('input',()=>{
      CM_AUDIO.setVolume(input.dataset.volume,Number(input.value)/100);
      $('value_'+input.dataset.volume).textContent=input.value+'%';
    });
  });
  $('settings_vibration').addEventListener('change',e=>{
    CM_AUDIO.setVibration(e.target.checked);
    $('vibration_value').textContent=e.target.checked?'켜기':'끄기';
  });
  $('settings_resume').addEventListener('click',closeSettings);
  if(battle)$('settings_exit').addEventListener('click',exitSettingsBattle);
}
function openSettings(){
  if(UI.settingsOpen||settingsSyncBlocked()||!['battle','title','bar','scn','res'].includes(UI.mode))return false;
  UI.settingsWasPaused=!!UI.paused;UI.settingsFocus=document.activeElement;
  UI.settingsOpen=true;UI.paused=true;
  releaseSettingsInput();CM_AUDIO.pause();renderSettings();
  $('s_pz').hidden=false;fitUI();$('settings_resume').focus();
  return true;
}
function closeSettings(){
  if(!UI.settingsOpen||settingsSyncBlocked())return false;
  releaseSettingsInput();UI.settingsOpen=false;
  UI.paused=!!UI.settingsWasPaused;UI.settingsWasPaused=false;$('s_pz').hidden=true;
  const focus=UI.settingsFocus;UI.settingsFocus=null;
  if(focus&&focus.isConnected)focus.focus();
  CM_AUDIO.sync();return true;
}
function exitSettingsBattle(){
  if(!UI.settingsOpen||UI.mode!=='battle'||settingsSyncBlocked())return false;
  releaseSettingsInput();CM_AUDIO.pause();save();
  UI.settingsOpen=false;UI.settingsWasPaused=false;UI.settingsFocus=null;UI.paused=false;
  $('s_pz').hidden=true;$('pause').hidden=true;
  M=null;mobs.length=0;allies.length=0;comboReset();showScreen('scn');CM_AUDIO.sync();return true;
}
function pauseGame(on){return on?openSettings():closeSettings();}
document.addEventListener('keydown',e=>{
  if(!UI.settingsOpen||e.key!=='Tab')return;
  const list=[...$('g_pz').querySelectorAll('button,input,summary')].filter(el=>el.getClientRects().length&&!el.disabled);
  if(!list.length)return;
  const index=list.indexOf(document.activeElement);
  if(e.shiftKey&&index<=0){e.preventDefault();list[list.length-1].focus();}
  else if(!e.shiftKey&&(index===list.length-1||index<0)){e.preventDefault();list[0].focus();}
});
