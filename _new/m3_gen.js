/* ───────── 칸 그리기 · 소품 · 부대 배치 · 칸 만들기 ───────── */
const HALLF=['i_wood1','i_wood2','i_wood3','i_wood4','i_stone1','i_stone2','i_check'];
const HWALL=['i_wall_cream','i_wall_paper','i_wall_red','i_wall_green','i_wall_blue','i_wall_plank','i_wall_brick','i_wall_win'];
const _scr={};
function paintChunk(m,ci,cj){
  const S_=PXT,N=CHT,pad=1,tw=(N+2*pad)*S_;
  if(!_scr.a){_scr.a=newCanvas(tw,tw);_scr.b=newCanvas(tw,tw);_scr.c=newCanvas(tw,tw);_scr.d=newCanvas(tw,tw);}
  const a=_scr.a.getContext('2d'),b=_scr.b.getContext('2d'),c=_scr.c.getContext('2d');
  a.clearRect(0,0,tw,tw);b.clearRect(0,0,tw,tw);c.clearRect(0,0,tw,tw);const d_=_scr.d.getContext('2d');d_.clearRect(0,0,tw,tw);
  const th=m.theme,sty=m.sty,tx0=ci*N-pad,ty0=cj*N-pad,{W,H,tk,fl}=m;
  const K=(x,y)=>(x<0||y<0||x>=W||y>=H)?0:tk[y*W+x];
  const wk=(x,y)=>{const k=K(x,y);return k>=1&&k!==5;};
  const tl=(nm,px,py)=>tileDraw(a,nm,px,py,S_+1,S_+1);
  if(sty==='out'){
    const base='f_'+th+'_grass',flower='f_'+th+'_grass_flower',dirt='f_'+th+'_dirt',path='f_'+th+'_path',water='f_'+th+'_water';
    const dark={spring:'rgba(18,62,24,.5)',summer:'rgba(12,52,28,.54)',autumn:'rgba(68,43,20,.44)',winter:'rgba(45,64,72,.36)',ice:'rgba(25,68,98,.38)',volcano:'rgba(50,18,10,.48)',swamp:'rgba(20,42,25,.52)'}[th];
    const liquid=th==='volcano'||th==='swamp'||th==='ice';let hasW=false;
    for(let j=0;j<N+2*pad;j++)for(let i=0;i<N+2*pad;i++){
      const x=tx0+i,y=ty0+j,px=i*S_,py=j*S_,k=K(x,y);
      if(k===0){
        let edge=false;for(let dy=-1;dy<=1&&!edge;dy++)for(let dx=-1;dx<=1;dx++)if(wk(x+dx,y+dy)){edge=true;break;}
        tl((liquid&&!edge)?water:base,px,py);b.fillStyle=dark;b.fillRect(px,py,S_+1,S_+1);
      }else if(k===5){tl(base,px,py);hasW=true;}
      else if(k===4){tl(base,px,py);a.globalAlpha=.92;tl(dirt,px,py);a.globalAlpha=1;}
      else{
        tl(hash2(x,y,1)<.18?flower:base,px,py);
        if(k===6){a.globalAlpha=.95;tl(path,px,py);a.globalAlpha=1;}
        else if(hash2(x,y,4)<.045){a.globalAlpha=.18;tl(dirt,px,py);a.globalAlpha=1;}
        // 가장자리 번짐 : 막힌 이웃 쪽으로 어두운 얼룩을 흩뿌린다 (모서리가 각져 보이지 않게)
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          if(!dx&&!dy)continue;if(K(x+dx,y+dy)!==0)continue;
          const h=hash2(x*3+dx,y*3+dy,7),rad=S_*(.5+.55*h),ox=px+S_*.5+dx*S_*(.42+.2*hash2(x,y,dx*3+dy)),oy=py+S_*.5+dy*S_*(.42+.2*hash2(y,x,dx*3+dy));
          b.fillStyle=dark;b.beginPath();b.arc(ox,oy,rad,0,7);b.fill();
        }
      }
    }
    {  // 흐림 : 작게 줄였다가 다시 키우는 방식 (기기마다 blur 필터 지원이 달라서)
      const sw=Math.ceil(tw/5),sm=_scr.s||(_scr.s=newCanvas(sw,sw)),sg=sm.getContext('2d');
      sg.clearRect(0,0,sw,sw);sg.imageSmoothingQuality='high';sg.drawImage(_scr.b,0,0,sw,sw);
      c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(sm,0,0,sw,sw,0,0,tw,tw);a.drawImage(_scr.c,0,0);
    }
    if(hasW){  // 못 : 둥글게 번진 물가 + 물
      c.clearRect(0,0,tw,tw);
      a.fillStyle='rgba(28,48,34,.30)';
      for(let j=0;j<N+2*pad;j++)for(let i=0;i<N+2*pad;i++)if(K(tx0+i,ty0+j)===5){a.beginPath();a.arc((i+.5)*S_,(j+.5)*S_,S_*.98,0,7);a.fill();}
      c.fillStyle='#000';
      for(let j=0;j<N+2*pad;j++)for(let i=0;i<N+2*pad;i++)if(K(tx0+i,ty0+j)===5){c.beginPath();c.arc((i+.5)*S_,(j+.5)*S_,S_*.74,0,7);c.fill();}
      for(let j=0;j<N+2*pad;j++)for(let i=0;i<N+2*pad;i++){const x=tx0+i,y=ty0+j;let near=false;for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1;dx++)if(K(x+dx,y+dy)===5){near=true;break;}if(near)tileDraw(d_,water,i*S_,j*S_,S_+1,S_+1);}
      d_.globalCompositeOperation='destination-in';d_.drawImage(_scr.c,0,0);d_.globalCompositeOperation='source-over';
      a.drawImage(_scr.d,0,0);
      a.strokeStyle='rgba(210,240,255,.28)';a.lineWidth=2;
    }
  }else{
    const pre=sty==='cave'?'c_':'d_',hall=sty==='hall';
    for(let j=0;j<N+2*pad;j++)for(let i=0;i<N+2*pad;i++){
      const x=tx0+i,y=ty0+j,px=i*S_,py=j*S_,k=K(x,y);
      if(k===0){
        const south=wk(x,y+1);
        if(hall){
          if(south)tl(HWALL[Math.floor(hash2(x>>3,y>>3,m.n)*HWALL.length)%HWALL.length],px,py);
          else{tl('i_ceil',px,py);a.fillStyle='rgba(255,255,255,'+(.03+.03*hash2(x,y,9))+')';a.fillRect(px,py,S_+1,S_+1);}
        }else{tl(south?(hash2(x,y,3)<.14?pre+'wall_front_moss':pre+'wall_front'):pre+'wall_top',px,py);if(!south){a.fillStyle='rgba(8,6,16,.5)';a.fillRect(px,py,S_+1,S_+1);}}
      }else if(k===5){tl((th==='volcano')?pre+'lava':'d_water',px,py);}
      else{
        if(hall)tl(k===3?'i_carpet_'+m.carpet:HALLF[fl[y*W+x]%HALLF.length],px,py);
        else{const r=hash2(x,y,2);tl(r<.07?pre+'floor_crack':r<.15?pre+'floor_moss':pre+'floor',px,py);}
        if(K(x,y-1)===0){a.fillStyle='rgba(0,0,0,'+(hall?.3:.26)+')';a.fillRect(px,py,S_+1,hall?12:10);}
      }
    }
  }
  const out=newCanvas(N*S_,N*S_);out.getContext('2d').drawImage(_scr.a,pad*S_,pad*S_,N*S_,N*S_,0,0,N*S_,N*S_);
  return out;
}
let frameNo=0;
function groundChunk(m,ci,cj){
  const key=cj*4096+ci;let e=m.chunks.get(key);
  if(!e){e={cv:paintChunk(m,ci,cj),t:0};m.chunks.set(key,e);}
  e.t=frameNo;return e.cv;
}
function drawGround(x0,y0,vw,vh){
  frameNo++;
  const m=M,N=CHT*TS,nci=Math.ceil(m.W/CHT),ncj=Math.ceil(m.H/CHT);
  const i0=Math.max(0,Math.floor(x0/N)),i1=Math.min(nci-1,Math.floor((x0+vw)/N)),j0=Math.max(0,Math.floor(y0/N)),j1=Math.min(ncj-1,Math.floor((y0+vh)/N));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)cx.drawImage(groundChunk(m,i,j),i*N,j*N,N+.6,N+.6);
  let done=false;
  for(let j=j0-1;j<=j1+1&&!done;j++)for(let i=i0-1;i<=i1+1&&!done;i++){
    if(i<0||j<0||i>=nci||j>=ncj||m.chunks.has(j*4096+i))continue;
    groundChunk(m,i,j);done=true;
  }
  if(m.chunks.size>64){const arr=[...m.chunks.entries()].filter(e=>e[1].t<frameNo-30).sort((p,q)=>p[1].t-q[1].t);for(let i=0;i<arr.length&&m.chunks.size>52;i++)m.chunks.delete(arr[i][0]);}
}
function warmGround(m,x,y){
  const N=CHT*TS,ci=Math.floor(x/N),cj=Math.floor(y/N),nci=Math.ceil(m.W/CHT),ncj=Math.ceil(m.H/CHT);
  for(let j=cj-2;j<=cj+2;j++)for(let i=ci-3;i<=ci+3;i++)if(i>=0&&j>=0&&i<nci&&j<ncj)groundChunk(m,i,j);
}

/* ───────── 소품 ───────── */
function mkPlacer(){
  const hh=new Map(),CS=128,key=(a,b)=>a*8192+b,out=[];
  return {out,add(k,x,y,extra,rf){
    const p=A.pj[k];if(!p)return null;
    const ch=Math.floor(x/CS),cv=Math.floor(y/CS),f=rf||.42;
    for(let a=ch-1;a<=ch+1;a++)for(let b=cv-1;b<=cv+1;b++){const l=hh.get(key(a,b));if(!l)continue;for(const o of l){const dx=o.x-x,dy=o.y-y,r=Math.max(o.gw,p.gw)*f;if(dx*dx+dy*dy<r*r)return null;}}
    const o=Object.assign({k,x,y,gw:p.gw,gh:p.gh},extra||{});out.push(o);
    const kk=key(ch,cv);let l=hh.get(kk);if(!l){l=[];hh.set(kk,l);}l.push(o);return o;
  }};
}
function genKanProps(m,L,sp){
  const {W,H,tk,fl}=m,g=m.D.g,th=m.theme,sty=m.sty,out=[];
  const K=(x,y)=>(x<0||y<0||x>=W||y>=H)?0:tk[y*W+x];
  const wk=(x,y)=>{const k=K(x,y);return k>=1&&k!==5;};
  const P_=mkPlacer(),add=(k,x,y,e,rf)=>P_.add(k,x,y,e,rf);
  const rooms=L.rooms,nonStart=rooms.filter(r=>r!==L.st);
  const exitBox=L.exit?{x0:L.exit.x0-2,x1:L.exit.x1+3,y0:L.exit.y-3,y1:L.exit.y+1}:null;
  const inExit=(tx,ty)=>exitBox&&tx>=exitBox.x0&&tx<=exitBox.x1&&ty>=exitBox.y0&&ty<=exitBox.y1;
  const cellsOf=r=>{const o=[];for(let y=Math.floor(r.cy-r.ry-1);y<=Math.ceil(r.cy+r.ry+1);y++)for(let x=Math.floor(r.cx-r.rx-1);x<=Math.ceil(r.cx+r.rx+1);x++)if(g[y]&&g[y][x]===1&&L.inRoom(r,x,y))o.push([x,y]);return o;};
  const pickCell=(r,pred)=>{const cs=cellsOf(r);for(let t=0;t<30;t++){const c=cs[Math.floor(rnd(0,cs.length))];if(c&&(!pred||pred(c[0],c[1])))return c;}return null;};
  const wallCell=(r)=>pickCell(r,(x,y)=>K(x,y-1)===0&&K(x-1,y)>=1&&K(x+1,y)>=1&&!inExit(x,y));
  const jarK=sty==='cave'?'c_jar':'d_jar',barK=sty==='cave'?'c_barrel':'d_barrel',chK=sty==='cave'?'c_chest_closed':'d_chest_closed';
  const addTorch=(rate)=>{
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      if(K(x,y)!==0||!wk(x,y+1)||K(x,y+2)===0&&false)continue;
      if(hash2(x,y,11)>rate||inExit(x,y)||(x+y)%3)continue;
      add(sty==='cave'?'c_torch':'d_torch',(x+.5)*TS,(y+.95)*TS,{torch:1},.9);
    }
  };
  if(sty==='out'){
    const keys=Object.keys(A.pj).filter(k=>k.startsWith('f_'+th+'_')&&!/_(1[0-9])_/.test(k));
    const kind=k=>/tree_/.test(k)?'tree':/bush|fern|reeds|flower|thorn|ash|mushroom|toadstool|stump|flame/.test(k)?'small':'rock';
    const trees=keys.filter(k=>kind(k)==='tree').map(k=>[k,1]),small=keys.filter(k=>kind(k)==='small').map(k=>[k,1]),rocks=keys.filter(k=>kind(k)==='rock').map(k=>[k,1]);
    // 막힌 칸까지의 거리(걸을 수 있는 칸에서 몇 칸 떨어졌나)
    const dw=new Int8Array(W*H).fill(99),q=[];
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(wk(x,y)){dw[y*W+x]=0;q.push(y*W+x);}
    for(let h=0;h<q.length;h++){const c=q[h],x=c%W,y=(c/W)|0,d=dw[c];if(d>=7)continue;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n2=ny*W+nx;if(dw[n2]>d+1){dw[n2]=d+1;q.push(n2);}}}
    const dense=sp.t==='W'?1.35:1;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const k=K(x,y);if(k!==0&&k!==5)continue;
      const d=dw[y*W+x];if(inExit(x,y))continue;
      if(k===5){ // 못 가장자리 : 갈대·돌
        if(d===1&&Math.random()<.35){const l=Math.random()<.6?small:rocks;if(l.length)add(pickWeighted(l),(x+rnd(.2,.8))*TS,(y+rnd(.4,1))*TS);}
        continue;
      }
      const p=(d===1?1:d===2?.92:d===3?.72:d===4?.5:d<=6?.3:.12)*dense,tries=d<=3?2:1;
      for(let t=0;t<tries;t++){
        if(Math.random()>p)continue;
        const r=Math.random(),l=d<=2?(r<.62?trees:r<.84?small:rocks):(r<.8?trees:r<.92?small:rocks);
        if(l.length)add(pickWeighted(l),(x+rnd(.1,.9))*TS,(y+rnd(.5,1.1))*TS,null,d<=2?.36:.42);
      }
    }
    for(const r of nonStart){ // 방 꾸미기 : 풀·돌·항아리·폐허
      const n1=rint(5,9);
      for(let i=0;i<n1;i++){const c=pickCell(r);if(!c)continue;const l=Math.random()<.7?small:rocks;if(l.length)add(pickWeighted(l),(c[0]+rnd(.15,.85))*TS,(c[1]+rnd(.4,1))*TS,null,.5);}
      const nj=rint(1,3);
      for(let i=0;i<nj;i++){const c=wallCell(r)||pickCell(r);if(!c)continue;const o=add(Math.random()<.6?'d_jar':'d_barrel',(c[0]+.5)*TS,(c[1]+.95)*TS,{jar:1});}
      if(Math.random()<.28){const c=pickCell(r);if(c){add('d_pillar',(c[0]+.5)*TS,(c[1]+.9)*TS);add('d_bones',(c[0]+1.4)*TS,(c[1]+.9)*TS,{flat:1});}}
    }
  }else if(sty==='cave'){
    const L1=[['c_stalagmites',3],['c_rocks',3],['c_mushroom',2],['c_crystal',1.6],['c_bones',1],['c_cobweb',1],['c_minecart',.4]];
    for(const r of nonStart){
      const n1=rint(6,11);
      for(let i=0;i<n1;i++){const c=pickCell(r);if(!c)continue;const k=pickWeighted(L1);add(k,(c[0]+rnd(.15,.85))*TS,(c[1]+rnd(.5,1))*TS,/bones|cobweb/.test(k)?{flat:1}:null,.5);}
      for(let i=0;i<rint(1,3);i++){const c=wallCell(r)||pickCell(r);if(c)add(Math.random()<.6?jarK:barK,(c[0]+.5)*TS,(c[1]+.95)*TS,{jar:1});}
    }
    addTorch(.1);
  }else if(sty==='dun'||sty==='yard'){
    for(const r of nonStart){
      const n1=rint(4,8);
      for(let i=0;i<n1;i++){
        const c=pickCell(r);if(!c)continue;
        const rr_=Math.random(),k=rr_<.28?'d_bones':rr_<.5?'d_cobweb':rr_<.7?'d_barrel':rr_<.85?'i_crates':'d_jar';
        if(sty==='yard'&&rr_>.86){add(Math.random()<.5?'i_weaponrack':'i_barrels',(c[0]+.5)*TS,(c[1]+.95)*TS,null,.6);continue;}
        add(k,(c[0]+rnd(.2,.8))*TS,(c[1]+rnd(.5,1))*TS,/bones|cobweb/.test(k)?{flat:1}:(k==='d_jar'||k==='d_barrel'?{jar:1}:null),.5);
      }
      if(!r.round)for(const [x,y] of [[r.x+.5,r.y+.6],[r.x+r.w-.5,r.y+.6]]){if(Math.random()<.7&&g[Math.floor(y)]&&g[Math.floor(y)][Math.floor(x)]===1)add('d_pillar',x*TS,(y+.6)*TS,null,.7);}
    }
    addTorch(sty==='yard'?.16:.11);
  }else{ // 성 내부 : 방마다 쓰임새가 있다
    const T=['bed','lib','banq','armory','study','lounge'];
    const wallRow=(r)=>({y:r.y,x0:r.x,x1:r.x+r.w-1});
    for(const r of nonStart){
      if(r.round)continue;
      const kind=r.keep?'throne':T[Math.floor(hash2(r.x,r.y,m.n+m.idx)*T.length)];
      const ny=r.y,fy=(ny+1.05)*TS;               // 북쪽 벽에 붙여 세운다
      const slot=(i,n)=>r.x+1.2+(r.w-2.4)*(n===1?.5:i/(n-1));
      const row=[];
      const put=(k,tx,e,blk)=>{if(inExit(Math.round(tx),ny)||inExit(Math.round(tx)+1,ny)||inExit(Math.round(tx)-1,ny))return null;const o=add(k,tx*TS,fy,e,.3);if(o&&blk)m.blocks.push([Math.floor(tx-o.gw/2/TS+.2),ny,Math.max(1,Math.round(o.gw/TS-.3)),1]);return o;};
      if(kind==='bed'){put('i_bed_g',slot(0,3),null,1);put('i_wardrobe',slot(1,3),null,1);put('i_bed_r',slot(2,3),null,1);add('i_lamp',(r.x+.9)*TS,(r.y+r.h-.8)*TS);add('i_plant',(r.x+r.w-.9)*TS,(r.y+r.h-.7)*TS);}
      else if(kind==='lib'){put('i_bookshelf',slot(0,3),null,1);put('i_bookshelf',slot(1,3),null,1);put('i_bookshelf',slot(2,3),null,1);add('i_desk',(r.x+r.w/2)*TS,(r.y+r.h-1.4)*TS);add('i_books',(r.x+1.2)*TS,(r.y+r.h-.8)*TS);}
      else if(kind==='banq'){put('i_fireplace',slot(1,3),null,1);add('i_table_feast',(r.x+r.w/2)*TS,(r.y+r.h-1.7)*TS);add('i_barrels',(r.x+1.3)*TS,(r.y+r.h-.9)*TS,{jar:1});add('i_candelabra',(r.x+r.w-1)*TS,(r.y+r.h-.8)*TS);}
      else if(kind==='armory'){put('i_weaponrack',slot(0,3),null,1);put('i_armor',slot(1,3),null,1);put('i_weaponrack',slot(2,3),null,1);add('i_crates',(r.x+1.4)*TS,(r.y+r.h-.9)*TS,{jar:1});add('i_crates',(r.x+r.w-1.5)*TS,(r.y+r.h-.9)*TS,{jar:1});}
      else if(kind==='study'){put('i_mapboard',slot(0,2),null,1);put('i_board',slot(1,2),null,1);add('i_desk',(r.x+r.w/2)*TS,(r.y+r.h-1.5)*TS);add('i_lantern',(r.x+1)*TS,(r.y+r.h-.7)*TS);}
      else if(kind==='lounge'){put('i_cabinet',slot(0,3),null,1);put('i_fireplace',slot(1,3),null,1);put('i_dresser',slot(2,3),null,1);add('i_table_round',(r.x+r.w/2)*TS,(r.y+r.h-1.6)*TS);add('i_stool',(r.x+r.w/2-1.4)*TS,(r.y+r.h-1.2)*TS);add('i_plant2',(r.x+r.w-1)*TS,(r.y+r.h-.7)*TS);}
      else{ // 내성 알현실
        put('i_throne',r.x+r.w/2,{throne:1},0);put('i_candelabra',r.x+r.w/2-2.4,null,0);put('i_candelabra',r.x+r.w/2+2.4,null,0);
        for(const x of [r.x+1.6,r.x+r.w-1.6])for(const y of [r.y+2.2,r.y+r.h-1.2])add('d_pillar',x*TS,y*TS,null,.6);
      }
      for(const x of [r.x+.9,r.x+r.w-.9])add('i_wallcandle',x*TS,(r.y+.7)*TS,{torch:1},.4);
      if(!r.keep&&Math.random()<.5)add('i_vase',(r.x+r.w-.8)*TS,(r.y+1.5)*TS,{jar:1});
    }
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(K(x,y)!==0||!wk(x,y+1)||(x+y)%4||hash2(x,y,12)>.13||inExit(x,y))continue;add('i_wallcandle',(x+.5)*TS,(y+.9)*TS,{torch:1},.6);}
  }
  // 상자 : 막다른 방에는 반드시, 나머지는 45%
  const chestRooms=[];
  for(const r of nonStart){
    const deg=L.adj[r.idx].length,keepR=r.keep,guardR=r===L.exitRoom;
    if(keepR)continue;
    if(deg===1||Math.random()<(guardR?.25:.45))chestRooms.push(r);
  }
  m.chests=[];
  for(const r of chestRooms){
    const c=wallCell(r)||pickCell(r);if(!c)continue;
    const o=add(chK,(c[0]+.5)*TS,(c[1]+1)*TS,{chest:1},.5);if(o)m.chests.push(o);
  }
  m.jars=out;
  return P_.out;
}
function addBlocks(m){ // 가구가 서 있는 칸은 걸어 다닐 수 없다 (통로 폭 2칸이 깨지면 그 가구만 되돌린다)
  const g=m.D.g,L=m.L,w0=L.wideRooms();
  for(const [x0,y0,w,h] of m.blocks){
    const cs=[];for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(g[y]&&g[y][x]===1)cs.push([x,y]);
    if(!cs.length)continue;
    for(const [x,y] of cs)g[y][x]=0;
    if(!L.allReach()||L.wideRooms().some((v,i)=>w0[i]&&!v))for(const [x,y] of cs)g[y][x]=1;
  }
}

/* ───────── 부대 ───────── */
const SOLD=[['spear',40],['bow',34],['cav',26]],YOK=[['egg',25],['jiangshi',30],['fox',20],['slime',25]];
function mkCol(tx,ty,o){
  o=o||{};const m=M,cx_=tx*TS,cy_=ty*TS,set=o.set,yk=set==='y';
  const col={idx:m.colonies.length,room:{x:Math.floor(tx)-3,y:Math.floor(ty)-3,w:6,h:6,cx:Math.floor(tx),cy:Math.floor(ty)},cx:cx_,cy:cy_,mobs:[],woken:false,cleared:false,boss:false,hold:!!o.hold,tag:o.tag||''};
  if(o.leader){
    const lt=yk?pickWeighted([['jiangshi',1],['fox',1],['egg',1]]):pickWeighted([['spear',1],['cav',1]]);
    const L=createMob(lt,set,cx_,cy_,col,true);
    L.leader=true;col.lead=L;
    L.aur=o.captain?330:250;L.auk=o.captain?.4:.28;
    if(o.captain){L.captain=true;L.hp*=2.4;L.maxHp=L.hp;L.gold*=3;L.scale*=1.18;}
    if(o.guard){L.guardL=true;L.hp*=2.4;L.maxHp=L.hp;L.gold*=3;L.scale*=1.18;}
    if(o.commander){L.opener=true;L.commander=true;L.hp*=3.2;L.maxHp=L.hp;L.gold*=3;L.scale*=1.22;L.aur=320;L.auk=.38;}
    col.mobs.push(L);
  }
  const n=o.n||6,types=yk?YOK:SOLD;
  for(let i=0;i<n;i++){
    const type=pickWeighted(types);let x,y,ok=false;
    for(let t=0;t<40&&!ok;t++){
      const a=(i/n)*Math.PI*2+rnd(-.3,.3),r=(t<20?rnd(70,105):rnd(40,150));
      x=cx_+Math.cos(a)*r;y=cy_+Math.sin(a)*r*.8;
      if(!blockedAt(x,y,18)&&M.seen[Math.floor(y/TS)*M.W+Math.floor(x/TS)]&&!col.mobs.some(q=>Math.hypot(q.x-x,q.y-y)<(yk?46:62)))ok=true;
    }
    if(ok)col.mobs.push(createMob(type,set,x,y,col,false));
  }
  mobs.push(...col.mobs);m.colonies.push(col);return col;
}
function nearWalk(g,x,y){ // 가장 가까운 걸을 수 있는 칸
  x=Math.floor(x);y=Math.floor(y);
  for(let r=0;r<12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(Math.max(Math.abs(dx),Math.abs(dy))===r&&g[y+dy]&&g[y+dy][x+dx]===1)return [x+dx,y+dy];
  return [x,y];
}
function clockHour(dx,dy){const a=Math.atan2(dx,-dy)/(Math.PI*2)*12;return ((Math.round(a)+12)%12)||12;}

/* ───────── 칸 만들기 ───────── */
const SETS=['0','1','2'];
const parOf=n=>Math.round((n<=12?620:n===40?940:900)*.9);
function buildMusou(cfg){
  cfg=cfg||{hero:[],kind:'other'};
  const n=cfg.n||1,specs=kanSpecs(n);
  S.auto=false;
  const run={n,cfg,specs,idx:0,joined:[],saved:[],dlgDone:{},dl:dlgSplit(cfg),par:parOf(n),gim:GIM_OF[n]||null,kd:{},revq:[]};
  allies.length=0;resetBuffs();
  buildKanTalk(run);
  buildKan(run,0,null);
}
function buildKan(run,idx,carry){
  const n=run.n,cfg=run.cfg,sp=run.specs[idx],gim=idx===0?run.gim:(run.gim==='vents'?'vents':null);
  const oldRand=Math.random;Math.random=mulberry(n*104729+idx*31+7);   // 맵 모양·소품·부대 배치는 스테이지·칸마다 늘 같다
  try{
    const L=genKan(n,sp),theme=sp.th,sty={F:'out',W:'out',S:'out',I:'out',V:'out',C:'cave',D:'dun',Y:'yard',H:'hall',T:'hall'}[sp.t];
    const {W,H,g,tk,fl}=L,st=L.st,spt=nearWalk(g,st.cx,st.cy);
    const D={g,rooms:[{cx:spt[0],cy:spt[1],x:spt[0]-3,y:spt[1]-3,w:6,h:6}],start:{cx:spt[0],cy:spt[1]},far:null};
    D.far=D.start;
    const m={kind:['field',theme,'성'],type:'field',theme,name:sp.nm,W,H,D,tk,fl,L,sty,carpet:['r','b','g'][(n+idx)%3],colonies:[],set:SETS[(n+idx)%3],musou:true,boss:null,bossType:null,gates:[],hero:null,heroes:[],beacon:null,captain:null,guard:null,
      mis:'guard',doneT:0,focus:null,clock:carry?carry.clock:0,joined:run.joined,saved:run.saved,n,gim,cfgKind:cfg.kind,vents:[],chunks:new Map(),par:run.par,dlgQ:[],dlgDone:run.dlgDone,dl:run.dl,
      run,idx,sp,exit:null,blocks:[],chests:[],jars:[],k0:carry?carry.k0:0,replay:carry?carry.replay:false,ended:false,transT:0};
    M=m;mobs.length=0;shots.length=0;fx.length=0;pops.length=0;orbs.length=0;zones.length=0;wards.length=0;pks.length=0;
    // 소품 → 가구 막기
    m.props=genKanProps(m,L,sp);addBlocks(m);m.props.sort((a,b)=>a.y-b.y);
    m.jarList=m.props.filter(p=>p.jar);m.chests=m.props.filter(p=>p.chest);
    m.seen=L.wide();   // 너비 2칸 이상으로 이어진 칸에만 부대·영웅이 선다
    // 출구 문
    if(L.exit){
      const e=L.exit;
      m.exit={x0:e.x0,x1:e.x1,y:e.y,fy:e.fy,cx:e.cx*TS,cy:(e.y+1)*TS,open:false,t:0,art:exitArt(sp.t,run.specs[idx+1].t),to:run.specs[idx+1]};
    }
    if(L.gate){m.gates=[L.gate];for(const [x,y] of L.gate.cells)g[y][x]=0;}
    // 부대
    const set=m.set,yp=YOKAI_P[sp.t]||0;
    // 스테이지 하나의 적 수 : 초반(1~12)은 10분, 이후는 15분 분량 — 칸 크기에 비례해 나눠 가진다
    const TOT=n<=12?212:n===40?362:342,wts=run.specs.map(q=>({s:.6,m:1,l:1.3}[q.sz]||1)),wsum=wts.reduce((p,q)=>p+q,0);
    const tgt=TOT*wts[idx]/wsum-(sp.last?8:0);
    const ncol=L.rooms.filter(r=>r!==st&&!r.keep).length+L.rooms.filter(r=>r!==st&&!r.keep&&r.rx*r.ry>=26).length*.6;
    const per=clamp(Math.round(tgt/Math.max(1,ncol))-1,4,11),cn=()=>clamp(per+rint(-1,1),3,12);
    const setFor=()=>Math.random()<yp?'y':set;
    // 먼저 오프너(거점 병장) 방 : 시작 방에서 11시 방향에 가까운 막다른 방
    let opener=null;
    if(gim==='commander'){
      let best=-1e9;
      for(const r of L.rooms){
        if(r===st||r===L.exitRoom||r.keep)continue;
        const dx=r.cx-st.cx,dy=r.cy-st.cy,d=Math.hypot(dx,dy);if(d<14||d>34)continue;
        const sc=-Math.abs(d-24)*.2+(L.adj[r.idx].length===1?1.5:0)+Math.random()*.5;   // 너무 가깝지도 멀지도 않은 곳
        if(sc>best){best=sc;opener=r;}
      }
      if(opener){m.openerRoom=opener;m.openHour=clockHour(opener.cx-st.cx,opener.cy-st.cy);}
    }
    if(gim==='commander'&&opener)m.mis='cmd';
    for(const r of L.rooms){
      if(r===st)continue;
      const cxp=Math.floor(r.cx)+.5,cyp=Math.floor(r.cy)+.5,w=nearWalk(g,cxp,cyp);
      if(r.keep)continue;
      if(r===opener){const c0=mkCol(w[0]+.5,w[1]+.5,{n:9,leader:true,commander:true,set:'0'});m.beacon=c0.lead;continue;}
      if(r===L.exitRoom){
        if(sp.last){const c0=mkCol(w[0]+.5,w[1]+.5,{n:7,leader:true,captain:true,set:setFor()});m.captain=c0.lead;}
        else if(gim==='commander'&&opener){mkCol(w[0]+.5,w[1]+.5,{n:cn(),leader:true,set:setFor()});}
        else{const c0=mkCol(w[0]+.5,w[1]+.5,{n:cn()-1,leader:true,guard:true,set:setFor()});m.guard=c0.lead;}
        continue;
      }
      const big=r.rx*r.ry>=26,deg=L.adj[r.idx].length;
      mkCol(w[0]+.5,w[1]+.5,{n:cn()-(deg===1?1:0),leader:true,set:setFor()});
      if(big){const w2=nearWalk(g,cxp+r.rx*.5,cyp+r.ry*.3);if(Math.hypot(w2[0]-w[0],w2[1]-w[1])>3)mkCol(w2[0]+.5,w2[1]+.5,{n:Math.max(4,cn()-2),leader:false,set:setFor()});}
    }
    // 내성의 영웅 : 구출전은 갇혀 있고, 포획전은 먼저 싸운다 (남성 장수는 구해도 합류하지 않는다)
    if(sp.last&&L.keep){
      const hs=(cfg.hero||[]).filter(id=>MT[id]&&(!FEM.has(id)||!S.roster.includes(id)));
      const kp=nearWalk(g,L.keep.cx,L.keep.cy+.3);
      if(hs.length){
        const hc={idx:m.colonies.length,room:{x:L.keep.x,y:L.keep.y,w:L.keep.w,h:L.keep.h,cx:kp[0],cy:kp[1]},cx:(kp[0]+.5)*TS,cy:(kp[1]+.5)*TS,mobs:[],woken:false,cleared:false,boss:false,hold:true,tag:'keep'};
        const spots=[[0,0],[-1.1,-2],[-1.1,2]];
        hs.forEach((id,i)=>{
          const s=spots[i]||spots[0],q=nearWalk(g,kp[0]+s[0]+1,kp[1]+s[1]);
          const h=createMob(id,'h',(q[0]+.5)*TS,(q[1]+.5)*TS,hc,false);h.face='left';
          if(cfg.kind==='capture'&&i===0)m.hero=h;
          else{h.down=true;h.hp=1;h.bs.s='down';h.captive=true;}
          hc.mobs.push(h);mobs.push(h);m.heroes.push(h);
        });
        m.colonies.push(hc);
      }
      m.keepRoom=L.keep;
      // 내성 호위
      const kg=mkCol(kp[0]+.5-2,kp[1]+.5,{n:6,leader:true,hold:true,tag:'castle',set:m.set});
    }
    if(gim==='vents'&&(sp.t==='S'||sp.t==='C'||sp.t==='V'))placeVents(m,L);
    // 플레이어와 동료
    if(!carry){P=newPlayer();}else{P.mode='tele_in';P.tt=0;P.atk=null;P.state='idle';P.target=null;P.hp=Math.min(P.hp,stat.maxHp());}
    P.x=(D.start.cx+.5)*TS;P.y=(D.start.cy+.5)*TS;
    cam.x=P.x;cam.y=P.y-50;P.mode='tele_in';P.tt=0;fxTeleport(P.x,P.y);
    if(!carry)S.party.slice(0,2).forEach(id=>{if(S.roster.includes(id)&&MT[id])addAlly(id,P.x+rnd(-50,50),P.y+60);});
    else for(const a of allies){a.x=P.x+rnd(-60,60);a.y=P.y+rnd(30,70);a.kx=a.ky=0;a.act=null;a.wind=0;a.hx=a.x;a.hy=a.y;if(!a.gone)a.down=false;}
    warmGround(m,P.x,P.y);
    kanIntro(m,run,sp,idx);
  }finally{Math.random=oldRand;}
}
function kanIntro(m,run,sp,idx){
  const tot=run.specs.length;
  showBanner((tot>1?(idx+1)+'/'+tot+'칸 · ':'')+sp.nm,1.8);
  if(idx>0)queueDlg('kan'+idx,1.5);
  if(m.gim&&idx===0){
    const txt=m.gim==='commander'&&m.openHour?m.openHour+'시 방향 거점의 병장을 쓰러뜨려야 길이 열린다':run.cfg.gm;
    if(txt)setTimeout(()=>{if(M===m&&UI.mode==='battle'&&!M.trans)showBanner(txt,2.8);},2100);
  }
}
function placeVents(m,L){
  const g=m.D.g,cols=m.colonies.map(c=>[c.cx/TS,c.cy/TS]);
  const spot=(r)=>{
    for(let t=0;t<40;t++){
      const x=r.cx+rnd(-r.rx*.8,r.rx*.8),y=r.cy+rnd(-r.ry*.8,r.ry*.8),tx=Math.floor(x),ty=Math.floor(y);
      if(!(g[ty]&&g[ty][tx]===1&&g[ty][tx-1]===1&&g[ty][tx+1]===1&&g[ty-1]&&g[ty-1][tx]===1&&g[ty+1]&&g[ty+1][tx]===1))continue;
      if(cols.some(c=>Math.hypot(c[0]-x,c[1]-y)<4.5))continue;
      if(m.vents.some(v=>Math.hypot(v.x/TS-x,v.y/TS-y)<4.5))continue;
      m.vents.push({x:x*TS,y:y*TS,t:rnd(0,VP),k:-1,r:76});return true;
    }
    return false;
  };
  for(const r of L.rooms){if(r===L.st||r.keep)continue;const c=3;for(let i=0;i<c;i++)spot(r);}
}
