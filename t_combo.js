const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const b=await chromium.launch({headless:true});
  const pg=await b.newPage({viewport:{width:844,height:390}});
  const errors=[];pg.on('pageerror',e=>errors.push(e.message));
  await pg.goto('http://127.0.0.1:8768/index.html');
  await pg.waitForFunction(()=>window.G&&G.UI.mode==='title',null,{timeout:60000});
  await pg.evaluate(()=>{
    G.S.cheat=1;G.startStage(1,1);G.P.mode='manual';G.P.hp=1e7;
    G.UI.mode='battle';G.UI.paused=false;
    G.mobs.forEach(m=>{m.dead=true;});
  });
  await pg.waitForTimeout(250);
  const tap=async(which)=>{
    const id={L:'atk',H:'spin',D:'dash'}[which];
    await pg.locator('#'+id).dispatchEvent('pointerdown',{pointerId:1,pointerType:'touch',isPrimary:true});
    await pg.waitForTimeout(330);
  };
  await tap('L');
  const afterOne=await pg.evaluate(()=>({count:CB.accepted,act:CB.activated,seq:CB.seq,mode:G.P.mode,atk:G.P.atk}));
  await pg.waitForTimeout(800);
  const afterWait=await pg.evaluate(()=>({count:CB.accepted,act:CB.activated,atk:G.P.atk}));
  assert.equal(afterOne.count,1,'one press accepted');
  assert.equal(afterWait.count,1,'hold without autorepeat');
  assert.equal(afterWait.atk,null,'attack finishes without unrequested followup');
  const cases=[['LLH','arc'],['LLLH','pierce'],['LLLLH','spin'],['HHL','slam'],['HHHL','rocks'],['DL','dashLight'],['DH','dashHeavy']];
  for(const [seq,want] of cases){
    await pg.evaluate(()=>{comboReset();CB.lastMove=null;G.P.atk=null;G.P.cbAction=null;G.P.cbMove=null;G.P.mAim=null;});
    for(const letter of seq)await tap(letter);
    const got=await pg.evaluate(()=>({move:CB.lastMove,seq:CB.seq,atk:G.P.atk,activated:CB.activated,accepted:CB.accepted}));
    assert.equal(got.move,want,seq+' -> '+JSON.stringify(got));
    console.log(seq,want,JSON.stringify(got));
    await pg.waitForTimeout(450);
  }
  // 무기별 조합이 모두 같은 입력 문자열로 발동하는지 확인한다.
  for(const w of ['sword','whip','fan']){
    await pg.evaluate(w=>{comboReset();CB.lastMove=null;G.P.atk=null;G.P.cbAction=null;G.P.cbMove=null;G.P.mAim=null;G.ST.wt=w;},w);
    for(const letter of 'LLH')await tap(letter);
    const got=await pg.evaluate(()=>({move:CB.lastMove,w:G.P.cbWeapon}));
    assert.equal(got.move,'arc');assert.equal(got.w,w);
    console.log('weapon',w,JSON.stringify(got));
  }
  const imageFailures=await pg.evaluate(()=>['atk','spin','dash'].filter(id=>{const el=document.getElementById(id);return !el||getComputedStyle(el).backgroundImage==='none';}));
  assert.equal(imageFailures.length,0,'all three generated button backgrounds');
  await pg.screenshot({path:'/tmp/choseon-combo-test.png'});
  if(errors.length)throw new Error('pageerrors: '+errors.join(' | '));
  console.log('PASS: 7 combo sequences, 3 weapons, no auto repeat, buttons');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
