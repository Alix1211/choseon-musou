/* Rare ranged magic troops. Existing soldiers, stage objectives and saves remain unchanged. */
const MAGIC_TROOPS={
  mage_wei:{walk:'a/magic_soldiers/wei_rogue_monk_walk_3dir_4f.webp',attack:'a/magic_soldiers/wei_rogue_monk_attack_3dir_3f.webp'},
  mage_shu:{walk:'a/magic_soldiers/shu_priestess_walk_3dir_4f.webp',attack:'a/magic_soldiers/shu_priestess_attack_3dir_3f.webp'},
  mage_wu:{walk:'a/magic_soldiers/wu_hex_caster_walk_3dir_4f.webp',attack:'a/magic_soldiers/wu_hex_caster_attack_3dir_3f.webp'}
};
// Rare: one substitution in section 2, and a second later in longer episodes.
// Each mage can cast multiple spell elements; elemental order varies by stage.
const MAGIC_FACTION={'0':'mage_wei','1':'mage_shu','2':'mage_wu'};
const MAGIC_ELEMENTS={mage_wei:['ice','lightning'],mage_shu:['wind','ice','lightning'],mage_wu:['fire','lightning','wind']};
function magicRecruit(col){
  const m=M;
  if(!m||m.n<=1||!(m.idx===1||(m.idx===3&&m.n>=11))||m.magicRecruited||
     !col||!col.mobs.length||!A.magicWalk||!A.magicAttack)return;
  const set=col.mobs[0].set,type=MAGIC_FACTION[set];
  if(!type||!A.magicWalk[type]||!A.magicAttack[type])return;
  let i=col.mobs.findIndex(v=>!v.leader&&!v.elite&&v.type==='bow');
  if(i<0)i=col.mobs.findIndex(v=>!v.leader&&!v.elite&&['spear','cav'].includes(v.type));
  if(i<0)return;
  const old=col.mobs[i],mage=createMob(type,set,old.x,old.y,col,false);
  const elements=MAGIC_ELEMENTS[type];
  mage.magicUnit=true;mage.magicElement=elements[(m.n+Math.floor(m.idx/2))%elements.length];mage.face=old.face;
  col.mobs[i]=mage;m.magicRecruited=true;
}
async function magicLoadImage(path){
  // New APKs load their bundled asset; old APKs may fetch only the new game HTML.
  try{return await stage40Timed(loadImg(path),2200);}catch(error){}
  const url='https://raw.githubusercontent.com/Alix1211/choseon-musou/mobile-live/'+path;
  let controller;
  try{
    controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
    let res;
    try{res=await fetch(url,{signal:controller.signal,cache:'no-store'});}finally{clearTimeout(timer);}
    if(!res.ok)throw Error('HTTP '+res.status);
    const blob=await res.blob(),objectUrl=URL.createObjectURL(blob);
    try{return await stage40Timed(loadImg(objectUrl),5000);}finally{URL.revokeObjectURL(objectUrl);}
  }catch(error){console.warn('Magic sprite unavailable: '+path,error);return null;}
}
function magicQueueImages(){
  A.magicWalk={};A.magicAttack={};
  // These optional art downloads do NOT hold the main loading bar at 94%.
  for(const id in MAGIC_TROOPS){
    const d=MAGIC_TROOPS[id];
    magicLoadImage(d.walk).then(im=>{if(im)A.magicWalk[id]=im;});
    magicLoadImage(d.attack).then(im=>{if(im)A.magicAttack[id]=im;});
  }
}
function drawMagicMob(m){
  if(m.wuHidden||(m.col&&m.col.weiHidden))return;
  const dk=dirKey(m.face),dir=dk[0],flip=dk[1];
  const attacked=m.intent&&A.magicAttack[m.type],im=attacked||A.magicWalk[m.type];
  if(!im)return;
  const cols=attacked?3:4,fw=im.width/cols,fh=im.height/3;
  const row=attacked?(dir==='side'?0:dir==='front'?1:2):(dir==='front'?0:dir==='side'?1:2);
  const phase=attacked?1-m.intent.left/Math.max(.01,m.intent.duration):0;
  const frame=attacked?(phase<.32?0:phase<.75?1:2):(m.moving?Math.floor((time+m.seed)*6.67)%4:0);
  const alpha=m.dead?Math.max(0,1-m.deadT/.8):m.down?.72:1;
  const size=mobH(m)*m.scale/342;
  drawShadow(m.x,m.y,36*m.scale,7*m.scale,.25*alpha);
  cx.save();cx.translate(m.x,m.y);cx.globalAlpha=alpha;
  cx.scale((flip?-1:1)*size,size);
  // The sprite sheets are in strict grid order; crop within each cell.
  cx.drawImage(im,frame*fw,row*fh,fw,fh,-fw/2,-fh,fw,fh);
  if(m.hurt>0){cx.globalCompositeOperation='source-atop';cx.fillStyle='rgba(255,255,255,'+(.55*m.hurt/.14)+')';cx.fillRect(-fw/2,-fh,fw,fh);}
  cx.restore();
  if(!m.dead&&!m.down&&m.hp<m.maxHp){
    const w=36,y=m.y-mobH(m)*m.scale-8;
    cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(m.x-w/2-1,y-1,w+2,6);
    cx.fillStyle='#e8456b';cx.fillRect(m.x-w/2,y,w*Math.max(0,m.hp/m.maxHp),4);
  }
}
function drawMagicShot(s){
  const rgb={ice:[135,217,255],lightning:[175,143,255],wind:[145,255,189],fire:[255,109,54]}[s.magicElement]||[255,255,255];
  const color=rgb.join(','),ang=Math.atan2(s.vy,s.vx);
  cx.save();cx.translate(s.x,s.y);cx.rotate(ang);cx.globalCompositeOperation='lighter';
  glow(0,0,28,'rgba('+color+',.8)','rgba('+color+',0)');
  cx.strokeStyle='rgba('+color+',.9)';cx.lineWidth=4;cx.lineCap='round';
  if(s.magicElement==='lightning'){
    cx.beginPath();cx.moveTo(-18,4);cx.lineTo(-6,-5);cx.lineTo(1,4);cx.lineTo(13,-7);cx.lineTo(23,0);cx.stroke();
    cx.strokeStyle='#fff';cx.lineWidth=1.8;cx.stroke();
  }else if(s.magicElement==='wind'){
    cx.beginPath();cx.arc(0,0,15,-2.5,1.4);cx.stroke();cx.beginPath();cx.arc(-4,0,8,-1.3,2.4);cx.stroke();
  }else if(s.magicElement==='ice'){
    cx.fillStyle='#d9f7ff';cx.beginPath();cx.moveTo(20,0);cx.lineTo(-8,-8);cx.lineTo(-15,0);cx.lineTo(-8,8);cx.closePath();cx.fill();
  }else{
    cx.fillStyle='#fff1ac';cx.beginPath();cx.moveTo(18,0);cx.lineTo(-7,-7);cx.lineTo(-2,0);cx.lineTo(-7,7);cx.closePath();cx.fill();
  }
  cx.restore();
}
