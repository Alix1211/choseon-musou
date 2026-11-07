/* 전투 중 즉석 캔버스 생성 억제: 피격 흰색 실루엣을 여유 프레임에 사전 제작.
   한 프레임에서 최대 한 개만 준비하며 기존 모션/실루엣/피격 수치를 바꾸지 않는다. */
const CM_PREP={stage:null,scanned:0,tasks:[],queued:new Set(),built:0,maxBuildMs:0};
const CM_PERF={frames:0,slowFrames:0,maxFrameMs:0,preparedMasks:0,largestMaskMs:0};
if(typeof window!=='undefined')window.__choseonPerf=CM_PERF;

function cmQueueMask(key,run){
  if(white.has(key)||CM_PREP.queued.has(key))return;
  CM_PREP.queued.add(key);CM_PREP.tasks.push({key,run});
}
function cmQueueMobMasks(m){
  if(!m||m.magicUnit||m.final40Giant||m.finalNpc27||m.wuHidden)return;
  const sprites=A.mj&&A.mj.mobs&&A.mj.mobs[m.set]&&A.mj.mobs[m.set][m.type];
  if(!sprites||MT[m.type]?.still)return;
  for(const dir of ['front','side','back'])if(sprites[dir]){
    const key=m.set+m.type+dir;
    cmQueueMask(key,()=>whiteMob(m.set,m.type,dir));
  }
  const sk=m.set+':'+m.type;
  if(A.soldierWalk&&A.soldierWalk[sk]&&SOLDIER_WALK[sk]){
    for(const row of [0,2,1])for(const col of [1,0,2,3]){
      const key='sw:'+sk+':'+row+':'+col;
      cmQueueMask(key,()=>{
        const im=A.soldierWalk[sk],c=newCanvas(362,362),g=c.getContext('2d');
        g.drawImage(im,col*362,row*362,362,362,0,0,362,362);
        g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,362,362);
        whiteCachePut(key,c);
      });
    }
  }else if(A.walk&&A.walk[m.type]&&WALK[m.type]){
    for(const row of [0,2,1])for(const col of [1,0,2,3]){
      const key='w'+m.type+row+col;
      cmQueueMask(key,()=>whiteWalk(m.type,row,col));
    }
  }
}
function cmCollectReserved(){
  const waves=[];
  if(M.wei){
    if(M.wei.preparedWaves)waves.push(...M.wei.preparedWaves);
    if(M.wei.preparedReinforcement)waves.push(M.wei.preparedReinforcement);
  }
  if(M.defense05){
    if(M.defense05.preparedWaves)waves.push(...M.defense05.preparedWaves);
    if(M.defense05.preparedCounter)waves.push(M.defense05.preparedCounter);
  }
  return waves;
}
function cmPrepareFrame(frameCost){
  if(!M||!P||!M.musou||!A.mj)return;
  if(CM_PREP.stage!==M){
    CM_PREP.stage=M;CM_PREP.scanned=-1;CM_PREP.tasks.length=0;CM_PREP.queued.clear();
  }
  if(CM_PREP.scanned!==mobs.length){
    CM_PREP.scanned=mobs.length;
    for(const m of mobs)cmQueueMobMasks(m);
    for(const col of cmCollectReserved())if(col)for(const m of col.mobs)cmQueueMobMasks(m);
  }
  // 렌더 자체가 느릴 때는 사전 제작을 미룬다. 순간이동 입장 중에는 우선 준비.
  if(!CM_PREP.tasks.length||(P.mode!=='tele_in'&&frameCost>11))return;
  const task=CM_PREP.tasks.shift();CM_PREP.queued.delete(task.key);
  if(white.has(task.key))return;
  const start=performance.now();
  try{task.run();}catch(e){/* 특수 NPC 시트가 없는 경우 원래 렌더러의 대체 경로 사용 */return;}
  const ms=performance.now()-start;
  CM_PERF.preparedMasks++;CM_PERF.largestMaskMs=Math.max(CM_PERF.largestMaskMs,ms);
}
