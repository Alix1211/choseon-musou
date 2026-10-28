const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
const res=await pg.evaluate(()=>{
  const out=[];G.S.cheat=1;
  for(let n=1;n<=40;n++){
    G.startStage(n,1);const run=G.M.run;
    for(let k=0;k<run.specs.length;k++){
      if(k>0)G.buildKan(run,k,{clock:0,k0:0,replay:false});
      const m=G.M,g=m.D.g,W=m.W,H=m.H;
      // 통로 점검 : 문/내성문 열린 상태로 시작점에서 도달 가능한가
      const g2=g.map(r=>Uint8Array.from(r));
      if(m.exit)for(let x=m.exit.x0;x<=m.exit.x1;x++)g2[m.exit.y][x]=1;
      for(const gt of m.gates)for(const [x,y] of gt.cells)g2[y][x]=1;
      const sx=m.D.start.cx,sy=m.D.start.cy,seen=new Uint8Array(W*H),q=[sy*W+sx];seen[sy*W+sx]=1;
      for(let h=0;h<q.length;h++){const c=q[h],x=c%W,y=(c/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||!g2[ny][nx]||seen[ny*W+nx])continue;seen[ny*W+nx]=1;q.push(ny*W+nx);}}
      let bad=0;for(const c of m.colonies){const x=Math.floor(c.cx/48),y=Math.floor(c.cy/48);if(!seen[y*W+x])bad++;}
      for(const mb of G.mobs){const x=Math.floor(mb.x/48),y=Math.floor(mb.y/48);if(!seen[y*W+x]&&!mb.captive&&!mb.hero)bad+=100;}
      const exitOk=!m.exit||seen[(m.exit.y)*W+m.exit.x0];
      const chests=m.props.filter(p=>p.chest).length,jars=m.props.filter(p=>p.jar).length;
      const alive=G.mobs.filter(x=>!x.captive).length;
      out.push({n,k,t:m.sp.t,sz:m.sp.sz,W,H,mobs:alive,cols:m.colonies.length,props:m.props.length,chests,jars,bad,exitOk:!!exitOk,guard:!!(m.guard||m.captain||m.beacon),last:m.sp.last});
    }
  }
  return out;
});
let badc=0;for(const r of res){if(r.bad||!r.exitOk||!r.guard){badc++;console.log('BAD',JSON.stringify(r));}}
console.log('total 칸',res.length,'bad',badc);
const byT={};for(const r of res){const o=byT[r.t]=byT[r.t]||{c:0,mobs:0,props:0,ch:0,jr:0};o.c++;o.mobs+=r.mobs;o.props+=r.props;o.ch+=r.chests;o.jr+=r.jars;}
for(const t in byT){const o=byT[t];console.log(t,o.c,'avg mobs',(o.mobs/o.c).toFixed(1),'props',(o.props/o.c).toFixed(0),'chests',(o.ch/o.c).toFixed(1),'jars',(o.jr/o.c).toFixed(1));}
require('fs').writeFileSync('/tmp/all.json',JSON.stringify(res));
console.log('errs',JSON.stringify(errs));await b.close();})();
