// Runtime logic checks with mocked browser/media devices, not a visual or audio audition.
const vm=require('node:vm'),assert=require('node:assert/strict');
const input=JSON.parse(require('node:fs').readFileSync(0,'utf8'));
for(const code of input.scripts)new vm.Script(code);
let now=5000,navCalls=[],saved=new Map(),createdSources=[],gains=[],handlers={};
const nodes=new Map();
class Element{
  constructor(id){this.id=id;this.hidden=false;this.isConnected=true;this.dataset={};this.events={};this.classList={remove(){}};this.textContent='';}
  addEventListener(type,fn){this.events[type]=fn;}
  focus(){document.activeElement=this;}
  getClientRects(){return [1];}
  set innerHTML(value){
    this.html=value;
    for(const m of value.matchAll(/<(input|button|output|span)\b([^>]*)>/g)){
      const attrs=m[2],id=/id="([^"]+)"/.exec(attrs)?.[1];if(!id)continue;
      const el=new Element(id);el.value=/value="([^"]*)"/.exec(attrs)?.[1]||'';
      el.checked=/\bchecked\b/.test(attrs);el.dataset.volume=/data-volume="([^"]+)"/.exec(attrs)?.[1];nodes.set(id,el);
    }
  }
  querySelectorAll(selector){return [...nodes.values()].filter(el=>selector==='[data-volume]'?el.dataset.volume:el.id.startsWith('volume_')||el.id.startsWith('settings_'));}
}
const document={hidden:false,activeElement:null,addEventListener(type,fn){handlers['doc:'+type]=fn;},getElementById(id){return nodes.get(id)||null;}};
for(const id of ['g_pz','s_pz','pause','cmdm','atk','spin','dash'])nodes.set(id,new Element(id));
document.activeElement=nodes.get('pause');
class Audio{
  constructor(){this.paused=true;this.volume=1;}
  pause(){this.paused=true;}
  play(){this.paused=false;return Promise.resolve();}
}
class AudioContext{
  constructor(){this.state='running';this.destination={};}
  createGain(){const g={gain:{value:0},connect(){}};gains.push(g);return g;}
  createBufferSource(){const s={connect(to){this.to=to;},start(){this.started=true;},stop(){this.stopped=true;if(this.onended)this.onended();}};createdSources.push(s);return s;}
  decodeAudioData(){return Promise.resolve({duration:1});}
  resume(){this.state='running';return Promise.resolve();}
}
const sandbox={console,URL,Audio,AudioContext,document,performance:{now:()=>now},location:{href:'https://game.test/index.html'},navigator:{vibrate:p=>(navCalls.push(p),true)},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},
  fetch:()=>Promise.resolve({ok:true,arrayBuffer:()=>Promise.resolve(new ArrayBuffer(0))}),
  addEventListener:(type,fn)=>{handlers[type]=fn;},setInterval(){},
  UI:{mode:'battle',paused:false},P:{x:0,y:0,hp:100,mode:'manual',face:'down',atk:null,atkT:0,skReq:[0,0]},M:{},ST:{wt:'sword'},
  A:{man:{sword:{front:{frames:10}},spinfan:{front:{frames:10}}}},ULT:{active:false},
  keys:{left:1},joy:{on:true,x:1,y:0},atkHeld:true,atkTap:.25,fx:[],pops:[],CH:10,mobs:[],allies:[],saveCount:0,
  $:id=>document.getElementById(id),dirKey:()=>['front'],faceTo:()=> 'down',
  manualAim:()=>({m:{x:100,y:0}}),moveEnt(){},rnd:(a,b)=>(a+b)/2,fitUI(){},
  save(){sandbox.saveCount++;},showScreen(mode){sandbox.UI.mode=mode;sandbox.UI.paused=false;},
  startAttack(w){sandbox.P.atk=w;sandbox.P.atkT=0;sandbox.P.hitDone=false;}
};
sandbox.window=sandbox;
const ctx=vm.createContext(sandbox),run=code=>vm.runInContext(code,ctx);
run(input.audio);run('globalThis.audio=CM_AUDIO;');run(input.combo);run('globalThis.cb=CB;globalThis.timing=COMBO_TIMING;');run(input.settings);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const drain=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
(async()=>{
  handlers.pointerdown();await drain();
  sandbox.audio.setVolume('sfx',0);
  assert.equal(sandbox.audio.getVolume('voice'),.86);
  assert.equal(sandbox.audio.playVoice('skill_sword_01',1),true);await drain();
  assert.ok(createdSources.some(s=>s.started));
  sandbox.audio.setVolume('voice',.31);close(gains[1].gain.value,.31);
  sandbox.audio.setVolume('bgm',.23);close(sandbox.audio.music.volume,.23);
  assert.equal(JSON.parse(saved.get('choseon_audio')).voice,.31);
  const voice=createdSources.find(s=>s.started);
  sandbox.audio.setVolume('voice',0);assert.equal(voice.stopped,true);
  sandbox.audio.setVolume('sfx',.72);close(gains[0].gain.value,.72);assert.equal(sandbox.audio.getVolume('voice'),0);
  sandbox.audio.setVibration(false);let count=navCalls.length;assert.equal(sandbox.audio.vibrate(180),false);assert.equal(navCalls.length,count);
  sandbox.audio.setVibration(true);assert.equal(sandbox.audio.vibrate(180),true);
  // Queue during recovery; do not accept multiple buffered presses or cut before impact.
  assert.equal(run("comboPress('light')"),true);run('comboTick(0,null,null)');
  close(run('comboAttackDuration()'),.54);
  now+=50;assert.equal(run("comboPress('light')"),true);assert.equal(run("comboPress('heavy')"),false);
  sandbox.P.atkT=8.1;sandbox.P.hitDone=true;run('comboTick(0,null,null)');assert.equal(sandbox.cb.seq,'L');
  sandbox.P.atkT=8.2;run('comboTick(0,null,null)');assert.equal(sandbox.cb.seq,'LL');
  now+=450;run("comboPress('heavy')");sandbox.P.atkT=8.3;sandbox.P.hitDone=true;run('comboTick(0,null,null)');
  assert.equal(sandbox.P.cbMove,'arc');assert.equal(sandbox.cb.activated,1);close(run('comboAttackDuration()'),.75);
  run('comboReset()');sandbox.P.atk='spinfan';sandbox.P.cbAction='heavy';sandbox.P.cbMove='spin';sandbox.P.atkT=0;
  assert.equal(run("comboPress('light')"),true);now+=1500;run('comboTick(0,null,null)');assert.ok(sandbox.cb.pending);
  now+=740;sandbox.P.atk=null;sandbox.P.cbAction=null;sandbox.P.cbMove=null;run('comboTick(0,null,null)');assert.equal(sandbox.cb.pending,null);
  // Opening the panel freezes mid-combo without deleting the current move/frame.
  sandbox.P.atk='sword';sandbox.P.atkT=4;sandbox.P.cbAction='heavy';sandbox.P.cbMove='slam';
  run('openSettings()');assert.equal(sandbox.UI.paused,true);assert.equal(sandbox.UI.settingsOpen,true);
  assert.equal(sandbox.P.cbMove,'slam');assert.equal(sandbox.P.atkT,4);assert.equal(sandbox.keys.left,0);assert.equal(sandbox.cb.pending,null);
  assert.equal(run("comboPress('light')"),false);assert.equal(sandbox.audio.music.paused,true);
  assert.ok(nodes.get('g_pz').html.includes('전투 재개'));assert.ok(nodes.get('g_pz').html.includes('나가기'));
  assert.equal([...nodes.values()].filter(n=>n.dataset.volume).length,3);
  const volume=nodes.get('volume_voice');volume.value='47';volume.events.input();close(sandbox.audio.getVolume('voice'),.47);
  const vibration=nodes.get('settings_vibration');vibration.checked=false;vibration.events.change({target:vibration});assert.equal(sandbox.audio.vibration,false);
  sandbox.CHOSEON_SYNC_CHECKING=true;assert.equal(run('closeSettings()'),false);assert.equal(sandbox.UI.paused,true);
  sandbox.CHOSEON_SYNC_CHECKING=false;run('closeSettings()');assert.equal(sandbox.UI.paused,false);assert.equal(sandbox.P.cbMove,'slam');assert.equal(sandbox.P.atkT,4);
  sandbox.UI.paused=true;run('openSettings();closeSettings()');assert.equal(sandbox.UI.paused,true);
  sandbox.UI.paused=false;sandbox.UI.mode='title';run('openSettings()');assert.ok(nodes.get('g_pz').html.includes('닫기'));assert.ok(!nodes.get('g_pz').html.includes('id="settings_exit"'));run('closeSettings()');
  sandbox.UI.mode='battle';run('openSettings();exitSettingsBattle()');assert.equal(sandbox.UI.mode,'scn');assert.equal(sandbox.saveCount,1);assert.equal(sandbox.UI.settingsOpen,false);
  // A late async voice decode must never start after opening Settings.
  sandbox.UI.mode='battle';sandbox.UI.paused=false;sandbox.audio.setVolume('voice',.7);
  sandbox.audio.playVoice('skill_sword_02',1);const old=createdSources.length;run('openSettings()');await drain();
  assert.equal(createdSources.length,old);
  console.log('PASS: slower attacks, LLH chain, impact gate, long-move input buffer, single pending slot');
  console.log('PASS: three independent gains, stored volume, voice mute, vibration preference, late-decode pause');
  console.log('PASS: settings auto-pause/resume, preserved attack, input reset, Drive pause guard, exit, title settings');
  console.log('PASS: full patched script syntax. Media/device and visual rendering are mocked, not tested on tablet.');
})().catch(e=>{console.error(e);process.exitCode=1;});
