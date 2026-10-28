const {chromium}=require('playwright');
const N=+process.argv[2]||1;
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
await pg.evaluate(n=>{G.S.cheat=1;G.startStage(n,1);const run=G.M.run;for(let k=1;k<run.specs.length;k++){run.idx=k;G.buildKan(run,k,{clock:600,k0:G.S.kills,replay:false});}},N);
await pg.waitForTimeout(500);
for(let i=0;i<6;i++){if(await pg.evaluate(()=>G.UI.mode)==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(300);}await pg.waitForTimeout(300);}
console.log(JSON.stringify(await pg.evaluate(()=>{const m=G.M;return {k:m.idx,mis:m.mis,heroes:m.heroes.map(h=>[h.type,h.down]),hero:!!m.hero,kind:m.cfgKind}})));
await pg.evaluate(()=>{const m=G.M;const g=m.captain;g.hp=1;G.P.x=g.x-80;G.P.y=g.y;G.cam.x=G.P.x;G.cam.y=G.P.y;});
await pg.evaluate(()=>{const g=G.M.captain;g.x=G.P.x+60;g.y=G.P.y;G.setAtk(true);});await pg.waitForTimeout(2000);await pg.evaluate(()=>G.setAtk(false));
await pg.evaluate(()=>{const m=G.M,kp=m.L.keep;G.P.x=kp.cx*48;G.P.y=(kp.cy+1)*48;});await pg.waitForTimeout(1200);
for(let i=0;i<3;i++){if(await pg.evaluate(()=>G.UI.mode)==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(300);}}
// 영웅 제압/구출
await pg.evaluate(()=>{const m=G.M;for(const c of m.colonies)for(const q of c.mobs)if(!q.hero&&!q.dead&&q.col.tag==='keep'){q.dead=true;}
  if(m.hero){m.hero.hp=1;}
  const h=m.hero||m.heroes[0];G.P.x=h.x-30;G.P.y=h.y;});
await pg.waitForTimeout(600);
console.log('mis',await pg.evaluate(()=>[G.M.mis,G.M.heroes.length]));
await pg.evaluate(()=>{const m=G.M;if(m.hero){m.hero.x=G.P.x+50;m.hero.y=G.P.y;G.setAtk(true);}});await pg.waitForTimeout(1500);await pg.evaluate(()=>G.setAtk(false));
console.log('cmdRes',await pg.evaluate(()=>{const c=document.getElementById('cmd');return [c.disabled,c.classList.contains('res')]}));console.log('mis2',await pg.evaluate(()=>[G.M.mis,G.M.heroes.length,G.rescueTarget()?1:0]));
await pg.evaluate(()=>{document.getElementById('cmd').click();});await pg.waitForTimeout(500);
console.log('mis3',await pg.evaluate(()=>[G.M.mis,G.M.heroes.length,G.M.joined,G.M.saved]));
await pg.waitForTimeout(3000);
for(let i=0;i<4;i++){const m=await pg.evaluate(()=>G.UI.mode);console.log('ui',m);if(m==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(500);}else if(m==='cut'){await pg.evaluate(()=>G.UI.cutTap&&0);await pg.waitForTimeout(3500);}else break;}
await pg.waitForTimeout(1500);
console.log('final ui',await pg.evaluate(()=>G.UI.mode),JSON.stringify(await pg.evaluate(()=>G.UI.rs)));
await pg.screenshot({path:'/tmp/end_'+N+'.png'});
console.log('errs',JSON.stringify(errs));await b.close();})();
