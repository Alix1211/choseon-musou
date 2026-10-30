# Canonical whip range: 170px from player, identical visual/hit limit.
# This generator patch runs after p2musou/p2combo to preserve original inputs.
# Gear ST.rng never extends the displayed whip beyond this distance.
rep("L=(REACH.whip+34)*ST.rng;","L=REACH.whip;")
rep("const t=aimT(list),a=t?ang(t.m):0,ga=t?gang(t.m):0,L=REACH.whip;",
    "const t=aimT(list),ga=t?gang(t.m):0,a=ga,L=REACH.whip;")
rep("fx.push({k:'whip',x:px,y:py,a,t:0,life:.30,L:Math.min(L,t?Math.hypot(t.m.x-P.x,(t.m.y-30)-py)+30:L)});",
    "fx.push({k:'whip',x:px,y:py,a,t:0,life:.30,L});")
rep("if(al>0&&al<L+m.scale*12&&pr<50+m.scale*14)hitMob(m,base*.85,'whip',120,Math.atan2(dy,dx));",
    "if(al>0&&Math.hypot(dx,dy)<=L&&pr<=22)hitMob(m,base*.85,'whip',120,Math.atan2(dy,dx));")
rep("const reachW=w=>w==='whip'?REACH.whip*ST.rng:REACH[w];","const reachW=w=>REACH[w];")
# '휘감기': no target outside the same 170px striking reach.
rep("Math.hypot(m.x-P.x,m.y-P.y)<420&&hasLOS(P.x,P.y,m.x,m.y)",
    "Math.hypot(m.x-P.x,m.y-P.y)<=REACH.whip&&hasLOS(P.x,P.y,m.x,m.y)")
rep("fx.push({k:'whip',x:px,y:py,a:ang(m),t:0,life:.3,L:Math.hypot(m.x-P.x,(m.y-30)-py)+30});",
    "fx.push({k:'whip',x:px,y:py,a:Math.atan2(m.y-P.y,m.x-P.x),t:0,life:.3,L:REACH.whip});")
rep("if(rdy(0)&&cnt(380)>=3&&n.d>130)return 0;",
    "if(rdy(0)&&cnt(REACH.whip)>=3&&n.d>90&&n.d<=REACH.whip)return 0;")
rep("if(rdy(1)&&n.los&&n.d<=330)return 1;",
    "if(rdy(1)&&n.los&&n.d<=REACH.whip)return 1;")
# Rendering takes f.L as the TOTAL reach. Old trail mistakenly added 40px.
# Tip centre at (reach-6), with widest stroke 12px -> outer pixels <=170.
rep("      cx.save();cx.shadowBlur=12;cx.shadowColor='rgba(255,145,218,.7)';",
    "      cx.save(); // GPU-friendly: no shadow blur")
rep("      const ext=easeOut(Math.min(1,f.t/.09)),fadeA=f.t<.1?1:1-(f.t-.1)/(f.life-.1),L=f.L*ext;",
    "      const ext=easeOut(Math.min(1,f.t/.09)),fadeA=f.t<.1?1:1-(f.t-.1)/(f.life-.1),L=Math.max(0,Math.min(f.L,REACH.whip)-6)*ext;")
rep("      const pts=[];for(let i=0;i<=20;i++){const q=i/20,w=Math.sin(q*Math.PI*3-f.t*55)*(1-q)*20*(1-ext*.6);pts.push([f.x+c*(40+q*L)+nx*w,f.y+s*(40+q*L)+ny*w]);}",
    "      const pts=[];for(let i=0;i<=20;i++){const q=i/20,d=L*q,w=Math.sin(q*Math.PI*3-f.t*55)*(1-q)*q*12;pts.push([f.x+c*d+nx*w,f.y+s*d+ny*w]);}")
rep("      const tp=pts[20];glow(tp[0],tp[1],26*fadeA+4,'rgba(255,255,255,'+.7*fadeA+')','rgba(255,90,170,0)');cx.restore();",
    "      const tp=pts[20];glow(tp[0],tp[1],Math.min(5,REACH.whip-L)*fadeA,'rgba(255,255,255,'+.7*fadeA+')','rgba(255,90,170,0)');cx.restore();")
