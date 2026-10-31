'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('_new/m3_hero_weapons.js','utf8');
const combo=fs.readFileSync('_new/m3_combo.js','utf8');
assert(combo.includes("HHL:'slam',HHHL:'rocks'"));
assert(combo.includes("move==='rocks'&&typeof comboGroundBurst!=='function'"));
let saves=0,restores=0,paths=0,stones=0,atlasDraws=0;
const cx={
 save(){saves++},restore(){restores++},translate(){},rotate(){},
 beginPath(){paths++},moveTo(){},lineTo(){},closePath(){},
 stroke(){},fill(){stones++},drawImage(){atlasDraws++}
};
const world={};
const c={
 Math,console,cx,M:world,mobs:[],shake:0,CH:82,
 HPERS:{},ST:{atk:100,def:90},PLAY:{active:'yinping'},
 P:{x:200,y:180,cbAngle:0,face:'right'},
 CB:{activated:1},
 stat:{atk:()=>100,def:()=>90},A:{},fx:[],
 playableStats:()=>({def:90}),
 allyStatOf:()=>({def:90}),
 hurtAlly(){},comboAttackDuration:()=>.54,
 loadAll:async()=>{},loadImg:async()=>null,
 doHit(){},comboDamage(){},comboStrike(move){if(move==='rocks'){c.fx.push({k:'deb'},{k:'shock'});}},
 comboMoveTick(){},spinTick(){},skillHit(){},
 allyAct(){},updateShots(){},drawFx(){},startStage(){},
 liveMobs:()=>[],nearest:()=>null,hasLOS:()=>true,
 blockedAt:()=>false,hitMob(){},enemyArmored:()=>false,
 breakJars(){},clamp:(x,a,b)=>Math.max(a,Math.min(b,x))
};
vm.createContext(c);
vm.runInContext(source+`
globalThis.GROUND={
  bursts:heroGroundBursts,
  effects:heroEffects,
  atlas:HERO_VFX,
  textures:HERO_VFX_LAYOUT
};`,c);
c.GROUND.atlas.ground={width:1024,height:576};
c.GROUND.atlas.impact={width:768,height:768};
c.startStage();
c.comboStrike('slam');
assert.equal(c.GROUND.bursts.length,1,'HHL should fracture the ground');
assert.equal(c.GROUND.bursts[0].stones.length,6);
assert.equal(c.GROUND.bursts[0].cracks.length,3);
c.comboStrike('slam');
assert.equal(c.GROUND.bursts.length,1,'repeated hit frames must not double-spawn');
c.CB.activated=2;c.comboStrike('rocks');
assert.equal(c.GROUND.bursts.length,2,'HHHL should be a separate burst');
assert.equal(c.GROUND.bursts[1].stones.length,11);
assert.equal(c.GROUND.bursts[1].cracks.length,5);
c.CB.activated=3;c.comboStrike('arc');
assert.equal(c.GROUND.bursts.length,2,'unrelated combo must remain unchanged');
c.updateShots(.08);
c.drawFx();
assert(paths>=8&&stones>=17&&atlasDraws>0,'cracks, rocks and original atlas must render');
assert.equal(saves,restores,'Canvas state must be restored');
for(let k=4;k<12;k++){c.CB.activated=k;c.comboStrike('rocks');}
assert(c.GROUND.bursts.length<=3,'low-end tablet particle cap');
// The embellishment is shared by Choseon and all nine playable heroines.
for(const id of ['choseon','zhenji','wenji','wangyi','xiaoqiao','daqiao','shangxiang','yinping','xingcai','yueying']){
 c.PLAY.active=id;c.CB.activated++;
 const before=c.GROUND.bursts.length;
 c.comboStrike('slam');assert.equal(c.GROUND.bursts.length,Math.min(3,before+1),id+' HHL effect');
 c.updateShots(.015);c.drawFx();
}
assert.equal(saves,restores,'all nine plus Choseon must balance Canvas state');
c.PLAY.active='choseon';c.CB.activated++;c.comboStrike('rocks');
assert(!c.fx.some(f=>f.k==='deb'),'old plain rock squares must be replaced');
assert(c.fx.some(f=>f.k==='shock'),'other original combo effects must remain');
c.updateShots(.8);
assert.equal(c.GROUND.bursts.length,0,'particles must clean up after animation');
console.log('PASS HHL / HHHL: atlas + cracks + flying rocks, one burst per finisher, all 10 playable states, Canvas state, cap and cleanup');
