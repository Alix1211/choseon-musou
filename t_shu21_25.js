/* 촉 21~25 미션·NPC 최종 수문장 상태 빠른 단위 검사. 게임 전 화면 실행 검사는 별도. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const index=fs.readFileSync('index.html','utf8');
const source=index.slice(index.indexOf('/* NPC 반란군 1~20판:'),index.indexOf('function buildMusou(cfg){'))+'\n'+fs.readFileSync('_new/m3_shu21_25.js','utf8');
const context={WEI_RULES:{},mobs:[],P:{x:0,y:0},M:null,YR:.78,TS:48,CH:100,shots:[],
  showBanner:()=>{},bossBurst:()=>{},wakeColony:()=>{},debris:()=>{},
  weiNear:(a,b,r)=>Math.hypot(a.x-b.x,(a.y-b.y)/.78)<=r,
  weiPoints:(m,n)=>Array.from({length:n},(_,i)=>({x:100+i*200,y:100,col:{lead:{dead:false},mobs:[]}})),
  weiFindGate:()=>({far:{x:500,y:100},open:true}),weiGateSet:(g,v)=>g.open=v,
  nearWalk:()=>[4,4],mkCol:()=>({mobs:[{dead:false},{dead:false}]}),
  chaseMove:(c,p)=>{c.x=p.x;c.y=p.y;},
  wuFail:(msg)=>{throw Error(msg)},
  weiExit:(msg)=>{context.M.mis='exit';context.M.exited=msg;}
};
vm.createContext(context);
vm.runInContext(source+'\nthis.npc={NPC_STAGE_BOSSES,npcStageInit,npcStageBossDefeated,npcStageHeroesAppear};',context);
const {NPC_STAGE_BOSSES,npcStageInit,npcStageBossDefeated,npcStageHeroesAppear}=context.npc;
const js=index;
assert.match(js,/21:'shu21',22:'shu22',23:'shu23',24:'shu24',25:'shu25'/);
assert.match(js,/\['wei','wu','shu'\]/);
for(let n=21;n<=25;n++){
  const d=NPC_STAGE_BOSSES[n],main=n===25;
  assert.ok(d&&d.name&&d.skills.length>=2,'NPC 보스 데이터 '+n);
  assert.equal(!!d.main,main,'대보스 판번호 '+n);
  if(main)assert.equal(d.type,'cav');
  const b={hp:816,maxHp:816,atk:15,scale:1.18},h={type:'yinping'};
  const m={n,sp:{last:true},captain:b,heroes:[h]};context.M=m;
  context.mobs.length=0;context.mobs.push(b,h);
  npcStageInit(m);
  assert.equal(b.hp,main?800:500);
  assert.equal(b.atk,20);
  assert.equal(b.scale,1.2);
  assert.ok(!context.mobs.includes(h));
  npcStageBossDefeated(b);assert.ok(!context.mobs.includes(h));
  npcStageHeroesAppear();assert.ok(context.mobs.includes(h));
}
for(let n=21;n<=25;n++){
  const m={n,D:{g:[]},set:'1',gim:'shu'+n,mis:'wei'+n,heroes:[]};
  context.M=m;context.P.x=100;context.P.y=100;context.mobs.length=0;
  const rule=context.WEI_RULES[n];rule.init(m);
  if(n===21){for(let i=0;i<3;i++){const p=m.wei.points[m.wei.index];context.P.x=p.x;context.P.y=p.y;for(const c of m.wei.civ){c.x=p.x;c.y=p.y;}rule.tick(.1);}}
  if(n===22){rule.tick(.1);for(let i=0;i<3;i++){for(const q of m.wei.enemies)q.dead=true;rule.tick(.1);if(i<2)rule.tick(3.1);}}
  if(n===23){for(const p of m.wei.levers){context.P.x=p.x;context.P.y=p.y;rule.tick(1.3);}}
  if(n===24){for(const p of m.wei.towers){p.leader.dead=true;context.P.x=p.x;context.P.y=p.y;rule.tick(1.4);}}
  if(n===25){for(const p of m.wei.switches){context.P.x=p.x;context.P.y=p.y;rule.tick(1.1);}}
  assert.equal(m.mis,'exit','21~25 미션 완료 흐름 '+n);
}
console.log('촉 21~25 NPC 보스·기마 배치·호위/방어/우회/감시탑/발판 5종 상태 검사 통과');
