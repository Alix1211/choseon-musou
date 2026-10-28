const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
const res=await pg.evaluate(()=>{
  const out=[];G.S.cheat=1;
  for(let n=1;n<=40;n++){
    G.startStage(n,1);const run=G.M.run;
    for(let k=0;k<run.specs.length;k++){
      if(k>0)G.buildKan(run,k,{clock:0,k0:0,replay:false});
      const m=G.M,D=m.D,W=m.W,H=m.H,TS=48;
      const g=D.g.map(r=>Uint8Array.from(r));
      if(m.exit)for(let x=m.exit.x0;x<=m.exit.x1;x++)g[m.exit.y][x]=1;
      for(const gt of m.gates)for(const [x,y] of gt.cells)g[y][x]=1;
      const blk=(x,y)=>x>=0&&y>=0&&x+1<W&&y+1<H&&g[y][x]&&g[y][x+1]&&g[y+1][x]&&g[y+1][x+1];
      const seen=new Uint8Array(W*H);let q=[];
      const sx=Math.floor(D.start.cx),sy=Math.floor(D.start.cy);
      for(let a=-5;a<=5;a++)for(let c=-5;c<=5;c++)if(blk(sx+a,sy+c)&&!seen[(sy+c)*W+sx+a]){seen[(sy+c)*W+sx+a]=1;q.push((sy+c)*W+sx+a);}
      for(let h=0;h<q.length;h++){const c=q[h],x=c%W,y=(c/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!blk(nx,ny)||seen[ny*W+nx])continue;seen[ny*W+nx]=1;q.push(ny*W+nx);}}
      const near=(tx,ty)=>{for(let a=-2;a<=1;a++)for(let c=-2;c<=1;c++){const x=tx+a,y=ty+c;if(x>=0&&y>=0&&x<W&&y<H&&seen[y*W+x])return true;}return false;};
      const miss=[];
      for(const c of m.colonies)if(!near(Math.floor(c.cx/TS),Math.floor(c.cy/TS)))miss.push('col '+Math.round(c.cx/TS)+','+Math.round(c.cy/TS));
      if(m.exit&&!near(m.exit.x0,m.exit.y+1))miss.push('exit');
      out.push({n,k,t:m.sp.t,miss});
    }
  }
  return out;
});
const bad=res.filter(r=>r.miss.length);
console.log('total',res.length,'bad',bad.length);const cnt={};for(const r of bad)cnt[r.t]=(cnt[r.t]||0)+1;console.log(JSON.stringify(cnt));
for(const r of bad.slice(0,80))console.log(r.n,r.k,r.t,r.miss.join(' | '));
console.log(JSON.stringify(errs));await b.close();})();
