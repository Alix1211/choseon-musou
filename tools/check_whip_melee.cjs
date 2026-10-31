// Prevent re-introducing long-range whip lightning in generated or source code.
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),source=fs.readFileSync('_new/m3_combo.js','utf8');
const builder=fs.readFileSync('_new/p2combo.py','utf8'),p2=fs.readFileSync('_new/p2.py','utf8');
for(const [where,data] of [['game',html],['combo source',source]]){
  assert(!data.includes('comboBolt('),where+' still has ranged lightning emitter');
  assert(data.includes("k:'whipSweep'"),where+' lacks physical whip arc');
  assert(data.includes("const radius=w==='whip'?REACH.whip:"),where+' whip combo range must use base melee reach');
  assert(data.includes("whip:{arc:'부채꼴 전격'"),where+' must preserve recorded skill names');
}
assert(!html.includes("f.k==='bolt'"),'obsolete ranged lightning renderer is still present');
assert(html.includes("f.k==='whipSweep'"),'game must render physical whip arc');
assert(!builder.includes('날개형 번개'),'generator would restore lightning on rebuild');
assert(p2.includes("p2whip.py"),'basic whip patch not connected to source generator');
assert(html.includes("REACH={sword:146,whip:170,fan:600}"),'base melee reach changed');
assert(html.includes("hitMob(m,base*.85,'whip'"),'base whip damage changed');
assert(!html.includes('REACH.whip*ST.rng'),'equipment stat must never extend whip reach');
assert(html.includes('Math.hypot(dx,dy)<=L'),'basic attack cannot hit outside 170px');
assert(html.includes('Math.hypot(m.x-P.x,m.y-P.y)<=REACH.whip'),'pull skill must stay melee');
assert(html.includes('L=Math.max(0,Math.min(f.L,REACH.whip)-6)*ext'),'whip line must include stroke-width cap');
assert(builder.includes('Math.max(0,f.R-5)'),'combo sweep stroke must stop at 170px');
assert(fs.readFileSync('_new/p2whip.py','utf8').includes('L=REACH.whip;'),'range generator must ignore ST.rng');
assert(fs.readFileSync('_new/p2musou.py','utf8').includes("whip:170"),'source must generate 170 range');
console.log('Whip melee-only source/runtime regression checks OK');
