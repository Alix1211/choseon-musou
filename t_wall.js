const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|Failed to load resource/.test(m.text()))errs.push(m.text())});
await pg.goto('http://localhost:8766/'+(process.argv[2]||'index.html'));
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
await pg.evaluate(()=>{G.S.cheat=1;G.startStage(3,1);});
await pg.waitForTimeout(1500);
for(let i=0;i<4;i++){if(await pg.evaluate(()=>G.UI.mode)==='dlg'){await pg.click('[data-a="dskip"]');await pg.waitForTimeout(350);}}
const out=await pg.evaluate(async()=>{
  const g=G.M.D.g,H=g.length,W=g[0].length;
  let spot={cx:21,cy:18};for(let y=15;y<=21;y++)for(let x=17;x<=25;x++)g[y][x]=1;
  const {cx,cy}=spot;
  for(let y=cy-2;y<=cy+2;y++)g[y][cx]=0;      // 가운데에 세로 벽
  G.P.x=(cx-3+.5)*48;G.P.y=(cy+.5)*48;G.P.hp=1e9;G.P.mode='hunt';
  const m=G.mobs.find(q=>!q.dead&&!q.boss&&!q.static&&q.type);
  for(const o of G.mobs){if(o!==m){o.dead=true;o.deadT=99;}}
  G.allies.length=0;
  m.x=(cx+3+.5)*48;m.y=(cy+.5)*48;m.col.woken=true;m.hp=m.maxHp=1e9;m.atk=0;m.stun=0;
  const start=Math.hypot(m.x-G.P.x,m.y-G.P.y);let minD=start,res='no',t=0;
  for(let i=0;i<600;i++){await new Promise(r=>setTimeout(r,20));G.P.x=(cx-3+.5)*48;G.P.y=(cy+.5)*48;const d=Math.hypot(m.x-G.P.x,m.y-G.P.y);minD=Math.min(minD,d);if(d<90){res='reached';t=i;break;}}
  return {start:Math.round(start),minD:Math.round(minD),res,t,mx:Math.round(m.x),my:Math.round(m.y),type:m.type,sp:m.sp};
});
console.log('chase',JSON.stringify(out));
console.log('errs',JSON.stringify(errs));await b.close();})();
