const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
for(const [n,k] of [[1,0],[13,0],[13,1],[13,2],[25,2],[40,4]]){
  const r=await pg.evaluate(async([n,k])=>{
    G.S.cheat=1;const t0=performance.now();G.startStage(n,1);for(let i=0;i<k;i++){G.M.run.idx++;G.buildKan(G.M.run,G.M.run.idx,{clock:0,k0:0,replay:false});}
    const build=performance.now()-t0;
    G.UI.mode='battle';
    // 걸으며 렌더
    G.keys.right=1;let frames=0,worst=0,t1=performance.now(),last=t1;
    await new Promise(res=>{function f(now){frames++;worst=Math.max(worst,now-last);last=now;if(now-t1<4000)requestAnimationFrame(f);else res();}requestAnimationFrame(f);});
    G.keys.right=0;
    return {n,k,sty:G.M.sty,W:G.M.W,H:G.M.H,buildMs:Math.round(build),fps:Math.round(frames/4),worstMs:Math.round(worst),chunks:G.M.chunks.size};
  },[n,k]);
  console.log(JSON.stringify(r));
}
console.log('errs',JSON.stringify(errs));await b.close();})();
