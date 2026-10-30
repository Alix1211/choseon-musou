/* Visual decoration regression checks that do not require a browser. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');

class FakeImage{
  constructor(){this.width=400;this.height=320;}
  set src(v){this._src=v;if(this.onload)this.onload();}
}
const draws=[];
const ctx=vm.createContext({Image:FakeImage,console,Math,TS:48,cx:{drawImage:(...args)=>draws.push(args)}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'_new/m3_decor.js'),'utf8'),ctx);
const makeDecor=vm.runInContext('makeDecor',ctx);
const drawFurniture=vm.runInContext('drawChineseFurniture',ctx);
const names=vm.runInContext('DECOR_NAMES',ctx);

for(const n of names){
  const png=fs.readFileSync(path.join(__dirname,'a/decor_props',n+'.png'));
  assert.equal(png.subarray(1,4).toString(),'PNG',n);
  assert.equal(png.subarray(png.length-8,png.length-4).toString(),'IEND',n);
}
assert.equal(names.length,18);

const rooms=Array.from({length:8},(_,i)=>({idx:i,cx:7+i*7,cy:10+i*5,rx:5,ry:4}));
const L={rooms,st:rooms[0]};
const passable=Array.from({length:70},()=>Array(70).fill(1));
function data(n,sty='out'){
  return {n,idx:0,sty,D:{g:passable},props:[]};
}
for(const [stage,expected] of [[1,'wei'],[12,'wu'],[24,'shu']]){
  const m=data(stage),before=JSON.stringify(m.D.g),a=makeDecor(m,L),b=makeDecor(m,L);
  assert.ok(a.length>=4,`stage ${stage} decorations`);
  assert.equal(JSON.stringify(a),JSON.stringify(b),'deterministic');
  assert.ok(a.every(d=>d.key.startsWith(expected+'_')),'nation-specific');
  assert.equal(JSON.stringify(m.D.g),before,'walkability unchanged');
  assert.equal(m.props.length,0,'base props untouched');
}
assert.equal(makeDecor(data(1,'hall'),L).length,0,'interior uses furniture assets');
const mixed=makeDecor(data(35),L).map(d=>d.key.split('_')[0]);
assert.ok(new Set(mixed).size>=2,'mixed armies');

vm.runInContext('M={musou:true,sty:"hall",n:1}',ctx);
assert.equal(drawFurniture({k:'i_bed_r',x:100,y:100,gw:100,gh:91}),true);
assert.equal(drawFurniture({k:'i_desk',x:100,y:100,gw:81,gh:69}),true);
assert.equal(drawFurniture({k:'i_vase',x:100,y:100,gw:36,gh:67}),true);
assert.ok(draws.length>=3,'real drawImage calls');
console.log('18 PNGs, deterministic field placement, 3 nations, furniture, no collision changes: OK');
