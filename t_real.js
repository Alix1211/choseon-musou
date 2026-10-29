const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:844,height:390}});
const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));
await pg.goto('http://localhost:8766/index.html');
await pg.waitForFunction(()=>window.G&&window.G.UI&&window.G.UI.mode==='title',null,{timeout:60000});
const res=await pg.evaluate((focus)=>{
  const out=[];G.S.cheat=1;
  const walk=(g,x,y)=>{const tx=Math.floor(x),ty=Math.floor(y);return g[ty]&&g[ty][tx]===1||(g[ty]&&g[ty][tx]>=1);};
  for(let n=focus||1;n<=(focus||40);n++){
    G.startStage(n,1);const run=G.M.run;
    for(let k=0;k<run.specs.length;k++){
      if(k>0)G.buildKan(run,k,{clock:0,k0:0,replay:false});
      const m=G.M,D=m.D,TS=48,W=m.W,H=m.H;
      // 실제 충돌(반경18)로 12px 격자 BFS. 문/내성문은 열린 상태로 가정.
      const g=D.g.map(r=>Uint8Array.from(r));
      if(m.exit)for(let x=m.exit.x0;x<=m.exit.x1;x++)g[m.exit.y][x]=1;
      for(const gt of m.gates)for(const [x,y] of gt.cells)g[y][x]=1;
      const old=D.g;D.g=g;
      const S=12,GW=W*TS/S,GH=H*TS/S,seen=new Uint8Array(GW*GH);
      const bl=(px,py)=>{const r=18;for(const [ox,oy] of [[-r,0],[r,0],[0,-r*.6],[0,2],[-r*.7,-r*.4],[r*.7,-r*.4]]){const tx=Math.floor((px+ox)/TS),ty=Math.floor((py+oy)/TS);if(ty<0||tx<0||ty>=H||tx>=W||!g[ty][tx])return true;}return false;};
      // 블록 소품(furniture)도 반영?  m.blocks 는 D.g 에 반영돼 있다고 가정
      const sx=Math.floor(D.start.cx*TS/S),sy=Math.floor(D.start.cy*TS/S);
      const q=[sy*GW+sx];seen[q[0]]=1;
      for(let h=0;h<q.length;h++){const c=q[h],x=c%GW,y=(c/GW)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GW||ny>=GH||seen[ny*GW+nx])continue;if(bl(nx*S+S/2,ny*S+S/2))continue;seen[ny*GW+nx]=1;q.push(ny*GW+nx);}}
      const ok=(px,py)=>{const x=Math.floor(px/S),y=Math.floor(py/S);for(let a=-3;a<=3;a++)for(let c=-3;c<=3;c++){const xx=x+a,yy=y+c;if(xx>=0&&yy>=0&&xx<GW&&yy<GH&&seen[yy*GW+xx])return true;}return false;};
      const miss=[];
      for(const c of m.colonies){if(!ok(c.cx,c.cy))miss.push('col '+Math.round(c.cx/TS)+','+Math.round(c.cy/TS));}
      if(m.exit&&!ok((m.exit.x0+1)*TS,(m.exit.y+1)*TS))miss.push('exit');
      for(const mb of G.mobs){if(mb.captive||mb.hero){if(!ok(mb.x,mb.y))miss.push('hero');}}
      D.g=old;
      out.push({n,k,t:m.sp.t,miss});
    }
  }
  return out;
},Number(process.argv[2])||0);
const bad=res.filter(r=>r.miss.length);
console.log('total',res.length,'bad',bad.length);
for(const r of bad.slice(0,60))console.log(r.n,r.k,r.t,r.miss.join(' | '));
console.log(JSON.stringify(errs));await b.close();})();
