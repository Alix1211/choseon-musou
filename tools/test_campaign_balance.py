"""Check balance source in memory without running the generator or APK build."""
from pathlib import Path
import ast
import json
import re
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).read_text() if len(sys.argv) > 1 else (root / 'index.html').read_text()
patch = (root / '_new/p2balance.py').read_text()
ast.parse(patch)
ast.parse((root / '_new/p2.py').read_text())
state = {'src': source}

def rep(old, new, cnt=1):
    assert state['src'].count(old) == cnt, ('patch anchor mismatch', old)
    state['src'] = state['src'].replace(old, new)

if 'const CAMPAIGN_BALANCE=' not in source:
    state['rep'] = rep
    exec(compile(patch, 'p2balance.py', 'exec'), state)
source = state['src']

def function(name, next_marker):
    start = source.index('function ' + name + '(')
    return source[start:source.index(next_marker, start)]

start = source.index('const CAMPAIGN_BALANCE=')
xp = source[start:source.index('const stat=', start)]
diff = re.search(r'const DIFF=([^\n]+);', source).group(0)
mob = function('createMob', 'const AUC=')
update = function('updateMob', '/* ───────── 보스')
test = r"""
const assert=require('node:assert/strict');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let S={lv:1,xp:0,diff:1,stage:1},M={replay:false,musou:true};
let P={x:1,y:1,hp:30,mode:'manual'},ST={maxHp:200};
let allies=[{type:'test',hp:30,maxHp:100}],pops=[],fx=[],shots=[],CH=10;
function heroExp(){};
function recalc(){const old=ST.maxHp;ST.maxHp=200*(1+.04*(S.lv-1));P.hp*=ST.maxHp/old;}
""" + xp + r"""
gainExp(120);assert.equal(S.lv,2);close(P.hp,72.8);assert.equal(allies[0].hp,30);
P.hp=ST.maxHp-1;gainExp(expNeed(S.lv));close(P.hp,ST.maxHp);
P.hp=0;P.mode='dead';gainExp(expNeed(S.lv));assert.equal(P.hp,0);
S={lv:1,xp:0};M.replay=true;gainExp(100);assert.equal(S.xp,50);
M.replay=false;S={lv:70,xp:20};gainExp(99999);assert.equal(S.lv,70);assert.equal(S.xp,0);
for(let i=1;i<70;i++)assert.ok(expNeed(i+1)>expNeed(i));
S={lv:1,xp:0};P.hp=200;P.mode='manual';ST.maxHp=200;
let checkpoints={};
for(let n=1;n<=39;n++){
  if([5,10,20].includes(n))checkpoints[n]=S.lv;
  // Estimate, calibrated to reported Lv29 before stage10. Not a playthrough.
  const weightedKills=269*(n<=12?1:342/212);
  gainExp((weightedKills*CAMPAIGN_BALANCE.killXp+20+CAMPAIGN_BALANCE.clearXp)*stageExpScale(n));
}
checkpoints[40]=S.lv;
for(const [stage,lo,hi] of [[5,6,8],[10,13,15],[20,28,32],[40,60,65]])
  assert.ok(checkpoints[stage]>=lo&&checkpoints[stage]<=hi,JSON.stringify(checkpoints));
console.log('Estimated entry levels (not playtested):',checkpoints);
""" + diff + mob + update + r"""
const MT={spear:{hp:1,atk:1,sp:82,reach:96,cd:1.5,wind:.4},bow:{hp:1,atk:1,sp:72,reach:96,cd:2,wind:.45,shot:380}};
const rnd=(a,b)=>(a+b)/2;
function weiMob(){return false;}function auraOf(){return 0;}function faceTo(){return 'down';}
function hurtPlayer(){}function hurtAlly(){}function wakeColony(){}function mobH(){return 100;}
const YR=.78;
allies=[];S={stage:1,diff:1};P={x:1,y:1,mode:'manual'};
let normal=createMob('spear','0',0,0,{woken:true},false);
close(normal.hp,34.5);close(normal.atk,6.4);
normal.wind=.01;normal.hurt=normal.stun=normal.lunge=0;
updateMob(normal,.02);close(normal.cd,1.5*1.025*.8);
let bow=createMob('bow','0',0,0,{woken:true},false);
bow.wind=.01;updateMob(bow,.02);close(bow.cd,2*1.025*.9);
assert.equal(MT.spear.wind,.4);assert.equal(MT.bow.wind,.45);
for(let i=1;i<DIFF.length;i++){
  assert.ok(DIFF[i].hp>DIFF[i-1].hp);assert.ok(DIFF[i].atk>DIFF[i-1].atk);
  assert.ok(DIFF[i].meleeCd<DIFF[i-1].meleeCd);
}
assert.equal(DIFF[0].hp,.7);assert.equal(DIFF[0].atk,.7);
console.log('XP, healing, replay, cap, enemy damage/cadence, difficulty order: PASS');
"""
subprocess.run(['node', '-'], input=test, text=True, check=True)
scripts = re.findall(r'<script(?:\s[^>]*)?>([\s\S]*?)</script>', source)
subprocess.run(['node', '-e', 'const vm=require("node:vm");for(const s of JSON.parse(require("node:fs").readFileSync(0,"utf8")))new vm.Script(s);console.log("Script syntax: PASS (memory only)");'], input=json.dumps(scripts), text=True, check=True)
print('Patch anchors and Python syntax: PASS. No generated files or APK written.')
