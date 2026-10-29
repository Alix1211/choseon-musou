const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const N=+process.argv[2]||4;
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:1000,height:600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.G&&G.UI.mode==='title',null,{timeout:60000});
await p.evaluate(n=>{G.S.cheat=1;G.startStage(n,1);G.P.hp=1e8;},N);await p.waitForFunction(()=>G.P.mode==='manual',null,{timeout:15000});
const r=await p.evaluate(n=>{G.UI.paused=true;const m=G.M,w=m.wei,tick=dt=>{G.UI.paused=false;G.weiTick(dt);G.UI.paused=true;};const out={start:m.mis,country:m.set};
if(n===4){out.reachable=w.depots.every(d=>!G.blockedAt(d.x,d.y,18));G.killMob(m.guard);out.early=!m.exit.open;
G.P.x=m.D.start.cx*48;G.P.y=m.D.start.cy*48;G.UI.paused=false;G.breakJars(1);G.UI.paused=true;out.far=w.depots.every(d=>!d.burning);
for(const d of w.depots){G.P.x=d.x;G.P.y=d.y;G.UI.paused=false;G.breakJars(120);G.UI.paused=true;}const before=w.depots[0].burning;G.weiTick(4);out.pause=w.depots[0].burning===before;tick(2);out.partial=!m.exit.open;tick(1);out.open=m.exit.open;}
if(n===6){out.reachable=!G.blockedAt(w.trap.x,w.trap.y,18);G.killMob(w.lead);out.early=!m.exit.open;tick(.1);out.retry=!w.lead.dead&&w.phase==='approach';G.P.x=w.lead.x;G.P.y=w.lead.y;G.weiTick(3);out.pause=w.phase==='approach';tick(1);out.partial=w.phase==='approach'&&!m.exit.open;tick(1);out.lured=w.phase==='lured'&&!m.exit.open;const offsets=[[80,0],[-80,0],[0,80],[0,-80]];const o=offsets.find(o=>!G.blockedAt(w.lead.x+o[0],w.lead.y+o[1],18));if(o){G.P.x=w.lead.x+o[0];G.P.y=w.lead.y+o[1];const d=Math.hypot(G.P.x-w.lead.x,G.P.y-w.lead.y);G.UI.paused=false;for(let i=0;i<5;i++)G.step(.05);G.UI.paused=true;out.follow=Math.hypot(G.P.x-w.lead.x,G.P.y-w.lead.y)<d;}else out.follow=false;G.P.x=w.trap.x;G.P.y=w.trap.y;tick(2);out.playerOnly=!m.exit.open;w.lead.x=w.trap.x;w.lead.y=w.trap.y;tick(1);out.hold=!m.exit.open;tick(.5);out.open=m.exit.open&&w.lead.down;}
return out;},N);
assert.equal(r.start,'wei'+N);assert.equal(r.country,'0');for(const [k,v]of Object.entries(r))if(!['start','country'].includes(k))assert.equal(v,true,k);assert.deepEqual(errors,[]);
await p.evaluate(n=>{G.startStage(n,1);G.UI.paused=true;const q=G.weiTarget();if(q){G.P.x=q.x;G.P.y=q.y+90;G.cam.x=q.x;G.cam.y=q.y;}},N);await p.screenshot({path:'/workspace/scratch/6684aa49d344/test-runtime/wei'+N+'.png'});
console.log(N+'판 규칙 통과',JSON.stringify(r));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
