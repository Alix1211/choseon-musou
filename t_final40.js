/* Stage 40 focused smoke test: 39 unique NPCs, six battlefields, seven guardians,
 * NPC27 retreat, giant finish, original stages untouched. No browser/network needed. */
const fs=require('fs'),assert=require('assert'),vm=require('vm');
const html=fs.readFileSync('index.html','utf8');
const c={WEI_RULES:{},M:null,P:{x:500,y:500,mode:'manual'},UI:{mode:'battle',paused:false},
  VW:1280,VH:720,Z:1,TS:48,CH:100,YR:.78,cam:{x:0,y:0},mobs:[],allies:[],shots:[],zones:[],
  S:{kills:0},stat:{maxHp:()=>1000,atk:()=>80},showBanner:()=>{},wakeColony:col=>col.woken=true,
  openExit(){c.M.opened=true;},bossBurst:()=>{},fxTeleport:()=>{},nearWalk:(g,x,y)=>[Math.floor(x),Math.floor(y)],
  mkCol(x,y,o){const lead={x:x*48,y:y*48,hp:800,maxHp:800,atk:60,scale:1,seed:0};
    const col={lead,woken:false,mobs:[lead]};lead.col=col;c.M.colonies.push(col);c.mobs.push(lead);return col;},
  fx:[],pops:[],debris:()=>{},stopInput:()=>{},drawShadow:()=>{},npcBossDrawLabel:()=>{},
  dirKey:()=>['front',false],mobH:()=>230,showBanner:()=>{},stat:{maxHp:()=>1000,atk:()=>80},
  addZone:()=>{},bossBurst:()=>{},time:0,newCanvas:()=>{},drawShadow:()=>{},
  Math,console
};
vm.createContext(c);
for(const n of ['m3_npc_bosses_01_20.js','m3_shu21_25.js','m3_shu26_30.js','m3_lords31_35.js','m3_lords36_39.js','m3_final40.js'])
  vm.runInContext(fs.readFileSync('_new/'+n,'utf8'),c,{filename:n});
const groups=vm.runInContext('F40_GROUPS.map(g=>g.slice())',c);
const all=groups.flat();
assert.deepEqual(groups.map(g=>g.length),[7,7,7,6,6,6]);
assert.equal(all.length,39);assert.equal(new Set(all).size,39);
assert.deepEqual(all,[...Array(39)].map((_,i)=>i+1));
assert.equal(vm.runInContext('F40_DUNGEON.length',c),7);
const run={n:40,dl:{}};c.final40Dialog(run);
assert.equal(run.dl.f40start.length,7);
assert.equal(groups.slice(1).reduce((n,g,i)=>n+run.dl['kan'+(i+1)].length,0),32);
assert.ok(run.dl.end.some(q=>q.t.includes('미부인')));
assert.match(html,/Fl Fl Fl Fl Fl Fl Dm Dm Dm Dm Dm Dm Dm Tl/);
assert.match(html,/final40DrawCliff\(x0,y0,vw,vh\)/);
assert.match(html,/final40EndGiant\(m\)/);
for(const asset of ['npc27_walk.webp','npc27_giant.png','cliff.jpg'])
  assert.ok(fs.statSync('a/stage40/'+asset).size>10_000,asset);
function makeStage(idx){
  const boss={hp:800,maxHp:800,atk:60,scale:1,seed:0,type:'spear',x:600,y:600};
  const col={lead:boss,woken:false,mobs:[boss]};boss.col=col;
  const m={n:40,idx,mis:'guard',W:54,H:48,tk:new Uint8Array(54*48),
    D:{g:Array.from({length:48},()=>new Uint8Array(54).fill(1))},
    L:{rooms:Array.from({length:10},(_,i)=>({cx:8+i*3,cy:10+i*2})),st:{},exitRoom:{cx:25,cy:25}},
    colonies:Array.from({length:10},(_,i)=>i?{lead:{...boss,hp:800,maxHp:800,col},woken:false}:col),
    set:'1',captain:boss,props:[],decors:[],blocks:[],gates:[],exit:{},flow:null};
  for(const d of m.colonies){d.lead.col=d;d.mobs=[d.lead];}
  c.M=m;c.P.mode='manual';c.P.x=550;c.P.y=530;c.mobs.length=0;c.mobs.push(...m.colonies.map(x=>x.lead));
  return m;
}
for(const idx of [0,1,2,3,4,5,6,12]){
  const m=makeStage(idx);c.final40Init(m);
  assert.equal(m.f40.bosses.length,idx<6?groups[idx].length:1,'phase '+idx);
  for(const q of m.f40.bosses)q.dead=true;
  c.final40Tick(.1);
  if(idx===5){assert.ok(m.f40.escapeBoss,'NPC27 appears after wave 6');c.final40Escape(m.f40.escapeBoss);c.final40Tick(2.3);}
  assert.equal(m.mis,'exit','phase '+idx+' progression');assert.equal(m.opened,true);
}
{
  const m=makeStage(13);c.final40Init(m);
  assert.ok(m.f40.giant&&m.captain.final40Giant);
  assert.equal(m.mis,'final40');assert.equal(c.mobs.length,1);
  assert.ok(m.D.g.some(row=>row.includes(1)),'walkable cliff front');
  c.final40EndGiant(m.captain);
  assert.equal(m.mis,'done');assert.equal(m.doneT,0);
}
// All scripts in the generated game must at least parse successfully.
for(const [,body] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(body);
console.log('40판: 39명/6전장 → NPC27 도주 → 7수호장 → 거대 NPC27/엔딩 · 코드 구문 검증 통과');
