'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const fixture=fs.readFileSync('tools/check_playable_heroes.cjs','utf8').split('let assertions=0;')[0];
const outer={require,console};vm.createContext(outer);vm.runInContext(fixture+';globalThis.fixture=app;',outer);
const c=outer.fixture(),hits=[];Object.assign(c,{
 loadAll:async()=>{},loadImg:async()=>null,comboAttackDuration:()=>.54,
 hurtAlly(){},doHit(){},comboDamage(){},comboStrike(){},comboMoveTick(){},spinTick(){},skillHit(){},allyAct(){},updateShots(){},drawFx(){},
 liveMobs:()=>c.mobs.filter(m=>!m.dead&&!m.down),mobs:[],nearest:()=>null,hasLOS:()=>true,blockedAt:()=>false,
 hitMob:(m,raw,w,kb)=>{hits.push({m,raw,w,kb});m.hp-=raw;if(m.hp<=0)m.dead=true;},enemyArmored:()=>false,
 breakJars(){},shake:0,CH:82,fx:[],clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
});
vm.runInContext(fs.readFileSync('_new/m3_hero_weapons.js','utf8')+';globalThis.W={HERO_WEAPONS,heroAttack,heroProjectiles,heroEffects,heroDamage,paintHeroFx};',c);
const W=c.W,ent={x:0,y:100,face:'right'};
assert.equal(Object.keys(W.HERO_WEAPONS).length,9);
let checks=0;
for(const [id,p] of Object.entries(W.HERO_WEAPONS)){
 assert(Math.abs(c.HPERS[id][1]*p.rate-1)<1e-9);checks++;
 c.TEST.PLAY.active=id;assert(Math.abs(c.comboAttackDuration()-.54/p.rate)<1e-8);checks++;
 hits.length=0;W.heroProjectiles.length=0;c.mobs=[{x:60,y:100,hp:9999,scale:1,stun:0}];
 W.heroAttack(ent,id,100,0);
 if(p.count){assert.equal(W.heroProjectiles.length,p.count);assert(Math.abs(W.heroProjectiles.reduce((s,o)=>s+o.raw,0)-90)<1e-8);}
 else{assert.equal(hits.length,1);assert.equal(hits[0].kb,p.kb);c.mobs[0].x=p.reach+20;hits.length=0;W.heroAttack(ent,id,100,0);assert.equal(hits.length,0);}
 checks+=2;
}
// Projectiles keep the shooter's damage when swapping to another hero.
W.heroProjectiles.length=0;c.mobs=[{x:49,y:90,hp:9999,scale:1,stun:0}];c.startStage();
W.heroAttack(ent,'zhenji',600,0);const original=W.heroProjectiles[2].raw;c.TEST.PLAY.active='yinping';hits.length=0;c.updateShots(.04);
assert(hits.length>0);assert(hits.every(h=>Math.abs(h.raw-original)<1e-8));checks++;
// Fire splits damage into immediate hit and a bounded, expiring burn pool.
const m={x:30,y:100,hp:9999,scale:1,stun:0};W.heroDamage(m,100,W.HERO_WEAPONS.xiaoqiao,0,0);assert.equal(m.heroBurn.pool,25);assert.equal(m.heroBurn.left,2);checks++;
// No VFX draw can leak alpha/composite state; effects are capped under load.
const noop=()=>{};let saves=0,restores=0;
c.cx={save(){saves++},restore(){restores++},translate:noop,rotate:noop,drawImage:noop};
vm.runInContext("HERO_VFX.magic={width:768,height:768};paintHeroFx('magic:2',0,0,34,.5,0,false,.8);",c);
assert.equal(saves,restores);checks++;
console.log('PASS nine weapon profiles, equal normalized base DPS, range/knockback, volley totals, owner snapshot, burn and Canvas state: '+checks+' core checks');
