const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
const r=await pg.evaluate(()=>{
  G.S.cheat=1;G.startStage(1,1);const m=G.M,D=m.D;
  return {W:m.W,H:m.H,g:D.g.map(r=>Array.from(r)),tk:Array.from(m.tk||[]),oh:m.openHour,orm:m.openerRoom&&[m.openerRoom.cx,m.openerRoom.cy],cap:m.captain&&[m.captain.x/48,m.captain.y/48],start:D.start,exit:m.exit,
    cols:m.colonies.map(c=>[c.cx/48,c.cy/48,c.boss?1:0,c.guard?1:0,c.cmd?1:0]),
    P:[G.P.x/48,G.P.y/48],mis:m.mis,path:m.path,keys:Object.keys(m).join(','),dk:Object.keys(D).join(','),
    guard:m.guard&&[m.guard.x/48,m.guard.y/48],cmd:m.cmdr&&[m.cmdr.x/48,m.cmdr.y/48]};
});
require('fs').writeFileSync('/tmp/dump.json',JSON.stringify(r));
console.log(r.W,r.H,'start',JSON.stringify(r.start),'exit',JSON.stringify(r.exit),'P',r.P,'mis',r.mis);
console.log(r.keys);console.log(r.dk);console.log(JSON.stringify(r.cols));
await b.close();})();
