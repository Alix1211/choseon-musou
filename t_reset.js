const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:844,height:390}});const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
// 진행 상황이 있는 저장을 만든다
await pg.evaluate(()=>{G.S.lv=16;G.S.roster=['zhenji'];G.S.cl={1:3};localStorage.setItem('choseon_musou_v2',JSON.stringify(G.S));});
await pg.reload();await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
console.log('before lv',await pg.evaluate(()=>G.S.lv));
await pg.click('#tb_go');await pg.waitForTimeout(300);
console.log('ask text',await pg.evaluate(()=>document.getElementById('tb_go').textContent));
await pg.click('#tb_go');
await pg.waitForTimeout(1500);
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
await pg.waitForTimeout(6000); // 자동저장 주기 지나도록
await pg.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
console.log('after lv',await pg.evaluate(()=>G.S.lv),'roster',await pg.evaluate(()=>JSON.stringify(G.S.roster)),'saved',await pg.evaluate(()=>(JSON.parse(localStorage.getItem('choseon_musou_v2')||'{}').lv)));
console.log('btn text',await pg.evaluate(()=>document.getElementById('tb_go').textContent),'cont disabled',await pg.evaluate(()=>document.getElementById('tb_1').disabled));
console.log(JSON.stringify(errs));await b.close();})();
