const assert=require('node:assert/strict');const {chromium}=require('playwright');const path=require('node:path');
(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1000,height:600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
// 같은 GitHub 에셋을 로컬 사본으로 공급: HTML/메뉴 시험에서 원격 다운로드 반복을 피한다.
await p.route('https://raw.githubusercontent.com/Alix1211/choseon-musou/**',r=>{const u=new URL(r.request().url());const k=u.pathname.indexOf('/a/');return k<0?r.continue():r.fulfill({path:path.join(__dirname,u.pathname.slice(k+1))});});
await p.goto('http://localhost:8766/wu-test.html');await p.waitForFunction(()=>window.G&&G.UI.mode==='title',null,{timeout:60000});assert.equal(await p.locator('#wuPick option').count(),10);
const out=[];
for(let n=11;n<=20;n++){if(n>11){await p.evaluate(()=>G.UI.paused=true);await p.locator('#wuTest').waitFor({state:'visible'});}await p.selectOption('#wuPick',String(n));await p.click('#wuGo');await p.waitForFunction(n=>G.M.n===n&&G.P.mode==='manual',n);const q=await p.evaluate(()=>({n:G.M.n,mis:G.M.mis,set:G.M.set,paused:G.UI.paused,mapFog:document.getElementById('mm').style.filter}));assert.equal(q.mis,'wei'+n);assert.equal(q.set,'2');assert.equal(q.paused,false);if(n===15)assert.equal(q.mapFog,'blur(8px)');if(n===16)assert.equal(q.mapFog,'');out.push(q);}
await p.evaluate(()=>G.UI.paused=true);assert.deepEqual(errors,[]);console.log('오나라 11~20판 선택/시작 통과',JSON.stringify(out));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
