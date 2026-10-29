const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();
  try{
    const pg=await b.newPage({viewport:{width:1100,height:650}}),errors=[];
    pg.on('pageerror',e=>errors.push(e.message));
    await pg.goto('http://localhost:8766/index.html');
    await pg.waitForFunction(()=>window.G&&G.UI.mode==='title');
    const start=async()=>{
      await pg.evaluate(()=>{G.S.cheat=1;G.startStage(2,1);G.P.hp=1e8;});
      await pg.waitForTimeout(600);
      await pg.evaluate(()=>{G.UI.paused=true;G.P.mode='manual';});
    };
    await start();
    const setup=await pg.evaluate(()=>{
      const m=G.M,t=m.towers;
      return {count:t.list.length,distinct:Math.hypot(t.list[0].x-t.list[1].x,t.list[0].y-t.list[1].y),left:t.left,
        walk:t.list.every(q=>!G.blockedAt(q.x,q.y,18)),sets:t.list.map(q=>q.lead.set),open:m.exit.open};
    });
    assert.equal(setup.count,2);assert.ok(setup.distinct>192);assert.ok(setup.walk);assert.deepEqual(setup.sets,['0','0']);assert.equal(setup.open,false);
    const unmet=await pg.evaluate(()=>{
      const t=G.M.towers,a=t.list[0];G.P.x=a.x;G.P.y=a.y;
      G.UI.paused=false;G.gimTick(2);G.UI.paused=true;
      G.killMob(G.M.guard);
      return {captured:a.captured,open:G.M.exit.open,mis:G.M.mis};
    });
    assert.deepEqual(unmet,{captured:false,open:false,mis:'towers'});
    const remote=await pg.evaluate(()=>{
      const a=G.M.towers.list[0];G.killMob(a.lead);G.P.x=-1000;G.P.y=-1000;
      G.UI.paused=false;G.gimTick(2);G.UI.paused=true;return a.captured;
    });assert.equal(remote,false);
    const capture=async index=>pg.evaluate(i=>{
      const q=G.M.towers.list[i];if(!q.lead.dead)G.killMob(q.lead);G.P.x=q.x;G.P.y=q.y;
      G.UI.paused=false;G.gimTick(1.5);G.UI.paused=true;
      return {captured:G.M.towers.list.filter(q=>q.captured).length,open:G.M.exit.open};
    },index);
    assert.deepEqual(await capture(0),{captured:1,open:false});
    assert.deepEqual(await capture(1),{captured:2,open:true});
    // 점령 완료 후 남은 시간이 지나도 패배하지 않는다.
    assert.equal(await pg.evaluate(()=>{G.UI.paused=false;G.gimTick(200);G.UI.paused=true;return G.M.towers.failed;}),false);
    await start();
    // 일시정지·대화·등장 연출에는 시간이 흐르지 않는다.
    const paused=await pg.evaluate(()=>{
      const t=G.M.towers,old=t.left;G.gimTick(1);
      G.UI.paused=false;G.UI.mode='dlg';G.gimTick(1);G.UI.mode='battle';G.P.mode='tele_in';G.gimTick(1);
      G.P.mode='manual';G.UI.paused=true;return t.left===old;
    });assert.ok(paused);
    assert.deepEqual(await capture(1),{captured:1,open:false});
    assert.deepEqual(await capture(0),{captured:2,open:true});
    await start();await capture(0);
    const failed=await pg.evaluate(()=>{
      G.M.towers.left=.01;G.UI.paused=false;G.gimTick(.02);G.UI.paused=true;
      return {failed:G.M.towers.failed,open:G.M.exit.open,ended:G.M.ended,cleared:!!G.S.cl[2]};
    });assert.deepEqual(failed,{failed:true,open:false,ended:true,cleared:false});
    await pg.screenshot({path:'/tmp/gim_02_failure.png'});
    await pg.evaluate(()=>{window.oldRun=G.M.run;G.UI.paused=false;});
    await pg.waitForFunction(()=>G.M.run!==window.oldRun,null,{timeout:10000});
    assert.ok(await pg.evaluate(()=>G.M.idx===0&&!G.M.exit.open&&G.M.towers.list.every(q=>!q.captured)&&G.M.towers.left>175&&!G.S.cl[2]));
    await pg.waitForTimeout(600);
    await pg.evaluate(()=>{
      const q=G.M.towers.list[0];G.killMob(q.lead);G.P.hp=1e8;G.P.x=q.x-90;G.P.y=q.y+70;G.cam.x=q.x;G.cam.y=q.y-40;
      for(const m of G.mobs){m.dead=true;m.deadT=99;}
      G.UI.paused=false;
    });
    await pg.waitForTimeout(2400);
    await pg.evaluate(()=>{G.UI.paused=true;});
    await pg.screenshot({path:'/tmp/gim_02_tower.png'});
    // 다른 판에는 감시탑 상태가 새어 들어가지 않는다.
    assert.ok(await pg.evaluate(()=>{G.startStage(1,1);return !G.M.towers&&G.M.mis==='cmd';}));
    assert.deepEqual(errors,[]);console.log('2판 규칙 시험 통과',JSON.stringify(setup));
  }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
