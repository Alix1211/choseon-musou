const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();
  try{
    const p=await b.newPage({viewport:{width:1200,height:900}}),errors=[];
    p.on('pageerror',e=>errors.push(e.message));
    await p.goto('http://localhost:8766/index.html');
    await p.waitForFunction(()=>window.G&&G.UI.mode==='title',null,{timeout:60000});
    await p.evaluate(()=>{G.S.cheat=1;G.startStage(1,1);G.UI.paused=true;});
    const result=await p.evaluate(()=>{
      const c=G.paint,A=G.art,base=G.mobs.find(m=>!m.boss&&!m.static),out=[];
      const realDraw=c.drawImage,realScale=c.scale;let draws=[],scales=[];
      c.drawImage=function(...a){draws.push(a);return realDraw.apply(this,a);};
      c.scale=function(...a){scales.push(a);return realScale.apply(this,a);};
      try{
        for(const set of ['0','1','2'])for(const type of ['spear','bow','cav']){
          const key=set+':'+type,im=A.soldierWalk[key];
          if(!im||im.width!==1448||im.height!==1086)throw Error('시트 불러오기 실패: '+key);
          const m={...base,set,type,hero:false,boss:false,ally:false,beacon:false,commander:false,leader:false,elite:false,dead:false,down:false,wind:0,lunge:0,stun:0,hurt:0,moving:true,au:0,x:200,y:300,scale:1,hp:100,maxHp:100};
          for(const [face,dir,row] of [['down','front',0],['right','side',1],['left','side',1],['up','back',2]]){
            const cols=new Set();m.face=face;
            for(let i=0;i<4;i++){
              m.seed=i/6;const f=G.soldierWalkFrame(m,dir);cols.add(f.col);
              draws=[];scales=[];G.drawMob(m);
              const d=draws.find(a=>a[0]===im);
              if(!d||d[1]!==f.col*362||d[2]!==row*362||d[3]!==362||d[4]!==362)throw Error('방향/프레임 불일치: '+key+face);
              if(draws.some(a=>a[0]===A.mobs))throw Error('이동 중 공격 이미지 중복: '+key);
              if((face==='left')!==scales.some(a=>a[0]<0))throw Error('좌우 반전 오류');
            }
            if(cols.size!==4)throw Error('4프레임 재생 오류');
          }
          for(const state of [{moving:false},{wind:.1},{lunge:.8},{stun:.3},{dead:true,deadT:.1},{down:true}]){
            const q={...m,...state};draws=[];G.drawMob(q);
            if(draws.some(a=>a[0]===im)||!draws.some(a=>a[0]===A.mobs))throw Error('정지/공격 원본 복귀 오류: '+key);
          }
          m.hurt=.1;draws=[];G.drawMob(m);
          if(draws.length<2)throw Error('이동 피격 표시 누락');
          out.push(key);
        }
        if(G.soldierWalkFrame({...base,set:'y',type:'fox',moving:true},'front'))throw Error('요괴 이미지 변경');
      }finally{c.drawImage=realDraw;c.scale=realScale;}
      // 실제 게임 렌더러로 각 나라·병종을 그려 화면 크기와 발 기준을 확인.
      c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='#e9e3da';c.fillRect(0,0,1200,900);
      for(let n=0;n<3;n++)for(let k=0;k<3;k++){
        const x=200+k*400,y=130+n*285,type=['spear','bow','cav'][k],set=String(n);
        c.fillStyle='#25202c';c.font='20px sans-serif';c.textAlign='center';c.fillText(['위','촉','오'][n]+' · '+['창병','궁병','기마병'][k],x,y-85);
        for(let d=0;d<3;d++){
          const m={...base,set,type,face:['down','right','up'][d],x:x+(d-1)*112,y:y+110,scale:1,hero:false,boss:false,ally:false,commander:false,leader:false,elite:false,dead:false,down:false,moving:true,wind:0,lunge:0,stun:0,hurt:0,au:0,hp:100,maxHp:100};
          c.strokeStyle='#b1a9a0';c.beginPath();c.moveTo(m.x-45,m.y);c.lineTo(m.x+45,m.y);c.stroke();G.drawMob(m);
        }
      }
      c.restore();return {keys:out,image:document.getElementById('c').toDataURL('image/png')};
    });
    fs.writeFileSync('/tmp/soldier_walk_applied.png',Buffer.from(result.image.split(',')[1],'base64'));
    assert.equal(result.keys.length,9);assert.deepEqual(errors,[]);
    console.log('9종·4방향·4프레임 / 정지·공격 복귀 / 피격 / 국가 구분 통과');
  }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
