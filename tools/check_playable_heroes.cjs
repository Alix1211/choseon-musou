'use strict';
// Real _new/m3_playable.js is executed with a controlled game harness.
// Source, roster checks, health ratios, equipment and animation reuse are tested.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('_new/m3_playable.js','utf8');
const ids=['zhenji','wenji','wangyi','xiaoqiao','daqiao','shangxiang','yinping','xingcai','yueying'];
const family={zhenji:'fan',wenji:'fan',wangyi:'sword',xiaoqiao:'fan',daqiao:'fan',shangxiang:'whip',yinping:'sword',xingcai:'sword',yueying:'sword'};
const hp={zhenji:[.9,1.1,1],wenji:[.8,1.2,1],wangyi:[1,1.15,1.05],xiaoqiao:[.8,1,1.25],daqiao:[1.25,.85,.95],shangxiang:[1,1.1,1.15],yinping:[1.1,1.2,1],xingcai:[1.2,1,.95],yueying:[.95,1.15,1.1]};
function app(){
 const elements={};
 function el(id){
   if(!elements[id])elements[id]={
     hidden:false,disabled:false,title:'',style:{},textContent:'',attrs:{},src:'',
     image:{src:''},events:{},addEventListener(type,fn){this.events[type]=fn;},
     setAttribute(k,v){this.attrs[k]=v;},
     querySelector(sel){assert.equal(sel,'img');return this.image;}
   };
   return elements[id];
 }
 const ctx={
   HN:{choseon:'초선',...Object.fromEntries(ids.map(i=>[i,i]))},
   S:{lv:24,roster:[],party:[],hl:Object.fromEntries(ids.map(i=>[i,16])),hx:{},xp:50},
   ST:{wt:'sword',atk:300,maxHp:1800,def:90,crit:15,cdr:10},
   P:{x:500,y:650,hp:1260,mode:'manual',state:'idle',face:'down',atk:null,sk:null,skHit:null,
     skCd:[9,6],spinCd:4,slowT:.3,kx:0,ky:0,atkT:0},
   M:{musou:true,trans:false,n:8,replay:false},UI:{mode:'battle',paused:false,settingsOpen:false},
   BUF:{atk:0,def:0},ULT:{active:false},FEM:new Set(ids),HPERS:hp,
   MT:{},allies:[],PS:.48,CH:82,A:{man:{sword:{front:{frames:8}},fan:{front:{frames:8}},whip:{front:{frames:8}},spinfan:{front:{frames:8}}}},
   SLOTS:[],lvm:(lvl,k)=>1+k*(lvl-1),heroLv:id=>Math.min(ctx.S.lv,ctx.S.hl[id]||1),fmt:n=>String(Math.round(n)),
   fmt1:n=>n.toFixed(1),expNeed:()=>100,stats:{},stat:{atk:()=>300,maxHp:()=>1800,def:()=>90},
   bagOpen:false,bagDirty:false,time:1,hurtFlash:0,saveCount:0,voiceStops:0,
   recalc(){},startStage(){},gainExp(v){ctx.baseXP=(ctx.baseXP||0)+v;},
   heroExp(id,v){(ctx.expHits||(ctx.expHits=[])).push([id,v]);},
   stepMove(vx,vy,sp,dt){ctx.lastMoveSpeed=sp;},
   allyStatOf(id){const p=ctx.HPERS[id]||[1,1,1];return {hp:1200*p[0],atk:100*p[1],sp:p[2]};},
   addAlly(id,x,y){const aStat=ctx.allyStatOf(id);const a={type:id,x,y,hp:aStat.hp,maxHp:aStat.hp,down:false,dead:false,playCooldown:null};ctx.allies.push(a);return a;},
   updateAllies(){},drawPlayer(){ctx.choseonDraws=(ctx.choseonDraws||0)+1;},
   openBag(){ctx.bagOpen=true;},closeBag(){ctx.bagOpen=false;},
   renderBag(){},openSettings(){return true;},refreshUI(){},
   drawMob(m){ctx.drawn=m;},drawShadow(){},drawAllyTag(){},
   dirKey(){return ['front',false];},stopInput(){},releaseSettingsInput(){},
   settingsSyncBlocked(){return false;},CM_AUDIO:{stopVoice(){ctx.voiceStops++;},pause(){},sync(){}},
   PLAY_DATA:ids,document:{addEventListener(){}},$:el,Math,
 };
 vm.createContext(ctx);
 vm.runInContext(source+'\nglobalThis.TEST={PLAY,PLAYABLE_HEROES,combatWeapon,playableLevel,playableStats,playableOrder,nextPlayable,switchPlayable};',ctx,{filename:'m3_playable.js'});
 ctx.save=function(){this.saveCount++;}; // used by switchPlayable through global
 ctx.save=()=>{ctx.saveCount++;};
 return ctx;
}
let assertions=0;
function check(cond,msg){assert(cond,msg);assertions++;}
for(const id of ids){
 const ctx=app(),t=ctx.TEST;
 ctx.S.party=[id];ctx.S.roster=[id];
 ctx.addAlly(id,560,650);
 const heroAlly=ctx.allies[0];heroAlly.hp=heroAlly.maxHp*.52;
 heroAlly.playCooldown={skCd:[12,3],spinCd:5,slowT:.25};
 check(t.PLAYABLE_HEROES[id].weapon===family[id],id+' approved family');
 check(t.PLAYABLE_HEROES[id].model===id,id+' original model');
 check(t.PLAYABLE_HEROES[id].portrait===id,id+' original portrait');
 check(t.nextPlayable()===id,id+' active roster switch availability');
 const hpBefore=ctx.P.hp/ctx.stat.maxHp(),cdBefore=ctx.P.skCd.slice();
 check(t.switchPlayable(id),id+' enters the player slot');
 check(t.PLAY.active===id&&t.combatWeapon()===family[id],id+' controls the expected weapon');
 ctx.stepMove(1,0,270,1/60);
 check(Math.abs(ctx.lastMoveSpeed-270*hp[id][2])<1e-8,id+' basic speed disposition');
 check(Math.abs(ctx.P.hp/ctx.stat.maxHp()-.52)<1e-7,id+' switched HP ratio is preserved');
 check(JSON.stringify(ctx.P.skCd)==='[12,3]'&&ctx.P.spinCd===5,id+' saved cooldown restores');
 check(ctx.allies.length===1&&ctx.allies[0].type==='choseon',id+' original character returns to AI without an extra slot');
 check(Math.abs(ctx.allies[0].hp/ctx.allies[0].maxHp-hpBefore)<1e-7,id+' outgoing HP not healed');
 check(t.nextPlayable()==='choseon',id+' reverse swap available');
 ctx.drawn=null;ctx.drawPlayer();
 check(ctx.drawn?.type===id&&ctx.drawn?.set==='h',id+' actual hero model draws');
 ctx.refreshUI();
 check(ctx.$('playerPortrait').image.src==='a/ui/pt/'+id+'.webp',id+' active portrait');
 check(ctx.$('allySwap').image.src==='a/ui/pt/choseon.webp',id+' next ally portrait');
 ctx.gainExp(20);
 check(ctx.expHits.some(([who])=>who===id),id+' controlled hero receives experience');
 ctx.ST.atk=420;ctx.ST.maxHp=2400; // re-equipping shares current gear stats
 check(t.playableStats().atk>t.playableStats(id).def,id+' current shared gear recalculated');
 ctx.P.skCd=[4,1];ctx.P.spinCd=2;ctx.P.hp=ctx.stat.maxHp()*.4;
 check(t.switchPlayable('choseon'),id+' switches back without making a new character');
 check(Math.abs(ctx.P.hp/ctx.stat.maxHp()-hpBefore)<1e-7,id+' Choseon health restored from her own slot');
 ctx.stepMove(1,0,270,1/60);
 check(Math.abs(ctx.lastMoveSpeed-270)<1e-8,id+' Choseon basic speed remains unchanged');
 check(JSON.stringify(ctx.P.skCd)===JSON.stringify(cdBefore),id+' Choseon cooldown restored');
 check(ctx.allies.length===1&&ctx.allies[0].type===id,id+' companion AI roster returns');
 check(JSON.stringify(ctx.allies[0].playCooldown.skCd)==='[4,1]',id+' companion cooldown saved');
 ctx.updateAllies(.3);
 check(ctx.allies[0].playCooldown.skCd[0]<4,id+' benched companion cooldown ticks');
 check(!t.switchPlayable(id+'notreal'),id+' invalid hero rejected');
 ctx.allies[0].down=true;
 check(!t.switchPlayable(id),id+' fallen member cannot be controlled');
 ctx.allies[0].down=false;ctx.UI.paused=true;
 check(!t.switchPlayable(id),id+' paused combat cannot swap');
 ctx.UI.paused=false;ctx.S.party=[];
 check(!t.switchPlayable(id),id+' unselected reserve cannot be controlled');
}
{
 const ctx=app(),t=ctx.TEST;
 ctx.S.roster=['zhenji','wenji'];ctx.S.party=['zhenji','wenji'];
 ctx.addAlly('zhenji',560,650);ctx.addAlly('wenji',620,680);
 check(t.nextPlayable()==='zhenji','two-party first next is Zhenji');
 check(t.switchPlayable('zhenji'),'two-party switch Zhenji');
 check(ctx.allies.length===2,'two-party count maintained after first switch');
 check(t.nextPlayable()==='wenji','next is Wenji');
 check(t.switchPlayable('wenji'),'two-party switch Wenji');
 check(ctx.allies.length===2,'two-party count maintained after second switch');
 check(t.nextPlayable()==='choseon','third next is Choseon');
 check(t.switchPlayable('choseon'),'two-party returns to Choseon');
 check(ctx.allies.length===2,'two-party count maintained after third switch');
}
const p2=fs.readFileSync('_new/p2playable.py','utf8');
assert(p2.includes("rd('m3_playable.js')"),'generated HTML must embed canonical playable code');
assert(p2.includes("rd('playable.css')"),'approved swap and portrait layout must persist');
assert(!source.includes("PLAY.active==='zhenji'"),'no hardcoded Zhenji-only switching');
assert(!source.includes("type:'zhenji',set:'h'"),'no hardcoded Zhenji-only player model');
console.log('PASS '+ids.length+' existing playable models, two-party rotation; '+assertions+' behavioral checks');
