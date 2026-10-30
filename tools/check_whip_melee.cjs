// Prevent re-introducing long-range whip lightning in generated or source code.
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),source=fs.readFileSync('_new/m3_combo.js','utf8');
const builder=fs.readFileSync('_new/p2combo.py','utf8'),p2=fs.readFileSync('_new/p2.py','utf8');
for(const [where,data] of [['game',html],['combo source',source]]){
  assert(!data.includes('comboBolt('),where+' still has ranged lightning emitter');
  assert(data.includes("k:'whipSweep'"),where+' lacks physical whip arc');
  assert(data.includes("w==='whip'?258:w==='fan'?440:240"),where+' whip melee cone not wider than sword');
  assert(data.includes("whip:{arc:'부채꼴 전격'"),where+' must preserve recorded skill names');
}
assert(!html.includes("f.k==='bolt'"),'obsolete ranged lightning renderer is still present');
assert(html.includes("f.k==='whipSweep'"),'game must render physical whip arc');
assert(!builder.includes('날개형 번개'),'generator would restore lightning on rebuild');
assert(p2.includes("p2whip.py"),'basic whip patch not connected to source generator');
assert(html.includes("REACH={sword:146,whip:205,fan:600}"),'base melee reach changed');
assert(html.includes("hitMob(m,base*.85,'whip'"),'base whip damage changed');
console.log('Whip melee-only source/runtime regression checks OK');
