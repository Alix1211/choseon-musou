'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('_new/m3_magic_troops.js','utf8');
const html=fs.readFileSync('index.html','utf8');
for(const token of ["mage_wei:{vh:140","mage_shu:{vh:140","mage_wu:{vh:140",
  'magicRecruit(col);','magicQueueImages();','magicEnsureStage(n);','drawMagicMob(m);',
  'magicElement:m.magicUnit?m.magicElement:null',"m.magicElement==='ice'",'drawMagicShot(s);',
  'portraitImage.getAttribute(\'src\')!==portraitSource',
  'swapImage.getAttribute(\'src\')!==swapSource',
  "const SAVEKEY='choseon_musou_v2'",'window.ChoseonCloud='])
  assert(html.includes(token),'generated runtime missing '+token);

function scene(n,idx,set){
  const fakeImg={width:1448,height:1086};
  const c={console,Math,Set,Array,Image:class{},
    A:{magicWalk:{mage_wei:fakeImg,mage_shu:fakeImg,mage_wu:fakeImg},magicAttack:{mage_wei:fakeImg,mage_shu:fakeImg,mage_wu:fakeImg}},
    M:{n,idx,colonies:[]},
    createMob:(type,s,x,y,col)=>({type,set:s,x,y,col,elite:false,hp:30,maxHp:30}),
    stage40Timed:x=>x,loadImg:()=>Promise.resolve(fakeImg),
    drawShadow(){},cx:{save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},closePath(){},fill(){}},
    dirKey:()=>['front',false],mobH:()=>140,time:1,glow(){},P:{},URL:{},AbortController:class{},fetch:()=>{throw Error('unused');}}
  vm.createContext(c);vm.runInContext(source,c);
  const col={mobs:[{type:'cav',set,leader:true,elite:true},{type:'bow',set,x:100,y:120,elite:false},{type:'spear',set,x:150,y:120,elite:false}]};
  c.magicRecruit(col);return {c,col};
}
assert.equal(scene(1,1,'0').col.mobs[1].type,'bow','tutorial stays unchanged');
for(const [stage,set,type] of [[3,'0','mage_wei'],[7,'0','mage_wei'],[11,'2','mage_wu'],[20,'2','mage_wu'],[22,'1','mage_shu'],[29,'1','mage_shu'],[37,'0','mage_wei']]){
 const {c,col}=scene(stage,1,set);
 assert.equal(col.mobs.length,3,'soldier count unchanged');
 assert.equal(col.mobs[1].type,type,stage+' type');
 assert(['fire','ice','lightning','wind'].includes(col.mobs[1].magicElement));
 c.magicRecruit(col);assert.equal(col.mobs.filter(m=>m.magicUnit).length,1,'one mage per section');
}
assert.equal(scene(22,0,'1').col.mobs[1].type,'bow','no earlier unintended spawns');
assert.equal(scene(22,1,'y').col.mobs[1].type,'bow','yokai stay unchanged');
assert.equal(scene(22,3,'1').col.mobs[1].type,'mage_shu','second section supports another mage');
// Same faction uses multiple elements as episodes progress.
assert.notEqual(scene(3,1,'0').col.mobs[1].magicElement,scene(4,1,'0').col.mobs[1].magicElement);
assert.notEqual(scene(11,1,'2').col.mobs[1].magicElement,scene(12,1,'2').col.mobs[1].magicElement);
{
 const {c}=scene(10,1,'0');
 c.document={createElement:()=>({getContext:()=>({drawImage(){}})})};
 const reduced=c.magicCompactImage({width:1448,height:1086});
 assert.equal(reduced.width,1024);assert.equal(reduced.height,768);
 assert((reduced.width*reduced.height)/(1448*1086)<.51,'sprite decoder pixel budget halved');
 c.A.magicLoading={};c.magicEnsureStage(11);
 assert.deepEqual(Object.keys(c.A.magicWalk),['mage_wu'],'old faction textures released');
 assert.deepEqual(Object.keys(c.A.magicAttack),['mage_wu'],'old attack textures released');
}
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for(const m of scripts)new Function(m[1]);
console.log('PASS magic troops: 3 factions, 4 spells, sprite memory/hero-switch guards, save/Drive, JS syntax');
