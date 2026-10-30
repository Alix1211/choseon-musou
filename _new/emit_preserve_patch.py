from pathlib import Path
import re, difflib, base64, hashlib

before=Path('/tmp/choseon-range-review/index_before.html').read_text()
regen=Path('index.html').read_text()
result=before

def one(old,new,label):
    global result
    if result.count(old)!=1: raise RuntimeError(label+': count '+str(result.count(old)))
    result=result.replace(old,new)

def copied(start,end,label):
    global result
    pattern=re.compile(re.escape(start)+r'.*?(?='+re.escape(end)+')',re.S)
    old=pattern.findall(result); new=pattern.findall(regen)
    if len(old)!=1 or len(new)!=1:raise RuntimeError(label+' source fragments not unique')
    one(old[0],new[0],label)

one('const REACH={sword:146,whip:205,fan:600};','const REACH={sword:146,whip:170,fan:600};','reach')
copied("  }else if(w==='whip'){","  }else if(w==='fan'){",'basic')
one("const reachW=w=>w==='whip'?REACH.whip*ST.rng:REACH[w];","const reachW=w=>REACH[w];",'auto')
changes=[
('Math.hypot(m.x-P.x,m.y-P.y)<420&&hasLOS(P.x,P.y,m.x,m.y)','Math.hypot(m.x-P.x,m.y-P.y)<=REACH.whip&&hasLOS(P.x,P.y,m.x,m.y)'),
("fx.push({k:'whip',x:px,y:py,a:ang(m),t:0,life:.3,L:Math.hypot(m.x-P.x,(m.y-30)-py)+30});","fx.push({k:'whip',x:px,y:py,a:Math.atan2(m.y-P.y,m.x-P.x),t:0,life:.3,L:REACH.whip});"),
('if(rdy(0)&&cnt(380)>=3&&n.d>130)return 0;','if(rdy(0)&&cnt(REACH.whip)>=3&&n.d>90&&n.d<=REACH.whip)return 0;'),
('if(rdy(1)&&n.los&&n.d<=330)return 1;','if(rdy(1)&&n.los&&n.d<=REACH.whip)return 1;'),
("const radius=move==='spin'?285:move==='rocks'?340:move==='slam'?218:move==='dashHeavy'?160:move==='dashLight'?165:w==='whip'?258:w==='fan'?440:240;","const radius=w==='whip'?REACH.whip:move==='spin'?285:move==='rocks'?340:move==='slam'?218:move==='dashHeavy'?160:move==='dashLight'?165:w==='fan'?440:240;"),
("if(w==='whip')fx.push({k:'whipSweep',x:px,y:py-CH*.3,t:0,life:.30,R:radius,a,radial,ha:move==='arc'?1.18:.78});","if(w==='whip')fx.push({k:'whipSweep',x:px,y:py,t:0,life:.30,R:radius,a,radial,ha:move==='arc'?1.18:.78});"),
("const fits=radial?d<radius+m.scale*12:move==='arc'?d<radius+m.scale*12&&delta<1.20:move==='dashLight'?d<radius+m.scale*12&&delta<.95:dot>0&&d<radius+m.scale*12&&delta<.58;","const within=d<=(w==='whip'?radius:radius+m.scale*12);\n    const fits=radial?within:move==='arc'?within&&delta<1.20:move==='dashLight'?within&&delta<.95:dot>0&&within&&delta<.58;"),
("if(P.cbRushHit.has(m)||Math.hypot(m.x-P.x,m.y-P.y)>100+m.scale*15)continue;","if(P.cbRushHit.has(m)||Math.hypot(m.x-P.x,m.y-P.y)>(P.cbWeapon==='whip'?Math.min(REACH.whip,100+m.scale*15):100+m.scale*15))continue;")]
for old,new in changes:one(old,new,old[:32])
line='cx.arc(f.x,f.y,f.R*.83,a0,a1)'
if result.count(line)!=2:raise RuntimeError('combo visual arcs not 2')
result=result.replace(line,'cx.arc(f.x,f.y,Math.max(0,f.R-5),a0,a1)')
copied("    }else if(f.k==='whip'){","    }else if(f.k==='ring'){",'visual')
patch=''.join(difflib.unified_diff(regen.splitlines(keepends=True),result.splitlines(keepends=True),
  fromfile='a/index.html',tofile='b/index.html',n=3))
output=Path('/tmp/choseon-range-review/approved_runtime_overrides.patch')
output.write_text(patch)
Path('index.html').write_text(result)
raw=result.encode()
blobhash=hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest()
print('APPROVED_RUNTIME_PATCH_B64_START')
print(base64.b64encode(patch.encode()).decode())
print('APPROVED_RUNTIME_PATCH_B64_END')
print('APPROVED_RUNTIME_TARGET_SHA:'+blobhash)
print('APPROVED_RUNTIME_PATCH_BYTES:'+str(len(patch.encode())))
