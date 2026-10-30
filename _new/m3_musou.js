/* 무쌍 필살기: 수동 충전, 초상화 컷인, 소품 운석 폭격. 일반 LLLLH 콤보와 독립. */
const ULT={active:false,phase:'',t:0,next:0,meteors:[],blasts:[],por:null,images:[]};
(function prefetchMusouArt(){
  ULT.por=new Image();ULT.por.src='a/ui/pt/choseon.webp';
  for(let i=0;i<6;i++){const im=new Image();im.src='a/ui/musou/meteor_'+i+'.webp';ULT.images.push(im);}
})();

function musouGainKill(m){
  S.ultCharge=Math.min(100,(S.ultCharge||0)+(m.boss?15:m.elite?8:100/35));
  save();
}

function musouStart(){
  if(ULT.active||!P||!M||UI.mode!=='battle'||UI.paused||P.mode!=='manual'||P.hp<=0||(S.ultCharge||0)<100)return false;
  S.ultCharge=0;save();comboReset();P.atk=null;P.cbAction=null;P.cbMove=null;P.state='idle';
  ULT.active=true;ULT.phase='portrait';ULT.t=0;ULT.next=0;ULT.blasts.length=0;
  const w=VW/Z,h=VH/Z,visible=liveMobs().filter(m=>Math.abs(m.x-cam.x)<w*.55&&Math.abs(m.y-cam.y)<h*.60);
  ULT.meteors=Array.from({length:15},(_,i)=>{
    const target=visible.length&&i%3!==1?visible[(i*7)%visible.length]:null;
    const xx=(target?target.x:cam.x+rnd(-w*.43,w*.43))+rnd(-66,66);
    const yy=(target?target.y:cam.y+rnd(-h*.30,h*.30))+rnd(-45,45);
    return {x:clamp(xx,50,M.W*TS-50),y:clamp(yy,60,M.H*TS-45),sprite:i===14?5:i%5,
      at:i*.18,fall:.29+i%3*.025,done:false,last:i===14,size:i===14?128:rnd(63,88),rot:rnd(-.35,.35)};
  });
  CM_AUDIO.play('spin');
  return true;
}

function musouBoom(m){
  m.done=true;
  const radius=m.last?270:145,power=stat.atk()*(m.last?4.7:2.05);
  ULT.blasts.push({x:m.x,y:m.y,r:radius,at:ULT.t,last:m.last});
  for(const enemy of liveMobs()){
    const dist=Math.hypot(enemy.x-m.x,enemy.y-m.y),reach=radius+enemy.scale*15;
    if(dist>reach)continue;
    const angle=Math.atan2(enemy.y-m.y,enemy.x-m.x);
    hitMob(enemy,power*(1-dist/reach*.22),'fan',m.last?640:360,angle);
    if(!enemy.dead&&!enemy.boss)enemy.stun=Math.max(enemy.stun,m.last?.85:.38);
  }
  pops.push({x:m.x,y:m.y-70,t:0,txt:m.last?'콰아앙!!':'펑!',col:m.last?'#ffe9ac':'#ffe1fc',size:m.last?32:21,vy:-22,life:.75});
  CM_AUDIO.play('explosion');shake=Math.max(shake,m.last?19:9);
}

function musouTick(dt){
  if(!ULT.active)return;
  ULT.t+=dt;
  if(ULT.phase==='portrait'){
    if(ULT.t>=.72){ULT.phase='rain';ULT.t=0;ULT.next=0;}
    return;
  }
  while(ULT.next<ULT.meteors.length){
    const m=ULT.meteors[ULT.next];
    if(ULT.t<m.at+m.fall)break;
    musouBoom(m);ULT.next++;
  }
  ULT.blasts=ULT.blasts.filter(b=>ULT.t-b.at<.55);
  shake=Math.max(0,shake-dt*14);
  if(ULT.next===ULT.meteors.length&&ULT.blasts.length===0){
    ULT.active=false;ULT.phase='';ULT.meteors.length=0;shake=0;save();
  }
}

/* 아래 두 그리기는 기존 월드 좌표 변환/화면 좌표 변환 안에서 각각 호출한다. */
function musouDrawWorld(){
  if(!ULT.active||ULT.phase!=='rain')return;
  for(const m of ULT.meteors){
    if(m.done||ULT.t<m.at)continue;
    const u=Math.min(1,(ULT.t-m.at)/m.fall),yy=m.y-340*(1-u)*(1-u),im=ULT.images[m.sprite];
    cx.save();cx.globalCompositeOperation='lighter';
    const trail=cx.createLinearGradient(m.x,yy-115,m.x,yy+15);
    trail.addColorStop(0,'rgba(255,120,235,0)');trail.addColorStop(.55,'rgba(255,140,235,.13)');trail.addColorStop(1,'rgba(255,245,220,.5)');
    cx.fillStyle=trail;cx.beginPath();cx.ellipse(m.x,yy-35,m.size*.24,105,-.17,0,Math.PI*2);cx.fill();cx.restore();
    if(im&&im.complete&&im.naturalWidth){
      cx.save();cx.translate(m.x,yy);cx.rotate(m.rot+u*.85);cx.shadowBlur=19;cx.shadowColor='rgba(255,137,233,.75)';
      cx.drawImage(im,-m.size*.5,-m.size*.7,m.size,m.size);cx.restore();
    }
  }
  for(const b of ULT.blasts){
    const u=(ULT.t-b.at)/.55,r=b.r*(.12+.88*(1-Math.pow(1-u,3)));cx.save();cx.globalCompositeOperation='lighter';
    cx.translate(b.x,b.y);cx.scale(1,YR);
    const g=cx.createRadialGradient(0,0,r*.13,0,0,r);
    g.addColorStop(0,'rgba(255,255,244,'+(.60*(1-u))+')');
    g.addColorStop(.38,'rgba(255,194,244,'+(.44*(1-u))+')');
    g.addColorStop(.73,'rgba(234,103,255,'+(.16*(1-u))+')');g.addColorStop(1,'rgba(224,90,255,0)');
    cx.fillStyle=g;cx.beginPath();cx.arc(0,0,r,0,Math.PI*2);cx.fill();cx.restore();
  }
}

function musouDrawPortrait(){
  if(!ULT.active||ULT.phase!=='portrait')return;
  const u=Math.min(1,ULT.t/.72),grow=.68+u*.92,fade=u<.56?1:(1-u)/.44;
  cx.save();cx.fillStyle='rgba(17,4,36,'+(.58*Math.min(1,u*8)*Math.max(0,fade))+')';cx.fillRect(0,0,VW,VH);
  if(ULT.por&&ULT.por.complete&&ULT.por.naturalWidth){
    const h=Math.min(VH*.86,405)*grow,w=h*ULT.por.naturalWidth/ULT.por.naturalHeight;
    cx.globalAlpha=Math.max(0,fade);cx.shadowBlur=45;cx.shadowColor='#fb78ff';
    cx.drawImage(ULT.por,VW*.5-w*.5,VH*.51-h*.52,w,h);
  }
  cx.globalAlpha=Math.max(0,fade);cx.font='900 '+Math.round(Math.min(49,VH*.14))+'px system-ui';
  cx.textAlign='center';cx.lineWidth=7;cx.strokeStyle='rgba(46,12,67,.85)';cx.fillStyle='#ffdf95';
  cx.strokeText('무쌍난무!',VW*.5,VH*.91);cx.fillText('무쌍난무!',VW*.5,VH*.91);
  cx.restore();
}
