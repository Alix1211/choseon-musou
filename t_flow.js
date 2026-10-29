const {chromium}=require('playwright');
const N=+process.argv[2]||3;
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|Failed to load resource/.test(m.text()))errs.push(m.text())});pg.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
await pg.goto('http://localhost:8766/'+(process.env.F||'index.html'));
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
await pg.evaluate(n=>{G.S.cheat=1;G.startStage(n,1);},N);
const skip=async()=>{for(let i=0;i<4;i++){if(await pg.evaluate(()=>G.UI.mode)==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(350);}}};
const st=()=>pg.evaluate(()=>({k:G.M.idx,mis:G.M.mis,mode:G.UI.mode,pm:G.P.mode,ex:G.M.exit&&G.M.exit.open,gate:G.M.gates[0]&&G.M.gates[0].open,mobs:G.mobs.length}));
const tot=await pg.evaluate(()=>G.M.run.specs.length);
for(let k=0;k<tot;k++){
  await pg.waitForTimeout(1200);await skip();
  await pg.waitForFunction(()=>G.UI.mode==='battle'&&G.P.mode==='manual',null,{timeout:15000});
  console.log('kan',k,JSON.stringify(await st()));
  if(await pg.evaluate(()=>G.M.mis==='wei9')){
    await pg.evaluate(()=>{G.P.hp=1e8;const w=G.M.wei;G.P.x=w.lever.x;G.P.y=w.lever.y;G.weiTick(1.5);});
  }
  if(await pg.evaluate(()=>G.M.mis==='wei8')){
    await pg.evaluate(()=>{G.P.hp=1e8;const w=G.M.wei;G.P.x=w.jar.x;G.P.y=w.jar.y;G.breakJars(120);G.P.x=w.gate.far.x;G.P.y=w.gate.far.y;G.weiTick(.1);});
  }
  if(await pg.evaluate(()=>G.M.mis==='wei7')){
    await pg.evaluate(()=>{G.P.hp=1e8;const w=G.M.wei;G.P.x=w.point.x;G.P.y=w.point.y;G.weiTick(.1);for(const c of w.cols)for(const q of [...c.mobs])if(!q.dead)G.killMob(q);G.weiTick(.1);});
  }
  if(await pg.evaluate(()=>G.M.mis==='wei6')){
    await pg.evaluate(()=>{G.P.hp=1e8;const w=G.M.wei;G.P.x=w.lead.x;G.P.y=w.lead.y;G.weiTick(2);G.P.x=w.trap.x;G.P.y=w.trap.y;w.lead.x=w.trap.x;w.lead.y=w.trap.y;G.weiTick(1.5);});
  }
  if(await pg.evaluate(()=>G.M.mis==='wei4')){
    await pg.evaluate(()=>{G.P.hp=1e8;for(const d of G.M.wei.depots){G.P.x=d.x;G.P.y=d.y;G.breakJars(120);}G.weiTick(3);});
  }
  if(await pg.evaluate(()=>G.M.mis==='defend05')){
    // 60초를 실시간 대기하지 않고 방어 조건·증원·역습 연결을 확인한다.
    await pg.evaluate(()=>{const d=G.M.defense05;G.P.hp=1e8;G.P.x=d.x;G.P.y=d.y;for(let i=0;i<60;i++)G.gimTick(1);});
    if((await pg.evaluate(()=>G.M.mis))!=='guard')throw new Error('방어 후 역습 전환 실패');
  }
  if(await pg.evaluate(()=>G.M.mis==='towers')){
    // 감시탑은 실제 공격으로 지휘병을 제압하고, 각 탑에서 점령한다.
    for(let i=0;i<2;i++){
      await pg.evaluate(i=>{const q=G.M.towers.list[i],g=q.lead;G.P.hp=1e8;G.P.x=q.x-60;G.P.y=q.y;g.hp=1;g.x=q.x;g.y=q.y;g.col.woken=true;G.setAtk(true);},i);
      await pg.waitForFunction(i=>G.M.towers.list[i].lead.dead,i,{timeout:15000});
      await pg.evaluate(i=>{G.setAtk(false);const q=G.M.towers.list[i];G.P.x=q.x;G.P.y=q.y;},i);
      await pg.waitForFunction(i=>G.M.towers.list[i].captured,i,{timeout:10000});
    }
  }else if(await pg.evaluate(()=>['cmd','guard'].includes(G.M.mis))){
  // 우두머리/부장 쓰러뜨리기
  await pg.evaluate(()=>{const m=G.M,g=m.beacon||m.guard||m.captain;g.hp=1;G.P.x=g.x-90;G.P.y=g.y+10;G.cam.x=G.P.x;G.cam.y=G.P.y;for(const a of G.allies){a.x=G.P.x;a.y=G.P.y+30;}});
  await pg.waitForTimeout(250);
  await pg.evaluate(()=>{const m=G.M,g=m.beacon||m.guard||m.captain;g.x=G.P.x+60;g.y=G.P.y;G.setAtk(true);});
  for(let w=0;w<40;w++){const m=await pg.evaluate(()=>{const g=G.M.beacon||G.M.guard||G.M.captain;if(g&&!g.dead&&G.P.mode!=='dead'){g.x=G.P.x+60;g.y=G.P.y;}return G.M.mis;});if(m!=='cmd'&&m!=='guard')break;await pg.waitForTimeout(300);}await pg.evaluate(()=>G.setAtk(false));
  console.log(' after kill',JSON.stringify(await st()));
  }
  if(k<tot-1&&!(await pg.evaluate(()=>G.M.exit.open)))throw new Error('출구가 열리지 않음: '+k);
  if(k<tot-1){
    await pg.evaluate(()=>{const e=G.M.exit;G.P.x=e.x1*48;G.P.y=(e.y+1.2)*48;});
    await pg.waitForTimeout(1500);
    await pg.evaluate(()=>{const e=G.M.exit;if(G.M.idx===0&&0){}});
    // 문 안으로 걸어들어가기
    await pg.evaluate(()=>{G.keys.up=1;});await pg.waitForTimeout(900);await pg.evaluate(()=>{G.keys.up=0;});
    await pg.waitForTimeout(1500);
    console.log(' moved',JSON.stringify(await st()));
    if((await pg.evaluate(()=>G.M.idx))!==k+1)throw new Error('다음 칸으로 이동 실패: '+k);
  }
}
// 마지막 칸: 내성문 → 내성
await pg.evaluate(()=>{const m=G.M,kp=m.L.keep;G.P.x=(kp.cx)*48;G.P.y=(kp.cy+1)*48;G.cam.x=G.P.x;G.cam.y=G.P.y;});
await pg.waitForTimeout(1500);console.log(' keep',JSON.stringify(await st()));await skip();
await pg.screenshot({path:'/tmp/flow_keep.png'});
console.log(' heroes',JSON.stringify(await pg.evaluate(()=>({h:G.M.heroes.length,hero:!!G.M.hero,mis:G.M.mis,kind:G.M.cfgKind}))));
console.log('errs',JSON.stringify(errs));await b.close();})();
