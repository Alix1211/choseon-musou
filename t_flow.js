const {chromium}=require('playwright');
const N=+process.argv[2]||3;
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|Failed to load resource/.test(m.text()))errs.push(m.text())});pg.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
await pg.evaluate(n=>{G.S.cheat=1;G.startStage(n,1);},N);
const skip=async()=>{for(let i=0;i<4;i++){if(await pg.evaluate(()=>G.UI.mode)==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(350);}}};
const st=()=>pg.evaluate(()=>({k:G.M.idx,mis:G.M.mis,mode:G.UI.mode,pm:G.P.mode,ex:G.M.exit&&G.M.exit.open,gate:G.M.gates[0]&&G.M.gates[0].open,mobs:G.mobs.length}));
const tot=await pg.evaluate(()=>G.M.run.specs.length);
for(let k=0;k<tot;k++){
  await pg.waitForTimeout(1200);await skip();
  console.log('kan',k,JSON.stringify(await st()));
  // 우두머리/부장 쓰러뜨리기
  await pg.evaluate(()=>{const m=G.M,g=m.beacon||m.guard||m.captain;g.hp=1;G.P.x=g.x-90;G.P.y=g.y+10;G.cam.x=G.P.x;G.cam.y=G.P.y;for(const a of G.allies){a.x=G.P.x;a.y=G.P.y+30;}});
  await pg.waitForTimeout(250);
  await pg.evaluate(()=>{const m=G.M,g=m.beacon||m.guard||m.captain;g.x=G.P.x+60;g.y=G.P.y;G.setAtk(true);});
  for(let w=0;w<40;w++){const m=await pg.evaluate(()=>{const g=G.M.beacon||G.M.guard||G.M.captain;if(g&&!g.dead&&G.P.mode!=='dead'){g.x=G.P.x+60;g.y=G.P.y;}return G.M.mis;});if(m!=='cmd'&&m!=='guard')break;await pg.waitForTimeout(300);}await pg.evaluate(()=>G.setAtk(false));
  console.log(' after kill',JSON.stringify(await st()));
  if(k<tot-1){
    await pg.evaluate(()=>{const e=G.M.exit;G.P.x=e.x1*48;G.P.y=(e.y+1.2)*48;});
    await pg.waitForTimeout(1500);
    await pg.evaluate(()=>{const e=G.M.exit;if(G.M.idx===0&&0){}});
    // 문 안으로 걸어들어가기
    await pg.evaluate(()=>{G.keys.up=1;});await pg.waitForTimeout(900);await pg.evaluate(()=>{G.keys.up=0;});
    await pg.waitForTimeout(1500);
    console.log(' moved',JSON.stringify(await st()));
  }
}
// 마지막 칸: 내성문 → 내성
await pg.evaluate(()=>{const m=G.M,kp=m.L.keep;G.P.x=(kp.cx)*48;G.P.y=(kp.cy+1)*48;G.cam.x=G.P.x;G.cam.y=G.P.y;});
await pg.waitForTimeout(1500);console.log(' keep',JSON.stringify(await st()));await skip();
await pg.screenshot({path:'/tmp/flow_keep.png'});
console.log(' heroes',JSON.stringify(await pg.evaluate(()=>({h:G.M.heroes.length,hero:!!G.M.hero,mis:G.M.mis,kind:G.M.cfgKind}))));
console.log('errs',JSON.stringify(errs));await b.close();})();
