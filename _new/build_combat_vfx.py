"""Prepare the six approved generated effect sheets; preserve alpha and feather cell edges."""
from pathlib import Path
import sys
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT.parent.parent/'abc7a3bd5432/generated_images'
SHEETS={'melee':('exec-8397f652-f648-4b6f-bba6-1414a47200dc.png',3,4),'magic':('exec-a4faaab6-d065-4aa4-8962-05ac0a5d3635.png',3,4),'impact':('exec-aea3f7ee-8d43-4ae9-bc4a-6969a9dc0b7c.png',3,4),'ground':('exec-c86264fc-fd32-43c7-8ac2-7ccf37649c60.png',4,3),'motion':('exec-bba09577-0c86-4b4e-972c-d09aecf99580.png',4,3),'burst':('exec-0f5de1c2-6a87-42ee-a9ac-7595e87517a0.png',4,3)}
for key,(filename,cols,rows) in SHEETS.items():
 im=Image.open(source/filename).convert('RGBA');w,h=im.size
 out=Image.new('RGBA',(cols*256,rows*192))
 for row in range(rows):
  for col in range(cols):
   cell=im.crop((round(col*w/cols),round(row*h/rows),round((col+1)*w/cols),round((row+1)*h/rows))).resize((256,192),Image.Resampling.LANCZOS)
   a=np.array(cell).copy();yy,xx=np.mgrid[:192,:256]
   edge=np.minimum.reduce([xx/22,(255-xx)/22,yy/18,(191-yy)/18]).clip(0,1);edge=edge*edge*(3-2*edge)
   alpha=a[:,:,3].astype(float)/255
   # Suppress diffuse low-alpha haze while preserving white energy cores.
   a[:,:,3]=np.round(255*alpha**1.25*edge).astype('uint8');a[a[:,:,3]==0,:3]=0
   out.paste(Image.fromarray(a),(col*256,row*192))
 dest=ROOT/'a/combat_vfx'/f'{key}.webp';out.save(dest,quality=85,method=6)
 print(key,dest.stat().st_size)
