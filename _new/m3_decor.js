/* Chinese Three Kingdoms decoration: visual-only, no new collision or mission rules. */
const DECOR_NAMES='wei_flag wei_tent wei_arms wei_supply wei_palisade wei_drum wu_flag wu_tent wu_naval shu_flag shu_tent shu_gong han_bed han_table han_jars han_screen han_lanterns han_incense'.split(' ');
const DECOR_PROPS={};
const decorReady=Promise.all(DECOR_NAMES.map(n=>new Promise((resolve,reject)=>{
  const im=new Image();
  im.onload=()=>{DECOR_PROPS[n]=im;resolve();};
  im.onerror=()=>reject(Error('decor load: '+n));
  im.src='a/decor_props/'+n+'.png';
})));decorReady.catch(console.error);

function decorNation(stage,room){
  if(stage<=10)return 'wei';
  if(stage<=20)return 'wu';
  if(stage<=30)return 'shu';
  return ['wei','wu','shu'][(room+stage)%3];
}
function decorDraw(key,x,y,w){
  const im=DECOR_PROPS[key];if(!im)return false;
  const h=w*im.height/im.width;
  cx.drawImage(im,x-w/2,y-h,w,h);
  return true;
}
function decorHash(a,b,c){
  let v=(Math.imul(a|0,73856093)^Math.imul(b|0,19349663)^Math.imul(c|0,83492791))>>>0;
  v=Math.imul(v^(v>>>16),2246822507)>>>0;
  return ((v^(v>>>13))>>>0)/4294967296;
}

// One or two anchored military accents per clearing; avoid the starting point,
// existing object silhouettes, and all blocked cells. Never touch Math.random.
function makeDecor(m,L){
  if(m.sty!=='out'&&m.sty!=='yard')return [];
  const out=[],g=m.D.g;
  const slots=[[-.55,-.48],[.55,-.48],[-.55,.48],[.55,.48],[0,-.65],[0,.65]];
  const rooms=L.rooms.filter(r=>!r.keep);
  for(const r of rooms){
    const role=r===L.st?'flag':r.idx%5===0?'tent':r.idx%3===0?'supply':r.idx%2===0?'flag':null;
    if(!role)continue;
    const nation=decorNation(m.n,r.idx),key=role==='flag'?nation+'_flag':role==='tent'?nation+'_tent':nation==='wei'?'wei_supply':nation==='wu'?'wu_naval':'shu_gong';
    const w=role==='flag'?78:role==='tent'?132:100;
    const start=Math.floor(decorHash(m.n,m.idx,r.idx)*slots.length);
    for(let i=0;i<slots.length;i++){
      const [u,v]=slots[(start+i)%slots.length],x=(r.cx+u*r.rx)*TS,y=(r.cy+v*r.ry)*TS;
      const tx=Math.floor(x/TS),ty=Math.floor(y/TS);
      if(!g[ty]||g[ty][tx]!==1)continue;
      // In the first room, never cover the player's arrival at its center.
      if(r===L.st&&Math.hypot(x-r.cx*TS,y-r.cy*TS)<TS*2.2)continue;
      if(m.props.some(p=>Math.hypot(p.x-x,p.y-y)<Math.max(52,(p.gw+w)*.42)))continue;
      if(out.some(p=>Math.hypot(p.x-x,p.y-y)<(p.w+w)*.6))continue;
      out.push({key,x,y,w});break;
    }
  }
  return out;
}

function drawChineseFurniture(p){
  if(!M||!M.musou)return false;
  let key=null,w=p.gw;
  if(M.sty==='hall'){
    if(/^i_bed_/.test(p.k)){key='han_bed';w=98;}
    else if(['i_desk','i_table_round','i_table_feast'].includes(p.k)){key='han_table';w=Math.max(88,p.gw);}
    else if(p.k==='i_vase'||p.k==='i_barrels'){key='han_jars';w=p.k==='i_vase'?55:78;}
    else if(p.k==='i_board'||p.k==='i_mapboard'){key='han_screen';w=86;}
    else if(p.k==='i_lantern'){key='han_lanterns';w=62;}
    else if(p.k==='i_candelabra'){key='han_incense';w=54;}
  }else if(M.sty==='yard'){
    const nation=decorNation(M.n,Math.floor(p.x/TS));
    if(p.k==='i_weaponrack'){key=nation==='wei'?'wei_arms':nation==='wu'?'wu_naval':'shu_gong';w=90;}
    else if(p.k==='i_barrels'||p.k==='i_crates'){key=nation==='wei'?'wei_supply':nation==='wu'?'wu_naval':'shu_gong';w=92;}
  }
  return key?decorDraw(key,p.x,p.y,w):false;
}
