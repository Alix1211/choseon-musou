"""제공받은 병사 PNG 시트를 무손실 WebP와 발 기준 메타데이터로 변환한다.
사용: python3 _new/build_soldier_walk.py /path/to/sheets
"""
import hashlib,json,statistics,sys
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]);out=root/'a/soldier_walk';out.mkdir(parents=True,exist_ok=True)
meta={}
for nation,set_id in [('wei','0'),('shu','1'),('wu','2')]:
    for kind,type_id in [('spearman','spear'),('archer','bow'),('cavalry','cav')]:
        name=f'{nation}_{kind}_walk_3dir_4f'
        p=source/(name+'.png');im=Image.open(p).convert('RGBA')
        assert im.size==(1448,1086),(name,im.size)
        target=out/(name+'.webp')
        im.save(target,format='WEBP',lossless=True,exact=True,method=6)
        assert Image.open(target).convert('RGBA').tobytes()==im.tobytes(),name
        rows=[]
        for row in range(3):
            bounds=[];feet=[]
            for col in range(4):
                a=im.crop((col*362,row*362,(col+1)*362,(row+1)*362)).getchannel('A')
                box=a.point(lambda v:255 if v>=64 else 0).getbbox();assert box
                bounds.append(box)
                # 발의 실제 픽셀 중심을 구해 4프레임 공통 기준점으로 쓴다.
                xs=[]
                for y in range(max(box[1],box[3]-18),box[3]):
                    xs.extend(x for x in range(box[0],box[2]) if a.getpixel((x,y))>=64)
                feet.append(statistics.median(xs))
            rows.append({'ax':round(statistics.median(feet),2),'ay':statistics.median(b[3] for b in bounds),
                         'h':statistics.median(b[3]-b[1] for b in bounds)})
        meta[set_id+':'+type_id]={'f':'a/soldier_walk/'+name+'.webp','rows':rows,
                                 'source_sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(out/'sheets.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('병사 이동 시트 9종 무손실 변환·원본 RGBA 일치 확인')
