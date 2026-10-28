function drawMinimap(){
  const c=$('mm');if(!c||!M||!M.musou)return;
  const g=c.getContext('2d'),W=M.W,H=M.H,s=Math.min(c.width/W,c.height/H),ox=(c.width-W*s)/2,oy=(c.height-H*s)/2,G=M.D.g;
  if(!M._mmb||M._mmb.width!==c.width){
    const b=newCanvas(c.width,c.height),bg=b.getContext('2d'),T=M.tk,out=M.sty==='out';
    const base=out?'rgba(70,130,84,.88)':M.sty==='hall'?'rgba(176,150,118,.88)':'rgba(150,146,164,.88)';
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const k=T[y*W+x];
      if(k===5){bg.fillStyle='rgba(60,110,170,.8)';bg.fillRect(ox+x*s,oy+y*s,s+.3,s+.3);}
      else if(k>=1){bg.fillStyle=k===3?'rgba(168,60,70,.9)':k===6?'rgba(170,148,100,.9)':k===4?'rgba(130,108,76,.9)':base;bg.fillRect(ox+x*s,oy+y*s,s+.3,s+.3);}
    }
    M._mmb=b;
  }
  g.clearRect(0,0,c.width,c.height);g.drawImage(M._mmb,0,0);
  for(const gt of M.gates){g.fillStyle=gt.open?'rgba(120,255,170,.95)':'rgba(255,90,90,.95)';g.fillRect(ox+gt.x0*s,oy+gt.y0*s,(gt.x1-gt.x0+1)*s,(gt.y1-gt.y0+1)*s);}
  const e=M.exit;
  if(e){g.fillStyle=e.open?'rgba(120,255,170,.98)':'rgba(255,90,90,.98)';g.fillRect(ox+e.x0*s-.5,oy+e.y*s-.5,(e.x1-e.x0+1)*s+1,s+1);}
  const px=q=>ox+q.x/TS*s,py=q=>oy+q.y/TS*s;
  const dot=(q,r,col)=>{g.fillStyle=col;g.beginPath();g.arc(px(q),py(q),r,0,7);g.fill();};
  for(const q of mobs){
    if(q.dead||q.col.hold||q.down&&!q.hero)continue;
    if(q.hero)dot(q,3.6,q.down?'#ffe08a':'#ffd36b');
    else if(q.captain||q.opener||q.guardL)dot(q,3.2,'#ff5a5a');
    else dot(q,1.5,'rgba(255,110,110,.95)');
  }
  for(const a of allies)dot(a,2.6,a.down?'#8a8a8a':'#5fe39a');
  const tg=misTarget();
  if(tg){const p=.5+.5*Math.sin(time*5);g.strokeStyle='rgba(255,230,120,'+(.5+.5*p)+')';g.lineWidth=1.6;g.beginPath();g.arc(px(tg),py(tg),4+3*p,0,7);g.stroke();}
  const vw=VW/Z,vh=VH/Z;g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=1;g.strokeRect(ox+(cam.x-vw/2)/TS*s,oy+(cam.y-vh/2)/TS*s,vw/TS*s,vh/TS*s);
  g.fillStyle='#fff';g.strokeStyle='#ff5aa5';g.lineWidth=1.5;g.beginPath();g.arc(px(P),py(P),3.2,0,7);g.fill();g.stroke();
}
