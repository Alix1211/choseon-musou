const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();
 try{
  const p=await b.newPage({viewport:{width:1100,height:650}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:8766/index.html');
  await p.waitForFunction(()=>window.G&&G.UI.mode==='title',null,{timeout:60000});
  await p.evaluate(()=>{G.S.cheat=1;G.startStage(5,1);G.P.hp=1e8;});
  await p.waitForFunction(()=>G.P.mode==='manual',null,{timeout:15000});
  const r=await p.evaluate(()=>{
   const m=G.M,d=m.defense05;G.UI.paused=true;
   const out={start:m.mis,reachable:!G.blockedAt(d.x,d.y,18),country:m.set};
   const tick=dt=>{G.UI.paused=false;G.gimTick(dt);G.UI.paused=true;};
   G.P.x=d.x;G.P.y=d.y;const before=d.left;G.gimTick(3);out.pause=d.left===before;
   G.UI.mode='dlg';tick(3);out.dialog=d.left===before;G.UI.mode='battle';
   G.P.x=d.x+d.r+10;tick(5);out.outside=d.left===before;
   G.P.x=d.x;G.killMob(d.oldGuard);out.early=!m.exit.open;
   tick(15);out.wave=m.colonies.filter(c=>c.tag==='gpt05_wave').length;
   out.earlyWave=!m.exit.open&&d.left===45;
   out.waveCountry=m.colonies.filter(c=>c.tag==='gpt05_wave').every(c=>c.woken&&c.mobs.every(q=>q.set==='0'));
   G.P.mode='dead';tick(.1);out.death=d.left===60;G.P.mode='manual';
   tick(59);out.lastSecond=d.left===1&&!m.exit.open&&m.mis==='defend05';
   tick(1);out.counter=m.mis==='guard'&&m.guard!==d.oldGuard&&!m.guard.dead&&!m.exit.open;
   out.spawn=!!m.guard&& !G.blockedAt(m.guard.x,m.guard.y,18);
   G.killMob(m.guard);out.open=m.exit.open&&m.mis==='exit';
   return out;
  });
  assert.equal(r.start,'defend05');assert.equal(r.country,'0');assert.equal(r.wave,1);
  for(const k of ['reachable','pause','dialog','outside','early','earlyWave','waveCountry','death','lastSecond','counter','spawn','open'])assert.equal(r[k],true,k);
  await p.evaluate(()=>{G.startStage(5,1);G.P.hp=1e8;const d=G.M.defense05;G.P.x=d.x;G.P.y=d.y+80;G.cam.x=d.x;G.cam.y=d.y;});
  await p.waitForTimeout(700);await p.evaluate(()=>G.UI.paused=true);
  await p.screenshot({path:'/tmp/gim_05.png'});
  assert.ok(await p.evaluate(()=>{const run=G.M.run;G.buildKan(run,1,{clock:60,k0:0,replay:false});return !G.M.defense05&&G.M.mis==='guard';}));
  assert.deepEqual(errors,[]);console.log('5판 규칙 통과',JSON.stringify(r));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
