/* 사용자 제공 BGM 3곡 / 골든퀘스트 파일 효과음. 첫 입력 뒤에만 재생한다. */
const CM_AUDIO=(()=>{
  const root=new URL('./a/audio/',location.href).href;
  let settings={bgm:true,sfx:true};
  try{const s=JSON.parse(localStorage.getItem('choseon_audio')||'{}');for(const k of ['bgm','sfx'])if(typeof s[k]==='boolean')settings[k]=s[k];}catch(e){}
  let unlocked=false,ctx=null,gain=null,track='',playing=0;
  const buffers={},loading={},last={};
  const names=['swing','thrust','slash','spin','hit','punch','explosion','heal','teleport','staff'];
  const music=new Audio();music.loop=true;music.preload='none';music.volume=.38;
  function load(name){
    if(!ctx)return Promise.resolve(null);
    return loading[name]||(loading[name]=fetch(root+'sfx/'+name+'.ogg').then(r=>{if(!r.ok)throw Error(r.status);return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).then(b=>buffers[name]=b).catch(()=>null));
  }
  function sync(){
    const battle=UI.mode==='battle'||UI.mode==='dlg'||UI.mode==='cut';
    const next=UI.mode==='boot'?'':UI.mode==='title'?'title':battle?'battle':'camp';
    if(next!==track){track=next;playing++;music.pause();if(next)music.src=root+'bgm/'+next+'.mp3';}
    if(!unlocked||!settings.bgm||document.hidden||UI.paused||!track){music.pause();return;}
    if(music.paused){const token=++playing;const p=music.play();if(p)p.then(()=>{if(token!==playing||document.hidden||UI.paused||!settings.bgm)music.pause();}).catch(()=>{});}
  }
  function unlock(){
    unlocked=true;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!ctx&&AC){ctx=new AC();gain=ctx.createGain();gain.gain.value=.5;gain.connect(ctx.destination);for(const n of names)load(n);}
    if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});
    sync();
  }
  function play(name){
    if(!unlocked||!settings.sfx||document.hidden||UI.paused||!ctx||ctx.state!=='running')return;
    const now=performance.now();if(now-(last[name]||-1e9)<80)return;last[name]=now;
    const fire=b=>{if(!b||!settings.sfx||document.hidden||UI.paused||ctx.state!=='running')return;const s=ctx.createBufferSource();s.buffer=b;s.connect(gain);s.start();};
    if(buffers[name])fire(buffers[name]);else load(name).then(fire);
  }
  const controls=document.createElement('div');controls.id='soundControls';
  controls.style.cssText='position:fixed;right:10px;bottom:10px;z-index:9998;display:flex;gap:6px';
  for(const [key,label] of [['bgm','배경음'],['sfx','효과음']]){
    const b=document.createElement('button');b.id='sound_'+key;b.style.cssText='font:700 14px system-ui;padding:8px;color:#fff4d0;background:#281d32;border:1px solid #d5ae59;border-radius:6px';
    const paint=()=>{b.textContent=label+' '+(settings[key]?'켬':'끔');b.setAttribute('aria-pressed',String(settings[key]));};
    b.onclick=()=>{settings[key]=!settings[key];try{localStorage.setItem('choseon_audio',JSON.stringify(settings));}catch(e){}paint();sync();};paint();controls.appendChild(b);
  }
  document.body.appendChild(controls);
  addEventListener('pointerdown',unlock,{capture:true});addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){playing++;music.pause();}else sync();});
  setInterval(()=>{sync();controls.style.display=UI.mode==='boot'||(UI.mode==='battle'&&!UI.paused)||UI.mode==='dlg'||UI.mode==='cut'?'none':'flex';},200);
  return {play,sync,get track(){return track;},get music(){return music;},get loaded(){return Object.keys(buffers);}};
})();
