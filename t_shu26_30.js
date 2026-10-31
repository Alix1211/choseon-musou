/* 촉 26~30판 다섯 규칙/마지막 NPC 보스의 진행 상태를 한 번에 검사한다. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const index=fs.readFileSync('index.html','utf8');
const source=index.slice(index.indexOf('/* NPC 반란군 1~20판:'),index.indexOf('function buildMusou(cfg){'))
  +'\n'+fs.readFileSync('_new/m3_shu21_25.js','utf8')
  +'\n'+fs.readFileSync('_new/m3_shu26_30.js','utf8');
const context={WEI_RULES:{},mobs:[],P:{x:0,y:0,slowT:0},M:null,YR:.78,TS:48,CH:100,shots:[],time:0,
  showBanner:()=>{},bossBurst:()=>{},wakeColony:()=>{},debris:()=>{},
  weiNear:(a,b,r)=>Math.hypot(a.x-b.x,(a.y-b.y)/.78)<=r,
  weiPoints:(m,n)=>Array.from({length:n},(_,i)=>{const p={x:100+i*220,y:100};
    const col={lead:{...p,sp:100,dead:false,down:false,hp:100},mobs:[]};col.lead.col=col;return {...p,col};}),
  weiFindGate:()=>{throw Error('우회 가능한 문 위치 없음');},weiGateSet:()=>{},
  chaseMove:(c,p)=>{c.x=p.x;c.y=p.y;},losOpen:()=>true,
  faceTo:()=>0,hurtPlayer:()=>{},
  wuFail:(msg)=>{throw Error(msg)},
  weiExit:(msg)=>{context.M.mis='exit';context.M.exited=msg;}
};
vm.createContext(context);
vm.runInContext(source+'\nthis.NPC_STAGE_BOSSES=NPC_STAGE_BOSSES;this.npcStageInit=npcStageInit;this.npcStageHeroesAppear=npcStageHeroesAppear;',context);
assert.match(index,/25:'shu25',26:'shu26',27:'shu27',28:'shu28',29:'shu29',30:'shu30'/);
assert.match(index,/npcBossType:n<=30&&d\?d.type:null/);
assert.match(index,/if\(!m\.sp\.last\|\|m\.n<1\|\|m\.n>30\)return;/);
for(let n=26;n<=30;n++){
  const d=context.NPC_STAGE_BOSSES[n],main=n===30;
  assert.ok(d&&d.name&&d.skills.length>=2,'NPC 데이터 '+n);
  assert.equal(!!d.main,main);
  if(main){assert.equal(d.type,'cav');assert.equal(d.name,'NPC24');}
  const boss={hp:816,maxHp:816,atk:15,scale:1.18},hero={type:'test'};
  const m={n,sp:{last:true},captain:boss,heroes:[hero]};context.M=m;
  context.mobs.splice(0,context.mobs.length,boss,hero);context.npcStageInit(m);
  assert.equal(boss.hp,main?800:500);assert.ok(!context.mobs.includes(hero));
  m.npcBossCleared=true;context.npcStageHeroesAppear();assert.ok(context.mobs.includes(hero));
}
for(let n=26;n<=30;n++){
  const m={n,D:{g:[]},set:'1',gim:'shu'+n,mis:'wei'+n,heroes:[],guard:{x:220,y:100,dead:false,down:false,sp:100,bs:{}},sp:{last:false}};
  context.M=m;context.P.x=0;context.P.y=0;context.P.slowT=0;context.mobs.length=0;
  const r=context.WEI_RULES[n];assert.ok(r&&r.init&&r.tick,'미션 규칙 '+n);
  r.init(m);
  if(n===26){
    for(let i=0;i<2;i++){const p=m.wei.posts[i];context.P.x=p.x;context.P.y=p.y;r.tick(1);}
    assert.equal(m.wei.phase,'cornered');m.wei.runner.dead=true;r.tick(.1);
  }
  if(n===27){for(let i=0;i<3;i++){const p=m.wei.heights[i];context.P.x=p.x;context.P.y=p.y;r.tick(1.3);}}
  if(n===28){context.P.x=m.guard.x;context.P.y=m.guard.y;r.tick(1.9);
    assert.equal(m.wei.phase,'lured');m.wei.lead.x=m.wei.trap.x;m.wei.lead.y=m.wei.trap.y;r.tick(1.4);}
  if(n===29){for(let i=0;i<3;i++){const p=m.wei.stones[i];context.P.x=p.x;context.P.y=p.y;r.tick(1.2);}}
  if(n===30){for(let i=0;i<3;i++){const p=m.wei.points[i];context.P.x=p.x;context.P.y=p.y;
    m.wei.companion.x=p.x;m.wei.companion.y=p.y;r.tick(.1);}}
  assert.equal(m.mis,'exit','완료 상태 '+n);
}
const stages=JSON.parse(fs.readFileSync('_new/stages.json','utf8'));
const cfg=Array.isArray(stages)?stages.find(s=>s.n===29):Object.values(stages).find(s=>s.n===29);
assert.ok(cfg&&cfg.hero.includes('zhugeliang')&&cfg.hero.includes('pangtong'),'29판 두 장수 유지');
console.log('촉 26~30: 전령·수공·미인계·팔진도·화공 및 NPC 보스/2인 구출 설정 검사 통과');
