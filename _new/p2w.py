# 병사 이동 이미지는 다른 담당 파일을 수정하지 않고 최종 빌드에 연결한다.
import json
soldier_meta=json.load(open(B+'a/soldier_walk/sheets.json',encoding='utf-8'))
rep('const A={};   // 불러온 그림','const A={};   // 불러온 그림\nconst SOLDIER_WALK='+json.dumps(soldier_meta,ensure_ascii=False,separators=(',',':'))+';\n'+rd('m3_walk.js'))
rep('  const jobs=[];',"  const jobs=[];A.soldierWalk={};\n  for(const key in SOLDIER_WALK)jobs.push(loadImg(SOLDIER_WALK[key].f).then(im=>A.soldierWalk[key]=im));")
rep('  const WK=A.walk&&A.walk[m.type]&&WALK[m.type];\n  if(WK){','  const WK=A.walk&&A.walk[m.type]&&WALK[m.type];\n  if(drawSoldierWalk(m,dir,r,alpha)){}else if(WK){')
rep('gimTick,gimTarget,gimText,killMob,blockedAt};','gimTick,gimTarget,gimText,killMob,blockedAt,soldierWalkFrame,drawMob,get art(){return A},get paint(){return cx}};')
