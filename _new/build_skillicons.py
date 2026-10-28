# 스킬 아이콘 시트(_new/skill_sheet.png) → a/ui/sk/*.webp 13장으로 자른다
from PIL import Image
import numpy as np, os
from scipy import ndimage as ndi
B=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
im=Image.open(B+'_new/skill_sheet.png').convert('RGBA')
a=np.array(im);a[...,3]=np.where(a[...,3]<10,0,a[...,3]);im=Image.fromarray(a)
lab,n=ndi.label(a[...,3]>40);objs=ndi.find_objects(lab);boxes=[]
for i,s in enumerate(objs):
    if (lab[s]==i+1).sum()>5000:boxes.append((s[0].start,s[1].start,s[0].stop,s[1].stop))
boxes.sort(key=lambda r:(round(r[0]/100),r[1]));assert len(boxes)==13
names=['cmd','atk_sword','atk_whip','atk_fan','fan1','fan2','fan_spin','whip1','whip2','whip_spin','sword1','sword2','sword_spin']
os.makedirs(B+'a/ui/sk',exist_ok=True);S=192
for nm,(y0,x0,y1,x1) in zip(names,boxes):
    c=im.crop((x0,y0,x1,y1));side=max(c.size);sq=Image.new('RGBA',(side,side),(0,0,0,0));sq.paste(c,((side-c.width)//2,(side-c.height)//2))
    sq=sq.resize((S,S),Image.LANCZOS);sq.save(B+'a/ui/sk/'+nm+'.webp',quality=92,method=6)
print('ok',len(boxes))
