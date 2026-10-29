const assert=require('node:assert/strict');const {chromium}=require('playwright');const path=require('node:path');
(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1000,height:600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
// 같은 GitHub 에셋을 로컬 사본으로 공급: HTML/메뉴 시험에서 원격 다운로드 반복을 피한다.
await p.route('https://raw.githubusercontent.com/Alix1211/choseon-musou/**',r=>{const u=new URL(r.request().url());const k=u.pathname.indexOf('/a/');return k<0?r.continue():r.fulfill({path:path.join(__dirname,u.pathname.slice(k+1))});});
await p.goto('http://localhost:8766/wei-test.html');await p.waitForFunction(()=>window.G&&G.UI.mode==='title',null,{timeout:60000});assert.equal(await p.locator('#weiPick option').count(),10);
const expected=['cmd','towers','guard','wei4','defend05','wei6','wei7','wei8','wei9','wei10'],out=[];
for(let n=1;n<=10;n++){if(n>1){await p.evaluate(()=>G.UI.paused=true);await p.locator('#weiTest').waitFor({state:'visible'});}await p.selectOption('#weiPick',String(n));await p.click('#weiGo');await p.waitForFunction(n=>G.M.n===n,n);const q=await p.evaluate(()=>({n:G.M.n,mis:G.M.mis,set:G.M.set,paused:G.UI.paused}));assert.equal(q.mis,expected[n-1]);assert.equal(q.set,'0');assert.equal(q.paused,false);out.push(q);}
await p.evaluate(()=>G.UI.paused=true);assert.deepEqual(errors,[]);console.log('위나라 1~10판 선택/시작 통과',JSON.stringify(out));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
