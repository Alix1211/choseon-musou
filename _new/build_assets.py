# 타일/소품/음식 시트 확장 (골든퀘스트 에셋에서 가져옴) — 항상 .v1.bak 원본에서 다시 만든다
from PIL import Image
import json,os,glob
B='/tmp/claude-0/-home-claude/8bc8db31-bb26-5aa2-b174-fd8760db3831/scratchpad/musou/a/'
R='/home/claude/alix1211/arpg/assets/'
# ── 타일 ──
tj=json.load(open(B+'tiles.v1.json.bak'));T=tj['T'];cols=tj['cols']
base=Image.open(B+'tiles.v1.webp.bak').convert('RGBA')
new=[]
def tile(name,path,flipx=False):
    im=Image.open(path).convert('RGBA')
    if flipx:im=im.transpose(Image.FLIP_LEFT_RIGHT)
    new.append((name,im.resize((T,T),Image.LANCZOS)))
for pre,d in (('d','dungeon'),('c','dungeon_cave')):
    for n in ('door_closed','door_open','stairs_down','stairs_up','lava'):
        tile(f'{pre}_{n}',R+f'{d}/tiles/{n}.png')
tile('d_water',R+'dungeon/tiles/water.png')
I=R+'interior/'
for n,f in (('i_wood1','01'),('i_wood2','02'),('i_wood3','03'),('i_wood4','04'),('i_stone1','05'),('i_stone2','06'),('i_check','07'),('i_carpet_r','08'),('i_carpet_b','09'),('i_carpet_g','10'),
            ('i_wall_cream','11'),('i_wall_paper','12'),('i_wall_red','13'),('i_wall_green','14'),('i_wall_blue','15'),('i_wall_win','16'),('i_wall_win2','17'),('i_wall_brick','19'),('i_wall_plank','20')):
    tile(n,I+f'int_{f}.png')
ceil=Image.new('RGBA',(T,T),(34,26,26,255))   # 천장(벽 위쪽)은 짙은 갈색
new.append(('i_ceil',ceil))
total=len(tj['idx'])+len(new)
rows=(max(max(tj['idx'].values())+1+len(new),total)+cols-1)//cols
atl=Image.new('RGBA',(cols*T,rows*T),(0,0,0,0));atl.paste(base,(0,0))
nxt=max(tj['idx'].values())+1
for name,im in new:
    tj['idx'][name]=nxt;atl.paste(im,((nxt%cols)*T,(nxt//cols)*T));nxt+=1
atl.save(B+'tiles.webp',quality=92,method=6);json.dump(tj,open(B+'tiles.json','w'))
print('tiles',atl.size,len(tj['idx']))
# ── 소품 ──
pj=json.load(open(B+'props.v1.json.bak'));pb=Image.open(B+'props.v1.webp.bak').convert('RGBA')
items=[]
def prop(name,path,sc=.625):
    im=Image.open(path).convert('RGBA');bb=im.getbbox();im=im.crop(bb);items.append((name,im,sc))
prop('d_chest_open',R+'dungeon/props/chest_open.png',.234);prop('c_chest_open',R+'dungeon_cave/props/chest_open.png',.234*1.4)
prop('d_gate',R+'dungeon/props/gate.png',.5)
IN={'21':'desk','22':'table_run','23':'table_round','24':'table_feast','25':'counter','26':'bar','27':'display','28':'chair','29':'throne','30':'stool','31':'bench','32':'bed_g','33':'bed_r','34':'bed_b','35':'nightstand','36':'cabinet','37':'dresser','38':'wardrobe','39':'crates','40':'barrels','41':'shelf_potion','42':'weaponrack','43':'armor','44_bookshelf':'bookshelf','44b_chandelier':'chandelier','45':'lantern','46':'lamp','47':'candelabra','48':'wallcandle','49':'fireplace','50':'stove','51':'board','52':'plant','53_mapboard':'mapboard','53b_vase':'vase','53c_books':'books','54':'plant2'}
for k,n in IN.items():
    prop('i_'+n,I+f'int_{k}.png',.5)
x=y=0;rowh=0;W=pb.width;y0=pb.height
placed=[]
for name,im,sc in items:
    w,h=im.size
    if x+w>W:x=0;y+=rowh+2;rowh=0
    placed.append((name,im,x,y,sc));x+=w+2;rowh=max(rowh,h)
Hn=y0+y+rowh+2
pa=Image.new('RGBA',(W,Hn),(0,0,0,0));pa.paste(pb,(0,0))
for name,im,x,y,sc in placed:
    pa.paste(im,(x,y0+y));w,h=im.size
    pj[name]={'x':x,'y':y0+y,'w':w,'h':h,'gw':round(w*sc,1),'gh':round(h*sc,1)}
pa.save(B+'props.webp',quality=92,method=6);json.dump(pj,open(B+'props.json','w'))
print('props',pa.size,len(pj))
# ── 음식 ──
F=[('manto','01'),('mantobox','06'),('chicken','26'),('jerky','25'),('pear','10'),('cheese','24'),('wine','16')]
S=96;fa=Image.new('RGBA',(S*len(F),S),(0,0,0,0));fj={'S':S,'pos':{}}
for i,(n,f) in enumerate(F):
    im=Image.open(R+f'food/food_{f}.png').convert('RGBA');bb=im.getbbox();im=im.crop(bb);s=min((S-6)/im.width,(S-6)/im.height);im=im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.LANCZOS)
    fa.paste(im,(i*S+(S-im.width)//2,(S-im.height)//2),im);fj['pos'][n]=i*S
fa.save(B+'food.webp',quality=92,method=6);json.dump(fj,open(B+'food.json','w'))
print('food',fa.size)
