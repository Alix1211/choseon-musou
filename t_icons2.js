const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
await pg.evaluate(()=>{G.S.cheat=1;G.startStage(1,1);});
for(let i=0;i<5;i++){if(await pg.evaluate(()=>G.UI.mode)==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(350);}}
await pg.evaluate(()=>{G.S.eq.weapon.w='whip';G.recalc();G.S.roster.push('zhenji');G.S.party.push('zhenji');G.addAlly('zhenji',G.P.x+40,G.P.y+40);});
await pg.waitForTimeout(700);
await pg.screenshot({path:'/tmp/ic_ally.png'});
await pg.click('#cmd');await pg.waitForTimeout(300);
await pg.screenshot({path:'/tmp/ic_menu.png'});
console.log('errs',JSON.stringify(errs));await b.close();})();
