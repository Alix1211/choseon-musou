/* Confirm that rare dungeon/yokai layouts never ask for nonexistent human
 * boss frames. Test the generated mkCol function, not just source strings. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const atlas=JSON.parse(fs.readFileSync('a/mobs.json','utf8')).mobs;
const start=html.indexOf('function mkCol(tx,ty,o){');
const end=html.indexOf('function nearWalk(g,x,y){',start);
assert.ok(start>0&&end>start,'Generated colony function missing');
const calls=[];
const c={
  M:{n:4,set:'0',W:120,colonies:[],seen:new Uint8Array(120*120).fill(1)},
  TS:48,mobs:[],SOLD:[['spear',1]],YOK:[['egg',1]],
  createMob:(type,set,x,y,col,elite)=>{calls.push({type,set,elite});return {type,set,x,y,col,scale:1,hp:100,maxHp:100,atk:12,gold:1};},
  stageSet:n=>n<=10?'0':n<=20?'2':n<=30?'1':null,
  pickWeighted:a=>a[0][0],blockedAt:()=>false,rnd:(a,b)=>(a+b)/2,
  magicRecruit:()=>{},Math
};
vm.createContext(c);
vm.runInContext(html.slice(start,end)+'\nthis.mkCol=mkCol;',c);
const cases=[
  [4,'spear','0'],[10,'cav','0'],[12,'spear','2'],[15,'cav','2'],
  [23,'spear','1'],[31,'spear','0'],[39,'cav','1']
];
for(const [stage,type,country] of cases){
  c.M.n=stage;c.M.set=country;c.M.colonies.length=0;c.mobs.length=0;calls.length=0;
  const col=c.mkCol(30,30,{n:2,leader:true,captain:true,set:'y',npcBossType:type});
  assert.equal(col.lead.type,type);
  assert.equal(col.lead.set,country,`${stage}: human boss must use a country atlas`);
  assert.ok(atlas[col.lead.set]?.[type]?.front,`${stage}: missing boss sprite`);
  for(const mob of col.mobs.slice(1)){
    assert.equal(mob.set,'y',`${stage}: ordinary yokai faction must remain unchanged`);
    assert.ok(atlas[mob.set]?.[mob.type]?.front,`${stage}: missing minion sprite`);
  }
}
// A regular yokai leader is intentionally still a yokai.
c.M.n=4;c.M.colonies.length=0;c.mobs.length=0;
const regular=c.mkCol(30,30,{n:2,leader:true,set:'y'}).lead;
assert.equal(regular.set,'y');assert.ok(atlas.y[regular.type]?.front);
console.log('지하 보스 스프라이트 7개 위험 스테이지·요괴 부대 보존 확인 통과');
