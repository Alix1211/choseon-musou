// Real game functions in Chromium: deterministic open-arena checks plus map smoke tests.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||chromium.executablePath(),headless:true,args:['--no-sandbox','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:8766/');
 await page.waitForFunction(()=>window.G,{timeout:60000});
 const result=await page.evaluate(()=>{
  Math.random=()=>.5;
  const g=G,checks=[];
  function check(ok,name){if(!ok)throw Error(name);checks.push(name);}
  const rect={k:'rect',x:100,y:100,a:0,L:230,w:88};
  check(g.enemyContains(rect,280,135),'thrust hits a sidestep inside its visible width + body');
  check(!g.enemyContains(rect,280,180),'thrust misses outside its width');
  check(!g.enemyContains(rect,70,100),'thrust does not hit behind its origin');
  check(g.enemyContains({...rect,a:Math.PI/2},100,250),'rect rotates in ground coordinates');
  check(g.enemyContains({k:'cone',x:0,y:0,a:0,R:185,ha:.9},140,40),'sweep has real width');
  function arena(stage,guest=false){
    g.S.lv=stage===1?1:16;g.S.hl.zhenji=16;g.S.roster=guest?['zhenji']:[];g.S.party=guest?['zhenji']:[];
    g.S.eq={weapon:{id:1,s:'weapon',w:guest?'fan':'sword',t:0,i:0,st:1,b:12,o:[]},ring:null,necklace:null,armor:null};g.S.enh={weapon:0,ring:0,necklace:0,armor:0};
    if(stage>=10){const sc=Math.pow(1.13,stage-1)*1.28;
      g.S.eq.weapon.b=12*sc;
      g.S.eq.necklace={id:2,s:'necklace',t:1,i:0,st:stage,b:130*sc,o:[]};
      g.S.eq.armor={id:3,s:'armor',t:1,i:0,st:stage,b:3.2*sc,o:[]};
    }
    g.startStage(stage,1);g.M.dlgQ=[];g.P.mode='manual';g.P.alpha=1;
    if(guest)check(g.switchPlayable('zhenji'),'Zhenji swap still works');
    g.UI.paused=true;g.M.wei=null;g.M.towers=null;g.M.gim=null;
    g.M.D.g=Array.from({length:g.M.H},()=>new Uint8Array(g.M.W).fill(1));g.M.flow=null;
    g.mobs.length=0;g.M.colonies=[];g.M.jarList=[];g.M.chests=[];g.pks.length=0;g.shots.length=0;g.zones.length=0;
    g.P.x=1000;g.P.y=1000;g.P.hp=g.stat.maxHp();g.P.atk=null;g.P.sk=null;g.P.skHit=null;g.P.kx=g.P.ky=0;
    for(const a of g.allies){a.x=1090;a.y=1060;}
    return g.stat.maxHp();
  }
  arena(1);g.allies.length=0;g.P.hp=g.stat.maxHp()*.5;const hp=g.P.hp;
  for(let i=0;i<120;i++)g.updatePlayer(1/60);
  check(Math.abs(g.P.hp-hp)<1e-6,'no passive combat heal without a regen item');
  const wallCol=20;g.M.D.g[wallCol][wallCol]=0;
  g.P.x=wallCol*48+80;g.P.y=wallCol*48+24;
  g.enemyHit({k:'rect',x:wallCol*48-70,y:g.P.y,a:0,L:230,w:88},50,0);
  check(Math.abs(g.P.hp-hp)<1e-6,'weapon attacks do not damage through a wall');
  arena(10,true);const col={woken:true,mobs:[],lead:null};
  const elite=g.createMob('spear','0',g.P.x-180,g.P.y,col,true);elite.seed=.123;g.mobs.push(elite);col.mobs.push(elite);
  g.enemyStart(elite,g.ENEMY_PROFILES.spear,g.P);elite.intent.left=.25;
  check(g.enemyArmored(elite),'elite windup has armor after anticipation');
  g.hitMob(elite,1,'sword',120,0);
  check(elite.stun===0&&Math.abs(elite.kx-18)<.01,'armor resists normal flinch/knockback, not damage');
  elite.stun=1;g.updateMob(elite,.05);check(!elite.intent,'strong crowd control cancels elite attack');
  arena(10,true);
  const rider=g.createMob('cav','0',g.P.x-300,g.P.y+30,col,true);
  rider.charge={a:0,left:345,hit:new Set(),speed:560};
  check(g.enemyArmored(rider),'charging cavalry keeps its armor');
  const hits=g.ENEMY_PRESSURE.hits;
  for(let i=0;i<20&&rider.charge;i++)g.enemyChargeTick(rider,.05);
  check(g.ENEMY_PRESSURE.hits===hits+1,'cavalry uses a wide swept path and hits once per charge');
  arena(10,true);
  const caster=g.createMob('magic','0',g.P.x+400,g.P.y,col,false);caster.cd=0;caster.seed=.123;g.mobs.push(caster);
  g.updateMob(caster,.01);g.updateMob(caster,.8);
  check(g.shots.length===3&&g.zones.some(z=>z.pressureOwner===caster),'mage combines spread projectiles with a delayed ground warning');
  caster.dead=true;g.updateZones(1);check(!g.zones.some(z=>z.pressureOwner===caster),'defeating the caster cancels its pending ground attack');
  arena(10);const boss=g.createMob('golem','b',g.P.x-500,g.P.y,col,false),oldX=boss.x;
  g.updateMob(boss,1);check(boss.x-oldX>140,'boss closes distance instead of crawling');
  function simulate(stage,guest,attack,dodge=false){
    const max=arena(stage,guest),col={woken:true,mobs:[],lead:null};
    g.UI.paused=false;
    for(const [type,x,y,elite] of [['spear',-250,30,true],['bow',470,-60,false],['cav',300,170,true]]){
      const m=g.createMob(type,'0',g.P.x+x,g.P.y+y,col,stage>1&&elite);m.seed=.123;m.cd=.2;g.mobs.push(m);col.mobs.push(m);
    }
    let first=-1,min=g.P.hp;const start=g.ENEMY_PRESSURE.started;
    for(let i=0;i<600&&g.P.hp>0;i++){
      for(const key of ['up','down','left','right'])g.keys[key]=0;
      if(dodge)g.keys[['right','down','left','up'][Math.floor(i/90)%4]]=1;
      if(attack&&i%34===0)g.comboPress('light');
      g.updatePlayer(1/60);
      for(const m of g.mobs.slice())g.updateMob(m,1/60);
      g.updateShots(1/60);g.updateZones(1/60);g.updateAllies(1/60);
      if(g.P.hp<max&&first<0)first=i/60;min=Math.min(min,g.P.hp);
    }
    g.UI.paused=true;
    for(const key of ['up','down','left','right'])g.keys[key]=0;
    return {stage,guest,attack,dodge,firstHit:first,loss:1-min/max,attacks:g.ENEMY_PRESSURE.started-start};
  }
  const early=simulate(1,false,false),late=simulate(10,true,false),fighting=simulate(10,true,true),dodging=simulate(10,true,false,true);
  check(early.firstHit>0&&early.firstHit<3,'early enemies land attacks with readable warning');
  check(early.loss>.1,'level-1 standing in a regular enemy group is unsafe');
  check(late.loss>.25,'level-16 Zhenji takes significant damage in stage10 with companion present');
  check(fighting.attacks>0&&fighting.loss>.05,'normal light-attack spam does not suppress every enemy');
  check(dodging.loss<late.loss*.7,'movement avoids a substantial share of telegraphed attacks');
  check(g.PLAY.active==='zhenji','active hero remains Zhenji');
  // Pause: live requestAnimationFrame must not advance enemy warnings.
  const m=g.mobs.find(m=>!m.dead);if(m){m.stun=0;m.cd=0;g.enemyStart(m,g.ENEMY_PROFILES[m.type],g.P);}
  g.refreshUI();return {checks,early,late,fighting,dodging};
 });
 console.log(JSON.stringify(result,null,2));
 await page.evaluate(()=>{
   const g=G;g.startStage(1,1);g.M.dlgQ=[];g.P.mode='manual';g.P.alpha=1;g.UI.paused=true;
   const col={woken:true,mobs:[]},m=g.createMob('spear','0',g.P.x-90,g.P.y,col,true);
   g.mobs.push(m);col.mobs.push(m);g.enemyStart(m,g.ENEMY_PROFILES.spear,g.P);g.refreshUI();render();
 });
 const frozen=await page.evaluate(()=>G.mobs.find(m=>m.intent)?.intent.left);
 assert.equal(typeof frozen,'number','a real warning must be present for the pause check');
 await page.waitForTimeout(220);
 assert.equal(await page.evaluate(()=>G.mobs.find(m=>m.intent)?.intent.left),frozen,'pause must freeze enemy telegraphs');
 await page.screenshot({path:process.env.ENEMY_SCREENSHOT||'/tmp/enemy-pressure.png'});
 assert.equal(errors.length,0,errors.join('\n'));
 await browser.close();
 console.log('PASS enemy pressure and playable regression; this is a controlled combat test, not a full campaign difficulty verdict.');
})().catch(e=>{console.error(e);process.exit(1)});
