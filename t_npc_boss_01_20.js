/* 1~20판 NPC 보스 데이터 및 등장 게이트를 브라우저 설치 없이 빠르게 확인. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('_new/m3_npc_bosses_01_20.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const contexts={mobs:[],M:null,bossBurst:()=>{},showBanner:()=>{}};
vm.createContext(contexts);
vm.runInContext(source+'\nthis.npcFns={NPC_STAGE_BOSSES,npcStageInit,npcStageBossDefeated,npcStageHeroesAppear};',contexts);
const {NPC_STAGE_BOSSES,npcStageInit,npcStageBossDefeated,npcStageHeroesAppear}=contexts.npcFns;
assert.equal(Object.keys(NPC_STAGE_BOSSES).length,20);
for(let n=1;n<=20;n++){
  const main=[5,10,15,20].includes(n),d=NPC_STAGE_BOSSES[n];
  assert.ok(d&&d.name&&d.skills.length,'보스 데이터 누락 '+n);
  assert.equal(!!d.main,main,'기마 대보스 위치 '+n);
  if(main)assert.equal(d.type,'cav','기마병 타입 '+n);
  const b={hp:816,maxHp:816,atk:15,scale:1.18};
  const h={type:'zhenji'};
  const m={sp:{last:true},n,captain:b,heroes:[h],mis:'guard'};
  contexts.mobs.length=0;contexts.mobs.push(b,h);
  contexts.M=m;
  npcStageInit(m);
  assert.equal(b.npcBossDef.name,d.name);
  assert.equal(b.hp,main?800:500,'체력 배수 '+n);
  assert.equal(b.atk,20,'공격력 배수 '+n);
  assert.equal(b.scale,1.2,'키 20% '+n);
  assert.ok(!contexts.mobs.includes(h),'보스 생존 중 장수 노출 '+n);
  npcStageBossDefeated(b);
  assert.ok(m.npcBossCleared,'보스 처치 등록 '+n);
  assert.ok(!contexts.mobs.includes(h),'내성문 개방 전 장수 등장 '+n);
  npcStageHeroesAppear();
  assert.ok(contexts.mobs.includes(h),'보스 격파 후 장수 등장 '+n);
  npcStageHeroesAppear();
  assert.equal(contexts.mobs.filter(v=>v===h).length,1,'장수 중복 등장 '+n);
}
assert.match(index,/function onCaptainDead\(m\)\{\s*if\(m.npcBoss\)npcStageBossDefeated\(m\)/);
assert.match(index,/openGate\('inner'\);M.mis='inner';\s*if\(m.npcBoss\)npcStageHeroesAppear\(\)/);
console.log('NPC 보스 1~20 데이터, 체력·공격력·크기, 격파-장수 등장 상태 검사 통과');
