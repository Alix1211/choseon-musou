/* 사용자 제공 BGM 3곡 / 골든퀘스트 파일 효과음. 첫 입력 뒤에만 재생한다. */
const CM_AUDIO=(()=>{
  const root=new URL('./a/audio/',location.href).href;
  const voiceRoot=new URL('./a/voice/',location.href).href;
  const defaults={bgm:.38,sfx:.50,voice:.86,vibration:true};
  const settings={...defaults};
  try{
    const saved=JSON.parse(localStorage.getItem('choseon_audio')||'{}')||{};
    for(const key of ['bgm','sfx','voice']){
      const v=saved[key];
      if(typeof v==='boolean')settings[key]=v?defaults[key]:0;
      else if(typeof v==='number'&&Number.isFinite(v))settings[key]=Math.max(0,Math.min(1,v));
    }
    if(typeof saved.vibration==='boolean')settings.vibration=saved.vibration;
  }catch(e){}
  let unlocked=false,ctx=null,gain=null,voiceGain=null,track='',playing=0,sfxToken=0;
  const activeSfx=new Set();
  const buffers={},loading={},last={};
  const voiceCache={},voiceLoading={};
  let voiceActive=null,voicePriority=0,voiceDeadline=0,voicePending=false,voiceToken=0,lastBattleVoice=0;
  // Voice priority: 1=skill name (disposable), 2=battle bark, 3=story/dialogue.
  // Skills never queue, never interrupt and yield instantly to higher-priority voices.
  const names=['swing','thrust','slash','spin','hit','punch','explosion','heal','teleport','staff'];
  const music=new Audio();music.loop=true;music.preload='none';music.volume=settings.bgm;
  const persist=()=>{try{localStorage.setItem('choseon_audio',JSON.stringify(settings));}catch(e){}};
  function stopSfx(){
    ++sfxToken;
    for(const s of activeSfx){try{s.stop();}catch(e){}}
    activeSfx.clear();
  }
  function pause(){++playing;music.pause();stopSfx();stopVoice();}
  function setVolume(key,value){
    if(!['bgm','sfx','voice'].includes(key)||!Number.isFinite(Number(value)))return;
    settings[key]=Math.max(0,Math.min(1,Number(value)));
    music.volume=settings.bgm;
    if(gain)gain.gain.value=settings.sfx;
    if(voiceGain)voiceGain.gain.value=settings.voice;
    if(!settings.sfx)stopSfx();
    if(!settings.voice)stopVoice();
    persist();sync();
  }
  function vibrate(pattern){
    if(!settings.vibration||document.hidden||UI.settingsOpen)return false;
    try{return navigator.vibrate?!!navigator.vibrate(pattern):false;}catch(e){return false;}
  }
  function setVibration(on){
    settings.vibration=!!on;persist();
    if(!on){try{if(navigator.vibrate)navigator.vibrate(0);}catch(e){}}
  }
  function load(name){
    if(!ctx)return Promise.resolve(null);
    return loading[name]||(loading[name]=fetch(root+'sfx/'+name+'.ogg').then(r=>{if(!r.ok)throw Error(r.status);return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).then(b=>buffers[name]=b).catch(()=>null));
  }
  function sync(){
    const battle=UI.mode==='battle'||UI.mode==='dlg'||UI.mode==='cut';
    const next=UI.mode==='boot'?'':UI.mode==='title'?'title':battle?'battle':'camp';
    if(next!==track){track=next;playing++;music.pause();if(next)music.src=root+'bgm/'+next+'.mp3';}
    if(document.hidden||UI.settingsOpen||(UI.paused&&UI.mode!=='dlg')){pause();return;}
    if(!unlocked||!settings.bgm||UI.paused||!track){music.pause();return;}
    if(music.paused){const token=++playing;const p=music.play();if(p)p.then(()=>{if(token!==playing||document.hidden||UI.paused||!settings.bgm)music.pause();}).catch(()=>{});}
  }
  function unlock(){
    unlocked=true;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!ctx&&AC){ctx=new AC();gain=ctx.createGain();gain.gain.value=settings.sfx;gain.connect(ctx.destination);voiceGain=ctx.createGain();voiceGain.gain.value=settings.voice;voiceGain.connect(ctx.destination);for(const n of names)load(n);}
    if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});
    sync();
  }
  function play(name){
    if(!unlocked||!settings.sfx||document.hidden||UI.paused||!ctx||ctx.state!=='running')return;
    const now=performance.now();if(now-(last[name]||-1e9)<80)return;last[name]=now;
    const token=sfxToken;
    const fire=b=>{if(token!==sfxToken||!b||!settings.sfx||document.hidden||UI.paused||ctx.state!=='running')return;const s=ctx.createBufferSource();s.buffer=b;s.connect(gain);activeSfx.add(s);s.onended=()=>activeSfx.delete(s);s.start();};
    if(buffers[name])fire(buffers[name]);else load(name).then(fire);
  }

  function stopVoice(){
    ++voiceToken;
    if(voiceActive){try{voiceActive.stop();}catch(e){}voiceActive=null;}
    voicePriority=0;voiceDeadline=0;voicePending=false;
  }
  function voiceFile(id){
    if(!/^(skill|battle|stage|map|event)_[a-zA-Z0-9_]+$/.test(id))return null;
    const folder=id.startsWith('skill_')?'skills':id.startsWith('battle_')?'battle':id.startsWith('stage_')?'stage':id.startsWith('map_')?'map':'event';
    return voiceRoot+folder+'/'+id+'.mp3';
  }
  // Old APKs have live HTML but may be missing the bundled 107 voice files.
  // Fetch locally first, then from live assets; audio remains optional at boot.
  async function loadVoice(id,url){
    const remote='https://raw.githubusercontent.com/Alix1211/choseon-musou/mobile-live/a/voice/'+url.slice(voiceRoot.length);
    for(const source of [url,remote]){
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),source===url?4000:9000);
      try{
        const response=await fetch(source,{signal:controller.signal});
        if(!response.ok)continue;
        return await ctx.decodeAudioData(await response.arrayBuffer());
      }catch(e){}finally{clearTimeout(timer);}
    }
    return null;
  }
  function playVoice(id,priority=1){
    if(!unlocked||!settings.voice||document.hidden||!ctx||ctx.state!=='running')return false;
    if(UI.settingsOpen||(UI.paused&&UI.mode!=='dlg'))return false;
    const url=voiceFile(id);if(!url)return false;
    // Speak only one in four eligible skill/combat triggers, never throttle dialogue.
    if((priority===1||priority===2)&&Math.random()>=.25)return false;
    const now=performance.now(),busy=voicePending||!!voiceActive||now<voiceDeadline;
    // Skill voice is the very last priority: skip it whenever any other
    // dialogue, combat bark or skill is playing/being loaded. No catch-up.
    if(priority===1&&busy)return false;
    // A battle bark may replace a skill mid-word, but not another bark or
    // story voice. Keep the existing anti-spam interval for barks.
    if(priority===2&&(now-lastBattleVoice<3500||(busy&&voicePriority>=2)))return false;
    if(busy&&priority<voicePriority)return false;
    if(priority===2)lastBattleVoice=now;
    stopVoice();
    const token=voiceToken;
    voicePriority=priority;voicePending=true;
    const clearPending=()=>{
      if(token===voiceToken&&!voiceActive){
        voicePending=false;voicePriority=0;voiceDeadline=0;
      }
    };
    function start(b){
      if(token!==voiceToken)return;
      if(!b||!settings.voice||document.hidden||UI.settingsOpen||(UI.paused&&UI.mode!=='dlg')||!ctx||ctx.state!=='running'){
        clearPending();return;
      }
      const src=ctx.createBufferSource();src.buffer=b;
      const vol=ctx.createGain();vol.gain.value=priority===3?.77/.86:1;
      src.connect(vol);vol.connect(voiceGain);
      src.onended=()=>{if(voiceActive===src){
        voiceActive=null;voicePending=false;voicePriority=0;voiceDeadline=0;
      }};
      voiceActive=src;voicePending=false;
      voiceDeadline=performance.now()+b.duration*1000;
      try{src.start();}catch(e){voiceActive=null;clearPending();}
    }
    if(voiceCache[id])start(voiceCache[id]);
    else{
      const load=voiceLoading[id]||(voiceLoading[id]=loadVoice(id,url).then(b=>{
        if(b)voiceCache[id]=b;
        return b;
      }));
      load.then(start,clearPending).finally(()=>{
        // An offline miss must not prevent retrying after connectivity returns.
        if(voiceLoading[id]===load)delete voiceLoading[id];
      });
    }
    return true;
  }
  addEventListener('pointerdown',unlock,{capture:true});addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else sync();});
  setInterval(sync,200);
  return {play,playVoice,stopVoice,sync,pause,setVolume,setVibration,vibrate,
    getVolume:key=>settings[key],get vibration(){return settings.vibration;},
    get track(){return track;},get music(){return music;},get loaded(){return Object.keys(buffers);}};
})();
