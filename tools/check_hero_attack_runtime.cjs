'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const ids=['zhenji','wenji','wangyi','daqiao','shangxiang','yinping','yueying'];
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:844,height:390}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8768/index.html');
    await page.waitForFunction(()=>window.G&&G.UI.mode==='title',null,{timeout:60000});
    const results=await page.evaluate(ids=>{
      G.S.cheat=1;G.startStage(1,1);
      G.UI.mode='battle';G.UI.paused=true;
      const got=[];
      const original=cx.drawImage;
      cx.drawImage=function(...args){
        if(args[0]&&args[0].src&&args[0].src.includes('/hero_attack/')){
          got.push({src:args[0].src.split('/').pop(),sx:args[1],sy:args[2],sw:args[3],sh:args[4]});
        }
        return original.apply(this,args);
      };
      for(const id of ids){
        const im=A.heroAttack[id];
        if(!im||im.width!==1452||im.height!==1086)throw Error(id+' asset unavailable');
        PLAY.active=id;
        const weapon=PLAYABLE_HEROES[id].weapon;
        G.P.atk=weapon;G.P.alpha=1;
        for(const [face,row] of [['right',0],['down',1],['up',2],['left',0]]){
          G.P.face=face;G.P.atkT=A.man[weapon][dirKey(face)[0]].frames*.5;
          drawPlayer();
          const last=got[got.length-1];
          if(!last||last.src!==id+'.webp'||last.sy!==row*362||last.sx!==484)
            throw Error(id+' '+face+' wrong animation '+JSON.stringify(last));
        }
      }
      return got;
    },ids);
    assert.equal(results.length,ids.length*4);
    assert.deepEqual(errors,[]);
    console.log('PASS seven loaded character-specific attacks, side/front/back/left; '+results.length+' live Canvas draws');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
