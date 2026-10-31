/* 31~39: 보스·기믹 9개 + 33·37 필수 출전과 저장 편성 보존 스모크 테스트. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const context={NPC_STAGE_BOSSES:{},WEI_RULES:{},M:null,mobs:[],shots:[],P:{x:0,y:0,slowT:0,hp:300},UI:{mode:'battle',paused:false},
  TS:48,CH:100,YR:.78,time:0,stat:{maxHp:()=>500},showBanner:()=>{},wakeColony:()=>{},
  chaseMove:(m,tg)=>{m.x=tg.x;m.y=tg.y;},hurtPlayer:()=>{},propSprite:()=>{},weiMark:()=>{},
  wuFlames:()=>{},cx:{save(){},restore(){},fillRect(){}},
  weiNear:(a,b,r)=>Math.hypot(a.x-b.x,(a.y-b.y)/.78)<=r,
  weiPoints:(m,n)=>Array.from({length:n},(_,i)=>{
    const p={x:160+i*310,y:100},col={mobs:[]};col.lead={...p,sp:110,dead:false,down:false,hp:100,col};col.mobs=[col.lead];return {...p,col};
  }),
  nearWalk:(g,x,y)=>[x,y],mkCol:(x,y,o)=>({mobs:Array.from({length:o.n},()=>({x:x*48,y:y*48,dead:false,down:false})),lead:{x:x*48,y:y*48,dead:false}}),
  weiExit:(msg)=>{context.M.mis='exit';context.M.exited=msg;},wuFail:(msg)=>{throw Error(msg)},
  faceTo:()=>0
};
vm.createContext(context);
for(const src of ['m3_lords31_35.js','m3_lords36_39.js'])vm.runInContext(fs.readFileSync('_new/'+src,'utf8'),context);
for(let n=31;n<=39;n++){
  const d=context.NPC_STAGE_BOSSES[n],r=context.WEI_RULES[n];
  assert.ok(d&&d.skills.length>=2,'NPC 보스 '+n);
  assert.ok(r&&r.init&&r.tick&&r.draw&&r.target&&r.text,'규칙 '+n);
  assert.equal(!!d.main,n===35||n===39,'기마 간부 '+n);
  const m={n,mis:'wei'+n,set:'r',D:{g:Array.from({length:80},()=>new Array(80).fill(1))}};
  context.M=m;context.P.x=0;context.P.y=0;
  r.init(m);
  if(n===31){for(const p of m.wei.stock){context.P.x=p.x;context.P.y=p.y;for(let i=0;i<3;i++)r.hit(60);}r.tick(.2);}
  if(n===32){m.wei.runner.dead=true;r.tick(.2);}
  if(n===33){context.P.x=m.wei.depots[0].x;context.P.y=m.wei.depots[0].y;r.tick(.1);
    for(let i=0;i<3;i++){for(const q of m.wei.enemies)q.dead=true;r.tick(.1);if(i<2){r.tick(3.2);}}
  }
  if(n===34){assert.equal(r.canHit(m.wei.altars[0].col.lead),false);for(const p of m.wei.altars){context.P.x=p.x;context.P.y=p.y;for(let i=0;i<4;i++)r.hit(40);}r.tick(.1);}
  if(n===35){for(const p of m.wei.points){context.P.x=p.x;context.P.y=p.y;r.tick(1.3);}}
  if(n===36){for(const p of m.wei.rescues){context.P.x=p.x;context.P.y=p.y;r.tick(1.3);}context.P.x=m.wei.lever.x;context.P.y=m.wei.lever.y;r.tick(1.5);}
  if(n===37){for(const p of m.wei.towers){p.leader.dead=true;context.P.x=p.x;context.P.y=p.y;r.tick(1.4);}
    assert.equal(m.wei.phase,'ram');context.P.x=m.wei.gate.x;context.P.y=m.wei.gate.y;
    m.wei.ram.x=m.wei.gate.x;m.wei.ram.y=m.wei.gate.y;r.tick(2.4);}
  if(n===38){for(const p of m.wei.traps){context.P.x=p.x;context.P.y=p.y;for(let i=0;i<4;i++)r.hit(40);}r.tick(.1);}
  if(n===39){for(const q of m.wei.posts[0].col.mobs)q.dead=true;r.tick(.1);
    context.P.x=m.wei.posts[1].x;context.P.y=m.wei.posts[1].y;r.tick(1.4);
    context.P.x=m.wei.posts[2].x;context.P.y=m.wei.posts[2].y;for(let i=0;i<5;i++)r.hit(40);}
  assert.equal(m.mis,'exit','31~39 목표 클리어 '+n);
  r.text();r.target();
}
assert.match(html,/31:'lord31'.*39:'lord39'/);
assert.match(html,/npcBossType:n<=39&&d\?d.type:null/);
assert.match(html,/const LORD_FORCED_HERO=\{33:'zhenji',37:'yinping'\}/);
assert.ok(!/40:'lord40'/.test(html),'40판 유지');

const f={S:{roster:['zhenji','yinping','wenji'],party:['wenji']},M:null,
  UI:{mode:'battle',paused:false},P:{mode:'manual',hp:100},PLAY:{active:'choseon'},HN:{zhenji:'견희',yinping:'관은병'},
  showBanner:()=>{},save:()=>{},startStage(n){f.partyAtStart=f.S.party.slice();f.M={n};return true;},
  switchPlayable(id){if(!f.S.party.includes(id))return false;f.PLAY.active=id;return true;},
  nextPlayable:()=>null,updatePlayer:()=>{},
};
vm.createContext(f);
vm.runInContext(fs.readFileSync('_new/m3_lord_forced.js','utf8'),f);
for(const [stage,id]of [[33,'zhenji'],[37,'yinping']]){
  f.PLAY.active='choseon';f.startStage(stage,1);
  assert.equal(f.partyAtStart[0],id,'필수 동료 실제 배치');
  assert.equal(f.S.party[0],'wenji','기존 동료 편성 보존');
  assert.equal(f.switchPlayable('choseon'),false,'강제 출전 중 변경 금지');
  f.updatePlayer(.1);assert.equal(f.PLAY.active,id,'필수 영웅 자동 조종');
  assert.equal(f.S.party[0],'wenji','교체 후에도 편성 보존');
}
console.log('군웅 31~39 규칙·기마 NPC25/26·견희/관은병 필수 출전 통과');
