const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
for(const n of [1,10,11,20,21,30,31,40]){
  await pg.evaluate(n=>{G.S.cheat=1;G.startStage(n,1);},n);await pg.waitForTimeout(900);
  for(let i=0;i<4;i++){if(await pg.evaluate(()=>G.UI.mode)==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(300);}}
  const r=await pg.evaluate(()=>{const c={};for(const m of G.mobs){if(m.dead)continue;const k=m.set+(m.commander?'(cmd)':'');c[k]=(c[k]||0)+1;}return {idx:G.M.idx,mset:G.M.set,c}});
  console.log(n,JSON.stringify(r));
}
await b.close();})();
