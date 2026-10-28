const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|Failed to load resource/.test(m.text()))errs.push(m.text())});
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
await pg.evaluate(()=>{G.S.cheat=1;G.startStage(1,1);});
for(let i=0;i<5;i++){if(await pg.evaluate(()=>G.UI.mode)==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(350);}}
await pg.waitForTimeout(800);
const info=()=>pg.evaluate(()=>{const g=id=>{const e=document.getElementById(id),s=getComputedStyle(e);return {dis:e.disabled,txt:e.textContent,bg:(s.backgroundImage.match(/sk\/(\w+)\.webp/)||[])[1]||s.backgroundImage.slice(0,30)}};return {w:document.body.dataset.w,cmd:g('cmd'),atk:g('atk'),sk1:g('sk1'),sk2:g('sk2'),spin:g('spin'),act:!!document.getElementById('act')}});
for(const w of ['sword','whip','fan']){
  await pg.evaluate(w=>{G.S.eq.weapon.w=w;G.recalc();},w);await pg.waitForTimeout(500);
  console.log(w,JSON.stringify(await info()));
  await pg.screenshot({path:'/tmp/ic_'+w+'.png'});
}
// 스킬 사용 직후(재사용 대기) 모습 — 마지막 무기(fan)
await pg.evaluate(()=>{G.useSkill(0,null,null);});await pg.waitForTimeout(1500);
console.log('cooldown',JSON.stringify(await info()));
await pg.screenshot({path:'/tmp/ic_cd.png'});
console.log('errs',JSON.stringify(errs));await b.close();})();
